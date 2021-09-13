<script>
  import tippy from "./tippy";

  export let text;
  export let description;
  export let labelNumber;
  export let clickable = false;

  // gray color if it's a deprecated/expired/removed label
  if (text === "deprecated" || text === "expired" || text === "removed") {
    labelNumber = 9;
  }

  const a1z26Decoder = (string) => {
    let num = 0;
    for (let i = 0; i < string.length; i += 1) {
      num += string.charCodeAt(i);
    }
    return num;
  };

  const getLabelNumber = (word) => a1z26Decoder(word) % 10;
</script>

<span
  class="label label-{labelNumber || getLabelNumber(text)} {clickable
    ? 'clickable'
    : ''}"
  on:click
  use:tippy={description && {
    content: description,
    allowHTML: true,
    placement: "top",
  }}>{text}</span
>

<style lang="scss">
  // to choose a specific label color in this palette, use $labelNumber variable, otherwise it will be automatically generated
  $color-palette-light: (
    "0": #eeaaff,
    "1": #77aadd,
    "2": #99ddff,
    "3": #44bb99,
    "4": #bbcc33,
    "5": #aaa000,
    "6": #eedd88,
    "7": #ee8866,
    "8": #ffaabb,
    "9": #dddddd,
  );

  @function set-text-color($color) {
    // generate darker text color if background is light
    @if (lightness($color) > 30) {
      @return #000000;
    } @else {
      // and vice versa: if dark background => light text
      @return #ffffff;
    }
  }

  @mixin generateLabelColor($label-number) {
    $label-color-str: map-get($color-palette-light, $label-number);
    .label-#{$label-number} {
      background-color: $label-color-str;
      color: set-text-color($label-color-str);
    }
  }

  .label {
    padding: 0;
    margin: 0.125em;
    display: inline-block;
    line-height: 20px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 2em;
    background: silver;
    padding: 0 9px;
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
    cursor: default;
  }

  @each $label-number in ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9") {
    @include generateLabelColor($label-number);
  }

  .clickable {
    cursor: pointer;
  }
</style>
