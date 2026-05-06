const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Allow Metro to resolve modules through pnpm's symlinked node_modules.
// Without this, @expo/vector-icons font files cannot be found in Expo Go,
// causing all Feather icons to render as blank squares.
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Exclude Replit-internal and non-app directories from Metro's file watcher.
// Without this, Metro's FallbackWatcher crashes on transient temp paths inside
// .local/skills that are deleted between directory enumeration and fs.watch().
config.resolver.blockList = [
  /\/\.local\/.*/,
  /\/\.git\/.*/,
];

config.resolver.platforms = ["android", "ios", "web", "native"];

module.exports = config;
