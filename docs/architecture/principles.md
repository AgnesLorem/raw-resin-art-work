# Engineering Principles

## Purpose
This document establishes the core architectural and software engineering principles governing the Resin Art Work checkout site development, ensuring maintainability, security, and reliability.

## Scope
Applicable to all frontend components, edge Worker endpoints, database migration scripts, and SRE monitoring layouts.

## Assumptions
- Developers possess moderate familiarity with Cloudflare edge and serverless architectures.
- The stack utilizes Cloudflare Pages, Workers, D1, and PayOS integrations.

## Core Architectural Principles

### 1. Server Authoritative
The server/edge is the single source of truth for pricing, option verification, and transaction validations. Client-side inputs are treated as untrusted.

### 2. Immutable Migrations
Migration scripts (`db/migrations/`) are immutable once executed on the remote database. Correction or rollbacks must execute via new, forward-applying migrations.

### 3. Idempotency
All API operations, particularly webhooks, must support idempotent invocations. Re-processing a webhook for an already-completed payment must return a `200 OK` success code immediately without altering the database.

### 4. Defense in Depth
Security controls must exist at multiple layers, including rate limiters, Turnstile bot challenges, origin checks, JSON schema checks, D1 prepared statements, and PayOS signature check keys.

### 5. Least Privilege
Bindings and tokens are configured with the minimum required access rights. Wrangler configuration limits Workers to distinct environment namespaces.

### 6. Fail-Safe Defaults
If third-party API or database connectivity fails, checkout and payment operations must fail gracefully with appropriate error messages to the client rather than risking half-written state records.

### 7. Separation of Environments
Complete network and database boundary isolation between `preview/staging` and `production` environments to protect production transaction records.

### 8. Infrastructure as Code (IaC)
All cloud configurations (bindings, routes, settings) must be documented inside configuration files (`wrangler.jsonc`) rather than manual UI dashboard configurations.

## Verification
Principle compliance is validated during the Release Candidate PR reviews, manual checks, and QA code inspection steps.

## Maintenance
Maintained by the Lead Software Architect. Reviewed quarterly to align with platform best practices.

---

## References
- [Implementation Plan (v1.0)](file:///C:/Users/lorem/.gemini/antigravity/brain/843d26ba-b5cc-43fe-bb2f-6ba54c7b4bd9/implementation_plan.md)
- [Coding Standards](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/governance/coding-standards.md)
