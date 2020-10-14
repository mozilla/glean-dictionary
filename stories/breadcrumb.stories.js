import Breadcrumb from "../src/components/Breadcrumb.svelte";

const pingParams = { app: "fenix", ping: "activation" };
const metricParams = { app: "fenix", metric: "activation.activation_id" };

export default {
  title: "Breadcrumb",
};

export const Ping = () => ({
  Component: Breadcrumb,
  props: { params: pingParams },
});

export const Metric = () => ({
  Component: Breadcrumb,
  props: { params: metricParams },
});
