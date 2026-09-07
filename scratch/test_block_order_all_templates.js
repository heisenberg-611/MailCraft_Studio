const assert = require('assert');
const Presets = require('../js/presets.js');
const Icons = require('../js/icons.js');
const DEFAULT_AVATAR_BASE64 = require('../assets/default-avatar.js');

global.Presets = Presets;
global.Icons = Icons;
global.DEFAULT_AVATAR_BASE64 = DEFAULT_AVATAR_BASE64;

const SignatureEngine = require('../js/signature-engine.js');

const templates = [
  'vertical-divider',
  'horizontal-bar',
  'two-column',
  'modern-card',
  'minimal-left',
  'compact-inline',
  'header-banner',
  'academic-affil',
  'micro-thread',
  'ascii-terminal'
];

const testData = Object.assign({}, Presets.defaultData, {
  fullName: 'Dhrubojyoti Saha',
  jobTitle: 'Software Architect',
  phone: '+880 1607-608232',
  email: 'dhrubojyoti.saha@g.bracu.ac.bd',
  website: 'www.dhrubojyoti.dev'
});

console.log('--- Testing Modular Block Order Across All 10 Templates ---');

templates.forEach(tpl => {
  // Test 1: Default order: identity before contact
  const defaultHtml = SignatureEngine.generateHtml(testData, {
    template: tpl,
    blockOrder: ['identity', 'contact', 'socials', 'badges', 'banner', 'footer']
  }, false, true);

  const idxTitleDefault = defaultHtml.indexOf('Software Architect');
  const idxPhoneDefault = defaultHtml.indexOf('+880 1607-608232');

  assert(idxTitleDefault !== -1, `Template [${tpl}] contains title`);
  assert(idxPhoneDefault !== -1, `Template [${tpl}] contains phone`);
  assert(idxTitleDefault < idxPhoneDefault, `Template [${tpl}] default order: identity (${idxTitleDefault}) MUST come before contact (${idxPhoneDefault})`);

  // Test 2: Reordered: contact before identity
  const reorderedHtml = SignatureEngine.generateHtml(testData, {
    template: tpl,
    blockOrder: ['contact', 'identity', 'socials', 'badges', 'banner', 'footer']
  }, false, true);

  const idxTitleReordered = reorderedHtml.indexOf('Software Architect');
  const idxPhoneReordered = reorderedHtml.indexOf('+880 1607-608232');

  assert(idxPhoneReordered < idxTitleReordered, `Template [${tpl}] custom order: contact (${idxPhoneReordered}) MUST come before identity (${idxTitleReordered})`);

  console.log(`✓ Template [${tpl}] dynamically responds to custom modular block order!`);
});

console.log('--- ALL 10 TEMPLATES PASSED MODULAR BLOCK ORDER AUDIT ---');
