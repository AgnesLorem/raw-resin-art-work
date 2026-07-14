# ADR 0004: Adopting Wrangler IaC

## Status
Accepted

## Date
2026-07-14

## Owner
Lead Software Architect

## Context
Deploying databases, workers, and domain configurations manually via the dashboard UI introduces configuration drift and lack of reproducibility.

## Problem
Complex IaC tools like Terraform require state storage and credentials setup that are overly complex for the scale of this project.

## Alternatives Considered
- Terraform Cloudflare Provider
- Manual Cloudflare Dashboard UI configuration

## Decision
Adopt Wrangler command-line interface configurations (`wrangler.jsonc`) as the authoritative Infrastructure as Code (IaC) configuration.

## Trade-offs & Consequences
- **Positive**:
  - Declarative configuration stored directly in version control.
  - Standardized CLI commands for local mock runs and deployment pipelines.
  - Zero state files or storage setup required.
- **Negative**:
  - Wrangler cannot configure non-Cloudflare components (e.g. PayOS accounts).

---

## References
- [ADR Index](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/adr/README.md)
