# Non-Functional Requirements (NFR)

## Purpose
This document consolidates all non-functional requirements (NFRs) for the Resin Art Work payment integration site, ensuring performance, availability, and recovery criteria match production standards.

## Scope
Defines constraints on latency, availability, load scalability, disaster recovery windows, caching policies, and performance budgets.

## Assumptions
- Operations utilize Cloudflare edge network nodes.
- High traffic volumes do not exceed 5000 concurrent active users.

## Core Non-Functional Requirements

### 1. Availability
- **Target**: `99.9%` uptime over a 30-day billing period.
- **Operational Baseline**: `99.5%` uptime.
- **Downtime Limit**: Maximum 43 minutes of unplanned downtime per month.

### 2. Performance & Latency Budgets
- **LCP (Largest Contentful Paint)**: `< 2.5s` on mobile devices.
- **TTFB (Time to First Byte)**: `< 100ms`.
- **API Latency**: P95 Create API latency `< 500ms`, P95 Status API latency `< 200ms` (excluding external PayOS processing).

### 3. Reliability & Scalability
- **Capacity**: Target capacity of 1000 concurrent checkout users with D1 database batch updates.
- **Error Rates**: API error rates (`5xx`) must not exceed `1%` of total daily transactions.

### 4. Recoverability (RTO & RPO)
- **RTO (Recovery Time Objective)**: Maximum recovery time under 15 minutes.
- **RPO (Recovery Point Objective)**: Maximum data loss window of 1 minute (achieved via D1 Time Travel point-in-time recovery bookmarks).

### 5. Security & Privacy compliance
- **Data classification**: Strict masking policies for Restricted PII logs.
- **Encryption**: Enforce TLS 1.2 minimum / TLS 1.3 preferred. AES-256 for D1 at-rest data.

## Verification
NFR parameters are verified during load testing sessions using k6 or Artillery, and measured continuously in production dashboards.

## Maintenance
Maintained by the Staff Site Reliability Engineer (SRE). Reviewed every 6 months.

---

## References
- [Implementation Plan (v1.0)](file:///C:/Users/lorem/.gemini/antigravity/brain/843d26ba-b5cc-43fe-bb2f-6ba54c7b4bd9/implementation_plan.md)
- [Alert Policy](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/monitoring/alert-policy.md)
