<script>
  import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
  import AppAlert from "../components/AppAlert.svelte";
</script>

<Meta
  title="Example/AppAlert"
  component={AppAlert}
  argTypes={{
    status: { control: "text" },
  }}
/>


<Template let:args>
  <AppAlert {...args} />
</Template>

<Story
  name="Success"
  args={{
    status: "success",
    message: "Yay, succesful alert!"
  }}
/>

<Story
  name="Error"
  args={{
    status: "error",
    message: "Oh no, error alert, something's gone wrong :(",
  }}
/>

<Story
  name="Warning"
  args={{
    status: "warning",
    message: "This is a warning alert: are you sure you want to continue?"
  }}
/>


