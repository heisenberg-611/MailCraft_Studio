const assert = require('assert');

// 1. Load Engines in Node environment
const SignatureEngine = require('../js/signature-engine.js');
const Icons = require('../js/icons.js');
global.Icons = Icons;
const LinterEngine = require('../js/linter.js');

console.log('--- TEST 1: Automatic Hosted HTTPS Social Icons ---');
const data1 = {
  fullName: 'Dhrubojyoti Saha',
  jobTitle: 'Software Architect',
  company: 'Portfolio Labs',
  email: 'dhrubojyoti.saha@g.bracu.ac.bd',
  socials: [
    { id: 'github', url: 'https://github.com/heisenberg-611', enabled: true },
    { id: 'linkedin', url: 'https://linkedin.com/in/dhrubojyoti', enabled: true },
    { id: 'x', url: 'https://x.com/dhrubo', enabled: true }
  ]
};

const settings1 = {
  template: 'vertical-divider',
  assetOrigin: 'https://mailcraft.vercel.app'
};

const html1 = SignatureEngine.generateHtml(data1, settings1, false, true);

// Verify social icons use https links to Vercel site
assert(html1.includes('src="https://mailcraft.vercel.app/assets/icons/github.png"'), 'GitHub icon must use Vercel HTTPS link');
assert(html1.includes('src="https://mailcraft.vercel.app/assets/icons/linkedin.png"'), 'LinkedIn icon must use Vercel HTTPS link');
assert(html1.includes('src="https://mailcraft.vercel.app/assets/icons/x.png"'), 'X icon must use Vercel HTTPS link');
console.log('✔ Social icons automatically use remote Vercel HTTPS links');

console.log('--- TEST 2: Unique Avatar & Company Logo External HTTPS Links ---');
const data2 = {
  ...data1,
  avatarUrl: 'https://avatars.githubusercontent.com/u/1234567?v=4',
  showLogo: true,
  logoUrl: 'https://mycompany.com/assets/logo-white.png'
};

const html2 = SignatureEngine.generateHtml(data2, settings1, false, true);

assert(html2.includes('src="https://avatars.githubusercontent.com/u/1234567?v=4"'), 'Avatar must use external HTTPS URL directly');
assert(html2.includes('src="https://mycompany.com/assets/logo-white.png"'), 'Logo must use external HTTPS URL directly');
assert(!html2.includes('data:image/'), 'No base64 data URIs should be present when HTTPS links are used');
console.log('✔ Unique avatar and company logo render external HTTPS links directly without base64 embedding');

console.log('--- TEST 3: Campaign Promo Banner HTTPS Links ---');
const data3 = {
  ...data2,
  promoBanner: {
    enabled: true,
    imageUrl: 'https://cdn.mycompany.com/banners/launch-2026.png',
    targetUrl: 'https://mycompany.com/launch?utm_source=email_sig&utm_medium=banner'
  }
};

const html3 = SignatureEngine.generateHtml(data3, settings1, false, true);

assert(html3.includes('src="https://cdn.mycompany.com/banners/launch-2026.png"'), 'Promo banner image must use remote HTTPS URL');
assert(html3.includes('href="https://mycompany.com/launch?utm_source=email_sig&amp;utm_medium=banner"') || html3.includes('href="https://mycompany.com/launch?utm_source=email_sig&utm_medium=banner"'), 'Promo banner link must point to targetUrl');
console.log('✔ Campaign promo banner properly links remote HTTPS image and click destination');

console.log('--- TEST 4: Relative Path Resolution to Vercel Origin ---');
const data4 = {
  ...data1,
  avatarUrl: '/assets/my-custom-photo.jpg',
  showLogo: true,
  logoUrl: '/assets/my-custom-logo.png'
};

const html4 = SignatureEngine.generateHtml(data4, settings1, false, true);

assert(html4.includes('src="https://mailcraft.vercel.app/assets/my-custom-photo.jpg"'), 'Relative avatar path must resolve to Vercel origin');
assert(html4.includes('src="https://mailcraft.vercel.app/assets/my-custom-logo.png"'), 'Relative logo path must resolve to Vercel origin');
console.log('✔ Relative asset paths correctly auto-expand to full Vercel HTTPS URLs');

console.log('--- TEST 5: Linter Mobile Gmail Audit Check ---');
const auditReport = LinterEngine.audit(html3);
console.log('Total HTML payload bytes:', auditReport.totalBytes, `(${auditReport.sizeFormatted})`);
assert(auditReport.totalBytes < 15000, 'HTML size should be featherweight under 15KB with HTTPS links');

const mobileCheck = auditReport.checks.find(c => c.id === 'mobile_gmail_images');
assert(mobileCheck, 'mobile_gmail_images check must exist');
assert.strictEqual(mobileCheck.status, 'pass', 'mobile_gmail_images check should pass when all images are HTTPS');
console.log('✔ Linter successfully validates 100% Mobile Gmail App remote image delivery');

console.log('--- TEST 6: Graceful Base64 Fallback When Requested ---');
const settingsBase64 = {
  template: 'vertical-divider',
  iconDeliveryMode: 'base64'
};
const dataBase64 = {
  ...data1,
  avatarUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
};
const htmlBase64 = SignatureEngine.generateHtml(dataBase64, settingsBase64, false, true);
assert(htmlBase64.includes('data:image/'), 'Should retain base64 data URI when base64 is explicitly provided');
const auditBase64 = LinterEngine.audit(htmlBase64);
const mobileCheckBase64 = auditBase64.checks.find(c => c.id === 'mobile_gmail_images');
assert.strictEqual(mobileCheckBase64.status, 'warn', 'Linter should warn when base64 images are detected');
console.log('✔ Linter warns when Base64 is used, guiding users to HTTPS');

console.log('\n========================================');
console.log(' ALL 6 VERIFICATION TEST SUITES PASSED! ');
console.log('========================================\n');
