/** @type {import('next').NextConfig} */

const { i18n } = require("./next-i18next.config.js");
const nextConfig = {
  // output: "export",
  reactStrictMode: false,
  images: { unoptimized: true },
};

module.exports = {
  ...nextConfig,
  i18n,
};
