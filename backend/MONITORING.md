# Monitoring Guide - Daily English Article Backend

This guide explains how to set up and use the monitoring stack with Prometheus and Grafana for the Daily English Article backend application.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Available Metrics](#available-metrics)
5. [Grafana Dashboards](#grafana-dashboards)
6. [Custom Metrics](#custom-metrics)
7. [Alerting](#alerting)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The monitoring stack consists of:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **prom-client**: Node.js client for Prometheus metrics

All metrics are exposed via the `/metrics` endpoint in the NestJS application.

---

## Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────┐
│   NestJS App    │────────>│  Prometheus  │<────────│   Grafana   │
│                 │ metrics │              │ query   │             │
│  /metrics endpoint│       │              │────────>│ Dashboard   │
└─────────────────┘         └──────────────┘         └─────────────┘
```

---

## Quick Start

### 1. Start with Monitoring Stack

To start the application with monitoring enabled:

```bash
docker compose --profile with-monitoring up -d
```

This will start:
- MongoDB (port 27017)
- NestJS App (port 3000)
- Prometheus (port 9090)
- Grafana (port 3001)

### 2. Access Services

- **Application**: http://localhost:3000
- **Metrics**: http://localhost:3000/metrics
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001

### 3. Login to Grafana

Default credentials:
- Username: `admin`
- Password: `admin`

**Important**: Change the default password after first login!

### 4. View Dashboard

1. Open Grafana at http://localhost:3001
2. Navigate to Dashboards → Browse
3. Select "Daily English Article - Backend Metrics"

---

## Available Metrics

### HTTP Metrics

- `http_requests_total`: Total number of HTTP requests
  - Labels: `method`, `route`, `status_code`

- `http_request_duration_seconds`: Duration of HTTP requests
  - Labels: `method`, `route`, `status_code`
  - Buckets: 5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s

- `http_requests_in_progress`: Current number of requests in progress
  - Labels: `method`, `route`

### Business Metrics

- `articles_served_total`: Total articles served to users
  - Labels: `domain`, `difficulty`

- `reading_sessions_created_total`: Reading sessions created

- `reading_sessions_completed_total`: Reading sessions completed
  - Labels: `status` (completed, abandoned)

- `user_outputs_submitted_total`: User outputs submitted

- `ai_feedbacks_generated_total`: AI feedbacks generated

- `memory_items_created_total`: Memory items created
  - Labels: `type` (sentencePattern, concept, expression)

### LLM Metrics

- `llm_api_calls_total`: LLM API calls made
  - Labels: `provider`, `agent_type`

- `llm_api_errors_total`: LLM API errors
  - Labels: `provider`, `agent_type`, `error_type`

### User Metrics

- `active_users_total`: Number of currently active users

- `user_registrations_total`: Total user registrations

### Database Metrics

- `database_query_duration_seconds`: Database query duration
  - Labels: `operation`, `collection`

- `database_connections_total`: Active database connections

---

## Grafana Dashboards

### Pre-built Dashboard

The application includes a pre-configured dashboard with the following panels:

1. **HTTP Request Rate**: Requests per second by endpoint
2. **Request Duration (p95)**: 95th percentile response time
3. **Reading Sessions**: Created vs completed sessions
4. **LLM API Calls**: API calls by provider and agent
5. **Memory Items Created**: Memory items by type

### Custom Dashboards

To create a custom dashboard:

1. Go to Dashboards → New Dashboard
2. Add a new panel
3. Select "Prometheus" as data source
4. Write your PromQL query (see examples below)

---

## Custom Metrics

### Adding Metrics to Services

You can inject the `MetricsService` into any service:

```typescript
import { Injectable } from '@nestjs/common';
import { MetricsService } from '../common/metrics/metrics.service';

@Injectable()
export class ArticlesService {
  constructor(private metricsService: MetricsService) {}

  async getTodayArticle(userId: string) {
    // Your business logic

    // Record metric
    this.metricsService.incrementArticlesServed('AI', 'intermediate');

    return article;
  }
}
```

### Example PromQL Queries

**Average request duration by endpoint:**
```promql
rate(http_request_duration_seconds_sum[5m])
  / rate(http_request_duration_seconds_count[5m])
```

**Error rate:**
```promql
sum(rate(http_requests_total{status_code=~"5.."}[5m]))
  / sum(rate(http_requests_total[5m]))
```

**Requests per minute:**
```promql
sum by (route) (rate(http_requests_total[1m]))
```

**Active reading sessions in last hour:**
```promql
increase(reading_sessions_created_total[1h])
  - increase(reading_sessions_completed_total[1h])
```

**LLM success rate:**
```promql
sum(llm_api_calls_total) / (sum(llm_api_calls_total) + sum(llm_api_errors_total))
```

---

## Alerting

### Setting Up Alerts in Prometheus

Edit `prometheus.yml` to add alerting rules:

```yaml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "p95 response time is {{ $value }} seconds"
```

### Viewing Alerts

1. Open Prometheus: http://localhost:9090
2. Navigate to Alerts
3. View active and pending alerts

### Configuring Grafana Alerts

1. Open a dashboard panel
2. Click the alert icon (bell)
3. Set alert conditions
4. Configure notifications (email, Slack, etc.)

---

## Troubleshooting

### Issue: Metrics endpoint returns 404

**Solution**: Ensure metrics middleware is properly applied in `main.ts`:

```typescript
const metricsMiddleware = app.select(AppModule).get(MetricsMiddleware);
app.use(metricsMiddleware.use.bind(metricsMiddleware));
```

### Issue: Prometheus shows "up" but no targets

**Solution**: Check that `/metrics` endpoint is accessible:

```bash
curl http://localhost:3000/metrics
```

### Issue: Grafana cannot connect to Prometheus

**Solution**: Verify datasource configuration in Grafana:
1. Go to Configuration → Data Sources
2. Select Prometheus
3. Ensure URL is: `http://prometheus:9090`

### Issue: Dashboard shows "No data"

**Possible causes**:
1. Prometheus hasn't scraped metrics yet (wait 1-2 minutes)
2. Application isn't receiving traffic
3. Time range is too narrow (try "Last 5 minutes")

### Issue: High memory usage

**Solution**: Reduce data retention in `prometheus.yml`:

```yaml
command:
  - '--storage.tsdb.retention.time=15d'  # Keep 15 days instead of default
```

---

## Performance Tuning

### Prometheus Scraping Interval

Adjust in `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'nestjs-backend'
    scrape_interval: 30s  # Default is 15s
    scrape_timeout: 10s
```

### Metrics Cardinality

Be careful with high-cardinality labels (e.g., user IDs):

```typescript
// ❌ BAD - High cardinality
this.metricsService.incrementHttpRequests(userId);

// ✅ GOOD - Low cardinality
this.metricsService.incrementHttpRequests('user');
```

### Data Retention

Reduce disk usage by adjusting retention:

```yaml
command:
  - '--storage.tsdb.retention.time=30d'  # Keep 30 days
  - '--storage.tsdb.retention.size=10GB'  # Max 10GB
```

---

## Production Deployment

### Security Best Practices

1. **Change Default Credentials**:
   ```bash
   # Update .env
   GRAFANA_ADMIN_PASSWORD=your_secure_password
   ```

2. **Enable Authentication**:
   - Use reverse proxy with SSL
   - Enable basic auth on Prometheus

3. **Firewall Rules**:
   ```bash
   # Only expose Grafana publicly
   ufw allow 3001/tcp
   # Keep Prometheus internal only
   ```

4. **Backup Configurations**:
   ```bash
   # Backup Prometheus data
   docker exec prometheus tar -czf /tmp/prometheus-backup.tar.gz /prometheus
   docker cp prometheus:/tmp/prometheus-backup.tar.gz ./backups/
   ```

### Scaling Considerations

For high-traffic applications:

1. **Use Remote Write**: Send metrics to remote Prometheus instance
2. **Add Alertmanager**: Centralized alert management
3. **Implement Recording Rules**: Pre-compute expensive queries
4. **Consider Thanos**: For long-term storage and HA

---

## Maintenance

### Updating Prometheus Configuration

```bash
# Reload Prometheus without restart
docker exec prometheus kill -HUP 1
```

### Backing Up Grafana Dashboards

```bash
# Export all dashboards
curl -u admin:admin http://localhost:3001/api/search?query= | \
  jq -r '.[] | .uid' | \
  while read uid; do
    curl -u admin:admin \
      "http://localhost:3001/api/dashboards/uid/$uid" | \
      jq > "dashboard-$uid.json"
  done
```

### Cleaning Up Old Data

```bash
# Remove old Prometheus data
docker compose down
docker volume rm backend_prometheus_data
docker compose --profile with-monitoring up -d
```

---

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [prom-client Documentation](https://github.com/siimon/prom-client)
- [PromQL Query Examples](https://promlabs.com/promql-cheat-sheet/)

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/xiaxianlin/daily-english-article/issues
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001
