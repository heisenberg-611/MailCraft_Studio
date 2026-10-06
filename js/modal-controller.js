/**
 * Modal Controller Subsystem
 * Manages Email Linter, Enterprise Admin Deployer, Direct Desktop Exporters,
 * HTML5 Canvas Banner Designer, Preset Manager Modal, and Team Directory Modals.
 * Zero external dependencies & 100% client-side privacy.
 */

const ModalController = {
  /**
   * Helper: Resolve active App instance with fallback
   */
  _getApp(app) {
    if (app && app.state) return app;
    if (typeof App !== 'undefined' && App.state) return App;
    return app || {};
  },

  /**
   * Helper: Escape HTML
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
   * Bind Email Compatibility & Size Linter modal events
   */
  bindLinterEvents(app) {
    app = this._getApp(app);
    const linterBtn = document.getElementById('linterStatusBtn');
    const modal = document.getElementById('compatibilityModalOverlay');
    const closeBtn1 = document.getElementById('closeCompatibilityModalBtn');
    const closeBtn2 = document.getElementById('closeCompatibilityModalBtn2');
    const copyAuditBtn = document.getElementById('copyAuditSummaryBtn');

    if (linterBtn && modal) {
      linterBtn.addEventListener('click', () => {
        this.populateLinterModal(app);
        modal.classList.add('active');
      });
    }

    const closeModal = () => modal && modal.classList.remove('active');
    if (closeBtn1) closeBtn1.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);

    if (copyAuditBtn) {
      copyAuditBtn.addEventListener('click', () => {
        if (!app.lastLintReport) {
          this.populateLinterModal(app);
        }
        const rep = app.lastLintReport;
        if (!rep) return;
        const text = [
          `=========================================`,
          `MailCraft Email Architecture Audit Report`,
          `=========================================`,
          `HTML Payload Size: ${rep.sizeFormatted} (${rep.sizePercentOfLimit}% of Gmail 102KB limit)`,
          `Overall Score:     ${rep.score}% [${rep.rating}]`,
          `Gmail Safety:      ${rep.isSizeSafe ? 'PASSED (Zero Truncation)' : 'WARNING (May be clipped)'}`,
          `-----------------------------------------`,
          `Detailed Checks:`,
          ...rep.checks.map(c => `[${c.status.toUpperCase()}] ${c.title}\n   ${c.message}`)
        ].join('\n');

        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            if (typeof app.showToast === 'function') {
              app.showToast('Copied linter audit report to clipboard!', 'success');
            }
          });
        }
      });
    }
  },

  /**
   * Populate Linter Modal UI with live audit checks
   */
  populateLinterModal(app) {
    app = this._getApp(app);
    const isDark = app.inboxTheme === 'dark';
    const html = app.mode === 'template'
      ? (typeof EmailTemplateEngine !== 'undefined' ? EmailTemplateEngine.generateEmailHtml(app.state.templateData, app.state.data, app.state.settings, isDark, true) : '')
      : (typeof SignatureEngine !== 'undefined' ? SignatureEngine.generateHtml(app.state.data, app.state.settings, isDark, true) : '');

    if (typeof LinterEngine === 'undefined' || !html) return;
    const report = LinterEngine.audit(html);
    app.lastLintReport = report;

    const gaugeFill = document.getElementById('linterGaugeFill');
    const sizeLabel = document.getElementById('linterSizeLabel');
    const safetyText = document.getElementById('linterSafetyText');
    const checklistContainer = document.getElementById('linterChecklistContainer');

    if (gaugeFill) {
      gaugeFill.style.width = `${report.sizePercentOfLimit}%`;
      gaugeFill.style.backgroundColor = report.isSizeSafe ? (report.sizePercentOfLimit < 40 ? '#00DC82' : '#F59E0B') : '#EF4444';
    }

    if (sizeLabel) {
      sizeLabel.textContent = `${report.sizeFormatted} / 102 KB (${report.sizePercentOfLimit}%)`;
      sizeLabel.style.color = report.isSizeSafe ? '#00DC82' : '#EF4444';
    }

    if (safetyText) {
      safetyText.textContent = report.isSizeSafe
        ? 'Safe from message truncation across Gmail iOS, Android, and Web clients.'
        : 'CRITICAL: Exceeds 102KB. Gmail will clip this signature with "[Message clipped]".';
      safetyText.style.color = report.isSizeSafe ? 'var(--sahinur-text-dim)' : '#EF4444';
    }

    if (checklistContainer) {
      checklistContainer.innerHTML = report.checks.map(chk => {
        const badgeColor = chk.status === 'pass' ? 'var(--sahinur-accent)' : (chk.status === 'warn' ? '#F59E0B' : '#EF4444');
        const badgeBg = chk.status === 'pass' ? 'rgba(0, 220, 130, 0.12)' : (chk.status === 'warn' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)');
        const icon = chk.status === 'pass' ? '✓' : (chk.status === 'warn' ? '⚠' : '✕');

        return `
          <div style="background: var(--sahinur-surface-2); border: 1px solid var(--sahinur-border); border-radius: 6px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: 700; font-size: 12px; color: var(--sahinur-text-bright); display: flex; align-items: center; gap: 6px;">
                <span style="color: ${badgeColor}; font-weight: 900;">${icon}</span>
                <span>${this.escapeHtml(chk.title)}</span>
              </div>
              <span style="font-family: var(--font-mono); font-size: 10px; padding: 2px 6px; border-radius: 3px; background: ${badgeBg}; color: ${badgeColor}; font-weight: 700; text-transform: uppercase;">
                ${this.escapeHtml(chk.status)}
              </span>
            </div>
            <div style="font-size: 11px; color: var(--sahinur-text-dim); line-height: 1.4;">
              ${this.escapeHtml(chk.message)}
            </div>
          </div>
        `;
      }).join('');
    }
  },

  /**
   * Bind Direct Desktop Signature Exporter Modal
   */
  bindDesktopExportEvents(app) {
    app = this._getApp(app);
    const openBtn = document.getElementById('openDesktopExportBtn');
    const modal = document.getElementById('desktopExporterModalOverlay');
    const closeBtn = document.getElementById('closeDesktopExporterModalBtn');
    const dlApple = document.getElementById('downloadAppleMailBtn');
    const dlOutlook = document.getElementById('downloadOutlookHtmBtn');
    const dlThunderbird = document.getElementById('downloadThunderbirdBtn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.add('active'));
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    const getHtml = () => {
      const isDark = app.inboxTheme === 'dark';
      return app.mode === 'template'
        ? (typeof EmailTemplateEngine !== 'undefined' ? EmailTemplateEngine.generateEmailHtml(app.state.templateData, app.state.data, app.state.settings, isDark, true) : '')
        : (typeof SignatureEngine !== 'undefined' ? SignatureEngine.generateHtml(app.state.data, app.state.settings, isDark, true) : '');
    };

    const getBaseName = () => (app.state.data.fullName || 'signature').toLowerCase().replace(/\s+/g, '-');

    if (dlApple && typeof AdminTools !== 'undefined') {
      dlApple.addEventListener('click', () => {
        AdminTools.downloadAppleMailSignature(getHtml(), getBaseName());
        if (typeof app.showToast === 'function') app.showToast('Downloaded Apple Mail .mailsignature!', 'success');
      });
    }

    if (dlOutlook && typeof AdminTools !== 'undefined') {
      dlOutlook.addEventListener('click', () => {
        AdminTools.downloadOutlookHtm(getHtml(), getBaseName());
        if (typeof app.showToast === 'function') app.showToast('Downloaded Outlook .htm signature!', 'success');
      });
    }

    if (dlThunderbird && typeof AdminTools !== 'undefined') {
      dlThunderbird.addEventListener('click', () => {
        AdminTools.downloadThunderbirdHtml(getHtml(), getBaseName());
        if (typeof app.showToast === 'function') app.showToast('Downloaded Thunderbird .html signature!', 'success');
      });
    }
  },

  /**
   * Bind Enterprise Admin Script Deployer Modal
   */
  bindAdminDeployerEvents(app) {
    app = this._getApp(app);
    const openBtn = document.getElementById('openAdminDeployBtn');
    const modal = document.getElementById('adminDeployerModalOverlay');
    const closeBtn = document.getElementById('closeAdminDeployerModalBtn');
    const tabGoogle = document.getElementById('adminTabGoogleBtn');
    const tabM365 = document.getElementById('adminTabM365Btn');
    const emailInput = document.getElementById('adminTargetEmail');
    const copyBtn = document.getElementById('copyAdminScriptBtn');
    const dlBtn = document.getElementById('downloadAdminScriptFileBtn');

    app.adminPlatform = 'google';

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        this.updateAdminScriptViewer(app);
        modal.classList.add('active');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (tabGoogle && tabM365) {
      tabGoogle.addEventListener('click', () => {
        app.adminPlatform = 'google';
        tabGoogle.classList.add('active');
        tabM365.classList.remove('active');
        this.updateAdminScriptViewer(app);
      });

      tabM365.addEventListener('click', () => {
        app.adminPlatform = 'm365';
        tabM365.classList.add('active');
        tabGoogle.classList.remove('active');
        this.updateAdminScriptViewer(app);
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', () => this.updateAdminScriptViewer(app));
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const viewer = document.getElementById('adminScriptViewer');
        if (viewer && typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(viewer.value).then(() => {
            if (typeof app.showToast === 'function') {
              app.showToast(`Copied ${app.adminPlatform === 'google' ? 'Google Apps Script' : 'PowerShell'} code!`, 'success');
            }
          });
        }
      });
    }

    if (dlBtn && typeof AdminTools !== 'undefined') {
      dlBtn.addEventListener('click', () => {
        const isDark = app.inboxTheme === 'dark';
        const html = app.mode === 'template'
          ? (typeof EmailTemplateEngine !== 'undefined' ? EmailTemplateEngine.generateEmailHtml(app.state.templateData, app.state.data, app.state.settings, isDark, true) : '')
          : (typeof SignatureEngine !== 'undefined' ? SignatureEngine.generateHtml(app.state.data, app.state.settings, isDark, true) : '');
        const email = (emailInput && emailInput.value.trim()) || 'user@yourdomain.com';

        if (app.adminPlatform === 'google') {
          AdminTools.downloadGoogleAppsScript(html, email);
          if (typeof app.showToast === 'function') app.showToast('Downloaded Google Apps Script (.gs)!', 'success');
        } else {
          AdminTools.downloadExchangePowerShell(html, email);
          if (typeof app.showToast === 'function') app.showToast('Downloaded Exchange PowerShell (.ps1)!', 'success');
        }
      });
    }

    // Chrome Extension Package ZIP Downloader
    const extZipBtn = document.getElementById('downloadExtensionZipBtn');
    if (extZipBtn && typeof AdminTools !== 'undefined') {
      extZipBtn.addEventListener('click', async () => {
        try {
          await AdminTools.downloadChromeExtensionZip(app.state);
          if (typeof app.showToast === 'function') app.showToast('Downloaded Chrome Extension (.zip) package!', 'success');
        } catch (err) {
          console.error('Failed to export Chrome extension package:', err);
          if (typeof app.showToast === 'function') app.showToast('Failed to generate extension zip package', 'error');
        }
      });
    }
  },

  /**
   * Update script content inside Admin Deployer textarea
   */
  updateAdminScriptViewer(app) {
    app = this._getApp(app);
    const viewer = document.getElementById('adminScriptViewer');
    const emailInput = document.getElementById('adminTargetEmail');
    if (!viewer || typeof AdminTools === 'undefined') return;

    const isDark = app.inboxTheme === 'dark';
    const html = app.mode === 'template'
      ? (typeof EmailTemplateEngine !== 'undefined' ? EmailTemplateEngine.generateEmailHtml(app.state.templateData, app.state.data, app.state.settings, isDark, true) : '')
      : (typeof SignatureEngine !== 'undefined' ? SignatureEngine.generateHtml(app.state.data, app.state.settings, isDark, true) : '');
    const email = (emailInput && emailInput.value.trim()) || 'user@yourdomain.com';

    if (app.adminPlatform === 'google') {
      viewer.value = AdminTools.generateGoogleAppsScript(html, email);
    } else {
      viewer.value = AdminTools.generateExchangePowerShell(html, email);
    }
  },

  /**
   * Bind HTML5 Canvas Promo Banner Designer
   */
  bindBannerDesignerEvents(app) {
    app = this._getApp(app);
    const openBtn = document.getElementById('openBannerDesignerBtn');
    const modal = document.getElementById('bannerDesignerModalOverlay');
    const closeBtn = document.getElementById('closeBannerDesignerModalBtn');
    const presetSelect = document.getElementById('bannerPresetSelect');
    const tagInput = document.getElementById('bannerTagInput');
    const titleInput = document.getElementById('bannerTitleInput');
    const subInput = document.getElementById('bannerSubtitleInput');
    const ctaInput = document.getElementById('bannerCtaInput');
    const gradSelect = document.getElementById('bannerGradientSelect');
    const btnBgInput = document.getElementById('bannerButtonBgColor');
    const btnBgHex = document.getElementById('bannerButtonBgColorHex');
    const btnTxtInput = document.getElementById('bannerButtonTextColor');
    const btnTxtHex = document.getElementById('bannerButtonTextColorHex');
    const applyBtn = document.getElementById('applyBannerToSigBtn');
    const dlBtn = document.getElementById('downloadBannerPngBtn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        this.renderBannerDesignerPreview(app);
        modal.classList.add('active');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (presetSelect && typeof BannerBuilder !== 'undefined') {
      presetSelect.addEventListener('change', (e) => {
        const p = BannerBuilder.presets[e.target.value];
        if (p) {
          if (tagInput) tagInput.value = p.tag;
          if (titleInput) titleInput.value = p.title;
          if (subInput) subInput.value = p.subtitle;
          if (ctaInput) ctaInput.value = p.ctaText;
          if (gradSelect) gradSelect.value = p.gradient;
          if (p.buttonBgColor) {
            if (btnBgInput) btnBgInput.value = p.buttonBgColor;
            if (btnBgHex) btnBgHex.value = p.buttonBgColor;
          }
          if (p.buttonTextColor) {
            if (btnTxtInput) btnTxtInput.value = p.buttonTextColor;
            if (btnTxtHex) btnTxtHex.value = p.buttonTextColor;
          }
          this.renderBannerDesignerPreview(app);
        }
      });
    }

    // 2-Way Color & Hex input sync for button colors
    if (btnBgInput && btnBgHex) {
      btnBgInput.addEventListener('input', (e) => {
        btnBgHex.value = e.target.value;
        this.renderBannerDesignerPreview(app);
      });
      btnBgHex.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          btnBgInput.value = val;
        }
        this.renderBannerDesignerPreview(app);
      });
    }

    if (btnTxtInput && btnTxtHex) {
      btnTxtInput.addEventListener('input', (e) => {
        btnTxtHex.value = e.target.value;
        this.renderBannerDesignerPreview(app);
      });
      btnTxtHex.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          btnTxtInput.value = val;
        }
        this.renderBannerDesignerPreview(app);
      });
    }

    // Quick swatches for button colors
    document.querySelectorAll('[data-btn-color]').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const col = swatch.getAttribute('data-btn-color');
        if (btnBgInput) btnBgInput.value = col;
        if (btnBgHex) btnBgHex.value = col;
        this.renderBannerDesignerPreview(app);
      });
    });

    document.querySelectorAll('[data-btn-txt-color]').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const col = swatch.getAttribute('data-btn-txt-color');
        if (btnTxtInput) btnTxtInput.value = col;
        if (btnTxtHex) btnTxtHex.value = col;
        this.renderBannerDesignerPreview(app);
      });
    });

    const inputs = [tagInput, titleInput, subInput, ctaInput, gradSelect];
    inputs.forEach(el => {
      if (el) {
        el.addEventListener('input', () => this.renderBannerDesignerPreview(app));
        el.addEventListener('change', () => this.renderBannerDesignerPreview(app));
      }
    });

    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const canvas = document.getElementById('bannerCanvas');
        if (canvas) {
          const dataUrl = (typeof BannerBuilder !== 'undefined' && typeof BannerBuilder.compressCanvas === 'function')
            ? BannerBuilder.compressCanvas(canvas)
            : canvas.toDataURL('image/jpeg', 0.86);

          if (!app.state.data.promoBanner) {
            app.state.data.promoBanner = { enabled: true, imageUrl: '', targetUrl: '', alt: '' };
          }
          app.state.data.promoBanner.imageUrl = dataUrl;
          app.state.data.promoBanner.enabled = true;

          const cb = document.getElementById('showPromoBanner');
          if (cb) cb.checked = true;
          const grp = document.getElementById('promoBannerGroup');
          if (grp) grp.style.display = 'flex';

          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
          if (modal) modal.classList.remove('active');
          if (typeof app.showToast === 'function') app.showToast('Inserted lightweight promo banner into signature!', 'success');
        }
      });
    }

    if (dlBtn && typeof BannerBuilder !== 'undefined') {
      dlBtn.addEventListener('click', () => {
        const cfg = this.getBannerCurrentConfig(app);
        BannerBuilder.downloadBannerPng(cfg, 'mailcraft-promo-banner');
        if (typeof app.showToast === 'function') app.showToast('Downloaded banner PNG!', 'success');
      });
    }
  },

  /**
   * Get current banner designer config from inputs
   */
  getBannerCurrentConfig(app) {
    app = this._getApp(app);
    const tagInput = document.getElementById('bannerTagInput');
    const titleInput = document.getElementById('bannerTitleInput');
    const subInput = document.getElementById('bannerSubtitleInput');
    const ctaInput = document.getElementById('bannerCtaInput');
    const gradSelect = document.getElementById('bannerGradientSelect');
    const btnBgHex = document.getElementById('bannerButtonBgColorHex');
    const btnBgInput = document.getElementById('bannerButtonBgColor');
    const btnTxtHex = document.getElementById('bannerButtonTextColorHex');
    const btnTxtInput = document.getElementById('bannerButtonTextColor');

    const buttonBgColor = (btnBgHex && btnBgHex.value) || (btnBgInput && btnBgInput.value) || (app.state && app.state.settings && app.state.settings.accentColor) || '#00DC82';
    const buttonTextColor = (btnTxtHex && btnTxtHex.value) || (btnTxtInput && btnTxtInput.value) || '#090D16';

    return {
      tag: tagInput ? tagInput.value.trim() : 'ANNOUNCEMENT',
      title: titleInput ? titleInput.value.trim() : 'Headline',
      subtitle: subInput ? subInput.value.trim() : 'Subtitle description',
      ctaText: ctaInput ? ctaInput.value.trim() : 'Learn More',
      gradient: gradSelect ? gradSelect.value : 'emerald',
      accentColor: buttonBgColor,
      buttonBgColor: buttonBgColor,
      buttonTextColor: buttonTextColor
    };
  },

  /**
   * Render Banner Designer Canvas
   */
  renderBannerDesignerPreview(app) {
    app = this._getApp(app);
    const canvas = document.getElementById('bannerCanvas');
    if (!canvas || typeof BannerBuilder === 'undefined') return;
    const config = this.getBannerCurrentConfig(app);
    BannerBuilder.renderToCanvas(canvas, config);
  },

  /**
   * Render custom preset cards inside preset manager modal
   */
  renderPresetManagerModalList(app) {
    app = this._getApp(app);
    const container = document.getElementById('customPresetsListModal');
    if (!container || typeof PresetManager === 'undefined') return;

    const presets = PresetManager.getUserPresets();
    if (!presets.length) {
      container.innerHTML = `<div class="form-label-desc" style="padding: 20px; text-align: center;">No custom presets saved yet. Create your unique design and click "Save Preset".</div>`;
      return;
    }

    container.innerHTML = presets.map(p => {
      const dateStr = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '';
      const safeId = this.escapeAttr(p.id);
      const safeName = this.escapeHtml(p.name || 'Custom Preset');
      const safeDesc = this.escapeHtml(p.description || 'Custom template configuration');
      return `
        <div class="custom-preset-card" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--sahinur-surface-2); border: 1px solid var(--sahinur-border); border-radius: 6px;">
          <div>
            <div style="font-weight: 700; font-size: 13px; color: var(--sahinur-text-bright);">${safeName}</div>
            <div style="font-size: 11px; color: var(--sahinur-text-dim); margin-top: 2px;">${safeDesc} ${dateStr ? `&bull; ${dateStr}` : ''}</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn-primary apply-preset-modal-btn" data-preset-id="${safeId}" style="padding: 4px 10px; font-size: 11px;">Apply</button>
            <button class="btn-secondary dup-preset-modal-btn" data-preset-id="${safeId}" style="padding: 4px 8px; font-size: 11px;" title="Duplicate">Copy</button>
            <button class="btn-secondary export-preset-modal-btn" data-preset-id="${safeId}" style="padding: 4px 8px; font-size: 11px;" title="Export JSON">JSON</button>
            <button class="btn-secondary del-preset-modal-btn" data-preset-id="${safeId}" style="padding: 4px 8px; font-size: 11px; color: #EF4444;" title="Delete">&times;</button>
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
          if (typeof app.applyUserPresetObject === 'function') {
            app.applyUserPresetObject(target);
          }
          document.getElementById('presetManagerModalOverlay')?.classList.remove('active');
        }
      });
    });

    container.querySelectorAll('.dup-preset-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        PresetManager.duplicatePreset(btn.dataset.presetId);
        if (typeof app.refreshPresetDropdown === 'function') app.refreshPresetDropdown();
        this.renderPresetManagerModalList(app);
        if (typeof app.showToast === 'function') app.showToast('Preset duplicated!', 'success');
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
        if (typeof app.refreshPresetDropdown === 'function') app.refreshPresetDropdown();
        this.renderPresetManagerModalList(app);
        if (typeof app.showToast === 'function') app.showToast('Preset deleted.', 'info');
      });
    });
  },

  /**
   * Render Team Directory Modal list with instant copy buttons
   */
  renderTeamDirectoryModalList(app, searchQuery = '') {
    app = this._getApp(app);
    const container = document.getElementById('teamDirectoryListModal');
    if (!container || typeof TeamEngine === 'undefined') return;

    let list = TeamEngine.roster || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => {
        const hay = `${m.fullName || ''} ${m.jobTitle || ''} ${m.department || ''} ${m.email || ''} ${m.location || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (!list.length) {
      container.innerHTML = `<div class="form-label-desc" style="padding: 20px; text-align: center;">No matching members found.</div>`;
      return;
    }

    container.innerHTML = list.map(m => {
      const safeId = this.escapeAttr(m.id);
      const safeName = this.escapeHtml(m.fullName || 'Member');
      const safeTitle = this.escapeHtml(m.jobTitle || 'Role');
      const safeDept = this.escapeHtml(m.department || 'Department');
      const safeEmail = this.escapeHtml(m.email || '');
      const safeEmailHref = this.escapeAttr(`mailto:${m.email || ''}`);
      return `
        <div class="team-directory-card" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--sahinur-surface-2); border: 1px solid var(--sahinur-border); border-radius: 6px;">
          <div>
            <div style="font-weight: 700; font-size: 13px; color: var(--sahinur-text-bright);">${safeName}</div>
            <div style="font-size: 11px; color: var(--sahinur-text-dim); margin-top: 2px;">
              ${safeTitle} &bull; ${safeDept} &bull; <a href="${safeEmailHref}" style="color: var(--sahinur-accent);">${safeEmail}</a>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn-primary copy-member-rich-btn" data-member-id="${safeId}" style="padding: 4px 10px; font-size: 11px;">Copy Rich</button>
            <button class="btn-secondary copy-member-html-btn" data-member-id="${safeId}" style="padding: 4px 8px; font-size: 11px;">Copy HTML</button>
          </div>
        </div>
      `;
    }).join('');

    // Wire instant copy buttons for each member
    container.querySelectorAll('.copy-member-rich-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const member = (TeamEngine.roster || []).find(m => m.id === btn.dataset.memberId);
        if (!member) return;
        const memberData = {
          ...app.state.data,
          fullName: member.fullName,
          jobTitle: member.jobTitle,
          department: member.department,
          company: member.company || app.state.data.company,
          email: member.email,
          phone: member.phone || app.state.data.phone,
          website: member.website || app.state.data.website,
          address: member.location || app.state.data.address
        };
        const html = typeof SignatureEngine !== 'undefined'
          ? SignatureEngine.generateHtml(memberData, app.state.settings, false, true)
          : '';
        if (typeof ClipboardHelper !== 'undefined') {
          await ClipboardHelper.copyHtmlDirectly(html);
          if (typeof app.showToast === 'function') app.showToast(`Copied signature for ${member.fullName}!`, 'success');
        }
      });
    });

    container.querySelectorAll('.copy-member-html-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const member = (TeamEngine.roster || []).find(m => m.id === btn.dataset.memberId);
        if (!member) return;
        const memberData = {
          ...app.state.data,
          fullName: member.fullName,
          jobTitle: member.jobTitle,
          department: member.department,
          company: member.company || app.state.data.company,
          email: member.email,
          phone: member.phone || app.state.data.phone,
          website: member.website || app.state.data.website,
          address: member.location || app.state.data.address
        };
        const html = typeof SignatureEngine !== 'undefined'
          ? SignatureEngine.generateHtml(memberData, app.state.settings, false, true)
          : '';
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(html).then(() => {
            if (typeof app.showToast === 'function') app.showToast(`Copied raw HTML for ${member.fullName}!`, 'success');
          });
        }
      });
    });
  }
};

if (typeof window !== 'undefined') {
  window.ModalController = ModalController;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalController;
}
