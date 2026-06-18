# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository

OpenCode is an AI-powered coding agent shipped as a CLI/TUI, headless API server, web UI, and Electron desktop app. The repo is a Bun + Turbo monorepo (`packageManager: bun@1.3.14`, requires Bun 1.3+). Default branch is `dev`; local `main` may not exist — use `dev` / `origin/dev` for diffs.

`AGENTS.md` (root and per-package) is the authoritative style guide and must be read before non-trivial edits. Key per-package guides: `packages/opencode/AGENTS.md` (Effect rules, ESM module shape, dev/tmux loop), `packages/app/AGENTS.md`, `packages/desktop/AGENTS.md`, `packages/tui/...`, and `CONTEXT.md` plus `specs/` for V2 session/runtime architecture vocabulary.

## Common commands

Run from the **repo root** unless noted:

```bash
bun install                                  # install all workspaces (postinstall: fix-node-pty in core)
bun dev                                      # run opencode TUI against packages/opencode
bun dev <directory>                          # run opencode TUI against another directory
bun dev .                                    # run opencode against this repo
bun dev serve [--port 4096]                  # start headless API server
bun dev web                                  # start server + open web interface
bun dev:web                                  # vite dev for packages/app (requires server running)
bun dev:desktop                              # Electron dev for packages/desktop
bun dev:console                              # SST console app
bun dev:storybook                            # SolidJS storybook
bun lint                                     # oxlint across the workspace
bun typecheck                                # turbo run typecheck (uses tsgo per package)
./script/generate.ts                         # regenerate SDK + related files after API/SDK changes
./packages/sdk/js/script/build.ts            # rebuild the JS SDK
./packages/opencode/script/build.ts --single # build a standalone "localcode" binary
```

`bun dev` is the development equivalent of the released `opencode` CLI; both share the same entrypoint (`packages/opencode/src/index.ts` via `--conditions=browser`).

## Tests

Tests **cannot run from the repo root** — `bun test` at root intentionally exits with `do not run tests from root`, and `bunfig.toml` sets `[test].root = "./do-not-run-tests-from-root"` as a guard. Run tests from the owning package:

```bash
cd packages/opencode && bun test --timeout 30000 --only-failures
cd packages/opencode && bun test test/session/foo.test.ts        # single file
cd packages/opencode && bun test -t 'matches title pattern'      # filter by name
cd packages/tui      && bun test
cd packages/app      && bun test                                 # see packages/app for happydom + e2e setup
bun run --cwd packages/opencode test:httpapi                     # HTTP API coverage / auth / effect modes
```

Type-check a single package with `cd packages/<pkg> && bun run typecheck` (which invokes `tsgo --noEmit`). Do **not** invoke `tsc` directly — use `bun typecheck` / `bun run typecheck`.

Testing rules (from `AGENTS.md`): avoid mocks; test real implementations; never duplicate logic into tests.

### Running the live TUI without blocking

`bun dev` from `packages/opencode` is interactive. When you need to inspect output programmatically, run it under tmux per `packages/opencode/AGENTS.md`:

```bash
tmux new-session -d -s opencode-dev 'bun dev'
tmux capture-pane -pt opencode-dev
tmux kill-session -t opencode-dev
```

## Architecture

### Workspace layout

```
packages/
  opencode/        CLI entrypoint, command dispatch, dev server orchestration. Reexports from core/server/tui.
  core/            Business logic, Drizzle schema (src/**/*.sql.ts), Effect services, migrations, providers.
  server/          Hono HTTP API (handlers, routes, middleware, auth, cors). Generated SDK is driven from here.
  tui/             SolidJS + opentui terminal UI; consumed by the opencode CLI's `tui` subcommand.
  app/             SolidJS web UI (Vite + Tailwind). Used standalone (`dev:web`) and embedded by desktop.
  desktop/         Electron wrapper around `packages/app`, built with electron-vite + electron-builder.
  sdk/js/          Generated TypeScript SDK from the server's OpenAPI spec (sdk/openapi.json).
  plugin/          @opencode-ai/plugin source — public plugin SDK.
  llm/             LLM provider integration shared by core/opencode.
  ui/              Shared SolidJS UI primitives.
  console/, stats/ SST-deployed apps (web console, telemetry); see `dev:console` / `dev:stats`.
  storybook/       Component playground.
  http-recorder/, identity/, function/, containers/, slack/, enterprise/, script/  supporting libs.
sdks/vscode/       VS Code extension.
script/            Repo-level scripts (generate.ts, release/, publish.ts, version.ts, hooks/).
specs/             V2 session, storage, project, and tui-package design specs.
infra/, sst.config.ts   SST infrastructure.
```

### Opencode package internal layout (`packages/opencode/src`)

Domain-organised, not type-organised. Notable areas: `cli/` (command dispatch and bootstrap, `cmd/`, `effect-cmd.ts`), `session/` (V2 session core: `session.ts`, `processor.ts`, `prompt/`, `llm/`, `compaction.ts`, `run-state.ts`, `system.ts`, `tools.ts`), `provider/`, `tool/`, `mcp/`, `lsp/`, `permission/`, `agent/`, `acp/`, `bus/`, `event-v2-bridge.ts`, `storage/` (Bun + Node DB drivers selected via `imports["#db"]`), `share/`, `sync/`, `worktree/`, `skill/`, `snapshot/`. The TUI lives at `src/cli/tui/` (SolidJS + opentui).

### V2 Session core (load `CONTEXT.md` + `specs/v2/` before edits here)

Hard invariants enforced across `packages/opencode/src/session` and `packages/core`:

- Durable prompt admission is separate from model execution. `SessionV2.prompt(...)` admits one durable `session_input` row and schedules an advisory `SessionExecution.wake(sessionID)` unless `resume: false` requests admit-only behavior. The serialized runner promotes admitted inputs into visible user messages at safe boundaries.
- Reusing a Session ID adopts the existing Session. Reusing a prompt message ID reconciles an exact retry only when Session, prompt, and delivery mode match; conflicting reuse fails. Historical projected prompts lazily synthesize promoted inbox records during exact retry.
- `SessionExecution` is process-global and Session-ID based; the local implementation owns the process-local Session coordinator and discovers placement through `SessionStore` plus `LocationServiceMap.get(session.location)` only when a drain starts. No layer should take a Session ID. V2 interruption targets the active process-local ownership chain; idle / missing interruption is a no-op.
- `SessionRunner`, model resolution, tool registry, permissions, and filesystem are Location-scoped. Omitted `Location.workspaceID` means implicit-local placement.
- Preserve one explicit `llm.stream(request)` call per provider turn and reload projected history before durable continuation. Do not bridge through legacy `SessionPrompt.loop(...)` or delegate orchestration to an in-memory tool loop.
- Local Session drains stay process-local until clustering exists. `SessionRunCoordinator` joins explicit same-Session resumes, coalesces prompt wakeups, and lets different Sessions run concurrently. Advisory wakes drain durable inbox rows only.
- Delivery vocabulary: prompts steer by default and coalesce into the active activity at the next safe provider-turn boundary. Explicit `queue` inputs open FIFO future activities one at a time after the active activity settles.
- EventV2 replay owner claims are separate from clustered Session execution ownership.
- The System Context algebra, registry, and built-ins live in `packages/opencode/src/system-context` (and core peers); Context Source producers stay with their observed domains; Session History selection plus Context Epoch persistence are Session-owned.

### Persistence and module conventions

- Drizzle schemas live in `packages/core/src/**/*.sql.ts`. Migrations live in `packages/core` and are applied by core. Use snake_case field names so the column name does not have to be redeclared as a string.
- The `#db` import alias resolves to `src/storage/db.bun.ts` (default) or `db.node.ts` (Node condition) — keep both implementations in sync when changing the storage shape.
- Module shape (per `packages/opencode/AGENTS.md`): do **not** use `export namespace Foo { ... }`. Use flat top-level exports plus `export * as Foo from "./foo"` at the bottom of the file. For `foo/index.ts`, use `export * as Foo from "."`. Multi-sibling directories (`src/session/`, `src/config/`) avoid barrel `index.ts` — consumers import siblings directly to preserve tree-shaking.
- Effect: use `Effect.gen(function* () { ... })` for composition; do **not** return `Effect` from helpers unless they actually perform effectful work; prefer `Schema.UnknownFromJsonString` + `Schema.decodeUnknownOption` over manual `JSON.parse` + `Effect.try`. Full Effect rules: `specs/effect/migration.md`.
- After changing API or SDK surface (e.g. `packages/opencode/src/server/server.ts`), run `./script/generate.ts` to regenerate the SDK and related files.

### Style guide highlights (from root `AGENTS.md`)

- Use Bun APIs (`Bun.file()`, etc.) over Node equivalents where possible.
- Never alias imports (`import { foo as bar }`) and never use star imports (`import * as Foo`); import the module's own exported namespace by name (`import { Project } from "@opencode-ai/core/project"`).
- Prefer dynamic imports for heavy modules in startup-sensitive entrypoints; destructure dynamic-import bindings near the top of the narrowest scope, not inline `await import().then(...)` chains.
- Lean on type inference; avoid explicit annotations / interfaces unless required by exports. Avoid `try`/`catch`, `else`, unnecessary destructuring, and the `any` type. Prefer functional array methods with type guards on `filter` over `for` loops.
- Inline single-use locals; do not extract single-use helpers. When extracting, helpers stay close to the code they support, below the main export.
- In `src/config`, follow the existing self-export pattern (`export * as ConfigAgent from "./agent"`) when adding modules.

## Branch, commit, and PR conventions

- Branch names: ≤3 words, hyphen-separated, no slashes or `feat/` / `fix/` prefixes (e.g. `session-recovery`, `regenerate-sdk`).
- Commits and PR titles use Conventional Commits: `type(scope): summary`. Valid types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`. Scope is optional; use the affected package or area (`core`, `opencode`, `tui`, `app`, `desktop`, `sdk`, `plugin`).
- Every PR must reference an existing issue (`Fixes #123` / `Closes #123`).
