# Dependency update report (generated on 2025-11-17)

This project’s JavaScript dependencies are very dated and should be updated. Below is a practical checklist you can use to plan the upgrade. Items are grouped by runtime impact and include quick migration notes.

Note: Because the CI environment for this run doesn’t have Node/Yarn available, this report doesn’t query the npm registry. It flags packages that are clearly outdated by age and major versions. Follow the “How to fetch the exact latest versions” section to generate a precise list locally.

---

## Top-priority (frameworks, security, runtime behavior)
- express (currently ^4.15.4)
  - 4.x is several years old. Consider upgrading to the latest stable major.
  - Migration notes:
    - Express 4.16+ includes built-in JSON/body parsing via `express.json()` and `express.urlencoded()`; you can remove `body-parser` for most use-cases.

- mongoose (currently 5.13.22)
  - Multiple major releases have shipped since 5.x. Upgrade recommended for security, MongoDB driver updates, and Node compatibility.
  - Review breaking changes across majors (connection options, query casting defaults, strict mode behaviors, timers, etc.).

## Important (client routing, HTTP client)
- react-router-dom (currently ^4.1.2)
  - 4.x is deprecated. Newer majors change APIs (hooks, element-based routes, `Switch` → `Routes`, etc.). Requires code updates in the client.

- axios (currently ^0.16.2)
  - 0.x is very old; move to latest 1.x. Audit interceptors and error handling after upgrade.

## Can be removed/replaced
- body-parser (currently ^1.17.2)
  - Replace with Express built-ins: `app.use(express.json())` and `app.use(express.urlencoded({ extended: true }))`.

## Tooling (developer experience)
- concurrently (currently ^3.5.0)
  - Upgrade to current major for stability and Windows shell quoting fixes.

- nodemon (currently ^1.11.0)
  - Upgrade to latest nodemon for Node compatibility and bug fixes.

---

## Detected from package.json

```json
{
  "dependencies": {
    "axios": "^0.16.2",
    "body-parser": "^1.17.2",
    "express": "^4.15.4",
    "mongoose": "5.13.22",
    "react-router-dom": "^4.1.2"
  },
  "devDependencies": {
    "concurrently": "^3.5.0",
    "nodemon": "^1.11.0"
  }
}
```

---

## Recommended upgrade approach
1. Remove `body-parser` and switch to Express built-ins.
2. Upgrade `express` to the latest stable major; run and fix middleware deprecations.
3. Upgrade `mongoose` one major at a time if needed (5 → 6 → 7/8), running the test app after each step.
4. On the client, plan a focused migration from `react-router-dom@4` to `6`:
   - Replace `Switch` with `Routes`, `component` with `element`, and migrate to hook-based APIs.
5. Upgrade `axios` to 1.x. Verify interceptors and error shapes (`error.response`, `error.request`).
6. Update tooling: `concurrently`, `nodemon` to latest.

---

## How to fetch the exact latest versions locally
If you have Node and a package manager installed:

- Using npm
  - Check what’s outdated: `npm outdated`
  - Propose new ranges automatically: `npx npm-check-updates -u`
  - Install updates: `npm install`

- Using Yarn (classic)
  - Check what’s outdated: `yarn outdated`
  - Upgrade interactively: `yarn upgrade-interactive --latest`

- Using pnpm
  - Check: `pnpm outdated`
  - Upgrade: `pnpm up -L` (or specify packages)

---

## Post-upgrade checklist
- Run the application in dev and smoke-test key routes and DB operations.
- Rebuild the client and verify routing/navigation.
- Review deprecation warnings in logs and address them.
- Commit lockfile changes and update the README if commands change.
