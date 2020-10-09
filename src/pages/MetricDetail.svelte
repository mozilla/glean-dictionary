<script>
  import { getMetricData } from "../state/api";

  export let params;

  const metricDataPromise = getMetricData(params.app, params.metric);
</script>

{#await metricDataPromise then metric}
  <h1>{metric.name}</h1>
  <h2>{metric.description}</h2>
  <div />
  <section id="metric-detail-view">
    <div>
      <footer>
        <div>
          <div>
            <dl>
              <dt>
                relevant bugs :
                {#each metric.bugs as bug, i}
                  {#if ('' + bug).indexOf('http') > -1}
                    <a href={bug} title={bug} target="_blank"> {i + 1} </a>
                  {:else}<span>{bug}</span>{/if}
                {/each}
              </dt>
            </dl>
            <dl>
              <dt>send in pings : {metric.send_in_pings.join(', ')}</dt>
            </dl>
            {#if metric.lifetime}
              <dl>
                <dt>
                  <a
                    href="https://mozilla.github.io/glean/book/user/adding-new-metrics.html?highlight=lifetime#when-should-glean-automatically-clear-the-measurement"
                    target="_blank">
                    lifetime
                  </a>
                  {metric.lifetime}
                </dt>
              </dl>
            {/if}
            {#if metric.time_unit}
              <dl>
                <dt>
                  <a
                    href="https://mozilla.github.io/glean/book/user/metrics/timing_distribution.html"
                    target="_blank">
                    time unit
                  </a>
                  {metric.time_unit}
                </dt>
              </dl>
            {/if}
            {#if metric.bucket_count}
              <dl>
                <dt>bucket count : {metric.bucket_count}</dt>
              </dl>
            {/if}
            {#if metric.histogram_type}
              <dl>
                <dt>histogram type : {metric.histogram_type}</dt>
              </dl>
            {/if}
            {#if metric.unit}
              <dl>
                <dt>unit : {metric.unit}</dt>
              </dl>
            {/if}
            {#if metric.range_min !== undefined}
              <dl>
                <dt>range minimum</dt>
                <dd>{metric.range_min}</dd>
              </dl>
            {/if}
            {#if metric.range_max !== undefined}
              <dl>
                <dt>range maximum</dt>
                <dd>{metric.range_max}</dd>
              </dl>
            {/if}
            <dl>
              <dt>disabled : {metric.disabled}</dt>
            </dl>
            {#if metric.data_reviews && metric.data_reviews.length}
              <dl>
                <dt>
                  data reviews
                  {#each metric.data_reviews as rev, i}
                    {#if ('' + rev).indexOf('http') > -1}
                      <a href={rev} title={rev} target="_blank"> {i + 1} </a>
                    {:else}<span>{rev}</span>{/if}
                  {/each}
                </dt>
              </dl>
            {/if}
            {#if metric.no_lint && metric.no_lint.length}
              <dl>
                <dt>no_lint : {metric.no_lint.join(', ')}</dt>
              </dl>
            {/if}
            {#if metric.labels && metric.labels.length}
              <dl>
                <dt>labels : {metric.labels.join(', ')}</dt>
              </dl>
            {/if}
            {#if metric.version || metric.version === 0}
              <dl>
                <dt>version : {metric.version}</dt>
              </dl>
            {/if}
          </div>
        </div>
      </footer>
    </div>
  </section>
{/await}
