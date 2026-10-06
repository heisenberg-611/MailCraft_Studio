const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=================================================');
console.log('🧪 Running MailCraft Studio Refactoring & Security Audit');
console.log('=================================================\n');

const Icons = require('../js/icons.js');
const Presets = require('../js/presets.js');
const LinterEngine = require('../js/linter.js');

global.Icons = Icons;
global.Presets = Presets;
global.LinterEngine = LinterEngine;

const SignatureEngine = require('../js/signature-engine.js');
const EmailTemplateEngine = require('../js/email-template-engine.js');

global.SignatureEngine = SignatureEngine;
global.EmailTemplateEngine = EmailTemplateEngine;

// --- TEST 1: Calendly Support in Icons & Signature Engine ---
console.log('--- Test 1: Calendly Social Icon Integration ---');
assert(Icons.social.calendly, 'Icons.social must have calendly definition');
assert.strictEqual(Icons.social.calendly.name, 'Calendly', 'Calendly icon name matches');
const calendlyUrl = SignatureEngine.formatSocialUrl('calendly', 'my-booking');
assert.strictEqual(calendlyUrl, 'https://calendly.com/my-booking', 'Calendly URL auto-formats properly');
console.log('✓ Calendly icon & URL formatting verified');

// --- TEST 2: Signature Engine HTML Sanitization & XSS Defense ---
console.log('\n--- Test 2: Signature Engine Sanitization & Escape Defense ---');
assert(typeof SignatureEngine.escapeHtml === 'function', 'SignatureEngine.escapeHtml exists');
assert(typeof SignatureEngine.escapeAttr === 'function', 'SignatureEngine.escapeAttr exists');
assert(typeof SignatureEngine.sanitizeUrl === 'function', 'SignatureEngine.sanitizeUrl exists');

assert.strictEqual(SignatureEngine.escapeHtml('<b>"test" & \'foo\'</b>'), '&lt;b&gt;&quot;test&quot; &amp; &#39;foo&#39;&lt;/b&gt;');
assert.strictEqual(SignatureEngine.sanitizeUrl('javascript:alert(1)'), '#');
assert.strictEqual(SignatureEngine.sanitizeUrl('vbscript:msgbox(1)'), '#');
assert.strictEqual(SignatureEngine.sanitizeUrl('https://example.com'), 'https://example.com');

// Test malicious custom field
const xssData = {
  ...Presets.defaultData,
  customFields: [
    { label: '<script>alert("xss")</script>', value: 'malicious', url: 'javascript:alert(document.cookie)' }
  ]
};
const sigHtml = SignatureEngine.generateHtml(xssData, Presets.styles.developerTerminal.settings, false, true);
assert(!sigHtml.includes('<script>alert'), 'Custom field label does not allow raw script tags');
assert(sigHtml.includes('&lt;script&gt;alert'), 'Custom field label is properly HTML escaped');
assert(!sigHtml.includes('href="javascript:'), 'Custom field url does not allow javascript: protocol');
console.log('✓ Custom fields safely HTML-escaped and malicious protocol blocked');

// --- TEST 3: Email Template Markdown & HTML Sanitization ---
console.log('\n--- Test 3: Email Template Markdown Sanitization ---');
const rawPara = 'Normal <script>alert("hacked")</script> paragraph with <iframe src="evil.com"></iframe> and **bold** text.';
const formatted = EmailTemplateEngine.formatRichText(rawPara, '#334155', '#00DC82', false);
assert(!formatted.includes('<script>'), 'Script tag stripped from formatted paragraph');
assert(!formatted.includes('<iframe'), 'Iframe tag stripped from formatted paragraph');
assert(formatted.includes('<strong'), 'Bold markdown properly transformed');
console.log('✓ Email template engine removes hazardous tags while keeping markdown');

// --- TEST 4: Linter Engine sizeBytes & totalBytes API Parity ---
console.log('\n--- Test 4: Linter Engine Compatibility Parity ---');
const audit = LinterEngine.audit(sigHtml);
assert.strictEqual(typeof audit.totalBytes, 'number', 'audit.totalBytes is a number');
assert.strictEqual(typeof audit.sizeBytes, 'number', 'audit.sizeBytes is a number');
assert.strictEqual(audit.totalBytes, audit.sizeBytes, 'totalBytes and sizeBytes are identical');
console.log(`✓ Linter API parity confirmed: ${audit.sizeBytes} bytes (${audit.sizeFormatted})`);

// --- TEST 5: Extension Sync Verification ---
console.log('\n--- Test 5: Chrome Extension & Root Engine Parity ---');
const extSigEngine = fs.readFileSync(path.join(__dirname, '../extension/signature-engine.js'), 'utf8');
const rootSigEngine = fs.readFileSync(path.join(__dirname, '../js/signature-engine.js'), 'utf8');
assert.strictEqual(extSigEngine, rootSigEngine, 'extension/signature-engine.js must be 100% in sync with js/signature-engine.js');
console.log('✓ Zero drift between root engine and Chrome extension engine');

console.log('\n=================================================');
console.log('🎉 ALL REFACTORING & SECURITY AUDIT TESTS PASSED!');
console.log('=================================================');
