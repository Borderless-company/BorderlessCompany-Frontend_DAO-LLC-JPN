/** @type {import('next').NextConfig} */

const { i18n } = require("./next-i18next.config.js");
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "another-domain.com",
      },
    ],
    unoptimized: true,
  },
  i18n,
  experimental: {
    serverComponentsExternalPackages: ["@noble/hashes"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@noble/hashes/crypto": "@noble/hashes/crypto.js",
      });
    }

    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };

    return config;
  },
};

module.exports = nextConfig;
