<script>
  import { some } from "lodash";

  export let links;

  const isPlatform = (link) =>
    some(
      ["iOS", "Android", "Amazon"],
      (platformTag) => link.tags && link.tags.includes(platformTag)
    );

  const getPlatformLogo = (link) => {
    if (link.tags.includes("iOS")) return "/img/app-logos/apple-breadcrumb.png";
    if (link.tags.includes("Android"))
      return "/img/app-logos/android-breadcrumb.png";
    if (link.tags.includes("Amazon"))
      return "/img/app-logos/amazon-breadcrumb.png";
    return undefined;
  };
</script>

<div class="breadcrumb">
  <ol>
    {#each links as link}
      <li>
        <a class="link-name" href={link.url}>{link.name} </a>
      </li>
      {#if isPlatform(link)}
        <img src={getPlatformLogo(link)} alt="Platform Logo" />{/if}
      <span>{links.indexOf(link) === links.length - 1 ? "" : "->"}</span>
    {/each}
  </ol>
</div>

<style lang="scss">
  .breadcrumb {
    display: flex;
    margin-left: $spacing-xl;
    img {
      padding-left: 5px;
      margin-top: -2px;
      width: 24px;
      height: auto;
      object-fit: contain;
    }
    ol {
      display: flex;
      margin: 0 0 0.75em;
      li,
      span {
        @include text-title-3xs;
        font-weight: bold;
        padding-left: $spacing-sm;

        .link-name {
          text-decoration: none;
        }
        span {
          color: $color-dark-gray-10;
        }
      }
    }
  }
</style>
