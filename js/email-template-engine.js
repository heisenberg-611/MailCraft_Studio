/**
 * Full Responsive Email Template Builder Engine
 * Generates email-client compatible HTML newsletters & outreach templates
 * Seamlessly integrates the High-Definition signature with Auto Dark Mode
 * Zero emojis
 */

const EmailTemplateEngine = {
  /**
   * Render complete HTML email
   * @param {Object} templateData - Body text, subject, CTA
   * @param {Object} signatureData - Signature contact info
   * @param {Object} signatureSettings - Design settings
   * @param {boolean} isDark - Explicit dark rendering (for Dark Inbox simulator)
   * @param {boolean} isExport - Whether rendering for clipboard / export (includes @media CSS)
   */
  generateFullEmail(templateData, signatureData, signatureSettings, isDark = false, isExport = true) {
    const t = Object.assign({
      title: 'Project Update',
      preheader: 'Important updates and project collaboration overview',
      headerLogoText: 'PORTFOLIO & RESEARCH',
      greeting: 'Dear Colleague,',
      paragraphs: [
        'I hope this email finds you well.',
        'Here is a summary of our recent work and engineering progress.'
      ],
      highlightBox: {
        enabled: false,
        title: 'Key Highlights',
        content: ''
      },
      ctaText: 'View Project Details',
      ctaUrl: 'https://www.dhrubojyoti.dev',
      showCta: true,
      closing: 'Best regards,',
      footerNote: ''
    }, templateData);

    const defaultSettings = (typeof Presets !== 'undefined' && Presets.styles && Presets.styles.dhrubojyoti) ? Presets.styles.dhrubojyoti.settings : {};
    const s = Object.assign({}, defaultSettings, signatureSettings);
    const signatureHtml = typeof SignatureEngine !== 'undefined' ? SignatureEngine.generateHtml(signatureData, signatureSettings, isDark, isExport) : '';

    const baseAccentColor = s.accentColor || '#2563EB';
    const accentColor = isDark ? SignatureEngine.adjustColorForDark(baseAccentColor, 'accent') : baseAccentColor;
    const fontFamily = s.fontFamily || "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    // Theme color tokens
    const bodyBg = isDark ? '#090D16' : '#F1F5F9';
    const cardBg = isDark ? '#0F172A' : '#FFFFFF';
    const cardBorder = isDark ? '1px solid #334155' : '1px solid #E2E8F0';
    const defaultTextColor = isDark ? '#CBD5E1' : '#334155';
    const defaultTitleColor = isDark ? '#F8FAFC' : '#0F172A';
    const defaultFooterText = isDark ? '#94A3B8' : '#64748B';

    // Granular User-Configurable Colors
    const headerTextColor = t.headerTextColor || '#FFFFFF';
    const headerBgColor = t.headerBgColor || '#0F172A';
    const emailGreetingColor = isDark ? (t.greetingColor ? SignatureEngine.adjustColorForDark(t.greetingColor, 'name') : defaultTitleColor) : (t.greetingColor || defaultTitleColor);
    const emailBodyColor = isDark ? (t.bodyColor ? SignatureEngine.adjustColorForDark(t.bodyColor, 'body') : defaultTextColor) : (t.bodyColor || defaultTextColor);
    const emailClosingColor = isDark ? (t.closingColor ? SignatureEngine.adjustColorForDark(t.closingColor, 'body') : defaultFooterText) : (t.closingColor || defaultFooterText);
    const emailFooterColor = isDark ? (t.footerTextColor ? SignatureEngine.adjustColorForDark(t.footerTextColor, 'body') : defaultFooterText) : (t.footerTextColor || defaultFooterText);
    
    const highlightTitleColor = isDark ? (t.highlightTitleColor ? SignatureEngine.adjustColorForDark(t.highlightTitleColor, 'accent') : accentColor) : (t.highlightTitleColor || accentColor);
    const highlightTextColor = isDark ? (t.highlightTextColor ? SignatureEngine.adjustColorForDark(t.highlightTextColor, 'body') : emailBodyColor) : (t.highlightTextColor || emailBodyColor);
    const highlightBgColor = isDark ? '#1E293B' : (t.highlightBgColor || '#F8FAFC');
    const highlightBorder = isDark ? '1px solid #334155' : '1px solid #E2E8F0';

    const ctaBgColor = isDark ? (t.ctaBgColor ? SignatureEngine.adjustColorForDark(t.ctaBgColor, 'accent') : accentColor) : (t.ctaBgColor || accentColor);
    const ctaTextColor = t.ctaTextColor || (SignatureEngine.getLuminance(ctaBgColor) > 0.55 ? '#0F172A' : '#FFFFFF');
    const footerBg = isDark ? '#0B1120' : '#F8FAFC';

    // Format paragraphs
    const paragraphsHtml = (t.paragraphs || []).map(p => {
      if (p.includes('\n- ') || p.startsWith('- ')) {
        const items = p.split('\n').filter(line => line.trim().length > 0).map(line => {
          const cleanLine = line.replace(/^-\s*/, '');
          return `<li style="margin-bottom: 6px; color: ${emailBodyColor};">${cleanLine}</li>`;
        }).join('');
        return `<ul class="email-text-body" style="margin: 12px 0 16px 20px; padding: 0; font-size: 14px; line-height: 1.6; color: ${emailBodyColor};">${items}</ul>`;
      }
      return `<p class="email-text-body" style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: ${emailBodyColor};">${p}</p>`;
    }).join('');

    // Format highlight box
    let highlightHtml = '';
    if (t.highlightBox && t.highlightBox.enabled && t.highlightBox.content && t.highlightBox.content.trim().length > 0) {
      const items = (t.highlightBox.content || '').split('\n').filter(l => l.trim()).map(line => {
        const clean = line.replace(/^-\s*/, '');
        return `<div class="email-text-body" style="padding: 3px 0; font-size: 13.5px; color: ${highlightTextColor};">&bull; ${clean}</div>`;
      }).join('');

      highlightHtml = `
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 18px 0; border-collapse: collapse;">
        <tr>
          <td class="email-highlight-box" style="background-color: ${highlightBgColor}; border: ${highlightBorder}; border-left: 4px solid ${highlightTitleColor}; border-radius: 6px; padding: 14px 18px;">
            <div class="email-highlight-title" style="font-size: 13.5px; font-weight: 700; color: ${highlightTitleColor}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ${t.highlightBox.title || 'Key Highlights'}
            </div>
            ${items}
          </td>
        </tr>
      </table>
      `.trim();
    }

    // Format CTA Button
    let ctaHtml = '';
    if (t.showCta && t.ctaText) {
      ctaHtml = `
      <table cellpadding="0" cellspacing="0" border="0" style="margin: 22px 0 24px 0; border-collapse: collapse;">
        <tr>
          <td align="center" class="email-cta-btn" style="background-color: ${ctaBgColor}; border-radius: 6px; padding: 10px 22px;">
            <a href="${t.ctaUrl || '#'}" target="_blank" style="font-family: ${fontFamily}; font-size: 14px; font-weight: 600; color: ${ctaTextColor}; text-decoration: none; display: inline-block;">
              ${t.ctaText}
            </a>
          </td>
        </tr>
      </table>
      `.trim();
    }

    const darkAccentForCss = SignatureEngine.adjustColorForDark(baseAccentColor, 'accent');
    const darkCtaTextForCss = SignatureEngine.getLuminance(darkAccentForCss) > 0.55 ? '#0F172A' : '#FFFFFF';

    const embeddedStyles = isExport ? `
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    @media (prefers-color-scheme: dark) {
      .email-wrapper-bg { background-color: #090D16 !important; }
      .email-card-bg { background-color: #0F172A !important; border-color: #334155 !important; }
      .email-text-title { color: #F8FAFC !important; }
      .email-text-body { color: #CBD5E1 !important; }
      .email-highlight-box { background-color: #1E293B !important; border-color: #334155 !important; border-left-color: ${darkAccentForCss} !important; }
      .email-highlight-title { color: ${darkAccentForCss} !important; }
      .email-cta-btn { background-color: ${darkAccentForCss} !important; }
      .email-cta-btn a { color: ${darkCtaTextForCss} !important; }
      .email-footer-bg { background-color: #0B1120 !important; border-color: #334155 !important; }
    }
    [data-ogsc] .email-wrapper-bg { background-color: #090D16 !important; }
    [data-ogsc] .email-card-bg { background-color: #0F172A !important; border-color: #334155 !important; }
    [data-ogsc] .email-text-title { color: #F8FAFC !important; }
    [data-ogsc] .email-text-body { color: #CBD5E1 !important; }
    [data-ogsc] .email-highlight-box { background-color: #1E293B !important; }
    [data-ogsc] .email-highlight-title { color: ${darkAccentForCss} !important; }
    [data-ogsc] .email-cta-btn { background-color: ${darkAccentForCss} !important; }
  </style>
` : '';

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${t.title || 'Email Message'}</title>${embeddedStyles}
</head>
<body style="margin: 0; padding: 0; background-color: ${bodyBg}; font-family: ${fontFamily}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  
  <!-- Preheader text -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${t.preheader || ''}
  </div>

  <!-- Email Wrapper Container -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper-bg" style="background-color: ${bodyBg}; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (Max 600px standard email width) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-card-bg" style="max-width: 600px; background-color: ${cardBg}; border-radius: 8px; border: ${cardBorder}; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15); border-collapse: collapse;">
          
          <!-- Brand Header Bar -->
          <tr>
            <td style="background-color: ${headerBgColor}; padding: 18px 28px; border-bottom: 3px solid ${accentColor};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-family: ${fontFamily}; font-size: 13px; font-weight: 700; color: ${headerTextColor}; letter-spacing: 1px; text-transform: uppercase;">
                      ${t.headerLogoText || 'Dhrubojyoti Saha'}
                    </span>
                  </td>
                  ${(t.headerTag && t.headerTag.trim()) ? `
                  <td align="right">
                    <span style="font-size: 11px; color: #94A3B8; letter-spacing: 0.5px;">
                      ${t.headerTag}
                    </span>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; font-family: ${fontFamily}; color: ${emailBodyColor};">
              
              <!-- Salutation -->
              <div class="email-text-title" style="font-size: 16px; font-weight: 600; color: ${emailGreetingColor}; margin-bottom: 16px;">
                ${t.greeting || 'Hello,'}
              </div>

              <!-- Paragraphs -->
              ${paragraphsHtml}

              <!-- Highlights Box -->
              ${highlightHtml}

              <!-- Call to Action -->
              ${ctaHtml}

              <!-- Closing -->
              <div style="font-size: 14px; color: ${emailClosingColor}; margin-top: 20px; margin-bottom: 18px;">
                ${t.closing || 'Best regards,'}
              </div>

              <!-- Embedded Email Signature -->
              <div style="padding-top: 12px; border-top: 1px dashed ${isDark ? '#334155' : '#CBD5E1'};">
                ${signatureHtml}
              </div>

            </td>
          </tr>

          <!-- Footer Bar -->
          ${(t.footerNote && t.footerNote.trim()) ? `
          <tr>
            <td class="email-footer-bg" style="background-color: ${footerBg}; padding: 16px 28px; border-top: ${cardBorder}; text-align: center;">
              <div style="font-size: 11px; color: ${emailFooterColor}; line-height: 1.5;">
                ${t.footerNote}
              </div>
            </td>
          </tr>
          ` : ''}

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `.trim();
  },

  /**
   * Method alias for App.js compatibility
   */
  generateEmailHtml(templateData, signatureData, signatureSettings, isDark = false, isExport = true) {
    return this.generateFullEmail(templateData, signatureData, signatureSettings, isDark, isExport);
  }
};

// Universal environment exports
if (typeof window !== 'undefined') {
  window.EmailTemplateEngine = EmailTemplateEngine;
}
if (typeof globalThis !== 'undefined') {
  globalThis.EmailTemplateEngine = EmailTemplateEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmailTemplateEngine;
}
