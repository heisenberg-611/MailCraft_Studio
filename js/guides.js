/**
 * Email Client Installation Guides (Sahinur Matrix Terminal)
 * Step-by-step instructions for Gmail, Outlook, Apple Mail, and Thunderbird
 * Zero emojis
 */

const InstallationGuides = {
  clients: {
    gmail: {
      name: 'Gmail (Web & Workspace)',
      steps: [
        'Click the "Copy Rich Signature" button in this studio to copy the high-definition HTML signature.',
        'Open Gmail in your web browser and click the Settings icon (gear) in the top right.',
        'Click "See all settings" and scroll down to the "Signature" section.',
        'Click "+ Create new", give your signature a name (e.g., "Professional"), and click Create.',
        'Click inside the signature text box on the right and press Cmd + V (Mac) or Ctrl + V (Windows) to paste.',
        'Under "Signature defaults", set your new signature for "For new emails use" and "On reply/forward use".',
        'Scroll to the bottom of the page and click "Save Changes".'
      ],
      tip: 'Your high-definition logo and badges will appear razor-sharp on Retina and 4K displays automatically.'
    },
    appleMail: {
      name: 'Apple Mail (macOS)',
      steps: [
        'Click the "Copy Rich Signature" button in this studio.',
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
        'Click "Copy Rich Signature" in this studio.',
        'Open Outlook in your browser and click the Settings (gear) icon in the top right header.',
        'Navigate to Mail > Compose and reply.',
        'Under "Email signature", click "+ New signature" and name it.',
        'Click in the signature text box and press Ctrl + V (Windows) or Cmd + V (Mac) to paste.',
        'Select the signature in the dropdowns for "For New Messages" and "For Replies/Forwards".',
        'Click "Save" at the bottom of the pane.'
      ],
      tip: 'Our table layout includes MSO-specific conditionals for pixel-perfect Outlook rendering.'
    },
    outlookDesktop: {
      name: 'Outlook (Desktop App)',
      steps: [
        'Click "Copy Rich Signature" in this studio.',
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
        'Click "Copy HTML Source" in this studio.',
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
    const keyMap = {
      'apple': 'appleMail',
      'outlook': 'outlookWeb'
    };
    const resolvedKey = keyMap[clientKey] || clientKey;
    const guide = this.clients[resolvedKey] || this.clients.gmail;
    
    const navItems = Object.keys(this.clients).map(key => {
      const active = key === resolvedKey ? 'active' : '';
      return `<button class="guide-nav-btn ${active}" data-client="${key}">${this.clients[key].name}</button>`;
    }).join('');

    const stepsList = guide.steps.map((step, idx) => {
      return `
        <div class="guide-step-item">
          <div class="guide-step-num">${String(idx + 1).padStart(2, '0')}</div>
          <div class="guide-step-text">${step}</div>
        </div>
      `;
    }).join('');

    return `
      <div class="guide-modal-content sahinur-terminal">
        <div class="sahinur-terminal-header guide-modal-header">
          <div class="sahinur-traffic-dots">
            <span class="sahinur-traffic-dot red"></span>
            <span class="sahinur-traffic-dot yellow"></span>
            <span class="sahinur-traffic-dot green"></span>
          </div>
          <div class="guide-modal-title">
            <span class="sahinur-prompt-prefix">$</span>
            <span>docs/setup-guide.md &bull; ${guide.name}</span>
          </div>
          <button class="modal-close-btn" id="closeGuideModalInnerBtn" title="Close">
            ${(typeof Icons !== 'undefined' && Icons.ui) ? Icons.ui.close : '&times;'}
          </button>
        </div>
        <div class="guide-modal-body">
          <div class="guide-nav-row">
            ${navItems}
          </div>
          <div class="guide-detail-card">
            <h3 class="guide-client-title"><span class="sahinur-prompt-prefix">&gt;</span> ${guide.name}</h3>
            <div class="guide-steps-container">
              ${stepsList}
            </div>
            <div class="guide-tip-banner">
              <span class="guide-tip-label">// TIP:</span> ${guide.tip}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Open the installation guide modal and bind tab clicks
   */
  openGuideModal(clientKey = 'gmail') {
    const modalContainer = document.getElementById('guideModalContainer');
    const modalOverlay = document.getElementById('guideModalOverlay');
    if (!modalContainer || !modalOverlay) return;

    modalContainer.innerHTML = this.renderGuideModal(clientKey);
    modalOverlay.classList.add('active');

    // Bind tab navigation buttons
    modalContainer.querySelectorAll('.guide-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openGuideModal(btn.dataset.client);
      });
    });

    // Bind close button
    const closeBtn = document.getElementById('closeGuideModalInnerBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
      });
    }

    // Bind overlay backdrop click to close
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    };
  }
};

// Universal environment exports
if (typeof window !== 'undefined') {
  window.InstallationGuides = InstallationGuides;
  window.Guides = InstallationGuides;
}
if (typeof globalThis !== 'undefined') {
  globalThis.InstallationGuides = InstallationGuides;
  globalThis.Guides = InstallationGuides;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InstallationGuides;
}
