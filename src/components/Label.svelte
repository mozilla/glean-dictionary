<script>
  export let text;
  export let labelNumber;
  export let clickable = false;

  // gray color if it's a deprecated/expired label
  if (text === "deprecated" || text === "expired") {
    labelNumber = 9;
  }

  const a1z26Decoder = (string) => {
    let num = 0;
    for (let i = 0; i < string.length; i += 1) {
      num += string.charCodeAt(i);
    }
    return num;
  };

  const digitSum = (number) => {
    let sum = 0;
    let num = number;
    while (num % 10 !== 0) {
      sum += Math.floor(num % 10);
      num /= 10;
      if (num === 0 && sum >= 10) {
        num = sum;
        sum = 0;
      }
    }
    return sum;
  };
  const getLabelNumber = (word) => digitSum(a1z26Decoder(word));
</script>

<span
  class="label label-{labelNumber || getLabelNumber(text)} {clickable
    ? 'clickable'
    : ''}"
  on:click>{text}</span
>

<style lang="scss">
  // to choose a specific label color in this palette, use $labelNumber variable, otherwise it will be automatically generated
  $color-palette-light: (
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
    @if (lightness($color) > 40) {
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
    display: inline-block;
    line-height: 20px;
    font-size: 14px;
    font-weight: 600;
    border-radius: $spacing-sm;
    background: silver;
    padding: 0 5px;
    box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.12);
  }

  @each $label-number in ("1", "2", "3", "4", "5", "6", "7", "8", "9") {
    @include generateLabelColor($label-number);
  }

  .clickable {
    cursor: pointer;
  }
</style>
