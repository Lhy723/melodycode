import branding from "../../../branding.config.json" with { type: "json" }

/**
 * Centralized brand identity for this distribution. All user-visible strings
 * and brand-anchored constants (CLI bin name, app id, runtime config dir,
 * service URLs) flow through this module so a fork can rebrand by editing a
 * single JSON file at the repo root (`branding.config.json`).
 *
 * URL fields under `urls.*` may be empty strings; consumers should fall back
 * to `upstream.*` when `useUpstreamServicesAsFallback` is true. This lets a
 * fork ship with its own brand name while still pointing at the upstream
 * services until self-hosted equivalents are deployed.
 */
export const Branding = branding

export type Channel = "dev" | "beta" | "prod"

export function appId(channel: Channel) {
  if (channel === "prod") return Branding.desktop.appIdProd
  if (channel === "beta") return Branding.desktop.appIdBeta
  return Branding.desktop.appIdDev
}

export function productName(channel: Channel) {
  if (channel === "prod") return Branding.desktop.productNameProd
  if (channel === "beta") return Branding.desktop.productNameBeta
  return Branding.desktop.productNameDev
}

/**
 * Resolve a service URL, preferring the fork's own deployment when
 * configured, otherwise falling back to the upstream opencode service so the
 * app keeps working before a self-hosted backend exists.
 */
function urlOrUpstream(key: keyof typeof Branding.urls): string {
  const own = Branding.urls[key]
  if (own) return own
  if (!Branding.useUpstreamServicesAsFallback) return ""
  const upstream: Partial<Record<keyof typeof Branding.urls, string>> = Branding.upstream
  return upstream[key] ?? ""
}

export const ServiceUrl = {
  get homepage() {
    return urlOrUpstream("homepage")
  },
  get docsBase() {
    return urlOrUpstream("docsBase")
  },
  get consoleBase() {
    return urlOrUpstream("consoleBase")
  },
  get apiBase() {
    return urlOrUpstream("apiBase")
  },
  get shareBase() {
    return urlOrUpstream("shareBase")
  },
  get installScript() {
    return urlOrUpstream("installScript")
  },
  get tuiSchema() {
    return urlOrUpstream("tuiSchema")
  },
  get configSchema() {
    return urlOrUpstream("configSchema")
  },
  get providerReferer() {
    return urlOrUpstream("providerReferer")
  },
  get appuiBase() {
    return urlOrUpstream("appuiBase")
  },
}
