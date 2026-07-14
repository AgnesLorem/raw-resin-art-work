# ADR 0003: Adopting PayOS

## Status
Accepted

## Date
2026-07-14

## Owner
Lead Software Architect

## Context
The site must validate customer payment transactions securely and automatically.

## Problem
Integrating bank APIs directly requires heavy security audits, custom bank gateways integrations, and high maintenance effort, while standard international payment gateways (e.g. Stripe) have higher transaction fees and limited domestic bank transfer options in Vietnam.

## Alternatives Considered
- Direct QR code bank transfers (Manual verification)
- Stripe Integration
- VNPay API / MoMo API

## Decision
Integrate PayOS as the automated payment gateway.

## Trade-offs & Consequences
- **Positive**:
  - Automatically generates VietQR payment codes with accurate transaction tracking.
  - Secures webhook callback verification using SHA256 checksum signatures.
  - Zero transaction processing costs for bank transfers in Vietnam.
- **Negative**:
  - Third-party dependency introduces risks of outages or API timeouts (mitigated by fallback email options).

---

## References
- [ADR Index](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/adr/README.md)
