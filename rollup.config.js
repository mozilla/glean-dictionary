import replace from "@rollup/plugin-replace";
import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { string } from "rollup-plugin-string";
import { terser } from "rollup-plugin-terser";
import { spawn, execSync } from "child_process";
import sveltePreprocess from "svelte-preprocess";
import copy from "rollup-plugin-copy";
import css from "rollup-plugin-css-only";

const production = !process.env.ROLLUP_WATCH;

function extractLastUpdatedTime(str) {
  const json = JSON.parse(str);
  const lastUpdatedDate = new Date();
  lastUpdatedDate.setTime(Date.parse(json.lastUpdate));

  return lastUpdatedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = spawn("npm", ["run", "start", "--", "--dev", "--single"], {
        stdio: ["ignore", "inherit", "inherit"],
        shell: true,
      });

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

export default {
  onwarn: (warning, handler) => {
    if (warning.message.indexOf("Unused CSS selector") !== -1) return;
    handler(warning);
  },
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    string({
      include: ["./src/data/defaultAnnotation.md"],
    }),
    svelte({
      // enable run-time checks when not in production
      compilerOptions: {
        dev: !production,
      },
      // we'll extract any component CSS out into
      // a separate file - better for performance
      preprocess: sveltePreprocess({
        postcss: true,
        scss: {
          prependData: `@import 'src/protocol-tokens.scss';`,
        },
      }),
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: "bundle.css" }),
    // only use google analytics on production builds
    replace({
      __GLEAN_APPLICATION_ID__:
        process.env.GLEAN_APPLICATION_ID || "glean-dictionary-dev",
      __GOOGLE_ANALYTICS_ID__:
        (process.env.CONTEXT === "production" &&
          process.env.GOOGLE_ANALYTICS_ID) ||
        "",
      __LAST_UPDATED_TIME__: extractLastUpdatedTime(
        execSync(
          "curl --compressed https://probeinfo.telemetry.mozilla.org/firefox/general"
        )
          .toString()
          .trim()
      ),
      __VERSION__: execSync("git rev-list HEAD --max-count=1")
        .toString()
        .trim(),
      // https://atomiks.github.io/tippyjs/v5/faq/#rollup
      "process.env.NODE_ENV": JSON.stringify(
        production ? "production" : "development"
      ),
      __DISPLAY_VERSION__: execSync("git describe --abbrev=0 --tags")
        .toString()
        .trim(),
    }),
    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload("public"),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
    copy({
      targets: [
        {
          src: "node_modules/@mozilla-protocol/core/protocol/img/logos/mozilla",
          dest: "public/img/logos",
        },
        {
          src: ["node_modules/@mozilla-protocol/core/protocol/fonts"],
          dest: "public/",
        },
      ],
    }),
  ],
  watch: {
    clearScreen: false,
  },
};
