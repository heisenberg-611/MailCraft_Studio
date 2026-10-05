const assert = require('assert');

// 1. Load Engines in Node environment
const SignatureEngine = require('../js/signature-engine.js');
const Icons = require('../js/icons.js');
global.Icons = Icons;
const LinterEngine = require('../js/linter.js');

console.log('--- TEST 1: All 5 Hosted Icon Schemes & Day/Dark Themes ---');
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

const baseOrigin = 'https://mailcraftstudio.vercel.app';

// 1A: Official Brand Colors (Day / Light)
const htmlBrandLight = SignatureEngine.generateHtml(data1, { iconStyle: 'brand', assetOrigin: baseOrigin }, false, true);
assert(htmlBrandLight.includes('src="https://mailcraftstudio.vercel.app/assets/icons/brand/github.png"'), 'Brand day mode uses brand/ folder');
console.log('✔ Official Brand Colors (Day Theme) targets brand/ folder');

// 1B: Official Brand Colors (Dark Theme)
const htmlBrandDark = SignatureEngine.generateHtml(data1, { iconStyle: 'brand', assetOrigin: baseOrigin }, true, true);
assert(htmlBrandDark.includes('src="https://mailcraftstudio.vercel.app/assets/icons/brand-dark/github.png"'), 'Brand dark mode uses brand-dark/ folder');
console.log('✔ Official Brand Colors (Dark Theme) targets brand-dark/ folder');

// 1C: Monochrome Neutral (Day Theme)
const htmlMonoLight = SignatureEngine.generateHtml(data1, { iconStyle: 'monochrome', assetOrigin: baseOrigin }, false, true);
assert(htmlMonoLight.includes('src="https://mailcraftstudio.vercel.app/assets/icons/mono/github.png"'), 'Mono day mode uses mono/ folder');
console.log('✔ Monochrome Neutral (Day Theme) targets mono/ folder');

// 1D: Monochrome Neutral (Dark Theme)
const htmlMonoDark = SignatureEngine.generateHtml(data1, { iconStyle: 'monochrome', assetOrigin: baseOrigin }, true, true);
assert(htmlMonoDark.includes('src="https://mailcraftstudio.vercel.app/assets/icons/white/github.png"'), 'Mono dark mode uses white/ folder');
console.log('✔ Monochrome Neutral (Dark Theme) targets white/ folder');

// 1E: Rounded Pill Badge (uses white icons on colored pill background)
const htmlPill = SignatureEngine.generateHtml(data1, { iconStyle: 'pill', assetOrigin: baseOrigin }, false, true);
assert(htmlPill.includes('src="https://mailcraftstudio.vercel.app/assets/icons/white/github.png"'), 'Pill badge uses white/ folder');
assert(htmlPill.includes('border-radius: 4px;'), 'Pill badge has rounded border');
console.log('✔ Rounded Pill Badge targets white/ folder with pill background');

// 1F: Circular Solid Badge (uses white icons on circular badge background)
const htmlCircle = SignatureEngine.generateHtml(data1, { iconStyle: 'circle', assetOrigin: baseOrigin }, false, true);
assert(htmlCircle.includes('src="https://mailcraftstudio.vercel.app/assets/icons/white/github.png"'), 'Circle badge uses white/ folder');
assert(htmlCircle.includes('border-radius: 50%;'), 'Circle badge has circular border');
console.log('✔ Circular Solid Badge targets white/ folder with circular background');

// 1G: Unified Accent Color
const htmlAccent = SignatureEngine.generateHtml(data1, { iconStyle: 'accent', assetOrigin: baseOrigin }, false, true);
assert(htmlAccent.includes('src="https://mailcraftstudio.vercel.app/assets/icons/accent/github.png"'), 'Accent uses accent/ folder');
console.log('✔ Unified Accent Color targets accent/ folder');

console.log('--- TEST 2: Unique Avatar & Company Logo External HTTPS Links ---');
const data2 = {
  ...data1,
  avatarUrl: 'https://avatars.githubusercontent.com/u/1234567?v=4',
  showLogo: true,
  logoUrl: 'https://mycompany.com/assets/logo-white.png'
};

const html2 = SignatureEngine.generateHtml(data2, { assetOrigin: baseOrigin }, false, true);
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

const html3 = SignatureEngine.generateHtml(data3, { assetOrigin: baseOrigin }, false, true);
assert(html3.includes('src="https://cdn.mycompany.com/banners/launch-2026.png"'), 'Promo banner image must use HTTPS URL directly');
assert(html3.includes('href="https://mycompany.com/launch?utm_source=email_sig&utm_medium=banner"'), 'Promo banner must link to targetUrl');
console.log('✔ Campaign promo banner properly links remote HTTPS image and click destination');

console.log('--- TEST 4: Relative Path Resolution to Vercel Origin ---');
const data4 = {
  ...data1,
  avatarUrl: '/assets/my-custom-photo.jpg',
  showLogo: true,
  logoUrl: '/assets/my-custom-logo.png'
};

const html4 = SignatureEngine.generateHtml(data4, { assetOrigin: baseOrigin }, false, true);
assert(html4.includes('src="https://mailcraftstudio.vercel.app/assets/my-custom-photo.jpg"'), 'Relative avatar path must resolve to Vercel origin');
assert(html4.includes('src="https://mailcraftstudio.vercel.app/assets/my-custom-logo.png"'), 'Relative logo path must resolve to Vercel origin');
console.log('✔ Relative asset paths correctly auto-expand to full Vercel HTTPS URLs');

console.log('--- TEST 5: Linter Mobile Gmail Audit Check ---');
const audit5 = LinterEngine.audit(html3);
console.log(`Total HTML payload bytes: ${audit5.sizeBytes} (${audit5.sizeFormatted})`);
const mobileCheck = audit5.checks.find(c => c.id === 'mobile_gmail_images');
assert(mobileCheck, 'Linter must include mobile_gmail_images check');
assert(mobileCheck.status === 'pass', `Mobile Gmail image check must pass: ${mobileCheck.message}`);
console.log('✔ Linter successfully validates 100% Mobile Gmail App remote image delivery');

console.log('--- TEST 6: Graceful Base64 Fallback When Requested ---');
const htmlBase64 = SignatureEngine.generateHtml(data1, { iconDeliveryMode: 'base64' }, false, true);
assert(htmlBase64.includes('data:image/svg+xml;base64,'), 'Base64 delivery mode renders data:image/ URIs');
const auditBase64 = LinterEngine.audit(htmlBase64);
const mobileCheckBase64 = auditBase64.checks.find(c => c.id === 'mobile_gmail_images');
assert(mobileCheckBase64 && mobileCheckBase64.status === 'warn', 'Linter should warn if base64 images are detected');
console.log('✔ Linter warns when Base64 is used, guiding users to HTTPS');

console.log('\n========================================');
console.log(' ALL 7 SCHEME & HOSTING VERIFICATION SUITES PASSED! ');
console.log('========================================');
