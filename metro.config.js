const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure cjs and Firebase modules resolve correctly in Hermes
config.resolver.sourceExts.push('cjs');

module.exports = config;
