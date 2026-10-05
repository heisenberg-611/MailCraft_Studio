const assert = require('assert');

// Mock browser storage environments
class StorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.sessionStorage = new StorageMock();
global.localStorage = new StorageMock();

// Mock DOM elements
const mockElements = {};
global.document = {
  getElementById(id) {
    if (!mockElements[id]) {
      mockElements[id] = { value: '', checked: false, style: {} };
    }
    return mockElements[id];
  },
  querySelector(selector) {
    if (selector === '.sidebar-nav-btn.active') {
      return { dataset: { tab: 'tab-socials' } };
    }
    return null;
  },
  querySelectorAll() {
    return [];
  },
  addEventListener() {}
};
global.window = {
  addEventListener() {},
  location: { search: '' }
};

// Mock Presets & Dependencies
global.Presets = {
  defaultData: {
    fullName: 'Default Name',
    jobTitle: 'Default Title',
    company: 'Default Co',
    email: 'test@example.com',
    socials: []
  },
  styles: {
    developerTerminal: {
      settings: {
        template: 'vertical-divider',
        accentColor: '#00DC82',
        iconStyle: 'accent'
      }
    }
  }
};
global.TeamEngine = { roster: [{ id: '1', fullName: 'Team Member 1' }] };

// Load App
const App = require('../js/app.js');

console.log('--- TEST 1: Session Cache Saving & Restoring ---');
App.state.data.fullName = 'Dhrubojyoti Saha Custom';
App.state.data.jobTitle = 'Senior AI Architect';
App.state.data.avatarUrl = 'https://avatars.githubusercontent.com/u/1234567?v=4';
App.state.settings.iconStyle = 'monochrome';
App.state.settings.accentColor = '#8B5CF6';
App.state.templateData.title = 'Quarterly Strategy & Engineering Update';
App.state.templateData.paragraphs = ['Paragraph 1 content', 'Paragraph 2 roadmap'];
App.mode = 'template';
App.inboxTheme = 'dark';
App.clientView = 'outlook';

App.saveToStorage();

// Verify sessionStorage received the cache
const rawSession = global.sessionStorage.getItem('mailcraft_session_cache');
assert(rawSession, 'sessionStorage must contain mailcraft_session_cache');
const parsed = JSON.parse(rawSession);
assert.strictEqual(parsed.data.fullName, 'Dhrubojyoti Saha Custom');
assert.strictEqual(parsed.data.avatarUrl, 'https://avatars.githubusercontent.com/u/1234567?v=4');
assert.strictEqual(parsed.settings.iconStyle, 'monochrome');
assert.strictEqual(parsed.settings.accentColor, '#8B5CF6');
assert.strictEqual(parsed.templateData.title, 'Quarterly Strategy & Engineering Update');
assert.strictEqual(parsed.mode, 'template');
assert.strictEqual(parsed.inboxTheme, 'dark');
assert.strictEqual(parsed.clientView, 'outlook');
assert.strictEqual(parsed.activeTab, 'tab-socials');
console.log('✔ Session cache payload successfully saved to sessionStorage');

console.log('--- TEST 2: Page Reload Simulation ---');
// Reset in-memory state
App.state = {
  data: Object.assign({}, Presets.defaultData),
  settings: Object.assign({}, Presets.styles.developerTerminal.settings),
  templateData: {}
};
App.mode = 'signature';
App.inboxTheme = 'light';

// Trigger loadFromStorage
App.loadFromStorage();

assert.strictEqual(App.state.data.fullName, 'Dhrubojyoti Saha Custom');
assert.strictEqual(App.state.data.avatarUrl, 'https://avatars.githubusercontent.com/u/1234567?v=4', 'External HTTPS avatar must not be wiped');
assert.strictEqual(App.state.settings.iconStyle, 'monochrome');
assert.strictEqual(App.state.settings.accentColor, '#8B5CF6');
assert.strictEqual(App.state.templateData.title, 'Quarterly Strategy & Engineering Update');
assert.strictEqual(App.mode, 'template', 'Mode must restore to template');
assert.strictEqual(App.inboxTheme, 'dark', 'Theme must restore to dark');
assert.strictEqual(App.clientView, 'outlook', 'Client view must restore');
assert.strictEqual(App.savedActiveTab, 'tab-socials', 'Active tab must be remembered');
console.log('✔ All customized settings, template content, theme, and tabs successfully restored on reload');

console.log('--- TEST 3: DOM Form Synchronization with Restored Template Data ---');
App.syncFormWithState();
assert.strictEqual(mockElements['tplSubject'].value, 'Quarterly Strategy & Engineering Update');
assert.strictEqual(mockElements['tplParagraph1'].value, 'Paragraph 1 content');
assert.strictEqual(mockElements['tplParagraph2'].value, 'Paragraph 2 roadmap');
assert.strictEqual(mockElements['avatarUrlInput'].value, 'https://avatars.githubusercontent.com/u/1234567?v=4');
console.log('✔ DOM form inputs perfectly populated from restored state');

console.log('\n========================================');
console.log(' ALL SESSION CACHE TESTS PASSED! ');
console.log('========================================');
