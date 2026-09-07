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
  fullName: 'Antigravity Architect',
  jobTitle: 'Principal Lead Engineer',
  company: 'BRAC University',
  phone: '+880 1607-608232',
  email: 'dhrubojyoti.saha@g.bracu.ac.bd',
  website: 'www.dhrubojyoti.dev'
});

console.log('--- Testing WYSIWYG Inline Editing in All 10 Templates ---');

templates.forEach(tpl => {
  const settings = { template: tpl };

  // 1. Test Preview Mode (isExport = false)
  const previewHtml = SignatureEngine.generateHtml(testData, settings, false, false);
  
  assert(previewHtml.includes('data-inline-field="fullName"'), `Template [${tpl}] preview MUST have data-inline-field="fullName"`);
  assert(previewHtml.includes('data-inline-field="jobTitle"'), `Template [${tpl}] preview MUST have data-inline-field="jobTitle"`);
  assert(previewHtml.includes('contenteditable="true"'), `Template [${tpl}] preview MUST have contenteditable="true"`);

  if (tpl === 'micro-thread') {
    assert(previewHtml.includes('data-inline-field="phone"'), `micro-thread MUST have data-inline-field="phone"`);
    assert(previewHtml.includes('data-inline-field="email"'), `micro-thread MUST have data-inline-field="email"`);
    assert(previewHtml.includes('data-inline-field="website"'), `micro-thread MUST have data-inline-field="website"`);
  }

  if (tpl === 'ascii-terminal') {
    assert(previewHtml.includes('data-inline-field="phone"'), `ascii-terminal MUST have data-inline-field="phone"`);
    assert(previewHtml.includes('data-inline-field="email"'), `ascii-terminal MUST have data-inline-field="email"`);
    assert(previewHtml.includes('data-inline-field="website"'), `ascii-terminal MUST have data-inline-field="website"`);
  }

  // 2. Test Export Mode (isExport = true)
  const exportHtml = SignatureEngine.generateHtml(testData, settings, false, true);
  assert(!exportHtml.includes('data-inline-field'), `Template [${tpl}] export MUST NOT contain data-inline-field`);
  assert(!exportHtml.includes('contenteditable="true"'), `Template [${tpl}] export MUST NOT contain contenteditable="true"`);
  assert(exportHtml.includes('Antigravity Architect'), `Template [${tpl}] export MUST contain clean text`);

  console.log(`✓ Template [${tpl}] verified for preview inline editing and clean export.`);
});

console.log('--- ALL 10 TEMPLATES PASSED WYSIWYG AUDIT ---');
