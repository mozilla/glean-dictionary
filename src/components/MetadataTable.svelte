<script>
  import { isNull, isUndefined } from "lodash";
  import { parseInline } from "marked";
  import HelpHoverable from "./HelpHoverable.svelte";

  export let appName = "";
  export let schema = [];
  export let item = {};

  function format(ref, formatter) {
    return formatter ? formatter(ref, appName) : ref;
  }
</script>

<table>
  <col />
  <col />
  {#each schema as schemaEntry}
    {#if !isUndefined(item[schemaEntry.id]) && (!isNull(item[schemaEntry.id]) || schemaEntry.displayNull)}
      <tr>
        <td>
          {schemaEntry.title}
          {#if schemaEntry.helpText}
            <HelpHoverable
              content={schemaEntry.helpText}
              link={schemaEntry.helpLink}
            />
          {/if}
        </td>
        <td>
          {#if schemaEntry.type === "link"}
            <a href={format(item[schemaEntry.id], schemaEntry.linkFormatter)}>
              {#if isUndefined(format(item[schemaEntry.id], schemaEntry.linkFormatter))}
                <em
                  >Unavailable: no search index specified for this application.</em
                >
              {:else}
                {format(item[schemaEntry.id], schemaEntry.valueFormatter)}
              {/if}
            </a>
          {:else if schemaEntry.type === "links"}
            {#each item[schemaEntry.id] as ref}
              <div>
                <a href={format(ref, schemaEntry.linkFormatter)}
                  >{format(ref, schemaEntry.valueFormatter)}</a
                >
              </div>
            {/each}
          {:else if schemaEntry.type === "markdown"}
            {@html parseInline(
              format(item[schemaEntry.id], schemaEntry.valueFormatter)
            )}
          {:else if schemaEntry.type === "list"}
            <ul>
              {#each item[schemaEntry.id] as ref}
                <li>{format(ref, schemaEntry.valueFormatter)}</li>
              {/each}
            </ul>
          {:else}{format(item[schemaEntry.id], schemaEntry.valueFormatter)}{/if}
        </td>
      </tr>
    {/if}
  {/each}
  <slot />
</table>

<style lang="scss">
  @import "../main.scss";
  @include metadata-table;
</style>
