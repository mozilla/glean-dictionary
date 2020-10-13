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

    const addVisibility = (node, parentNodeNames) => {
      let modifiedNode = node;
      const parentNames =
        parentNodeNames.length > 0 ? [...parentNodeNames] : [];

      if (modifiedNode.fields) {
        if (parentNames.length > 0) {
          parentNames.push(`${parentNames.slice(-1)}.${modifiedNode.name}`);
        } else {
          parentNames.push(`${modifiedNode.name}`);
        }

        modifiedNode.fields.forEach((field) => {
          let modifiedNodeField = field;
          modifiedNodeField.parentNames = parentNames;
          return addVisibility(modifiedNodeField, parentNames);
        });
      }
      modifiedNode.visible =
        filterTerms.length === 0 ||
        filterTerms.every((term) =>
          modifiedNode.parentNames && modifiedNode.parentNames.length > 0
            ? modifiedNode.parentNames.some((val) => val.includes(term)) ||
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

    nodesWithVisibility = nodes.map(addVisibility, filterTerms);
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
