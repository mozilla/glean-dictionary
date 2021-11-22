<script>
  import Label from "../src/components/Label.svelte";
</script>

<h4>Color Palette</h4>
<p>
  By default, the label color is generated from the label text, but you can
  choose a specific color from the below palette by setting a <code
    >labelNumber</code
  > variable.
</p>
<Label labelNumber="0" text="label-0" />
<Label labelNumber="1" text="label-1" />
<Label labelNumber="2" text="label-2" />
<Label labelNumber="3" text="label-3" />
<Label labelNumber="4" text="label-4" />
<Label labelNumber="5" text="label-5" />
<Label labelNumber="6" text="label-6" />
<Label labelNumber="7" text="label-7" />
<Label labelNumber="8" text="label-8" />
<Label labelNumber="9" text="label-9" />

<br />
<br />

<h4>Labels with description (hover over)</h4>
<Label text="Descriptive" description="A description" />
<Label
  text="Descriptive markdown"
  description="A description with *markdown*"
/>

<br />
<br />

<h4>Glean labels</h4>
<Label text="glean-core" />
<Label text="glean-android" />
<Label text="sync" />
<Label text="lib-crash" />
<Label text="engine-gecko" />
<Label text="support-migration" />
<Label text="nimbus" />
<Label text="logins-store" />

<br />
<br />
<h4>Deprecated/Expired status</h4>
<Label text="deprecated" />
<Label text="expired" />
