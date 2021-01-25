import { camelCase, upperFirst, snakeCase } from "lodash";

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

export const getSearchfoxLink = (app, metric) => {
  const [category, name] = metric.split(/\.(?=[^.]+$)/);

  // Generate all possible casings for a Searchfox query:
  // https://github.com/mozilla/glean-dictionary/pull/339#issuecomment-766904256

  // Javascript: camelCase.camelCase
  const camelCased = name
    ? `${camelCase(category)}.${camelCase(name)}`
    : camelCase(category);

  // Kotlin, Swift: CamelCase.camelCase
  const capitalizedCamelCased = name
    ? upperFirst(`${camelCase(category)}.${camelCase(name)}`)
    : camelCase(category);

  // Python: snake_case.snake_case
  const snakedCased = name
    ? `${snakeCase(category)}.${snakeCase(name)}`
    : snakeCase(category);

  // Rust, C++: snake_case::snake_case
  const dblColonSnakeCased = name
    ? `${snakeCase(category)}::${snakeCase(name)}`
    : snakeCase(category);

  const allLanguagePatterns = `${camelCased}|${capitalizedCamelCased}|${snakedCased}|${dblColonSnakeCased}`;

  if (searchfoxMap[app]) {
    return app === "firefox-desktop"
      ? `https://searchfox.org/mozilla-central/search?q=${allLanguagePatterns}&regexp=true`
      : `https://searchfox.org/mozilla-mobile/search?q=${allLanguagePatterns}&path=${searchfoxMap[app]}&regexp=true`;
  }
  return undefined;
};
