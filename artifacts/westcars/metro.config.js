const { getDefaultConfig } = require("expo/metro-config");
const fs   = require("fs");
const path = require("path");

const projectRoot  = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Allow Metro to resolve modules through pnpm's symlinked node_modules.
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Exclude Replit-internal directories from Metro's file watcher.
config.resolver.blockList = [
  /\/\.local\/.*/,
  /\/\.git\/.*/,
];

config.resolver.platforms = ["android", "ios", "web", "native"];

// ── Firebase singleton pinning ──────────────────────────────────────────────
//
// The monorepo contains TWO Firebase versions:
//   • firebase@11.6.0  — mobile app (artifacts/westcars)
//   • firebase@12.x    — admin dashboard (artifacts/westcars-admin)
//
// Root cause of the crash "Component auth has not been registered yet":
//   @firebase/component is the SHARED registry where every Firebase service
//   registers itself (auth, firestore, etc.) and where getAuth(app) looks
//   them up. If @firebase/component resolves from two different file paths,
//   they produce TWO SEPARATE singleton registries. auth registers into one;
//   getAuth(app) looks in the other → "not registered yet".
//
// Fix: Pin ALL @firebase/* scoped packages to the v11-compatible copies.
//
// Package locations in pnpm's virtual store:
//
//   Lookup A — firebase@11.6.0's own pnpm dir:
//     .pnpm/firebase@11.6.0_.../node_modules/@firebase/
//       app, auth, firestore, storage, util, … (most packages)
//
//   Lookup B — @firebase/auth@1.10.0's own pnpm dir:
//     .pnpm/@firebase+auth@1.10.0_.../node_modules/@firebase/
//       app, auth, component, logger, util  ← component & logger ONLY here
//
//   We follow the real symlinks so paths remain correct after `pnpm install`.
// ─────────────────────────────────────────────────────────────────────────────

// ── Lookup A: firebase@11 ────────────────────────────────────────────────────
const FIREBASE_LOCAL    = path.resolve(projectRoot, "node_modules/firebase");
const FIREBASE_REAL     = fs.realpathSync(FIREBASE_LOCAL);
// FIREBASE_REAL = …/.pnpm/firebase@11.6.0_.../node_modules/firebase
// Peer @firebase/* packages live one directory up:
const FIREBASE11_PEERS  = path.resolve(FIREBASE_REAL, "..", "@firebase");
// FIREBASE11_PEERS = …/.pnpm/firebase@11.6.0_.../node_modules/@firebase

// ── Lookup B: @firebase/auth@1.10.0 ─────────────────────────────────────────
// @firebase/auth lives inside Lookup A but has its OWN pnpm store entry with
// @firebase/component, @firebase/logger, and @firebase/util as siblings.
const AUTH_LINK    = path.join(FIREBASE11_PEERS, "auth");
const AUTH_REAL    = fs.realpathSync(AUTH_LINK);
// AUTH_REAL = …/.pnpm/@firebase+auth@1.10.0_.../node_modules/@firebase/auth
// component, logger, util are siblings (NOT sub-subdirs):
const AUTH10_PEERS = path.resolve(AUTH_REAL, "..");
// AUTH10_PEERS = …/.pnpm/@firebase+auth@1.10.0_.../node_modules/@firebase

/** Resolve a @firebase/<name> package from Lookup A then Lookup B. */
function firebasePkg(name) {
  for (const dir of [FIREBASE11_PEERS, AUTH10_PEERS]) {
    const resolved = path.resolve(dir, name);
    if (fs.existsSync(resolved)) return resolved;
  }
  return null;
}

// Every @firebase/* package that firebase/auth, firebase/app etc. import.
// Pinning all of them to v11 copies ensures a single component registry.
const FIREBASE_SCOPED = [
  // Core
  "app", "app-types", "app-compat",
  // Auth
  "auth", "auth-compat",
  // Registry & utilities — THE actual root cause
  "component", "logger", "util",
  // Other services used by the app
  "firestore", "firestore-compat",
  "storage",   "storage-compat",
  "installations", "installations-compat",
  "messaging",  "messaging-compat",
  "functions",  "functions-compat",
];

const scopedAliases = {};
for (const name of FIREBASE_SCOPED) {
  const resolved = firebasePkg(name);
  if (resolved) scopedAliases[`@firebase/${name}`] = resolved;
}

config.resolver.extraNodeModules = {
  // Bare `firebase` → local v11 (prevents picking up admin's v12)
  firebase: FIREBASE_LOCAL,
  // All @firebase/* scoped packages → correct v11-compatible copies
  ...scopedAliases,
};

module.exports = config;
