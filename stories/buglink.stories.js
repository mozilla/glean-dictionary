import BugLink from "../src/components/BugLink.svelte";

export default {
  title: "Bug Links",
};

export const Bugzilla = () => ({
  Component: BugLink,
  props: {
    ref: "https://bugzilla.mozilla.org/1234",
  },
});

export const GitHub = () => ({
  Component: BugLink,
  props: {
    ref: "https://github.com/mozilla-mobile/fenix/issues/1234",
  },
});
