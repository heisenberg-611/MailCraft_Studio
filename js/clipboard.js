/**
 * Clipboard & Export Engine
 * Handles rich-text HTML copy, raw HTML copy, CSS extraction, file download, and HD PNG export
 * Zero emojis
 */

const ClipboardExporter = {
  /**
   * Copy formatted rich-text HTML directly to system clipboard
   * Allows direct Cmd+V / Ctrl+V into Gmail, Apple Mail, Outlook
   */
  async copyRichHtml(htmlString, plainText, callback) {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const textBlob = new Blob([plainText || ''], { type: 'text/plain' });
        const htmlBlob = new Blob([htmlString], { type: 'text/html' });
        const item = new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob
        });
        await navigator.clipboard.write([item]);
        if (callback) callback(true, 'Rich-text signature copied to clipboard! Paste directly into Gmail or Outlook settings.');
        return true;
      }
    } catch (err) {
      console.warn('Modern ClipboardItem write failed, falling back to selection copy:', err);
    }

    // Fallback using DOM Selection
    try {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.pointerEvents = 'none';
      container.style.opacity = '0';
      container.style.left = '-9999px';
      container.innerHTML = htmlString;
      document.body.appendChild(container);

      const range = document.createRange();
      range.selectNodeContents(container);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      const successful = document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(container);

      if (successful) {
        if (callback) callback(true, 'Signature copied to clipboard! Ready to paste.');
        return true;
      }
    } catch (fallbackErr) {
      console.error('DOM selection copy failed:', fallbackErr);
    }

    if (callback) callback(false, 'Clipboard access was blocked by the browser. Please use Copy HTML.');
    return false;
  },

  /**
   * Copy raw HTML string to clipboard
   */
  async copyRawHtml(htmlString, callback) {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(htmlString);
        if (callback) callback(true, 'Raw HTML source code copied to clipboard.');
        return true;
      }
      const textArea = document.createElement('textarea');
      textArea.value = htmlString;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (callback) callback(true, 'Raw HTML source code copied.');
      return true;
    } catch (err) {
      if (callback) callback(false, 'Could not copy HTML source.');
      return false;
    }
  },

  /**
   * Download standalone .html file
   */
  downloadHtmlFile(htmlString, filename = 'email-signature.html') {
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export high-resolution PNG image
   */
  async exportHighResPng(element, filename = 'email-signature-hd.png', scale = 3, callback) {
    try {
      // Create SVG foreignObject container for canvas rendering
      const width = element.offsetWidth || 500;
      const height = element.offsetHeight || 200;
      const physicalWidth = width * scale;
      const physicalHeight = height * scale;

      const canvas = document.createElement('canvas');
      canvas.width = physicalWidth;
      canvas.height = physicalHeight;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      // Serialize HTML
      const clone = element.cloneNode(true);
      const htmlContent = new XMLSerializer().serializeToString(clone);
      
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${htmlContent}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (!blob) {
            if (callback) callback(false, 'PNG export generation failed.');
            return;
          }
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
          if (callback) callback(true, 'High-Definition PNG exported successfully!');
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        if (callback) callback(false, 'Could not render signature to image.');
      };

      img.src = url;
    } catch (err) {
      console.error('Export PNG failed:', err);
      if (callback) callback(false, 'PNG export error: ' + err.message);
    }
  }
};
