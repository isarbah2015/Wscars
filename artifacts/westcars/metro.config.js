const { getDefaultConfig } = require("expo/metro-config");
const fs   = require("fs");
const path = require("path");

const projectRoot  = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

config.resolver.blockList = [
  /\/\.local\/.*/,
  /\/\.git\/.*/,
];

config.resolver.platforms = ["android", "ios", "web", "native"];

// ── Firebase singleton pinning ──────────────────────────────────────────────
//
// Problem: the monorepo has firebase@11 (mobile) and firebase@12 (admin) side
// by side. pnpm hoists @firebase/component@0.7.2 (v12) to the root. When
// @firebase/app imports @firebase/component it gets v12; when @firebase/auth
// imports @firebase/component it gets v11 from its own node_modules. Two
// separate singleton registries → "Component auth has not been registered yet".
//
// extraNodeModules alone is NOT enough: it is only a fallback and is skipped
// when pnpm hoisting already resolves the module through normal Node paths.
//
// resolveRequest is a TRUE intercept that runs BEFORE any other resolution.
// We use it to redirect every bare @firebase/* import (from anywhere in the
// bundle) to the correct v11-compatible copy in the pnpm store.
// ─────────────────────────────────────────────────────────────────────────────

// Derive pinned directories by following local symlinks.
const FIREBASE_LOCAL    = path.resolve(projectRoot, "node_modules/firebase");
const FIREBASE_REAL     = fs.realpathSync(FIREBASE_LOCAL);
const FIREBASE11_PEERS  = path.resolve(FIREBASE_REAL, "..", "@firebase");
const AUTH_LINK         = path.join(FIREBASE11_PEERS, "auth");
const AUTH_REAL         = fs.realpathSync(AUTH_LINK);
const AUTH10_PEERS      = path.resolve(AUTH_REAL, "..");

function findPinnedDir(name) {
  for (const dir of [FIREBASE11_PEERS, AUTH10_PEERS]) {
    const p = path.resolve(dir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Given a pinned package directory, return the correct entry-point file for
 * the current platform.  Metro needs an actual file path, not a directory.
 */
function pinnedMain(dir, platform) {
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
  const isNative = platform === "android" || platform === "ios" || platform === "native";
  const isWeb    = platform === "web";
  const mainField =
    isNative && pkg["react-native"] ? pkg["react-native"] :
    isWeb    && pkg["browser"]      ? pkg["browser"]      :
    pkg.main || "index.js";
  const resolved = path.resolve(dir, mainField);
  // Add .js extension if the field points to a bare path
  for (const ext of ["", ".js", ".jsx", ".ts", ".tsx"]) {
    if (fs.existsSync(resolved + ext)) return resolved + ext;
  }
  return resolved;
}

// Build the pinned-package map: { "@firebase/component": "/abs/path/to/dir", … }
const SCOPED_PKGS = [
  "app", "app-types", "app-compat",
  "auth", "auth-compat",
  "component", "logger", "util",
  "firestore", "firestore-compat",
  "storage",   "storage-compat",
  "installations", "installations-compat",
  "messaging",  "messaging-compat",
  "functions",  "functions-compat",
];

const FIREBASE_PINS = {};
for (const name of SCOPED_PKGS) {
  const dir = findPinnedDir(name);
  if (dir) FIREBASE_PINS[`@firebase/${name}`] = dir;
}

// ── resolveRequest: intercepts every require/import before normal resolution ─
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const pinnedDir = FIREBASE_PINS[moduleName];
  if (pinnedDir) {
    return { type: "sourceFile", filePath: pinnedMain(pinnedDir, platform) };
  }
  // Fall through to Metro's default resolver for everything else.
  return context.resolveRequest(context, moduleName, platform);
};

// Keep extraNodeModules for `firebase` sub-paths (firebase/auth, firebase/app,
// etc.) — resolveRequest only fires for bare module names, not sub-paths.
config.resolver.extraNodeModules = {
  firebase: FIREBASE_LOCAL,
  ...Object.fromEntries(
    Object.entries(FIREBASE_PINS).map(([k, v]) => [k, v]),
  ),
};

module.exports = config;
