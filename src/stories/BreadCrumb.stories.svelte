<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import Breadcrumb from "../components/Breadcrumb.svelte";

  const [appListLinks, appLinks, pingLinks, metricLinks, tableLinks] = [
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
</script>

<Meta title="Example/Breadcrumb" component={Breadcrumb} />

<Template let:args>
  <Breadcrumb {...args} />
</Template>

<Story
  name="AppList Page"
  args={{
    links: appListLinks,
  }}
/>

<Story
  name="AppDetail Page"
  args={{
    links: appLinks,
  }}
/>

<Story
  name="PingDetail Page"
  args={{
    links: pingLinks,
  }}
/>

<Story
  name="MetricDetail Page"
  args={{
    links: metricLinks,
  }}
/>

<Story
  name="BigQueryTable Page"
  args={{
    links: tableLinks,
  }}
/>
