/**
 * Form Controls & DOM Synchronization Subsystem
 * Handles bidirectional state synchronization, form input bindings,
 * color palette synchronization, add-on toggles, and mobile navigation.
 * Zero external dependencies.
 */

const FormControls = {
  /**
   * Helper: Resolve active App instance with fallback
   */
  _getApp(app) {
    if (app && app.state) return app;
    if (typeof App !== 'undefined' && App.state) return App;
    return app || {};
  },

  /**
   * Synchronize DOM form controls with application state
   */
  syncFormWithState(app) {
    app = this._getApp(app);
    const d = app.state.data;
    const s = app.state.settings;

    const setVal = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
    const setChecked = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };

    setVal('fullName', d.fullName);
    setVal('nameTag', s.nameTag || s.badgeText || '');
    setVal('namePrefix', s.namePrefix || '');
    setVal('nameSuffix', s.nameSuffix || '');
    setVal('jobTitle', d.jobTitle);
    setVal('company', d.company);
    setVal('department', d.department);
    setVal('phone', d.phone);
    setVal('email', d.email);
    setVal('website', d.website);
    setVal('address', d.address);
    setVal('country', d.country);

    // Photo & Logo Settings
    setVal('avatarUrlInput', (d.avatarUrl && /^https?:\/\//i.test(d.avatarUrl)) ? d.avatarUrl : '');
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
    setVal('logoUrlInput', (d.logoUrl && /^https?:\/\//i.test(d.logoUrl)) ? d.logoUrl : '');
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
    syncColorPair('avatarBorderColor', s.avatarBorderColor || s.accentColor || '#00DC82');

    // Synchronize active quick swatch
    const activeColorHex = (s.accentColor || '#00DC82').toLowerCase();
    document.querySelectorAll('.color-swatch[data-color]').forEach(swatch => {
      const swatchColor = (swatch.dataset.color || '').toLowerCase();
      swatch.classList.toggle('active', swatchColor === activeColorHex);
    });

    // Email Template Colors & Content
    const td = app.state.templateData;
    if (td) {
      syncColorPair('tplHeaderColor', td.headerTextColor || '#FFFFFF');
      syncColorPair('tplHeaderBgColor', td.headerBgColor || '#0F172A');
      syncColorPair('tplGreetingColor', td.greetingColor || '#0F172A');
      syncColorPair('tplBodyColor', td.bodyColor || '#334155');
      syncColorPair('tplHighlightTitleColor', td.highlightTitleColor || s.accentColor || '#00DC82');
      syncColorPair('tplHighlightTextColor', td.highlightTextColor || '#334155');
      syncColorPair('tplHighlightBgColor', td.highlightBgColor || '#F8FAFC');
      syncColorPair('tplCtaTextColor', td.ctaTextColor || '#0F172A');
      syncColorPair('tplCtaBgColor', td.ctaBgColor || s.accentColor || '#00DC82');
      syncColorPair('tplClosingColor', td.closingColor || '#64748B');
      syncColorPair('tplFooterColor', td.footerTextColor || '#64748B');
      setVal('tplHeaderTag', td.headerTag || '');

      setVal('tplSubject', td.title || '');
      setVal('tplPreheader', td.preheader || '');
      setChecked('tplAntiLeakPadding', td.antiLeakPadding !== false);
      setVal('tplHeaderLogoText', td.headerLogoText || '');
      setVal('tplGreeting', td.greeting || '');
      if (Array.isArray(td.paragraphs)) {
        setVal('tplParagraph1', td.paragraphs[0] || '');
        setVal('tplParagraph2', td.paragraphs[1] || '');
      }
      setVal('tplClosing', td.closing || '');
      setVal('tplCtaText', td.ctaText || '');
      setVal('tplCtaUrl', td.ctaUrl || '');

      const hl = td.highlightBox || {};
      setChecked('tplShowHighlight', !!hl.enabled);
      const hlGroup = document.getElementById('tplHighlightInputGroup');
      if (hlGroup) hlGroup.style.display = hl.enabled ? 'flex' : 'none';
      setVal('tplHighlightTitle', hl.title || '');
      setVal('tplHighlightContent', hl.content || '');
    }

    // Typography & Line-by-Line Customization
    setVal('fontFamily', s.fontFamily || "'Courier New', Courier, monospace");
    setVal('nameFontSize', s.nameFontSize || 17);
    const nameFontSizeVal = document.getElementById('nameFontSizeVal');
    if (nameFontSizeVal) nameFontSizeVal.textContent = `${s.nameFontSize || 17}px`;

    setVal('nameFontWeight', s.nameFontWeight || '700');
    setVal('nameTransform', s.nameTransform || 'none');

    setVal('titleFontStyle', s.titleFontStyle || 'normal');
    setVal('titleSeparator', s.titleSeparator || 'bullet');
    setVal('titleFontSize', s.titleFontSize || 13);
    const titleFontSizeVal = document.getElementById('titleFontSizeVal');
    if (titleFontSizeVal) titleFontSizeVal.textContent = `${s.titleFontSize || 13}px`;

    setVal('bodyFontSize', s.bodyFontSize || 12.5);
    const bodyFontSizeVal = document.getElementById('bodyFontSizeVal');
    if (bodyFontSizeVal) bodyFontSizeVal.textContent = `${s.bodyFontSize || 12.5}px`;

    setVal('labelScheme', s.labelScheme || 'terminal');
    const customLabelGroup = document.getElementById('customLabelInputsGroup');
    if (customLabelGroup) customLabelGroup.style.display = (s.labelScheme === 'custom') ? 'flex' : 'none';
    setVal('labelPhone', s.labelPhone !== undefined ? s.labelPhone : '$ tel:');
    setVal('labelEmail', s.labelEmail !== undefined ? s.labelEmail : '$ mail:');
    setVal('labelWebsite', s.labelWebsite !== undefined ? s.labelWebsite : '$ web:');
    setVal('labelAddress', s.labelAddress !== undefined ? s.labelAddress : '$ loc:');

    setVal('dividerThickness', s.dividerThickness || 2);
    const dividerThicknessVal = document.getElementById('dividerThicknessVal');
    if (dividerThicknessVal) dividerThicknessVal.textContent = `${s.dividerThickness || 2}px`;
    setVal('dividerStyle', s.dividerStyle || 'solid');

    setVal('dividerSpacing', s.dividerSpacing || 14);
    const dividerSpacingVal = document.getElementById('dividerSpacingVal');
    if (dividerSpacingVal) dividerSpacingVal.textContent = `${s.dividerSpacing || 14}px`;

    // Line Spacing Density Chips
    const activeSpacing = s.lineSpacing || 'normal';
    document.querySelectorAll('#lineSpacingChips .dpi-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.spacing === activeSpacing);
    });

    // Social Icon Scheme
    setVal('iconStyle', s.iconStyle || 'accent');
    setVal('iconSize', s.iconSize || 18);
    const iconSizeVal = document.getElementById('iconSizeVal');
    if (iconSizeVal) iconSizeVal.textContent = `${s.iconSize || 18}px`;

    setVal('iconSpacing', s.iconSpacing || 8);
    const iconSpacingVal = document.getElementById('iconSpacingVal');
    if (iconSpacingVal) iconSpacingVal.textContent = `${s.iconSpacing || 8}px`;

    // Live Status Badge
    const statusObj = d.statusBadge || {};
    setChecked('showStatusBadge', (d.showStatusBadge !== undefined) ? d.showStatusBadge : statusObj.enabled);
    const statusGroup = document.getElementById('statusBadgeGroup');
    if (statusGroup) statusGroup.style.display = ((d.showStatusBadge !== undefined) ? d.showStatusBadge : statusObj.enabled) ? 'flex' : 'none';
    setVal('statusBadgeText', statusObj.text || d.statusText || 'Available for Projects');
    setVal('statusBadgeColor', statusObj.color || '#10B981');
    setVal('statusBadgeColorHex', statusObj.color || '#10B981');

    // Calendar Booking Badge
    const bookingObj = d.bookingBadge || {};
    setChecked('showBookingBadge', (d.showBookingBadge !== undefined) ? d.showBookingBadge : bookingObj.enabled);
    const bookingGroup = document.getElementById('bookingBadgeGroup');
    if (bookingGroup) bookingGroup.style.display = ((d.showBookingBadge !== undefined) ? d.showBookingBadge : bookingObj.enabled) ? 'flex' : 'none';
    setVal('bookingProviderSelect', bookingObj.provider || 'calendly');
    setVal('bookingBadgeText', bookingObj.text || 'Schedule 1:1 Call');
    setVal('bookingBadgeUrl', bookingObj.url || 'https://calendly.com');

    // QR Code & vCard Hub
    const qrObj = d.qrCode || {};
    setChecked('showQrCode', (d.showQrCode !== undefined) ? d.showQrCode : qrObj.enabled);
    const qrGroup = document.getElementById('qrCodeGroup');
    if (qrGroup) qrGroup.style.display = ((d.showQrCode !== undefined) ? d.showQrCode : qrObj.enabled) ? 'flex' : 'none';
    setVal('qrTargetMode', qrObj.targetMode || 'vcard');
    setVal('qrCustomUrl', qrObj.customUrl || '');
    const qrCustomGroup = document.getElementById('qrCustomUrlGroup');
    if (qrCustomGroup) qrCustomGroup.style.display = (qrObj.targetMode === 'custom') ? 'block' : 'none';
    setVal('qrSize', qrObj.size || 64);
    const qrSizeVal = document.getElementById('qrSizeVal');
    if (qrSizeVal) qrSizeVal.textContent = `${qrObj.size || 64}px`;

    // Static Role Badge
    setChecked('showBadge', d.showBadge);
    const badgeInputGroup = document.getElementById('badgeInputGroup');
    if (badgeInputGroup) badgeInputGroup.style.display = d.showBadge ? 'block' : 'none';
    setVal('badgeText', d.badgeText || 'Dev Architect');

    // Generic CTA
    setChecked('showCta', d.showCta);
    const ctaInputGroup = document.getElementById('ctaInputGroup');
    if (ctaInputGroup) ctaInputGroup.style.display = d.showCta ? 'flex' : 'none';
    setVal('ctaText', d.ctaText || 'Explore Portfolio');
    setVal('ctaUrl', d.ctaUrl || 'https://www.dhrubojyoti.dev');

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
    setVal('promoBannerImageUrl', (d.promoBanner && d.promoBanner.imageUrl && /^https?:\/\//i.test(d.promoBanner.imageUrl)) ? d.promoBanner.imageUrl : '');
    setVal('promoTargetUrl', (d.promoBanner && d.promoBanner.targetUrl) || 'https://www.dhrubojyoti.dev');
    setVal('promoAltText', (d.promoBanner && d.promoBanner.alt) || 'Special Announcement');

    // Modular Block Organizer Hierarchy
    const blockListContainer = document.getElementById('blockOrganizerList');
    if (blockListContainer && Array.isArray(s.blockOrder) && s.blockOrder.length > 0) {
      const items = Array.from(blockListContainer.querySelectorAll('.block-item'));
      s.blockOrder.forEach(blockKey => {
        const item = items.find(el => el.dataset.block === blockKey);
        if (item) blockListContainer.appendChild(item);
      });
    }
  },

  /**
   * Sync social media inputs from DOM to state
   */
  syncSocialsFromDom(app) {
    app = this._getApp(app);
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

    app.state.data.socials = socials;
    if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
  },

  /**
   * Sync email template values from DOM
   */
  syncEmailTemplateFromDom(app) {
    app = this._getApp(app);
    const getVal = (id, def = '') => { const el = document.getElementById(id); return el ? el.value : def; };
    const getChecked = id => { const el = document.getElementById(id); return el ? el.checked : false; };

    app.state.templateData.title = getVal('tplSubject', 'Project Update');
    app.state.templateData.preheader = getVal('tplPreheader', 'Important updates and technical roadmap');
    app.state.templateData.antiLeakPadding = getChecked('tplAntiLeakPadding');
    app.state.templateData.headerLogoText = getVal('tplHeaderLogoText', 'DHRUBOJYOTI SAHA \u2022 PORTFOLIO');
    app.state.templateData.headerTag = getVal('tplHeaderTag', '');
    app.state.templateData.greeting = getVal('tplGreeting', 'Dear Colleague,');
    app.state.templateData.paragraphs = [
      getVal('tplParagraph1', ''),
      getVal('tplParagraph2', '')
    ].filter(Boolean);
    app.state.templateData.closing = getVal('tplClosing', 'Best regards,');
    app.state.templateData.ctaText = getVal('tplCtaText', 'Explore Project Showcase');
    app.state.templateData.ctaUrl = getVal('tplCtaUrl', 'https://www.dhrubojyoti.dev');
    app.state.templateData.showCta = true;

    // Email Granular Colors
    app.state.templateData.headerTextColor = getVal('tplHeaderColor', '#FFFFFF');
    app.state.templateData.headerBgColor = getVal('tplHeaderBgColor', '#0F172A');
    app.state.templateData.greetingColor = getVal('tplGreetingColor', '#0F172A');
    app.state.templateData.bodyColor = getVal('tplBodyColor', '#334155');
    app.state.templateData.highlightTitleColor = getVal('tplHighlightTitleColor', '#00DC82');
    app.state.templateData.highlightTextColor = getVal('tplHighlightTextColor', '#334155');
    app.state.templateData.highlightBgColor = getVal('tplHighlightBgColor', '#F8FAFC');
    app.state.templateData.ctaTextColor = getVal('tplCtaTextColor', '#0F172A');
    app.state.templateData.ctaBgColor = getVal('tplCtaBgColor', '#00DC82');
    app.state.templateData.closingColor = getVal('tplClosingColor', '#64748B');
    app.state.templateData.footerTextColor = getVal('tplFooterColor', '#64748B');

    app.state.templateData.highlightBox = {
      enabled: getChecked('tplShowHighlight'),
      title: getVal('tplHighlightTitle', 'Key Highlights'),
      content: getVal('tplHighlightContent', '')
    };

    const subjectDisplay = document.getElementById('previewSubjectLine');
    if (subjectDisplay) {
      const title = app.state.templateData.title || 'Introduction & Project Update';
      if (subjectDisplay.tagName === 'INPUT') {
        subjectDisplay.value = title;
      } else {
        subjectDisplay.textContent = title;
      }
    }

    if (typeof app.updatePreheaderPreview === 'function') {
      app.updatePreheaderPreview();
    } else if (typeof PreviewSimulator !== 'undefined' && typeof PreviewSimulator.updatePreheaderPreview === 'function') {
      PreviewSimulator.updatePreheaderPreview(app);
    }
  },

  /**
   * Update real-time DPI resolution & compressed payload telemetry pill
   */
  updateAvatarTelemetry(app) {
    app = this._getApp(app);
    const pixelEl = document.getElementById('avatarPixelDim');
    const sizeEl = document.getElementById('avatarPayloadSize');
    if (app.state && app.state.data && app.state.data.avatarUrl && /^https?:\/\//i.test(app.state.data.avatarUrl)) {
      if (pixelEl) pixelEl.textContent = 'Remote HTTPS Asset';
      if (sizeEl) {
        sizeEl.textContent = '0 KB Base64 (Mobile Gmail Safe)';
        sizeEl.style.color = 'var(--sahinur-accent)';
      }
      return;
    }
    if (typeof ImageProcessor === 'undefined' || !ImageProcessor.getPayloadStats) return;
    const stats = ImageProcessor.getPayloadStats();
    if (pixelEl) pixelEl.textContent = `${stats.pixels} (${stats.dpi}x DPI)`;
    if (sizeEl) {
      sizeEl.textContent = `~${stats.kb} KB (${stats.isOptimized ? '100% Crisp · Safe' : 'Uncompressed'})`;
      sizeEl.style.color = stats.isOptimized ? 'var(--sahinur-accent)' : '#F59E0B';
    }
  },

  /**
   * Bind Add-ons (QR / vCard, Status Badge, Booking Badge)
   */
  bindAddonControls(app) {
    app = this._getApp(app);

    // 1. Live Status Badge
    const showStatus = document.getElementById('showStatusBadge');
    if (showStatus) {
      showStatus.addEventListener('change', (e) => {
        if (!app.state.data.statusBadge) app.state.data.statusBadge = {};
        app.state.data.statusBadge.enabled = e.target.checked;
        app.state.data.showStatusBadge = e.target.checked;
        const txtEl = document.getElementById('statusBadgeText');
        if (txtEl && (!app.state.data.statusBadge.text || !app.state.data.statusBadge.text.trim())) {
          app.state.data.statusBadge.text = txtEl.value || 'Available for Projects';
        }
        const colorEl = document.getElementById('statusBadgeColor');
        if (colorEl && !app.state.data.statusBadge.color) {
          app.state.data.statusBadge.color = colorEl.value || '#10B981';
        }
        const grp = document.getElementById('statusBadgeGroup');
        if (grp) grp.style.display = e.target.checked ? 'flex' : 'none';
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const statusPresetSelect = document.getElementById('statusPresetSelect');
    if (statusPresetSelect) {
      statusPresetSelect.addEventListener('change', (e) => {
        if (e.target.value !== 'custom') {
          if (!app.state.data.statusBadge) app.state.data.statusBadge = {};
          app.state.data.statusBadge.text = e.target.value;
          const txt = document.getElementById('statusBadgeText');
          if (txt) txt.value = e.target.value;
          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
        }
      });
    }

    const statusText = document.getElementById('statusBadgeText');
    if (statusText) {
      statusText.addEventListener('input', (e) => {
        if (!app.state.data.statusBadge) app.state.data.statusBadge = {};
        app.state.data.statusBadge.text = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const statusColor = document.getElementById('statusBadgeColor');
    const statusColorHex = document.getElementById('statusBadgeColorHex');
    if (statusColor && statusColorHex) {
      statusColor.addEventListener('input', (e) => {
        statusColorHex.value = e.target.value;
        if (!app.state.data.statusBadge) app.state.data.statusBadge = {};
        app.state.data.statusBadge.color = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
      statusColorHex.addEventListener('input', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
          statusColor.value = e.target.value;
          if (!app.state.data.statusBadge) app.state.data.statusBadge = {};
          app.state.data.statusBadge.color = e.target.value;
          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
        }
      });
    }

    // 2. Calendar Booking Badge
    const showBooking = document.getElementById('showBookingBadge');
    if (showBooking) {
      showBooking.addEventListener('change', (e) => {
        if (!app.state.data.bookingBadge) app.state.data.bookingBadge = {};
        app.state.data.bookingBadge.enabled = e.target.checked;
        app.state.data.showBookingBadge = e.target.checked;
        const txtEl = document.getElementById('bookingBadgeText');
        if (txtEl && (!app.state.data.bookingBadge.text || !app.state.data.bookingBadge.text.trim())) {
          app.state.data.bookingBadge.text = txtEl.value || 'Schedule 1:1 Call';
        }
        const urlEl = document.getElementById('bookingBadgeUrl');
        if (urlEl && (!app.state.data.bookingBadge.url || !app.state.data.bookingBadge.url.trim())) {
          app.state.data.bookingBadge.url = urlEl.value || 'https://calendly.com';
        }
        const provEl = document.getElementById('bookingProviderSelect');
        if (provEl && !app.state.data.bookingBadge.provider) {
          app.state.data.bookingBadge.provider = provEl.value || 'calendly';
        }
        const grp = document.getElementById('bookingBadgeGroup');
        if (grp) grp.style.display = e.target.checked ? 'flex' : 'none';
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const bookingProvider = document.getElementById('bookingProviderSelect');
    if (bookingProvider) {
      bookingProvider.addEventListener('change', (e) => {
        if (!app.state.data.bookingBadge) app.state.data.bookingBadge = {};
        app.state.data.bookingBadge.provider = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const bookingText = document.getElementById('bookingBadgeText');
    if (bookingText) {
      bookingText.addEventListener('input', (e) => {
        if (!app.state.data.bookingBadge) app.state.data.bookingBadge = {};
        app.state.data.bookingBadge.text = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const bookingUrl = document.getElementById('bookingBadgeUrl');
    if (bookingUrl) {
      bookingUrl.addEventListener('input', (e) => {
        if (!app.state.data.bookingBadge) app.state.data.bookingBadge = {};
        app.state.data.bookingBadge.url = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    // 3. QR Code & vCard Hub
    const showQr = document.getElementById('showQrCode');
    if (showQr) {
      showQr.addEventListener('change', (e) => {
        if (!app.state.data.qrCode) app.state.data.qrCode = {};
        app.state.data.qrCode.enabled = e.target.checked;
        app.state.data.showQrCode = e.target.checked;
        if (!app.state.data.qrCode.size) app.state.data.qrCode.size = 64;
        if (!app.state.data.qrCode.targetMode) app.state.data.qrCode.targetMode = 'vcard';
        const grp = document.getElementById('qrCodeGroup');
        if (grp) grp.style.display = e.target.checked ? 'flex' : 'none';
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const qrMode = document.getElementById('qrTargetMode');
    if (qrMode) {
      qrMode.addEventListener('change', (e) => {
        if (!app.state.data.qrCode) app.state.data.qrCode = {};
        app.state.data.qrCode.targetMode = e.target.value;
        const customGrp = document.getElementById('qrCustomUrlGroup');
        if (customGrp) customGrp.style.display = (e.target.value === 'custom') ? 'block' : 'none';
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const qrCustomUrl = document.getElementById('qrCustomUrl');
    if (qrCustomUrl) {
      qrCustomUrl.addEventListener('input', (e) => {
        if (!app.state.data.qrCode) app.state.data.qrCode = {};
        app.state.data.qrCode.customUrl = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const qrSize = document.getElementById('qrSize');
    if (qrSize) {
      qrSize.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (!app.state.data.qrCode) app.state.data.qrCode = {};
        app.state.data.qrCode.size = val;
        const valBadge = document.getElementById('qrSizeVal');
        if (valBadge) valBadge.textContent = `${val}px`;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const dlVcfBtn = document.getElementById('downloadVcfBtn');
    if (dlVcfBtn && typeof VCardEngine !== 'undefined') {
      dlVcfBtn.addEventListener('click', () => {
        VCardEngine.downloadVCard(app.state.data);
        if (typeof app.showToast === 'function') app.showToast('Downloaded RFC 2426 .vcf contact card!', 'success');
      });
    }

    const dlQrBtn = document.getElementById('downloadQrPngBtn');
    if (dlQrBtn && typeof QrEngine !== 'undefined') {
      dlQrBtn.addEventListener('click', () => {
        const qrObj = app.state.data.qrCode || {};
        let payload = '';
        if (qrObj.targetMode === 'website') {
          payload = app.state.data.website || 'https://www.dhrubojyoti.dev';
        } else if (qrObj.targetMode === 'custom') {
          payload = qrObj.customUrl || app.state.data.website || 'https://www.dhrubojyoti.dev';
        } else {
          payload = typeof VCardEngine !== 'undefined' ? VCardEngine.generateVCardString(app.state.data) : (app.state.data.website || '');
        }

        const dataUrl = QrEngine.generatePngDataUrl(payload, { scale: 8, margin: 2 });
        if (dataUrl) {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `mailcraft-qr-${(app.state.data.fullName || 'contact').toLowerCase().replace(/\s+/g, '-')}.png`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => document.body.removeChild(a), 200);
          if (typeof app.showToast === 'function') app.showToast('Downloaded high-resolution QR PNG!', 'success');
        }
      });
    }
  },

  /**
   * Bind Custom Field Preset Tag Chips in Identity and Custom tabs
   */
  bindCustomFieldChips(app) {
    app = this._getApp(app);
    document.querySelectorAll('.custom-field-preset-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const label = tag.dataset.label;
        const val = tag.dataset.val;
        if (!Array.isArray(app.state.data.customFields)) {
          app.state.data.customFields = [];
        }

        app.state.data.customFields.push({
          label: label || 'Field',
          value: val || '',
          url: ''
        });

        if (typeof app.renderCustomFieldsInputs === 'function') app.renderCustomFieldsInputs();
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
        if (typeof app.showToast === 'function') app.showToast(`Added custom field "${label}"!`, 'success');
      });
    });
  },

  /**
   * Bind mobile bottom bar view switcher
   */
  bindMobileNavigation() {
    const workspace = document.querySelector('.studio-workspace-container');
    const formBtn = document.getElementById('mobileFormTabBtn');
    const previewBtn = document.getElementById('mobilePreviewTabBtn');

    if (formBtn && previewBtn && workspace) {
      formBtn.addEventListener('click', () => {
        workspace.classList.remove('mobile-show-preview');
        formBtn.classList.add('active');
        previewBtn.classList.remove('active');
      });

      previewBtn.addEventListener('click', () => {
        workspace.classList.add('mobile-show-preview');
        previewBtn.classList.add('active');
        formBtn.classList.remove('active');
      });
    }
  },

  /**
   * Bind all studio form input events for real-time live preview updates
   */
  bindStudioFormControls(app) {
    app = this._getApp(app);

    const bindInput = (id, prop, target = 'data') => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          app.state[target][prop] = e.target.value;
          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
        });
      }
    };

    const bindSettingInput = (id, prop, isNum = false) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          app.state.settings[prop] = isNum ? Number(e.target.value) : e.target.value;
          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
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

    // Granular Line-by-Line Identity Settings
    bindSettingInput('namePrefix', 'namePrefix');
    bindSettingInput('nameSuffix', 'nameSuffix');
    bindSettingInput('nameTag', 'nameTag');
    bindSettingInput('labelPhone', 'labelPhone');
    bindSettingInput('labelEmail', 'labelEmail');
    bindSettingInput('labelWebsite', 'labelWebsite');
    bindSettingInput('labelAddress', 'labelAddress');

    // Headshot (External HTTPS Link & Local Upload)
    const avatarUrlInput = document.getElementById('avatarUrlInput');
    if (avatarUrlInput) {
      avatarUrlInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
          app.state.data.avatarUrl = val;
        } else {
          app.state.data.avatarUrl = (typeof ImageProcessor !== 'undefined' && ImageProcessor.processedDataUrl)
            ? ImageProcessor.processedDataUrl
            : '';
        }
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
        this.updateAvatarTelemetry(app);
      });
    }

    const avatarInput = document.getElementById('avatarFileInput');
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && typeof ImageProcessor !== 'undefined') {
          ImageProcessor.loadImageFile(file, (dataUrl) => {
            app.state.data.avatarUrl = dataUrl;
            if (avatarUrlInput) avatarUrlInput.value = '';
            if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
            this.updateAvatarTelemetry(app);
            if (typeof app.showToast === 'function') app.showToast('Uploaded and optimized headshot with High-DPI!', 'success');
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
            app.state.data.avatarUrl = dataUrl;
            if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
            this.updateAvatarTelemetry(app);
          });
        }
        const label = document.getElementById('dpiLabel');
        if (label) label.textContent = `[${dpi}x RETINA]`;
        const hdBadge = document.getElementById('hdBadge');
        if (hdBadge) hdBadge.textContent = `ONLINE // RETINA ${dpi}X`;
      });
    });

    // Smart DPI Compression Engine Selector
    const avatarCompSelect = document.getElementById('avatarCompressionSelect');
    if (avatarCompSelect) {
      avatarCompSelect.addEventListener('change', (e) => {
        if (typeof ImageProcessor !== 'undefined') {
          ImageProcessor.config.compressionMode = e.target.value;
          ImageProcessor.process((dataUrl) => {
            app.state.data.avatarUrl = dataUrl;
            if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
            this.updateAvatarTelemetry(app);
          });
        }
      });
    }

    // Avatar Shapes
    document.querySelectorAll('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const shape = btn.dataset.shape;
        app.state.settings.avatarShape = shape;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    });

    // Avatar Size
    const avatarSize = document.getElementById('avatarSize');
    if (avatarSize) {
      avatarSize.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        app.state.settings.avatarSize = val;
        const valBadge = document.getElementById('avatarSizeVal');
        if (valBadge) valBadge.textContent = `${val}px`;
        if (typeof ImageProcessor !== 'undefined') {
          ImageProcessor.config.size = val;
          ImageProcessor.process((dataUrl) => {
            app.state.data.avatarUrl = dataUrl;
            if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
            this.updateAvatarTelemetry(app);
          });
        } else {
          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
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
            app.state.data.avatarUrl = dataUrl;
            if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
            this.updateAvatarTelemetry(app);
          });
        }
      });
    }

    // Avatar Border
    const avatarBorderWidth = document.getElementById('avatarBorderWidth');
    if (avatarBorderWidth) {
      avatarBorderWidth.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        app.state.settings.avatarBorderWidth = val;
        const valBadge = document.getElementById('avatarBorderVal');
        if (valBadge) valBadge.textContent = `${val}px`;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
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
              app.state.data.avatarUrl = dataUrl;
              if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
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
        app.state.settings.template = card.dataset.template;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
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
          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
        });
      }
      if (hex) {
        hex.addEventListener('input', (e) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            if (picker) picker.value = e.target.value;
            setter(e.target.value);
            if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
          }
        });
      }
    };

    // Helper: Synchronize Color Picker and Hex Input Pair
    const syncColorInput = (id, val) => {
      const p = document.getElementById(id);
      const h = document.getElementById(id + 'Hex');
      if (p && val) p.value = val;
      if (h && val) h.value = val;
    };

    // Master Accent Color & Quick Swatches Controller
    const accentColor = document.getElementById('accentColor');
    const accentColorHex = document.getElementById('accentColorHex');

    const setAccentColor = (val, cascade = true) => {
      if (!val) return;

      // 1. Update master accent in settings and DOM
      app.state.settings.accentColor = val;
      if (accentColor) accentColor.value = val;
      if (accentColorHex) accentColorHex.value = val;

      if (cascade) {
        // 2. Cascade master accent to design system elements
        app.state.settings.dividerColor = val;
        app.state.settings.titleColor = val;
        app.state.settings.labelColor = val;
        app.state.settings.linkColor = val;
        app.state.settings.avatarBorderColor = val;

        // Cascade to Email Template highlights & CTA
        if (app.state.templateData) {
          app.state.templateData.highlightTitleColor = val;
          app.state.templateData.ctaBgColor = val;
        }

        // 3. Synchronize all UI inputs in the DOM
        syncColorInput('dividerColor', val);
        syncColorInput('titleColor', val);
        syncColorInput('labelColor', val);
        syncColorInput('linkColor', val);
        syncColorInput('avatarBorderColor', val);
        syncColorInput('tplHighlightTitleColor', val);
        syncColorInput('tplCtaBgColor', val);

        // 4. Update ImageProcessor border color if active
        if (typeof ImageProcessor !== 'undefined') {
          ImageProcessor.config.borderColor = val;
          if (ImageProcessor.rawSourceImage) {
            ImageProcessor.process((dataUrl) => {
              app.state.data.avatarUrl = dataUrl;
              if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
            });
          }
        }
      }

      // 5. Update active swatch indicator in the palette
      const valLower = val.toLowerCase();
      document.querySelectorAll('.color-swatch[data-color]').forEach(swatch => {
        const swatchColor = (swatch.dataset.color || '').toLowerCase();
        swatch.classList.toggle('active', swatchColor === valLower);
      });

      // 6. Refresh live previews
      if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
    };

    app.setAccentColor = setAccentColor;

    if (accentColor) {
      accentColor.addEventListener('input', (e) => setAccentColor(e.target.value, true));
    }
    if (accentColorHex) {
      accentColorHex.addEventListener('input', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
          setAccentColor(e.target.value, true);
        }
      });
    }

    document.querySelectorAll('.color-swatch[data-color]').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const color = swatch.dataset.color;
        if (color) setAccentColor(color, true);
      });
    });

    // "Sync All to Accent" button in Section 02
    const btnSyncAllAccent = document.getElementById('btnSyncAllAccent');
    if (btnSyncAllAccent) {
      btnSyncAllAccent.addEventListener('click', () => {
        const currentAccent = app.state.settings.accentColor || '#00DC82';
        setAccentColor(currentAccent, true);
        if (typeof app.showToast === 'function') {
          app.showToast('Synchronized all accent elements with Master Accent', 'success');
        }
      });
    }

    // Per-field "Match Accent" buttons
    document.querySelectorAll('.btn-match-accent').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetField = btn.dataset.syncTarget;
        const currentAccent = app.state.settings.accentColor || '#00DC82';
        if (targetField && app.state.settings) {
          app.state.settings[targetField] = currentAccent;
          syncColorInput(targetField, currentAccent);
          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
          if (typeof app.showToast === 'function') {
            app.showToast(`Matched ${targetField} with Master Accent`, 'info');
          }
        }
      });
    });

    // Granular Signature Text & Element Colors (Manual Overrides)
    bindColorPair('nameColor', (v) => { app.state.settings.nameColor = v; });
    bindColorPair('titleColor', (v) => { app.state.settings.titleColor = v; });
    bindColorPair('bodyColor', (v) => { app.state.settings.bodyColor = v; });
    bindColorPair('labelColor', (v) => { app.state.settings.labelColor = v; });
    bindColorPair('linkColor', (v) => { app.state.settings.linkColor = v; });
    bindColorPair('dividerColor', (v) => { app.state.settings.dividerColor = v; });
    bindColorPair('quoteColor', (v) => { app.state.settings.quoteColor = v; });
    bindColorPair('disclaimerColor', (v) => { app.state.settings.disclaimerColor = v; });
    bindColorPair('avatarBorderColor', (v) => {
      app.state.settings.avatarBorderColor = v;
      if (typeof ImageProcessor !== 'undefined') {
        ImageProcessor.config.borderColor = v;
        if (ImageProcessor.rawSourceImage) {
          ImageProcessor.process((dataUrl) => {
            app.state.data.avatarUrl = dataUrl;
            if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
          });
        }
      }
    });

    // Granular Email Message Text & Theme Colors
    bindColorPair('tplHeaderColor', (v) => { app.state.templateData.headerTextColor = v; });
    bindColorPair('tplHeaderBgColor', (v) => { app.state.templateData.headerBgColor = v; });
    bindColorPair('tplGreetingColor', (v) => { app.state.templateData.greetingColor = v; });
    bindColorPair('tplBodyColor', (v) => { app.state.templateData.bodyColor = v; });
    bindColorPair('tplHighlightTitleColor', (v) => { app.state.templateData.highlightTitleColor = v; });
    bindColorPair('tplHighlightTextColor', (v) => { app.state.templateData.highlightTextColor = v; });
    bindColorPair('tplHighlightBgColor', (v) => { app.state.templateData.highlightBgColor = v; });
    bindColorPair('tplCtaTextColor', (v) => { app.state.templateData.ctaTextColor = v; });
    bindColorPair('tplCtaBgColor', (v) => { app.state.templateData.ctaBgColor = v; });
    bindColorPair('tplClosingColor', (v) => { app.state.templateData.closingColor = v; });
    bindColorPair('tplFooterColor', (v) => { app.state.templateData.footerTextColor = v; });

    // Typography & Line-by-Line Granular Customization
    const fontFamily = document.getElementById('fontFamily');
    if (fontFamily) {
      fontFamily.addEventListener('change', (e) => {
        app.state.settings.fontFamily = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const nameFontSize = document.getElementById('nameFontSize');
    if (nameFontSize) {
      nameFontSize.addEventListener('input', (e) => {
        app.state.settings.nameFontSize = Number(e.target.value);
        const valBadge = document.getElementById('nameFontSizeVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const nameFontWeight = document.getElementById('nameFontWeight');
    if (nameFontWeight) {
      nameFontWeight.addEventListener('change', (e) => {
        app.state.settings.nameFontWeight = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const nameTransform = document.getElementById('nameTransform');
    if (nameTransform) {
      nameTransform.addEventListener('change', (e) => {
        app.state.settings.nameTransform = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const titleFontStyle = document.getElementById('titleFontStyle');
    if (titleFontStyle) {
      titleFontStyle.addEventListener('change', (e) => {
        app.state.settings.titleFontStyle = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const titleSeparator = document.getElementById('titleSeparator');
    if (titleSeparator) {
      titleSeparator.addEventListener('change', (e) => {
        app.state.settings.titleSeparator = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const titleFontSize = document.getElementById('titleFontSize');
    if (titleFontSize) {
      titleFontSize.addEventListener('input', (e) => {
        app.state.settings.titleFontSize = parseFloat(e.target.value);
        const valBadge = document.getElementById('titleFontSizeVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const bodyFontSize = document.getElementById('bodyFontSize');
    if (bodyFontSize) {
      bodyFontSize.addEventListener('input', (e) => {
        app.state.settings.bodyFontSize = parseFloat(e.target.value);
        const valBadge = document.getElementById('bodyFontSizeVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const labelScheme = document.getElementById('labelScheme');
    if (labelScheme) {
      labelScheme.addEventListener('change', (e) => {
        app.state.settings.labelScheme = e.target.value;
        const customGroup = document.getElementById('customLabelInputsGroup');
        if (customGroup) customGroup.style.display = (e.target.value === 'custom') ? 'flex' : 'none';
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const dividerThickness = document.getElementById('dividerThickness');
    if (dividerThickness) {
      dividerThickness.addEventListener('input', (e) => {
        app.state.settings.dividerThickness = Number(e.target.value);
        const valBadge = document.getElementById('dividerThicknessVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const dividerStyle = document.getElementById('dividerStyle');
    if (dividerStyle) {
      dividerStyle.addEventListener('change', (e) => {
        app.state.settings.dividerStyle = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const dividerSpacing = document.getElementById('dividerSpacing');
    if (dividerSpacing) {
      dividerSpacing.addEventListener('input', (e) => {
        app.state.settings.dividerSpacing = Number(e.target.value);
        const valBadge = document.getElementById('dividerSpacingVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    // Line Spacing Density Chips
    document.querySelectorAll('#lineSpacingChips .dpi-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#lineSpacingChips .dpi-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        app.state.settings.lineSpacing = chip.dataset.spacing;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    });

    // Socials
    const iconStyle = document.getElementById('iconStyle');
    if (iconStyle) {
      iconStyle.addEventListener('change', (e) => {
        app.state.settings.iconStyle = e.target.value;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const iconSize = document.getElementById('iconSize');
    if (iconSize) {
      iconSize.addEventListener('input', (e) => {
        app.state.settings.iconSize = Number(e.target.value);
        const valBadge = document.getElementById('iconSizeVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const iconSpacing = document.getElementById('iconSpacing');
    if (iconSpacing) {
      iconSpacing.addEventListener('input', (e) => {
        app.state.settings.iconSpacing = Number(e.target.value);
        const valBadge = document.getElementById('iconSpacingVal');
        if (valBadge) valBadge.textContent = `${e.target.value}px`;
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const socialsContainer = document.getElementById('socialsListContainer');
    if (socialsContainer) {
      socialsContainer.addEventListener('input', () => this.syncSocialsFromDom(app));
      socialsContainer.addEventListener('change', () => this.syncSocialsFromDom(app));
    }

    // Badges & Add-ons
    const showBadge = document.getElementById('showBadge');
    if (showBadge) {
      showBadge.addEventListener('change', (e) => {
        app.state.data.showBadge = e.target.checked;
        const group = document.getElementById('badgeInputGroup');
        if (group) group.style.display = e.target.checked ? 'block' : 'none';
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }
    bindInput('badgeText', 'badgeText');

    const showCta = document.getElementById('showCta');
    if (showCta) {
      showCta.addEventListener('change', (e) => {
        app.state.data.showCta = e.target.checked;
        const group = document.getElementById('ctaInputGroup');
        if (group) group.style.display = e.target.checked ? 'flex' : 'none';
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }
    bindInput('ctaText', 'ctaText');
    bindInput('ctaUrl', 'ctaUrl');

    const showGreenNote = document.getElementById('showGreenNote');
    if (showGreenNote) {
      showGreenNote.addEventListener('change', (e) => {
        app.state.data.showGreenNote = e.target.checked;
        const group = document.getElementById('greenNoteInputGroup');
        if (group) group.style.display = e.target.checked ? 'block' : 'none';
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }
    bindInput('greenNoteText', 'greenNoteText');

    const showQuote = document.getElementById('showQuote');
    if (showQuote) {
      showQuote.addEventListener('change', (e) => {
        app.state.data.showQuote = e.target.checked;
        const group = document.getElementById('quoteInputGroup');
        if (group) group.style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked && (!app.state.data.quoteText || !app.state.data.quoteText.trim())) {
          if (typeof Quotes !== 'undefined') {
            const randomQ = Quotes.getRandomQuote();
            app.state.data.quoteText = randomQ;
            const quoteInput = document.getElementById('quoteText');
            if (quoteInput) quoteInput.value = randomQ;
          }
        }
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    const rollQuoteBtn = document.getElementById('rollQuoteBtn');
    if (rollQuoteBtn) {
      rollQuoteBtn.addEventListener('click', () => {
        if (typeof Quotes !== 'undefined') {
          const randomQ = Quotes.getRandomQuote();
          app.state.data.quoteText = randomQ;
          const quoteInput = document.getElementById('quoteText');
          if (quoteInput) quoteInput.value = randomQ;
          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
          if (typeof app.showToast === 'function') app.showToast('🎲 Rolled a new inspirational quote!', 'info');
        }
      });
    }

    bindInput('quoteText', 'quoteText');

    const autoShuffleQuote = document.getElementById('autoShuffleQuote');
    if (autoShuffleQuote) {
      autoShuffleQuote.addEventListener('change', (e) => {
        app.state.data.autoShuffleQuote = e.target.checked;
      });
    }

    const showDisclaimer = document.getElementById('showDisclaimer');
    if (showDisclaimer) {
      showDisclaimer.addEventListener('change', (e) => {
        app.state.data.showDisclaimer = e.target.checked;
        const group = document.getElementById('disclaimerInputGroup');
        if (group) group.style.display = e.target.checked ? 'block' : 'none';
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
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
          this.syncEmailTemplateFromDom(app);
          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
        }
      });
    }

    const tplInputs = ['tplSubject', 'tplPreheader', 'tplHeaderLogoText', 'tplHeaderTag', 'tplGreeting', 'tplParagraph1', 'tplParagraph2', 'tplClosing', 'tplCtaText', 'tplCtaUrl', 'tplHighlightTitle', 'tplHighlightContent'];
    tplInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          this.syncEmailTemplateFromDom(app);
          if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
        });
      }
    });

    const tplShowHighlight = document.getElementById('tplShowHighlight');
    if (tplShowHighlight) {
      tplShowHighlight.addEventListener('change', (e) => {
        const grp = document.getElementById('tplHighlightInputGroup');
        if (grp) grp.style.display = e.target.checked ? 'flex' : 'none';
        this.syncEmailTemplateFromDom(app);
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      });
    }

    // Rich Text Formatting Toolbars for Email Paragraphs
    if (typeof app.initParagraphFormattingToolbars === 'function') {
      app.initParagraphFormattingToolbars();
    } else if (typeof RichTextEditor !== 'undefined' && typeof RichTextEditor.initParagraphFormattingToolbars === 'function') {
      RichTextEditor.initParagraphFormattingToolbars(app);
    }
  }
};

if (typeof window !== 'undefined') {
  window.FormControls = FormControls;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormControls;
}
