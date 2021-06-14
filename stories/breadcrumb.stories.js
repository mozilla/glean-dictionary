import Breadcrumb from "../src/components/Breadcrumb.svelte";

const [AppsLinks, AppDetailsLinks, PingsLinks, MetricsLinks, TableLinks] = [
  [{ url: "/", name: "apps" }],
  [
    { url: "/", name: "apps" },
    { url: "/apps/fenix/", name: "fenix" },
  ],
  [
    { url: "/", name: "apps" },
    { url: "/apps/fenix/", name: "fenix" },
    { url: "/apps/fenix/pings/activation", name: "activation" },
  ],
  [
    { url: "/", name: "apps" },
    { url: "/apps/fenix/", name: "fenix" },
    {
      url: "/apps/fenix/metrics/about_page.libraries_tapped",
      name: "about_page.libraries_tapped",
    },
  ],
  [
    { url: "/", name: "apps" },
    { url: "/apps/fenix/", name: "fenix" },
    { url: "/apps/fenix/pings/activation", name: "activation" },
    { url: "/apps/fenix/tables/activation/", name: "activation table" },
  ],
];

export default {
  title: "Breadcrumb",
};

export const AppDetailsPage = () => ({
  Component: Breadcrumb,
  props: { links: AppDetailsLinks },
});

export const BigQueryTablePage = () => ({
  Component: Breadcrumb,
  props: { links: TableLinks },
});

export const AppsListPage = () => ({
  Component: Breadcrumb,
  props: { links: AppsLinks },
});

export const PingPage = () => ({
  Component: Breadcrumb,
  props: { links: PingsLinks },
});

export const MetricPage = () => ({
  Component: Breadcrumb,
  props: { links: MetricsLinks },
});
