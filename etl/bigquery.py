import stringcase


def get_bigquery_ping_table_name(dataset_name, ping_name):
    ping_name_snakecase = stringcase.snakecase(ping_name)
    return f"{dataset_name}.{ping_name_snakecase}"


def get_bigquery_column_name(metric):
    metric_type = metric.definition["type"]
    metric_name_snakecase = stringcase.snakecase(metric.identifier)
    return (
        f"{metric.bq_prefix}.{metric_name_snakecase}"
        if metric.bq_prefix
        else f"metrics.{metric_type}.{metric_name_snakecase}"
    )
