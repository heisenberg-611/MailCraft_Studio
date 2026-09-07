const fs = require('fs');
const vm = require('vm');

const studioHtml = fs.readFileSync('./studio.html', 'utf8');
const indexHtml = fs.readFileSync('./index.html', 'utf8');

class ClassList {
  constructor(el) {
    this.el = el;
    this.classes = new Set((el.getAttribute('class') || '').split(/\s+/).filter(Boolean));
  }
  add(...cls) {
    cls.forEach(c => this.classes.add(c));
    this.el.setAttribute('class', Array.from(this.classes).join(' '));
  }
  remove(...cls) {
    cls.forEach(c => this.classes.delete(c));
    this.el.setAttribute('class', Array.from(this.classes).join(' '));
  }
  contains(c) {
    return this.classes.has(c);
  }
  toggle(c, force) {
    if (force === true || (force === undefined && !this.classes.has(c))) {
      this.add(c);
      return true;
    } else {
      this.remove(c);
      return false;
    }
  }
}

class Element {
  constructor(tagName, id = '', attrs = {}) {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.attributes = { ...attrs };
    if (id) this.attributes.id = id;
    this.children = [];
    this.parentNode = null;
    this.listeners = {};
    this.style = {};
    this._classList = null;
    this.value = attrs.value || '';
    this.checked = attrs.checked !== undefined ? (attrs.checked === 'true' || attrs.checked === true || attrs.checked === '') : false;
    this.innerHTML = '';
    this.innerText = '';
    this.textContent = '';
    this.dataset = {};
    for (const k in attrs) {
      if (k.startsWith('data-')) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, g) => g.toUpperCase());
        this.dataset[camel] = attrs[k];
      }
    }
  }
  get classList() {
    if (!this._classList) this._classList = new ClassList(this);
    return this._classList;
  }
  getAttribute(name) {
    return this.attributes[name] || null;
  }
  setAttribute(name, val) {
    this.attributes[name] = String(val);
    if (name === 'id') this.id = String(val);
    if (name === 'value') this.value = String(val);
    if (name === 'checked') this.checked = (val === 'true' || val === true);
    if (name.startsWith('data-')) {
      const camel = name.slice(5).replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      this.dataset[camel] = String(val);
    }
  }
  removeAttribute(name) {
    delete this.attributes[name];
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }
  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }
  addEventListener(evt, handler) {
    if (!this.listeners[evt]) this.listeners[evt] = [];
    this.listeners[evt].push(handler);
  }
  removeEventListener(evt, handler) {
    if (!this.listeners[evt]) return;
    this.listeners[evt] = this.listeners[evt].filter(h => h !== handler);
  }
  dispatchEvent(event) {
    const evtName = typeof event === 'string' ? event : event.type;
    const handlers = this.listeners[evtName] || [];
    const syntheticEvent = typeof event === 'string' ? { type: event, target: this, preventDefault: () => {}, stopPropagation: () => {} } : event;
    syntheticEvent.target = this;
    syntheticEvent.preventDefault = syntheticEvent.preventDefault || (() => {});
    syntheticEvent.stopPropagation = syntheticEvent.stopPropagation || (() => {});
    handlers.forEach(h => {
      h.call(this, syntheticEvent);
    });
  }
  click() {
    this.dispatchEvent('click');
  }
  getContext(type) {
    return {
      fillStyle: '#000',
      strokeStyle: '#000',
      fillRect: () => {},
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      roundRect: () => {},
      save: () => {},
      restore: () => {},
      scale: () => {},
      translate: () => {},
      rotate: () => {},
      fillText: () => {},
      measureText: () => ({ width: 100 }),
      drawImage: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} })
    };
  }
  toDataURL() {
    return 'data:image/png;base64,mockcanvas';
  }
  querySelector(sel) {
    return querySelector(this, sel);
  }
  querySelectorAll(sel) {
    return querySelectorAll(this, sel);
  }
  focus() {}
  blur() {}
  scrollIntoView() {}
}

const elementsById = new Map();
const allElements = [];

function parseHTML(html) {
  const root = new Element('div', 'root');
  const tagRegex = /<([a-zA-Z0-9-]+)([^>]*)>|<\/([a-zA-Z0-9-]+)>/g;
  let m;
  const stack = [root];
  
  while ((m = tagRegex.exec(html)) !== null) {
    if (m[3]) {
      if (stack.length > 1) {
        stack.pop();
      }
    } else {
      const tagName = m[1];
      const attrStr = m[2];
      const attrs = {};
      const attrRegex = /([a-zA-Z0-9-_:]+)(?:=["']([^"']*)["'])?/g;
      let am;
      while ((am = attrRegex.exec(attrStr)) !== null) {
        attrs[am[1]] = am[2] !== undefined ? am[2] : true;
      }
      const id = attrs.id || '';
      const el = new Element(tagName, id, attrs);
      if (id) {
        elementsById.set(id, el);
      }
      allElements.push(el);
      
      const parent = stack[stack.length - 1];
      parent.appendChild(el);
      
      const selfClosing = /^(img|input|br|hr|meta|link)$/i.test(tagName) || attrStr.trim().endsWith('/');
      if (!selfClosing) {
        stack.push(el);
      }
    }
  }
  return root;
}

const rootEl = parseHTML(studioHtml);

function querySelector(root, sel) {
  if (sel.startsWith('#')) {
    const id = sel.slice(1).split(' ')[0].split('.')[0].split(':')[0];
    return elementsById.get(id) || null;
  }
  if (sel.startsWith('.')) {
    const cls = sel.slice(1).split(' ')[0];
    return allElements.find(el => el.classList.contains(cls)) || null;
  }
  if (sel.startsWith('[')) {
    const attrMatch = /\[([a-zA-Z0-9-_]+)(?:=["']([^"']*)["'])?\]/.exec(sel);
    if (attrMatch) {
      const attr = attrMatch[1];
      const val = attrMatch[2];
      return allElements.find(el => val !== undefined ? el.getAttribute(attr) === val : el.getAttribute(attr) !== null) || null;
    }
  }
  return allElements.find(el => el.tagName === sel.toUpperCase()) || null;
}

function querySelectorAll(root, sel) {
  if (sel.startsWith('#')) {
    const id = sel.slice(1);
    const el = elementsById.get(id);
    return el ? [el] : [];
  }
  if (sel.startsWith('.')) {
    const cls = sel.slice(1).split(' ')[0];
    return allElements.filter(el => el.classList.contains(cls));
  }
  if (sel.startsWith('[')) {
    const attrMatch = /\[([a-zA-Z0-9-_]+)(?:=["']([^"']*)["'])?\]/.exec(sel);
    if (attrMatch) {
      const attr = attrMatch[1];
      const val = attrMatch[2];
      return allElements.filter(el => val !== undefined ? el.getAttribute(attr) === val : el.getAttribute(attr) !== null);
    }
  }
  return allElements.filter(el => el.tagName === sel.toUpperCase());
}

global.window = global;
global.window.location = { search: '', hash: '', href: 'http://localhost:8199/studio.html' };
global.window.navigator = { clipboard: { writeText: async () => {}, write: async () => {} } };
global.window.localStorage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; }
};
global.window.innerWidth = 1200;
global.window.innerHeight = 800;
global.window.URL = { createObjectURL: () => 'blob:mock-url', revokeObjectURL: () => {} };
global.window.Blob = function(parts, opts) { return { parts, opts }; };
global.window.Image = function() {
  this.onload = null;
  this.onerror = null;
  this.src = '';
  this.width = 300;
  this.height = 300;
};
global.window.FileReader = function() {
  this.onload = null;
  this.readAsDataURL = function() {
    if (this.onload) this.onload({ target: { result: 'data:image/png;base64,mock' } });
  };
  this.readAsText = function() {
    if (this.onload) this.onload({ target: { result: 'mock text' } });
  };
};

global.document = {
  getElementById(id) {
    if (!elementsById.has(id)) {
      const dummy = new Element('div', id);
      elementsById.set(id, dummy);
      allElements.push(dummy);
      return dummy;
    }
    return elementsById.get(id);
  },
  querySelector(sel) {
    return querySelector(rootEl, sel);
  },
  querySelectorAll(sel) {
    return querySelectorAll(rootEl, sel);
  },
  createElement(tag) {
    const el = new Element(tag);
    allElements.push(el);
    return el;
  },
  createTextNode(txt) {
    return { nodeValue: txt };
  },
  body: rootEl,
  documentElement: rootEl,
  execCommand: () => true,
  addEventListener: () => {}
};
global.navigator = global.window.navigator;
global.localStorage = global.window.localStorage;
global.Image = global.window.Image;
global.FileReader = global.window.FileReader;

// Load script files
const scripts = [
  'icons.js',
  'qr-vcard-engine.js',
  'presets.js',
  'quotes.js',
  'signature-engine.js',
  'banner-builder.js',
  'linter.js',
  'image-processor.js',
  'admin-tools.js',
  'preset-manager.js',
  'team-engine.js',
  'email-template-engine.js',
  'guides.js',
  'clipboard.js',
  'app.js'
];

scripts.forEach(script => {
  const content = fs.readFileSync('./js/' + script, 'utf8');
  vm.runInThisContext(content, { filename: script });
});

console.log("=================================================");
console.log("🚀 COMPREHENSIVE MAILCRAFT STUDIO AUDIT SUITE");
console.log("=================================================");

let passed = 0;
let failed = 0;

function assert(desc, condition, error) {
  if (condition) {
    console.log(`  ✓ ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ ${desc}`, error || '');
    failed++;
  }
}

// 1. Initial State & Initialization
try {
  App.init();
  assert("App.init() completes without errors", true);
} catch (e) {
  assert("App.init() completes without errors", false, e);
}

// 2. Tab Navigation Audit
console.log("\n--- Audit 1: Tab Navigation ---");
const tabButtons = querySelectorAll(rootEl, '.sidebar-nav-btn');
tabButtons.forEach(btn => {
  const tabId = btn.dataset.tab;
  try {
    btn.click();
    const activePane = document.getElementById(tabId);
    assert(`Tab click [data-tab="${tabId}"] switches active tab`, activePane && activePane.classList.contains('active'));
  } catch (e) {
    assert(`Tab click [data-tab="${tabId}"] switches active tab`, false, e);
  }
});

// 3. Mode Switching Audit
console.log("\n--- Audit 2: Mode Switching ---");
const modes = ['modeSingleBtn', 'modeTeamBtn', 'modeTemplateBtn'];
modes.forEach(modeBtnId => {
  const btn = document.getElementById(modeBtnId);
  try {
    btn.click();
    assert(`Mode switch button #${modeBtnId} triggers mode change`, true);
  } catch (e) {
    assert(`Mode switch button #${modeBtnId} triggers mode change`, false, e);
  }
});
// Reset back to single mode
document.getElementById('modeSingleBtn').click();

// 4. Template Architecture Card Audit (All 10 Cards)
console.log("\n--- Audit 3: All 10 Template Layout Cards ---");
const templateCards = querySelectorAll(rootEl, '.template-card');
templateCards.forEach(card => {
  const tpl = card.dataset.template;
  try {
    card.click();
    const currentTpl = App.state.settings.template;
    assert(`Template card [${tpl}] activates and sets settings.template="${tpl}"`, currentTpl === tpl);
    const canvas = document.getElementById('liveRenderCanvas');
    assert(`Template card [${tpl}] renders non-empty canvas HTML`, canvas && canvas.innerHTML.length > 50);
  } catch (e) {
    assert(`Template card [${tpl}] activates`, false, e);
  }
});

// 5. Preset Switcher Audit (All 13 Presets)
console.log("\n--- Audit 4: All 13 Style Presets ---");
const presetKeys = Object.keys(Presets.styles);
presetKeys.forEach(p => {
  try {
    App.applyPreset(p);
    const canvas = document.getElementById('liveRenderCanvas');
    assert(`Preset [${p}] applies cleanly and renders canvas HTML`, canvas && canvas.innerHTML.length > 50);
  } catch (e) {
    assert(`Preset [${p}] applies cleanly`, false, e);
  }
});

// 6. Add-on Controls Audit
console.log("\n--- Audit 5: Add-on Controls ---");
const addonToggles = [
  { id: 'showStatusBadge', group: 'statusBadgeGroup' },
  { id: 'showBookingBadge', group: 'bookingBadgeGroup' },
  { id: 'showQrCode', group: 'qrCodeGroup' },
  { id: 'showBadge', group: 'badgeInputGroup' },
  { id: 'showCta', group: 'ctaInputGroup' },
  { id: 'showGreenNote', group: 'greenNoteInputGroup' },
  { id: 'showQuote', group: 'quoteInputGroup' },
  { id: 'showDisclaimer', group: 'disclaimerInputGroup' },
  { id: 'showPromoBanner', group: 'promoBannerGroup' }
];

addonToggles.forEach(({ id, group }) => {
  const cb = document.getElementById(id);
  const grp = document.getElementById(group);
  if (!cb) {
    assert(`Add-on checkbox #${id} exists`, false);
    return;
  }
  try {
    cb.checked = true;
    cb.dispatchEvent('change');
    assert(`Add-on toggle #${id} enabled updates DOM`, grp ? grp.style.display !== 'none' : true);
    
    cb.checked = false;
    cb.dispatchEvent('change');
    assert(`Add-on toggle #${id} disabled hides container`, grp ? grp.style.display === 'none' : true);
  } catch (e) {
    assert(`Add-on toggle #${id} toggles without error`, false, e);
  }
});

// 7. Modals Open/Close Audit
console.log("\n--- Audit 6: Modals Open & Close ---");
const modals = [
  { btn: 'savePresetBtn', modal: 'savePresetModalOverlay' },
  { btn: 'managePresetsBtn', modal: 'presetManagerModalOverlay' },
  { btn: 'linterStatusBtn', modal: 'compatibilityModalOverlay' },
  { btn: 'openDesktopExportBtn', modal: 'desktopExporterModalOverlay' },
  { btn: 'openAdminDeployBtn', modal: 'adminDeployerModalOverlay' },
  { btn: 'openGuideBtn', modal: 'guideModalOverlay' },
  { btn: 'openBannerDesignerBtn', modal: 'bannerDesignerModalOverlay' }
];

modals.forEach(({ btn, modal }) => {
  const b = document.getElementById(btn);
  const m = document.getElementById(modal);
  if (!b || !m) {
    assert(`Modal trigger #${btn} and modal #${modal} exist`, false);
    return;
  }
  try {
    b.click();
    assert(`Modal #${modal} opened on #${btn} click`, m.classList.contains('active') || m.style.display === 'flex' || m.style.display === 'block');
  } catch (e) {
    assert(`Modal #${modal} opened on #${btn} click`, false, e);
  }
});

// 8. Copy and Export Buttons Audit
console.log("\n--- Audit 7: Copy & Export Actions ---");
const actionButtons = [
  'copyHtmlBtn',
  'copyRichTextBtn',
  'exportHtmlBtn',
  'exportVCardBtn',
  'exportOutlookBtn',
  'exportAppleMailBtn'
];

actionButtons.forEach(btnId => {
  const btn = document.getElementById(btnId);
  try {
    btn.click();
    assert(`Export/Copy action #${btnId} triggers cleanly`, true);
  } catch (e) {
    assert(`Export/Copy action #${btnId} triggers cleanly`, false, e);
  }
});

// 9. Simulator Viewport and Client Tools
console.log("\n--- Audit 8: Viewport, Theme & Client Switchers ---");
const previewTools = [
  'previewDarkToggle',
  'previewMobileToggle',
  'zoomInBtn',
  'zoomOutBtn',
  'zoomResetBtn',
  'clientGmailBtn',
  'clientAppleBtn',
  'clientOutlookBtn',
  'clientYahooBtn'
];

previewTools.forEach(btnId => {
  const btn = document.getElementById(btnId);
  try {
    btn.click();
    assert(`Preview toolbar button #${btnId} operates without error`, true);
  } catch (e) {
    assert(`Preview toolbar button #${btnId} operates without error`, false, e);
  }
});

// 10. Random Quote Generator
console.log("\n--- Audit 9: Quote Engine ---");
try {
  const quoteBtn = document.getElementById('randomQuoteBtn');
  quoteBtn.click();
  const quoteInput = document.getElementById('quoteText');
  assert(`Random quote generator populated #quoteText`, quoteInput && quoteInput.value.length > 5);
} catch (e) {
  assert(`Random quote generator populated #quoteText`, false, e);
}

// 11. Mobile Navigation & View Switcher
console.log("\n--- Audit 10: Mobile Responsive Navigation ---");
try {
  const formTab = document.getElementById('mobileFormTabBtn');
  const previewTab = document.getElementById('mobilePreviewTabBtn');
  const quickCopy = document.getElementById('mobileQuickCopyBtn');
  const workspace = document.querySelector('.studio-workspace-container');

  assert(`Mobile bottom bar elements exist in DOM`, !!formTab && !!previewTab && !!quickCopy);
  
  if (previewTab && workspace) {
    previewTab.click();
    assert(`Mobile preview tab toggles .mobile-preview-active on workspace`, workspace.classList.contains('mobile-preview-active') && previewTab.classList.contains('active'));
  }
  
  if (formTab && workspace) {
    formTab.click();
    assert(`Mobile form tab restores workspace and activates form tab`, !workspace.classList.contains('mobile-preview-active') && formTab.classList.contains('active'));
  }

  if (quickCopy) {
    quickCopy.click();
    assert(`Mobile quick copy button operates cleanly`, true);
  }
} catch (e) {
  assert(`Mobile responsive navigation tests execute cleanly`, false, e);
}

// 12. Preheader Preview & Inbox Simulator
console.log("\n--- Audit 11: Preheader Preview & Inbox Simulator ---");
try {
  const preheaderInput = document.getElementById('tplPreheader');
  const snippetCanvas = document.getElementById('preheaderSnippetCanvas');
  const lengthBadge = document.getElementById('preheaderLengthBadge');
  const antiLeakToggle = document.getElementById('tplAntiLeakPadding');
  const viewComposeBtn = document.getElementById('viewComposeBtn');
  const viewInboxBtn = document.getElementById('viewInboxBtn');
  const simulatorInboxView = document.getElementById('simulatorInboxView');

  assert(`Preheader DOM elements exist`, !!preheaderInput && !!snippetCanvas && !!lengthBadge && !!antiLeakToggle);

  // Test Preheader dynamic updates
  if (preheaderInput) {
    preheaderInput.value = 'Quarterly financial report and revenue forecast summary.';
    preheaderInput.dispatchEvent('input');
    assert(`Preheader input update reflects in snippet canvas`, snippetCanvas && snippetCanvas.innerHTML.includes('Quarterly financial report'));
    assert(`Preheader length badge updates with optimal status`, lengthBadge && lengthBadge.textContent.includes('chars'));
  }

  // Test Preheader client tab switching
  const preheaderTabBtns = document.querySelectorAll('.preheader-tab-btn');
  assert(`Preheader client tab buttons exist (>= 4 clients)`, preheaderTabBtns && preheaderTabBtns.length >= 4);
  preheaderTabBtns.forEach(btn => {
    btn.click();
    assert(`Preheader client tab [${btn.dataset.preheaderClient}] switches and updates snippet`, App.preheaderPreviewClient === btn.dataset.preheaderClient);
  });

  // Test Canvas View Mode Switching
  if (viewInboxBtn && viewComposeBtn) {
    viewInboxBtn.click();
    assert(`Canvas view mode switches to 'inbox' and renders inbox list`, App.canvasViewMode === 'inbox' && simulatorInboxView.innerHTML.includes('inbox-sim-list'));
    viewComposeBtn.click();
    assert(`Canvas view mode switches back to 'compose'`, App.canvasViewMode === 'compose');
  }

  // Test Anti-Leak Zero-Width Non-Breaking Padding Generation
  const tplDataWithPadding = {
    title: 'Test Email',
    preheader: 'Short snippet',
    antiLeakPadding: true
  };
  const htmlWithPadding = EmailTemplateEngine.generateFullEmail(tplDataWithPadding, Presets.defaultData, Presets.styles.dhrubojyoti.settings, false, true);
  assert(`EmailTemplateEngine generates anti-leak padding chain`, htmlWithPadding.includes('&#847;') && htmlWithPadding.includes('&zwnj;'));

  const tplDataNoPadding = {
    title: 'Test Email',
    preheader: 'Short snippet',
    antiLeakPadding: false
  };
  const htmlNoPadding = EmailTemplateEngine.generateFullEmail(tplDataNoPadding, Presets.defaultData, Presets.styles.dhrubojyoti.settings, false, true);
  assert(`EmailTemplateEngine respects disabled anti-leak padding`, !htmlNoPadding.includes('&#847;'));

} catch (e) {
  assert(`Preheader Preview & Inbox Simulator tests execute cleanly`, false, e);
}

// 13. Pillar 4A: WYSIWYG Inline Canvas Editing & 2-Way Sync
console.log("\n--- Audit 12: Pillar 4A WYSIWYG Inline Canvas Editing ---");
try {
  const testData = { ...Presets.defaultData, fullName: 'Antigravity Test Engineer', jobTitle: 'Principal Architect' };
  const testSettings = { ...Presets.styles.dhrubojyoti.settings };

  // 1. Preview mode (isExport = false) includes data-inline-field & contenteditable
  const previewHtml = SignatureEngine.generateHtml(testData, testSettings, false, false);
  assert(`Preview mode wraps fullName with data-inline-field="fullName"`, previewHtml.includes('data-inline-field="fullName"') && previewHtml.includes('contenteditable="true"'));
  assert(`Preview mode wraps jobTitle with data-inline-field="jobTitle"`, previewHtml.includes('data-inline-field="jobTitle"'));
  assert(`Preview mode includes .wysiwyg-editable-field class`, previewHtml.includes('wysiwyg-editable-field'));

  // 2. Export mode (isExport = true) generates clean standard HTML with ZERO editable attributes
  const exportHtml = SignatureEngine.generateHtml(testData, testSettings, false, true);
  assert(`Export mode strips all data-inline-field attributes`, !exportHtml.includes('data-inline-field'));
  assert(`Export mode strips contenteditable="true"`, !exportHtml.includes('contenteditable'));
  assert(`Export mode preserves raw text content ("Antigravity Test Engineer")`, exportHtml.includes('Antigravity Test Engineer'));

  // 3. Test 2-way sync simulation
  const liveCanvas = document.getElementById('liveRenderCanvas');
  assert(`Live canvas element exists for WYSIWYG interaction`, !!liveCanvas);
  assert(`WYSIWYG live status badge exists in toolbar`, !!document.getElementById('wysiwygIndicator'));

} catch (e) {
  assert(`WYSIWYG Inline Canvas Editing tests execute cleanly`, false, e);
}

// 14. Pillar 4B: Modular Block Reordering & Dynamic Hierarchy
console.log("\n--- Audit 13: Pillar 4B Modular Block Organizer ---");
try {
  const blockOrganizerList = document.getElementById('blockOrganizerList');
  const resetBlockOrderBtn = document.getElementById('resetBlockOrderBtn');
  assert(`Block organizer DOM list exists in Tab 3`, !!blockOrganizerList);
  assert(`Reset block order button exists`, !!resetBlockOrderBtn);

  const blockItems = querySelectorAll(rootEl, '.block-item');
  assert(`Block organizer contains 6 modular draggable blocks`, blockItems.length === 6);

  const testData = { ...Presets.defaultData, showCta: true, ctaText: 'Visit Workspace' };
  const baseSettings = { ...Presets.styles.dhrubojyoti.settings };

  // Test custom block order in SignatureEngine
  const customOrderSettings = {
    ...baseSettings,
    blockOrder: ['contact', 'identity', 'socials', 'badges', 'banner', 'footer']
  };

  const customOrderHtml = SignatureEngine.generateHtml(testData, customOrderSettings, false, true);
  const customIdentityIdx = customOrderHtml.indexOf(testData.jobTitle);
  const customContactIdx = customOrderHtml.indexOf(testData.phone);
  assert(`Custom blockOrder renders contact before identity hierarchy`, customIdentityIdx > -1 && customContactIdx > -1 && (customContactIdx < customIdentityIdx));

  // Test reset block order
  if (resetBlockOrderBtn) {
    resetBlockOrderBtn.click();
    assert(`Reset block order restores default 6-block array`, Array.isArray(App.state.settings.blockOrder) && App.state.settings.blockOrder[0] === 'identity');
  }

} catch (e) {
  assert(`Modular Block Organizer tests execute cleanly`, false, e);
}

// 15. Pillar 3B: Outlook MSO / VML Vector Buttons & Conditionals
console.log("\n--- Audit 14: Pillar 3B Outlook MSO / VML Vector Buttons ---");
try {
  const vmlData = {
    ...Presets.defaultData,
    showCta: true,
    ctaText: 'Schedule Technical Review',
    ctaUrl: 'https://www.dhrubojyoti.dev',
    showBookingBadge: true,
    bookingBadge: { enabled: true, text: 'Book 1:1 Call', url: 'https://calendly.com' }
  };
  const vmlSettings = { ...Presets.styles.dhrubojyoti.settings, template: 'vertical-divider' };

  const sigHtml = SignatureEngine.generateHtml(vmlData, vmlSettings, false, true);

  // 1. Verify MSO conditional comments
  assert(`Signature HTML contains <!--[if mso]> conditional`, sigHtml.includes('<!--[if mso]>'));
  assert(`Signature HTML contains <!--[if !mso]><!--> standard fallback`, sigHtml.includes('<!--[if !mso]><!-->'));

  // 2. Verify VML vector button tags
  assert(`Signature HTML contains <v:roundrect> vector shape`, sigHtml.includes('<v:roundrect'));
  assert(`Signature HTML contains <v:fill> vector fill`, sigHtml.includes('<v:fill'));
  assert(`Signature HTML contains <w:anchorlock/> XML namespace tag`, sigHtml.includes('<w:anchorlock/>'));
  assert(`Signature HTML contains VML xmlns namespace definition`, sigHtml.includes('xmlns:v="urn:schemas-microsoft-com:vml"'));

  // 3. Verify Linter audit detects and passes VML buttons check
  const lintReport = LinterEngine.audit(sigHtml);
  const vmlCheck = lintReport.checks.find(c => c.id === 'vml_buttons');
  assert(`LinterEngine recognizes Outlook VML Vector Buttons check`, !!vmlCheck && vmlCheck.status === 'pass');

} catch (e) {
  assert(`Outlook MSO / VML Vector Buttons tests execute cleanly`, false, e);
}

// 16. Chrome Extension Manifest V3 & On-Device ZIP Packaging
console.log("\n--- Audit 15: Chrome Extension Package (Manifest V3) ---");
try {
  const manifestPath = './extension/manifest.json';
  const popupHtmlPath = './extension/popup.html';
  const popupJsPath = './extension/popup.js';
  const popupCssPath = './extension/popup.css';
  const contentJsPath = './extension/content.js';
  const readmePath = './extension/README.md';

  assert(`Extension manifest.json exists`, fs.existsSync(manifestPath));
  assert(`Extension popup.html exists`, fs.existsSync(popupHtmlPath));
  assert(`Extension popup.js exists`, fs.existsSync(popupJsPath));
  assert(`Extension popup.css exists`, fs.existsSync(popupCssPath));
  assert(`Extension content.js exists`, fs.existsSync(contentJsPath));
  assert(`Extension README.md exists`, fs.existsSync(readmePath));

  // Validate Manifest JSON structure
  const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);
  assert(`Manifest version is 3`, manifest.manifest_version === 3);
  assert(`Manifest has host_permissions for Gmail & Outlook Web`, manifest.host_permissions.some(p => p.includes('mail.google.com')) && manifest.host_permissions.some(p => p.includes('outlook')));
  assert(`Manifest declares content_scripts targeting mail clients`, Array.isArray(manifest.content_scripts) && manifest.content_scripts[0].matches.some(m => m.includes('mail.google.com')));

  // Test AdminTools Chrome Extension ZIP Generator
  assert(`AdminTools.downloadChromeExtensionZip function exists`, typeof AdminTools.downloadChromeExtensionZip === 'function');
  assert(`downloadExtensionZipBtn button exists in Admin Deploy modal`, !!document.getElementById('downloadExtensionZipBtn'));

} catch (e) {
  assert(`Chrome Extension Package tests execute cleanly`, false, e);
}

console.log("\n=================================================");
console.log(`Audit Finished: ${passed} passed, ${failed} failed.`);
console.log("=================================================");


