#!/usr/bin/env node

/**
 * Verification script to check if the build configuration is correct
 * Run this before deploying to Cloudflare Pages to ensure webpack will be used
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Verifying build configuration for Cloudflare Pages deployment...\n');

let hasErrors = false;
let hasWarnings = false;

// Check package.json
try {
  const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  
  console.log('✓ Checking package.json scripts...');
  
  const buildScript = packageJson.scripts?.build;
  const buildCloudflareScript = packageJson.scripts?.['build:cloudflare'];
  
  if (!buildScript) {
    console.error('  ✗ Missing "build" script in package.json');
    hasErrors = true;
  } else if (!buildScript.includes('--webpack')) {
    console.error('  ✗ "build" script does not include "--webpack" flag');
    console.error(`    Current: ${buildScript}`);
    console.error(`    Expected: next build --webpack`);
    hasErrors = true;
  } else {
    console.log(`  ✓ build script: ${buildScript}`);
  }
  
  if (!buildCloudflareScript) {
    console.error('  ✗ Missing "build:cloudflare" script in package.json');
    hasErrors = true;
  } else if (!buildCloudflareScript.includes('--webpack')) {
    console.error('  ✗ "build:cloudflare" script does not include "--webpack" flag');
    console.error(`    Current: ${buildCloudflareScript}`);
    console.error(`    Expected: next build --webpack && opennextjs-cloudflare build --skipNextBuild`);
    hasErrors = true;
  } else {
    console.log(`  ✓ build:cloudflare script: ${buildCloudflareScript}`);
  }
  
  // Check dependencies
  console.log('\n✓ Checking dependencies...');
  
  if (!packageJson.dependencies?.next) {
    console.error('  ✗ Missing "next" in dependencies');
    hasErrors = true;
  } else {
    console.log(`  ✓ next: ${packageJson.dependencies.next}`);
  }
  
  if (!packageJson.devDependencies?.['@opennextjs/cloudflare']) {
    console.error('  ✗ Missing "@opennextjs/cloudflare" in devDependencies');
    hasErrors = true;
  } else {
    console.log(`  ✓ @opennextjs/cloudflare: ${packageJson.devDependencies['@opennextjs/cloudflare']}`);
  }
  
} catch (error) {
  console.error('✗ Error reading package.json:', error.message);
  hasErrors = true;
}

// Check next.config.ts
try {
  const nextConfig = readFileSync(join(rootDir, 'next.config.ts'), 'utf8');
  
  console.log('\n✓ Checking next.config.ts...');
  
  if (!nextConfig.includes("output: 'standalone'")) {
    console.error('  ✗ Missing "output: \'standalone\'" configuration');
    hasErrors = true;
  } else {
    console.log('  ✓ output: standalone');
  }
  
  if (!nextConfig.includes('webpack:')) {
    console.warn('  ⚠ No webpack configuration found (may be optional)');
    hasWarnings = true;
  } else {
    console.log('  ✓ webpack configuration present');
  }
  
  if (nextConfig.includes('images:') && nextConfig.includes('unoptimized: true')) {
    console.log('  ✓ images.unoptimized: true (required for Cloudflare Pages)');
  } else {
    console.warn('  ⚠ Consider setting images.unoptimized: true for Cloudflare Pages');
    hasWarnings = true;
  }
  
} catch (error) {
  console.error('✗ Error reading next.config.ts:', error.message);
  hasErrors = true;
}

// Check wrangler.toml
try {
  const wranglerToml = readFileSync(join(rootDir, 'wrangler.toml'), 'utf8');
  
  console.log('\n✓ Checking wrangler.toml...');
  
  if (!wranglerToml.includes('pages_build_output_dir = ".open-next"')) {
    console.error('  ✗ pages_build_output_dir should be ".open-next"');
    hasErrors = true;
  } else {
    console.log('  ✓ pages_build_output_dir: .open-next');
  }
  
  if (!wranglerToml.includes('compatibility_flags = ["nodejs_compat"]')) {
    console.warn('  ⚠ Consider adding compatibility_flags = ["nodejs_compat"]');
    hasWarnings = true;
  } else {
    console.log('  ✓ compatibility_flags: nodejs_compat');
  }
  
} catch (error) {
  console.error('✗ Error reading wrangler.toml:', error.message);
  hasErrors = true;
}

// Check .nvmrc
try {
  const nvmrc = readFileSync(join(rootDir, '.nvmrc'), 'utf8').trim();
  
  console.log('\n✓ Checking .nvmrc...');
  
  const version = parseInt(nvmrc);
  if (version < 18) {
    console.error(`  ✗ Node version ${nvmrc} is too old (minimum: 18)`);
    hasErrors = true;
  } else {
    console.log(`  ✓ Node version: ${nvmrc}`);
  }
  
} catch (error) {
  console.warn('\n⚠ .nvmrc file not found (recommended to specify Node version)');
  hasWarnings = true;
}

// Check middleware.ts
try {
  const middleware = readFileSync(join(rootDir, 'middleware.ts'), 'utf8');
  
  console.log('\n✓ Checking middleware.ts...');
  
  if (!middleware.includes("export const runtime = 'edge'")) {
    console.error('  ✗ Missing "export const runtime = \'edge\'" declaration');
    console.error('    Middleware must run on edge runtime for Cloudflare Pages');
    hasErrors = true;
  } else {
    console.log('  ✓ runtime: edge');
  }
  
} catch (error) {
  console.log('\n• No middleware.ts found (optional)');
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('\n❌ Configuration check FAILED');
  console.error('   Please fix the errors above before deploying to Cloudflare Pages');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('\n⚠️  Configuration check PASSED with warnings');
  console.warn('   Review the warnings above for recommended improvements');
  process.exit(0);
} else {
  console.log('\n✅ Configuration check PASSED');
  console.log('   Your build configuration is correct for Cloudflare Pages deployment');
  console.log('   Using webpack bundler as required by @opennextjs/cloudflare');
  process.exit(0);
}
