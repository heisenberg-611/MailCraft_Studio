/**
 * Verification Test: No-Image Hyperlink Templates & Delivery Notices
 */
const fs = require('fs');

const Icons = require('../js/icons.js');
const Presets = require('../js/presets.js');
const SignatureEngine = require('../js/signature-engine.js');
const InstallationGuides = require('../js/guides.js');
const studioHtml = fs.readFileSync(__dirname + '/../studio.html', 'utf8');

let passed = 0;
let failed = 0;

function assert(description, condition, err) {
  if (condition) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${description}`);
    if (err) console.error(err);
    failed++;
  }
}

console.log("\n=================================================");
console.log("TEST SUITE: No-Image Hyperlink Templates & Delivery Guidance");
console.log("=================================================");

const testData = {
  fullName: 'Dhrubojyoti Saha',
  jobTitle: 'Software Architect & Full-Stack Engineer',
  company: 'BRAC University',
  department: 'Dept. of Computer Science & Engineering',
  phone: '+880 1607-608232',
  email: 'dhrubojyoti.saha@g.bracu.ac.bd',
  website: 'https://www.dhrubojyoti.dev',
  address: 'Dhaka, Bangladesh',
  avatarUrl: 'https://example.com/avatar.png', // Provided avatar to ensure template ignores <img>
  socials: {
    github: 'https://github.com/heisenberg-611',
    linkedin: 'https://linkedin.com/in/dhrubojyoti-saha',
    x: 'https://x.com/dhrubo',
    researchGate: 'https://researchgate.net/profile/dhrubo'
  }
};

const noImageTemplates = ['clean-text', 'editorial-links', 'badge-chip-link'];

console.log("\n--- Section 1: Template Image-Free & Link Preservation Checks ---");
noImageTemplates.forEach(tpl => {
  const settings = {
    template: tpl,
    primaryColor: '#00DC82',
    accentColor: '#00DC82',
    fontFamily: 'system',
    fontSize: 13,
    compactMode: false
  };

  const htmlPreview = SignatureEngine.generateHtml(testData, settings, false, false);
  const htmlExport = SignatureEngine.generateHtml(testData, settings, false, true);
  const htmlDark = SignatureEngine.generateHtml(testData, settings, true, true);

  // 1. Zero <img> tags
  const hasImg = /<img\b/i.test(htmlExport);
  assert(`[${tpl}] contains ZERO <img tags in export HTML`, !hasImg);

  // 2. Active Hyperlinks
  assert(`[${tpl}] contains email mailto: link`, htmlExport.includes('mailto:dhrubojyoti.saha@g.bracu.ac.bd'));
  assert(`[${tpl}] contains phone tel: link`, htmlExport.includes('tel:+8801607608232') || htmlExport.includes('+880 1607-608232'));
  assert(`[${tpl}] contains website hyperlink`, htmlExport.includes('https://www.dhrubojyoti.dev'));
  assert(`[${tpl}] contains GitHub link`, htmlExport.includes('https://github.com/heisenberg-611'));
  assert(`[${tpl}] contains LinkedIn link`, htmlExport.includes('https://linkedin.com/in/dhrubojyoti-saha'));

  // 3. Dark mode adaptation
  assert(`[${tpl}] dark mode output is valid and non-empty`, typeof htmlDark === 'string' && htmlDark.length > 100);

  // 4. Export cleanliness (no data-inline-field, no contenteditable)
  assert(`[${tpl}] export mode strips data-inline-field`, !htmlExport.includes('data-inline-field'));
  assert(`[${tpl}] export mode strips contenteditable`, !htmlExport.includes('contenteditable'));
  assert(`[${tpl}] preview mode contains data-inline-field`, htmlPreview.includes('data-inline-field'));
});

console.log("\n--- Section 2: Preset Definitions for No-Image Templates ---");
const expectedPresets = ['cleanTextHyperlink', 'editorialMinimalText', 'badgeChipLinks'];
expectedPresets.forEach(presetKey => {
  const preset = Presets.styles[presetKey];
  assert(`Preset [${presetKey}] exists in Presets.styles`, !!preset);
  if (preset) {
    assert(`Preset [${presetKey}] uses no-image template`, noImageTemplates.includes(preset.settings.template));
    const rendered = SignatureEngine.generateHtml(testData, preset.settings, false, true);
    assert(`Preset [${presetKey}] generates HTML with zero <img> tags`, !/<img\b/i.test(rendered));
  }
});

console.log("\n--- Section 3: Delivery Guidance Notices in Studio & Guides ---");
// 1. studio.html delivery notice bar
assert(`studio.html contains delivery-notice-bar`, studioHtml.includes('delivery-notice-bar'));
assert(`studio.html mentions Desktop webmail/clients recommendation`, studioHtml.includes('Desktop webmail/clients'));
assert(`studio.html mentions No-Image Hyperlink Templates for mobile`, studioHtml.includes('No-Image Hyperlink Templates'));

// 2. studio.html pro-tip in template section
assert(`studio.html template layout section contains pro tip`, studioHtml.includes('template-note-tip'));

// 3. guides.js mobileApp client guide
assert(`InstallationGuides has mobileApp client`, !!InstallationGuides.clients.mobileApp);
assert(`InstallationGuides resolveClientKey('mobile') resolves to mobileApp`, InstallationGuides.resolveClientKey('mobile') === 'mobileApp');
assert(`InstallationGuides resolveClientKey('ios') resolves to mobileApp`, InstallationGuides.resolveClientKey('ios') === 'mobileApp');
assert(`InstallationGuides resolveClientKey('android') resolves to mobileApp`, InstallationGuides.resolveClientKey('android') === 'mobileApp');
assert(`renderDetailCardContent includes delivery notice banner`, InstallationGuides.renderDetailCardContent('mobileApp').includes('guide-delivery-notice'));

console.log("\n=================================================");
console.log(`Test Results: ${passed} passed, ${failed} failed.`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
}
