<script>
  import ItemList from "./ItemList.svelte";

  // the Adjust data is hard-coded here as only Firefox iOS requires it atm
  // when the need grows then we can start abstracting it
  const adjustData = [
    {
      name: "adid",
      description:
        "The advertising identifier, specific to Mozilla, and managed using Apple's skAdNetwork API",
      types: ["Advertising"],
    },
    {
      name: "attribution_deeplink",
      description: "Used to attribute a deeplink campaign",
      types: ["Advertising"],
    },
    {
      name: "engagement_type",
      description:
        "Used to attribute to a campaign that would otherwise be considered organic",
      types: ["Advertising"],
    },
    {
      name: "reference_tag",
      description: "The click ID for the campaign",
      types: ["Advertising"],
    },
    {
      name: "tracker_token",
      description: "Linking the install to the ads exposed",
      types: ["Advertising"],
    },
    {
      name: "event_token",
      description: "Information about how the application was installed",
      types: ["Installation"],
    },
    {
      name: "event_cost_id",
      description: "Information about how the application was installed",
      types: ["Installation"],
    },
    {
      name: "store_name",
      description: "Information about how the application was installed",
      types: ["Installation"],
    },
    {
      name: "app_name",
      description: "",
      types: ["Application"],
    },
    {
      name: "app_token",
      description: "",
      types: ["Application"],
    },
    {
      name: "app_version",
      description: "",
      types: ["Application"],
    },
    {
      name: "app_version_short",
      description: "",
      types: ["Application"],
    },
    {
      name: "bundle_id",
      description: "",
      types: ["Application"],
    },
    {
      name: "environment",
      description: "",
      types: ["Application"],
    },
    {
      name: "user_id",
      description: "A randomly generated user ID to identify you to Adjust",
      types: ["User"],
    },
    {
      name: "time_spent",
      description: "The length of time the application is in the foreground",
      types: ["User"],
    },
    {
      name: "device_name",
      description: "",
      types: ["Device"],
    },
    {
      name: "device_type",
      description: "",
      types: ["Device"],
    },
    {
      name: "manufacturer",
      description: "",
      types: ["Device"],
    },
    {
      name: "os_name",
      description: "",
      types: ["Device"],
    },
    {
      name: "os_version",
      description: "",
      types: ["Device"],
    },
    {
      name: "platform",
      description: "",
      types: ["Device"],
    },
  ];
</script>

<h4>Adjust Data</h4>
<p>
  Firefox iOS also uses Adjust — a mobile marketing vendor — to collect data
  that's used to determine the origin of the installation. For more information,
  see <a
    href="https://support.mozilla.org/en-US/kb/how-do-you-use-adjust-firefox"
    >"How do you use Adjust in Firefox?"</a
  >
</p>
<ItemList
  itemType="third-party data"
  items={adjustData}
  appName="firefox_ios"
/>
