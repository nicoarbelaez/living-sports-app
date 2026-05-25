const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude native build artifacts from Metro watcher to prevent ENOENT crashes
config.watchFolders = [__dirname];
config.resolver = {
  ...config.resolver,
  blockList: [
    /node_modules\/.*\/android\/.cxx\/.*/,
    /android\/.cxx\/.*/,
  ],
};

module.exports = withNativewind(config);
