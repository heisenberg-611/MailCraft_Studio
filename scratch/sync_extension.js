#!/usr/bin/env node
/**
 * Extension Synchronization Script
 * Automatically syncs shared core modules from js/ into extension/
 * Guarantees zero code drift between web studio and Chrome extension package.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SHARED_FILES = [
  'signature-engine.js',
  'icons.js',
  'presets.js'
];

console.log('🔄 Syncing core modules between Studio and Chrome Extension...\n');

let syncedCount = 0;
SHARED_FILES.forEach(file => {
  const src = path.join(ROOT_DIR, 'js', file);
  const dest = path.join(ROOT_DIR, 'extension', file);

  if (!fs.existsSync(src)) {
    console.error(`❌ Source file missing: ${src}`);
    process.exit(1);
  }

  const srcContent = fs.readFileSync(src, 'utf8');
  fs.writeFileSync(dest, srcContent, 'utf8');
  console.log(`  ✓ Synced js/${file} -> extension/${file}`);
  syncedCount++;
});

console.log(`\n🎉 Successfully synced ${syncedCount} shared modules to Chrome Extension!`);
