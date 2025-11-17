#!/usr/bin/env node
/**
 * Dependency report generator
 *
 * Prints dependencies and devDependencies from package.json.
 * If you have internet access and want to enrich with latest versions, consider using
 * the npm registry API or tools like npm-check-updates.
 */

const fs = require('fs');
const path = require('path');

function main() {
  const pkgPath = path.resolve(__dirname, '..', 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.error('package.json not found at', pkgPath);
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const report = {
    generatedAt: new Date().toISOString(),
    name: pkg.name,
    version: pkg.version,
    dependencies: pkg.dependencies || {},
    devDependencies: pkg.devDependencies || {}
  };

  console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) {
  main();
}
