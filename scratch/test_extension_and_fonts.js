const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Testing Chrome Extension & Studio Typography Alignment ---');

// 1. Verify studio.css font consistency
const studioCss = fs.readFileSync(path.join(__dirname, '../css/studio.css'), 'utf8');
assert(studioCss.includes('.wysiwyg-badge-indicator'), 'studio.css contains .wysiwyg-badge-indicator');
assert(studioCss.includes('font-family: var(--font-mono) !important;'), 'studio.css applies mono font to badge indicator');
assert(studioCss.includes('.block-item-actions'), 'studio.css contains .block-item-actions');
assert(studioCss.includes('.block-btn-up'), 'studio.css contains .block-btn-up');
console.log('✓ Studio CSS font and block alignment rules verified.');

// 2. Verify extension/popup.html
const popupHtml = fs.readFileSync(path.join(__dirname, '../extension/popup.html'), 'utf8');
assert(popupHtml.includes('fonts.googleapis.com'), 'popup.html includes Google Fonts link');
assert(popupHtml.includes('JetBrains+Mono'), 'popup.html includes JetBrains Mono');
assert(popupHtml.includes('default-avatar.js'), 'popup.html includes default-avatar.js');
assert(popupHtml.includes('icons.js'), 'popup.html includes icons.js');
assert(popupHtml.includes('presets.js'), 'popup.html includes presets.js');
assert(popupHtml.includes('signature-engine.js'), 'popup.html includes signature-engine.js');
assert(popupHtml.includes('popup.js'), 'popup.html includes popup.js');
console.log('✓ extension/popup.html verified.');

// 3. Verify extension/popup.css
const popupCss = fs.readFileSync(path.join(__dirname, '../extension/popup.css'), 'utf8');
assert(popupCss.includes('width: 440px'), 'popup.css has 440px width');
assert(popupCss.includes('JetBrains Mono'), 'popup.css includes JetBrains Mono');
console.log('✓ extension/popup.css verified.');

// 4. Verify SignatureEngine with extension modules
const DEFAULT_AVATAR_BASE64 = require('../extension/default-avatar.js');
const Icons = require('../extension/icons.js');
const Presets = require('../extension/presets.js');

global.DEFAULT_AVATAR_BASE64 = DEFAULT_AVATAR_BASE64;
global.Icons = Icons;
global.Presets = Presets;

const SignatureEngine = require('../extension/signature-engine.js');

const defaultData = Object.assign({}, Presets.defaultData, {
  fullName: 'Dhrubojyoti Saha',
  jobTitle: 'Software Architect',
  avatarUrl: DEFAULT_AVATAR_BASE64
});

const generatedHtml = SignatureEngine.generateHtml(
  defaultData,
  Presets.styles.developerTerminal.settings,
  false,
  true
);

assert(generatedHtml.includes('Dhrubojyoti Saha'), 'Signature includes full name');
assert(generatedHtml.includes('Software Architect'), 'Signature includes job title');
assert(generatedHtml.includes('data:image/jpeg;base64,'), 'Signature includes avatar image data URI');
assert(generatedHtml.length > 500, 'Signature contains complete HTML structure');
console.log('✓ Full signature generation with photo avatar verified. HTML size:', generatedHtml.length, 'bytes');

// 5. Verify all extension files exist and are populated
const extFiles = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'popup.js',
  'content.js',
  'default-avatar.js',
  'icons.js',
  'presets.js',
  'signature-engine.js',
  'README.md'
];

extFiles.forEach(f => {
  const p = path.join(__dirname, '../extension', f);
  assert(fs.existsSync(p), `Extension file ${f} must exist`);
  const stat = fs.statSync(p);
  assert(stat.size > 0, `Extension file ${f} must not be empty (size: ${stat.size})`);
});
console.log('✓ All 10 Chrome Extension files verified present and non-empty.');

console.log('--- ALL EXTENSION & TYPOGRAPHY CHECKS PASSED ---');
