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
        enabled: true,
        title: 'Key Highlights',
        content: '- High-Definition Retina graphics (2x, 3x, 4x DPI)\n- 100% in-browser generation with zero backend dependencies\n- Seamless 1-click clipboard paste into Gmail and Outlook'
      },
      ctaText: 'View Project Details',
      ctaUrl: 'https://www.dhrubojyoti.dev',
      showCta: true,
      closing: 'Best regards,',
      footerNote: 'Sent from Dhrubojyoti Saha Portfolio Systems | Dhaka, Bangladesh'
    }, templateData);

    const s = Object.assign({}, Presets.styles.dhrubojyoti.settings, signatureSettings);
    const signatureHtml = SignatureEngine.generateHtml(signatureData, signatureSettings, isDark, isExport);

    const baseAccentColor = s.accentColor || '#2563EB';
    const accentColor = isDark ? SignatureEngine.adjustColorForDark(baseAccentColor, 'accent') : baseAccentColor;
    const fontFamily = s.fontFamily || "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

    // Theme color tokens
    const bodyBg = isDark ? '#090D16' : '#F1F5F9';
    const cardBg = isDark ? '#0F172A' : '#FFFFFF';
    const cardBorder = isDark ? '1px solid #334155' : '1px solid #E2E8F0';
    const textColor = isDark ? '#E2E8F0' : '#334155';
    const titleColor = isDark ? '#F8FAFC' : '#0F172A';
    const highlightBg = isDark ? '#1E293B' : '#F8FAFC';
    const highlightBorder = isDark ? '1px solid #334155' : '1px solid #E2E8F0';
    const footerBg = isDark ? '#0B1120' : '#F8FAFC';
    const footerText = isDark ? '#94A3B8' : '#64748B';

    // Format paragraphs
    const paragraphsHtml = (t.paragraphs || []).map(p => {
      if (p.includes('\n- ') || p.startsWith('- ')) {
        const items = p.split('\n').filter(line => line.trim().length > 0).map(line => {
          const cleanLine = line.replace(/^-\s*/, '');
          return `<li style="margin-bottom: 6px; color: ${textColor};">${cleanLine}</li>`;
        }).join('');
        return `<ul class="email-text-body" style="margin: 12px 0 16px 20px; padding: 0; font-size: 14px; line-height: 1.6; color: ${textColor};">${items}</ul>`;
      }
      return `<p class="email-text-body" style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: ${textColor};">${p}</p>`;
    }).join('');

    // Format highlight box
    let highlightHtml = '';
    if (t.highlightBox && t.highlightBox.enabled) {
      const items = (t.highlightBox.content || '').split('\n').filter(l => l.trim()).map(line => {
        const clean = line.replace(/^-\s*/, '');
        return `<div class="email-text-body" style="padding: 3px 0; font-size: 13.5px; color: ${textColor};">&bull; ${clean}</div>`;
      }).join('');

      highlightHtml = `
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 18px 0; border-collapse: collapse;">
        <tr>
          <td class="email-highlight-box" style="background-color: ${highlightBg}; border: ${highlightBorder}; border-left: 4px solid ${accentColor}; border-radius: 6px; padding: 14px 18px;">
            <div class="email-highlight-title" style="font-size: 13.5px; font-weight: 700; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ${t.highlightBox.title || 'Summary'}
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
      const ctaTextColor = SignatureEngine.getLuminance(accentColor) > 0.55 ? '#0F172A' : '#FFFFFF';
      ctaHtml = `
      <table cellpadding="0" cellspacing="0" border="0" style="margin: 22px 0 24px 0; border-collapse: collapse;">
        <tr>
          <td align="center" class="email-cta-btn" style="background-color: ${accentColor}; border-radius: 6px; padding: 10px 22px;">
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
            <td style="background-color: #0F172A; padding: 18px 28px; border-bottom: 3px solid ${accentColor};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-family: ${fontFamily}; font-size: 13px; font-weight: 700; color: #FFFFFF; letter-spacing: 1px; text-transform: uppercase;">
                      ${t.headerLogoText || 'Dhrubojyoti Saha'}
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; color: #94A3B8; letter-spacing: 0.5px;">
                      Official Correspondence
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; font-family: ${fontFamily}; color: ${textColor};">
              
              <!-- Salutation -->
              <div class="email-text-title" style="font-size: 16px; font-weight: 600; color: ${titleColor}; margin-bottom: 16px;">
                ${t.greeting || 'Hello,'}
              </div>

              <!-- Paragraphs -->
              ${paragraphsHtml}

              <!-- Highlights Box -->
              ${highlightHtml}

              <!-- Call to Action -->
              ${ctaHtml}

              <!-- Closing -->
              <div style="font-size: 14px; color: ${footerText}; margin-top: 20px; margin-bottom: 18px;">
                ${t.closing || 'Best regards,'}
              </div>

              <!-- Embedded Email Signature -->
              <div style="padding-top: 12px; border-top: 1px dashed ${isDark ? '#334155' : '#CBD5E1'};">
                ${signatureHtml}
              </div>

            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td class="email-footer-bg" style="background-color: ${footerBg}; padding: 16px 28px; border-top: ${cardBorder}; text-align: center;">
              <div style="font-size: 11px; color: ${footerText}; line-height: 1.5;">
                ${t.footerNote || 'Sent with High-Definition Email Studio'}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `.trim();
  }
};
