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
      let allParentNames = [...parentNodeNames];
      let { name, parentNames, fields } = modifiedNode;

      if (fields) {
        allParentNames = parentNames ? `${parentNames}.${name}` : name;

        fields.forEach((field) => {
          let modifiedNodeField = field;
          const parentNameArr = [];

          modifiedNodeField.parentNames = allParentNames;
          parentNameArr.push(`${allParentNames}.${modifiedNodeField.name}`);

          return addVisibility(modifiedNodeField, parentNameArr);
        });
      }
      modifiedNode.visible =
        filterTerms.length === 0 ||
        filterTerms.every((term) =>
          parentNames
            ? parentNames.includes(term) || name.includes(term)
            : name.includes(term)
        );
      modifiedNode.childrenVisible = fields
        ? fields.some((child) => child.visible || child.childrenVisible)
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
