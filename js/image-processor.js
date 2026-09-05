/**
 * High-Definition Image Processing Engine
 * Handles 1x, 2x (Retina), 3x, 4x DPI scaling, cropping, shapes, and filters
 * 100% in-browser via HTML5 Canvas
 */

const ImageProcessor = {
  rawImage: null,
  processedDataUrl: '',
  
  // Settings
  config: {
    dpi: 2, // 1x, 2x, 3x, 4x
    size: 85, // CSS display size in pixels
    shape: 'square', // 'circle', 'squircle', 'rounded', 'square'
    borderRadius: 0, // % or px
    borderWidth: 0,
    borderColor: '#00DC82',
    brightness: 100, // %
    contrast: 100, // %
    saturation: 100, // %
    sharpness: 0, // 0 to 10
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0
  },

  /**
   * Initialize and load the true default high-res photograph avatar
   */
  init(callback) {
    const avatarSrc = (typeof DEFAULT_AVATAR_BASE64 !== 'undefined' && DEFAULT_AVATAR_BASE64) 
      ? DEFAULT_AVATAR_BASE64 
      : 'assets/default-avatar.jpg';

    this.loadImageFromUrl(avatarSrc, (dataUrl) => {
      if (callback) callback(dataUrl || avatarSrc);
    });
  },

  /**
   * Load an image from file input
   */
  loadImageFile(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.rawImage = img;
        this.process(callback);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  /**
   * Load an image from a URL or base64 Data URI
   */
  loadImageFromUrl(url, callback) {
    if (!url) {
      if (callback) callback('');
      return;
    }
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      this.rawImage = img;
      this.process(callback);
    };
    img.onerror = () => {
      console.warn('Could not load image directly from URL:', url);
      if (typeof DEFAULT_AVATAR_BASE64 !== 'undefined' && DEFAULT_AVATAR_BASE64 && url !== DEFAULT_AVATAR_BASE64) {
        this.loadImageFromUrl(DEFAULT_AVATAR_BASE64, callback);
      } else if (callback) {
        callback(this.processedDataUrl || url);
      }
    };
    img.src = url;
  },

  /**
   * Process raw image onto High-DPI canvas with high quality scaling, zoom, and filters
   */
  process(callback) {
    if (!this.rawImage) {
      if (callback) callback(this.processedDataUrl);
      return this.processedDataUrl;
    }

    const dpi = Number(this.config.dpi) || 2;
    const displaySize = Number(this.config.size) || 85;
    const physicalSize = Math.round(displaySize * dpi);

    const canvas = document.createElement('canvas');
    canvas.width = physicalSize;
    canvas.height = physicalSize;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Apply Filters
    const b = this.config.brightness || 100;
    const c = this.config.contrast || 100;
    const s = this.config.saturation || 100;
    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;

    // Calculate crop and position
    const img = this.rawImage;
    const zoom = Math.max(1.0, Number(this.config.zoom) || 1.0);
    const minDim = Math.min(img.width, img.height);
    const srcSize = minDim / zoom;
    const srcX = Math.max(0, Math.min(img.width - srcSize, (img.width - srcSize) / 2 + (this.config.offsetX || 0)));
    const srcY = Math.max(0, Math.min(img.height - srcSize, (img.height - srcSize) / 2 + (this.config.offsetY || 0)));

    // Draw full-bleed cropped image edge-to-edge
    ctx.drawImage(
      img,
      srcX,
      srcY,
      srcSize,
      srcSize,
      0,
      0,
      physicalSize,
      physicalSize
    );

    // Reset filter
    ctx.filter = 'none';

    this.processedDataUrl = canvas.toDataURL('image/png', 0.95);
    if (callback) callback(this.processedDataUrl);
    return this.processedDataUrl;
  },

  /**
   * Apply shape clipping path
   */
  applyShapeClip(ctx, size, shape) {
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
    } else if (shape === 'squircle') {
      const radius = size * 0.28;
      this.drawRoundedRect(ctx, 0, 0, size, size, radius);
    } else if (shape === 'rounded') {
      const radius = size * 0.14;
      this.drawRoundedRect(ctx, 0, 0, size, size, radius);
    } else {
      // square
      ctx.rect(0, 0, size, size);
    }
    ctx.closePath();
    ctx.clip();
  },

  /**
   * Draw border matching the shape
   */
  drawShapeBorder(ctx, size, borderWidth, shape) {
    const halfBorder = borderWidth / 2;
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(size / 2, size / 2, size / 2 - halfBorder, 0, Math.PI * 2);
    } else if (shape === 'squircle') {
      const radius = (size - borderWidth) * 0.28;
      this.drawRoundedRect(ctx, halfBorder, halfBorder, size - borderWidth, size - borderWidth, radius);
    } else if (shape === 'rounded') {
      const radius = (size - borderWidth) * 0.14;
      this.drawRoundedRect(ctx, halfBorder, halfBorder, size - borderWidth, size - borderWidth, radius);
    } else {
      ctx.rect(halfBorder, halfBorder, size - borderWidth, size - borderWidth);
    }
    ctx.stroke();
  },

  /**
   * Helper to draw rounded rectangle path
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  },

  /**
   * Load real default avatar
   */
  createDefaultAvatar(callback) {
    const avatarSrc = (typeof DEFAULT_AVATAR_BASE64 !== 'undefined' && DEFAULT_AVATAR_BASE64) 
      ? DEFAULT_AVATAR_BASE64 
      : 'assets/default-avatar.jpg';
    this.loadImageFromUrl(avatarSrc, callback);
  },

  /**
   * Process generic image (Logo or Promo Banner) with optional shape and scaling
   */
  processGenericImage(file, options = {}, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = options.maxWidth || 800;
        const maxHeight = options.maxHeight || 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/png', 0.95);
        if (callback) callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};
