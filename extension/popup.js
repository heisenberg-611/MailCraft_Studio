/**
 * MailCraft Extension Popup Controller
 * Full Signature Engine Integration with Photo Avatar, Vector Icons, Badges & Multi-Profile Switcher
 */

document.addEventListener('DOMContentLoaded', async () => {
  const profileSelect = document.getElementById('profileSelect');
  const previewContainer = document.getElementById('miniPreviewContainer');
  const injectBtn = document.getElementById('injectSignatureBtn');
  const copyBtn = document.getElementById('copyRichSignatureBtn');
  const statusEl = document.getElementById('statusMessage');

  // Base Data with Default Avatar Base64
  const defaultData = (typeof Presets !== 'undefined' && Presets.defaultData) ? Object.assign({}, Presets.defaultData) : {
    fullName: 'Dhrubojyoti Saha',
    jobTitle: 'Software Architect & Full-Stack Engineer',
    company: 'BRAC University',
    department: 'Dept. of Computer Science & Engineering',
    phone: '+880 1607-608232',
    email: 'dhrubojyoti.saha@g.bracu.ac.bd',
    website: 'www.dhrubojyoti.dev',
    address: '38/1, Block-B, Aftabnagar, Dhaka-1212',
    country: 'Bangladesh',
    avatarUrl: typeof DEFAULT_AVATAR_BASE64 !== 'undefined' ? DEFAULT_AVATAR_BASE64 : '',
    socials: {
      github: 'https://github.com/heisenberg-611',
      linkedin: 'https://linkedin.com/in/dhrubojyoti-saha',
      x: 'https://x.com',
      website: 'https://www.dhrubojyoti.dev'
    }
  };

  // Ensure Avatar is present
  if (!defaultData.avatarUrl && typeof DEFAULT_AVATAR_BASE64 !== 'undefined') {
    defaultData.avatarUrl = DEFAULT_AVATAR_BASE64;
  }

  // Load Custom Saved Profile from Chrome Storage if present
  let customState = null;
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const stored = await chrome.storage.local.get(['mailcraft_signature_data', 'mailcraft_signature_settings']);
      if (stored.mailcraft_signature_data) {
        customState = {
          data: stored.mailcraft_signature_data,
          settings: stored.mailcraft_signature_settings
        };
      }
    }
  } catch (e) {
    console.warn('Chrome storage read notice:', e);
  }

  // Build Profile Options
  const stylePresets = (typeof Presets !== 'undefined' && Presets.styles) ? Presets.styles : {};
  
  profileSelect.innerHTML = '';

  // 1. Official Studio Profile First
  if (stylePresets.dhrubojyoti) {
    const opt = document.createElement('option');
    opt.value = 'dhrubojyoti';
    opt.textContent = `★ ${stylePresets.dhrubojyoti.name} (Official Studio)`;
    profileSelect.appendChild(opt);
  }

  // 2. Multi-Industry Presets
  const featuredPresets = [
    'developerTerminal',
    'academicScholar',
    'corporateExecutive',
    'minimalistModern',
    'startupFounder',
    'creativeDirector',
    'marketingPromo'
  ];

  featuredPresets.forEach(presetId => {
    if (stylePresets[presetId]) {
      const opt = document.createElement('option');
      opt.value = presetId;
      opt.textContent = `${stylePresets[presetId].name}`;
      profileSelect.appendChild(opt);
    }
  });

  // 3. Custom Profile Option
  if (customState) {
    const opt = document.createElement('option');
    opt.value = 'customSaved';
    opt.textContent = 'Custom Studio Profile (Synced)';
    opt.selected = true;
    profileSelect.appendChild(opt);
  }

  const showStatus = (msg, type = 'success') => {
    statusEl.textContent = msg;
    statusEl.className = `status-msg ${type}`;
    setTimeout(() => {
      statusEl.className = 'status-msg';
      statusEl.textContent = '';
    }, 3500);
  };

  const getActiveSignatureHtml = () => {
    const selectedKey = profileSelect.value;
    let sigData = Object.assign({}, defaultData);
    let sigSettings = {};

    if (selectedKey === 'customSaved' && customState) {
      sigData = Object.assign({}, defaultData, customState.data);
      sigSettings = Object.assign({}, customState.settings);
    } else if (stylePresets[selectedKey]) {
      sigSettings = Object.assign({}, stylePresets[selectedKey].settings);
    } else if (stylePresets.dhrubojyoti) {
      sigSettings = Object.assign({}, stylePresets.dhrubojyoti.settings);
    }

    // Always ensure avatar is provided if set
    if (!sigData.avatarUrl && typeof DEFAULT_AVATAR_BASE64 !== 'undefined') {
      sigData.avatarUrl = DEFAULT_AVATAR_BASE64;
    }

    if (typeof SignatureEngine !== 'undefined' && SignatureEngine.generateHtml) {
      return SignatureEngine.generateHtml(sigData, sigSettings, false, true);
    }

    // Fallback if engine fails
    return `<div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #00DC82;"><b>${sigData.fullName}</b><br>${sigData.jobTitle}</div>`;
  };

  const updatePreview = () => {
    const html = getActiveSignatureHtml();
    previewContainer.innerHTML = html;
  };

  profileSelect.addEventListener('change', updatePreview);
  updatePreview();

  // 1-Click Inject into Active Gmail / Outlook Tab
  injectBtn.addEventListener('click', async () => {
    const html = getActiveSignatureHtml();

    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.id) {
          copyToClipboardFallback(html, 'Tab not detected. Copied signature to clipboard!');
          return;
        }

        chrome.tabs.sendMessage(tab.id, {
          action: 'INJECT_SIGNATURE',
          html: html
        }, (response) => {
          if (chrome.runtime.lastError || !response || !response.success) {
            copyToClipboardFallback(html, 'Copied Rich Signature! (Open Gmail/Outlook compose box to auto-inject)');
          } else {
            showStatus('✓ Signature successfully injected into compose box!', 'success');
          }
        });
      } else {
        copyToClipboardFallback(html, 'Copied HTML Signature to clipboard!');
      }
    } catch (err) {
      copyToClipboardFallback(html, 'Copied signature to clipboard!');
    }
  });

  // Copy Rich Text (WYSIWYG MIME types for Apple Mail, Outlook, Gmail)
  copyBtn.addEventListener('click', async () => {
    const html = getActiveSignatureHtml();
    try {
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([previewContainer.innerText || ''], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText
      });
      await navigator.clipboard.write([item]);
      showStatus('✓ Rich Text Signature copied! Paste into any email client.', 'success');
    } catch (err) {
      copyToClipboardFallback(html, 'Copied HTML code to clipboard!');
    }
  });

  function copyToClipboardFallback(html, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(html).then(() => {
        showStatus(successMsg, 'success');
      }).catch(() => {
        showStatus('Please copy signature manually from studio.', 'error');
      });
    } else {
      showStatus(successMsg, 'success');
    }
  }
});
