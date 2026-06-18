import { Component, For, Show, createSignal } from "solid-js"
import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { IconButtonV2 } from "@opencode-ai/ui/v2/icon-button-v2"
import { Icon } from "@opencode-ai/ui/v2/icon"
import { Tag } from "@opencode-ai/ui/v2/badge-v2"
import { KeybindV2 } from "@opencode-ai/ui/v2/keybind-v2"
import { TextInputV2 } from "@opencode-ai/ui/v2/text-input-v2"
import { TextareaV2 } from "@opencode-ai/ui/v2/textarea-v2"
import { InlineInputV2 } from "@opencode-ai/ui/v2/inline-input-v2"
import { CheckboxV2 } from "@opencode-ai/ui/v2/checkbox-v2"
import { RadioGroupV2, RadioItemV2 } from "@opencode-ai/ui/v2/radio-v2"
import { Switch } from "@opencode-ai/ui/v2/switch-v2"
import { SelectV2 } from "@opencode-ai/ui/v2/select-v2"
import { FieldV2 } from "@opencode-ai/ui/v2/field-v2"
import { SegmentedControlV2, SegmentedControlItemV2 } from "@opencode-ai/ui/v2/segmented-control-v2"
import { Avatar } from "@opencode-ai/ui/v2/avatar-v2"
import { ProjectAvatar, PROJECT_AVATAR_VARIANTS } from "@opencode-ai/ui/v2/project-avatar-v2"
import { TabsV2 } from "@opencode-ai/ui/v2/tabs-v2"
import { AccordionV2 } from "@opencode-ai/ui/v2/accordion-v2"
import { TooltipV2 } from "@opencode-ai/ui/v2/tooltip-v2"
import { TextShimmerV2 } from "@opencode-ai/ui/v2/text-shimmer-v2"
import { DiffChanges } from "@opencode-ai/ui/v2/diff-changes-v2"
import { Markdown } from "@opencode-ai/ui/markdown"
import { BasicToolV2, type BasicToolV2TriggerTitle } from "@opencode-ai/ui/v2/basic-tool-v2"
import { ToolErrorCardV2 } from "@opencode-ai/ui/v2/tool-error-card-v2"
import { LineCommentV2, LineCommentEditorV2 } from "@opencode-ai/ui/v2/line-comment-v2"
import { SettingsList } from "./settings-list"

const buttonVariants = ["neutral", "contrast", "ghost", "ghost-muted"] as const
const buttonSizes = ["small", "normal", "large"] as const
const iconNames = [
  "edit", "sidebar-right", "menu", "settings-gear", "magnifying-glass",
  "close", "plus", "chevron-down", "status", "help", "folder-add-left",
  "grid-plus", "xmark-small", "outline-chevron-down", "outline-dots", "status-active",
] as const

const SectionHeader: Component<{ title: string; description?: string }> = (props) => (
  <div class="flex flex-col gap-1 pt-2 pb-4">
    <h3 class="text-14-medium text-text-strong">{props.title}</h3>
    <Show when={props.description}>
      <p class="text-12-regular text-text-weak">{props.description}</p>
    </Show>
  </div>
)

const GalleryRow: Component<{ label: string; children: any }> = (props) => (
  <div class="flex items-center justify-between py-3 gap-4">
    <span class="text-11-medium text-text-weaker w-40 shrink-0">{props.label}</span>
    <div class="flex items-center gap-2 flex-wrap justify-end">{props.children}</div>
  </div>
)

export const SettingsComponents: Component = () => {
  const [selectValue, setSelectValue] = createSignal("option-a")
  const selectOptions = [
    { id: "option-a", label: "Option A" },
    { id: "option-b", label: "Option B" },
    { id: "option-c", label: "Option C" },
  ]
  const [switchOn, setSwitchOn] = createSignal(true)
  const [accordionValue, setAccordionValue] = createSignal(["item-2"])
  const [editorValue, setEditorValue] = createSignal("")
  const [editorVisible, setEditorVisible] = createSignal(false)

  const completedTool: BasicToolV2TriggerTitle = {
    title: "Apply edit to src/utils.ts",
    subtitle: "Completed",
    args: ["src/utils.ts"],
    changes: { additions: 12, deletions: 3 },
  }
  const pendingTool: BasicToolV2TriggerTitle = {
    title: "Running tests for auth module",
    subtitle: "Pending",
    args: ["packages/auth/"],
  }
  const errorTool: BasicToolV2TriggerTitle = {
    title: "Fetch external API docs",
    subtitle: "Failed",
    args: ["https://api.example.com/docs"],
  }

  return (
    <div class="flex flex-col h-full overflow-y-auto no-scrollbar px-4 pb-10 sm:px-10 sm:pb-10">
      <div class="sticky top-0 z-10 bg-[linear-gradient(to_bottom,var(--surface-stronger-non-alpha)_calc(100%_-_24px),transparent)]">
        <div class="flex flex-col gap-1 pt-6 pb-8">
          <h2 class="text-16-medium text-text-strong">Components</h2>
          <p class="text-12-regular text-text-weak">Preview all UI components with their variants. Use this to verify design changes.</p>
        </div>
      </div>

      <div class="flex flex-col gap-6 w-full">
        {/* ── Actions ── */}
        <SettingsList>
          <SectionHeader title="Actions" description="Buttons, icon buttons, and segmented controls" />
          <div class="flex flex-col divide-y divide-border-weak-base">
            <For each={buttonSizes}>
              {(size) => (
                <GalleryRow label={`Button · ${size}`}>
                  <For each={buttonVariants}>
                    {(variant) => <ButtonV2 size={size} variant={variant}>{variant}</ButtonV2>}
                  </For>
                </GalleryRow>
              )}
            </For>
            <GalleryRow label="Button · disabled">
              <ButtonV2 disabled>Disabled</ButtonV2>
            </GalleryRow>
            <For each={buttonSizes}>
              {(size) => (
                <GalleryRow label={`IconButton · ${size}`}>
                  <For each={buttonVariants}>
                    {(variant) => <IconButtonV2 size={size} variant={variant} icon={<Icon name="plus" />} />}
                  </For>
                </GalleryRow>
              )}
            </For>
            <GalleryRow label="SegmentedControl">
              <SegmentedControlV2 defaultValue="a" allowDeselect>
                <SegmentedControlItemV2 value="a">Alpha</SegmentedControlItemV2>
                <SegmentedControlItemV2 value="b">Beta</SegmentedControlItemV2>
                <SegmentedControlItemV2 value="c">Gamma</SegmentedControlItemV2>
              </SegmentedControlV2>
            </GalleryRow>
          </div>
        </SettingsList>

        {/* ── Forms ── */}
        <SettingsList>
          <SectionHeader title="Forms" description="Inputs, selects, checkboxes, radios, and switches" />
          <div class="flex flex-col divide-y divide-border-weak-base">
            <GalleryRow label="TextInput · base">
              <TextInputV2 placeholder="Placeholder text" />
            </GalleryRow>
            <GalleryRow label="TextInput · large">
              <TextInputV2 appearance="large" placeholder="Large input" />
            </GalleryRow>
            <GalleryRow label="TextInput · invalid">
              <TextInputV2 invalid value="Bad input" />
            </GalleryRow>
            <GalleryRow label="TextInput · disabled">
              <TextInputV2 disabled value="Disabled" />
            </GalleryRow>
            <GalleryRow label="Textarea">
              <TextareaV2 placeholder="Multi-line text..." />
            </GalleryRow>
            <GalleryRow label="Textarea · invalid">
              <TextareaV2 invalid value="Invalid content" />
            </GalleryRow>
            <GalleryRow label="InlineInput">
              <InlineInputV2 prefix="Label" value="Value" />
            </GalleryRow>
            <GalleryRow label="InlineInput · large">
              <InlineInputV2 appearance="large" prefix="URL" value="https://example.com" showCopyButton />
            </GalleryRow>
            <GalleryRow label="Checkbox">
              <div class="flex gap-4">
                <CheckboxV2 label="Default" />
                <CheckboxV2 label="Disabled" disabled />
              </div>
            </GalleryRow>
            <GalleryRow label="RadioGroup">
              <RadioGroupV2 label="Choose one">
                <RadioItemV2 value="x" label="Option X" />
                <RadioItemV2 value="y" label="Option Y (disabled)" disabled />
                <RadioItemV2 value="z" label="Option Z" />
              </RadioGroupV2>
            </GalleryRow>
            <GalleryRow label="Switch">
              <div class="flex items-center gap-4">
                <Switch checked={switchOn()} onChange={setSwitchOn}>On</Switch>
                <Switch disabled>Disabled</Switch>
              </div>
            </GalleryRow>
            <GalleryRow label="Select · base">
              <SelectV2
                options={selectOptions}
                current={selectOptions[0]}
                value={(o) => o.id}
                label={(o) => o.label}
                onSelect={setSelectValue}
              />
            </GalleryRow>
            <GalleryRow label="Select · large">
              <SelectV2
                appearance="large"
                placeholder="Choose..."
                options={selectOptions}
                value={(o) => o.id}
                label={(o) => o.label}
              />
            </GalleryRow>
            <GalleryRow label="FieldV2">
              <FieldV2>
                <FieldV2.Label tooltip="Helper text">Field label</FieldV2.Label>
                <TextInputV2 placeholder="Inside a field" />
              </FieldV2>
            </GalleryRow>
          </div>
        </SettingsList>

        {/* ── Display ── */}
        <SettingsList>
          <SectionHeader title="Display" description="Badges, avatars, keybinds, and icons" />
          <div class="flex flex-col divide-y divide-border-weak-base">
            <GalleryRow label="Tag / Badge">
              <div class="flex gap-2">
                <Tag>Default</Tag>
                <Tag data-high-contrast>High Contrast</Tag>
              </div>
            </GalleryRow>
            <GalleryRow label="Avatar · sizes">
              <div class="flex items-end gap-3">
                <Avatar size="small" fallback="AB" />
                <Avatar size="normal" fallback="CD" />
                <Avatar size="large" fallback="EF" />
              </div>
            </GalleryRow>
            <GalleryRow label="Avatar · org">
              <div class="flex gap-3">
                <Avatar kind="org" fallback="OC" />
                <Avatar kind="org" fallback="GH" size="large" />
              </div>
            </GalleryRow>
            <GalleryRow label="ProjectAvatar">
              <div class="flex gap-1 flex-wrap">
                <For each={PROJECT_AVATAR_VARIANTS}>
                  {(v) => <ProjectAvatar variant={v} fallback={v[0]!.toUpperCase()} />}
                </For>
              </div>
            </GalleryRow>
            <GalleryRow label="Keybind">
              <div class="flex gap-2">
                <KeybindV2 keys={["Ctrl", "K"]} />
                <KeybindV2 keys={["⌘", "Shift", "P"]} variant="ghost" />
              </div>
            </GalleryRow>
            <GalleryRow label="Icons">
              <div class="grid grid-cols-8 gap-2">
                <For each={iconNames}>
                  {(name) => (
                    <div class="flex items-center justify-center w-8 h-8 rounded-md bg-surface-base">
                      <Icon name={name} size="small" />
                    </div>
                  )}
                </For>
              </div>
            </GalleryRow>
          </div>
        </SettingsList>

        {/* ── Navigation ── */}
        <SettingsList>
          <SectionHeader title="Navigation" description="Tabs and accordions" />
          <div class="flex flex-col divide-y divide-border-weak-base">
            <GalleryRow label="Tabs · normal">
              <div class="w-full max-w-md">
                <TabsV2 defaultValue="one">
                  <TabsV2.List>
                    <TabsV2.Trigger value="one">First</TabsV2.Trigger>
                    <TabsV2.Trigger value="two">Second</TabsV2.Trigger>
                    <TabsV2.Trigger value="three">Third</TabsV2.Trigger>
                  </TabsV2.List>
                </TabsV2>
              </div>
            </GalleryRow>
            <GalleryRow label="Tabs · pill">
              <div class="w-full max-w-md">
                <TabsV2 variant="pill" defaultValue="a">
                  <TabsV2.List>
                    <TabsV2.Trigger value="a">Alpha</TabsV2.Trigger>
                    <TabsV2.Trigger value="b">Beta</TabsV2.Trigger>
                  </TabsV2.List>
                </TabsV2>
              </div>
            </GalleryRow>
            <GalleryRow label="Accordion">
              <div class="w-full max-w-md">
                <AccordionV2 value={accordionValue()} onChange={setAccordionValue}>
                  <AccordionV2.Item value="item-1">
                    <AccordionV2.Trigger>Section One</AccordionV2.Trigger>
                    <AccordionV2.Content>Content for section one.</AccordionV2.Content>
                  </AccordionV2.Item>
                  <AccordionV2.Item value="item-2">
                    <AccordionV2.Trigger>Section Two</AccordionV2.Trigger>
                    <AccordionV2.Content>Content for section two.</AccordionV2.Content>
                  </AccordionV2.Item>
                  <AccordionV2.Item value="item-3">
                    <AccordionV2.Trigger>Section Three (disabled)</AccordionV2.Trigger>
                    <AccordionV2.Content>Content for section three.</AccordionV2.Content>
                  </AccordionV2.Item>
                </AccordionV2>
              </div>
            </GalleryRow>
          </div>
        </SettingsList>

        {/* ── Overlay ── */}
        <SettingsList>
          <SectionHeader title="Overlay" description="Tooltips, dialog preview, and toast preview" />
          <div class="flex flex-col divide-y divide-border-weak-base">
            <GalleryRow label="Tooltip">
              <TooltipV2 value="This is a tooltip message">
                <span class="text-12-medium text-text-interactive-base underline cursor-default">Hover me</span>
              </TooltipV2>
            </GalleryRow>
            <GalleryRow label="Dialog preview">
              <div class="w-80 rounded-xl border border-border-weak-base bg-background-base shadow-[var(--v2-elevation-overlay)] p-5">
                <div class="flex flex-col gap-2">
                  <span class="text-14-medium text-text-strong">Dialog Title</span>
                  <span class="text-12-regular text-text-weak">This is a static preview of the dialog container shape. The actual dialog renders as a modal overlay.</span>
                  <div class="flex justify-end gap-2 mt-2">
                    <ButtonV2 variant="ghost-muted" size="small">Cancel</ButtonV2>
                    <ButtonV2 variant="neutral" size="small">Confirm</ButtonV2>
                  </div>
                </div>
              </div>
            </GalleryRow>
            <GalleryRow label="Toast preview">
              <div class="flex flex-col gap-2 w-80">
                <div class="rounded-lg border border-border-weak-base bg-surface-float-base p-3 shadow-[var(--v2-elevation-floating)]">
                  <span class="text-12-medium text-text-strong">Info toast</span>
                  <span class="text-12-regular text-text-weak ml-2">Something happened successfully</span>
                </div>
                <div class="rounded-lg border border-border-weak-base bg-surface-float-base p-3 shadow-[var(--v2-elevation-floating)]">
                  <span class="text-12-medium text-text-warning-base">Warning toast</span>
                  <span class="text-12-regular text-text-weak ml-2">Check your configuration</span>
                </div>
              </div>
            </GalleryRow>
          </div>
        </SettingsList>

        {/* ── Indicators ── */}
        <SettingsList>
          <SectionHeader title="Indicators" description="Loading shimmers and diff stats" />
          <div class="flex flex-col divide-y divide-border-weak-base">
            <GalleryRow label="TextShimmer · active">
              <TextShimmerV2 text="Loading content..." active />
            </GalleryRow>
            <GalleryRow label="TextShimmer · inactive">
              <TextShimmerV2 text="Loaded content" />
            </GalleryRow>
            <GalleryRow label="DiffChanges">
              <DiffChanges changes={{ additions: 5, deletions: 3 }} />
            </GalleryRow>
          </div>
        </SettingsList>

        {/* ── Content (Markdown) ── */}
        <SettingsList>
          <SectionHeader title="Content" description="Markdown rendering: headings, lists, code, tables, math" />
          <div class="flex flex-col divide-y divide-border-weak-base">
            <GalleryRow label="Inline formatting">
              <Markdown text="**bold** *italic* ~~strikethrough~~ `inline code` [link](https://example.com)" />
            </GalleryRow>
            <GalleryRow label="Headings">
              <Markdown
                text={`# Heading 1
## Heading 2
### Heading 3`}
              />
            </GalleryRow>
            <GalleryRow label="Lists">
              <Markdown
                text={`- Unordered item one
- Unordered item two
  - Nested item

1. Ordered item one
2. Ordered item two
3. Ordered item three`}
              />
            </GalleryRow>
            <GalleryRow label="Blockquote">
              <Markdown text="> This is a blockquote with **bold** and `code` inside it." />
            </GalleryRow>
            <GalleryRow label="Code block">
              <Markdown
                text={`\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}

console.log(greet("World"))
\`\`\``}
              />
            </GalleryRow>
            <GalleryRow label="Table">
              <Markdown
                text={`| Name  | Role     | Status |
|-------|----------|--------|
| Alice | Engineer | Active |
| Bob   | Designer | Active |
| Carol | Manager  | Away   |`}
              />
            </GalleryRow>
          </div>
        </SettingsList>

        {/* ── Domain ── */}
        <SettingsList>
          <SectionHeader title="Domain" description="Tool execution cards, error cards, and code review comments" />
          <div class="flex flex-col divide-y divide-border-weak-base">
            <GalleryRow label="BasicTool · completed">
              <div class="w-full max-w-lg">
                <BasicToolV2 trigger={completedTool} defaultOpen>
                  <div class="text-12-regular text-text-weak p-2">
                    Updated <code class="text-11-regular">normalizePath</code> to handle Windows separators.
                    Added fallback for UNC paths.
                  </div>
                </BasicToolV2>
              </div>
            </GalleryRow>
            <GalleryRow label="BasicTool · pending">
              <div class="w-full max-w-lg">
                <BasicToolV2 trigger={pendingTool} status="pending" />
              </div>
            </GalleryRow>
            <GalleryRow label="BasicTool · running">
              <div class="w-full max-w-lg">
                <BasicToolV2 trigger={{ title: "Install dependencies", subtitle: "Running", args: ["bun", "install"] }} status="running" />
              </div>
            </GalleryRow>
            <GalleryRow label="ToolErrorCard · default">
              <div class="w-full max-w-lg">
                <ToolErrorCardV2
                  title="Failed to connect to MCP server"
                  subtitle="Error: ECONNREFUSED 127.0.0.1:9000"
                />
              </div>
            </GalleryRow>
            <GalleryRow label="ToolErrorCard · loading">
              <div class="w-full max-w-lg">
                <ToolErrorCardV2
                  title="Retrying connection..."
                  subtitle="Attempt 2 of 3"
                  loading
                />
              </div>
            </GalleryRow>
            <GalleryRow label="ToolErrorCard · with link">
              <div class="w-full max-w-lg">
                <ToolErrorCardV2
                  title="Build failed"
                  subtitle="TypeScript compilation error"
                  subtitleHref="https://example.com/logs"
                  suffix="Exit code: 1"
                />
              </div>
            </GalleryRow>
            <GalleryRow label="LineComment · display">
              <div class="w-full max-w-lg">
                <LineCommentV2
                  comment="This regex could be simplified to avoid catastrophic backtracking on long inputs."
                  selection={<>Line 42 in <code class="text-11-regular">src/parser.ts</code></>}
                  actions={<span class="text-11-medium text-text-weaker">···</span>}
                />
              </div>
            </GalleryRow>
            <GalleryRow label="LineCommentEditor">
              <div class="w-full max-w-lg">
                <Show
                  when={editorVisible()}
                  fallback={
                    <ButtonV2 variant="ghost-muted" size="small" onClick={() => setEditorVisible(true)}>
                      Show editor
                    </ButtonV2>
                  }
                >
                  <LineCommentEditorV2
                    value={editorValue()}
                    onInput={setEditorValue}
                    onCancel={() => setEditorVisible(false)}
                    onSubmit={(v) => {
                      setEditorValue(v)
                      setEditorVisible(false)
                    }}
                    selection={<>Line 15 in <code class="text-11-regular">src/auth.ts</code></>}
                    placeholder="Write a review comment..."
                  />
                </Show>
              </div>
            </GalleryRow>
          </div>
        </SettingsList>
      </div>
    </div>
  )
}
