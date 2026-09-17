<script>
  import SchemaNode from "./SchemaNode.svelte";
  import FilterInput from "./FilterInput.svelte";
  import { pageState } from "../state/stores";

  export let app;
  export let nodes = [];

  let nodesWithVisibility = [];

  $: {
    const filterTerms = $pageState.search
      ? $pageState.search
          .trim()
          .split(" ")
          .filter((t) => t.length > 0)
      : [];

    const addVisibility = (node, parentNodeNames = ["__root__"]) => {
      let modifiedNode = node;
      let parentNames = [...parentNodeNames];

      parentNames.push(`${parentNames.slice(-1)}.${modifiedNode.name}`);

      if (modifiedNode.fields) {
        modifiedNode.fields.forEach((field) => {
          let modifiedNodeField = field;
          // Metric types jwe, labeled_rate, url, and text types
          // were deployed to BigQuery tables with incorrect structure
          // so we've had to add the 2 "suffix" for the fields in BQ
          // The views, however, expose them as they should be, e.g. metrics.url
          // See: github.com/mozilla/glean-dictionary/issues/1450
          if (["url2", "text2", "jwe2", "labeled_rate2"].includes(field.name)) {
            [field.name] = field.name.split("2"); // eslint-disable-line no-param-reassign
          }
          return addVisibility(modifiedNodeField, parentNames);
        });
      }
      modifiedNode.visible =
        filterTerms.length === 0 ||
        filterTerms.every(
          (term) =>
            parentNames.some((val) => val.includes(term)) ||
            modifiedNode.name.includes(term)
        );
      modifiedNode.childrenVisible = modifiedNode.fields
        ? modifiedNode.fields.some(
            (child) => child.visible || child.childrenVisible
          )
        : undefined;
      return modifiedNode;
    };

    nodesWithVisibility = nodes.map((node) => addVisibility(node), filterTerms);
  }
</script>

<div class="schema-viewer">
  <FilterInput />
  <div class="schema-browser">
    <p>
      {#each nodesWithVisibility as node}
        <SchemaNode {app} {node} />
      {/each}
    </p>
  </div>
</div>

<style lang="scss">
  .schema-viewer {
    margin-top: 2rem;
    .schema-browser {
      padding: $spacing-sm;
      border: 0.25rem solid $color-light-gray-60;
      max-height: 400px;
      overflow: scroll;
      margin-left: auto;
      margin-right: auto;
    }
  }
</style>
