/**
 * Email-Safe HTML Signature Generation Engine
 * Produces rock-solid nested <table> HTML with inline CSS
 * Automatic Dark Mode Adaptation & High-DPI Retina image support
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
   * Helper: Calculate WCAG contrast ratio between two colors (1 to 21)
   */
  getContrastRatio(hex1, hex2) {
    const l1 = this.getLuminance(hex1);
    const l2 = this.getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Intelligently transform any color for Dark Mode
   * Preserves brand hue if saturated, or maps to crisp neutral slate if gray/black
   */
  adjustColorForDark(color, role = 'body') {
    if (!color) return '#CBD5E1';
    const lum = this.getLuminance(color);
    const { r, g, b } = this.hexToRgb(color);
    const { h, s, l } = this.rgbToHsl(r, g, b);

    // If color is already very bright (luminance > 0.65), keep it
    if (lum >= 0.65 && role !== 'name') return color;

    // Check if color is neutral (grayscale / black / dark charcoal / dark slate)
    const isNeutral = s < 0.25 || l < 0.15 || (Math.max(r, g, b) - Math.min(r, g, b) < 32);

    switch (role) {
      case 'name':
        // Primary title/name needs maximum contrast
        if (isNeutral) return '#F8FAFC';
        // Saturated hue: boost lightness to 0.78-0.85
        return this.hslToHex(h, Math.max(s, 0.75), 0.82);

      case 'title':
        // Secondary title / role
        if (isNeutral || s < 0.35) return '#94A3B8';
        return this.hslToHex(h, Math.max(s, 0.65), 0.72);

      case 'body':
        // General text
        if (isNeutral || s < 0.35) return '#CBD5E1';
        return this.hslToHex(h, Math.min(s, 0.5), 0.78);

      case 'label':
        // Contact prefixes (M:, E:, Tel:)
        if (isNeutral) return '#93C5FD';
        return this.hslToHex(h, Math.max(s, 0.7), 0.75);

      case 'link':
      case 'accent':
      case 'divider':
        // Luminous accent color (vivid on dark background #0F172A)
        if (isNeutral) return '#60A5FA';
        // Boost lightness to 0.60-0.68 and saturation to 0.85-0.95
        return this.hslToHex(h, Math.max(s, 0.85), Math.max(0.62, Math.min(0.72, l + 0.25)));

      case 'cardBorder':
        return '#334155';

      default:
        if (isNeutral) return '#E2E8F0';
        return this.hslToHex(h, s, 0.75);
    }
  },

  /**
   * Helper: Convert HSL values directly to Hex string
   */
  hslToHex(h, s, l) {
    const { r, g, b } = this.hslToRgb(h, s, l);
    return this.rgbToHex(r, g, b);
  },

  /**
   * Main render function that returns email-safe HTML string
   * with automatic dark mode contrast adjustments
   * @param {Object} data - Profile data
   * @param {Object} settings - Design settings
   * @param {boolean} isDark - Explicit dark rendering (for Dark Inbox simulator)
   * @param {boolean} isExport - Whether rendering for clipboard / export (includes @media CSS)
   */
  generateHtml(data, settings, isDark = false, isExport = true) {
    const rawSettings = Object.assign({}, Presets.styles.dhrubojyoti.settings, settings);
    const d = Object.assign({}, Presets.defaultData, data);
    const s = Object.assign({}, rawSettings);

    // Compute dynamic dark mode colors for this specific signature
    const darkColors = {
      name: this.adjustColorForDark(s.nameColor, 'name'),
      title: this.adjustColorForDark(s.titleColor, 'title'),
      body: this.adjustColorForDark(s.bodyColor, 'body'),
      label: this.adjustColorForDark(s.labelColor, 'label'),
      link: this.adjustColorForDark(s.linkColor || s.accentColor, 'link'),
      accent: this.adjustColorForDark(s.accentColor, 'accent'),
      divider: this.adjustColorForDark(s.dividerColor || s.accentColor, 'divider'),
      avatarBorder: this.adjustColorForDark(s.avatarBorderColor || s.accentColor, 'accent')
    };

    // Auto-adjust active inline colors if explicitly rendering in Dark Mode view
    if (isDark) {
      s.nameColor = darkColors.name;
      s.titleColor = darkColors.title;
      s.bodyColor = darkColors.body;
      s.labelColor = darkColors.label;
      s.linkColor = darkColors.link;
      s.accentColor = darkColors.accent;
      s.dividerColor = darkColors.divider;
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
      case 'vertical-divider':
      default:
        renderedHtml = this.renderVerticalDivider(d, s);
        break;
    }

    // When rendering for export, embed responsive device-theme stylesheet
    // In live simulator preview (isExport = false), omit to prevent OS dark mode bleed into Day preview
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
    .sig-dark-divider { border-color: ${darkColors.divider} !important; }
    .sig-dark-card { background-color: #0F172A !important; border-color: #334155 !important; border-left-color: ${darkColors.accent} !important; }
    .sig-dark-border { border-color: #334155 !important; }
    .sig-dark-badge { background-color: ${darkColors.accent}25 !important; color: ${darkColors.accent} !important; border-color: ${darkColors.accent}45 !important; }
    .sig-dark-cta { background-color: ${darkColors.accent} !important; color: ${ctaDarkText} !important; }
    .sig-dark-avatar { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.25)) !important; }
    .sig-dark-invert { filter: brightness(0) invert(1) !important; }
  }
  [data-ogsc] .sig-dark-name { color: ${darkColors.name} !important; }
  [data-ogsc] .sig-dark-title { color: ${darkColors.title} !important; }
  [data-ogsc] .sig-dark-body { color: ${darkColors.body} !important; }
  [data-ogsc] .sig-dark-label { color: ${darkColors.label} !important; }
  [data-ogsc] .sig-dark-link { color: ${darkColors.link} !important; }
  [data-ogsc] .sig-dark-divider { border-color: ${darkColors.divider} !important; }
  [data-ogsc] .sig-dark-card { background-color: #0F172A !important; border-color: #334155 !important; }
  [data-ogsc] .sig-dark-badge { background-color: ${darkColors.accent}25 !important; color: ${darkColors.accent} !important; }
  [data-ogsc] .sig-dark-cta { background-color: ${darkColors.accent} !important; color: ${ctaDarkText} !important; }
  [data-ogsc] .sig-dark-invert { filter: brightness(0) invert(1) !important; }
</style>
`.trim();

    return darkModeStyles + '\n' + renderedHtml;
  },

  /**
   * Template 1: Vertical Divider (Reference Design)
   */
  renderVerticalDivider(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    const dividerBorder = `${s.dividerThickness || 2}px ${s.dividerStyle || 'solid'} ${s.dividerColor || s.accentColor || '#2563EB'}`;

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <td valign="top" style="padding: 0; vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
        <tr>
          ${avatarHtml ? `
          <!-- Avatar Column -->
          <td valign="top" style="padding-right: 14px; vertical-align: top; width: ${s.avatarSize || 85}px;">
            ${avatarHtml}
          </td>
          ` : ''}

          <!-- Vertical Divider Bar -->
          <td valign="top" class="sig-divider" style="width: 1px; border-left: ${dividerBorder}; padding: 0; font-size: 1px; line-height: 1px; vertical-align: top;">
            &nbsp;
          </td>

          <!-- Details Column -->
          <td valign="top" style="padding-left: 14px; vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
              <!-- Name & Title -->
              <tr>
                <td valign="top" style="padding-bottom: 4px; vertical-align: top;">
                  <div class="sig-dark-name" style="font-size: ${s.nameFontSize || 17}px; font-weight: ${s.nameFontWeight || 'bold'}; color: ${s.nameColor}; line-height: 1.25; letter-spacing: -0.2px;">
                    ${d.fullName}
                  </div>
                  ${d.jobTitle ? `
                  <div class="sig-dark-title" style="font-size: ${s.titleFontSize || 13}px; color: ${s.titleColor}; line-height: 1.35; padding-top: 2px; font-weight: 500;">
                    ${d.jobTitle}${d.company ? ` &bull; ${d.company}` : ''}
                  </div>
                  ` : ''}
                  ${badgeHtml ? `<div style="padding-top: 3px;">${badgeHtml}</div>` : ''}
                </td>
              </tr>

              <!-- Contact Rows -->
              ${textDetailsHtml ? `
              <tr>
                <td valign="top" style="padding-bottom: 5px; line-height: 1.35; vertical-align: top;">
                  ${textDetailsHtml}
                </td>
              </tr>
              ` : ''}

              <!-- Social Links -->
              ${socialIconsHtml ? `
              <tr>
                <td valign="top" style="padding-top: 2px; vertical-align: top;">
                  ${socialIconsHtml}
                </td>
              </tr>
              ` : ''}

              <!-- CTA Button -->
              ${ctaHtml ? `
              <tr>
                <td valign="top" style="padding-top: 6px; vertical-align: top;">
                  ${ctaHtml}
                </td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Disclaimers & Notes -->
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
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    const dividerBorder = `${s.dividerThickness || 2}px ${s.dividerStyle || 'solid'} ${s.dividerColor || s.accentColor || '#2563EB'}`;

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; max-width: 480px;">
  <tr>
    <td valign="top" style="padding: 0; vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;">
        <tr>
          ${avatarHtml ? `
          <td valign="top" style="padding-right: 14px; width: ${s.avatarSize || 85}px; vertical-align: top;">
            ${avatarHtml}
          </td>
          ` : ''}
          <td valign="top" style="vertical-align: top;">
            <div class="sig-dark-name" style="font-size: ${s.nameFontSize || 17}px; font-weight: ${s.nameFontWeight || 'bold'}; color: ${s.nameColor}; line-height: 1.25;">
              ${d.fullName}
            </div>
            <div class="sig-dark-title" style="font-size: ${s.titleFontSize || 13}px; color: ${s.titleColor}; line-height: 1.35; padding-top: 2px;">
              ${d.jobTitle}${d.company ? ` &bull; ${d.company}` : ''}
            </div>
            ${badgeHtml ? `<div style="padding-top: 3px;">${badgeHtml}</div>` : ''}
          </td>
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

  <!-- Details and Social Row -->
  <tr>
    <td valign="top" style="padding-top: 6px; vertical-align: top;">
      ${textDetailsHtml}
      ${socialIconsHtml ? `<div style="padding-top: 6px;">${socialIconsHtml}</div>` : ''}
      ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
    </td>
  </tr>

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
   * Template 3: Two-Column Clean Grid
   */
  renderTwoColumn(d, s) {
    const avatarHtml = this.renderAvatarHtml(d, s);
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);
    const innerBorder = s.isDarkModeActive ? '1px solid #334155' : '1px solid #E2E8F0';

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <td valign="top" style="padding: 0; vertical-align: top;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        <tr>
          <!-- Column 1: Profile & Socials -->
          <td valign="top" style="padding-right: 18px; vertical-align: top;">
            ${avatarHtml ? `<div style="margin-bottom: 8px;">${avatarHtml}</div>` : ''}
            <div class="sig-dark-name" style="font-size: ${s.nameFontSize || 17}px; font-weight: ${s.nameFontWeight || 'bold'}; color: ${s.nameColor}; line-height: 1.25;">
              ${d.fullName}
            </div>
            <div class="sig-dark-title" style="font-size: ${s.titleFontSize || 13}px; color: ${s.titleColor}; line-height: 1.35; padding-top: 2px;">
              ${d.jobTitle}
            </div>
            ${d.company ? `<div class="sig-dark-title" style="font-size: ${s.titleFontSize - 1}px; color: ${s.titleColor};">${d.company}</div>` : ''}
            ${badgeHtml ? `<div style="padding-top: 3px;">${badgeHtml}</div>` : ''}
            ${socialIconsHtml ? `<div style="padding-top: 8px;">${socialIconsHtml}</div>` : ''}
          </td>

          <!-- Column 2: Contact Details -->
          <td valign="top" class="sig-dark-border" style="padding-left: 16px; border-left: ${innerBorder}; vertical-align: top;">
            ${textDetailsHtml}
            ${ctaHtml ? `<div style="padding-top: 8px;">${ctaHtml}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
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
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const badgeHtml = this.renderBadge(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    const cardBg = s.isDarkModeActive ? '#0F172A' : '#FFFFFF';
    const cardBorder = s.isDarkModeActive ? '1px solid #334155' : '1px solid #E2E8F0';

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; max-width: 480px;">
  <tr>
    <td class="sig-dark-card" style="border: ${cardBorder}; border-left: 3.5px solid ${s.accentColor || '#2563EB'}; border-radius: 6px; padding: 12px 14px; background-color: ${cardBg};">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
        <tr>
          ${avatarHtml ? `
          <td valign="top" style="padding-right: 14px; width: ${s.avatarSize || 85}px; vertical-align: top;">
            ${avatarHtml}
          </td>
          ` : ''}
          <td valign="top" style="vertical-align: top;">
            <div class="sig-dark-name" style="font-size: ${s.nameFontSize || 17}px; font-weight: ${s.nameFontWeight || 'bold'}; color: ${s.nameColor}; line-height: 1.25;">
              ${d.fullName}
            </div>
            <div class="sig-dark-title" style="font-size: ${s.titleFontSize || 13}px; color: ${s.titleColor}; line-height: 1.35; padding-top: 2px;">
              ${d.jobTitle}${d.company ? ` | ${d.company}` : ''}
            </div>
            ${badgeHtml ? `<div style="padding-top: 3px;">${badgeHtml}</div>` : ''}
            <div style="padding-top: 6px;">
              ${textDetailsHtml}
            </div>
            ${socialIconsHtml ? `<div style="padding-top: 6px;">${socialIconsHtml}</div>` : ''}
            ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
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
    const textDetailsHtml = this.renderDetailsBlock(d, s);
    const socialIconsHtml = this.renderSocialsRow(d, s);
    const ctaHtml = this.renderCtaButton(d, s);
    const disclaimerHtml = this.renderDisclaimers(d, s);

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    <td valign="top" style="vertical-align: top;">
      ${avatarHtml ? `<div style="margin-bottom: 6px;">${avatarHtml}</div>` : ''}
      <div class="sig-dark-name" style="font-size: ${s.nameFontSize || 17}px; font-weight: ${s.nameFontWeight || 'bold'}; color: ${s.nameColor}; line-height: 1.25;">
        ${d.fullName}
      </div>
      <div class="sig-dark-title" style="font-size: ${s.titleFontSize || 13}px; color: ${s.titleColor}; padding-top: 2px; padding-bottom: 4px;">
        ${d.jobTitle}${d.company ? ` &bull; ${d.company}` : ''}
      </div>
      ${textDetailsHtml}
      ${socialIconsHtml ? `<div style="padding-top: 6px;">${socialIconsHtml}</div>` : ''}
      ${ctaHtml ? `<div style="padding-top: 6px;">${ctaHtml}</div>` : ''}
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

    return `
<!-- Email Signature Start -->
<table cellpadding="0" cellspacing="0" border="0" class="sig-table" style="margin: 0; padding: 0; font-family: ${s.fontFamily}; font-size: ${s.bodyFontSize}px; line-height: 1.35; color: ${s.bodyColor}; background-color: transparent; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
  <tr>
    ${avatarHtml ? `<td valign="middle" style="padding-right: 10px;">${avatarHtml}</td>` : ''}
    <td valign="middle">
      <span class="sig-dark-name" style="font-size: ${s.nameFontSize || 17}px; font-weight: bold; color: ${s.nameColor};">${d.fullName}</span>
      <span style="color: #94A3B8; margin: 0 4px;">|</span>
      <span class="sig-dark-title" style="color: ${s.titleColor};">${d.jobTitle}${d.company ? `, ${d.company}` : ''}</span>
      <div class="sig-dark-body" style="font-size: ${s.bodyFontSize - 1}px; color: ${s.bodyColor}; padding-top: 2px;">
        ${d.phone ? `<span>${s.labelPhone || 'M:'} <a href="tel:${d.phone.replace(/[^0-9+]/g, '')}" style="color: ${s.linkColor}; text-decoration: none;">${d.phone}</a></span>` : ''}
        ${d.email ? `<span style="color: #CBD5E1; margin: 0 4px;">&bull;</span><span>${s.labelEmail || 'E:'} <a href="mailto:${d.email}" style="color: ${s.linkColor}; text-decoration: none;">${d.email}</a></span>` : ''}
        ${d.website ? `<span style="color: #CBD5E1; margin: 0 4px;">&bull;</span><a href="https://${d.website.replace(/^https?:\/\//, '')}" style="color: ${s.linkColor}; text-decoration: none;">${d.website}</a>` : ''}
      </div>
      ${socialIconsHtml ? `<div style="padding-top: 4px;">${socialIconsHtml}</div>` : ''}
    </td>
  </tr>
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
    else if (s.avatarShape === 'squircle') borderRadius = '24%';
    else if (s.avatarShape === 'rounded') borderRadius = '12%';

    const borderWidth = Number(s.avatarBorderWidth) || 0;
    const borderCss = borderWidth > 0 ? `border: ${borderWidth}px solid ${s.avatarBorderColor || '#2563EB'};` : 'border: 0;';
    const darkGlow = s.isDarkModeActive ? 'filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.25));' : '';

    return `
<img src="${src}" alt="${d.fullName}" class="sig-dark-avatar" width="${size}" height="${size}" border="0" style="display: block; width: ${size}px; height: ${size}px; max-width: ${size}px; max-height: ${size}px; border-radius: ${borderRadius}; ${borderCss} ${darkGlow} outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; image-rendering: -webkit-optimize-contrast;" />
`.trim();
  },

  /**
   * Render Text Details Block (Phone, Email, Web, Address)
   */
  renderDetailsBlock(d, s) {
    const rows = [];
    const labelStyle = `font-weight: 700; color: ${s.labelColor || '#475569'}; margin-right: 4px;`;
    const linkStyle = `color: ${s.linkColor || '#2563EB'}; text-decoration: none;`;

    // Phone
    if (d.phone) {
      const label = s.showLabels !== false ? `<span class="sig-dark-label" style="${labelStyle}">${s.labelPhone || 'M:'}</span> ` : '';
      rows.push(`<div style="line-height: 1.35; padding-bottom: 2px;">${label}<a href="tel:${d.phone.replace(/[^0-9+]/g, '')}" class="sig-dark-link" style="${linkStyle}">${d.phone}</a></div>`);
    }

    // Email & Website line
    const emailPart = d.email ? (s.showLabels !== false ? `<span class="sig-dark-label" style="${labelStyle}">${s.labelEmail || 'E:'}</span> ` : '') + `<a href="mailto:${d.email}" class="sig-dark-link" style="${linkStyle}">${d.email}</a>` : '';
    const webPart = d.website ? `<a href="https://${d.website.replace(/^https?:\/\//, '')}" class="sig-dark-link" style="${linkStyle}">${d.website}</a>` : '';

    if (emailPart && webPart) {
      rows.push(`<div style="line-height: 1.35; padding-bottom: 2px;">${emailPart} <span style="color: #94A3B8; margin: 0 4px;">|</span> ${webPart}</div>`);
    } else if (emailPart) {
      rows.push(`<div style="line-height: 1.35; padding-bottom: 2px;">${emailPart}</div>`);
    } else if (webPart) {
      rows.push(`<div style="line-height: 1.35; padding-bottom: 2px;">${webPart}</div>`);
    }

    // Address & Country
    if (d.address) {
      const fullAddress = d.country ? `${d.address} <span style="color: #94A3B8; margin: 0 4px;">|</span> ${d.country}` : d.address;
      rows.push(`<div class="sig-dark-body" style="color: ${s.bodyColor}; font-size: ${s.bodyFontSize - 0.5}px; line-height: 1.35;">${fullAddress}</div>`);
    }

    return rows.join('');
  },

  /**
   * Render Social Media Icons Row
   */
  renderSocialsRow(d, s) {
    if (!d.socials || !d.socials.length) return '';
    const activeSocials = d.socials.filter(item => item.enabled && item.url);
    if (!activeSocials.length) return '';

    const iconSize = Number(s.iconSize) || 18;
    const spacing = Number(s.iconSpacing) || 6;
    const styleType = s.iconStyle || 'brand';

    const cells = activeSocials.map((item, index) => {
      const meta = Icons.social[item.id] || { name: item.id, color: '#2563EB', svg: '' };
      
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

      // High-DPI PNG Data URI with Canvas fallback
      const dataUri = Icons.getIconDataUri(item.id, fillColor, iconSize);
      const paddingRight = index === activeSocials.length - 1 ? '0' : `${spacing}px`;
      const imgClass = (styleType === 'brand' && this.getLuminance(meta.color) < 0.35) ? 'sig-dark-invert' : '';

      return `
<td nowrap="nowrap" align="center" valign="middle" width="${iconSize}" style="padding-right: ${paddingRight}; vertical-align: middle; width: ${iconSize}px; white-space: nowrap;">
  <a href="${item.url}" target="_blank" style="display: inline-block; text-decoration: none; border: 0; outline: none; ${bgStyle} ${paddingStyle} ${borderStyle}">
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
   * Render Status Badge
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
   * Render Environmental & Legal Disclaimers
   */
  renderDisclaimers(d, s) {
    const blocks = [];
    if (d.showGreenNote && d.greenNoteText) {
      blocks.push(`
<div style="font-size: 11px; color: ${s.isDarkModeActive ? '#4ADE80' : '#15803D'}; line-height: 1.3; padding-bottom: 4px;">
  [Eco Note] ${d.greenNoteText}
</div>
      `.trim());
    }
    if (d.showDisclaimer && d.disclaimerText) {
      blocks.push(`
<div class="sig-dark-body" style="font-size: 10.5px; color: #94A3B8; line-height: 1.3; font-style: italic;">
  ${d.disclaimerText}
</div>
      `.trim());
    }
    return blocks.join('');
  }
};
