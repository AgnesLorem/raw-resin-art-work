# ADR 0001: Adopting Cloudflare Pages

## Status
Accepted

## Date
2026-07-14

## Owner
Lead Software Architect

## Context
The Resin Art Work site requires hosting for its static frontend assets and a performant routing mechanism to run API backend scripts on edge nodes.

## Problem
Traditional virtual machine or container hosting adds container orchestration and server patch maintenance overhead, while cold start latencies on standard serverless cloud runtimes impact user checkout experiences.

## Alternatives Considered
- AWS Amplify + AWS Lambda
- Vercel (Next.js hosting)
- Dedicated VPS (Nginx + Node.js PM2)

## Decision
Adopt Cloudflare Pages for unified frontend asset hosting and Pages Functions (Edge Workers) for Serverless API routing.

## Trade-offs & Consequences
- **Positive**:
  - Global edge distribution with zero cold-starts.
  - Zero-maintenance server infrastructure.
  - Built-in edge middleware capability.
- **Negative**:
  - Functions are limited to the Cloudflare Worker runtime (V8 engine) and cannot execute arbitrary Node.js native binary extensions.

---

## References
- [ADR Index](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/adr/README.md)
