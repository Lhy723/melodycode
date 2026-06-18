import { execFile } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

import type { Configuration } from "electron-builder"

import branding from "../../branding.config.json" with { type: "json" }

const execFileAsync = promisify(execFile)
const packageDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(packageDir, "../..")
const signScript = path.join(rootDir, "script", "sign-windows.ps1")
// The Electron 42 packaging update briefly installed Linux launchers/icons under
// "opencode-desktop". Keep that hidden desktop entry around so existing GNOME/KDE
// pins still resolve even after the canonical app id changes — important for
// users migrating from a prior install.
const legacyDesktopEntry = path.join(packageDir, "resources", "linux", "opencode-desktop.desktop")
const legacyDesktopEntryFpm = `${legacyDesktopEntry}=/usr/share/applications/opencode-desktop.desktop`

const APP_IDS = {
  dev: branding.desktop.appIdDev,
  beta: branding.desktop.appIdBeta,
  prod: branding.desktop.appIdProd,
} as const

const PRODUCT_NAMES = {
  dev: branding.desktop.productNameDev,
  beta: branding.desktop.productNameBeta,
  prod: branding.desktop.productNameProd,
} as const

const PROTOCOL_SCHEME = branding.desktop.protocolScheme
const ARTIFACT_PREFIX = `${branding.shortName}-desktop`
const RPM_PACKAGE_BASE = branding.shortName

async function signWindows(configuration: { path: string }) {
  if (process.platform !== "win32") return
  if (process.env.GITHUB_ACTIONS !== "true") return

  await execFileAsync(
    "pwsh",
    ["-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", signScript, configuration.path],
    { cwd: rootDir },
  )
}

const channel = (() => {
  // OPENCODE_CHANNEL retained as the env variable name for compatibility with
  // the existing release pipeline; controls dev/beta/prod build variants only.
  const raw = process.env.OPENCODE_CHANNEL
  if (raw === "dev" || raw === "beta" || raw === "prod") return raw
  return "dev"
})()

const getBase = (appId: string): Configuration => ({
  artifactName: `${ARTIFACT_PREFIX}-\${os}-\${arch}.\${ext}`,
  directories: {
    output: "dist",
    buildResources: "resources",
  },
  // Linux launchers are .desktop files, so this is the desktop file name,
  // not just the app id. For prod, app id "com.melodycode.desktop" becomes
  // "com.melodycode.desktop.desktop".
  // https://developer.gnome.org/documentation/guidelines/maintainer/integrating.html
  // https://www.electron.build/docs/linux/
  extraMetadata: {
    desktopName: `${appId}.desktop`,
  },
  files: ["out/**/*", "resources/**/*"],
  extraResources: [
    {
      from: "native/",
      to: "native/",
      filter: ["index.js", "index.d.ts", "build/Release/mac_window.node", "swift-build/**"],
    },
  ],
  mac: {
    category: "public.app-category.developer-tools",
    icon: `resources/icons/icon.icns`,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "resources/entitlements.plist",
    entitlementsInherit: "resources/entitlements.plist",
    notarize: true,
    target: ["dmg", "zip"],
  },
  dmg: {
    sign: true,
  },
  protocols: {
    name: PRODUCT_NAMES.prod,
    schemes: [PROTOCOL_SCHEME],
  },
  win: {
    icon: `resources/icons/icon.ico`,
    signtoolOptions: {
      sign: signWindows,
    },
    target: ["nsis"],
    verifyUpdateCodeSignature: false,
  },
  nsis: {
    oneClick: true,
    perMachine: false,
    installerIcon: `resources/icons/icon.ico`,
    installerHeaderIcon: `resources/icons/icon.ico`,
  },
  linux: {
    icon: `resources/icons`,
    category: "Development",
    executableName: appId,
    desktop: {
      entry: {
        // Match the installed .desktop file and hicolor icon basename so
        // Linux shells can associate the running Electron window with its launcher.
        StartupWMClass: appId,
      },
    },
    target: ["AppImage", "deb", "rpm"],
  },
})

function getConfig() {
  const appId = APP_IDS[channel]
  const productName = PRODUCT_NAMES[channel]
  const base = getBase(appId)
  const publishOwner = branding.desktop.publishOwner
  const publishRepoProd = branding.desktop.publishRepoProd
  const publishRepoBeta = branding.desktop.publishRepoBeta

  switch (channel) {
    case "dev": {
      return {
        ...base,
        appId,
        productName,
        rpm: { packageName: `${RPM_PACKAGE_BASE}-dev` },
      }
    }
    case "beta": {
      const publish =
        publishOwner && publishRepoBeta
          ? { publish: { provider: "github" as const, owner: publishOwner, repo: publishRepoBeta, channel: "latest" } }
          : {}
      return {
        ...base,
        appId,
        productName,
        protocols: { name: productName, schemes: [PROTOCOL_SCHEME] },
        ...publish,
        rpm: { packageName: `${RPM_PACKAGE_BASE}-beta` },
      }
    }
    case "prod": {
      const publish =
        publishOwner && publishRepoProd
          ? { publish: { provider: "github" as const, owner: publishOwner, repo: publishRepoProd, channel: "latest" } }
          : {}
      return {
        ...base,
        appId,
        productName,
        protocols: { name: productName, schemes: [PROTOCOL_SCHEME] },
        ...publish,
        deb: { fpm: [legacyDesktopEntryFpm] },
        rpm: { packageName: RPM_PACKAGE_BASE, fpm: [legacyDesktopEntryFpm] },
      }
    }
  }
}

export default getConfig()
