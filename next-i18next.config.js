/** @type {import('next-i18next').UserConfig} */
const path = require("path");
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["ja", "en"],
    // localeDetection: true,
  },
  localePath: path.resolve("./public/locales"),
};
