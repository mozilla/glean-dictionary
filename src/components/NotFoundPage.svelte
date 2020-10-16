<script>
    import AppDetail from "../pages/AppDetail.svelte";
    import AppList from "../pages/AppList.svelte";
    import PingDetail from "../pages/PingDetail.svelte";
    import MetricDetail from "../pages/MetricDetail.svelte";
    import TableDetail from "../pages/TableDetail.svelte";

 let app = new App({
    target: document.body,
    props: {
        app: AppDetail,
        list: AppList,
        ping: PingDetail,
        metric: MetricDetail,
        table: TableDetail,
    }
})

</script>

<style>
    h2 {
        color: lightgray;
        font: italic;
    }

</style>

<h1>Sorry!</h1>
<h2>Could not find {app.props} {app.props.name}.</h2>