// https://storybook.js.org/tutorials/intro-to-storybook/svelte/en/simple-component/
module.exports = {
  transform: {
    "^.+\\.svelte$": ["svelte-jester", { preprocess: true }],
    "^.+\\.stories\\.[jt]sx?$":
      "<rootDir>node_modules/@storybook/addon-storyshots/injectFileName",
    "^.+\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!(@storybook/svelte)/)"],
  moduleFileExtensions: ["js", "svelte", "json"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/public/",
    "/.storybook",
    "/storybook-static/",
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less|scss)$": "<rootDir>/__mocks__/styleMock.js",
  },
  verbose: true,
};
