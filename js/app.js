/**
 * Main Application Controller & State Manager
 * Coordinates UI, Live Rendering, Image Processing, and Exporters
 * Zero emojis
 */

const App = {
  mode: 'signature', // 'signature' | 'template'
  clientView: 'gmail', // 'gmail' | 'apple' | 'outlook'
  inboxTheme: 'light', // 'light' | 'dark'
  zoom: 1.0,

  // App State
  state: {
    data: Object.assign({}, Presets.defaultData),
    settings: Object.assign({}, Presets.styles.dhrubojyoti.settings),
    templateData: {
      title: 'Project Update',
      preheader: 'Important updates and technical collaboration overview',
      headerLogoText: 'DHRUBOJYOTI SAHA \u2022 PORTFOLIO',
      greeting: 'Dear Colleague,',
      paragraphs: [
        'I hope this message finds you well. I am reaching out regarding our recent developments in automated workflow systems and software architecture.',
        '- High-Definition Retina graphics (2x, 3x, 4x DPI)\n- 100% in-browser generation with zero backend\n- Direct 1-click clipboard paste into Gmail and Outlook'
      ],
      ctaText: 'Explore Project Showcase',
      ctaUrl: 'https://www.dhrubojyoti.dev',
      showCta: true,
      closing: 'Best regards,'
    }
  },

  /**
   * Initialize App
   */
  init() {
    this.loadFromStorage();
    this.injectUiIcons();
    this.renderSocialInputs();
    
    // Initialize High-DPI canvas avatar
    ImageProcessor.init((dataUrl) => {
      this.state.data.avatarUrl = dataUrl;
      this.updateLivePreview();
    });

    this.bindEvents();
    this.syncFormWithState();
    this.syncEmailTemplateFromDom();
    this.updateLivePreview();
  },

  /**
   * Inject SVG vector icons into UI buttons & placeholders
   */
  injectUiIcons() {
    const setIcon = (id, svg) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = svg;
    };

    setIcon('modeSigIcon', Icons.ui.signature);
    setIcon('modeTplIcon', Icons.ui.template);
    setIcon('guideIcon', Icons.ui.help);
    setIcon('copyPrimaryIcon', Icons.ui.copy);
    setIcon('shieldIcon', Icons.ui.shield);
    setIcon('codeIcon', Icons.ui.code);
    setIcon('downloadIcon', Icons.ui.download);
    setIcon('imageIcon', Icons.ui.image);
    setIcon('copyBtnIcon', Icons.ui.copy);
    setIcon('closeCodeModalBtn', Icons.ui.close);
  },

  /**
   * Dynamically build the list of social media input items
   */
  renderSocialInputs() {
    const container = document.getElementById('socialsListContainer');
    if (!container) return;

    const availableNetworks = [
      'facebook', 'x', 'youtube', 'linkedin', 'instagram',
      'github', 'website', 'whatsapp', 'telegram', 'discord',
      'behance', 'dribbble', 'medium', 'phone', 'email', 'calendar', 'location'
    ];

    // Build ordered list starting with existing socials order
    const orderedKeys = [];
    if (Array.isArray(this.state.data.socials)) {
      this.state.data.socials.forEach(s => {
        if (availableNetworks.includes(s.id) && !orderedKeys.includes(s.id)) {
          orderedKeys.push(s.id);
        }
      });
    }
    availableNetworks.forEach(k => {
      if (!orderedKeys.includes(k)) orderedKeys.push(k);
    });

    container.innerHTML = orderedKeys.map(key => {
      const meta = Icons.social[key] || { name: key, color: '#2563EB', svg: '' };
      const current = (this.state.data.socials || []).find(s => s.id === key) || { enabled: false, url: '' };

      return `
        <div class="social-item" data-social-id="${key}" draggable="true">
          <div class="social-drag-handle" title="Drag to reorder position">
            ${Icons.ui.dragHandle}
          </div>
          <input type="checkbox" class="social-enable-cb" ${current.enabled ? 'checked' : ''} style="cursor: pointer;">
          <div class="social-item-icon" style="color: ${meta.color};">
            ${meta.svg}
          </div>
          <input type="text" class="social-item-input" value="${current.url || ''}" placeholder="${meta.name} URL / username">
        </div>
      `;
    }).join('');

    this.bindSocialDragAndDrop();
  },

  /**
   * Bind drag and drop events for reordering social media icons
   */
  bindSocialDragAndDrop() {
    const container = document.getElementById('socialsListContainer');
    if (!container) return;

    let draggedItem = null;

    container.querySelectorAll('.social-item').forEach(item => {
      // Drag Start
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.dataset.socialId);
      });

      // Drag Over
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!draggedItem || draggedItem === item) return;

        const rect = item.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          item.classList.add('drag-over-top');
          item.classList.remove('drag-over-bottom');
        } else {
          item.classList.add('drag-over-bottom');
          item.classList.remove('drag-over-top');
        }
      });

      // Drag Leave
      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      // Drop
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over-top', 'drag-over-bottom');
        if (!draggedItem || draggedItem === item) return;

        const rect = item.getBoundingClientRect();
        const insertBefore = e.clientY < (rect.top + rect.height / 2);

        if (insertBefore) {
          container.insertBefore(draggedItem, item);
        } else {
          container.insertBefore(draggedItem, item.nextSibling);
        }

        this.syncSocialsFromDom();
      });

      // Drag End
      item.addEventListener('dragend', () => {
        draggedItem = null;
        item.classList.remove('dragging');
        container.querySelectorAll('.social-item').forEach(el => {
          el.classList.remove('drag-over-top', 'drag-over-bottom');
        });
      });

      // Prevent drag interference when focusing input field
      const input = item.querySelector('.social-item-input');
      if (input) {
        input.addEventListener('focus', () => { item.draggable = false; });
        input.addEventListener('blur', () => { item.draggable = true; });
      }
    });
  },

  /**
   * Sync form inputs to match the current state
   */
  syncFormWithState() {
    const d = this.state.data;
    const s = this.state.settings;

    // Identity
    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
    const setChecked = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };

    setVal('fullName', d.fullName);
    setVal('jobTitle', d.jobTitle);
    setVal('company', d.company);
    setVal('department', d.department);
    setVal('phone', d.phone);
    setVal('email', d.email);
    setVal('website', d.website);
    setVal('address', d.address);
    setVal('country', d.country);

    // Photo / Logo Settings
    setVal('avatarSize', s.avatarSize || 85);
    document.getElementById('avatarSizeVal').textContent = `${s.avatarSize || 85}px`;
    setVal('avatarZoom', ImageProcessor.config.zoom || 1.0);
    document.getElementById('avatarZoomVal').textContent = `${ImageProcessor.config.zoom || 1.0}x`;
    setVal('avatarBorderWidth', s.avatarBorderWidth || 0);
    document.getElementById('avatarBorderVal').textContent = `${s.avatarBorderWidth || 0}px`;
    setVal('avatarBorderColor', s.avatarBorderColor || '#2563EB');
    setVal('avatarBorderColorHex', s.avatarBorderColor || '#2563EB');

    // DPI chips
    document.querySelectorAll('.dpi-chip').forEach(chip => {
      chip.classList.toggle('active', Number(chip.dataset.dpi) === (s.avatarDpi || 2));
    });
    document.getElementById('hdBadge').textContent = `Retina ${s.avatarDpi || 2}x`;
    document.getElementById('dpiLabel').textContent = `${s.avatarDpi || 2}x (${(s.avatarDpi || 2) * 150} DPI)`;

    // Shapes
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === (s.avatarShape || 'circle'));
    });

    // Style & Colors
    document.querySelectorAll('.template-card').forEach(card => {
      card.classList.toggle('active', card.dataset.template === (s.template || 'vertical-divider'));
    });
    setVal('fontFamily', s.fontFamily);
    setVal('accentColor', s.accentColor);
    setVal('accentColorHex', s.accentColor);
    setVal('nameColor', s.nameColor);
    setVal('nameColorHex', s.nameColor);
    setVal('bodyColor', s.bodyColor);
    setVal('bodyColorHex', s.bodyColor);
    setVal('nameFontSize', s.nameFontSize || 17);
    document.getElementById('nameFontSizeVal').textContent = `${s.nameFontSize || 17}px`;
    setVal('bodyFontSize', s.bodyFontSize || 12.5);
    document.getElementById('bodyFontSizeVal').textContent = `${s.bodyFontSize || 12.5}px`;
    setVal('dividerThickness', s.dividerThickness || 2);
    document.getElementById('dividerThicknessVal').textContent = `${s.dividerThickness || 2}px`;
    setVal('dividerStyle', s.dividerStyle || 'solid');
    setVal('iconStyle', s.iconStyle || 'brand');
    setVal('iconSize', s.iconSize || 18);
    document.getElementById('iconSizeVal').textContent = `${s.iconSize || 18}px`;
    setVal('iconSpacing', s.iconSpacing || 6);
    document.getElementById('iconSpacingVal').textContent = `${s.iconSpacing || 6}px`;

    // Addons
    setChecked('showBadge', d.showBadge);
    document.getElementById('badgeInputGroup').style.display = d.showBadge ? 'flex' : 'none';
    setVal('badgeText', d.badgeText);

    setChecked('showCta', d.showCta);
    document.getElementById('ctaInputGroup').style.display = d.showCta ? 'flex' : 'none';
    setVal('ctaText', d.ctaText);
    setVal('ctaUrl', d.ctaUrl);

    setChecked('showGreenNote', d.showGreenNote);
    document.getElementById('greenNoteInputGroup').style.display = d.showGreenNote ? 'block' : 'none';
    setVal('greenNoteText', d.greenNoteText);

    setChecked('showDisclaimer', d.showDisclaimer);
    document.getElementById('disclaimerInputGroup').style.display = d.showDisclaimer ? 'block' : 'none';
    setVal('disclaimerText', d.disclaimerText);
  },

  /**
   * Bind event listeners for UI controls
   */
  bindEvents() {
    // Mode Switcher
    const sigBtn = document.getElementById('modeSignatureBtn');
    const tplBtn = document.getElementById('modeTemplateBtn');
    const tabEmailNav = document.getElementById('tabEmailNavBtn');

    sigBtn.addEventListener('click', () => {
      this.mode = 'signature';
      sigBtn.classList.add('active');
      tplBtn.classList.remove('active');
      tabEmailNav.style.display = 'none';
      document.getElementById('copyPrimaryBtn').textContent = 'Copy Signature';
      document.getElementById('copyRichBtn').textContent = 'Copy Rich Signature';
      document.getElementById('signatureModeIntroText').style.display = 'block';
      this.updateLivePreview();
    });

    tplBtn.addEventListener('click', () => {
      this.mode = 'template';
      tplBtn.classList.add('active');
      sigBtn.classList.remove('active');
      tabEmailNav.style.display = 'flex';
      document.getElementById('copyPrimaryBtn').textContent = 'Copy Full Email';
      document.getElementById('copyRichBtn').textContent = 'Copy Full Email';
      document.getElementById('signatureModeIntroText').style.display = 'none';
      this.switchSidebarTab('tab-email');
      this.updateLivePreview();
    });

    // Sidebar Tab Navigation
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchSidebarTab(btn.dataset.tab);
      });
    });

    // Identity Form Live Inputs
    const bindInput = (id, prop) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          this.state.data[prop] = e.target.value;
          this.updateLivePreview();
          this.saveToStorage();
        });
      }
    };

    bindInput('fullName', 'fullName');
    bindInput('jobTitle', 'jobTitle');
    bindInput('company', 'company');
    bindInput('department', 'department');
    bindInput('phone', 'phone');
    bindInput('email', 'email');
    bindInput('website', 'website');
    bindInput('address', 'address');
    bindInput('country', 'country');

    // Photo File Upload
    const fileInput = document.getElementById('avatarFileInput');
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        ImageProcessor.loadImageFile(file, (dataUrl) => {
          this.state.data.avatarUrl = dataUrl;
          this.updateLivePreview();
          this.showToast('High-Definition photo loaded and processed.');
        });
      }
    });

    // DPI Chip Selection
    document.querySelectorAll('.dpi-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const dpi = Number(chip.dataset.dpi);
        document.querySelectorAll('.dpi-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.state.settings.avatarDpi = dpi;
        ImageProcessor.config.dpi = dpi;
        document.getElementById('hdBadge').textContent = `Retina ${dpi}x`;
        document.getElementById('dpiLabel').textContent = `${dpi}x (${dpi * 150} DPI)`;
        ImageProcessor.process((dataUrl) => {
          this.state.data.avatarUrl = dataUrl;
          this.updateLivePreview();
        });
        this.saveToStorage();
      });
    });

    // Avatar Shape Selection
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const shape = btn.dataset.shape;
        this.state.settings.avatarShape = shape;
        ImageProcessor.config.shape = shape;
        ImageProcessor.process((dataUrl) => {
          this.state.data.avatarUrl = dataUrl;
          this.updateLivePreview();
        });
        this.saveToStorage();
      });
    });

    // Avatar Size & Zoom Sliders
    const bindSlider = (id, valId, unit, callback) => {
      const el = document.getElementById(id);
      const valEl = document.getElementById(valId);
      if (el) {
        el.addEventListener('input', (e) => {
          if (valEl) valEl.textContent = `${e.target.value}${unit}`;
          callback(e.target.value);
          this.updateLivePreview();
          this.saveToStorage();
        });
      }
    };

    bindSlider('avatarSize', 'avatarSizeVal', 'px', (v) => {
      this.state.settings.avatarSize = Number(v);
      ImageProcessor.config.size = Number(v);
    });

    bindSlider('avatarZoom', 'avatarZoomVal', 'x', (v) => {
      ImageProcessor.config.zoom = Number(v);
      ImageProcessor.process((dataUrl) => {
        this.state.data.avatarUrl = dataUrl;
        this.updateLivePreview();
      });
    });

    bindSlider('avatarBorderWidth', 'avatarBorderVal', 'px', (v) => {
      this.state.settings.avatarBorderWidth = Number(v);
      ImageProcessor.config.borderWidth = Number(v);
      ImageProcessor.process((dataUrl) => {
        this.state.data.avatarUrl = dataUrl;
        this.updateLivePreview();
      });
    });

    // Border Color
    this.bindColorSync('avatarBorderColor', 'avatarBorderColorHex', (color) => {
      this.state.settings.avatarBorderColor = color;
      ImageProcessor.config.borderColor = color;
      ImageProcessor.process((dataUrl) => {
        this.state.data.avatarUrl = dataUrl;
        this.updateLivePreview();
      });
    });

    // Image Filter Sliders
    bindSlider('imgBrightness', 'brightnessVal', '%', (v) => {
      ImageProcessor.config.brightness = Number(v);
      ImageProcessor.process((dataUrl) => {
        this.state.data.avatarUrl = dataUrl;
        this.updateLivePreview();
      });
    });

    bindSlider('imgContrast', 'contrastVal', '%', (v) => {
      ImageProcessor.config.contrast = Number(v);
      ImageProcessor.process((dataUrl) => {
        this.state.data.avatarUrl = dataUrl;
        this.updateLivePreview();
      });
    });

    bindSlider('imgSaturation', 'saturationVal', '%', (v) => {
      ImageProcessor.config.saturation = Number(v);
      ImageProcessor.process((dataUrl) => {
        this.state.data.avatarUrl = dataUrl;
        this.updateLivePreview();
      });
    });

    // Layout Template Selection Cards
    document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.state.settings.template = card.dataset.template;
        this.updateLivePreview();
        this.saveToStorage();
      });
    });

    // Typography & Color Controls
    this.bindColorSync('accentColor', 'accentColorHex', (color) => {
      this.state.settings.accentColor = color;
      this.state.settings.dividerColor = color;
      this.updateLivePreview();
    });

    this.bindColorSync('nameColor', 'nameColorHex', (color) => {
      this.state.settings.nameColor = color;
      this.updateLivePreview();
    });

    this.bindColorSync('bodyColor', 'bodyColorHex', (color) => {
      this.state.settings.bodyColor = color;
      this.updateLivePreview();
    });

    // Color Swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.dataset.color;
        document.getElementById('accentColor').value = color;
        document.getElementById('accentColorHex').value = color;
        this.state.settings.accentColor = color;
        this.state.settings.dividerColor = color;
        this.updateLivePreview();
        this.saveToStorage();
      });
    });

    document.getElementById('fontFamily').addEventListener('change', (e) => {
      this.state.settings.fontFamily = e.target.value;
      this.updateLivePreview();
      this.saveToStorage();
    });

    bindSlider('nameFontSize', 'nameFontSizeVal', 'px', (v) => {
      this.state.settings.nameFontSize = Number(v);
    });

    bindSlider('bodyFontSize', 'bodyFontSizeVal', 'px', (v) => {
      this.state.settings.bodyFontSize = Number(v);
    });

    bindSlider('dividerThickness', 'dividerThicknessVal', 'px', (v) => {
      this.state.settings.dividerThickness = Number(v);
    });

    document.getElementById('dividerStyle').addEventListener('change', (e) => {
      this.state.settings.dividerStyle = e.target.value;
      this.updateLivePreview();
      this.saveToStorage();
    });

    // Social Network Inputs
    document.getElementById('iconStyle').addEventListener('change', (e) => {
      this.state.settings.iconStyle = e.target.value;
      this.updateLivePreview();
      this.saveToStorage();
    });

    bindSlider('iconSize', 'iconSizeVal', 'px', (v) => {
      this.state.settings.iconSize = Number(v);
    });

    bindSlider('iconSpacing', 'iconSpacingVal', 'px', (v) => {
      this.state.settings.iconSpacing = Number(v);
    });

    // Social List Item Updates
    document.getElementById('socialsListContainer').addEventListener('input', (e) => {
      this.syncSocialsFromDom();
    });
    document.getElementById('socialsListContainer').addEventListener('change', (e) => {
      this.syncSocialsFromDom();
    });

    // Addons Toggles
    const bindToggle = (toggleId, inputGroupId, stateProp) => {
      const toggle = document.getElementById(toggleId);
      const group = document.getElementById(inputGroupId);
      toggle.addEventListener('change', (e) => {
        this.state.data[stateProp] = e.target.checked;
        if (group) group.style.display = e.target.checked ? (group.tagName === 'DIV' && group.id.includes('Group') ? 'flex' : 'block') : 'none';
        this.updateLivePreview();
        this.saveToStorage();
      });
    };

    bindToggle('showBadge', 'badgeInputGroup', 'showBadge');
    bindInput('badgeText', 'badgeText');

    bindToggle('showCta', 'ctaInputGroup', 'showCta');
    bindInput('ctaText', 'ctaText');
    bindInput('ctaUrl', 'ctaUrl');

    bindToggle('showGreenNote', 'greenNoteInputGroup', 'showGreenNote');
    bindInput('greenNoteText', 'greenNoteText');

    bindToggle('showDisclaimer', 'disclaimerInputGroup', 'showDisclaimer');
    bindInput('disclaimerText', 'disclaimerText');

    // Email Template Inputs
    document.getElementById('emailBlueprintSelect').addEventListener('change', (e) => {
      const selected = Presets.emailTemplates.find(t => t.id === e.target.value);
      if (selected) {
        document.getElementById('tplSubject').value = selected.subject;
        document.getElementById('tplGreeting').value = selected.greeting;
        document.getElementById('tplParagraph1').value = selected.paragraphs[0] || '';
        document.getElementById('tplParagraph2').value = selected.paragraphs[1] || '';
        document.getElementById('tplClosing').value = selected.closing;
        document.getElementById('tplCtaText').value = selected.ctaText || '';
        document.getElementById('tplCtaUrl').value = selected.ctaUrl || '';

        this.syncEmailTemplateFromDom();
      }
    });

    const bindTplInput = (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.syncEmailTemplateFromDom());
      }
    };

    bindTplInput('tplSubject');
    bindTplInput('tplPreheader');
    bindTplInput('tplHeaderLogoText');
    bindTplInput('tplGreeting');
    bindTplInput('tplParagraph1');
    bindTplInput('tplParagraph2');
    bindTplInput('tplClosing');
    bindTplInput('tplCtaText');
    bindTplInput('tplCtaUrl');

    // Preset Selection Dropdown
    document.getElementById('presetSelect').addEventListener('change', (e) => {
      this.applyPreset(e.target.value);
    });

    // Client Simulator Controls
    const setClient = (view, title) => {
      this.clientView = view;
      ['clientGmailBtn', 'clientAppleBtn', 'clientOutlookBtn'].forEach(id => {
        document.getElementById(id).classList.remove('active');
      });
      document.getElementById(`client${view.charAt(0).toUpperCase() + view.slice(1)}Btn`).classList.add('active');
      
      const win = document.getElementById('clientWindow');
      const header = document.getElementById('simulatorHeader');
      const titleEl = document.getElementById('simulatorTitle');
      const footer = document.getElementById('simulatorFooter');

      if (view === 'apple') {
        header.className = 'apple-mail-header';
        header.innerHTML = `
          <div class="traffic-lights">
            <div class="traffic-light red"></div>
            <div class="traffic-light yellow"></div>
            <div class="traffic-light green"></div>
          </div>
          <div style="font-size: 13px; font-weight: 600; color: inherit; margin-left: 10px;">New Message</div>
        `;
        footer.style.display = 'none';
      } else if (view === 'outlook') {
        header.className = 'outlook-header';
        header.innerHTML = `<div>Outlook Message</div><div style="font-size: 11px;">Send</div>`;
        footer.style.display = 'none';
      } else {
        header.className = 'gmail-header';
        header.innerHTML = `<div class="gmail-title">New Message</div><div class="gmail-window-controls">&ndash; &Square; &times;</div>`;
        footer.style.display = 'flex';
      }
    };

    document.getElementById('clientGmailBtn').addEventListener('click', () => setClient('gmail'));
    document.getElementById('clientAppleBtn').addEventListener('click', () => setClient('apple'));
    document.getElementById('clientOutlookBtn').addEventListener('click', () => setClient('outlook'));

    // Light / Dark Inbox Switcher
    const lightBtn = document.getElementById('themeLightBtn');
    const darkBtn = document.getElementById('themeDarkBtn');
    const wrapper = document.getElementById('previewWrapper');

    lightBtn.addEventListener('click', () => {
      lightBtn.classList.add('active');
      darkBtn.classList.remove('active');
      wrapper.classList.remove('preview-theme-dark');
      this.inboxTheme = 'light';
      this.updateLivePreview();
    });

    darkBtn.addEventListener('click', () => {
      darkBtn.classList.add('active');
      lightBtn.classList.remove('active');
      wrapper.classList.add('preview-theme-dark');
      this.inboxTheme = 'dark';
      this.updateLivePreview();
    });

    // Zoom Controls
    const zoomValEl = document.getElementById('zoomVal');
    document.getElementById('zoomInBtn').addEventListener('click', () => {
      if (this.zoom < 1.4) {
        this.zoom = +(this.zoom + 0.1).toFixed(1);
        zoomValEl.textContent = `${Math.round(this.zoom * 100)}%`;
        document.getElementById('clientWindow').style.transform = `scale(${this.zoom})`;
        document.getElementById('clientWindow').style.transformOrigin = 'top center';
      }
    });

    document.getElementById('zoomOutBtn').addEventListener('click', () => {
      if (this.zoom > 0.7) {
        this.zoom = +(this.zoom - 0.1).toFixed(1);
        zoomValEl.textContent = `${Math.round(this.zoom * 100)}%`;
        document.getElementById('clientWindow').style.transform = `scale(${this.zoom})`;
        document.getElementById('clientWindow').style.transformOrigin = 'top center';
      }
    });

    // Action Buttons
    const handleCopy = () => {
      const html = this.getActiveHtml();
      const plain = `${this.state.data.fullName}\n${this.state.data.jobTitle}\n${this.state.data.phone}\n${this.state.data.email}\n${this.state.data.website}`;
      ClipboardExporter.copyRichHtml(html, plain, (success, msg) => {
        this.showToast(msg, success ? 'success' : 'warning');
      });
    };

    document.getElementById('copyPrimaryBtn').addEventListener('click', handleCopy);
    document.getElementById('copyRichBtn').addEventListener('click', handleCopy);

    // Copy Raw HTML
    document.getElementById('copyRawHtmlBtn').addEventListener('click', () => {
      const html = this.getActiveHtml();
      document.getElementById('rawCodeViewer').value = html;
      document.getElementById('codeModalOverlay').classList.add('active');
    });

    document.getElementById('closeCodeModalBtn').addEventListener('click', () => {
      document.getElementById('codeModalOverlay').classList.remove('active');
    });

    document.getElementById('copyCodeModalBtn').addEventListener('click', () => {
      const html = document.getElementById('rawCodeViewer').value;
      ClipboardExporter.copyRawHtml(html, (success, msg) => {
        this.showToast(msg);
        document.getElementById('codeModalOverlay').classList.remove('active');
      });
    });

    // Download HTML
    document.getElementById('downloadHtmlBtn').addEventListener('click', () => {
      const html = this.getActiveHtml();
      const filename = this.mode === 'signature' ? 'email-signature.html' : 'email-template.html';
      ClipboardExporter.downloadHtmlFile(html, filename);
      this.showToast('HTML file downloaded successfully!');
    });

    // Export High-Res PNG
    document.getElementById('exportPngBtn').addEventListener('click', () => {
      const target = document.getElementById('liveRenderCanvas');
      this.showToast('Generating High-Definition 3x PNG...');
      ClipboardExporter.exportHighResPng(target, 'email-signature-hd.png', 3, (success, msg) => {
        this.showToast(msg, success ? 'success' : 'warning');
      });
    });

    // Guide Modal
    const guideOverlay = document.getElementById('guideModalOverlay');
    const guideContainer = document.getElementById('guideModalContainer');

    document.getElementById('openGuideBtn').addEventListener('click', () => {
      guideContainer.innerHTML = InstallationGuides.renderGuideModal('gmail');
      guideOverlay.classList.add('active');
      this.bindGuideModalEvents();
    });

    guideOverlay.addEventListener('click', (e) => {
      if (e.target === guideOverlay) guideOverlay.classList.remove('active');
    });

    document.getElementById('codeModalOverlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('codeModalOverlay')) {
        document.getElementById('codeModalOverlay').classList.remove('active');
      }
    });
  },

  /**
   * Helper to bind color picker and hex text input synchronization
   */
  bindColorSync(colorId, hexId, callback) {
    const colorEl = document.getElementById(colorId);
    const hexEl = document.getElementById(hexId);

    colorEl.addEventListener('input', (e) => {
      hexEl.value = e.target.value.toUpperCase();
      callback(e.target.value);
      this.saveToStorage();
    });

    hexEl.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        colorEl.value = val;
        callback(val);
        this.saveToStorage();
      }
    });
  },

  /**
   * Switch active sidebar tab
   */
  switchSidebarTab(tabId) {
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.sidebar-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });
  },

  /**
   * Sync active socials from UI DOM inputs
   */
  syncSocialsFromDom() {
    const list = [];
    document.querySelectorAll('.social-item').forEach(item => {
      const id = item.dataset.socialId;
      const cb = item.querySelector('.social-enable-cb');
      const input = item.querySelector('.social-item-input');
      list.push({
        id,
        enabled: cb.checked,
        url: input.value.trim()
      });
    });
    this.state.data.socials = list;
    this.updateLivePreview();
    this.saveToStorage();
  },

  /**
   * Sync email template values from DOM
   */
  syncEmailTemplateFromDom() {
    const getVal = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    this.state.templateData = {
      title: getVal('tplSubject'),
      preheader: getVal('tplPreheader'),
      headerLogoText: getVal('tplHeaderLogoText'),
      greeting: getVal('tplGreeting'),
      paragraphs: [
        getVal('tplParagraph1'),
        getVal('tplParagraph2')
      ],
      closing: getVal('tplClosing'),
      ctaText: getVal('tplCtaText'),
      ctaUrl: getVal('tplCtaUrl'),
      showCta: !!getVal('tplCtaText')
    };

    document.getElementById('previewSubjectLine').textContent = getVal('tplSubject') || 'No Subject';
    this.updateLivePreview();
  },

  /**
   * Apply a style preset
   */
  applyPreset(presetKey) {
    const p = Presets.styles[presetKey];
    if (!p) return;
    this.state.settings = Object.assign({}, p.settings);
    ImageProcessor.config.dpi = p.settings.avatarDpi || 2;
    ImageProcessor.config.shape = p.settings.avatarShape || 'circle';
    ImageProcessor.config.size = p.settings.avatarSize || 100;
    ImageProcessor.config.borderWidth = p.settings.avatarBorderWidth || 0;
    ImageProcessor.config.borderColor = p.settings.avatarBorderColor || p.settings.accentColor;

    ImageProcessor.process((dataUrl) => {
      this.state.data.avatarUrl = dataUrl;
      this.syncFormWithState();
      this.updateLivePreview();
      this.showToast(`Applied preset: ${p.name}`);
    });
  },

  /**
   * Bind events inside installation guide modal
   */
  bindGuideModalEvents() {
    const closeBtn = document.getElementById('closeGuideBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('guideModalOverlay').classList.remove('active');
      });
    }

    document.querySelectorAll('.guide-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const client = btn.dataset.client;
        document.getElementById('guideModalContainer').innerHTML = InstallationGuides.renderGuideModal(client);
        this.bindGuideModalEvents();
      });
    });
  },

  /**
   * Get active HTML string based on mode (for clipboard copy / HTML export)
   * Includes baseline Day Mode inline styling + full responsive @media (prefers-color-scheme: dark) CSS
   * so the signature / template dynamically adapts to the recipient's device theme.
   */
  getActiveHtml() {
    if (this.mode === 'template') {
      return EmailTemplateEngine.generateFullEmail(this.state.templateData, this.state.data, this.state.settings, false, true);
    }
    return SignatureEngine.generateHtml(this.state.data, this.state.settings, false, true);
  },

  /**
   * Update the live preview canvas
   */
  updateLivePreview() {
    const canvas = document.getElementById('liveRenderCanvas');
    if (!canvas) return;

    const isDark = this.inboxTheme === 'dark';

    if (this.mode === 'template') {
      canvas.innerHTML = EmailTemplateEngine.generateFullEmail(this.state.templateData, this.state.data, this.state.settings, isDark, false);
    } else {
      canvas.innerHTML = SignatureEngine.generateHtml(this.state.data, this.state.settings, isDark, false);
    }
  },

  /**
   * Show interactive toast notification
   */
  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${Icons.ui.check}</div>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => container.removeChild(toast), 300);
    }, 3200);
  },

  /**
   * LocalStorage persistence
   */
  saveToStorage() {
    try {
      localStorage.setItem('mailcraft_studio_state', JSON.stringify({
        data: this.state.data,
        settings: this.state.settings
      }));
    } catch (e) {
      // Ignore storage errors in private browsing
    }
  },

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('mailcraft_studio_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data) {
          this.state.data = Object.assign({}, Presets.defaultData, parsed.data);
          if (Array.isArray(parsed.data.socials) && parsed.data.socials.length > 0) {
            this.state.data.socials = parsed.data.socials;
          } else {
            this.state.data.socials = JSON.parse(JSON.stringify(Presets.defaultData.socials));
          }
        }
        if (parsed.settings) {
          this.state.settings = Object.assign({}, Presets.styles.dhrubojyoti.settings, parsed.settings);
        }
      }
    } catch (e) {
      // Ignore
    }
  }
};

// Initialize Application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
