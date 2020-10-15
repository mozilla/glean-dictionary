import Breadcrumb from "../src/components/Breadcrumb.svelte";

const AppsLinks = [{ url: "/", name: "apps" }];

const PingLinks = [
  { url: "/", name: "apps" },
  { url: "/apps/fenix/", name: "fenix" },
  { url: "/apps/fenix/pings/activation", name: "pings / activation" },
];

const MetricLinks = [
  { url: "/", name: "apps" },
  { url: "/apps/fenix/", name: "fenix" },
  {
    url: "/apps/fenix/metrics/about_page.libraries_tapped",
    name: "metrics / about_page.libraries_tapped",
  },
];

export default {
  title: "Breadcrumb",
};

export const AppsListPage = () => ({
  Component: Breadcrumb,
  props: { links: AppsLinks },
});

export const PingPage = () => ({
  Component: Breadcrumb,
  props: { links: PingLinks },
});

export const MetricPage = () => ({
  Component: Breadcrumb,
  props: { links: MetricLinks },
});
