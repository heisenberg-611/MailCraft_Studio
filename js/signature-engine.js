/**
 * Email-Safe HTML Signature Generation Engine (MailCraft Studio 2.0)
 * Produces rock-solid nested <table> HTML with inline CSS
 * Automatic Dark Mode Adaptation, High-DPI Retina dual-image support, custom fields & promo banners
 * 10 Architectural Templates, QR/vCard integration, Booking & Status Badges
 * Zero emojis
 */

const SignatureEngine = {
  /**
   * Helper: Parse 3-digit or 6-digit hex color to RGB object
   */
  hexToRgb(hex) {
    if (!hex || typeof hex !== 'string') return { r: 15, g: 23, b: 42 };
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) return { r: 15, g: 23, b: 42 };
    return {
      r: parseInt(clean.substr(0, 2), 16) || 0,
      g: parseInt(clean.substr(2, 2), 16) || 0,
      b: parseInt(clean.substr(4, 2), 16) || 0
    };
  },

  /**
   * Helper: Convert RGB (0-255) to 6-digit hex
   */
  rgbToHex(r, g, b) {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    const hex = ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
    return '#' + hex.toUpperCase();
  },

  /**
   * Helper: Convert RGB to HSL (h: 0-360, s: 0-1, l: 0-1)
   */
  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s, l };
  },

  /**
   * Helper: Convert HSL to RGB (0-255)
   */
  hslToRgb(h, s, l) {
    h = (h % 360) / 360;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
  },

  /**
   * Helper: Calculate relative color luminance (0 to 1) via WCAG formula
   */
  getLuminance(hex) {
    if (!hex || hex === 'transparent') return 1;
    const { r, g, b } = this.hexToRgb(hex);
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  },

  /**
   * Helper: Convert HSL values directly to Hex string
   */
  hslToHex(h, s, l) {
    const { r, g, b } = this.hslToRgb(h, s, l);
    return this.rgbToHex(r, g, b);
  },

  /**
   * Intelligently transform any color for Dark Mode
   */
  adjustColorForDark(color, role = 'body') {
    if (!color) return '#CBD5E1';
    const lum = this.getLuminance(color);
    const { r, g, b } = this.hexToRgb(color);
    const { h, s, l } = this.rgbToHsl(r, g, b);

    if (lum >= 0.65 && role !== 'name') return color;
    const isNeutral = s < 0.25 || l < 0.15 || (Math.max(r, g, b) - Math.min(r, g, b) < 32);

    switch (role) {
      case 'name':
        if (isNeutral) return '#F8FAFC';
        return this.hslToHex(h, Math.max(s, 0.75), 0.82);
      case 'title':
        if (isNeutral || s < 0.35) return '#94A3B8';
        return this.hslToHex(h, Math.max(s, 0.65), 0.72);
      case 'body':
        if (isNeutral || s < 0.35) return '#CBD5E1';
        return this.hslToHex(h, Math.min(s, 0.5), 0.78);
      case 'label':
        if (isNeutral) return '#93C5FD';
        return this.hslToHex(h, Math.max(s, 0.7), 0.75);
      case 'link':
      case 'accent':
      case 'divider':
        if (isNeutral) return '#60A5FA';
        return this.hslToHex(h, Math.max(s, 0.85), Math.max(0.62, Math.min(0.72, l + 0.25)));
      case 'cardBorder':
        return '#334155';
      default:
        if (isNeutral) return '#E2E8F0';
        return this.hslToHex(h, s, 0.75);
    }
  },

  /**
   * Main render function that returns email-safe HTML string
   */
  generateHtml(data, settings, isDark = false, isExport = true) {
    const presetsStyles = (typeof Presets !== 'undefined' && Presets.styles) ? Presets.styles : {};
    const defaultData = (typeof Presets !== 'undefined' && Presets.defaultData) ? Presets.defaultData : {};
    const rawSettings = Object.assign({}, presetsStyles.dhrubojyoti ? presetsStyles.dhrubojyoti.settings : {}, settings);
    const d = Object.assign({}, defaultData, data);
    const s = Object.assign({}, rawSettings);

    const darkColors = {
      name: this.adjustColorForDark(s.nameColor, 'name'),
      title: this.adjustColorForDark(s.titleColor || s.accentColor, 'title'),
      body: this.adjustColorForDark(s.bodyColor, 'body'),
      label: this.adjustColorForDark(s.labelColor || s.bodyColor, 'label'),
      link: this.adjustColorForDark(s.linkColor || s.accentColor, 'link'),
      accent: this.adjustColorForDark(s.accentColor, 'accent'),
      divider: this.adjustColorForDark(s.dividerColor || s.accentColor, 'divider'),
      quote: this.adjustColorForDark(s.quoteColor || '#D4D4D8', 'body'),
      disclaimer: this.adjustColorForDark(s.disclaimerColor || '#94A3B8', 'body'),
      avatarBorder: this.adjustColorForDark(s.avatarBorderColor || s.accentColor, 'accent')
    };

    if (isDark) {
      s.nameColor = darkColors.name;
      s.titleColor = darkColors.title;
      s.bodyColor = darkColors.body;
      s.labelColor = darkColors.label;
      s.linkColor = darkColors.link;
      s.accentColor = darkColors.accent;
      s.dividerColor = darkColors.divider;
      s.quoteColor = darkColors.quote;
      s.disclaimerColor = darkColors.disclaimer;
      s.avatarBorderColor = darkColors.avatarBorder;
      s.isDarkModeActive = true;
    }

    const template = s.template || 'vertical-divider';
    let renderedHtml = '';
    
    switch (template) {
      case 'horizontal-bar':
        renderedHtml = this.renderHorizontalBar(d, s);
        break;
      case 'two-column':
        renderedHtml = this.renderTwoColumn(d, s);
        break;
      case 'modern-card':
        renderedHtml = this.renderModernCard(d, s);
        break;
      case 'minimal-left':
        renderedHtml = this.renderMinimalLeft(d, s);
        break;
      case 'compact-inline':
        renderedHtml = this.renderCompactInline(d, s);
        break;
      case 'header-banner':
        renderedHtml = this.renderHeaderBanner(d, s);
        break;
      case 'academic-affil':
        renderedHtml = this.renderAcademicAffiliation(d, s);
        break;
      case 'micro-thread':
        renderedHtml = this.renderMicroThread(d, s);
        break;
      case 'ascii-terminal':
        renderedHtml = this.renderAsciiTerminal(d, s);
        break;
      case 'vertical-divider':
      default:
        renderedHtml = this.renderVerticalDivider(d, s);
        break;
    }

    if (!isExport) {
      return renderedHtml;
    }

    const ctaDarkText = this.getLuminance(darkColors.accent) > 0.55 ? '#0F172A' : '#FFFFFF';

    const darkModeStyles = `
<style>
  :root {
    color-scheme: light dark;
    supported-color-schemes: light dark;
  }
  @media (prefers-color-scheme: dark) {
    .sig-dark-name { color: ${darkColors.name} !important; }
    .sig-dark-title { color: ${darkColors.title} !important; }
    .sig-dark-body { color: ${darkColors.body} !important; }
    .sig-dark-label { color: ${darkColors.label} !important; }
    .sig-dark-link { color: ${darkColors.link} !important; }
    .sig-dark-quote { color: ${darkColors.quote} !important; }
    .sig-dark-disclaimer { color: ${darkColors.disclaimer} !important; }
    .sig-dark-divider { border-color: ${darkColors.divider} !important; }
    .sig-dark-card { background-color: #0F172A !important; border-color: #334155 !important; border-left-color: ${darkColors.accent} !important; }
    .sig-dark-border { border-color: #334155 !important; }
    .sig-dark-badge { background-color: ${darkColors.accent}25 !important; color: ${darkColors.accent} !important; border-color: ${darkColors.accent}45 !important; }
    .sig-dark-cta { background-color: ${darkColors.accent} !important; color: ${ctaDarkText} !important; }
    .sig-dark-avatar { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.25)) !important; }
    .sig-dark-invert { filter: brightness(0) invert(1) !important; }
    .sig-dark-terminal { background-color: #090B0E !important; border-color: #1E293B !important; color: #F8FAFC !important; }
  }
  [data-ogsc] .sig-dark-name { color: ${darkColors.name} !important; }
  [data-ogsc] .sig-dark-title { color: ${darkColors.title} !important; }
  [data-ogsc] .sig-dark-body { color: ${darkColors.body} !important; }
  [data-ogsc] .sig-dark-label { color: ${darkColors.label} !important; }
  [data-ogsc] .sig-dark-link { color: ${darkColors.link} !important; }
  [data-ogsc] .sig-dark-quote { color: ${darkColors.quote} !important; }
  [data-ogsc] .sig-dark-disclaimer { color: ${darkColors.disclaimer} !important; }
  [data-ogsc] .sig-dark-divider { border-color: ${darkColors.divider} !important; }
  [data-ogsc] .sig-dark-card { background-color: #0F172A !important; border-color: #334155 !important; }
  [data-ogsc] .sig-dark-badge { background-color: ${darkColors.accent}25 !important; color: ${darkColors.accent} !important; }
  [data-ogsc] .sig-dark-cta { background-color: ${darkColors.accent} !important; color: ${ctaDarkText} !important; }
  [data-ogsc] .sig-dark-invert { filter: brightness(0) invert(1) !important; }
  [data-ogsc] .sig-dark-terminal { background-color: #090B0E !important; border-color: #1E293B !important; color: #F8FAFC !important; }
</style>
`.trim();

    return darkModeStyles + '\n' + renderedHtml;
  },

  /**
   * Template 1: Vertical Divider (Classic / Reference)
   */
  renderVerticalDivider(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const logoHtml = this.renderLogoHtml(d, s);
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const statusBadgeHtml = this.renderStatusBadgeHtml(d, s);
    const bookingBadgeHtml = this.renderBookingBadgeHtml(d, s);
    const qrHtml = this.renderQrCodeHtml(d, s);
    const promoBannerHtml = this.renderPromoBanner(d, s);
    const quoteHtml = this.renderQuote(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    const dividerBorder = `${s.dividerThickness || 2}px ${s.dividerStyle || 'solid'} ${s.dividerColor || s.accentColor || '#2563EB'}`;

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <td valign="middle" style="padding: 0; vertical-align: middle;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
        <tr>
          ${avatarHtml ? `
          <!-- Avatar Column -->
          <td valign="middle" align="center" style="padding-right: 14px; vertical-align: middle; width: ${s.avatarSize || 85}px; text-align: center;">
            ${avatarHtml}
            ${logoHtml ? `<div style="padding-top: 8px;">${logoHtml}</div>` : ''}
            ${qrHtml ? `<div style="padding-top: 8px;">${qrHtml}</div>` : ''}
          </td>
          ` : (logoHtml ? `
          <td valign="middle" align="center" style="padding-right: 14px; vertical-align: middle; width: ${d.logoSize || 70}px; text-align: center;">
            ${logoHtml}
            ${qrHtml ? `<div style="padding-top: 8px;">${qrHtml}</div>` : ''}
          </td>
          ` : (qrHtml ? `
          <td valign="middle" align="center" style="padding-right: 14px; vertical-align: middle;">
            ${qrHtml}
          </td>
          ` : ''))}

          <!-- Vertical Divider Bar -->
          <td valign="middle" class="sig-divider" style="width: 1px; border-left: ${dividerBorder}; padding: 0; font-size: 1px; line-height: 1px; vertical-align: middle;">
            &nbsp;
          </td>

          <!-- Details Column -->
          <td valign="middle" style="padding-left: 14px; vertical-align: middle;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
              <!-- Name & Title -->
              <tr>
                <td valign="top" style="padding-bottom: 4px; vertical-align: top;">
                  ${this.renderNameHtml(d, s)}
                  ${this.renderTitleHtml(d, s)}
                  ${statusBadgeHtml ? `<div style="padding-top: 4px;">${statusBadgeHtml}</div>` : ''}
                  ${badgeHtml ? `<div style="padding-top: 4px;">${badgeHtml}</div>` : ''}
                </td>
              </tr>

              <!-- Contact Rows -->
              <tr>
                <td valign="top" style="padding-top: 2px; padding-bottom: 4px; vertical-align: top;">
                  ${textDetailsHtml}
                </td>
              </tr>

              <!-- Socials & Actions -->
              ${(socialIconsHtml || bookingBadgeHtml || ctaHtml) ? `
              <tr>
                <td valign="top" style="padding-top: 4px; vertical-align: top;">
                  ${socialIconsHtml}
                  ${bookingBadgeHtml ? `<div style="padding-top: 6px;">${bookingBadgeHtml}</div>` : ''}
                  ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
                </td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${promoBannerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 10px; vertical-align: top;">
      ${promoBannerHtml}
    </td>
  </tr>
  ` : ''}
  ${quoteHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${quoteHtml}
    </td>
  </tr>
  ` : ''}
  ${disclaimerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${disclaimerHtml}
    </td>
  </tr>
  ` : ''}
</table>
<!-- Email Signature End -->
`.trim();
  },

  /**
   * Template 2: Horizontal Bar
   */
  renderHorizontalBar(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const logoHtml = this.renderLogoHtml(d, s);
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const statusBadgeHtml = this.renderStatusBadgeHtml(d, s);
    const bookingBadgeHtml = this.renderBookingBadgeHtml(d, s);
    const qrHtml = this.renderQrCodeHtml(d, s);
    const promoBannerHtml = this.renderPromoBanner(d, s);
    const quoteHtml = this.renderQuote(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    const dividerBorder = `${s.dividerThickness || 2}px ${s.dividerStyle || 'solid'} ${s.dividerColor || s.accentColor || '#2563EB'}`;

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <td valign="top" style="vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          ${avatarHtml ? `
          <td valign="middle" style="padding-right: 12px; vertical-align: middle;">
            ${avatarHtml}
          </td>
          ` : ''}
          <td valign="middle" style="vertical-align: middle;">
            ${this.renderNameHtml(d, s)}
            ${this.renderTitleHtml(d, s)}
            ${statusBadgeHtml ? `<div style="padding-top: 3px;">${statusBadgeHtml}</div>` : ''}
            ${badgeHtml ? `<div style="padding-top: 3px;">${badgeHtml}</div>` : ''}
          </td>
          ${logoHtml ? `
          <td valign="middle" align="right" style="padding-left: 16px; vertical-align: middle;">
            ${logoHtml}
          </td>
          ` : ''}
        </tr>
      </table>
    </td>
  </tr>

  <!-- Horizontal Divider Line -->
  <tr>
    <td class="sig-divider" style="padding: 6px 0; border-bottom: ${dividerBorder}; font-size: 1px; line-height: 1px;">
      &nbsp;
    </td>
  </tr>

  <!-- Details & Actions Row -->
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
        <tr>
          <td valign="top" style="vertical-align: top;">
            ${textDetailsHtml}
            ${socialIconsHtml ? `<div style="padding-top: 6px;">${socialIconsHtml}</div>` : ''}
            ${bookingBadgeHtml ? `<div style="padding-top: 6px;">${bookingBadgeHtml}</div>` : ''}
            ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
          </td>
          ${qrHtml ? `
          <td valign="top" align="right" style="padding-left: 14px; vertical-align: top; width: 75px;">
            ${qrHtml}
          </td>
          ` : ''}
        </tr>
      </table>
    </td>
  </tr>

  ${promoBannerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 10px; vertical-align: top;">
      ${promoBannerHtml}
    </td>
  </tr>
  ` : ''}
  ${quoteHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${quoteHtml}
    </td>
  </tr>
  ` : ''}
  ${disclaimerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${disclaimerHtml}
    </td>
  </tr>
  ` : ''}
</table>
<!-- Email Signature End -->
`.trim();
  },

  /**
   * Template 3: Two Column Grid
   */
  renderTwoColumn(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const logoHtml = this.renderLogoHtml(d, s);
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const statusBadgeHtml = this.renderStatusBadgeHtml(d, s);
    const bookingBadgeHtml = this.renderBookingBadgeHtml(d, s);
    const qrHtml = this.renderQrCodeHtml(d, s);
    const promoBannerHtml = this.renderPromoBanner(d, s);
    const quoteHtml = this.renderQuote(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    const innerBorder = s.isDarkModeActive ? '1px solid #334155' : '1px solid #E2E8F0';

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <td valign="top" style="vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          <!-- Column 1: Identity & Avatar -->
          <td valign="top" style="padding-right: 16px; vertical-align: top;">
            ${avatarHtml ? `<div style="margin-bottom: 8px;">${avatarHtml}</div>` : ''}
            ${this.renderNameHtml(d, s)}
            ${this.renderTitleHtml(d, s)}
            ${statusBadgeHtml ? `<div style="padding-top: 4px;">${statusBadgeHtml}</div>` : ''}
            ${badgeHtml ? `<div style="padding-top: 4px;">${badgeHtml}</div>` : ''}
            ${logoHtml ? `<div style="padding-top: 8px;">${logoHtml}</div>` : ''}
            ${socialIconsHtml ? `<div style="padding-top: 8px;">${socialIconsHtml}</div>` : ''}
          </td>

          <!-- Column 2: Contact Details -->
          <td valign="top" class="sig-dark-border" style="padding-left: 16px; border-left: ${innerBorder}; vertical-align: top;">
            ${textDetailsHtml}
            ${bookingBadgeHtml ? `<div style="padding-top: 6px;">${bookingBadgeHtml}</div>` : ''}
            ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
            ${qrHtml ? `<div style="padding-top: 8px;">${qrHtml}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${promoBannerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 10px; vertical-align: top;">
      ${promoBannerHtml}
    </td>
  </tr>
  ` : ''}
  ${quoteHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${quoteHtml}
    </td>
  </tr>
  ` : ''}
  ${disclaimerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${disclaimerHtml}
    </td>
  </tr>
  ` : ''}
</table>
<!-- Email Signature End -->
`.trim();
  },

  /**
   * Template 4: Modern Card Style
   */
  renderModernCard(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const logoHtml = this.renderLogoHtml(d, s);
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const statusBadgeHtml = this.renderStatusBadgeHtml(d, s);
    const bookingBadgeHtml = this.renderBookingBadgeHtml(d, s);
    const qrHtml = this.renderQrCodeHtml(d, s);
    const promoBannerHtml = this.renderPromoBanner(d, s);
    const quoteHtml = this.renderQuote(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    const cardBg = s.isDarkModeActive ? '#0F172A' : '#FFFFFF';
    const cardBorder = s.isDarkModeActive ? '1px solid #334155' : '1px solid #E2E8F0';

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; max-width: 520px;">
  <tr>
    <td class="sig-dark-card" style="border: ${cardBorder}; border-left: 3.5px solid ${s.accentColor || '#2563EB'}; border-radius: 6px; padding: 12px 14px; background-color: ${cardBg};">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
        <tr>
          ${avatarHtml ? `
          <td valign="top" style="padding-right: 14px; width: ${s.avatarSize || 85}px; vertical-align: top;">
            ${avatarHtml}
            ${logoHtml ? `<div style="padding-top: 6px;">${logoHtml}</div>` : ''}
            ${qrHtml ? `<div style="padding-top: 6px;">${qrHtml}</div>` : ''}
          </td>
          ` : (logoHtml ? `
          <td valign="top" style="padding-right: 14px; width: ${d.logoSize || 70}px; vertical-align: top;">
            ${logoHtml}
            ${qrHtml ? `<div style="padding-top: 6px;">${qrHtml}</div>` : ''}
          </td>
          ` : '')}
          <td valign="top" style="vertical-align: top;">
            ${this.renderNameHtml(d, s)}
            ${this.renderTitleHtml(d, s)}
            ${statusBadgeHtml ? `<div style="padding-top: 3px;">${statusBadgeHtml}</div>` : ''}
            ${badgeHtml ? `<div style="padding-top: 3px;">${badgeHtml}</div>` : ''}
            <div style="padding-top: 6px;">
              ${textDetailsHtml}
            </div>
            ${socialIconsHtml ? `<div style="padding-top: 6px;">${socialIconsHtml}</div>` : ''}
            ${bookingBadgeHtml ? `<div style="padding-top: 6px;">${bookingBadgeHtml}</div>` : ''}
            ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${promoBannerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 10px; vertical-align: top;">
      ${promoBannerHtml}
    </td>
  </tr>
  ` : ''}
  ${quoteHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${quoteHtml}
    </td>
  </tr>
  ` : ''}
  ${disclaimerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${disclaimerHtml}
    </td>
  </tr>
  ` : ''}
</table>
<!-- Email Signature End -->
`.trim();
  },

  /**
   * Template 5: Minimal Left-Aligned
   */
  renderMinimalLeft(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const logoHtml = this.renderLogoHtml(d, s);
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const statusBadgeHtml = this.renderStatusBadgeHtml(d, s);
    const bookingBadgeHtml = this.renderBookingBadgeHtml(d, s);
    const qrHtml = this.renderQrCodeHtml(d, s);
    const promoBannerHtml = this.renderPromoBanner(d, s);
    const quoteHtml = this.renderQuote(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <td valign="top" style="vertical-align: top;">
      ${avatarHtml ? `<div style="margin-bottom: 6px;">${avatarHtml}</div>` : ''}
      ${this.renderNameHtml(d, s)}
      ${this.renderTitleHtml(d, s)}
      ${statusBadgeHtml ? `<div style="padding-bottom: 4px;">${statusBadgeHtml}</div>` : ''}
      ${badgeHtml ? `<div style="padding-bottom: 4px;">${badgeHtml}</div>` : ''}
      ${textDetailsHtml}
      ${logoHtml ? `<div style="padding-top: 6px;">${logoHtml}</div>` : ''}
      ${socialIconsHtml ? `<div style="padding-top: 6px;">${socialIconsHtml}</div>` : ''}
      ${bookingBadgeHtml ? `<div style="padding-top: 6px;">${bookingBadgeHtml}</div>` : ''}
      ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
      ${qrHtml ? `<div style="padding-top: 8px;">${qrHtml}</div>` : ''}
      ${promoBannerHtml ? `<div style="padding-top: 10px;">${promoBannerHtml}</div>` : ''}
      ${quoteHtml ? `<div style="padding-top: 8px;">${quoteHtml}</div>` : ''}
      ${disclaimerHtml ? `<div style="padding-top: 8px;">${disclaimerHtml}</div>` : ''}
    </td>
  </tr>
</table>
<!-- Email Signature End -->
`.trim();
  },

  /**
   * Template 6: Compact Inline (One/Two Line)
   */
  renderCompactInline(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const quoteHtml = this.renderQuote(d, s);

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    ${avatarHtml ? `<td valign="middle" style="padding-right: 10px;">${avatarHtml}</td>` : ''}
    <td valign="middle">
      <span class="sig-dark-name" style="font-size: ${s.nameFontSize || 17}px; font-weight: ${s.nameFontWeight || 'bold'}; color: ${s.nameColor};">${d.fullName}</span>
      <span style="color: #94A3B8; margin: 0 4px;">|</span>
      <span class="sig-dark-title" style="color: ${s.titleColor}; font-size: ${s.titleFontSize || 13}px;">${d.jobTitle}${d.company ? `, ${d.company}` : ''}</span>
      <div class="sig-dark-body" style="font-size: ${s.bodyFontSize - 1}px; color: ${s.bodyColor}; padding-top: 2px;">
        ${d.phone ? `<span>${s.showLabels !== false ? `${s.labelPhone || 'Mobile:'} ` : ''}<a href="tel:${d.phone.replace(/[^0-9+]/g, '')}" class="sig-dark-link" style="color: ${s.linkColor}; text-decoration: none;">${d.phone}</a></span>` : ''}
        ${d.email ? `<span style="color: #CBD5E1; margin: 0 4px;">&bull;</span><span>${s.showLabels !== false ? `${s.labelEmail || 'E-mail:'} ` : ''}<a href="mailto:${d.email}" class="sig-dark-link" style="color: ${s.linkColor}; text-decoration: none;">${d.email}</a></span>` : ''}
        ${d.website ? `<span style="color: #CBD5E1; margin: 0 4px;">&bull;</span><span>${s.showLabels !== false ? `${s.labelWebsite || 'Website:'} ` : ''}<a href="https://${d.website.replace(/^https?:\/\//, '')}" class="sig-dark-link" style="color: ${s.linkColor}; text-decoration: none;">${d.website.replace(/^https?:\/\//, '')}</a></span>` : ''}
      </div>
      ${socialIconsHtml ? `<div style="padding-top: 4px;">${socialIconsHtml}</div>` : ''}
    </td>
  </tr>
  ${quoteHtml ? `
  <tr>
    <td colspan="2" valign="top" style="padding-top: 6px; vertical-align: top;">
      ${quoteHtml}
    </td>
  </tr>
  ` : ''}
</table>
<!-- Email Signature End -->
`.trim();
  },

  /**
   * Template 7: Header Hero Banner (NEW Blueprint)
   */
  renderHeaderBanner(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const logoHtml = this.renderLogoHtml(d, s);
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const statusBadgeHtml = this.renderStatusBadgeHtml(d, s);
    const bookingBadgeHtml = this.renderBookingBadgeHtml(d, s);
    const qrHtml = this.renderQrCodeHtml(d, s);
    const promoBannerHtml = this.renderPromoBanner(d, s);
    const quoteHtml = this.renderQuote(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    const bannerBg = s.accentColor || '#2563EB';
    const bannerTextColor = this.getLuminance(bannerBg) > 0.55 ? '#0F172A' : '#FFFFFF';

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; max-width: 480px;">
  <!-- Header Hero Bar -->
  <tr>
    <td style="background-color: ${bannerBg}; border-radius: 6px 6px 0 0; padding: 10px 14px;">
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td valign="middle" style="color: ${bannerTextColor}; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            ${d.company || 'Professional Portfolio'}
          </td>
          ${d.department ? `
          <td valign="middle" align="right" style="color: ${bannerTextColor}; opacity: 0.85; font-size: 10px;">
            ${d.department}
          </td>
          ` : ''}
        </tr>
      </table>
    </td>
  </tr>

  <!-- Main Body Content -->
  <tr>
    <td class="sig-dark-card" style="border: 1px solid #E2E8F0; border-top: 0; border-radius: 0 0 6px 6px; padding: 12px 14px; background-color: ${s.isDarkModeActive ? '#0F172A' : '#FAFAFA'};">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
        <tr>
          ${avatarHtml ? `
          <td valign="top" style="padding-right: 12px; width: ${s.avatarSize || 80}px; vertical-align: top;">
            ${avatarHtml}
            ${logoHtml ? `<div style="padding-top: 6px;">${logoHtml}</div>` : ''}
            ${qrHtml ? `<div style="padding-top: 6px;">${qrHtml}</div>` : ''}
          </td>
          ` : ''}
          <td valign="top" style="vertical-align: top;">
            ${this.renderNameHtml(d, s)}
            ${this.renderTitleHtml(d, s)}
            ${statusBadgeHtml ? `<div style="padding-top: 3px;">${statusBadgeHtml}</div>` : ''}
            ${badgeHtml ? `<div style="padding-top: 3px;">${badgeHtml}</div>` : ''}
            <div style="padding-top: 6px;">
              ${textDetailsHtml}
            </div>
            ${socialIconsHtml ? `<div style="padding-top: 6px;">${socialIconsHtml}</div>` : ''}
            ${bookingBadgeHtml ? `<div style="padding-top: 6px;">${bookingBadgeHtml}</div>` : ''}
            ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  ${promoBannerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 10px; vertical-align: top;">
      ${promoBannerHtml}
    </td>
  </tr>
  ` : ''}
  ${quoteHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${quoteHtml}
    </td>
  </tr>
  ` : ''}
  ${disclaimerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${disclaimerHtml}
    </td>
  </tr>
  ` : ''}
</table>
<!-- Email Signature End -->
`.trim();
  },

  /**
   * Template 8: Academic Multi-Affiliation (NEW Blueprint)
   */
  renderAcademicAffiliation(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const logoHtml = this.renderLogoHtml(d, s);
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const statusBadgeHtml = this.renderStatusBadgeHtml(d, s);
    const bookingBadgeHtml = this.renderBookingBadgeHtml(d, s);
    const qrHtml = this.renderQrCodeHtml(d, s);
    const promoBannerHtml = this.renderPromoBanner(d, s);
    const quoteHtml = this.renderQuote(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    const academicBorder = `2px solid ${s.accentColor || '#1E3A8A'}`;

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily || 'Georgia, serif'}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; max-width: 520px;">
  <tr>
    <td valign="top" style="vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          ${avatarHtml ? `
          <td valign="top" style="padding-right: 14px; width: ${s.avatarSize || 90}px; vertical-align: top;">
            ${avatarHtml}
            ${logoHtml ? `<div style="padding-top: 8px;">${logoHtml}</div>` : ''}
            ${qrHtml ? `<div style="padding-top: 8px;">${qrHtml}</div>` : ''}
          </td>
          ` : ''}
          <td valign="top" style="border-left: ${academicBorder}; padding-left: 14px; vertical-align: top;">
            ${this.renderNameHtml(d, s)}
            ${this.renderTitleHtml(d, s)}
            ${statusBadgeHtml ? `<div style="padding-top: 4px;">${statusBadgeHtml}</div>` : ''}
            ${badgeHtml ? `<div style="padding-top: 4px;">${badgeHtml}</div>` : ''}

            <!-- Academic Metadata & Contacts -->
            <div style="padding-top: 6px;">
              ${textDetailsHtml}
            </div>

            ${socialIconsHtml ? `<div style="padding-top: 6px;">${socialIconsHtml}</div>` : ''}
            ${bookingBadgeHtml ? `<div style="padding-top: 6px;">${bookingBadgeHtml}</div>` : ''}
            ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${promoBannerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 10px; vertical-align: top;">
      ${promoBannerHtml}
    </td>
  </tr>
  ` : ''}
  ${quoteHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${quoteHtml}
    </td>
  </tr>
  ` : ''}
  ${disclaimerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${disclaimerHtml}
    </td>
  </tr>
  ` : ''}
</table>
<!-- Email Signature End -->
`.trim();
  },

  /**
   * Template 9: Ultra-Compact Micro Thread (NEW Blueprint)
   */
  renderMicroThread(d, s) {
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const linkStyle = `color: ${s.linkColor || s.accentColor || '#0284C7'}; text-decoration: none;`;

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize - 0.5}px; line-height: 1.4; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <td style="padding-right: 6px; color: ${s.accentColor || '#00DC82'}; font-weight: bold; font-family: monospace;">//</td>
    <td>
      <span class="sig-dark-name" style="font-weight: 700; color: ${s.nameColor}; font-size: ${s.nameFontSize - 2}px;">${d.fullName}</span>
      <span style="color: #94A3B8; margin: 0 4px;">&sim;</span>
      <span class="sig-dark-title" style="color: ${s.titleColor};">${d.jobTitle}${d.company ? ` @ ${d.company}` : ''}</span>
      ${d.phone ? `<span style="color: #CBD5E1; margin: 0 4px;">&bull;</span><span><a href="tel:${d.phone.replace(/[^0-9+]/g, '')}" class="sig-dark-link" style="${linkStyle}">${d.phone}</a></span>` : ''}
      ${d.email ? `<span style="color: #CBD5E1; margin: 0 4px;">&bull;</span><span><a href="mailto:${d.email}" class="sig-dark-link" style="${linkStyle}">${d.email}</a></span>` : ''}
      ${d.website ? `<span style="color: #CBD5E1; margin: 0 4px;">&bull;</span><span><a href="https://${d.website.replace(/^https?:\/\//, '')}" class="sig-dark-link" style="${linkStyle}">${d.website.replace(/^https?:\/\//, '')}</a></span>` : ''}
    </td>
  </tr>
  ${socialIconsHtml ? `
  <tr>
    <td style="padding-right: 6px;"></td>
    <td style="padding-top: 3px;">
      ${socialIconsHtml}
    </td>
  </tr>
  ` : ''}
</table>
<!-- Email Signature End -->
`.trim();
  },

  /**
   * Template 10: Obsidian ASCII Terminal (NEW Blueprint)
   */
  renderAsciiTerminal(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const bookingBadgeHtml = this.renderBookingBadgeHtml(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const qrHtml = this.renderQrCodeHtml(d, s);
    const promoBannerHtml = this.renderPromoBanner(d, s);

    const termAccent = s.accentColor || '#00DC82';
    const termFont = "'Courier New', Courier, monospace";

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${termFont}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; max-width: 500px;">
  <tr>
    <td class="sig-dark-terminal" style="background-color: #0A0A0A; border: 1px solid #242424; border-radius: 4px; padding: 10px 12px; color: #D4D4D8;">
      <!-- Terminal Header Prompt Bar -->
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <tr>
          <td style="font-size: 10.5px; color: ${termAccent}; font-weight: bold; border-bottom: 1px dashed #333333; padding-bottom: 4px;">
            &gt; identity --whoami [status: active]
          </td>
        </tr>
      </table>

      <!-- Terminal Body Content -->
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
        <tr>
          ${avatarHtml ? `
          <td valign="top" style="padding-right: 12px; width: ${s.avatarSize || 75}px; vertical-align: top;">
            ${avatarHtml}
            ${qrHtml ? `<div style="padding-top: 6px;">${qrHtml}</div>` : ''}
          </td>
          ` : ''}
          <td valign="top" style="vertical-align: top; font-size: 11.5px; line-height: 1.4;">
            <div>
              <span style="color: ${termAccent}; font-weight: bold;">$ user:</span> 
              <span class="sig-dark-name" style="font-weight: bold; color: #FFFFFF;">${d.fullName}</span>
            </div>
            <div>
              <span style="color: ${termAccent}; font-weight: bold;">$ role:</span> 
              <span class="sig-dark-title" style="color: #94A3B8;">${d.jobTitle}${d.company ? ` @ ${d.company}` : ''}</span>
            </div>
            ${d.phone ? `<div><span style="color: ${termAccent};">$ tel:</span> <a href="tel:${d.phone.replace(/[^0-9+]/g, '')}" class="sig-dark-link" style="color: ${s.linkColor || termAccent}; text-decoration: none;">${d.phone}</a></div>` : ''}
            ${d.email ? `<div><span style="color: ${termAccent};">$ mail:</span> <a href="mailto:${d.email}" class="sig-dark-link" style="color: ${s.linkColor || termAccent}; text-decoration: none;">${d.email}</a></div>` : ''}
            ${d.website ? `<div><span style="color: ${termAccent};">$ web:</span> <a href="https://${d.website.replace(/^https?:\/\//, '')}" class="sig-dark-link" style="color: ${s.linkColor || termAccent}; text-decoration: none;">${d.website.replace(/^https?:\/\//, '')}</a></div>` : ''}
            
            ${(socialIconsHtml || bookingBadgeHtml || ctaHtml) ? `
            <div style="padding-top: 6px; border-top: 1px dotted #27272A; margin-top: 6px;">
              ${socialIconsHtml}
              ${bookingBadgeHtml ? `<div style="padding-top: 6px;">${bookingBadgeHtml}</div>` : ''}
              ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
            </div>
            ` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  ${promoBannerHtml ? `
  <tr>
    <td valign="top" style="padding-top: 8px; vertical-align: top;">
      ${promoBannerHtml}
    </td>
  </tr>
  ` : ''}
</table>
<!-- Email Signature End -->
`.trim();
  },

  /**
   * Render High-Definition Avatar Image (Retina 2x/3x compliant)
   */
  renderAvatarHtml(d, s) {
    const src = (typeof ImageProcessor !== 'undefined' && ImageProcessor.processedDataUrl) ? ImageProcessor.processedDataUrl : (d.avatarUrl || '');
    if (!src) return '';

    const size = Number(s.avatarSize) || 85;
    let borderRadius = '0px';
    if (s.avatarShape === 'circle') borderRadius = '50%';
    else if (s.avatarShape === 'squircle') borderRadius = '22%';
    else if (s.avatarShape === 'rounded') borderRadius = '10px';
    else if (s.avatarShape === 'square') borderRadius = '0px';

    const borderWidth = Number(s.avatarBorderWidth) || 0;
    const borderCss = borderWidth > 0 ? `border: ${borderWidth}px solid ${s.avatarBorderColor || '#00DC82'};` : 'border: 0;';
    const darkGlow = s.isDarkModeActive ? 'filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.25));' : '';

    return `
<img src="${src}" alt="${d.fullName || 'Avatar'}" class="sig-dark-avatar" width="${size}" height="${size}" border="0" style="display: block; width: ${size}px; height: ${size}px; max-width: ${size}px; max-height: ${size}px; border-radius: ${borderRadius}; ${borderCss} ${darkGlow} object-fit: cover; box-sizing: border-box; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; image-rendering: -webkit-optimize-contrast;" />
`.trim();
  },

  /**
   * Render Company / Brand Logo
   */
  renderLogoHtml(d, s) {
    if (!d.showLogo || !d.logoUrl) return '';

    const size = Number(d.logoSize) || 70;
    let borderRadius = '0px';
    if (d.logoShape === 'circle') borderRadius = '50%';
    else if (d.logoShape === 'rounded') borderRadius = '8px';
    else if (d.logoShape === 'squircle') borderRadius = '18%';

    return `
<img src="${d.logoUrl}" alt="${d.company || 'Company Logo'}" width="${size}" border="0" style="display: block; width: ${size}px; max-width: ${size}px; height: auto; border-radius: ${borderRadius}; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; image-rendering: -webkit-optimize-contrast;" />
`.trim();
  },

  /**
   * Render Granular Customizable Full Name Line
   */
  renderNameHtml(d, s) {
    if (!d.fullName) return '';
    const prefix = s.namePrefix ? `<span style="font-weight: normal; opacity: 0.85; margin-right: 3px;">${s.namePrefix}</span>` : '';
    const suffix = s.nameSuffix ? `<span style="font-weight: normal; opacity: 0.85; margin-left: 3px;">${s.nameSuffix}</span>` : '';
    const tag = (s.nameTag || s.badgeText) && s.showBadges !== false
      ? `<span class="sig-dark-badge" style="display: inline-block; font-size: ${Math.max(9, (s.nameFontSize || 17) - 7)}px; font-weight: 700; padding: 1.5px 6px; border-radius: 3px; background-color: ${s.accentColor || '#00DC82'}1F; color: ${s.accentColor || '#00DC82'}; border: 1px solid ${s.accentColor || '#00DC82'}4D; vertical-align: middle; margin-left: 6px; text-transform: uppercase; letter-spacing: 0.05em;">${s.nameTag || s.badgeText}</span>`
      : '';
    
    const transformStyle = s.nameTransform && s.nameTransform !== 'none' ? `text-transform: ${s.nameTransform};` : '';
    const weightStyle = s.nameFontWeight || 'bold';
    const size = s.nameFontSize || 17;
    const color = s.nameColor || '#0A0A0A';
    const mb = s.nameMarginBottom || '2px';

    return `<div class="sig-dark-name" style="font-size: ${size}px; font-weight: ${weightStyle}; color: ${color}; line-height: 1.25; letter-spacing: -0.2px; margin-bottom: ${mb}; ${transformStyle}">${prefix}${d.fullName}${suffix}${tag}</div>`;
  },

  /**
   * Render Granular Customizable Professional Title & Organization Line
   */
  renderTitleHtml(d, s) {
    if (!d.jobTitle && !d.company && !d.department) return '';
    const size = s.titleFontSize || 13;
    const color = s.titleColor || s.accentColor || '#00DC82';
    const style = s.titleFontStyle || 'normal';
    const transform = s.titleTransform && s.titleTransform !== 'none' ? `text-transform: ${s.titleTransform};` : '';
    
    let sep = ' &bull; ';
    if (s.titleSeparator === 'pipe') sep = ' | ';
    else if (s.titleSeparator === 'slash') sep = ' / ';
    else if (s.titleSeparator === 'doubleslash') sep = ' // ';
    else if (s.titleSeparator === 'emdash') sep = ' &mdash; ';
    else if (s.titleSeparator === 'newline') sep = '<br>';
    else if (s.titleSeparator === 'bullet') sep = ' &bull; ';

    const fontStyleCss = style === 'italic' ? 'font-style: italic;' : (style === 'bold' ? 'font-weight: 700;' : (style === 'uppercase' ? 'text-transform: uppercase;' : ''));

    let titlePart = d.jobTitle || '';
    let compPart = d.company || '';
    let mainLine = '';

    if (titlePart && compPart) {
      mainLine = `<span style="${fontStyleCss}">${titlePart}</span><span style="opacity: 0.6; margin: 0 1px;">${sep}</span><span style="color: ${s.companyColor || color}; font-weight: 600;">${compPart}</span>`;
    } else if (titlePart) {
      mainLine = `<span style="${fontStyleCss}">${titlePart}</span>`;
    } else if (compPart) {
      mainLine = `<span style="color: ${s.companyColor || color}; font-weight: 600;">${compPart}</span>`;
    }

    const deptHtml = d.department
      ? `<div class="sig-dark-body" style="font-size: ${Math.max(10, (s.bodyFontSize || 12.5) - 1)}px; color: ${s.departmentColor || s.bodyColor || '#64748B'}; opacity: 0.88; line-height: 1.3; padding-top: 1px;">${d.department}</div>`
      : '';

    return `<div class="sig-dark-title" style="font-size: ${size}px; color: ${color}; line-height: 1.35; padding-top: 2px; ${transform}">${mainLine}</div>${deptHtml}`;
  },

  /**
   * Render Text Details Block with Dynamic Custom Key-Value Rows & Customizable Prefixes
   */
  renderDetailsBlock(d, s) {
    const rows = [];
    const labelStyle = `font-weight: 700; color: ${s.labelColor || s.accentColor || '#475569'}; margin-right: 4px;`;
    const linkStyle = `color: ${s.linkColor || s.accentColor || '#2563EB'}; text-decoration: none;`;
    
    // Spacing & line padding
    let linePad = '2.5px';
    let lineH = '1.38';
    if (s.lineSpacing === 'tight') { linePad = '1px'; lineH = '1.22'; }
    else if (s.lineSpacing === 'spacious') { linePad = '5px'; lineH = '1.65'; }

    // Label prefixes resolution
    let pPhone = '$ tel:';
    let pEmail = '$ mail:';
    let pWeb = '$ web:';
    let pAddr = '$ loc:';

    if (s.labelScheme === 'compact') {
      pPhone = 'T:'; pEmail = 'E:'; pWeb = 'W:'; pAddr = 'A:';
    } else if (s.labelScheme === 'full') {
      pPhone = 'Mobile:'; pEmail = 'Email:'; pWeb = 'Website:'; pAddr = 'Address:';
    } else if (s.labelScheme === 'minimal') {
      pPhone = ''; pEmail = ''; pWeb = ''; pAddr = '';
    } else if (s.labelScheme === 'custom') {
      pPhone = s.labelPhone !== undefined ? s.labelPhone : 'Phone:';
      pEmail = s.labelEmail !== undefined ? s.labelEmail : 'Email:';
      pWeb = s.labelWebsite !== undefined ? s.labelWebsite : 'Web:';
      pAddr = s.labelAddress !== undefined ? s.labelAddress : 'Loc:';
    } else if (s.labelPhone || s.labelEmail || s.labelWebsite || s.labelAddress) {
      pPhone = s.labelPhone || '';
      pEmail = s.labelEmail || '';
      pWeb = s.labelWebsite || '';
      pAddr = s.labelAddress || '';
    }

    const showLabels = s.showLabels !== false && s.labelScheme !== 'minimal';

    // Phone
    if (d.phone && s.showPhone !== false) {
      const label = (showLabels && pPhone) ? `<span class="sig-dark-label" style="${labelStyle}">${pPhone}</span> ` : '';
      rows.push(`<div style="line-height: ${lineH}; padding-bottom: ${linePad};">${label}<a href="tel:${d.phone.replace(/[^0-9+]/g, '')}" class="sig-dark-link" style="${linkStyle}">${d.phone}</a></div>`);
    }

    // Email
    if (d.email && s.showEmail !== false) {
      const label = (showLabels && pEmail) ? `<span class="sig-dark-label" style="${labelStyle}">${pEmail}</span> ` : '';
      rows.push(`<div style="line-height: ${lineH}; padding-bottom: ${linePad};">${label}<a href="mailto:${d.email}" class="sig-dark-link" style="${linkStyle}">${d.email}</a></div>`);
    }

    // Website
    if (d.website && s.showWebsite !== false) {
      const cleanWeb = d.website.replace(/^https?:\/\//, '');
      const label = (showLabels && pWeb) ? `<span class="sig-dark-label" style="${labelStyle}">${pWeb}</span> ` : '';
      rows.push(`<div style="line-height: ${lineH}; padding-bottom: ${linePad};">${label}<a href="https://${cleanWeb}" class="sig-dark-link" style="${linkStyle}">${cleanWeb}</a></div>`);
    }

    // Address & Country
    if (d.address && s.showAddress !== false) {
      const label = (showLabels && pAddr) ? `<span class="sig-dark-label" style="${labelStyle}">${pAddr}</span> ` : '';
      const fullAddress = d.country ? `${d.address} <span style="color: #94A3B8; margin: 0 4px;">|</span> ${d.country}` : d.address;
      rows.push(`<div class="sig-dark-body" style="color: ${s.bodyColor}; font-size: ${(s.bodyFontSize || 12.5) - 0.5}px; line-height: ${lineH}; padding-bottom: ${linePad};">${label}${fullAddress}</div>`);
    }

    // Dynamic Custom Key-Value Fields
    if (Array.isArray(d.customFields) && d.customFields.length > 0) {
      d.customFields.forEach(field => {
        if (!field || !field.label || !field.value) return;
        const valContent = field.url
          ? `<a href="${field.url}" class="sig-dark-link" target="_blank" style="${linkStyle}">${field.value}</a>`
          : field.value;
        rows.push(`<div style="line-height: ${lineH}; padding-bottom: ${linePad};"><span class="sig-dark-label" style="${labelStyle}">${field.label}:</span> <span class="sig-dark-body" style="color: ${s.bodyColor};">${valContent}</span></div>`);
      });
    }

    return rows.join('');
  },

  /**
   * Helper: Format and sanitize social media URL
   */
  formatSocialUrl(id, rawUrl) {
    if (!rawUrl || !rawUrl.trim()) {
      const defSocials = (typeof Presets !== 'undefined' && Presets.defaultData && Presets.defaultData.socials) ? Presets.defaultData.socials : [];
      const def = defSocials.find(s => s.id === id);
      if (def && def.url) rawUrl = def.url;
      else return '#';
    }
    const url = rawUrl.trim();
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
      return url;
    }
    switch (id) {
      case 'orcid':
        return url.startsWith('http') ? url : `https://orcid.org/${url.replace(/^https?:\/\/orcid\.org\//, '')}`;
      case 'googleScholar':
        return url.startsWith('http') ? url : `https://scholar.google.com/citations?user=${url}`;
      case 'researchGate':
        return url.startsWith('http') ? url : `https://www.researchgate.net/profile/${url}`;
      case 'calendly':
        return url.startsWith('http') ? url : `https://calendly.com/${url.replace(/^https?:\/\/calendly\.com\//, '')}`;
      case 'phone':
        return `tel:${url.replace(/[^0-9+]/g, '')}`;
      case 'email':
        return `mailto:${url}`;
      case 'whatsapp':
        return `https://wa.me/${url.replace(/[^0-9]/g, '')}`;
      case 'telegram':
        return `https://t.me/${url.replace(/^@/, '')}`;
      case 'x':
        return `https://x.com/${url.replace(/^@/, '')}`;
      case 'instagram':
        return `https://instagram.com/${url.replace(/^@/, '')}`;
      case 'github':
        return `https://github.com/${url.replace(/^@/, '')}`;
      case 'youtube':
        return `https://youtube.com/${url.startsWith('@') ? url : '@' + url}`;
      case 'linkedin':
        return `https://linkedin.com/in/${url.replace(/^@/, '')}`;
      case 'behance':
        return `https://behance.net/${url.replace(/^@/, '')}`;
      case 'dribbble':
        return `https://dribbble.com/${url.replace(/^@/, '')}`;
      case 'medium':
        return `https://medium.com/@${url.replace(/^@/, '')}`;
      default:
        return `https://${url}`;
    }
  },

  /**
   * Render Social Media Icons Row
   */
  renderSocialsRow(d, s) {
    if (!d.socials || !d.socials.length) return '';
    const activeSocials = d.socials.filter(item => item && item.enabled);
    if (!activeSocials.length) return '';

    const iconSize = Number(s.iconSize) || 18;
    const spacing = Number(s.iconSpacing) || 6;
    const styleType = s.iconStyle || 'brand';

    const cells = activeSocials.map((item, index) => {
      const meta = (typeof Icons !== 'undefined' && Icons.social[item.id]) ? Icons.social[item.id] : { name: item.id, color: '#2563EB', svg: '' };
      
      let fillColor = meta.color;
      let bgStyle = '';
      let paddingStyle = '';
      let borderStyle = '';

      if (styleType === 'brand') {
        if (s.isDarkModeActive && this.getLuminance(meta.color) < 0.35) {
          fillColor = '#F8FAFC';
        }
      } else if (styleType === 'accent') {
        fillColor = s.accentColor || '#2563EB';
      } else if (styleType === 'monochrome') {
        fillColor = s.isDarkModeActive ? '#CBD5E1' : (s.bodyColor || '#475569');
      } else if (styleType === 'pill') {
        fillColor = '#FFFFFF';
        bgStyle = `background-color: ${s.accentColor || '#2563EB'}; border-radius: 4px;`;
        paddingStyle = 'padding: 3px;';
        if (s.isDarkModeActive && this.getLuminance(s.accentColor) < 0.3) {
          borderStyle = 'border: 1px solid rgba(255, 255, 255, 0.2);';
        }
      } else if (styleType === 'circle') {
        fillColor = '#FFFFFF';
        bgStyle = `background-color: ${meta.color}; border-radius: 50%;`;
        paddingStyle = 'padding: 3px;';
        if (s.isDarkModeActive && this.getLuminance(meta.color) < 0.25) {
          borderStyle = 'border: 1px solid rgba(255, 255, 255, 0.25);';
        }
      }

      const dataUri = (typeof Icons !== 'undefined' && Icons.getIconDataUri) ? Icons.getIconDataUri(item.id, fillColor, iconSize) : '';
      const paddingRight = index === activeSocials.length - 1 ? '0' : `${spacing}px`;
      const imgClass = (styleType === 'brand' && this.getLuminance(meta.color) < 0.35) ? 'sig-dark-invert' : '';
      const targetUrl = this.formatSocialUrl(item.id, item.url);

      return `
<td nowrap="nowrap" align="center" valign="middle" width="${iconSize}" style="padding-right: ${paddingRight}; vertical-align: middle; width: ${iconSize}px; white-space: nowrap;">
  <a href="${targetUrl}" target="_blank" style="display: inline-block; text-decoration: none; border: 0; outline: none; ${bgStyle} ${paddingStyle} ${borderStyle}">
    <img src="${dataUri}" alt="${meta.name}" class="${imgClass}" width="${iconSize}" height="${iconSize}" border="0" style="display: block; border: 0; outline: none; width: ${iconSize}px; height: ${iconSize}px; max-width: ${iconSize}px; max-height: ${iconSize}px; image-rendering: -webkit-optimize-contrast;" />
  </a>
</td>
      `.trim();
    });

    return `
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; white-space: nowrap;">
  <tr nowrap="nowrap" style="white-space: nowrap;">
    ${cells.join('')}
  </tr>
</table>
`.trim();
  },

  /**
   * Render Static / Text Badge Chip
   */
  renderBadge(d, s) {
    if (!d.showBadge || !d.badgeText) return '';
    const badgeColor = s.accentColor || '#2563EB';
    return `
<span class="sig-dark-badge" style="display: inline-block; font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 1.5px 6px; border-radius: 3px; background-color: ${badgeColor}20; color: ${badgeColor}; border: 1px solid ${badgeColor}40; line-height: 1.2;">
  ${d.badgeText}
</span>
`.trim();
  },

  /**
   * Render Dynamic Status Badge with Pulse Indicator
   */
  renderStatusBadgeHtml(d, s) {
    const statusObj = d.statusBadge || {};
    const enabled = (d.showStatusBadge !== undefined) ? d.showStatusBadge : statusObj.enabled;
    const text = statusObj.text || d.statusText;
    if (!enabled || !text) return '';

    const dotColor = statusObj.color || '#10B981';

    return `
<table cellpadding="0" cellspacing="0" border="0" style="display: inline-table; border-collapse: collapse; margin-top: 2px;">
  <tr>
    <td valign="middle" style="background-color: ${dotColor}18; border: 1px solid ${dotColor}35; border-radius: 12px; padding: 2px 8px; font-size: 10px; font-weight: 600; color: ${s.isDarkModeActive ? '#F8FAFC' : '#1E293B'}; vertical-align: middle; line-height: 1.2;">
      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${dotColor}; margin-right: 5px; vertical-align: middle;"></span>
      <span style="vertical-align: middle;">${text}</span>
    </td>
  </tr>
</table>
`.trim();
  },

  /**
   * Render Meeting / Calendar Booking Button (Bulletproof table button)
   */
  renderBookingBadgeHtml(d, s) {
    const booking = d.bookingBadge || {};
    const enabled = (d.showBookingBadge !== undefined) ? d.showBookingBadge : booking.enabled;
    if (!enabled) return '';

    const provider = booking.provider || 'calendly';
    const label = booking.text || 'Schedule Meeting';
    const targetUrl = booking.url || 'https://calendly.com';
    const btnBg = s.accentColor || '#00DC82';
    const btnTextColor = this.getLuminance(btnBg) > 0.55 ? '#0F172A' : '#FFFFFF';

    return `
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 4px;">
  <tr>
    <td align="center" class="sig-dark-cta" style="background-color: ${btnBg}; border-radius: 4px; padding: 4px 10px;">
      <a href="${targetUrl}" target="_blank" style="font-family: ${s.fontFamily}; font-size: 11px; font-weight: 600; color: ${btnTextColor}; text-decoration: none; display: inline-block; line-height: 1.2;">
        📅 ${label}
      </a>
    </td>
  </tr>
</table>
`.trim();
  },

  /**
   * Render Embedded QR Code Contact Badge
   */
  renderQrCodeHtml(d, s) {
    const qr = d.qrCode || {};
    const enabled = (d.showQrCode !== undefined) ? d.showQrCode : qr.enabled;
    if (!enabled) return '';

    const qrSize = Number(qr.size) || 64;
    let qrDataUrl = qr.dataUrl;

    if (!qrDataUrl && typeof VCardEngine !== 'undefined') {
      qrDataUrl = VCardEngine.generateContactQrDataUrl(d, {
        targetMode: qr.targetMode || 'vcard',
        customUrl: qr.customUrl,
        size: qrSize * 2,
        color: s.isDarkModeActive ? '#00DC82' : (s.nameColor || '#0A0A0A')
      });
    }

    if (!qrDataUrl) return '';

    return `
<table cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse: collapse; text-align: center; margin-top: 4px;">
  <tr>
    <td align="center" style="background-color: #FFFFFF; padding: 3px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); width: ${qrSize}px;">
      <img src="${qrDataUrl}" alt="Contact QR Code" width="${qrSize}" height="${qrSize}" border="0" style="display: block; width: ${qrSize}px; height: ${qrSize}px; border: 0; outline: none; image-rendering: -webkit-optimize-contrast;" />
    </td>
  </tr>
  ${qr.showCaption ? `
  <tr>
    <td align="center" style="font-size: 8.5px; color: ${s.bodyColor}; opacity: 0.8; font-weight: 600; padding-top: 2px;">
      ${qr.caption || 'Scan for vCard'}
    </td>
  </tr>
  ` : ''}
</table>
`.trim();
  },

  /**
   * Render Call to Action Button
   */
  renderCtaButton(d, s) {
    if (!d.showCta || !d.ctaText) return '';
    const btnBg = s.accentColor || '#2563EB';
    const btnTextColor = this.getLuminance(btnBg) > 0.55 ? '#0F172A' : '#FFFFFF';
    return `
<table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-top: 4px;">
  <tr>
    <td align="center" class="sig-dark-cta" style="background-color: ${btnBg}; border-radius: 4px; padding: 5px 12px;">
      <a href="${d.ctaUrl || '#'}" target="_blank" style="font-family: ${s.fontFamily}; font-size: 11.5px; font-weight: 600; color: ${btnTextColor}; text-decoration: none; display: inline-block; line-height: 1.2;">
        ${d.ctaText}
      </a>
    </td>
  </tr>
</table>
`.trim();
  },

  /**
   * Render Promotional Campaign Banner
   */
  renderPromoBanner(d, s) {
    if (!d.promoBanner || !d.promoBanner.enabled || !d.promoBanner.imageUrl) return '';
    const banner = d.promoBanner;
    const bannerImg = `<img src="${banner.imageUrl}" alt="${banner.alt || 'Promotional Banner'}" width="420" border="0" style="display: block; width: 100%; max-width: 420px; height: auto; border-radius: 6px; border: 0; outline: none; text-decoration: none;" />`;

    if (banner.targetUrl) {
      return `<a href="${banner.targetUrl}" target="_blank" style="display: block; text-decoration: none; border: 0;">${bannerImg}</a>`;
    }
    return bannerImg;
  },

  /**
   * Render Environmental & Legal Disclaimers
   */
  renderDisclaimers(d, s) {
    const blocks = [];
    if (d.showGreenNote && d.greenNoteText) {
      const ecoColor = s.greenNoteColor || (s.isDarkModeActive ? '#4ADE80' : '#15803D');
      blocks.push(`
<div style="font-size: 11px; color: ${ecoColor}; line-height: 1.3; padding-bottom: 4px;">
  [Eco Note] ${d.greenNoteText}
</div>
      `.trim());
    }
    if (d.showDisclaimer && d.disclaimerText) {
      const discColor = s.disclaimerColor || (s.isDarkModeActive ? '#94A3B8' : '#94A3B8');
      blocks.push(`
<div class="sig-dark-disclaimer" style="font-size: 10.5px; color: ${discColor}; line-height: 1.3; font-style: italic;">
  ${d.disclaimerText}
</div>
      `.trim());
    }
    return blocks.join('');
  },

  /**
   * Render Inspirational Quote Block
   */
  renderQuote(d, s) {
    if (!d.showQuote || !d.quoteText || !d.quoteText.trim()) return '';
    const quoteBorderColor = s.dividerColor || s.accentColor || '#00DC82';
    const quoteTextColor = s.quoteColor || (s.isDarkModeActive ? '#D4D4D8' : '#475569');
    if (typeof Quotes !== 'undefined' && Quotes.renderQuoteHtml) {
      return Quotes.renderQuoteHtml(d.quoteText, quoteBorderColor, s.isDarkModeActive, s.fontFamily, quoteTextColor);
    }
    return `
<table cellpadding="0" cellspacing="0" border="0" class="sig-quote-table" style="border-collapse: collapse; margin-top: 8px; max-width: 480px; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <td class="sig-dark-quote" style="border-left: 2px solid ${quoteBorderColor}; padding-left: 10px; font-family: ${s.fontFamily || 'sans-serif'}; font-size: 11px; font-style: italic; color: ${quoteTextColor}; line-height: 1.4; vertical-align: top;">
      &ldquo;${d.quoteText}&rdquo;
    </td>
  </tr>
</table>
    `.trim();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SignatureEngine;
}
