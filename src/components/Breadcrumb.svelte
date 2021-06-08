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
        <span>{links.indexOf(link) === links.length - 1 ? "" : "->"}</span>
      </li>
    {/each}
  </ol>
  {#if links[1] && isPlatform(links[1].name)}
    <img src={getPlatformLogo(links[1].name)} alt="Platform Logo" />{/if}
</div>

<style>
  .breadcrumb {
    display: flex;
    margin-left: $spacing-xl;
    img {
      margin-left: 5px;
      margin-bottom: 10px;
      width: 27px;
      height: auto;
      object-fit: contain;
    }
    ol {
      display: flex;
      margin-top: 10px;
      li {
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
