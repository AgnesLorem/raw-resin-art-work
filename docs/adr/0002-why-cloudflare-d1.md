# ADR 0002: Adopting Cloudflare D1

## Status
Accepted

## Date
2026-07-14

## Owner
Lead Software Architect

## Context
The checkout system requires a database to store customer records, items, payments history, and transaction statuses.

## Problem
Running external relational databases (e.g. AWS RDS PostgreSQL) introduces VPC configuration complexity, network routing latency between the edge and the database node, and high database licensing costs.

## Alternatives Considered
- Cloudflare KV (Key-Value Store)
- Remote Supabase PostgreSQL database
- PlanetScale MySQL database

## Decision
Adopt Cloudflare D1 as the edge-native SQL database.

## Trade-offs & Consequences
- **Positive**:
  - Zero-latency database access directly from edge Pages Functions.
  - Standard SQL relational integrity rules (foreign keys, check constraints).
  - Built-in Time Travel point-in-time recovery.
- **Negative**:
  - D1 is a serverless SQLite dialect; it does not support full Postgres/MySQL compatibility and has strict read/write concurrency limits under massive transactional volumes.

---

## References
- [ADR Index](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/adr/README.md)
