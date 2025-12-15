# Security Assessment Report

Date: 2025-10-28
Assessor: Junie by JetBrains

Scope: Node/Express API, Mongo/Mongoose models, React client, configs.

Summary
- Risk: Medium → High due to outdated dependencies and missing defensive middleware.
- Quick fixes applied (minimal, non-breaking):
  - Eliminated NoSQL injection vector by whitelisting filters in Articles findAll.
  - Added security headers via helmet.
  - Added basic API rate limiting.
  - Added restrictive CORS (deny by default; allow via ALLOWED_ORIGINS env).
  - Blocked serving of source maps (.map) to avoid potential information leakage.

Findings and Remediations
1) Outdated backend dependencies
   - express ^4.15.4, axios ^0.16.2, body-parser ^1.17.2, mongoose 5.13.22.
   - Remediation: consider upgrading major versions (Express 4 → latest 4.x or 5 when stable; axios ≥1.x; Mongoose ≥7.x). Re-test thoroughly.

2) Potential NoSQL injection via unvalidated req.query (Fixed)
   - Original code used req.query directly in Mongo find(). Attackers could introduce operators like $gt.
   - Fix: Whitelist title, url, date in controllers/articlesController.js and coerce types.

3) Missing security headers (Fixed)
   - Added helmet and disabled x-powered-by. CSP is disabled by default to avoid breaking the existing client; consider adding a strict CSP tuned to the build.

4) No rate limiting (Fixed)
   - Added express-rate-limit on /api with 15 min / 300 requests default.

5) No explicit CORS policy (Fixed)
   - Added cors with allowlist via env ALLOWED_ORIGINS. By default, cross-origin requests are not allowed.
   - To enable specific origins: set ALLOWED_ORIGINS to a comma-separated list, e.g. "https://app.example.com, https://admin.example.com".

6) Source map exposure (Fixed)
   - .map files under client/build could leak source info. Requests for *.map now return 403.
   - Consider excluding client/build from repo or disabling source map generation for production builds.

7) Secrets handling
   - .gitignore already excludes .env and client/.env. No hardcoded secrets found in source; a source map was present under client/build, which is now blocked.

Operational Recommendations
- Rotate any credentials previously used in environments where this app was deployed without the above protections.
- Pin Node.js LTS and add an .nvmrc or engines field.
- Add automated dependency scanning (e.g., GitHub Dependabot, npm audit in CI) and SAST.
- Add basic integration tests for API routes and validation.

Environment Variables
- ALLOWED_ORIGINS: comma-separated list of origins allowed for CORS. Example:
  ALLOWED_ORIGINS="https://your-frontend.example.com"
- MONGODB_URI: Mongo connection string.
- PORT: server port (default 3002).

Change Log
- 2025-10-28: Applied code fixes and added middleware; updated package.json; added this SECURITY.md.
