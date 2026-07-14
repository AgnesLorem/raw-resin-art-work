# ADR 0005: Adopting Preview/Production Database Separation

## Status
Accepted

## Date
2026-07-14

## Owner
Lead Software Architect

## Context
Deploying testing updates, running validation scripts, and testing schema migrations directly on the production database runs the risk of corrupting customer transaction records.

## Problem
Allowing shared access or cross-environment bindings violates least-privilege principles and introduces security exposure vectors.

## Alternatives Considered
- Shared database namespace with prefix filters (e.g. `test_` tables)
- Single database with local mock mocks

## Decision
Enforce complete separation of environments by binding distinct preview and production D1 database instances (`raw-db-preview` vs `raw-db-prod`) inside `wrangler.jsonc`.

## Trade-offs & Consequences
- **Positive**:
  - Zero risk of cross-environment data contamination or accidental deletion.
  - Ability to safely run migration test scripts against real edge nodes.
  - Complete isolation of API and webhook credentials.
- **Negative**:
  - Increased maintenance overhead to synchronize migrations across multiple environments.

---

## References
- [ADR Index](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/adr/README.md)
