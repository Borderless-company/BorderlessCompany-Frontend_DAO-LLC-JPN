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
};

module.exports = nextConfig;
