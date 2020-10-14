<script>
  import SchemaNode from "./SchemaNode.svelte";
  import FilterInput from "./FilterInput.svelte";

  export let app;
  export let nodes = [];
  let nodesWithVisibility;
  const filterTextChanged = (filterText = "") => {
    const filterTerms = filterText
      .trim()
      .split(" ")
      .filter((t) => t.length > 0);

    const addVisibility = (node, parentNodeNames = ["__root__"]) => {
      let modifiedNode = node;
      let parentNames = [...parentNodeNames];

      if (modifiedNode.fields) {
        parentNames = modifiedNode.parentNames
          ? `${modifiedNode.parentNames}.${modifiedNode.name}`
          : modifiedNode.name;

        modifiedNode.fields.forEach((field) => {
          let modifiedNodeField = field;
          modifiedNodeField["parentNames"] = parentNames;
          return addVisibility(modifiedNodeField, parentNames);
        });
      }
      modifiedNode.visible =
        filterTerms.length === 0 ||
        filterTerms.every((term) =>
          modifiedNode.parentNames
            ? modifiedNode.parentNames.includes(term) ||
              modifiedNode.name.includes(term)
            : modifiedNode.name.includes(term)
        );
      modifiedNode.childrenVisible = modifiedNode.fields
        ? modifiedNode.fields.some(
            (child) => child.visible || child.childrenVisible
          )
        : undefined;
      return modifiedNode;
    };

    nodesWithVisibility = nodes.map((node) => addVisibility(node), filterTerms);
  };

  filterTextChanged();
</script>

<style>
  .schema-browser {
    @apply p-2;
    @apply border-4;
    @apply border-gray-400;
    max-height: 400px;
    overflow: scroll;
  }
</style>

<h2>Schema</h2>
<FilterInput onChangeText={filterTextChanged} />
<div class="container schema-browser mx-auto">
  <p>
    {#each nodesWithVisibility as node}
      <SchemaNode {app} {node} />
    {/each}
  </p>
</div>
