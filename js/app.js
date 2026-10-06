/**
 * Main Application Coordinator & State Manager
 * MailCraft Studio - Modular Architecture
 * Coordinates UI, Live Rendering, Preset Management, Team Batch Generation, and Exporters.
 * Zero server dependencies & 100% on-device privacy.
 */

// Node.js environment dependency resolution for standalone testing
if (typeof require !== 'undefined') {
  if (typeof PreviewSimulator === 'undefined') try { global.PreviewSimulator = require('./preview-simulator.js'); } catch (e) {}
  if (typeof ModalController === 'undefined') try { global.ModalController = require('./modal-controller.js'); } catch (e) {}
  if (typeof RichTextEditor === 'undefined') try { global.RichTextEditor = require('./rich-text-editor.js'); } catch (e) {}
  if (typeof FormControls === 'undefined') try { global.FormControls = require('./form-controls.js'); } catch (e) {}
}

const App = {
  mode: 'signature', // 'signature' | 'team' | 'template'
  clientView: 'gmail', // 'gmail' | 'apple' | 'outlook' | 'yahoo'
  inboxTheme: 'light', // 'light' | 'dark'
  canvasViewMode: 'compose', // 'compose' | 'inbox'
  preheaderPreviewClient: 'gmail', // 'gmail' | 'apple' | 'ios' | 'outlook'
  zoom: 1.0,

  // App State
  state: {
    data: Object.assign({}, (typeof Presets !== 'undefined' && Presets.defaultData) ? Presets.defaultData : {}),
    settings: Object.assign({}, (typeof Presets !== 'undefined' && Presets.styles && Presets.styles.developerTerminal)
      ? Presets.styles.developerTerminal.settings
      : ((typeof Presets !== 'undefined' && Presets.styles && Presets.styles.dhrubojyoti)
        ? Presets.styles.dhrubojyoti.settings
        : {})),
    templateData: {
      title: 'Project Update',
      preheader: 'Important updates and technical collaboration overview',
      antiLeakPadding: true,
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
      footerNote: '',
      footerTextColor: '#64748B'
    }
  },

  /**
   * Helper: Escape HTML special characters to prevent XSS
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Helper: Escape attribute string
   */
  escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  /**
   * Initialize Application
   */
  init() {
    this.loadFromStorage();
    this.injectUiIcons();
    this.renderSocialInputs();
    this.renderCustomFieldsInputs();
    this.refreshPresetDropdown();
    this.renderTeamRosterList();

    // Check URL parameters for preset or mode override
    if (typeof window !== 'undefined' && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      const requestedPreset = urlParams.get('preset');
      const requestedMode = urlParams.get('mode');

      // Synchronize client window and preview theme classes
      const clientWindow = document.getElementById('clientWindow');
      const previewArea = document.getElementById('previewArea');
      const isDark = this.inboxTheme === 'dark';
      if (clientWindow) {
        clientWindow.classList.remove('light-inbox', 'dark-inbox', 'sahinur-terminal');
        clientWindow.classList.add(isDark ? 'dark-inbox' : 'light-inbox');
      }
      if (previewArea) {
        previewArea.classList.remove('preview-theme-light', 'preview-theme-dark');
        previewArea.classList.add(isDark ? 'preview-theme-dark' : 'preview-theme-light');
      }
      const themeLightBtn = document.getElementById('themeLightBtn');
      const themeDarkBtn = document.getElementById('themeDarkBtn');
      if (themeLightBtn && themeDarkBtn) {
        themeDarkBtn.classList.toggle('active', isDark);
        themeLightBtn.classList.toggle('active', !isDark);
      }

      if (requestedPreset) {
        if (typeof Presets !== 'undefined' && Presets.styles && Presets.styles[requestedPreset]) {
          this.applyPreset(requestedPreset);
        } else if (typeof PresetManager !== 'undefined') {
          const userPresets = PresetManager.getUserPresets();
          const found = userPresets.find(p => p.id === requestedPreset);
          if (found) {
            this.applyUserPresetObject(found);
          }
        }
      } else if (this.savedActivePreset) {
        const presetSelect = document.getElementById('presetSelect');
        if (presetSelect) presetSelect.value = this.savedActivePreset;
      }

      const requestedTemplate = urlParams.get('template') || urlParams.get('layout') || (this.state.settings && this.state.settings.template);
      if (requestedTemplate) {
        this.state.settings.template = requestedTemplate;
        document.querySelectorAll('.template-card').forEach(card => {
          card.classList.toggle('active', card.dataset.template === requestedTemplate);
        });
      }

      // Initialize High-DPI canvas avatar with state settings synchronized
      if (typeof ImageProcessor !== 'undefined') {
        ImageProcessor.config.size = this.state.settings.avatarSize || 85;
        ImageProcessor.config.shape = this.state.settings.avatarShape || 'square';
        ImageProcessor.config.borderWidth = 0;
        ImageProcessor.config.borderColor = this.state.settings.avatarBorderColor || '#00DC82';
        ImageProcessor.config.dpi = this.state.settings.avatarDpi || 2;
        
        const currentAvatar = this.state.data.avatarUrl;
        const isRemote = typeof currentAvatar === 'string' && /^https?:\/\//i.test(currentAvatar.trim());

        ImageProcessor.init((dataUrl) => {
          // Do NOT overwrite user's external HTTPS avatar or custom uploaded photo if already set
          if (!this.state.data.avatarUrl || (!isRemote && !this.state.data.avatarUrl.startsWith('data:'))) {
            this.state.data.avatarUrl = dataUrl;
          }
          this.updateLivePreview();
          this.updateAvatarTelemetry();
        });
      }

      this.bindEvents();
      this.bindStudioFormControls();
      this.bindInlineCanvasEditing();
      this.bindBlockOrganizerEvents();
      this.syncFormWithState();
      this.renderCustomFieldsInputs();
      this.renderClientChrome(this.clientView || 'gmail');

      // Restore Saved Mode or URL override
      const activeMode = requestedMode || this.mode || 'signature';
      if (activeMode === 'team' || activeMode === 'batch') {
        const teamBtn = document.getElementById('modeTeamBtn');
        if (teamBtn) teamBtn.click();
      } else if (activeMode === 'email' || activeMode === 'template') {
        const tplBtn = document.getElementById('modeTemplateBtn');
        if (tplBtn) tplBtn.click();
      } else {
        const sigBtn = document.getElementById('modeSignatureBtn');
        if (sigBtn) sigBtn.click();
      }

      // Restore Saved Active Sidebar Tab
      if (this.savedActiveTab) {
        const savedTabBtn = document.querySelector(`.sidebar-nav-btn[data-tab="${this.savedActiveTab}"]`);
        if (savedTabBtn) savedTabBtn.click();
      }

      // Auto-save session cache on tab reload / close / blur
      if (typeof window.addEventListener === 'function') {
        window.addEventListener('beforeunload', () => this.saveToStorage());
      }
      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) this.saveToStorage();
        });
      }

      // Register Progressive Web App (PWA) Offline Service Worker
      if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('MailCraft PWA Service Worker Registered:', reg.scope))
          .catch((err) => console.warn('PWA Service Worker Registration Failed:', err));
      }
    } else {
      this.bindEvents();
      this.bindStudioFormControls();
      this.syncFormWithState();
    }

    this.updateLivePreview();
  },

  /**
   * Inject SVG vector icons into UI buttons & placeholders
   */
  injectUiIcons() {
    if (typeof Icons === 'undefined' || !Icons.ui) return;
    const setIcon = (id, svg) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = svg;
    };

    setIcon('modeSigIcon', Icons.ui.signature);
    setIcon('modeTeamIcon', Icons.ui.users);
    setIcon('modeTplIcon', Icons.ui.template);
    setIcon('savePresetIcon', Icons.ui.save);
    setIcon('managePresetsIcon', Icons.ui.folder);
    setIcon('desktopIcon', Icons.ui.desktop);
    setIcon('adminIcon', Icons.ui.admin);
    setIcon('guideIcon', Icons.ui.help);
    setIcon('copyPrimaryIcon', Icons.ui.copy);
    setIcon('shieldIcon', Icons.ui.shield);
    setIcon('codeIcon', Icons.ui.code);
    setIcon('downloadIcon', Icons.ui.download);
    setIcon('imageIcon', Icons.ui.image);
    setIcon('copyBtnIcon', Icons.ui.copy);
    setIcon('closeCodeModalBtn', Icons.ui.close);
    setIcon('teamZipIcon', Icons.ui.download);
    setIcon('desktopIcon', Icons.ui.folder || Icons.ui.code);
    setIcon('adminIcon', Icons.ui.shield || Icons.ui.code);
  },

  /**
   * Populate custom presets optgroup in preset selector
   */
  refreshPresetDropdown() {
    const userGroup = document.getElementById('userPresetsGroup');
    if (!userGroup || typeof PresetManager === 'undefined') return;

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
    if (typeof Presets === 'undefined' || !Presets.styles) return;
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

    const availableNetworks = (typeof Icons !== 'undefined' && Icons.social)
      ? Object.keys(Icons.social)
      : [
          'facebook', 'x', 'youtube', 'linkedin', 'instagram',
          'github', 'website', 'whatsapp', 'telegram', 'discord',
          'behance', 'dribbble', 'medium', 'phone', 'email',
          'calendar', 'location', 'orcid', 'googleScholar', 'researchGate', 'calendly'
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
      const meta = (typeof Icons !== 'undefined' && Icons.social && Icons.social[key]) ? Icons.social[key] : { name: key, color: '#00DC82', svg: '' };
      const current = (this.state.data.socials || []).find(s => s.id === key) || { enabled: false, url: '' };
      const defItem = (typeof Presets !== 'undefined' && Presets.defaultData && Presets.defaultData.socials)
        ? (Presets.defaultData.socials.find(s => s.id === key) || { url: '' })
        : { url: '' };
      const safeKey = this.escapeAttr(key);
      const safeUrl = this.escapeAttr(current.url || '');
      const safePlaceholder = this.escapeAttr(defItem.url || meta.name + ' URL');
      const dragSvg = (typeof Icons !== 'undefined' && Icons.ui && Icons.ui.dragHandle) ? Icons.ui.dragHandle : '::';

      return `
        <div class="social-item" data-social-id="${safeKey}" draggable="true">
          <div class="social-drag-handle" title="Drag to reorder position">
            ${dragSvg}
          </div>
          <input type="checkbox" class="social-enable-cb" ${current.enabled ? 'checked' : ''} style="cursor: pointer;">
          <div class="social-item-icon" style="color: ${meta.color};">
            ${meta.svg}
          </div>
          <input type="text" class="social-item-input" value="${safeUrl}" placeholder="${safePlaceholder}">
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
      const safeLabel = this.escapeAttr(f.label || '');
      const safeVal = this.escapeAttr(f.value || '');
      const safeUrl = this.escapeAttr(f.url || '');
      return `
        <div class="custom-field-row" data-index="${index}" style="display: flex; gap: 6px; align-items: center; background: var(--sahinur-surface-2); padding: 8px; border-radius: 4px; border: 1px solid var(--sahinur-border);">
          <input type="text" class="form-input custom-field-label" value="${safeLabel}" placeholder="Label (e.g. Pronouns)" style="width: 32%; font-size: 11.5px; padding: 5px 8px;">
          <input type="text" class="form-input custom-field-val" value="${safeVal}" placeholder="Value (e.g. he/him)" style="flex: 1; font-size: 11.5px; padding: 5px 8px;">
          <input type="text" class="form-input custom-field-url" value="${safeUrl}" placeholder="URL (Optional)" style="width: 25%; font-size: 11.5px; padding: 5px 8px;">
          <button class="btn-secondary remove-custom-field-btn" data-index="${index}" style="padding: 5px 8px; color: #EF4444; border-color: rgba(239, 68, 68, 0.3);" title="Delete field">
            &times;
          </button>
        </div>
      `;
    }).join('');

    // Bind remove buttons
    container.querySelectorAll('.remove-custom-field-btn').forEach(btn => {
      btn.addEventListener('click', () => {
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
    if (!container || typeof TeamEngine === 'undefined') return;

    const roster = TeamEngine.roster || [];
    if (countEl) countEl.textContent = roster.length;

    if (!roster.length) {
      container.innerHTML = `<div class="form-label-desc" style="padding: 10px; text-align: center;">No team members found. Upload a CSV or add a member.</div>`;
      return;
    }

    container.innerHTML = roster.map(m => {
      const isActive = m.id === TeamEngine.activeMemberId;
      const safeId = this.escapeAttr(m.id);
      const safeName = this.escapeHtml(m.fullName || 'New Member');
      const safeTitle = this.escapeHtml(m.jobTitle || 'No Title');
      const safeEmail = this.escapeHtml(m.email || 'No Email');
      return `
        <div class="team-member-item ${isActive ? 'active' : ''}" data-member-id="${safeId}" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: ${isActive ? 'var(--sahinur-surface-2)' : 'transparent'}; border: 1px solid ${isActive ? 'var(--sahinur-accent)' : 'var(--sahinur-border)'}; border-radius: 4px; margin-bottom: 6px; cursor: pointer;">
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <div style="font-weight: 600; font-size: 12px; color: ${isActive ? 'var(--sahinur-accent)' : 'var(--sahinur-text-bright)'};">${safeName}</div>
            <div style="font-size: 10.5px; color: var(--sahinur-text-dim);">${safeTitle} &bull; ${safeEmail}</div>
          </div>
          <div style="display: flex; gap: 4px;">
            <button class="btn-secondary delete-member-btn" data-member-id="${safeId}" style="padding: 2px 6px; font-size: 10px; color: #EF4444;" title="Delete Member">&times;</button>
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
    if (typeof TeamEngine === 'undefined') return;
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
   * Handle CSV file drop or upload
   */
  handleCsvFile(file) {
    if (typeof FileReader === 'undefined' || typeof TeamEngine === 'undefined') return;
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

    let exportHtml = '';
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
        exportHtml = EmailTemplateEngine.generateEmailHtml(
          this.state.templateData,
          this.state.data,
          this.state.settings,
          isDark,
          true
        );
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
        exportHtml = SignatureEngine.generateHtml(
          this.state.data,
          this.state.settings,
          isDark,
          true
        );
      }
    }

    // Update Preheader Sidebar Widget & Simulator Inbox View
    this.updatePreheaderPreview();
    if (this.canvasViewMode === 'inbox') {
      this.renderSimulatorInboxView();
    }

    // Real-Time Email Compatibility & Size Linter Audit
    if (typeof LinterEngine !== 'undefined' && exportHtml) {
      this.lastLintReport = LinterEngine.audit(exportHtml);
      const linterBtn = document.getElementById('linterStatusBtn');
      const linterText = document.getElementById('linterText');
      if (linterBtn && linterText && this.lastLintReport) {
        linterText.textContent = `SIZE: ${this.lastLintReport.sizeFormatted} // ${this.lastLintReport.score}% OK`;
        linterBtn.className = `linter-badge ${this.lastLintReport.badgeClass === 'badge-pass' ? 'linter-pass' : (this.lastLintReport.badgeClass === 'badge-warn' ? 'linter-warn' : 'linter-fail')}`;
      }
    }

    this.scheduleSaveToStorage(250);
  },

  /**
   * Bind event listeners across forms, buttons, tabs, drag & drop, and modals
   */
  bindEvents() {
    this.bindMobileNavigation();

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
        if (typeof Presets !== 'undefined' && Presets.styles && Presets.styles[val]) {
          this.applyPreset(val);
        } else if (typeof PresetManager !== 'undefined') {
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

      if (confirmSavePresetBtn && typeof PresetManager !== 'undefined') {
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
      if (exportAllBtn && typeof PresetManager !== 'undefined') {
        exportAllBtn.addEventListener('click', () => {
          PresetManager.exportAllUserPresets();
          this.showToast('Exported preset backup JSON!', 'success');
        });
      }

      // Import JSON File
      const importInput = document.getElementById('importPresetJsonFileInput');
      if (importInput && typeof PresetManager !== 'undefined') {
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

    // Promo Banner Image (External HTTPS Link & Local File Upload)
    const promoBannerImageUrl = document.getElementById('promoBannerImageUrl');
    if (promoBannerImageUrl) {
      promoBannerImageUrl.addEventListener('input', (e) => {
        if (!this.state.data.promoBanner) this.state.data.promoBanner = { enabled: true };
        this.state.data.promoBanner.imageUrl = e.target.value.trim();
        this.updateLivePreview();
      });
    }

    const promoBannerFileInput = document.getElementById('promoBannerFileInput');
    if (promoBannerFileInput) {
      promoBannerFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && typeof ImageProcessor !== 'undefined') {
          ImageProcessor.processBannerImage(file, { maxWidth: 800, maxHeight: 180 }, (dataUrl) => {
            if (!this.state.data.promoBanner) {
              this.state.data.promoBanner = { enabled: true, imageUrl: '', targetUrl: '', alt: '' };
            }
            this.state.data.promoBanner.imageUrl = dataUrl;
            if (promoBannerImageUrl) promoBannerImageUrl.value = '';
            this.updateLivePreview();
            this.showToast('Uploaded & optimized promo banner for Gmail!', 'success');
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

    const logoUrlInput = document.getElementById('logoUrlInput');
    if (logoUrlInput) {
      logoUrlInput.addEventListener('input', (e) => {
        this.state.data.logoUrl = e.target.value.trim();
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
            if (logoUrlInput) logoUrlInput.value = '';
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
    if (sampleCsvBtn && typeof TeamEngine !== 'undefined') {
      sampleCsvBtn.addEventListener('click', () => {
        TeamEngine.downloadSampleCsv();
        this.showToast('Downloaded sample team CSV template', 'success');
      });
    }

    // Add Single Team Member
    const addTeamMemberBtn = document.getElementById('addTeamMemberBtn');
    if (addTeamMemberBtn && typeof TeamEngine !== 'undefined') {
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
    if (exportTeamZipBtn && typeof TeamEngine !== 'undefined') {
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
          ? (typeof EmailTemplateEngine !== 'undefined' ? EmailTemplateEngine.generateEmailHtml(this.state.templateData, this.state.data, this.state.settings, isDark, true) : '')
          : (typeof SignatureEngine !== 'undefined' ? SignatureEngine.generateHtml(this.state.data, this.state.settings, isDark, true) : '');

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
        ? (typeof EmailTemplateEngine !== 'undefined' ? EmailTemplateEngine.generateEmailHtml(this.state.templateData, this.state.data, this.state.settings, isDark, true) : '')
        : (typeof SignatureEngine !== 'undefined' ? SignatureEngine.generateHtml(this.state.data, this.state.settings, isDark, true) : '');

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
          ? (typeof EmailTemplateEngine !== 'undefined' ? EmailTemplateEngine.generateEmailHtml(this.state.templateData, this.state.data, this.state.settings, isDark, true) : '')
          : (typeof SignatureEngine !== 'undefined' ? SignatureEngine.generateHtml(this.state.data, this.state.settings, isDark, true) : '');

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
    const yahooBtn = document.getElementById('clientYahooBtn');
    const clientBtns = [gmailBtn, appleBtn, outlookBtn, yahooBtn];

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
    if (yahooBtn) yahooBtn.addEventListener('click', () => setClient('yahoo', yahooBtn));

    // Canvas View Mode (Compose View vs Inbox Snippet View)
    const viewComposeBtn = document.getElementById('viewComposeBtn');
    const viewInboxBtn = document.getElementById('viewInboxBtn');
    const simulatorComposeView = document.getElementById('simulatorComposeView');
    const simulatorInboxView = document.getElementById('simulatorInboxView');

    const setCanvasViewMode = (mode) => {
      this.canvasViewMode = mode;
      if (mode === 'compose') {
        if (viewComposeBtn) viewComposeBtn.classList.add('active');
        if (viewInboxBtn) viewInboxBtn.classList.remove('active');
        if (simulatorComposeView) simulatorComposeView.style.display = 'block';
        if (simulatorInboxView) simulatorInboxView.style.display = 'none';
      } else {
        if (viewInboxBtn) viewInboxBtn.classList.add('active');
        if (viewComposeBtn) viewComposeBtn.classList.remove('active');
        if (simulatorComposeView) simulatorComposeView.style.display = 'none';
        if (simulatorInboxView) simulatorInboxView.style.display = 'flex';
        this.renderSimulatorInboxView();
      }
    };

    if (viewComposeBtn) viewComposeBtn.addEventListener('click', () => setCanvasViewMode('compose'));
    if (viewInboxBtn) viewInboxBtn.addEventListener('click', () => setCanvasViewMode('inbox'));

    // Sidebar Preheader Client Switchers
    document.querySelectorAll('.preheader-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.preheader-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.preheaderPreviewClient = btn.dataset.preheaderClient || 'gmail';
        this.updatePreheaderPreview();
      });
    });

    // Preheader Anti-Leak Padding Toggle
    const antiLeakInput = document.getElementById('tplAntiLeakPadding');
    if (antiLeakInput) {
      antiLeakInput.addEventListener('change', () => {
        this.syncEmailTemplateFromDom();
        this.updateLivePreview();
      });
    }

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
      document.getElementById('codeModalOverlay'),
      document.getElementById('compatibilityModalOverlay'),
      document.getElementById('desktopExporterModalOverlay'),
      document.getElementById('adminDeployerModalOverlay'),
      document.getElementById('bannerDesignerModalOverlay')
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

    this.bindLinterEvents();
    this.bindDesktopExportEvents();
    this.bindAdminDeployerEvents();
    this.bindBannerDesignerEvents();
    this.bindAddonControls();
    this.bindCustomFieldChips();
  },

  // ==========================================
  // DELEGATED SUBSYSTEMS (BACKWARD COMPATIBILITY)
  // ==========================================

  // --- Form Controls Subsystem Delegations ---
  syncFormWithState() {
    if (typeof FormControls !== 'undefined' && FormControls.syncFormWithState) {
      return FormControls.syncFormWithState(this);
    }
  },

  syncSocialsFromDom() {
    if (typeof FormControls !== 'undefined' && FormControls.syncSocialsFromDom) {
      return FormControls.syncSocialsFromDom(this);
    }
  },

  syncEmailTemplateFromDom() {
    if (typeof FormControls !== 'undefined' && FormControls.syncEmailTemplateFromDom) {
      return FormControls.syncEmailTemplateFromDom(this);
    }
  },

  updateAvatarTelemetry() {
    if (typeof FormControls !== 'undefined' && FormControls.updateAvatarTelemetry) {
      return FormControls.updateAvatarTelemetry(this);
    }
  },

  bindAddonControls() {
    if (typeof FormControls !== 'undefined' && FormControls.bindAddonControls) {
      return FormControls.bindAddonControls(this);
    }
  },

  bindCustomFieldChips() {
    if (typeof FormControls !== 'undefined' && FormControls.bindCustomFieldChips) {
      return FormControls.bindCustomFieldChips(this);
    }
  },

  bindMobileNavigation() {
    if (typeof FormControls !== 'undefined' && FormControls.bindMobileNavigation) {
      return FormControls.bindMobileNavigation(this);
    }
  },

  bindStudioFormControls() {
    if (typeof FormControls !== 'undefined' && FormControls.bindStudioFormControls) {
      return FormControls.bindStudioFormControls(this);
    }
  },

  bindWebsiteInteractions() {
    return this.bindStudioFormControls();
  },

  // --- Preview & Simulator Subsystem Delegations ---
  updatePreheaderPreview() {
    if (typeof PreviewSimulator !== 'undefined' && PreviewSimulator.updatePreheaderPreview) {
      return PreviewSimulator.updatePreheaderPreview(this);
    }
  },

  renderSimulatorInboxView() {
    if (typeof PreviewSimulator !== 'undefined' && PreviewSimulator.renderSimulatorInboxView) {
      return PreviewSimulator.renderSimulatorInboxView(this);
    }
  },

  renderClientChrome(clientName) {
    if (typeof PreviewSimulator !== 'undefined' && PreviewSimulator.renderClientChrome) {
      return PreviewSimulator.renderClientChrome(clientName, this);
    }
  },

  // --- Modal Controller Subsystem Delegations ---
  bindLinterEvents() {
    if (typeof ModalController !== 'undefined' && ModalController.bindLinterEvents) {
      return ModalController.bindLinterEvents(this);
    }
  },

  populateLinterModal() {
    if (typeof ModalController !== 'undefined' && ModalController.populateLinterModal) {
      return ModalController.populateLinterModal(this);
    }
  },

  bindDesktopExportEvents() {
    if (typeof ModalController !== 'undefined' && ModalController.bindDesktopExportEvents) {
      return ModalController.bindDesktopExportEvents(this);
    }
  },

  bindAdminDeployerEvents() {
    if (typeof ModalController !== 'undefined' && ModalController.bindAdminDeployerEvents) {
      return ModalController.bindAdminDeployerEvents(this);
    }
  },

  updateAdminScriptViewer() {
    if (typeof ModalController !== 'undefined' && ModalController.updateAdminScriptViewer) {
      return ModalController.updateAdminScriptViewer(this);
    }
  },

  bindBannerDesignerEvents() {
    if (typeof ModalController !== 'undefined' && ModalController.bindBannerDesignerEvents) {
      return ModalController.bindBannerDesignerEvents(this);
    }
  },

  getBannerCurrentConfig() {
    if (typeof ModalController !== 'undefined' && ModalController.getBannerCurrentConfig) {
      return ModalController.getBannerCurrentConfig(this);
    }
    return {};
  },

  renderBannerDesignerPreview() {
    if (typeof ModalController !== 'undefined' && ModalController.renderBannerDesignerPreview) {
      return ModalController.renderBannerDesignerPreview(this);
    }
  },

  renderPresetManagerModalList() {
    if (typeof ModalController !== 'undefined' && ModalController.renderPresetManagerModalList) {
      return ModalController.renderPresetManagerModalList(this);
    }
  },

  renderTeamDirectoryModalList(searchQuery = '') {
    if (typeof ModalController !== 'undefined' && ModalController.renderTeamDirectoryModalList) {
      return ModalController.renderTeamDirectoryModalList(this, searchQuery);
    }
  },

  // --- Rich Text & WYSIWYG Subsystem Delegations ---
  bindInlineCanvasEditing() {
    if (typeof RichTextEditor !== 'undefined' && RichTextEditor.bindInlineCanvasEditing) {
      return RichTextEditor.bindInlineCanvasEditing(this);
    }
  },

  bindBlockOrganizerEvents() {
    if (typeof RichTextEditor !== 'undefined' && RichTextEditor.bindBlockOrganizerEvents) {
      return RichTextEditor.bindBlockOrganizerEvents(this);
    }
  },

  initParagraphFormattingToolbars() {
    if (typeof RichTextEditor !== 'undefined' && RichTextEditor.initParagraphFormattingToolbars) {
      return RichTextEditor.initParagraphFormattingToolbars(this);
    }
  },

  applyTextareaFormatting(textarea, action) {
    if (typeof RichTextEditor !== 'undefined' && RichTextEditor.applyTextareaFormatting) {
      return RichTextEditor.applyTextareaFormatting(textarea, action, this);
    }
  },

  // ==========================================
  // RETINA EXPORTERS & UTILITIES
  // ==========================================

  /**
   * Export signature canvas as high-res 3x HD PNG image
   */
  async exportSignatureAsPng() {
    this.showToast('Generating 3x Retina HD PNG...', 'info');

    const isDark = this.inboxTheme === 'dark';
    const isTemplateMode = this.mode === 'template';

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

    // Create isolated off-screen rendering container to avoid CSS transform/zoom distortion
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
      // Ensure all images are loaded before rasterizing
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

      // Render using html2canvas at scale 3 (3x Retina HD)
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
   * Debounced state persistence scheduler to prevent excessive JSON serialization on rapid keypresses
   */
  scheduleSaveToStorage(delay = 250) {
    if (typeof window === 'undefined' || !window.setTimeout) {
      this.saveToStorage();
      return;
    }
    if (this._saveStorageTimer) {
      clearTimeout(this._saveStorageTimer);
    }
    this._saveStorageTimer = setTimeout(() => {
      this.saveToStorage();
      this._saveStorageTimer = null;
    }, delay);
  },

  /**
   * Save complete active state to temporary session cache (sessionStorage) & localStorage
   */
  saveToStorage() {
    try {
      const activeTabBtn = document.querySelector('.sidebar-nav-btn.active');
      const activeTab = activeTabBtn ? activeTabBtn.dataset.tab : (this.savedActiveTab || 'tab-identity');
      const presetSelect = document.getElementById('presetSelect');
      const activePreset = presetSelect ? presetSelect.value : (this.savedActivePreset || '');

      const payload = {
        data: this.state.data,
        settings: this.state.settings,
        templateData: this.state.templateData,
        mode: this.mode || 'signature',
        inboxTheme: this.inboxTheme || 'light',
        clientView: this.clientView || 'gmail',
        canvasViewMode: this.canvasViewMode || 'desktop',
        activeTab: activeTab,
        activePreset: activePreset,
        teamRoster: (typeof TeamEngine !== 'undefined' && Array.isArray(TeamEngine.roster)) ? TeamEngine.roster : [],
        savedAt: Date.now()
      };

      const payloadStr = JSON.stringify(payload);

      // 1. Temporary Session Cache (Primary: survives reloads within current browser tab)
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('mailcraft_session_cache', payloadStr);
        }
      } catch (sessionErr) {
        // Quota fallback: strip large base64 avatar strings so all form inputs, colors, and layout persist
        try {
          const trimmed = Object.assign({}, payload);
          trimmed.data = Object.assign({}, payload.data);
          if (trimmed.data.avatarUrl && trimmed.data.avatarUrl.length > 50000 && !trimmed.data.avatarUrl.startsWith('http')) {
            trimmed.data.avatarUrl = '';
          }
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('mailcraft_session_cache', JSON.stringify(trimmed));
          }
        } catch (e2) {}
      }

      // 2. Persistent LocalStorage (Secondary: survives browser restarts)
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('mailcraft_state', payloadStr);
        }
      } catch (localErr) {
        try {
          const trimmed = Object.assign({}, payload);
          trimmed.data = Object.assign({}, payload.data);
          if (trimmed.data.avatarUrl && trimmed.data.avatarUrl.length > 50000 && !trimmed.data.avatarUrl.startsWith('http')) {
            trimmed.data.avatarUrl = '';
          }
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mailcraft_state', JSON.stringify(trimmed));
          }
        } catch (e2) {}
      }
    } catch (e) {
      console.warn('Session cache save failed:', e);
    }
  },

  /**
   * Load state prioritizing temporary session cache (sessionStorage) then localStorage
   */
  loadFromStorage() {
    try {
      let raw = null;
      // 1. Check active temporary session cache first
      try {
        if (typeof sessionStorage !== 'undefined') {
          raw = sessionStorage.getItem('mailcraft_session_cache');
        }
      } catch (e) {}

      // 2. Fallback to persistent localStorage
      if (!raw) {
        try {
          if (typeof localStorage !== 'undefined') {
            raw = localStorage.getItem('mailcraft_state');
          }
        } catch (e) {}
      }

      const trueDefaultAvatar = (typeof DEFAULT_AVATAR_BASE64 !== 'undefined' && DEFAULT_AVATAR_BASE64) 
        ? DEFAULT_AVATAR_BASE64 
        : 'assets/default-avatar.jpg';

      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.data) {
          this.state.data = Object.assign({}, (typeof Presets !== 'undefined' && Presets.defaultData) ? Presets.defaultData : {}, parsed.data);
          const av = this.state.data.avatarUrl;
          if (!av) {
            this.state.data.avatarUrl = trueDefaultAvatar;
          }
        }
        if (parsed.settings) {
          const fallbackSettings = (typeof Presets !== 'undefined' && Presets.styles && Presets.styles.developerTerminal)
            ? Presets.styles.developerTerminal.settings
            : {};
          this.state.settings = Object.assign({}, fallbackSettings, parsed.settings);
        }
        if (parsed.templateData) {
          this.state.templateData = Object.assign({}, this.state.templateData, parsed.templateData);
          if (this.state.templateData.footerNote === 'Sent from Dhrubojyoti Saha Portfolio Systems | Dhaka, Bangladesh') {
            this.state.templateData.footerNote = '';
          }
        }
        if (parsed.mode) {
          this.mode = parsed.mode;
        }
        if (parsed.inboxTheme) {
          this.inboxTheme = parsed.inboxTheme;
        }
        if (parsed.clientView) {
          this.clientView = parsed.clientView;
        }
        if (parsed.canvasViewMode) {
          this.canvasViewMode = parsed.canvasViewMode;
        }
        if (parsed.activeTab) {
          this.savedActiveTab = parsed.activeTab;
        }
        if (parsed.activePreset) {
          this.savedActivePreset = parsed.activePreset;
        }
        if (parsed.teamRoster && Array.isArray(parsed.teamRoster) && typeof TeamEngine !== 'undefined') {
          TeamEngine.roster = parsed.teamRoster;
        }
      } else {
        if (!this.state.data.avatarUrl) {
          this.state.data.avatarUrl = trueDefaultAvatar;
        }
      }
    } catch (e) {
      console.warn('Session cache load failed:', e);
    }
  }
};

// Initialize Application on DOM Ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
