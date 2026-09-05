/**
 * Main Application Controller & State Manager
 * Coordinates UI, Live Rendering, Preset Management, Team Batch Generation, and Exporters
 * Zero server dependencies & 100% on-device privacy
 */

const App = {
  mode: 'signature', // 'signature' | 'team' | 'template'
  clientView: 'gmail', // 'gmail' | 'apple' | 'outlook'
  inboxTheme: 'light', // 'light' | 'dark'
  zoom: 1.0,

  // App State
  state: {
    data: Object.assign({}, Presets.defaultData),
    settings: Object.assign({}, Presets.styles.developerTerminal ? Presets.styles.developerTerminal.settings : Presets.styles.dhrubojyoti.settings),
    templateData: {
      title: 'Project Update',
      preheader: 'Important updates and technical collaboration overview',
      headerLogoText: 'DHRUBOJYOTI SAHA \u2022 PORTFOLIO',
      headerTag: '',
      headerTextColor: '#FFFFFF',
      headerBgColor: '#0F172A',
      greeting: 'Dear Colleague,',
      greetingColor: '#0F172A',
      paragraphs: [
        'I hope this message finds you well. I am reaching out regarding our recent developments in automated workflow systems and software architecture.',
        'We have prepared a comprehensive overview of the technical specifications and would appreciate your valuable feedback on the roadmap.'
      ],
      bodyColor: '#334155',
      highlightBox: {
        enabled: false,
        title: 'Key Highlights',
        content: '- High-Definition Retina graphics (2x, 3x, 4x DPI)\n- 100% in-browser generation with zero backend dependencies\n- Seamless 1-click clipboard paste into Gmail and Outlook'
      },
      highlightTitleColor: '#00DC82',
      highlightTextColor: '#334155',
      highlightBgColor: '#F8FAFC',
      ctaText: 'Explore Project Showcase',
      ctaUrl: 'https://www.dhrubojyoti.dev',
      ctaTextColor: '#0F172A',
      ctaBgColor: '#00DC82',
      showCta: true,
      closing: 'Best regards,',
      closingColor: '#64748B',
      footerNote: 'Sent from Dhrubojyoti Saha Portfolio Systems | Dhaka, Bangladesh',
      footerTextColor: '#64748B'
    }
  },

  /**
   * Initialize App
   */
  init() {
    this.loadFromStorage();
    this.injectUiIcons();
    this.renderSocialInputs();
    this.renderCustomFieldsInputs();
    this.refreshPresetDropdown();
    this.renderTeamRosterList();

    // Check URL parameters for preset or mode override
    const urlParams = new URLSearchParams(window.location.search);
    const requestedPreset = urlParams.get('preset');
    const requestedMode = urlParams.get('mode');

    // Synchronize client window and preview theme classes
    const clientWindow = document.getElementById('clientWindow');
    const previewArea = document.getElementById('previewArea');
    if (clientWindow) {
      clientWindow.classList.remove('light-inbox', 'dark-inbox', 'sahinur-terminal');
      clientWindow.classList.add(this.inboxTheme === 'dark' ? 'dark-inbox' : 'light-inbox');
    }
    if (previewArea) {
      previewArea.classList.remove('preview-theme-light', 'preview-theme-dark');
      previewArea.classList.add(this.inboxTheme === 'dark' ? 'preview-theme-dark' : 'preview-theme-light');
    }
    const themeLightBtn = document.getElementById('themeLightBtn');
    const themeDarkBtn = document.getElementById('themeDarkBtn');
    if (themeLightBtn && themeDarkBtn) {
      if (this.inboxTheme === 'dark') {
        themeDarkBtn.classList.add('active');
        themeLightBtn.classList.remove('active');
      } else {
        themeLightBtn.classList.add('active');
        themeDarkBtn.classList.remove('active');
      }
    }

    if (requestedPreset) {
      if (Presets.styles[requestedPreset]) {
        this.applyPreset(requestedPreset);
      } else {
        const userPresets = PresetManager.getUserPresets();
        const found = userPresets.find(p => p.id === requestedPreset);
        if (found) {
          this.applyUserPresetObject(found);
        }
      }
    }

    // Initialize High-DPI canvas avatar with state settings synchronized
    if (typeof ImageProcessor !== 'undefined') {
      ImageProcessor.config.size = this.state.settings.avatarSize || 85;
      ImageProcessor.config.shape = this.state.settings.avatarShape || 'square';
      ImageProcessor.config.borderWidth = 0;
      ImageProcessor.config.borderColor = this.state.settings.avatarBorderColor || '#00DC82';
      ImageProcessor.config.dpi = this.state.settings.avatarDpi || 2;
      ImageProcessor.init((dataUrl) => {
        this.state.data.avatarUrl = dataUrl;
        this.updateLivePreview();
      });
    }

    this.bindEvents();
    this.bindWebsiteInteractions();
    this.syncFormWithState();
    this.syncEmailTemplateFromDom();
    this.renderClientChrome(this.clientView || 'gmail');

    if (requestedMode === 'team' || requestedMode === 'batch') {
      const teamBtn = document.getElementById('modeTeamBtn');
      if (teamBtn) teamBtn.click();
    } else if (requestedMode === 'email' || requestedMode === 'template') {
      const tplBtn = document.getElementById('modeTemplateBtn');
      if (tplBtn) tplBtn.click();
    }

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
    setIcon('modeTeamIcon', Icons.ui.users);
    setIcon('modeTplIcon', Icons.ui.template);
    setIcon('savePresetIcon', Icons.ui.save);
    setIcon('managePresetsIcon', Icons.ui.folder);
    setIcon('guideIcon', Icons.ui.help);
    setIcon('copyPrimaryIcon', Icons.ui.copy);
    setIcon('shieldIcon', Icons.ui.shield);
    setIcon('codeIcon', Icons.ui.code);
    setIcon('downloadIcon', Icons.ui.download);
    setIcon('imageIcon', Icons.ui.image);
    setIcon('copyBtnIcon', Icons.ui.copy);
    setIcon('closeCodeModalBtn', Icons.ui.close);
    setIcon('teamZipIcon', Icons.ui.download);
  },

  /**
   * Populate custom presets optgroup in preset selector
   */
  refreshPresetDropdown() {
    const userGroup = document.getElementById('userPresetsGroup');
    if (!userGroup) return;

    const userPresets = PresetManager.getUserPresets();
    if (!userPresets.length) {
      userGroup.innerHTML = '<option disabled>No custom presets saved yet</option>';
      return;
    }

    userGroup.innerHTML = userPresets.map(p => {
      return `<option value="${p.id}">Custom: ${p.name}</option>`;
    }).join('');
  },

  /**
   * Apply built-in preset
   */
  applyPreset(presetKey) {
    const p = Presets.styles[presetKey];
    if (!p) return;

    this.state.settings = Object.assign({}, p.settings);
    if (p.settings.template) {
      this.state.settings.template = p.settings.template;
    }
    if (p.data) {
      this.state.data = Object.assign({}, this.state.data, p.data);
    }

    if (typeof ImageProcessor !== 'undefined' && p.settings) {
      if (p.settings.avatarShape) ImageProcessor.config.shape = p.settings.avatarShape;
      if (p.settings.avatarSize) ImageProcessor.config.size = p.settings.avatarSize;
      ImageProcessor.config.borderWidth = 0;
      if (p.settings.avatarBorderColor) ImageProcessor.config.borderColor = p.settings.avatarBorderColor;
      ImageProcessor.process((dataUrl) => {
        this.state.data.avatarUrl = dataUrl;
        this.updateLivePreview();
      });
    }

    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) presetSelect.value = presetKey;

    this.syncFormWithState();
    this.updateLivePreview();
    this.showToast(`Applied preset: ${p.name}`, 'success');
  },

  /**
   * Apply user custom preset object
   */
  applyUserPresetObject(presetObj) {
    if (!presetObj) return;

    if (presetObj.settings) {
      this.state.settings = Object.assign({}, this.state.settings, presetObj.settings);
    }
    if (presetObj.data) {
      this.state.data = Object.assign({}, this.state.data, presetObj.data);
    }

    if (typeof ImageProcessor !== 'undefined' && presetObj.settings) {
      const s = presetObj.settings;
      if (s.avatarShape) ImageProcessor.config.shape = s.avatarShape;
      if (s.avatarSize) ImageProcessor.config.size = s.avatarSize;
      ImageProcessor.config.borderWidth = 0;
      if (s.avatarBorderColor) ImageProcessor.config.borderColor = s.avatarBorderColor;
      ImageProcessor.process((dataUrl) => {
        this.state.data.avatarUrl = dataUrl;
        this.updateLivePreview();
      });
    }

    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) presetSelect.value = presetObj.id;

    this.syncFormWithState();
    this.updateLivePreview();
    this.showToast(`Applied custom preset: ${presetObj.name}`, 'success');
  },

  /**
   * Dynamically build the list of social media input items
   */
  renderSocialInputs() {
    const container = document.getElementById('socialsListContainer');
    if (!container) return;

    const availableNetworks = [
      'facebook', 'x', 'youtube', 'linkedin', 'instagram',
      'github', 'orcid', 'googleScholar', 'researchGate', 'website',
      'whatsapp', 'telegram', 'discord', 'behance', 'dribbble',
      'medium', 'phone', 'email', 'calendar', 'location'
    ];

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
      const meta = Icons.social[key] || { name: key, color: '#00DC82', svg: '' };
      const current = (this.state.data.socials || []).find(s => s.id === key) || { enabled: false, url: '' };
      const defItem = (Presets.defaultData.socials || []).find(s => s.id === key) || { url: '' };

      return `
        <div class="social-item" data-social-id="${key}" draggable="true">
          <div class="social-drag-handle" title="Drag to reorder position">
            ${Icons.ui.dragHandle}
          </div>
          <input type="checkbox" class="social-enable-cb" ${current.enabled ? 'checked' : ''} style="cursor: pointer;">
          <div class="social-item-icon" style="color: ${meta.color};">
            ${meta.svg}
          </div>
          <input type="text" class="social-item-input" value="${current.url || ''}" placeholder="${defItem.url || meta.name + ' URL'}">
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
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.dataset.socialId);
      });

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

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over-top', 'drag-over-bottom');
      });

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

      item.addEventListener('dragend', () => {
        draggedItem = null;
        item.classList.remove('dragging');
        container.querySelectorAll('.social-item').forEach(el => {
          el.classList.remove('drag-over-top', 'drag-over-bottom');
        });
      });

      const input = item.querySelector('.social-item-input');
      if (input) {
        input.addEventListener('focus', () => { item.draggable = false; });
        input.addEventListener('blur', () => { item.draggable = true; });
      }
    });
  },

  /**
   * Render Dynamic Custom Fields rows
   */
  renderCustomFieldsInputs() {
    const container = document.getElementById('customFieldsContainer');
    if (!container) return;

    const fields = this.state.data.customFields || [];
    if (!fields.length) {
      container.innerHTML = `<div class="form-label-desc" style="font-style: italic; padding: 4px 0;">No custom fields added yet. Click "+ Add Row" above.</div>`;
      return;
    }

    container.innerHTML = fields.map((f, index) => {
      return `
        <div class="custom-field-row" data-index="${index}" style="display: flex; gap: 6px; align-items: center; background: var(--sahinur-surface-2); padding: 8px; border-radius: 4px; border: 1px solid var(--sahinur-border);">
          <input type="text" class="form-input custom-field-label" value="${f.label || ''}" placeholder="Label (e.g. Pronouns)" style="width: 32%; font-size: 11.5px; padding: 5px 8px;">
          <input type="text" class="form-input custom-field-val" value="${f.value || ''}" placeholder="Value (e.g. he/him)" style="flex: 1; font-size: 11.5px; padding: 5px 8px;">
          <input type="text" class="form-input custom-field-url" value="${f.url || ''}" placeholder="URL (Optional)" style="width: 25%; font-size: 11.5px; padding: 5px 8px;">
          <button class="btn-secondary remove-custom-field-btn" data-index="${index}" style="padding: 5px 8px; color: #EF4444; border-color: rgba(239, 68, 68, 0.3);" title="Delete field">
            &times;
          </button>
        </div>
      `;
    }).join('');

    // Bind remove buttons
    container.querySelectorAll('.remove-custom-field-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index, 10);
        this.state.data.customFields.splice(idx, 1);
        this.renderCustomFieldsInputs();
        this.updateLivePreview();
      });
    });

    // Bind input updates
    container.querySelectorAll('.custom-field-row').forEach(row => {
      const idx = parseInt(row.dataset.index, 10);
      const labelInput = row.querySelector('.custom-field-label');
      const valInput = row.querySelector('.custom-field-val');
      const urlInput = row.querySelector('.custom-field-url');

      const updateRow = () => {
        if (this.state.data.customFields[idx]) {
          this.state.data.customFields[idx] = {
            label: labelInput.value.trim(),
            value: valInput.value.trim(),
            url: urlInput.value.trim()
          };
          this.updateLivePreview();
        }
      };

      labelInput.addEventListener('input', updateRow);
      valInput.addEventListener('input', updateRow);
      urlInput.addEventListener('input', updateRow);
    });
  },

  /**
   * Render Team Roster list in sidebar
   */
  renderTeamRosterList() {
    const container = document.getElementById('teamRosterContainer');
    const countEl = document.getElementById('teamMemberCount');
    if (!container) return;

    const roster = TeamEngine.roster;
    if (countEl) countEl.textContent = roster.length;

    if (!roster.length) {
      container.innerHTML = `<div class="form-label-desc" style="padding: 10px; text-align: center;">No team members found. Upload a CSV or add a member.</div>`;
      return;
    }

    container.innerHTML = roster.map(m => {
      const isActive = m.id === TeamEngine.activeMemberId;
      return `
        <div class="team-member-item ${isActive ? 'active' : ''}" data-member-id="${m.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: ${isActive ? 'var(--sahinur-surface-2)' : 'transparent'}; border: 1px solid ${isActive ? 'var(--sahinur-accent)' : 'var(--sahinur-border)'}; border-radius: 4px; margin-bottom: 6px; cursor: pointer;">
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <div style="font-weight: 600; font-size: 12px; color: ${isActive ? 'var(--sahinur-accent)' : 'var(--sahinur-text-bright)'};">${m.fullName}</div>
            <div style="font-size: 10.5px; color: var(--sahinur-text-dim);">${m.jobTitle || 'No Title'} &bull; ${m.email || 'No Email'}</div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="btn-secondary delete-member-btn" data-member-id="${m.id}" style="padding: 2px 6px; font-size: 10px; color: #EF4444;" title="Delete Member">&times;</button>
          </div>
        </div>
      `;
    }).join('');

    // Switch active member on click
    container.querySelectorAll('.team-member-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.delete-member-btn')) return;
        const memberId = el.dataset.memberId;
        TeamEngine.activeMemberId = memberId;
        this.renderTeamRosterList();
        this.syncActiveTeamMemberToSimulator();
      });
    });

    // Delete member button
    container.querySelectorAll('.delete-member-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const memberId = btn.dataset.memberId;
        TeamEngine.removeMember(memberId);
        this.renderTeamRosterList();
        this.syncActiveTeamMemberToSimulator();
        this.showToast('Member removed from roster', 'info');
      });
    });
  },

  /**
   * Sync active team member to live preview simulator
   */
  syncActiveTeamMemberToSimulator() {
    const member = TeamEngine.getActiveMember();
    if (!member) return;

    this.state.data.fullName = member.fullName || this.state.data.fullName;
    this.state.data.jobTitle = member.jobTitle || this.state.data.jobTitle;
    this.state.data.department = member.department || this.state.data.department;
    this.state.data.company = member.company || this.state.data.company;
    this.state.data.email = member.email || this.state.data.email;
    this.state.data.phone = member.phone || this.state.data.phone;
    this.state.data.website = member.website || this.state.data.website;
    this.state.data.address = member.location || this.state.data.address;

    this.syncFormWithState();
    this.updateLivePreview();
  },

  /**
   * Sync form inputs to match the current state
   */
  syncFormWithState() {
    const d = this.state.data;
    const s = this.state.settings;

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

    // Photo & Logo Settings
    setVal('avatarSize', s.avatarSize || 85);
    const avatarSizeVal = document.getElementById('avatarSizeVal');
    if (avatarSizeVal) avatarSizeVal.textContent = `${s.avatarSize || 85}px`;

    if (typeof ImageProcessor !== 'undefined') {
      ImageProcessor.config.size = s.avatarSize || 85;
      ImageProcessor.config.shape = s.avatarShape || 'square';
      ImageProcessor.config.borderWidth = 0;
      ImageProcessor.config.borderColor = s.avatarBorderColor || '#00DC82';
    }

    setVal('avatarZoom', (typeof ImageProcessor !== 'undefined' && ImageProcessor.config) ? ImageProcessor.config.zoom : 1.0);
    const avatarZoomVal = document.getElementById('avatarZoomVal');
    if (avatarZoomVal) avatarZoomVal.textContent = `${((typeof ImageProcessor !== 'undefined' && ImageProcessor.config) ? ImageProcessor.config.zoom : 1.0).toFixed(1)}x`;

    setVal('avatarBorderWidth', s.avatarBorderWidth !== undefined ? s.avatarBorderWidth : 2);
    const avatarBorderVal = document.getElementById('avatarBorderVal');
    if (avatarBorderVal) avatarBorderVal.textContent = `${s.avatarBorderWidth !== undefined ? s.avatarBorderWidth : 2}px`;

    setVal('avatarBorderColor', s.avatarBorderColor || '#00DC82');
    setVal('avatarBorderColorHex', s.avatarBorderColor || '#00DC82');

    // Logo
    setChecked('showLogo', d.showLogo);
    const logoGroup = document.getElementById('logoControlsGroup');
    if (logoGroup) logoGroup.style.display = d.showLogo ? 'flex' : 'none';
    setVal('logoSize', d.logoSize || 70);
    const logoSizeVal = document.getElementById('logoSizeVal');
    if (logoSizeVal) logoSizeVal.textContent = `${d.logoSize || 70}px`;
    setVal('logoShape', d.logoShape || 'square');

    // Avatar Shapes
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === (s.avatarShape || 'squircle'));
    });

    // Template Layout Cards
    document.querySelectorAll('.template-card').forEach(card => {
      card.classList.toggle('active', card.dataset.template === (s.template || 'vertical-divider'));
    });

    // Signature Colors
    const syncColorPair = (id, val) => {
      const p = document.getElementById(id);
      const h = document.getElementById(id + 'Hex');
      if (p && val) p.value = val;
      if (h && val) h.value = val;
    };
    syncColorPair('accentColor', s.accentColor || '#00DC82');
    syncColorPair('nameColor', s.nameColor || '#0A0A0A');
    syncColorPair('titleColor', s.titleColor || s.accentColor || '#00DC82');
    syncColorPair('bodyColor', s.bodyColor || '#242424');
    syncColorPair('labelColor', s.labelColor || s.accentColor || '#00DC82');
    syncColorPair('linkColor', s.linkColor || s.accentColor || '#00DC82');
    syncColorPair('dividerColor', s.dividerColor || s.accentColor || '#00DC82');
    syncColorPair('quoteColor', s.quoteColor || '#475569');
    syncColorPair('disclaimerColor', s.disclaimerColor || '#94A3B8');

    // Email Template Colors
    const td = this.state.templateData;
    syncColorPair('tplHeaderColor', td.headerTextColor || '#FFFFFF');
    syncColorPair('tplHeaderBgColor', td.headerBgColor || '#0F172A');
    syncColorPair('tplGreetingColor', td.greetingColor || '#0F172A');
    syncColorPair('tplBodyColor', td.bodyColor || '#334155');
    syncColorPair('tplHighlightTitleColor', td.highlightTitleColor || '#00DC82');
    syncColorPair('tplHighlightTextColor', td.highlightTextColor || '#334155');
    syncColorPair('tplHighlightBgColor', td.highlightBgColor || '#F8FAFC');
    syncColorPair('tplCtaTextColor', td.ctaTextColor || '#0F172A');
    syncColorPair('tplCtaBgColor', td.ctaBgColor || '#00DC82');
    syncColorPair('tplClosingColor', td.closingColor || '#64748B');
    syncColorPair('tplFooterColor', td.footerTextColor || '#64748B');
    setVal('tplHeaderTag', td.headerTag || '');

    // Typography
    setVal('fontFamily', s.fontFamily || "'Courier New', Courier, monospace");
    setVal('nameFontSize', s.nameFontSize || 17);
    const nameFontSizeVal = document.getElementById('nameFontSizeVal');
    if (nameFontSizeVal) nameFontSizeVal.textContent = `${s.nameFontSize || 17}px`;

    setVal('bodyFontSize', s.bodyFontSize || 12.5);
    const bodyFontSizeVal = document.getElementById('bodyFontSizeVal');
    if (bodyFontSizeVal) bodyFontSizeVal.textContent = `${s.bodyFontSize || 12.5}px`;

    setVal('dividerThickness', s.dividerThickness || 2);
    const dividerThicknessVal = document.getElementById('dividerThicknessVal');
    if (dividerThicknessVal) dividerThicknessVal.textContent = `${s.dividerThickness || 2}px`;
    setVal('dividerStyle', s.dividerStyle || 'solid');

    // Social Icon Scheme
    setVal('iconStyle', s.iconStyle || 'accent');
    setVal('iconSize', s.iconSize || 18);
    const iconSizeVal = document.getElementById('iconSizeVal');
    if (iconSizeVal) iconSizeVal.textContent = `${s.iconSize || 18}px`;

    setVal('iconSpacing', s.iconSpacing || 8);
    const iconSpacingVal = document.getElementById('iconSpacingVal');
    if (iconSpacingVal) iconSpacingVal.textContent = `${s.iconSpacing || 8}px`;

    // Addons
    setChecked('showBadge', d.showBadge);
    const badgeInputGroup = document.getElementById('badgeInputGroup');
    if (badgeInputGroup) badgeInputGroup.style.display = d.showBadge ? 'block' : 'none';
    setVal('badgeText', d.badgeText || 'Dev Architect');

    setChecked('showCta', d.showCta);
    const ctaInputGroup = document.getElementById('ctaInputGroup');
    if (ctaInputGroup) ctaInputGroup.style.display = d.showCta ? 'flex' : 'none';
    setVal('ctaText', d.ctaText || 'Schedule a Meeting');
    setVal('ctaUrl', d.ctaUrl || 'https://calendly.com');

    setChecked('showGreenNote', d.showGreenNote);
    const greenNoteGroup = document.getElementById('greenNoteInputGroup');
    if (greenNoteGroup) greenNoteGroup.style.display = d.showGreenNote ? 'block' : 'none';
    setVal('greenNoteText', d.greenNoteText || 'Please consider the environment before printing this email.');

    setChecked('showQuote', d.showQuote);
    const quoteGroup = document.getElementById('quoteInputGroup');
    if (quoteGroup) quoteGroup.style.display = d.showQuote ? 'block' : 'none';
    setVal('quoteText', d.quoteText || '');
    setChecked('autoShuffleQuote', d.autoShuffleQuote !== false);

    setChecked('showDisclaimer', d.showDisclaimer);
    const disclaimerGroup = document.getElementById('disclaimerInputGroup');
    if (disclaimerGroup) disclaimerGroup.style.display = d.showDisclaimer ? 'block' : 'none';
    setVal('disclaimerText', d.disclaimerText || '');

    // Promo Banner
    setChecked('showPromoBanner', d.promoBanner ? d.promoBanner.enabled : false);
    const promoBannerGroup = document.getElementById('promoBannerGroup');
    if (promoBannerGroup) promoBannerGroup.style.display = (d.promoBanner && d.promoBanner.enabled) ? 'flex' : 'none';
    setVal('promoTargetUrl', (d.promoBanner && d.promoBanner.targetUrl) || 'https://www.dhrubojyoti.dev');
    setVal('promoAltText', (d.promoBanner && d.promoBanner.alt) || 'Special Announcement');
  },

  /**
   * Sync social media inputs from DOM to state
   */
  syncSocialsFromDom() {
    const container = document.getElementById('socialsListContainer');
    if (!container) return;

    const socials = [];
    container.querySelectorAll('.social-item').forEach(item => {
      const id = item.dataset.socialId;
      const cb = item.querySelector('.social-enable-cb');
      const input = item.querySelector('.social-item-input');
      if (id && cb && input) {
        socials.push({
          id,
          enabled: cb.checked,
          url: input.value.trim()
        });
      }
    });

    this.state.data.socials = socials;
    this.updateLivePreview();
  },

  /**
   * Sync email template values from DOM
   */
  syncEmailTemplateFromDom() {
    const getVal = (id, def = '') => { const el = document.getElementById(id); return el ? el.value : def; };
    const getChecked = id => { const el = document.getElementById(id); return el ? el.checked : false; };

    this.state.templateData.title = getVal('tplSubject', 'Project Update');
    this.state.templateData.preheader = getVal('tplPreheader', 'Important updates and technical roadmap');
    this.state.templateData.headerLogoText = getVal('tplHeaderLogoText', 'DHRUBOJYOTI SAHA \u2022 PORTFOLIO');
    this.state.templateData.headerTag = getVal('tplHeaderTag', '');
    this.state.templateData.greeting = getVal('tplGreeting', 'Dear Colleague,');
    this.state.templateData.paragraphs = [
      getVal('tplParagraph1', ''),
      getVal('tplParagraph2', '')
    ].filter(Boolean);
    this.state.templateData.closing = getVal('tplClosing', 'Best regards,');
    this.state.templateData.ctaText = getVal('tplCtaText', 'Explore Project Showcase');
    this.state.templateData.ctaUrl = getVal('tplCtaUrl', 'https://www.dhrubojyoti.dev');
    this.state.templateData.showCta = true;

    // Email Granular Colors
    this.state.templateData.headerTextColor = getVal('tplHeaderColor', '#FFFFFF');
    this.state.templateData.headerBgColor = getVal('tplHeaderBgColor', '#0F172A');
    this.state.templateData.greetingColor = getVal('tplGreetingColor', '#0F172A');
    this.state.templateData.bodyColor = getVal('tplBodyColor', '#334155');
    this.state.templateData.highlightTitleColor = getVal('tplHighlightTitleColor', '#00DC82');
    this.state.templateData.highlightTextColor = getVal('tplHighlightTextColor', '#334155');
    this.state.templateData.highlightBgColor = getVal('tplHighlightBgColor', '#F8FAFC');
    this.state.templateData.ctaTextColor = getVal('tplCtaTextColor', '#0F172A');
    this.state.templateData.ctaBgColor = getVal('tplCtaBgColor', '#00DC82');
    this.state.templateData.closingColor = getVal('tplClosingColor', '#64748B');
    this.state.templateData.footerTextColor = getVal('tplFooterColor', '#64748B');

    this.state.templateData.highlightBox = {
      enabled: getChecked('tplShowHighlight'),
      title: getVal('tplHighlightTitle', 'Key Highlights'),
      content: getVal('tplHighlightContent', '')
    };

    const subjectDisplay = document.getElementById('previewSubjectLine');
    if (subjectDisplay) {
      const title = this.state.templateData.title || 'Introduction & Project Update';
      if (subjectDisplay.tagName === 'INPUT') {
        subjectDisplay.value = title;
      } else {
        subjectDisplay.textContent = title;
      }
    }
  },

  /**
   * Core Live Render update
   */
  updateLivePreview() {
    const canvas = document.getElementById('liveRenderCanvas');
    if (!canvas) return;

    const isDark = this.inboxTheme === 'dark';

    const subjectDisplay = document.getElementById('previewSubjectLine');
    if (subjectDisplay) {
      const title = (this.state && this.state.templateData && this.state.templateData.title) 
        ? this.state.templateData.title 
        : 'Introduction & Project Update';
      if (subjectDisplay.tagName === 'INPUT') {
        subjectDisplay.value = title;
      } else {
        subjectDisplay.textContent = title;
      }
    }

    if (this.mode === 'template') {
      const introText = document.getElementById('signatureModeIntroText');
      if (introText) introText.style.display = 'none';

      if (typeof EmailTemplateEngine !== 'undefined') {
        const emailHtml = EmailTemplateEngine.generateEmailHtml(
          this.state.templateData,
          this.state.data,
          this.state.settings,
          isDark,
          false
        );
        canvas.innerHTML = emailHtml;
      }
    } else {
      const introText = document.getElementById('signatureModeIntroText');
      if (introText) introText.style.display = 'block';

      if (typeof SignatureEngine !== 'undefined') {
        const sigHtml = SignatureEngine.generateHtml(
          this.state.data,
          this.state.settings,
          isDark,
          false
        );
        canvas.innerHTML = sigHtml;
      }
    }

    this.saveToStorage();
  },

  /**
   * Render Authentic Simulator Chrome for Gmail, Apple Mail, and Outlook
   */
  renderClientChrome(clientName) {
    const clientWindow = document.getElementById('clientWindow');
    const headerEl = document.getElementById('simulatorHeader');
    const fieldsEl = document.getElementById('simulatorFields');
    const footerEl = document.getElementById('simulatorFooter');
    
    if (clientWindow) {
      clientWindow.classList.remove('client-gmail', 'client-apple', 'client-outlook');
      clientWindow.classList.add(`client-${clientName}`);
    }

    const subjectVal = (this.state && this.state.templateData && this.state.templateData.title) 
      ? this.state.templateData.title 
      : 'Introduction & Project Update';
    const fullName = (this.state && this.state.data && this.state.data.fullName) 
      ? this.state.data.fullName 
      : 'Dhrubojyoti Saha';
    const emailAddr = (this.state && this.state.data && this.state.data.email) 
      ? this.state.data.email 
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
        fieldsEl.className = 'gmail-compose-fields';
        fieldsEl.innerHTML = `
          <div class="outlook-field-row">
            <button class="outlook-field-btn">To</button>
            <div class="outlook-field-value-box">
              <span class="outlook-contact-tag">recipient@domain.com</span>
            </div>
          </div>
          <div class="outlook-field-row">
            <button class="outlook-field-btn">Cc</button>
            <div class="outlook-field-value-box"></div>
          </div>
          <div class="outlook-field-row outlook-subject-row">
            <input type="text" class="outlook-subject-input" id="previewSubjectLine" readonly value="${subjectVal}">
          </div>
        `;
      }
      if (footerEl) {
        footerEl.className = 'outlook-status-bar';
        footerEl.innerHTML = `
          <div class="outlook-status-left">
            <span>Sensitivity: Normal</span>
            <span class="separator">|</span>
            <span>Accessibility: Good to go</span>
          </div>
          <div class="outlook-status-right">
            <span>Microsoft 365 &bull; HTML</span>
          </div>
        `;
      }
    }
  },

  /**
   * Bind event listeners across forms, buttons, tabs, drag & drop, and modals
   */
  bindEvents() {
    // Mode Switcher (Individual / Team Batch / Email Builder)
    const modeSigBtn = document.getElementById('modeSignatureBtn');
    const modeTeamBtn = document.getElementById('modeTeamBtn');
    const modeTplBtn = document.getElementById('modeTemplateBtn');
    const tabTeamNavBtn = document.getElementById('tabTeamNavBtn');
    const tabEmailNavBtn = document.getElementById('tabEmailNavBtn');

    if (modeSigBtn) {
      modeSigBtn.addEventListener('click', () => {
        this.mode = 'signature';
        modeSigBtn.classList.add('active');
        if (modeTeamBtn) modeTeamBtn.classList.remove('active');
        if (modeTplBtn) modeTplBtn.classList.remove('active');
        if (tabTeamNavBtn) tabTeamNavBtn.style.display = 'none';
        if (tabEmailNavBtn) tabEmailNavBtn.style.display = 'none';
        document.querySelector('.sidebar-nav-btn[data-tab="tab-identity"]')?.click();
        this.updateLivePreview();
      });
    }

    if (modeTeamBtn) {
      modeTeamBtn.addEventListener('click', () => {
        this.mode = 'team';
        modeTeamBtn.classList.add('active');
        if (modeSigBtn) modeSigBtn.classList.remove('active');
        if (modeTplBtn) modeTplBtn.classList.remove('active');
        if (tabTeamNavBtn) tabTeamNavBtn.style.display = 'flex';
        if (tabEmailNavBtn) tabEmailNavBtn.style.display = 'none';
        tabTeamNavBtn.click();
        this.renderTeamRosterList();
        this.syncActiveTeamMemberToSimulator();
      });
    }

    if (modeTplBtn) {
      modeTplBtn.addEventListener('click', () => {
        this.mode = 'template';
        modeTplBtn.classList.add('active');
        if (modeSigBtn) modeSigBtn.classList.remove('active');
        if (modeTeamBtn) modeTeamBtn.classList.remove('active');
        if (tabTeamNavBtn) tabTeamNavBtn.style.display = 'none';
        if (tabEmailNavBtn) tabEmailNavBtn.style.display = 'flex';
        tabEmailNavBtn.click();
        this.updateLivePreview();
      });
    }

    // Sidebar Tab Navigation
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sidebar-panel').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.dataset.tab;
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });

    // Preset Selection Dropdown
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (Presets.styles[val]) {
          this.applyPreset(val);
        } else {
          const userPresets = PresetManager.getUserPresets();
          const found = userPresets.find(p => p.id === val);
          if (found) {
            this.applyUserPresetObject(found);
          }
        }
      });
    }

    // Save Preset Modal
    const savePresetBtn = document.getElementById('savePresetBtn');
    const savePresetModalOverlay = document.getElementById('savePresetModalOverlay');
    const closeSavePresetModalBtn = document.getElementById('closeSavePresetModalBtn');
    const cancelSavePresetBtn = document.getElementById('cancelSavePresetBtn');
    const confirmSavePresetBtn = document.getElementById('confirmSavePresetBtn');

    if (savePresetBtn && savePresetModalOverlay) {
      savePresetBtn.addEventListener('click', () => {
        savePresetModalOverlay.classList.add('active');
        const nameInput = document.getElementById('savePresetName');
        if (nameInput) {
          nameInput.value = '';
          nameInput.focus();
        }
      });

      const closeSaveModal = () => savePresetModalOverlay.classList.remove('active');
      if (closeSavePresetModalBtn) closeSavePresetModalBtn.addEventListener('click', closeSaveModal);
      if (cancelSavePresetBtn) cancelSavePresetBtn.addEventListener('click', closeSaveModal);

      if (confirmSavePresetBtn) {
        confirmSavePresetBtn.addEventListener('click', () => {
          const nameInput = document.getElementById('savePresetName');
          const descInput = document.getElementById('savePresetDesc');
          const name = nameInput ? nameInput.value.trim() : '';
          const desc = descInput ? descInput.value.trim() : '';

          if (!name) {
            this.showToast('Please enter a preset name', 'warning');
            return;
          }

          PresetManager.savePreset(name, desc, this.state.data, this.state.settings);
          this.refreshPresetDropdown();
          closeSaveModal();
          this.showToast(`Saved preset "${name}" to browser storage!`, 'success');
        });
      }
    }

    // Preset Manager Modal
    const managePresetsBtn = document.getElementById('managePresetsBtn');
    const presetManagerModalOverlay = document.getElementById('presetManagerModalOverlay');
    const closePresetManagerModalBtn = document.getElementById('closePresetManagerModalBtn');

    if (managePresetsBtn && presetManagerModalOverlay) {
      managePresetsBtn.addEventListener('click', () => {
        this.renderPresetManagerModalList();
        presetManagerModalOverlay.classList.add('active');
      });

      if (closePresetManagerModalBtn) {
        closePresetManagerModalBtn.addEventListener('click', () => {
          presetManagerModalOverlay.classList.remove('active');
        });
      }

      // Export All JSON Backup
      const exportAllBtn = document.getElementById('exportAllPresetsJsonBtn');
      if (exportAllBtn) {
        exportAllBtn.addEventListener('click', () => {
          PresetManager.exportAllUserPresets();
          this.showToast('Exported preset backup JSON!', 'success');
        });
      }

      // Import JSON File
      const importInput = document.getElementById('importPresetJsonFileInput');
      if (importInput) {
        importInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            const res = PresetManager.importFromJsonString(event.target.result);
            if (res.success) {
              this.refreshPresetDropdown();
              this.renderPresetManagerModalList();
              this.showToast(`Successfully imported ${res.count} preset(s)!`, 'success');
            } else {
              this.showToast(`Import failed: ${res.error}`, 'error');
            }
          };
          reader.readAsText(file);
          importInput.value = '';
        });
      }
    }

    // Add Custom Field Row
    const addCustomFieldBtn = document.getElementById('addCustomFieldBtn');
    if (addCustomFieldBtn) {
      addCustomFieldBtn.addEventListener('click', () => {
        if (!Array.isArray(this.state.data.customFields)) {
          this.state.data.customFields = [];
        }
        this.state.data.customFields.push({ label: 'Field', value: 'Value', url: '' });
        this.renderCustomFieldsInputs();
        this.updateLivePreview();
      });
    }

    // Promo Banner Image Upload
    const promoBannerFileInput = document.getElementById('promoBannerFileInput');
    if (promoBannerFileInput) {
      promoBannerFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && typeof ImageProcessor !== 'undefined') {
          ImageProcessor.processGenericImage(file, { maxWidth: 840 }, (dataUrl) => {
            if (!this.state.data.promoBanner) {
              this.state.data.promoBanner = { enabled: true, imageUrl: '', targetUrl: '', alt: '' };
            }
            this.state.data.promoBanner.imageUrl = dataUrl;
            this.updateLivePreview();
            this.showToast('Uploaded promo banner image!', 'success');
          });
        }
      });
    }

    // Promo Target URL & Alt inputs
    const promoTargetUrl = document.getElementById('promoTargetUrl');
    if (promoTargetUrl) {
      promoTargetUrl.addEventListener('input', (e) => {
        if (!this.state.data.promoBanner) this.state.data.promoBanner = { enabled: true };
        this.state.data.promoBanner.targetUrl = e.target.value.trim();
        this.updateLivePreview();
      });
    }

    const promoAltText = document.getElementById('promoAltText');
    if (promoAltText) {
      promoAltText.addEventListener('input', (e) => {
        if (!this.state.data.promoBanner) this.state.data.promoBanner = { enabled: true };
        this.state.data.promoBanner.alt = e.target.value.trim();
        this.updateLivePreview();
      });
    }

    const showPromoBanner = document.getElementById('showPromoBanner');
    if (showPromoBanner) {
      showPromoBanner.addEventListener('change', (e) => {
        if (!this.state.data.promoBanner) this.state.data.promoBanner = {};
        this.state.data.promoBanner.enabled = e.target.checked;
        const promoGroup = document.getElementById('promoBannerGroup');
        if (promoGroup) promoGroup.style.display = e.target.checked ? 'flex' : 'none';
        this.updateLivePreview();
      });
    }

    // Company Logo Upload & Controls
    const showLogoCb = document.getElementById('showLogo');
    if (showLogoCb) {
      showLogoCb.addEventListener('change', (e) => {
        this.state.data.showLogo = e.target.checked;
        const logoGroup = document.getElementById('logoControlsGroup');
        if (logoGroup) logoGroup.style.display = e.target.checked ? 'flex' : 'none';
        this.updateLivePreview();
      });
    }

    const logoFileInput = document.getElementById('logoFileInput');
    if (logoFileInput) {
      logoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && typeof ImageProcessor !== 'undefined') {
          ImageProcessor.processGenericImage(file, { maxWidth: 300, maxHeight: 300 }, (dataUrl) => {
            this.state.data.logoUrl = dataUrl;
            this.updateLivePreview();
            this.showToast('Uploaded company logo!', 'success');
          });
        }
      });
    }

    const logoSizeInput = document.getElementById('logoSize');
    if (logoSizeInput) {
      logoSizeInput.addEventListener('input', (e) => {
        this.state.data.logoSize = Number(e.target.value);
        const valEl = document.getElementById('logoSizeVal');
        if (valEl) valEl.textContent = `${e.target.value}px`;
        this.updateLivePreview();
      });
    }

    const logoShapeSelect = document.getElementById('logoShape');
    if (logoShapeSelect) {
      logoShapeSelect.addEventListener('change', (e) => {
        this.state.data.logoShape = e.target.value;
        this.updateLivePreview();
      });
    }

    // CSV Dropzone & File Upload
    const csvDropzone = document.getElementById('csvDropzone');
    const csvFileInput = document.getElementById('csvFileInput');

    if (csvDropzone && csvFileInput) {
      csvDropzone.addEventListener('click', () => csvFileInput.click());

      csvDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        csvDropzone.style.borderColor = 'var(--sahinur-accent)';
      });

      csvDropzone.addEventListener('dragleave', () => {
        csvDropzone.style.borderColor = 'var(--sahinur-border-strong)';
      });

      csvDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        csvDropzone.style.borderColor = 'var(--sahinur-border-strong)';
        const file = e.dataTransfer.files[0];
        if (file) this.handleCsvFile(file);
      });

      csvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleCsvFile(file);
        csvFileInput.value = '';
      });
    }

    // Sample CSV Download
    const sampleCsvBtn = document.getElementById('downloadSampleCsvBtn');
    if (sampleCsvBtn) {
      sampleCsvBtn.addEventListener('click', () => {
        TeamEngine.downloadSampleCsv();
        this.showToast('Downloaded sample team CSV template', 'success');
      });
    }

    // Add Single Team Member
    const addTeamMemberBtn = document.getElementById('addTeamMemberBtn');
    if (addTeamMemberBtn) {
      addTeamMemberBtn.addEventListener('click', () => {
        const newMember = TeamEngine.addMember({
          fullName: 'New Team Member',
          jobTitle: 'Software Engineer',
          company: this.state.data.company || 'Company Name',
          department: this.state.data.department || 'Engineering',
          email: 'member@company.com'
        });
        TeamEngine.activeMemberId = newMember.id;
        this.renderTeamRosterList();
        this.syncActiveTeamMemberToSimulator();
        this.showToast('Added new team member', 'success');
      });
    }

    // 1-Click Batch Zip Export
    const exportTeamZipBtn = document.getElementById('exportTeamZipBtn');
    if (exportTeamZipBtn) {
      exportTeamZipBtn.addEventListener('click', async () => {
        try {
          this.showToast('Compiling batch HTML signatures...', 'info');
          const res = await TeamEngine.exportTeamBatchZip(this.state.data, this.state.settings);
          this.showToast(`Batch export complete! Downloaded ${res.count} signatures in ${res.zipName}`, 'success');
        } catch (e) {
          this.showToast(`Batch export failed: ${e.message}`, 'error');
        }
      });
    }

    // Team Directory Hub Modal
    const openTeamDirBtn = document.getElementById('openTeamDirectoryBtn');
    const teamDirModalOverlay = document.getElementById('teamDirectoryModalOverlay');
    const closeTeamDirModalBtn = document.getElementById('closeTeamDirectoryModalBtn');
    const teamSearchInput = document.getElementById('teamSearchInput');

    if (openTeamDirBtn && teamDirModalOverlay) {
      openTeamDirBtn.addEventListener('click', () => {
        this.renderTeamDirectoryModalList();
        teamDirModalOverlay.classList.add('active');
        if (teamSearchInput) {
          teamSearchInput.value = '';
          teamSearchInput.focus();
        }
      });

      if (closeTeamDirModalBtn) {
        closeTeamDirModalBtn.addEventListener('click', () => {
          teamDirModalOverlay.classList.remove('active');
        });
      }

      if (teamSearchInput) {
        teamSearchInput.addEventListener('input', (e) => {
          this.renderTeamDirectoryModalList(e.target.value.toLowerCase());
        });
      }
    }

    // Raw HTML Code Modal
    const copyRawHtmlBtn = document.getElementById('copyRawHtmlBtn');
    const codeModalOverlay = document.getElementById('codeModalOverlay');
    const closeCodeModalBtn = document.getElementById('closeCodeModalBtn');
    const rawCodeViewer = document.getElementById('rawCodeViewer');
    const copyCodeModalBtn = document.getElementById('copyCodeModalBtn');

    if (copyRawHtmlBtn && codeModalOverlay) {
      copyRawHtmlBtn.addEventListener('click', () => {
        const isDark = this.inboxTheme === 'dark';
        const html = this.mode === 'template'
          ? EmailTemplateEngine.generateEmailHtml(this.state.templateData, this.state.data, this.state.settings, isDark, true)
          : SignatureEngine.generateHtml(this.state.data, this.state.settings, isDark, true);

        if (rawCodeViewer) rawCodeViewer.value = html;
        codeModalOverlay.classList.add('active');
      });

      if (closeCodeModalBtn) {
        closeCodeModalBtn.addEventListener('click', () => codeModalOverlay.classList.remove('active'));
      }

      if (copyCodeModalBtn && rawCodeViewer) {
        copyCodeModalBtn.addEventListener('click', () => {
          rawCodeViewer.select();
          navigator.clipboard.writeText(rawCodeViewer.value).then(() => {
            this.showToast('Copied HTML code to clipboard!', 'success');
          });
        });
      }
    }

    // Primary Copy & Rich Copy Buttons
    const copyPrimaryBtn = document.getElementById('copyPrimaryBtn');
    const copyRichBtn = document.getElementById('copyRichBtn');

    const handleRichCopy = async () => {
      // Auto-shuffle quote on every new email / copy if enabled
      if (this.state.data.showQuote && this.state.data.autoShuffleQuote !== false && typeof Quotes !== 'undefined') {
        const newQuote = Quotes.getRandomQuote();
        this.state.data.quoteText = newQuote;
        const quoteInput = document.getElementById('quoteText');
        if (quoteInput) quoteInput.value = newQuote;
        this.updateLivePreview();
      }

      const isDark = this.inboxTheme === 'dark';
      const html = this.mode === 'template'
        ? EmailTemplateEngine.generateEmailHtml(this.state.templateData, this.state.data, this.state.settings, isDark, true)
        : SignatureEngine.generateHtml(this.state.data, this.state.settings, isDark, true);

      if (typeof ClipboardHelper !== 'undefined') {
        const success = await ClipboardHelper.copyHtmlDirectly(html);
        if (success) {
          this.showToast('Signature copied! Direct paste into Gmail or Outlook ready.', 'success');
        } else {
          this.showToast('Clipboard direct paste fallback active. HTML source copied.', 'info');
        }
      }
    };

    if (copyPrimaryBtn) copyPrimaryBtn.addEventListener('click', handleRichCopy);
    if (copyRichBtn) copyRichBtn.addEventListener('click', handleRichCopy);

    // Download HTML file
    const downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
    if (downloadHtmlBtn) {
      downloadHtmlBtn.addEventListener('click', () => {
        const isDark = this.inboxTheme === 'dark';
        const html = this.mode === 'template'
          ? EmailTemplateEngine.generateEmailHtml(this.state.templateData, this.state.data, this.state.settings, isDark, true)
          : SignatureEngine.generateHtml(this.state.data, this.state.settings, isDark, true);

        const fullDoc = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>${this.state.data.fullName || 'Signature'}</title>\n</head>\n<body>\n${html}\n</body>\n</html>`;
        const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mailcraft-${(this.state.data.fullName || 'signature').toLowerCase().replace(/\s+/g, '-')}.html`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
        this.showToast('Downloaded HTML signature file!', 'success');
      });
    }

    // Export 3x HD PNG
    const exportPngBtn = document.getElementById('exportPngBtn');
    if (exportPngBtn) {
      exportPngBtn.addEventListener('click', () => {
        this.showToast('Exporting high-resolution PNG...', 'info');
        this.exportSignatureAsPng();
      });
    }

    // Guide Modal
    const openGuideBtn = document.getElementById('openGuideBtn');
    if (openGuideBtn && typeof Guides !== 'undefined') {
      openGuideBtn.addEventListener('click', () => {
        Guides.openGuideModal(this.clientView);
      });
    }

    // Client Simulator Switchers
    const gmailBtn = document.getElementById('clientGmailBtn');
    const appleBtn = document.getElementById('clientAppleBtn');
    const outlookBtn = document.getElementById('clientOutlookBtn');
    const clientBtns = [gmailBtn, appleBtn, outlookBtn];

    const setClient = (clientName, activeBtn) => {
      this.clientView = clientName;
      clientBtns.forEach(b => b && b.classList.remove('active'));
      if (activeBtn) activeBtn.classList.add('active');

      this.renderClientChrome(clientName);
      this.updateLivePreview();
    };

    if (gmailBtn) gmailBtn.addEventListener('click', () => setClient('gmail', gmailBtn));
    if (appleBtn) appleBtn.addEventListener('click', () => setClient('apple', appleBtn));
    if (outlookBtn) outlookBtn.addEventListener('click', () => setClient('outlook', outlookBtn));

    // Inbox Day/Night Switchers
    const themeLightBtn = document.getElementById('themeLightBtn');
    const themeDarkBtn = document.getElementById('themeDarkBtn');
    const clientWindow = document.getElementById('clientWindow');
    const previewArea = document.getElementById('previewArea');

    if (themeLightBtn && themeDarkBtn) {
      themeLightBtn.addEventListener('click', () => {
        this.inboxTheme = 'light';
        themeLightBtn.classList.add('active');
        themeDarkBtn.classList.remove('active');
        if (clientWindow) {
          clientWindow.classList.remove('dark-inbox', 'sahinur-terminal');
          clientWindow.classList.add('light-inbox');
        }
        if (previewArea) {
          previewArea.classList.remove('preview-theme-dark');
          previewArea.classList.add('preview-theme-light');
        }
        this.updateLivePreview();
      });

      themeDarkBtn.addEventListener('click', () => {
        this.inboxTheme = 'dark';
        themeDarkBtn.classList.add('active');
        themeLightBtn.classList.remove('active');
        if (clientWindow) {
          clientWindow.classList.remove('light-inbox');
          clientWindow.classList.add('dark-inbox');
        }
        if (previewArea) {
          previewArea.classList.remove('preview-theme-light');
          previewArea.classList.add('preview-theme-dark');
        }
        this.updateLivePreview();
      });
    }

    // Zoom In / Out
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomValEl = document.getElementById('zoomVal');
    const previewWrapper = document.getElementById('previewWrapper');

    const updateZoom = (delta) => {
      this.zoom = Math.max(0.7, Math.min(1.5, this.zoom + delta));
      if (zoomValEl) zoomValEl.textContent = `${Math.round(this.zoom * 100)}%`;
      if (previewWrapper) previewWrapper.style.transform = `scale(${this.zoom})`;
    };

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => updateZoom(0.1));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => updateZoom(-0.1));
    if (zoomValEl) {
      zoomValEl.addEventListener('click', () => {
        this.zoom = 1.0;
        zoomValEl.textContent = '100%';
        if (previewWrapper) previewWrapper.style.transform = 'scale(1)';
      });
    }

    // Wire backdrop clicks to close modals
    const modalOverlays = [
      document.getElementById('guideModalOverlay'),
      document.getElementById('savePresetModalOverlay'),
      document.getElementById('presetManagerModalOverlay'),
      document.getElementById('teamDirectoryModalOverlay'),
      document.getElementById('codeModalOverlay')
    ];
    modalOverlays.forEach(overlay => {
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            overlay.classList.remove('active');
          }
        });
      }
    });
  },

  /**
   * Handle CSV file drop or upload
   */
  handleCsvFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = TeamEngine.parseCsv(e.target.result);
      if (parsed.length > 0) {
        this.renderTeamRosterList();
        this.syncActiveTeamMemberToSimulator();
        this.showToast(`Imported ${parsed.length} team members from CSV!`, 'success');
      } else {
        this.showToast('Could not parse members from CSV. Please check format.', 'error');
      }
    };
    reader.readAsText(file);
  },

  /**
   * Render custom preset cards inside preset manager modal
   */
  renderPresetManagerModalList() {
    const container = document.getElementById('customPresetsListModal');
    if (!container) return;

    const presets = PresetManager.getUserPresets();
    if (!presets.length) {
      container.innerHTML = `<div class="form-label-desc" style="padding: 20px; text-align: center;">No custom presets saved yet. Create your unique design and click "Save Preset".</div>`;
      return;
    }

    container.innerHTML = presets.map(p => {
      const dateStr = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '';
      return `
        <div class="custom-preset-card" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--sahinur-surface-2); border: 1px solid var(--sahinur-border); border-radius: 6px;">
          <div>
            <div style="font-weight: 700; font-size: 13px; color: var(--sahinur-text-bright);">${p.name}</div>
            <div style="font-size: 11px; color: var(--sahinur-text-dim); margin-top: 2px;">${p.description || 'Custom template configuration'} ${dateStr ? `&bull; ${dateStr}` : ''}</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn-primary apply-preset-modal-btn" data-preset-id="${p.id}" style="padding: 4px 10px; font-size: 11px;">Apply</button>
            <button class="btn-secondary dup-preset-modal-btn" data-preset-id="${p.id}" style="padding: 4px 8px; font-size: 11px;" title="Duplicate">Copy</button>
            <button class="btn-secondary export-preset-modal-btn" data-preset-id="${p.id}" style="padding: 4px 8px; font-size: 11px;" title="Export JSON">JSON</button>
            <button class="btn-secondary del-preset-modal-btn" data-preset-id="${p.id}" style="padding: 4px 8px; font-size: 11px; color: #EF4444;" title="Delete">&times;</button>
          </div>
        </div>
      `;
    }).join('');

    // Modal buttons wiring
    container.querySelectorAll('.apply-preset-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.presetId;
        const target = PresetManager.getUserPresets().find(p => p.id === id);
        if (target) {
          this.applyUserPresetObject(target);
          document.getElementById('presetManagerModalOverlay')?.classList.remove('active');
        }
      });
    });

    container.querySelectorAll('.dup-preset-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        PresetManager.duplicatePreset(btn.dataset.presetId);
        this.refreshPresetDropdown();
        this.renderPresetManagerModalList();
        this.showToast('Preset duplicated!', 'success');
      });
    });

    container.querySelectorAll('.export-preset-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = PresetManager.getUserPresets().find(p => p.id === btn.dataset.presetId);
        if (target) PresetManager.exportPresetAsJson(target);
      });
    });

    container.querySelectorAll('.del-preset-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        PresetManager.deletePreset(btn.dataset.presetId);
        this.refreshPresetDropdown();
        this.renderPresetManagerModalList();
        this.showToast('Preset deleted.', 'info');
      });
    });
  },

  /**
   * Render Team Directory Modal list with instant copy buttons
   */
  renderTeamDirectoryModalList(searchQuery = '') {
    const container = document.getElementById('teamDirectoryListModal');
    if (!container) return;

    let list = TeamEngine.roster;
    if (searchQuery) {
      list = list.filter(m => {
        const hay = `${m.fullName} ${m.jobTitle} ${m.department} ${m.email} ${m.location}`.toLowerCase();
        return hay.includes(searchQuery);
      });
    }

    if (!list.length) {
      container.innerHTML = `<div class="form-label-desc" style="padding: 20px; text-align: center;">No matching members found.</div>`;
      return;
    }

    container.innerHTML = list.map(m => {
      return `
        <div class="team-directory-card" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--sahinur-surface-2); border: 1px solid var(--sahinur-border); border-radius: 6px;">
          <div>
            <div style="font-weight: 700; font-size: 13px; color: var(--sahinur-text-bright);">${m.fullName}</div>
            <div style="font-size: 11px; color: var(--sahinur-text-dim); margin-top: 2px;">
              ${m.jobTitle || 'Role'} &bull; ${m.department || 'Department'} &bull; <a href="mailto:${m.email}" style="color: var(--sahinur-accent);">${m.email}</a>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn-primary copy-member-rich-btn" data-member-id="${m.id}" style="padding: 4px 10px; font-size: 11px;">Copy Rich</button>
            <button class="btn-secondary copy-member-html-btn" data-member-id="${m.id}" style="padding: 4px 8px; font-size: 11px;">Copy HTML</button>
          </div>
        </div>
      `;
    }).join('');

    // Wire instant copy buttons for each member
    container.querySelectorAll('.copy-member-rich-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const member = TeamEngine.roster.find(m => m.id === btn.dataset.memberId);
        if (!member) return;
        const memberData = {
          ...this.state.data,
          fullName: member.fullName,
          jobTitle: member.jobTitle,
          department: member.department,
          company: member.company || this.state.data.company,
          email: member.email,
          phone: member.phone || this.state.data.phone,
          website: member.website || this.state.data.website,
          address: member.location || this.state.data.address
        };
        const html = SignatureEngine.generateHtml(memberData, this.state.settings, false, true);
        if (typeof ClipboardHelper !== 'undefined') {
          await ClipboardHelper.copyHtmlDirectly(html);
          this.showToast(`Copied signature for ${member.fullName}!`, 'success');
        }
      });
    });

    container.querySelectorAll('.copy-member-html-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const member = TeamEngine.roster.find(m => m.id === btn.dataset.memberId);
        if (!member) return;
        const memberData = {
          ...this.state.data,
          fullName: member.fullName,
          jobTitle: member.jobTitle,
          department: member.department,
          company: member.company || this.state.data.company,
          email: member.email,
          phone: member.phone || this.state.data.phone,
          website: member.website || this.state.data.website,
          address: member.location || this.state.data.address
        };
        const html = SignatureEngine.generateHtml(memberData, this.state.settings, false, true);
        navigator.clipboard.writeText(html).then(() => {
          this.showToast(`Copied raw HTML for ${member.fullName}!`, 'success');
        });
      });
    });
  },

  /**
   * Bind all input events for real-time live preview updates
   */
  bindWebsiteInteractions() {
    const bindInput = (id, prop, target = 'data') => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          this.state[target][prop] = e.target.value;
          this.updateLivePreview();
        });
      }
    };

    const bindSettingInput = (id, prop, isNum = false) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          this.state.settings[prop] = isNum ? Number(e.target.value) : e.target.value;
          this.updateLivePreview();
        });
      }
    };

    // Identity Inputs
    bindInput('fullName', 'fullName');
    bindInput('jobTitle', 'jobTitle');
    bindInput('company', 'company');
    bindInput('department', 'department');
    bindInput('phone', 'phone');
    bindInput('email', 'email');
    bindInput('website', 'website');
    bindInput('address', 'address');
    bindInput('country', 'country');

    // Headshot Upload & DPI
    const avatarInput = document.getElementById('avatarFileInput');
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && typeof ImageProcessor !== 'undefined') {
          ImageProcessor.loadImageFile(file, (dataUrl) => {
            this.state.data.avatarUrl = dataUrl;
            this.updateLivePreview();
            this.showToast('Uploaded and scaled headshot with 2x Retina DPI!', 'success');
          });
        }
      });
    }

    document.querySelectorAll('.dpi-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.dpi-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const dpi = Number(chip.dataset.dpi);
        if (typeof ImageProcessor !== 'undefined') {
          ImageProcessor.config.dpi = dpi;
          ImageProcessor.process((dataUrl) => {
            this.state.data.avatarUrl = dataUrl;
            this.updateLivePreview();
          });
        }
        const label = document.getElementById('dpiLabel');
        if (label) label.textContent = `[${dpi}x RETINA]`;
        const hdBadge = document.getElementById('hdBadge');
        if (hdBadge) hdBadge.textContent = `ONLINE // RETINA ${dpi}X`;
      });
    });

    // Avatar Shapes
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const shape = btn.dataset.shape;
        this.state.settings.avatarShape = shape;
        this.updateLivePreview();
      });
    });

    // Avatar Size
    const avatarSize = document.getElementById('avatarSize');
    if (avatarSize) {
      avatarSize.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        this.state.settings.avatarSize = val;
        const valBadge = document.getElementById('avatarSizeVal');
        if (valBadge) valBadge.textContent = `${val}px`;
        if (typeof ImageProcessor !== 'undefined') {
          ImageProcessor.config.size = val;
          ImageProcessor.process((dataUrl) => {
            this.state.data.avatarUrl = dataUrl;
            this.updateLivePreview();
          });
        } else {
          this.updateLivePreview();
        }
      });
    }

    // Avatar Zoom
    const avatarZoom = document.getElementById('avatarZoom');
    if (avatarZoom) {
      avatarZoom.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        const valBadge = document.getElementById('avatarZoomVal');
        if (valBadge) valBadge.textContent = `${val.toFixed(1)}x`;
        if (typeof ImageProcessor !== 'undefined') {
          ImageProcessor.config.zoom = val;
          ImageProcessor.process((dataUrl) => {
            this.state.data.avatarUrl = dataUrl;
            this.updateLivePreview();
          });
        }
      });
    }

    // Avatar Border
    const avatarBorderWidth = document.getElementById('avatarBorderWidth');
    if (avatarBorderWidth) {
      avatarBorderWidth.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        this.state.settings.avatarBorderWidth = val;
        const valBadge = document.getElementById('avatarBorderVal');
        if (valBadge) valBadge.textContent = `${val}px`;
        this.updateLivePreview();
      });
    }

    const avatarBorderColor = document.getElementById('avatarBorderColor');
    const avatarBorderColorHex = document.getElementById('avatarBorderColorHex');
    if (avatarBorderColor && avatarBorderColorHex) {
      avatarBorderColor.addEventListener('input', (e) => {
        avatarBorderColorHex.value = e.target.value;
        this.state.settings.avatarBorderColor = e.target.value;
        this.updateLivePreview();
      });
      avatarBorderColorHex.addEventListener('input', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
          avatarBorderColor.value = e.target.value;
          this.state.settings.avatarBorderColor = e.target.value;
          this.updateLivePreview();
        }
      });
    }

    // Filters (Brightness, Contrast, Saturation)
    const bindFilter = (id, prop, badgeId) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          const val = Number(e.target.value);
          const badge = document.getElementById(badgeId);
          if (badge) badge.textContent = `${val}%`;
          if (typeof ImageProcessor !== 'undefined') {
            ImageProcessor.config[prop] = val;
            ImageProcessor.process((dataUrl) => {
              this.state.data.avatarUrl = dataUrl;
              this.updateLivePreview();
            });
          }
        });
      }
    };

    bindFilter('imgBrightness', 'brightness', 'brightnessVal');
    bindFilter('imgContrast', 'contrast', 'contrastVal');
    bindFilter('imgSaturation', 'saturation', 'saturationVal');

    // Layout Architecture Cards
    document.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.state.settings.template = card.dataset.template;
        this.updateLivePreview();
      });
    });

    // Generic Color Pair Binding Helper
    const bindColorPair = (id, setter) => {
      const picker = document.getElementById(id);
      const hex = document.getElementById(id + 'Hex');
      if (picker) {
        picker.addEventListener('input', (e) => {
          if (hex) hex.value = e.target.value;
          setter(e.target.value);
          this.updateLivePreview();
        });
      }
      if (hex) {
        hex.addEventListener('input', (e) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            if (picker) picker.value = e.target.value;
            setter(e.target.value);
            this.updateLivePreview();
          }
        });
      }
    };

    // Accent Color & Quick Swatches
    const accentColor = document.getElementById('accentColor');
    const accentColorHex = document.getElementById('accentColorHex');

    const setAccentColor = (val) => {
      if (accentColor) accentColor.value = val;
      if (accentColorHex) accentColorHex.value = val;
      this.state.settings.accentColor = val;
      this.updateLivePreview();
    };

    if (accentColor) accentColor.addEventListener('input', (e) => setAccentColor(e.target.value));
    if (accentColorHex) {
      accentColorHex.addEventListener('input', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setAccentColor(e.target.value);
      });
    }

    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.dataset.color;
        if (color) setAccentColor(color);
      });
    });

    // Granular Signature Text & Element Colors
    bindColorPair('nameColor', (v) => { this.state.settings.nameColor = v; });
    bindColorPair('titleColor', (v) => { this.state.settings.titleColor = v; });
    bindColorPair('bodyColor', (v) => { this.state.settings.bodyColor = v; });
    bindColorPair('labelColor', (v) => { this.state.settings.labelColor = v; });
    bindColorPair('linkColor', (v) => { this.state.settings.linkColor = v; });
    bindColorPair('dividerColor', (v) => { this.state.settings.dividerColor = v; });
    bindColorPair('quoteColor', (v) => { this.state.settings.quoteColor = v; });
    bindColorPair('disclaimerColor', (v) => { this.state.settings.disclaimerColor = v; });

    // Granular Email Message Text & Theme Colors
    bindColorPair('tplHeaderColor', (v) => { this.state.templateData.headerTextColor = v; });
    bindColorPair('tplHeaderBgColor', (v) => { this.state.templateData.headerBgColor = v; });
    bindColorPair('tplGreetingColor', (v) => { this.state.templateData.greetingColor = v; });
    bindColorPair('tplBodyColor', (v) => { this.state.templateData.bodyColor = v; });
    bindColorPair('tplHighlightTitleColor', (v) => { this.state.templateData.highlightTitleColor = v; });
    bindColorPair('tplHighlightTextColor', (v) => { this.state.templateData.highlightTextColor = v; });
    bindColorPair('tplHighlightBgColor', (v) => { this.state.templateData.highlightBgColor = v; });
    bindColorPair('tplCtaTextColor', (v) => { this.state.templateData.ctaTextColor = v; });
    bindColorPair('tplCtaBgColor', (v) => { this.state.templateData.ctaBgColor = v; });
    bindColorPair('tplClosingColor', (v) => { this.state.templateData.closingColor = v; });
    bindColorPair('tplFooterColor', (v) => { this.state.templateData.footerTextColor = v; });

    // Typography
    const fontFamily = document.getElementById('fontFamily');
    if (fontFamily) {
      fontFamily.addEventListener('change', (e) => {
        this.state.settings.fontFamily = e.target.value;
        this.updateLivePreview();
      });
    }

    const nameFontSize = document.getElementById('nameFontSize');
    if (nameFontSize) {
      nameFontSize.addEventListener('input', (e) => {
        this.state.settings.nameFontSize = Number(e.target.value);
        const valBadge = document.getElementById('nameFontSizeVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        this.updateLivePreview();
      });
    }

    const bodyFontSize = document.getElementById('bodyFontSize');
    if (bodyFontSize) {
      bodyFontSize.addEventListener('input', (e) => {
        this.state.settings.bodyFontSize = parseFloat(e.target.value);
        const valBadge = document.getElementById('bodyFontSizeVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        this.updateLivePreview();
      });
    }

    const dividerThickness = document.getElementById('dividerThickness');
    if (dividerThickness) {
      dividerThickness.addEventListener('input', (e) => {
        this.state.settings.dividerThickness = Number(e.target.value);
        const valBadge = document.getElementById('dividerThicknessVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        this.updateLivePreview();
      });
    }

    const dividerStyle = document.getElementById('dividerStyle');
    if (dividerStyle) {
      dividerStyle.addEventListener('change', (e) => {
        this.state.settings.dividerStyle = e.target.value;
        this.updateLivePreview();
      });
    }

    // Socials
    const iconStyle = document.getElementById('iconStyle');
    if (iconStyle) {
      iconStyle.addEventListener('change', (e) => {
        this.state.settings.iconStyle = e.target.value;
        this.updateLivePreview();
      });
    }

    const iconSize = document.getElementById('iconSize');
    if (iconSize) {
      iconSize.addEventListener('input', (e) => {
        this.state.settings.iconSize = Number(e.target.value);
        const valBadge = document.getElementById('iconSizeVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        this.updateLivePreview();
      });
    }

    const iconSpacing = document.getElementById('iconSpacing');
    if (iconSpacing) {
      iconSpacing.addEventListener('input', (e) => {
        this.state.settings.iconSpacing = Number(e.target.value);
        const valBadge = document.getElementById('iconSpacingVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        this.updateLivePreview();
      });
    }

    const socialsContainer = document.getElementById('socialsListContainer');
    if (socialsContainer) {
      socialsContainer.addEventListener('input', () => this.syncSocialsFromDom());
      socialsContainer.addEventListener('change', () => this.syncSocialsFromDom());
    }

    // Badges & Add-ons
    const showBadge = document.getElementById('showBadge');
    if (showBadge) {
      showBadge.addEventListener('change', (e) => {
        this.state.data.showBadge = e.target.checked;
        const group = document.getElementById('badgeInputGroup');
        if (group) group.style.display = e.target.checked ? 'block' : 'none';
        this.updateLivePreview();
      });
    }
    bindInput('badgeText', 'badgeText');

    const showCta = document.getElementById('showCta');
    if (showCta) {
      showCta.addEventListener('change', (e) => {
        this.state.data.showCta = e.target.checked;
        const group = document.getElementById('ctaInputGroup');
        if (group) group.style.display = e.target.checked ? 'flex' : 'none';
        this.updateLivePreview();
      });
    }
    bindInput('ctaText', 'ctaText');
    bindInput('ctaUrl', 'ctaUrl');

    const showGreenNote = document.getElementById('showGreenNote');
    if (showGreenNote) {
      showGreenNote.addEventListener('change', (e) => {
        this.state.data.showGreenNote = e.target.checked;
        const group = document.getElementById('greenNoteInputGroup');
        if (group) group.style.display = e.target.checked ? 'block' : 'none';
        this.updateLivePreview();
      });
    }
    bindInput('greenNoteText', 'greenNoteText');

    const showQuote = document.getElementById('showQuote');
    if (showQuote) {
      showQuote.addEventListener('change', (e) => {
        this.state.data.showQuote = e.target.checked;
        const group = document.getElementById('quoteInputGroup');
        if (group) group.style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked && (!this.state.data.quoteText || !this.state.data.quoteText.trim())) {
          if (typeof Quotes !== 'undefined') {
            const randomQ = Quotes.getRandomQuote();
            this.state.data.quoteText = randomQ;
            const quoteInput = document.getElementById('quoteText');
            if (quoteInput) quoteInput.value = randomQ;
          }
        }
        this.updateLivePreview();
      });
    }

    const rollQuoteBtn = document.getElementById('rollQuoteBtn');
    if (rollQuoteBtn) {
      rollQuoteBtn.addEventListener('click', () => {
        if (typeof Quotes !== 'undefined') {
          const randomQ = Quotes.getRandomQuote();
          this.state.data.quoteText = randomQ;
          const quoteInput = document.getElementById('quoteText');
          if (quoteInput) quoteInput.value = randomQ;
          this.updateLivePreview();
          this.showToast('🎲 Rolled a new inspirational quote!', 'info');
        }
      });
    }

    bindInput('quoteText', 'quoteText');

    const autoShuffleQuote = document.getElementById('autoShuffleQuote');
    if (autoShuffleQuote) {
      autoShuffleQuote.addEventListener('change', (e) => {
        this.state.data.autoShuffleQuote = e.target.checked;
      });
    }

    const showDisclaimer = document.getElementById('showDisclaimer');
    if (showDisclaimer) {
      showDisclaimer.addEventListener('change', (e) => {
        this.state.data.showDisclaimer = e.target.checked;
        const group = document.getElementById('disclaimerInputGroup');
        if (group) group.style.display = e.target.checked ? 'block' : 'none';
        this.updateLivePreview();
      });
    }
    bindInput('disclaimerText', 'disclaimerText');

    // Email Template Builder Inputs
    const emailBlueprintSelect = document.getElementById('emailBlueprintSelect');
    if (emailBlueprintSelect && typeof Presets !== 'undefined') {
      emailBlueprintSelect.addEventListener('change', (e) => {
        const bp = Presets.emailTemplates.find(t => t.id === e.target.value);
        if (bp) {
          const setV = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
          setV('tplSubject', bp.subject);
          setV('tplGreeting', bp.greeting);
          setV('tplParagraph1', bp.paragraphs[0] || '');
          setV('tplParagraph2', bp.paragraphs[1] || '');
          setV('tplClosing', bp.closing);
          setV('tplCtaText', bp.ctaText);
          setV('tplCtaUrl', bp.ctaUrl);
          this.syncEmailTemplateFromDom();
          this.updateLivePreview();
        }
      });
    }

    const tplInputs = ['tplSubject', 'tplPreheader', 'tplHeaderLogoText', 'tplHeaderTag', 'tplGreeting', 'tplParagraph1', 'tplParagraph2', 'tplClosing', 'tplCtaText', 'tplCtaUrl', 'tplHighlightTitle', 'tplHighlightContent'];
    tplInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          this.syncEmailTemplateFromDom();
          this.updateLivePreview();
        });
      }
    });

    const tplShowHighlight = document.getElementById('tplShowHighlight');
    if (tplShowHighlight) {
      tplShowHighlight.addEventListener('change', (e) => {
        const grp = document.getElementById('tplHighlightInputGroup');
        if (grp) grp.style.display = e.target.checked ? 'flex' : 'none';
        this.syncEmailTemplateFromDom();
        this.updateLivePreview();
      });
    }
  },

  /**
   * Export signature canvas as high-res 3x HD PNG image
   */
  async exportSignatureAsPng() {
    this.showToast('Generating 3x Retina HD PNG...', 'info');

    const isDark = this.inboxTheme === 'dark';
    const isTemplateMode = this.mode === 'template';

    // 1. Generate clean standalone HTML
    let html = '';
    if (isTemplateMode && typeof EmailTemplateEngine !== 'undefined') {
      html = EmailTemplateEngine.generateEmailHtml(
        this.state.templateData,
        this.state.data,
        this.state.settings,
        isDark,
        false
      );
    } else if (typeof SignatureEngine !== 'undefined') {
      html = SignatureEngine.generateHtml(
        this.state.data,
        this.state.settings,
        isDark,
        false
      );
    }

    if (!html) {
      this.showToast('Failed to generate signature HTML for PNG export', 'error');
      return;
    }

    // 2. Create isolated off-screen rendering container to avoid CSS transform/zoom distortion
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = isTemplateMode ? '680px' : '620px';
    tempContainer.style.maxWidth = '680px';
    tempContainer.style.padding = '24px';
    tempContainer.style.boxSizing = 'border-box';
    tempContainer.style.background = isDark ? '#111317' : '#ffffff';
    tempContainer.style.color = isDark ? '#f0f0f0' : '#222222';
    tempContainer.style.display = 'inline-block';
    tempContainer.style.zIndex = '-9999';
    tempContainer.innerHTML = html;

    document.body.appendChild(tempContainer);

    try {
      // Ensure all images (e.g. avatar base64 or logos) are loaded before rasterizing
      const images = Array.from(tempContainer.querySelectorAll('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 400);
        });
      }));

      const fullName = (this.state.data && this.state.data.fullName) ? this.state.data.fullName : 'signature';
      const filename = `mailcraft-${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-3x-hd.png`;

      // 3. Render using html2canvas at scale 3 (3x Retina HD)
      if (typeof html2canvas !== 'undefined') {
        const canvas = await html2canvas(tempContainer, {
          scale: 3,
          backgroundColor: isDark ? '#111317' : '#ffffff',
          useCORS: true,
          allowTaint: true,
          logging: false
        });

        if (canvas.toBlob) {
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 200);
              this.showToast('Downloaded 3x Retina HD PNG!', 'success');
            } else {
              this.downloadCanvasFallback(canvas, filename);
            }
          }, 'image/png', 1.0);
        } else {
          this.downloadCanvasFallback(canvas, filename);
        }
      } else {
        // Secondary fallback
        this.fallbackExportPng(tempContainer, html, isDark, filename);
      }
    } catch (err) {
      console.error('PNG export error:', err);
      const fullName = (this.state.data && this.state.data.fullName) ? this.state.data.fullName : 'signature';
      const filename = `mailcraft-${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-3x-hd.png`;
      this.fallbackExportPng(tempContainer, html, isDark, filename);
    } finally {
      if (tempContainer.parentNode) {
        document.body.removeChild(tempContainer);
      }
    }
  },

  /**
   * Helper to download direct canvas dataURL
   */
  downloadCanvasFallback(canvas, filename) {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 200);
      this.showToast('Downloaded 3x Retina HD PNG!', 'success');
    } catch (e) {
      this.showToast('Failed to export PNG: ' + e.message, 'error');
    }
  },

  /**
   * Secondary SVG foreignObject rasterizer fallback
   */
  fallbackExportPng(tempContainer, html, isDark, filename) {
    try {
      const width = 640;
      const cleanHtml = html
        .replace(/<img([^>]*?)(?<!\/)>/gi, '<img$1 />')
        .replace(/<br(?<!\/)>/gi, '<br />')
        .replace(/<hr(?<!\/)>/gi, '<hr />')
        .replace(/&nbsp;/g, '&#160;')
        .replace(/&bull;/g, '&#8226;')
        .replace(/&mdash;/g, '&#8212;')
        .replace(/&copy;/g, '&#169;')
        .replace(/&rarr;/g, '&#8594;');

      const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="420">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="background:${isDark ? '#111317' : '#ffffff'}; padding:24px; font-family:sans-serif; color:${isDark ? '#f0f0f0' : '#222222'};">
            ${cleanHtml}
          </div>
        </foreignObject>
      </svg>`;

      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * 3;
        canvas.height = 420 * 3;
        const ctx = canvas.getContext('2d');
        ctx.scale(3, 3);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        this.downloadCanvasFallback(canvas, filename);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        this.showToast('Could not render PNG export on this browser.', 'error');
      };

      img.src = url;
    } catch (e) {
      this.showToast('PNG export failed: ' + e.message, 'error');
    }
  },

  /**
   * Toast notification display helper
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `sahinur-toast ${type}`;
    toast.innerHTML = `
      <span class="sahinur-prompt-prefix">$</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  /**
   * Save state to browser localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem('mailcraft_state', JSON.stringify({
        data: this.state.data,
        settings: this.state.settings,
        templateData: this.state.templateData
      }));
    } catch (e) {}
  },

  /**
   * Load state from browser localStorage
   */
  loadFromStorage() {
    try {
      const raw = localStorage.getItem('mailcraft_state');
      const trueDefaultAvatar = (typeof DEFAULT_AVATAR_BASE64 !== 'undefined' && DEFAULT_AVATAR_BASE64) 
        ? DEFAULT_AVATAR_BASE64 
        : 'assets/default-avatar.jpg';

      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.data) {
          this.state.data = Object.assign({}, Presets.defaultData, parsed.data);
          const av = this.state.data.avatarUrl;
          // Cleanly replace any legacy/stale avatar with the authentic high-res photograph
          if (!av || 
              av.length < 50000 || 
              av.includes('/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHI') ||
              av.startsWith('data:image/svg') ||
              av === 'assets/default-avatar.png' ||
              av === 'assets/avatar.png') {
            this.state.data.avatarUrl = trueDefaultAvatar;
          }
        }
        if (parsed.settings) this.state.settings = Object.assign({}, Presets.styles.developerTerminal.settings, parsed.settings);
        if (parsed.templateData) this.state.templateData = Object.assign({}, this.state.templateData, parsed.templateData);
      } else {
        this.state.data.avatarUrl = trueDefaultAvatar;
      }
    } catch (e) {}
  }
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
