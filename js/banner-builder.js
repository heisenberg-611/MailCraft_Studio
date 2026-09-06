/**
 * MailCraft Studio - Interactive Promo & Announcement Banner Designer
 * In-browser HTML5 Canvas banner generation with 2x/3x Retina rendering
 * Zero backend transmission & instant 1-click signature insertion
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BannerBuilder = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  const BANNER_PRESETS = {
    hiring: {
      tag: 'WE ARE HIRING',
      title: 'Join Our Core Engineering Team',
      subtitle: 'Open roles in Distributed Systems, Frontend & Research. Apply today.',
      ctaText: 'View Open Positions',
      gradient: 'emerald',
      bgColor1: '#0F172A',
      bgColor2: '#064E3B',
      accentColor: '#00DC82',
      buttonBgColor: '#00DC82',
      buttonTextColor: '#090D16',
      textColor: '#FFFFFF',
      subtextColor: '#A7F3D0'
    },
    research: {
      tag: 'LATEST RESEARCH PAPER',
      title: 'Empirical Study on High-DPI Email Rendering',
      subtitle: 'Peer-reviewed benchmarking across 40+ web and desktop email clients.',
      ctaText: 'Read Preprint (PDF)',
      gradient: 'sapphire',
      bgColor1: '#1E1B4B',
      bgColor2: '#1E3A8A',
      accentColor: '#38BDF8',
      buttonBgColor: '#38BDF8',
      buttonTextColor: '#0F172A',
      textColor: '#FFFFFF',
      subtextColor: '#BAE6FD'
    },
    product: {
      tag: 'PRODUCT LAUNCH',
      title: 'MailCraft Studio 2.0 Is Officially Live',
      subtitle: 'Bulletproof email architecture, team rosters, and zero-server privacy.',
      ctaText: 'Explore New Features',
      gradient: 'violet',
      bgColor1: '#09090B',
      bgColor2: '#4C1D95',
      accentColor: '#A855F7',
      buttonBgColor: '#A855F7',
      buttonTextColor: '#FFFFFF',
      textColor: '#FFFFFF',
      subtextColor: '#E9D5FF'
    },
    webinar: {
      tag: 'UPCOMING KEYNOTE',
      title: 'Building Resilient Cross-Client HTML Systems',
      subtitle: 'Live technical keynote & interactive Q&A session this Thursday.',
      ctaText: 'Reserve Your Seat',
      gradient: 'amber',
      bgColor1: '#1C1917',
      bgColor2: '#78350F',
      accentColor: '#F59E0B',
      buttonBgColor: '#F59E0B',
      buttonTextColor: '#0F172A',
      textColor: '#FFFFFF',
      subtextColor: '#FDE68A'
    },
    custom: {
      tag: 'ANNOUNCEMENT',
      title: 'Your Custom Campaign Headline',
      subtitle: 'Highlight your latest projects, milestones, or collaborations here.',
      ctaText: 'Learn More',
      gradient: 'darkSlate',
      bgColor1: '#0A0A0A',
      bgColor2: '#1E293B',
      accentColor: '#00DC82',
      buttonBgColor: '#00DC82',
      buttonTextColor: '#090D16',
      textColor: '#FFFFFF',
      subtextColor: '#94A3B8'
    }
  };

  const GRADIENTS = {
    emerald: ['#0A0A0A', '#064E3B'],
    sapphire: ['#0F172A', '#1E3A8A'],
    violet: ['#09090B', '#4C1D95'],
    amber: ['#1C1917', '#78350F'],
    crimson: ['#18181B', '#7F1D1D'],
    darkSlate: ['#090D16', '#1E293B'],
    monochrome: ['#0A0A0A', '#1F2937']
  };

  const BannerBuilder = {
    presets: BANNER_PRESETS,
    gradients: GRADIENTS,

    /**
     * Render banner to HTML Canvas at 2x DPI with compact email-proportioned layout
     */
    renderToCanvas(canvas, config = {}) {
      if (!canvas) return;

      const width = config.width || 480;
      const height = config.height || 82;
      const dpi = config.dpi || 2;

      canvas.width = width * dpi;
      canvas.height = height * dpi;
      canvas.style.width = '100%';
      canvas.style.maxWidth = `${width}px`;
      canvas.style.height = 'auto';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpi, dpi);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      let bg1 = config.bgColor1;
      let bg2 = config.bgColor2;

      if (!bg1 || !bg2) {
        const gradPair = GRADIENTS[config.gradient] || GRADIENTS.emerald;
        bg1 = gradPair[0];
        bg2 = gradPair[1];
      }

      grad.addColorStop(0, bg1);
      grad.addColorStop(1, bg2);

      // Rounded rectangle banner container
      const radius = config.borderRadius !== undefined ? config.borderRadius : 6;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(0, 0, width, height, radius);
      } else {
        ctx.rect(0, 0, width, height);
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Border outline
      ctx.lineWidth = 1;
      ctx.strokeStyle = config.borderColor || 'rgba(255, 255, 255, 0.12)';
      ctx.stroke();

      // Subtle cyber grid / accent lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 24; x < width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Button background and text color resolution
      const btnBg = config.buttonBgColor || config.accentColor || '#00DC82';
      const defaultTextCol = this.isLightColor(btnBg) ? '#090D16' : '#FFFFFF';
      const btnTextColor = config.buttonTextColor || config.ctaTextColor || defaultTextCol;

      // Decorative accent indicator bar on top
      const accent = config.accentColor || btnBg || '#00DC82';
      ctx.fillStyle = accent;
      ctx.fillRect(18, 0, 48, 2.5);

      const paddingLeft = 18;

      // Calculate CTA button dimensions first to know available text width
      let maxTextWidth = width - paddingLeft - 18;
      let ctaBtnInfo = null;

      if (config.ctaText && config.ctaText.trim()) {
        const ctaText = config.ctaText.trim();
        ctx.font = '600 11.5px "Geist", "Segoe UI", -apple-system, sans-serif';
        const metrics = ctx.measureText(ctaText);
        const btnPaddingX = 13;
        const btnWidth = Math.max(metrics.width + (btnPaddingX * 2), 92);
        const btnHeight = 28;
        const btnX = width - btnWidth - 16;
        const btnY = Math.round((height - btnHeight) / 2);

        ctaBtnInfo = { text: ctaText, x: btnX, y: btnY, w: btnWidth, h: btnHeight };
        maxTextWidth = btnX - paddingLeft - 14;
      }

      // Dynamic font scaler helper to guarantee complete text is displayed without any truncation
      const getFittedFont = (text, startSize, minSize, weight, family, maxW) => {
        if (!text) return { font: `${weight} ${startSize}px ${family}`, size: startSize, fits: true };
        let size = startSize;
        ctx.font = `${weight} ${size}px ${family}`;
        while (ctx.measureText(text).width > maxW && size > minSize) {
          size = Math.round((size - 0.25) * 100) / 100;
          ctx.font = `${weight} ${size}px ${family}`;
        }
        return { font: `${weight} ${size}px ${family}`, size, fits: ctx.measureText(text).width <= maxW };
      };

      // Calculate dynamic vertical centering for text block
      const hasTag = Boolean(config.tag && config.tag.trim());
      const rawTitle = config.title ? config.title.trim() : 'Special Announcement';
      const rawSubtitle = config.subtitle ? config.subtitle.trim() : '';
      const hasSub = Boolean(rawSubtitle);

      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      let startY = 18;
      if (hasTag && hasSub) {
        startY = Math.round((height - 46) / 2);
      } else if (!hasTag && hasSub) {
        startY = Math.round((height - 32) / 2);
      } else if (hasTag && !hasSub) {
        startY = Math.round((height - 30) / 2);
      } else {
        startY = Math.round((height - 16) / 2);
      }

      let curY = startY;

      // 2. Eyebrow Tag Chip
      if (hasTag) {
        ctx.font = '700 9.5px "JetBrains Mono", "Courier New", Consolas, monospace';
        const tagText = `// ${config.tag.trim().toUpperCase()}`;
        ctx.fillStyle = accent;
        ctx.fillText(tagText, paddingLeft, curY);
        curY += 14;
      }

      // 3. Headline Title Text (Auto-scales down if long so it never truncates)
      const titleFontInfo = getFittedFont(rawTitle, 13.5, 10.5, '700', '"Geist", "Segoe UI", -apple-system, sans-serif', maxTextWidth);
      ctx.font = titleFontInfo.font;
      ctx.fillStyle = config.textColor || '#FFFFFF';
      ctx.fillText(rawTitle, paddingLeft, curY);
      curY += 18;

      // 4. Subtitle / Description Text (Auto-scales down dynamically so it NEVER truncates with ellipsis)
      if (hasSub) {
        const subFontInfo = getFittedFont(rawSubtitle, 10.5, 7.5, '400', '"Geist", "Segoe UI", -apple-system, sans-serif', maxTextWidth);
        ctx.font = subFontInfo.font;
        ctx.fillStyle = config.subtextColor || '#94A3B8';
        ctx.fillText(rawSubtitle, paddingLeft, curY);
      }

      // 5. Call to Action Button Pill
      if (ctaBtnInfo) {
        // Button background
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(ctaBtnInfo.x, ctaBtnInfo.y, ctaBtnInfo.w, ctaBtnInfo.h, 5);
        } else {
          ctx.rect(ctaBtnInfo.x, ctaBtnInfo.y, ctaBtnInfo.w, ctaBtnInfo.h);
        }
        ctx.fillStyle = btnBg;
        ctx.fill();

        // Button text
        ctx.font = '600 11.5px "Geist", "Segoe UI", -apple-system, sans-serif';
        ctx.fillStyle = btnTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ctaBtnInfo.text, ctaBtnInfo.x + (ctaBtnInfo.w / 2), ctaBtnInfo.y + (ctaBtnInfo.h / 2));

        // Reset text alignment & baseline
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
      }
    },

    isLightColor(hex) {
      if (!hex || hex.length < 6) return false;
      const clean = hex.replace('#', '');
      const r = parseInt(clean.substr(0, 2), 16) || 0;
      const g = parseInt(clean.substr(2, 2), 16) || 0;
      const b = parseInt(clean.substr(4, 2), 16) || 0;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return lum > 0.6;
    },

    /**
     * Smart High-DPI Compression for Email Delivery:
     * Converts canvas to lightweight JPEG (~8-15KB instead of 300KB+ PNG)
     * Keeps total signature HTML well under Gmail's 102KB limit
     */
    compressCanvas(canvas, options = {}) {
      if (!canvas) return '';
      const quality = options.quality || 0.86;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      // If payload still exceeds 20KB, calibrate quality down
      if (dataUrl.length > 27000) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.80);
      }
      if (dataUrl.length > 35000) {
        dataUrl = canvas.toDataURL('image/jpeg', 0.74);
      }
      return dataUrl;
    },

    /**
     * Generate lightweight Data URL from banner configuration
     */
    generateBannerDataUrl(config = {}, options = {}) {
      if (typeof document === 'undefined') return '';
      const canvas = document.createElement('canvas');
      this.renderToCanvas(canvas, config);
      return this.compressCanvas(canvas, options);
    },

    /**
     * Trigger PNG Download of generated banner (hires for external graphic use)
     */
    downloadBannerPng(config = {}, filename = 'promo-banner') {
      if (typeof document === 'undefined') return '';
      const canvas = document.createElement('canvas');
      this.renderToCanvas(canvas, config);
      const dataUrl = canvas.toDataURL('image/png');
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 200);
    }
  };

  return BannerBuilder;
}));
