<script>
    import marked from "marked";
    export let app;
    export let name;
    export let description = "";
</script>

<li>
    <a href={`/apps/${app}/pings/${name}`}>{name}</a>
    {@html marked(description)}
</li>