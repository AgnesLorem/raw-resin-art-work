# Coding Standards & Governance

## Purpose
This document establishes code quality guidelines, style conventions, and architectural rules to maintain consistency, reliability, and security across the repository.

## Scope
Applies to all source code files, database schemas, scripts, CI/CD YAML configurations, and pull requests.

## Assumptions
- Code is written primarily in JavaScript/Node.js.
- Execution occurs in Cloudflare Pages and Workers environments.

## Coding Conventions

### 1. Naming & Folder Conventions
- **Files**: Use lower-case, hyphenated names (e.g., `create.js`, `status.js`, `order-item.js`).
- **Folders**: Lower-case, pluralized hyphenated directories (e.g., `functions/api/payments/`).
- **Variables & Functions**: CamelCase for standard variables; UPPER_CASE for environment variables or configuration constants.

### 2. Error Handling Standard
- APIs must never return raw stack traces or database errors to the user.
- Try-catch blocks must catch exceptions, log the detailed error at `ERROR` level (with `cfRay` correlation ID), and return a sanitized catalog response:
  ```javascript
  try {
    // operation
  } catch (err) {
    console.error(JSON.stringify({ severity: "ERROR", event: "API_FAILURE", cfRay, message: err.message }));
    return new Response(JSON.stringify({ error: 'INTERNAL_SERVER_ERROR', message: 'Lỗi hệ thống.' }), { status: 500 });
  }
  ```

### 3. Logging Conventions
- Log entries must be written as structured JSON strings on a single line.
- Every JSON log must contain a `severity` field (`INFO`, `WARN`, `ERROR`, `CRITICAL`).
- **CRITICAL**: Never serialize or print environment credentials, cookies, tokens, or unmasked client PII to output streams.

### 4. Git Commit & PR Guidelines
- Commit messages should follow the Conventional Commits specification (e.g. `feat(api): add CORS origin filters`).
- All code updates must pass automated lint, build, and test steps before code merges are authorized.

### 5. AI-Generated Code Guidelines
- AI-generated suggestions must undergo peer review.
- Placeholders, dummy methods, or mock-ups (such as `// TODO: implement later`) are strictly prohibited in code promoted to production.

## Verification
Enforced through ESLint scripts run during local building and GitHub Actions checks.

## Maintenance
Maintained by the Lead Software Architect. Reviewed annually.

---

## References
- [Architecture Principles](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/architecture/principles.md)
- [Release Flow](file:///c:/Users/lorem/Downloads/resin-art-work-cloudflare-site/docs/release/release-flow.md)
