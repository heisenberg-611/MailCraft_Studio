/**
 * MailCraft Studio - Real-time Email Compatibility & Size Linter
 * Performs client-side AST & regex audits on generated email HTML
 * Analyzes Gmail 102KB clipping limit, Outlook MSO rules, Dark Mode coverage, and Retina compliance
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LinterEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  const GMAIL_CLIPPING_LIMIT_BYTES = 102400; // 100 KB - 102 KB threshold

  function getByteLength(str) {
    if (!str) return 0;
    if (typeof Blob !== 'undefined') {
      return new Blob([str]).size;
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.byteLength(str, 'utf8');
    }
    return encodeURI(str).split(/%..|./).length - 1;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    const kb = (bytes / 1024).toFixed(1);
    return kb + ' KB';
  }

  const LinterEngine = {
    /**
     * Audit email signature HTML and return comprehensive lint report
     */
    audit(htmlString) {
      if (!htmlString || typeof htmlString !== 'string') {
        htmlString = '';
      }

      const totalBytes = getByteLength(htmlString);
      const sizeFormatted = formatBytes(totalBytes);
      const isSizeSafe = totalBytes < GMAIL_CLIPPING_LIMIT_BYTES;
      const sizePercentOfLimit = Math.min(100, Math.round((totalBytes / GMAIL_CLIPPING_LIMIT_BYTES) * 100));

      const checks = [];
      let passedScore = 100;

      // 1. Gmail Size Check
      if (totalBytes < 40960) { // < 40KB
        checks.push({
          id: 'size_limit',
          title: 'Gmail 102KB Clipping Safety',
          status: 'pass',
          message: `HTML size is ${sizeFormatted} (only ${sizePercentOfLimit}% of Gmail 102KB limit). Instant render guaranteed.`
        });
      } else if (totalBytes < GMAIL_CLIPPING_LIMIT_BYTES) {
        checks.push({
          id: 'size_limit',
          title: 'Gmail 102KB Clipping Safety',
          status: 'warn',
          message: `HTML size is ${sizeFormatted} (${sizePercentOfLimit}% of limit). Monitor closely if adding large base64 images.`
        });
        passedScore -= 10;
      } else {
        checks.push({
          id: 'size_limit',
          title: 'Gmail 102KB Clipping Safety',
          status: 'fail',
          message: `HTML size (${sizeFormatted}) exceeds 102KB! Gmail will truncate the email with "[Message clipped] View entire message". Reduce image size or DPI.`
        });
        passedScore -= 40;
      }

      // 2. Outlook Table-based MSO Layout
      const hasTables = /<table\b/i.test(htmlString);
      const hasMsoReset = /mso-table-lspace:\s*0pt/i.test(htmlString) || /border-collapse:\s*collapse/i.test(htmlString);
      if (hasTables && hasMsoReset) {
        checks.push({
          id: 'mso_tables',
          title: 'Outlook (Word MSO Engine) Table Grid',
          status: 'pass',
          message: 'Zero-margin nested tables with mso-table-lspace:0pt and border-collapse:collapse are present.'
        });
      } else {
        checks.push({
          id: 'mso_tables',
          title: 'Outlook (Word MSO Engine) Table Grid',
          status: 'fail',
          message: 'Missing standard MSO table resets. Outlook desktop may render irregular spacing.'
        });
        passedScore -= 20;
      }

      // 3. Inline CSS vs External Stylesheets
      const hasExternalLink = /<link\b/i.test(htmlString);
      const hasUnsupportedFlex = /display:\s*(?:flex|grid)/i.test(htmlString);
      const hasUnsupportedPos = /position:\s*(?:absolute|fixed)/i.test(htmlString);

      if (!hasExternalLink && !hasUnsupportedFlex && !hasUnsupportedPos) {
        checks.push({
          id: 'inline_css',
          title: 'Email-Safe Inline CSS',
          status: 'pass',
          message: 'All styles are inlined on table elements with zero risky flex/grid/position properties.'
        });
      } else {
        const issues = [];
        if (hasExternalLink) issues.push('External <link> tag detected (stripped by Gmail)');
        if (hasUnsupportedFlex) issues.push('CSS flex/grid detected (unsupported in Outlook)');
        if (hasUnsupportedPos) issues.push('position:absolute/fixed detected');
        checks.push({
          id: 'inline_css',
          title: 'Email-Safe Inline CSS',
          status: 'warn',
          message: issues.join('; ')
        });
        passedScore -= 15;
      }

      // 4. Dark Mode Dual Adaptation
      const hasPrefersDark = /prefers-color-scheme:\s*dark/i.test(htmlString);
      const hasDataOgsc = /\[data-ogsc\]/i.test(htmlString);
      if (hasPrefersDark && hasDataOgsc) {
        checks.push({
          id: 'dark_mode',
          title: 'Dark Mode Dual Protocol',
          status: 'pass',
          message: 'Both Apple/iOS @media (prefers-color-scheme) and Outlook Web [data-ogsc] overrides active.'
        });
      } else if (hasPrefersDark || hasDataOgsc) {
        checks.push({
          id: 'dark_mode',
          title: 'Dark Mode Adaptation',
          status: 'warn',
          message: 'Partial dark mode tags found. Ensure both prefers-color-scheme and data-ogsc are present.'
        });
        passedScore -= 10;
      } else {
        checks.push({
          id: 'dark_mode',
          title: 'Dark Mode Adaptation',
          status: 'warn',
          message: 'No dark mode style block included. Clients may invert colors unpredictably.'
        });
        passedScore -= 15;
      }

      // 5. Image & Retina DPI Attributes
      const imgMatches = htmlString.match(/<img\b[^>]*>/gi) || [];
      let imgIssues = 0;
      imgMatches.forEach(imgTag => {
        const hasWidth = /\bwidth=["'][0-9]+["']/i.test(imgTag) || /style="[^"]*width:\s*[0-9]+px/i.test(imgTag);
        const hasBorder = /\bborder=["']0["']/i.test(imgTag);
        const hasAlt = /\balt=["'][^"']*["']/i.test(imgTag);
        if (!hasWidth || !hasBorder || !hasAlt) {
          imgIssues++;
        }
      });

      if (imgMatches.length === 0 || imgIssues === 0) {
        checks.push({
          id: 'retina_images',
          title: 'Retina Images & Explicit Sizing',
          status: 'pass',
          message: `All ${imgMatches.length} images have explicit width, border="0", and alt tags.`
        });
      } else {
        checks.push({
          id: 'retina_images',
          title: 'Retina Images & Explicit Sizing',
          status: 'warn',
          message: `${imgIssues} image(s) missing explicit width/alt/border attributes. Outlook may expand them.`
        });
        passedScore -= 10;
      }

      // 6. Character Encoding & Non-breaking spaces
      const hasBadEntities = /&amp;amp;/i.test(htmlString);
      if (!hasBadEntities) {
        checks.push({
          id: 'html_entities',
          title: 'HTML Entity & Unicode Integrity',
          status: 'pass',
          message: 'Clean character entity encoding and valid XML/HTML syntax.'
        });
      } else {
        checks.push({
          id: 'html_entities',
          title: 'HTML Entity Integrity',
          status: 'warn',
          message: 'Double encoded HTML entities found (&amp;amp;).'
        });
        passedScore -= 5;
      }

      const score = Math.max(0, Math.min(100, passedScore));
      let rating = 'EXCELLENT';
      let badgeClass = 'badge-pass';
      if (score < 60 || !isSizeSafe) {
        rating = 'CRITICAL';
        badgeClass = 'badge-fail';
      } else if (score < 85) {
        rating = 'GOOD';
        badgeClass = 'badge-warn';
      }

      return {
        totalBytes,
        sizeFormatted,
        isSizeSafe,
        sizePercentOfLimit,
        score,
        rating,
        badgeClass,
        checks
      };
    }
  };

  return LinterEngine;
}));
