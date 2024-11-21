/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en"],
    localeDetection: true,
  },
  localePath:
    process.env.NODE_ENV === "development" ? "./public/locales" : "./locales",
};
