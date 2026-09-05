/**
 * Email Client Installation Guides
 * Step-by-step instructions for Gmail, Outlook, Apple Mail, and Thunderbird
 * Zero emojis
 */

const InstallationGuides = {
  clients: {
    gmail: {
      name: 'Gmail (Web & Workspace)',
      steps: [
        'Click the "Copy Signature" button in this studio to copy the rich HTML signature.',
        'Open Gmail in your web browser and click the Settings icon (gear) in the top right.',
        'Click "See all settings" and scroll down to the "Signature" section.',
        'Click "+ Create new", give your signature a name (e.g., "Professional"), and click Create.',
        'Click inside the signature text box on the right and press Cmd + V (Mac) or Ctrl + V (Windows) to paste.',
        'Under "Signature defaults", set your new signature for "For new emails use" and "On reply/forward use".',
        'Scroll to the bottom of the page and click "Save Changes".'
      ],
      tip: 'Your high-definition logo will appear razor-sharp on Retina and 4K displays automatically.'
    },
    appleMail: {
      name: 'Apple Mail (macOS)',
      steps: [
        'Click the "Copy Signature" button in this studio.',
        'Open Apple Mail on your Mac and go to Mail > Settings (or Preferences) in the menu bar.',
        'Select the "Signatures" tab at the top.',
        'Select your email account from the left column, then click the "+" button below the middle column.',
        'Uncheck the box "Always match my default message font".',
        'Click into the signature editing box on the right, delete any default text, and press Cmd + V to paste.',
        'Close Settings and compose a new email to verify the signature.'
      ],
      tip: 'Apple Mail preserves Retina image scaling and vector SVG icons without compression.'
    },
    outlookWeb: {
      name: 'Outlook (Web & Microsoft 365)',
      steps: [
        'Click "Copy Signature" in this studio.',
        'Open Outlook in your browser and click the Settings (gear) icon in the top right header.',
        'Navigate to Mail > Compose and reply.',
        'Under "Email signature", click "+ New signature" and name it.',
        'Click in the signature text box and press Ctrl + V (Windows) or Cmd + V (Mac) to paste.',
        'Select the signature in the dropdowns for "For New Messages" and "For Replies/Forwards".',
        'Click "Save" at the bottom of the pane.'
      ],
      tip: 'Our table layout includes MSO-specific fixes for smooth Outlook rendering.'
    },
    outlookDesktop: {
      name: 'Outlook (Desktop App)',
      steps: [
        'Click "Copy Signature" in this studio.',
        'Open Outlook Desktop and go to File > Options > Mail > Signatures.',
        'Click "New", enter a name for your signature, and click OK.',
        'Click in the "Edit signature" text box below and press Ctrl + V to paste.',
        'Under "Choose default signature", assign your new signature to your account.',
        'Click OK to save.'
      ],
      tip: 'If formatting looks slightly condensed in the small editor preview, test by creating a New Email; it renders in full quality.'
    },
    thunderbird: {
      name: 'Mozilla Thunderbird',
      steps: [
        'Click "Copy HTML Code" in this studio.',
        'Open Thunderbird, right-click on your email account name in the left pane, and select "Settings".',
        'Check the box that says "Use HTML (e.g., <b>bold</b>)".',
        'Paste the copied HTML code into the "Signature text" field.',
        'Click away to auto-save.'
      ],
      tip: 'Thunderbird directly parses the standards-compliant HTML table structure.'
    }
  },

  /**
   * Render guide modal HTML
   */
  renderGuideModal(clientKey = 'gmail') {
    const guide = this.clients[clientKey] || this.clients.gmail;
    
    const navItems = Object.keys(this.clients).map(key => {
      const active = key === clientKey ? 'active' : '';
      return `<button class="guide-nav-btn ${active}" data-client="${key}">${this.clients[key].name}</button>`;
    }).join('');

    const stepsList = guide.steps.map((step, idx) => {
      return `
        <div class="guide-step-item">
          <div class="guide-step-num">${idx + 1}</div>
          <div class="guide-step-text">${step}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="guide-modal-content">
        <div class="guide-modal-header">
          <div class="guide-modal-title">Signature Setup Guide</div>
          <button class="modal-close-btn" id="closeGuideBtn" title="Close">
            ${Icons.ui.close}
          </button>
        </div>
        <div class="guide-modal-body">
          <div class="guide-nav-row">
            ${navItems}
          </div>
          <div class="guide-detail-card">
            <h3 class="guide-client-title">${guide.name}</h3>
            <div class="guide-steps-container">
              ${stepsList}
            </div>
            <div class="guide-tip-banner">
              <span class="guide-tip-label">Optimization Note:</span> ${guide.tip}
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
