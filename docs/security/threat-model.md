# Threat Model & Security Architecture

## Purpose
This document presents the STRIDE threat model and security architecture layout for the Resin Art Work payment integration site, identifying risks, boundaries, and validation mitigations.

## Scope
Includes all client interactions, edge routing Workers, webhook endpoints, database tables, and external PayOS API calls.

## Assumptions
- Operations utilize HTTPS for all transactions.
- Webhook endpoints are exposed publicly to allow callback updates.

## Trust Boundaries & Entry Points
- **Trust Boundaries**:
  - **Client Boundary**: Browser client and static UI forms. (Untrusted).
  - **Edge Worker Boundary**: Isolated serverless edge function execution. (Trusted).
  - **Database Boundary**: Cloudflare D1 SQL volumes. (Trusted).
  - **External Gateway Boundary**: PayOS HTTPS API. (Trusted).
- **Entry Points**:
  - `POST /api/v1/payments/create` (Public)
  - `GET /api/v1/payments/status` (Public)
  - `POST /api/v1/webhooks/payos` (Public Webhook)

---

## STRIDE Threat Matrix

| Threat Category | Specific Threat | Threat Description | Likelihood | Impact | Mitigation | Residual Risk | Relevant Validation Tests |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Spoofing** | **Webhook Forgery** | Attacker calls webhook posing as PayOS. | Medium | High | Webhook signature check using `PAYOS_CHECKSUM_KEY`. | Low | Test 21 (Wrong Signature), Test 56 (Null Webhook Fields) |
| **Tampering** | **Price Tampering** | Client intercepts and alters product prices. | High | Medium | Edge server recalculates totals using `products.js`. | Low | Test 9 (Price Tampering), Test 10 (Option Price Tampering) |
| **Repudiation** | **Fake Callback Webhooks** | Attacker claims payment made without database records. | Low | Medium | Strict audit logging in D1 containing transaction ID checks. | Low | Test 20 (Duplicate Webhook), Test 44 (Multiple Identical Webhooks) |
| **Information Disclosure** | **Secret / Key Leakage** | Telemetry logs print PayOS client/secret credentials. | Medium | High | Logging parser strictly strips authorization headers and secrets. | Low | Test 19 (Status API Key Protection), Audit Logging Rules |
| **Denial of Service** | **Create API Flooding** | Attacker spams checkout requests to exhaust D1 limits. | High | Medium | Cloudflare Rate Limiting (Average 10-20 req/min, Burst 5) & Turnstile. | Low | Rate Limiting Policy, Turnstile checks |
| **Elevation of Privilege** | **SQL Injection** | Attacker injects commands via customer name or address fields. | Low | High | Edge Worker utilizes D1 parameterized query statements exclusively. | Low | Test 8 (SQL Reserved Characters), Test 51 (Malformed JSON) |

---

## Attack Surface Analysis
- **API Payloads**: Strictly validated using body size boundaries (<10KB) and regex email formatting.
- **Third-Party Integrations**: Restricted to HTTPS using TLS 1.2 minimum. Outbound network DNS/TLS failures fail gracefully.
- **Client Form Inputs**: Deduplicated using unique sessionStorage tags and database keys to block rapid multi-click operations.

## Verification
Validations are executed as part of the Tier 1 Smoke tests and Tier 3 Full Validation suites.

## Maintenance
Maintained by the Security Architect. Reviewed every 6 months.

---

## References
- [Implementation Plan (v1.0)](file:///C:/Users/lorem/.gemini/antigravity/brain/843d26ba-b5cc-43fe-bb2f-6ba54c7b4bd9/implementation_plan.md)
- [Coding Standards](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/governance/coding-standards.md)
