<script>
  export let links;
  const isPlatform = (app) => {
    const platforms = ["ios", "android", "fenix", "amazon", "echo", "fire_tv"];
    const match = platforms.filter((item) => app.includes(item));
    if (match.length) return true;
    return false;
  };
  const getPlatformLogo = (app) => {
    if (app.includes("ios")) return "/img/app-logos/apple-breadcrumb.png";
    if (app.includes("fenix") || app.includes("android"))
      return "/img/app-logos/android-breadcrumb.png";
    if (
      app.includes("amazon") ||
      app.includes("echo") ||
      app.includes("fire_tv")
    )
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
      {#if link && isPlatform(link.name)}
        <img src={getPlatformLogo(link.name)} alt="Platform Logo" />{/if}
      <span>{links.indexOf(link) === links.length - 1 ? "" : "->"}</span>
    {/each}
  </ol>
</div>

<style>
  .breadcrumb {
    display: flex;
    padding-left: $spacing-xl;
    top: 0;
    position: sticky;
    background: $color-light-gray-10;
    box-shadow: 1px 1px 1px rgba($color-black, 0.1);
    z-index: 1000;
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
      padding-top: $spacing-md;
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