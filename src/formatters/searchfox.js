const searchfoxMap = {
  fenix: "fenix",

  "firefox-android-beta": "fenix",

  "firefox-android-release": "fenix",

  "firefox-desktop": "https://searchfox.org/mozilla-central/source/",

  "firefox-focus-ios": "focus-ios",

  "firefox-for-echo-show": "firefox-echo-show",

  "firefox-for-fire-tv": "firefox-tv",

  "firefox-ios-beta": "firefox-ios",

  "firefox-ios-dev": "firefox-ios",

  "firefox-ios-release": "firefox-ios",

  "firefox-reality": "FirefoxReality",

  "lockwise-android": "lockbox-android",

  "reference-browser": "reference-browser",
};

const MozillaCentralURL = "https://searchfox.org/mozilla-central/";
const MozillaMobileURL = "https://searchfox.org/mozilla-mobile/";

export const getSearchfoxLink = (app, metric) => {
  if (searchfoxMap[app]) {
    return app === "firefox-desktop"
      ? `${MozillaCentralURL}search?q=${metric}`
      : `${MozillaMobileURL}search?q=${metric}&path=${searchfoxMap[app]}`;
  }
  return false;
};
