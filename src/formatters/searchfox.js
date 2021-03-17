import { camelCase, upperFirst, snakeCase } from "lodash";

const searchfoxMap = {
  fenix: "fenix",

  firefox_android_beta: "fenix",

  firefox_android_release: "fenix",

  firefox_desktop: "https://searchfox.org/mozilla-central/source/",

  focus_ios: "focus-ios",

  firefox_echo_show: "firefox-echo-show",

  firefox_fire_tv: "firefox-tv",

  firefox_ios: "firefox-ios",

  firefox_ios_beta: "firefox-ios",

  firefox_ios_dev: "firefox-ios",

  firefox_ios_release: "firefox-ios",

  firefox_reality: "FirefoxReality",

  lockwise_android: "lockbox-android",

  reference_browser: "reference-browser",
};

const sourcegraphMap = {
  klar_ios: "focus-ios",

  firefox_reality_pc: "FirefoxRealityPc",

  lockwise_ios: "lockwise-ios",

  mach: "mach",

  mozphab: "mozphab",

  mozregression: "mozregression",
};

export const getMetricLink = (app, metric) => {
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
    return app === "firefox_desktop"
      ? `https://searchfox.org/mozilla-central/search?q=${allLanguagePatterns}&regexp=true`
      : `https://searchfox.org/mozilla-mobile/search?q=${allLanguagePatterns}&path=${searchfoxMap[app]}&regexp=true`;
  }

  return (
    `https://sourcegraph.com/search?q=repo:%5Egithub%5C.com%5C/%5BMm%5Dozilla%28.*%29%5C/` +
    `${sourcegraphMap[app]}%24+${allLanguagePatterns}&patternType=regexp`
  );
};
