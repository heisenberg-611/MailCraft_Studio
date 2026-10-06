/**
 * Preview Simulator & Email Client Chrome Engine
 * Authentically simulates Gmail, Apple Mail, Outlook, and Yahoo interfaces,
 * live preheader preview with length diagnostics, and multi-folder inbox simulators.
 */

const PreviewSimulator = {
  /**
   * Updates the in-sidebar Preheader Live Preview Widget and Diagnostic Bar
   */
  updatePreheaderPreview(app) {
    if (!app && typeof App !== 'undefined') app = App;
    app = app || {};
    const canvas = document.getElementById('preheaderSnippetCanvas');
    const badge = document.getElementById('preheaderLengthBadge');
    const meterFill = document.getElementById('preheaderMeterFill');
    const countText = document.getElementById('preheaderCharCountText');
    const adviceText = document.getElementById('preheaderAdviceText');

    const preheaderInput = document.getElementById('tplPreheader');
    const preheader = (preheaderInput && preheaderInput.value !== undefined)
      ? preheaderInput.value
      : ((app.state && app.state.templateData && app.state.templateData.preheader !== undefined)
        ? app.state.templateData.preheader
        : '');

    const subjectInput = document.getElementById('tplSubject');
    const subject = (subjectInput && subjectInput.value !== undefined)
      ? subjectInput.value
      : ((app.state && app.state.templateData && app.state.templateData.title)
        ? app.state.templateData.title
        : 'Introduction & Project Collaboration');

    const fullName = (app.state && app.state.data && app.state.data.fullName)
      ? app.state.data.fullName
      : 'Dhrubojyoti Saha';

    const charCount = preheader.length;
    const maxRecommended = 90;
    const percentage = Math.min(100, Math.max(5, Math.round((charCount / maxRecommended) * 100)));

    if (meterFill) {
      meterFill.style.width = `${percentage}%`;
      meterFill.classList.remove('meter-short', 'meter-optimal', 'meter-long');
      if (charCount < 40) {
        meterFill.classList.add('meter-short');
      } else if (charCount <= 90) {
        meterFill.classList.add('meter-optimal');
      } else {
        meterFill.classList.add('meter-long');
      }
    }

    if (countText) {
      countText.textContent = `${charCount} / ${maxRecommended} chars (Preheader)`;
    }

    if (badge) {
      badge.classList.remove('badge-short', 'badge-long');
      if (charCount === 0) {
        badge.textContent = 'Empty snippet';
        badge.classList.add('badge-short');
      } else if (charCount < 40) {
        badge.textContent = `${charCount} chars • Short snippet`;
        badge.classList.add('badge-short');
      } else if (charCount <= 90) {
        badge.textContent = `${charCount} chars • Optimal`;
      } else {
        badge.textContent = `${charCount} chars • May truncate`;
        badge.classList.add('badge-long');
      }
    }

    if (adviceText) {
      adviceText.className = '';
      if (charCount === 0) {
        adviceText.className = 'advice-short';
        adviceText.innerHTML = '&#9888; No preheader set &mdash; email clients will pull random body text';
      } else if (charCount < 40) {
        adviceText.className = 'advice-short';
        adviceText.innerHTML = '&#8505; Short snippet &mdash; Anti-leak padding recommended to prevent body bleed';
      } else if (charCount <= 90) {
        adviceText.className = 'advice-optimal';
        adviceText.innerHTML = '&check; Perfect length for mobile notifications &amp; desktop inboxes';
      } else {
        adviceText.className = 'advice-warning';
        adviceText.innerHTML = '&#9888; May be clipped on small smartphone screens (40&ndash;70 chars visible)';
      }
    }

    if (!canvas) return;

    const client = app.preheaderPreviewClient || 'gmail';
    const displaySnippet = preheader.trim() || 'No preheader text entered yet...';
    const displaySubject = subject.trim() || 'No Subject';

    if (client === 'gmail') {
      canvas.innerHTML = `
        <div class="snippet-gmail-box">
          <span class="snippet-gmail-star">&#9734;</span>
          <span class="snippet-gmail-sender">${fullName}</span>
          <div class="snippet-gmail-content">
            <span class="snippet-gmail-subject">${displaySubject}</span>
            <span class="snippet-gmail-sep">&ndash;</span>
            <span class="snippet-gmail-preheader">${displaySnippet}</span>
          </div>
          <span class="snippet-gmail-time">10:42 AM</span>
        </div>
      `;
    } else if (client === 'apple') {
      canvas.innerHTML = `
        <div class="snippet-apple-box">
          <div class="snippet-apple-top">
            <div class="snippet-apple-sender-wrap">
              <span class="snippet-apple-dot"></span>
              <span class="snippet-apple-sender">${fullName}</span>
            </div>
            <span class="snippet-apple-time">10:42 AM</span>
          </div>
          <div class="snippet-apple-subject">${displaySubject}</div>
          <div class="snippet-apple-preheader">${displaySnippet}</div>
        </div>
      `;
    } else if (client === 'ios') {
      canvas.innerHTML = `
        <div class="snippet-ios-box">
          <div class="snippet-ios-header">
            <div class="snippet-ios-app">
              <div class="snippet-ios-icon">&#9993;</div>
              <span class="snippet-ios-app-name">Mail</span>
            </div>
            <span class="snippet-ios-time">now</span>
          </div>
          <div class="snippet-ios-sender">${fullName}</div>
          <div class="snippet-ios-subject">${displaySubject}</div>
          <div class="snippet-ios-preheader">${displaySnippet}</div>
        </div>
      `;
    } else { // outlook
      canvas.innerHTML = `
        <div class="snippet-outlook-box">
          <div class="snippet-outlook-top">
            <span class="snippet-outlook-sender">${fullName}</span>
            <span class="snippet-outlook-time">10:42 AM</span>
          </div>
          <div class="snippet-outlook-subject">${displaySubject}</div>
          <div class="snippet-outlook-preheader">${displaySnippet}</div>
        </div>
      `;
    }
  },

  /**
   * Renders the authentic inbox list view simulator in the canvas
   */
  renderSimulatorInboxView(app) {
    if (!app && typeof App !== 'undefined') app = App;
    app = app || {};
    const inboxView = document.getElementById('simulatorInboxView');
    if (!inboxView) return;

    const preheaderInput = document.getElementById('tplPreheader');
    const preheader = (preheaderInput && preheaderInput.value !== undefined)
      ? preheaderInput.value
      : ((app.state && app.state.templateData && app.state.templateData.preheader !== undefined)
        ? app.state.templateData.preheader
        : 'Brief overview and technical roadmap specifications.');

    const subjectInput = document.getElementById('tplSubject');
    const subject = (subjectInput && subjectInput.value !== undefined)
      ? subjectInput.value
      : ((app.state && app.state.templateData && app.state.templateData.title)
        ? app.state.templateData.title
        : 'Introduction & Project Collaboration');

    const fullName = (app.state && app.state.data && app.state.data.fullName)
      ? app.state.data.fullName
      : 'Dhrubojyoti Saha';

    const client = app.clientView || 'gmail';

    let searchPlaceholder = 'Search in mail';
    let tab1 = 'Primary', tab2 = 'Promotions', tab3 = 'Social';
    if (client === 'apple') {
      searchPlaceholder = 'Search All Inboxes';
      tab1 = 'All Inboxes'; tab2 = 'VIP'; tab3 = 'Flagged';
    } else if (client === 'outlook') {
      searchPlaceholder = 'Search Microsoft 365';
      tab1 = 'Focused'; tab2 = 'Other'; tab3 = 'Sent';
    } else if (client === 'yahoo') {
      searchPlaceholder = 'Search Yahoo Mail';
      tab1 = 'Inbox'; tab2 = 'Unread'; tab3 = 'Starred';
    }

    inboxView.innerHTML = `
      <div class="inbox-sim-searchbar">
        <div class="inbox-sim-search-input">
          <span>&#128269;</span>
          <span>${searchPlaceholder}</span>
        </div>
        <span class="inbox-sim-badge">LIVE SIMULATOR</span>
      </div>
      <div class="inbox-sim-tabs">
        <div class="inbox-sim-tab active">&#9993; ${tab1}</div>
        <div class="inbox-sim-tab">&#127991; ${tab2}</div>
        <div class="inbox-sim-tab">&#128101; ${tab3}</div>
      </div>
      <div class="inbox-sim-list">
        <!-- The User's Active Email -->
        <div class="inbox-sim-row active-sim-item">
          <span class="inbox-sim-checkbox">&#9634;</span>
          <span class="inbox-sim-star starred">&#9733;</span>
          <span class="inbox-sim-sender">${fullName}</span>
          <div class="inbox-sim-text">
            <span class="inbox-sim-subject">${subject}</span>
            <span class="inbox-sim-sep">&ndash;</span>
            <span class="inbox-sim-preview">${preheader}</span>
          </div>
          <span class="inbox-sim-date">10:42 AM</span>
        </div>

        <!-- Simulated Context Emails -->
        <div class="inbox-sim-row unread">
          <span class="inbox-sim-checkbox">&#9634;</span>
          <span class="inbox-sim-star">&#9734;</span>
          <span class="inbox-sim-sender">GitHub Notifications</span>
          <div class="inbox-sim-text">
            <span class="inbox-sim-subject">[MailCraft] Run #84 succeeded</span>
            <span class="inbox-sim-sep">&ndash;</span>
            <span class="inbox-sim-preview">All 213 automated tests completed across Retina image processors...</span>
          </div>
          <span class="inbox-sim-date">09:15 AM</span>
        </div>

        <div class="inbox-sim-row">
          <span class="inbox-sim-checkbox">&#9634;</span>
          <span class="inbox-sim-star">&#9734;</span>
          <span class="inbox-sim-sender">Stripe Payments</span>
          <div class="inbox-sim-text">
            <span class="inbox-sim-subject">Monthly invoice for Studio Pro</span>
            <span class="inbox-sim-sep">&ndash;</span>
            <span class="inbox-sim-preview">Your monthly receipt for subscription reference #INV-9204...</span>
          </div>
          <span class="inbox-sim-date">Yesterday</span>
        </div>

        <div class="inbox-sim-row">
          <span class="inbox-sim-checkbox">&#9634;</span>
          <span class="inbox-sim-star">&#9734;</span>
          <span class="inbox-sim-sender">Vercel Edge Network</span>
          <div class="inbox-sim-text">
            <span class="inbox-sim-subject">Deployment mailcraftstudio.vercel.app ready</span>
            <span class="inbox-sim-sep">&ndash;</span>
            <span class="inbox-sim-preview">Production build v2.2.0 deployed across 34 global edge regions...</span>
          </div>
          <span class="inbox-sim-date">Oct 05</span>
        </div>
      </div>
    `;
  },

  /**
   * Render Authentic Simulator Chrome for Gmail, Apple Mail, Outlook, and Yahoo
   */
  renderClientChrome(clientName, app) {
    if (typeof clientName === 'object' && clientName !== null) {
      const temp = app;
      app = clientName;
      clientName = temp;
    }
    if (!app && typeof App !== 'undefined') app = App;
    app = app || {};
    if (!clientName && app.clientView) clientName = app.clientView;
    if (!clientName) clientName = 'gmail';

    const clientWindow = document.getElementById('clientWindow');
    const headerEl = document.getElementById('simulatorHeader');
    const fieldsEl = document.getElementById('simulatorFields');
    const footerEl = document.getElementById('simulatorFooter');
    
    if (clientWindow) {
      clientWindow.classList.remove('client-gmail', 'client-apple', 'client-outlook', 'client-yahoo');
      clientWindow.classList.add(`client-${clientName}`);
    }

    const subjectVal = (app.state && app.state.templateData && app.state.templateData.title) 
      ? app.state.templateData.title 
      : 'Introduction & Project Update';
    const fullName = (app.state && app.state.data && app.state.data.fullName) 
      ? app.state.data.fullName 
      : 'Dhrubojyoti Saha';
    const emailAddr = (app.state && app.state.data && app.state.data.email) 
      ? app.state.data.email 
      : 'dhrubojyoti.saha@g.bracu.ac.bd';
    const fromVal = `${fullName} &lt;${emailAddr}&gt;`;

    if (clientName === 'gmail') {
      if (headerEl) {
        headerEl.className = 'gmail-header-wrapper';
        headerEl.innerHTML = `
          <div class="gmail-chrome-header">
            <div class="gmail-title">New Message</div>
            <div class="gmail-window-controls">
              <span class="ctrl-btn" title="Minimize">&minus;</span>
              <span class="ctrl-btn" title="Full screen">&#x2922;</span>
              <span class="ctrl-btn" title="Save & Close">&times;</span>
            </div>
          </div>
        `;
      }
      if (fieldsEl) {
        fieldsEl.className = 'gmail-compose-fields';
        fieldsEl.innerHTML = `
          <div class="gmail-field-row">
            <span class="gmail-field-label">Recipients</span>
            <div class="gmail-recipient-chip">
              <span class="chip-avatar">R</span>
              <span class="chip-name">recipient@domain.com</span>
              <span class="chip-remove">&times;</span>
            </div>
            <div class="gmail-field-actions">
              <span class="action-link">Cc</span>
              <span class="action-link">Bcc</span>
            </div>
          </div>
          <div class="gmail-field-row gmail-subject-row">
            <input type="text" class="gmail-subject-input" id="previewSubjectLine" readonly value="${subjectVal}">
          </div>
        `;
      }
      if (footerEl) {
        footerEl.className = 'gmail-footer-toolbar';
        footerEl.innerHTML = `
          <div class="gmail-footer-left">
            <button class="gmail-send-btn">
              <span>Send</span>
              <span class="send-dropdown">&#x25BE;</span>
            </button>
            <div class="gmail-formatting-tools">
              <span class="tool-btn" title="Formatting options">A</span>
              <span class="tool-btn" title="Attach files">&#x1F4CE;</span>
              <span class="tool-btn" title="Insert link">&#x1F517;</span>
              <span class="tool-btn" title="Insert emoji">&#x1F60A;</span>
              <span class="tool-btn" title="Insert files using Drive">&#x1F4C1;</span>
              <span class="tool-btn" title="Insert photo">&#x1F5BC;</span>
              <span class="tool-btn" title="Toggle confidential mode">&#x1F512;</span>
              <span class="tool-btn" title="Insert signature">&#x270D;</span>
            </div>
          </div>
          <div class="gmail-footer-right">
            <span class="tool-btn trash-btn" title="Discard draft">&#x1F5D1;</span>
          </div>
        `;
      }
    } else if (clientName === 'apple') {
      if (headerEl) {
        headerEl.className = 'apple-header-wrapper';
        headerEl.innerHTML = `
          <div class="apple-chrome-header">
            <div class="apple-traffic-lights">
              <span class="traffic-light red" title="Close"></span>
              <span class="traffic-light yellow" title="Minimize"></span>
              <span class="traffic-light green" title="Zoom"></span>
            </div>
            <div class="apple-title">New Message &mdash; Mail</div>
            <div class="apple-header-spacer"></div>
          </div>
          <div class="apple-toolbar">
            <button class="apple-tool-action primary" title="Send (&#x2318;D)">
              <span class="apple-icon">&#x2708;</span> Send
            </button>
            <button class="apple-tool-action" title="Attach file">
              <span class="apple-icon">&#x1F4CE;</span> Attach
            </button>
            <button class="apple-tool-action" title="Show format bar">
              <span class="apple-icon">Aa</span> Format
            </button>
            <button class="apple-tool-action" title="Show photo browser">
              <span class="apple-icon">&#x1F5BC;</span> Media
            </button>
          </div>
        `;
      }
      if (fieldsEl) {
        fieldsEl.className = 'gmail-compose-fields';
        fieldsEl.innerHTML = `
          <div class="apple-field-row">
            <span class="apple-field-label">To:</span>
            <div class="apple-token-pill">recipient@domain.com</div>
          </div>
          <div class="apple-field-row">
            <span class="apple-field-label">Cc:</span>
            <span class="apple-field-placeholder"></span>
          </div>
          <div class="apple-field-row">
            <span class="apple-field-label">From:</span>
            <span class="apple-field-value">${fromVal}</span>
          </div>
          <div class="apple-field-row apple-subject-row">
            <span class="apple-field-label">Subject:</span>
            <span class="apple-field-value bold" id="previewSubjectLine">${subjectVal}</span>
          </div>
        `;
      }
      if (footerEl) {
        footerEl.className = 'apple-status-bar';
        footerEl.innerHTML = `
          <span class="apple-status-dot"></span>
          <span class="apple-status-text">Draft saved to iCloud &bull; macOS Mail</span>
        `;
      }
    } else if (clientName === 'yahoo') {
      if (headerEl) {
        headerEl.className = 'yahoo-header-wrapper';
        headerEl.innerHTML = `
          <div class="yahoo-chrome-header">
            <div class="yahoo-header-left">
              <span class="yahoo-logo-pill">yahoo<b>!</b></span>
              <span class="yahoo-header-divider"></span>
              <span class="yahoo-title">New Message</span>
            </div>
            <div class="yahoo-window-controls">
              <span class="ctrl-btn" title="Minimize">&minus;</span>
              <span class="ctrl-btn" title="Pop out">&#x2922;</span>
              <span class="ctrl-btn close-btn" title="Close">&times;</span>
            </div>
          </div>
        `;
      }
      if (fieldsEl) {
        fieldsEl.className = 'yahoo-compose-fields';
        fieldsEl.innerHTML = `
          <div class="yahoo-field-row">
            <span class="yahoo-field-label">To</span>
            <div class="yahoo-recipient-pill">
              <span class="yahoo-pill-avatar">R</span>
              <span class="yahoo-pill-name">recipient@domain.com</span>
              <span class="yahoo-pill-remove" title="Remove">&times;</span>
            </div>
            <div class="yahoo-field-actions">
              <span class="yahoo-action">Cc/Bcc</span>
            </div>
          </div>
          <div class="yahoo-field-row yahoo-subject-row">
            <input type="text" class="yahoo-subject-input" id="previewSubjectLine" readonly value="${subjectVal}" placeholder="Subject">
          </div>
        `;
      }
      if (footerEl) {
        footerEl.className = 'yahoo-footer-toolbar';
        footerEl.innerHTML = `
          <div class="yahoo-footer-left">
            <button class="yahoo-send-btn">
              <span>Send</span>
            </button>
            <div class="yahoo-formatting-tools">
              <span class="tool-btn" title="Format Text"><b>A</b></span>
              <span class="tool-btn" title="Attach Files">&#x1F4CE;</span>
              <span class="tool-btn" title="Add GIF / Emoji">&#x1F60A;</span>
              <span class="tool-btn" title="Insert Stationery">&#x1F3A8;</span>
              <span class="tool-btn" title="Insert Link">&#x1F517;</span>
            </div>
          </div>
          <div class="yahoo-footer-right">
            <span class="yahoo-status-text">Draft saved</span>
            <span class="tool-btn trash-btn" title="Delete draft">&#x1F5D1;</span>
          </div>
        `;
      }
    } else { // outlook
      if (headerEl) {
        headerEl.className = 'outlook-header-wrapper';
        headerEl.innerHTML = `
          <div class="outlook-chrome-header">
            <div class="outlook-header-left">
              <span class="outlook-app-icon">&#x2709;</span>
              <span class="outlook-title">Outlook Mail &mdash; Message</span>
            </div>
            <div class="outlook-window-controls">
              <span class="ctrl-btn" title="Minimize">&minus;</span>
              <span class="ctrl-btn" title="Maximize">&#x25A1;</span>
              <span class="ctrl-btn close-btn" title="Close">&times;</span>
            </div>
          </div>
          <div class="outlook-ribbon">
            <button class="outlook-send-btn" title="Send (Ctrl+Enter)">
              <span class="outlook-send-icon">&#x27A4;</span> Send
            </button>
            <div class="outlook-ribbon-group">
              <button class="outlook-ribbon-btn" title="Discard"><span class="ribbon-icon">&#x1F5D1;</span> Discard</button>
              <button class="outlook-ribbon-btn" title="Attach File"><span class="ribbon-icon">&#x1F4CE;</span> Attach File</button>
              <button class="outlook-ribbon-btn" title="Encrypt message"><span class="ribbon-icon">&#x1F512;</span> Encrypt</button>
              <button class="outlook-ribbon-btn" title="Categorize"><span class="ribbon-icon">&#x1F3F7;</span> Categorize</button>
            </div>
          </div>
        `;
      }
      if (fieldsEl) {
        fieldsEl.className = 'outlook-compose-fields';
        fieldsEl.innerHTML = `
          <div class="outlook-field-row">
            <button class="outlook-pill-btn">To</button>
            <div class="outlook-chip">
              <span class="chip-title">recipient@domain.com</span>
              <span class="chip-close">&times;</span>
            </div>
          </div>
          <div class="outlook-field-row">
            <button class="outlook-pill-btn">Cc</button>
            <span class="outlook-placeholder"></span>
          </div>
          <div class="outlook-field-row outlook-subject-row">
            <input type="text" class="outlook-subject-input" id="previewSubjectLine" readonly value="${subjectVal}" placeholder="Add a subject">
          </div>
        `;
      }
      if (footerEl) {
        footerEl.className = 'outlook-footer-toolbar';
        footerEl.innerHTML = `
          <div class="outlook-status">
            <span class="status-indicator"></span>
            <span>Saved to Drafts &bull; Microsoft 365 Exchange Online</span>
          </div>
        `;
      }
    }
  }
};

if (typeof window !== 'undefined') {
  window.PreviewSimulator = PreviewSimulator;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PreviewSimulator;
}
