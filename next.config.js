/** @type {import('next').NextConfig} */

const { i18n } = require("./next-i18next.config.js");
const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  i18n,
};

module.exports = nextConfig;
