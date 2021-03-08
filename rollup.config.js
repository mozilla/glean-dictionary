import replace from "@rollup/plugin-replace";
import svelte from "rollup-plugin-svelte";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { string } from "rollup-plugin-string";
import { terser } from "rollup-plugin-terser";
import { spawn, execSync } from "child_process";
import sveltePreprocess from "svelte-preprocess";
import copy from "rollup-plugin-copy";

const production = !process.env.ROLLUP_WATCH;

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
  input: "src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    string({
      include: ["./src/data/defaultMetricAnnotation.md"],
    }),
    postcss({
      plugins: [],
    }),
    svelte({
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file - better for performance
      preprocess: sveltePreprocess({
        postcss: true,
        defaults: {
          style: "scss",
        },
        scss: {
          prependData: `@import 'node_modules/@mozilla-protocol/core/protocol/css/protocol.scss';`,
        },
      }),
      css: (css) => {
        css.write("bundle.css");
      },
    }),
    // only use google analytics on production builds
    replace({
      __GOOGLE_ANALYTICS_ID__:
        process.env.CONTEXT === "production" && process.env.GOOGLE_ANALYTICS_ID,
      __VERSION__: execSync("git rev-list HEAD --max-count=1")
        .toString()
        .trim(),
      // https://atomiks.github.io/tippyjs/v5/faq/#rollup
      "process.env.NODE_ENV": JSON.stringify(
        production ? "production" : "development"
      ),
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
