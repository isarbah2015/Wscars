const baseConfig = require("./app.json");

module.exports = ({ config }) => ({
  ...baseConfig.expo,
  android: {
    ...baseConfig.expo.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
  },
});
