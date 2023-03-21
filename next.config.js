const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Add the custom path to the config.resolve.alias object
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    config.resolve.alias['@styles'] = path.join(__dirname, 'src/styles');

    return config;
  },
};

module.exports = nextConfig;
