/** @type {import('next-i18next').UserConfig} */
const path = require("path");
module.exports = {
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en"],
    localeDetection: false,
  },
  localePath: path.resolve("./public/locales"),
};
