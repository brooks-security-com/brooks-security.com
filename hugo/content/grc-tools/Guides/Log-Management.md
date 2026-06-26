# Log Management Tools

## What problem this solves

Every system generates logs. Servers log who logged in. Applications log errors. Firewalls log blocked connections. When something breaks or someone breaks in, logs tell you what happened. Without centralized log management, you are logging into individual servers and grepping text files while an incident unfolds.

A log management tool collects logs from all your systems into one place, lets you search across everything at once, and sends alerts when it sees something wrong.

## Do you actually need this

If you have more than one server, yes. If you have customer data, yes. If you need SOC 2 or ISO 27001, yes - auditors will ask where your logs go and how long you keep them.

If you are a solo founder running on a single cloud instance and have no compliance requirements, your cloud provider's built-in log viewer may be enough for now.

## Options by budget tier

### Free / Open Source (under $50/month infrastructure)

**OpenObserve**
- Self-hosted, columnar storage keeps disk usage low
- Handles logs, metrics, and traces in one platform
- Alerting engine included, can send to Slack, email, webhooks
- Good fit: 1-50 employees, 1-50 servers, someone comfortable with Docker
- Rough infra cost: $20-100/month for a modest deployment
- Weak spot: Smaller community than Elastic. Fewer pre-built dashboards.

**Grafana Loki + Grafana**
- Designed to be cheap to run by indexing only metadata, not full log text
- Integrates naturally with Grafana dashboards if you already use them
- Good fit: Teams already on Grafana for metrics
- Weak spot: Query language is less intuitive than full-text search. No built-in alerting without Grafana Alerting.

**Graylog (open source edition)**
- Mature platform, straightforward web interface
- Good fit: Small teams that want a traditional log management feel without Splunk pricing
- Weak spot: Java-based, can be memory-hungry. Enterprise features require paid license.

### Moderate Cost ($100-500/month)

**Elasticsearch + Kibana (self-managed)**
- The most widely deployed log platform. Massive ecosystem.
- Powerful query language, extensive pre-built integrations via Beats agents
- Good fit: Organizations with existing Elasticsearch expertise or complex search needs
- Infrastructure cost: $100-500/month depending on log volume
- Weak spot: Resource-intensive. Tuning for performance takes skill. The free tier's security features are limited.

**OpenObserve (cloud-hosted)**
- Same tool as the free tier but someone else runs the servers
- Good fit: Teams that want OpenObserve without the infrastructure burden
- Weak spot: Smaller company, less enterprise track record than Splunk or Datadog

### Enterprise ($500+/month)

**Splunk**
- The incumbent. Every security team knows it. Massive app ecosystem.
- Pricing: Ingest-based licensing. Costs scale directly with log volume. A moderately busy environment can hit $2,000-5,000/month quickly.
- Good fit: Organizations with compliance requirements and budget. Teams that need extensive pre-built compliance dashboards.
- Weak spot: Price. Splunk is the most expensive option in this category by a wide margin. Many organizations adopt it and then spend years trying to control the bill.

**Datadog Log Management**
- Tight integration with Datadog's infrastructure monitoring and APM
- Pricing: Per-GB ingested, plus per-host infrastructure monitoring cost
- Good fit: Teams already paying for Datadog infrastructure monitoring
- Weak spot: Log costs can surprise you if you are not aggressive about filtering. Debug logs at scale will generate a four-figure bill.

**Sumo Logic**
- Cloud-native, strong search performance at scale
- Pricing: Ingest-based tiers
- Good fit: Mid-to-large orgs that want a Splunk alternative with better cost predictability
- Weak spot: Less third-party integration ecosystem than Splunk

## How to evaluate

Test these things before committing to a platform:

1. **Ship your actual logs to it for a week.** Not a demo dataset - your real application logs, at real volume. Most platforms look great with sample data and fall apart with real data.

2. **Run the queries you will actually need.** "Show me all failed SSH logins in the last 24 hours." "Show me every time this specific user accessed customer data." If these queries are slow or hard to write, the platform will not get used.

3. **Test the alerting.** Create an alert for a known bad pattern. Does it fire within a reasonable window? Can you route it to the right channel? Can you acknowledge it?

4. **Check retention costs.** Your logging policy says you keep logs for 90 days. What does 90 days of your actual log volume cost on this platform? Many vendors charge steeply for data beyond the hot tier.

5. **Verify RBAC works.** Can you give read-only access to developers without giving them admin? Can you restrict access to specific log streams?

## Common mistakes

**Logging everything at DEBUG level and shipping it all.** Most of your log volume is noise. Ship INFO and above to your centralized platform. Keep DEBUG logs on the server, rotated quickly. This alone cuts most log bills in half.

**Buying Splunk because it is what everyone uses.** Splunk is a good product. It is also the most expensive option by a factor of 5-10x for equivalent volume. If your budget is under $1,000/month, start with OpenObserve or Loki.

**Not testing retention costs before signing.** A vendor demo shows 7 days of logs. Your policy requires 90. Ask for pricing on 90 days of retention at your projected volume during the POC, not after signing the contract.

**Forgetting about log collection infrastructure.** The log platform stores and searches logs. Something has to ship logs from your servers to the platform. Factor in the cost and complexity of deploying and maintaining collection agents (Vector, Fluentd, OpenTelemetry Collector, vendor-specific agents).

**Using the cloud provider's built-in log tool and calling it done.** AWS CloudWatch, Google Cloud Logging, and Azure Monitor can all serve as log platforms. They are convenient because they require no additional setup. They are also expensive at scale and clunky to query compared to purpose-built log tools. Many organizations start here and migrate later. The migration is painful. If you have more than a handful of services, skip the built-in tools and go straight to a dedicated platform.
