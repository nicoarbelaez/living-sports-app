const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude native build artifacts and missing optional platform packages from Metro watcher
config.watchFolders = [__dirname];
config.resolver = {
  ...config.resolver,
  blockList: [
    /node_modules\/.*\/android\/.cxx\/.*/,
    /android\/.cxx\/.*/,
    // Supabase CLI optional deps for other platforms — not installed on Windows, cause ENOENT
    /@supabase[/\\]cli-(darwin|linux)/,
  ],
};

module.exports = withNativewind(config);
