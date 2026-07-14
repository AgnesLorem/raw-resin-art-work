# Architecture Decision Records (ADR)

## Purpose
This directory contains the Architecture Decision Records (ADRs) for the Resin Art Work checkout system. These documents capture significant architectural decisions, their context, the alternatives considered, and their consequences.

## Scope
Applicable to all engineering team members. Any architectural change affecting bindings, database schemas, third-party integrations, or code deployment models requires an ADR.

## What is an ADR?
An ADR is a short document capturing a critical design decision. It details:
- **Context**: The background and environment forcing the decision.
- **Problem**: The technical issue or limitation requiring resolution.
- **Alternatives Considered**: Other tools, platforms, or paths evaluated.
- **Decision**: The selected option and its justification.
- **Trade-offs & Consequences**: Both positive and negative outcomes resulting from the decision.
- **Status**: The current state of the decision (`Proposed`, `Accepted`, `Deprecated`, `Superseded`).

## ADR Lifecycle
1. **Proposed**: Under review by the engineering team.
2. **Accepted**: Approved for implementation.
3. **Deprecated**: No longer recommended, but kept for historical context.
4. **Superseded**: Replaced by a newer decision record (which must link back to the superseded ADR).

## ADR Numbering Convention
ADRs are numbered sequentially with four-digit prefixes starting at `0001` (e.g., `docs/adr/0001-why-cloudflare-pages.md`).

---

## Index of Records
1. [0001-why-cloudflare-pages.md](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/adr/0001-why-cloudflare-pages.md) — Adopting Cloudflare Pages.
2. [0002-why-cloudflare-d1.md](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/adr/0002-why-cloudflare-d1.md) — Adopting Cloudflare D1 database.
3. [0003-why-payos.md](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/adr/0003-why-payos.md) — Adopting PayOS gateway.
4. [0004-why-wrangler-iac.md](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/adr/0004-why-wrangler-iac.md) — Adopting Wrangler IaC configurations.
5. [0005-why-preview-production-separation.md](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/adr/0005-why-preview-production-separation.md) — Database and Environment isolation.
