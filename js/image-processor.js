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
    size: 100, // CSS display size in pixels
    shape: 'circle', // 'circle', 'squircle', 'rounded', 'square'
    borderRadius: 50, // % or px
    borderWidth: 0,
    borderColor: '#2563EB',
    brightness: 100, // %
    contrast: 100, // %
    saturation: 100, // %
    sharpness: 0, // 0 to 10
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0
  },

  /**
   * Initialize and create default high-res canvas avatar
   */
  init(callback) {
    if (typeof DEFAULT_AVATAR_BASE64 !== 'undefined' && DEFAULT_AVATAR_BASE64) {
      const img = new Image();
      img.onload = () => {
        this.rawImage = img;
        this.process(callback);
      };
      img.src = DEFAULT_AVATAR_BASE64;
    } else {
      this.loadImageFromUrl('assets/default-avatar.jpg', (dataUrl) => {
        if (dataUrl) {
          if (callback) callback(dataUrl);
        } else {
          this.createDefaultAvatar(callback);
        }
      });
    }
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
   * Load an image from a URL
   */
  loadImageFromUrl(url, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      this.rawImage = img;
      this.process(callback);
    };
    img.onerror = () => {
      console.warn('Could not load image directly from URL due to CORS or network.');
      if (callback) callback(this.processedDataUrl);
    };
    img.src = url;
  },

  /**
   * Process raw image onto High-DPI canvas with shapes, borders, and filters
   */
  process(callback) {
    if (!this.rawImage) {
      if (callback) callback(this.processedDataUrl);
      return;
    }

    const dpi = Number(this.config.dpi) || 2;
    const displaySize = Number(this.config.size) || 100;
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
    const zoom = Number(this.config.zoom) || 1.0;
    const minDim = Math.min(img.width, img.height);
    const srcSize = minDim / zoom;
    const srcX = (img.width - srcSize) / 2 + (this.config.offsetX || 0);
    const srcY = (img.height - srcSize) / 2 + (this.config.offsetY || 0);

    // Shape Clipping Path
    ctx.save();
    this.applyShapeClip(ctx, physicalSize, this.config.shape);
    
    // Draw cropped image
    ctx.drawImage(
      img,
      Math.max(0, Math.min(img.width - srcSize, srcX)),
      Math.max(0, Math.min(img.height - srcSize, srcY)),
      srcSize,
      srcSize,
      0,
      0,
      physicalSize,
      physicalSize
    );
    ctx.restore();

    // Reset filter for border
    ctx.filter = 'none';

    // Draw border if requested
    const borderWidth = (Number(this.config.borderWidth) || 0) * dpi;
    if (borderWidth > 0) {
      ctx.save();
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = this.config.borderColor || '#2563EB';
      this.drawShapeBorder(ctx, physicalSize, borderWidth, this.config.shape);
      ctx.restore();
    }

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
   * Generate default High-Definition avatar matching the user reference
   */
  createDefaultAvatar(callback) {
    const size = 300; // 3x physical size for ultra crisp 100px avatar
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Background - warm nature gradient (matching the bamboo/nature backdrop)
    const bgGrad = ctx.createLinearGradient(0, 0, size, size);
    bgGrad.addColorStop(0, '#4A5D3E');
    bgGrad.addColorStop(0.5, '#736B46');
    bgGrad.addColorStop(1, '#3B3624');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Subtle bamboo stalks in background
    ctx.strokeStyle = '#5E6B47';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(40, 0); ctx.lineTo(40, size);
    ctx.moveTo(80, 0); ctx.lineTo(80, size);
    ctx.moveTo(240, 0); ctx.lineTo(240, size);
    ctx.moveTo(270, 0); ctx.lineTo(270, size);
    ctx.stroke();

    // Bamboo joints
    ctx.fillStyle = '#3E472F';
    ctx.fillRect(30, 80, 20, 4);
    ctx.fillRect(30, 190, 20, 4);
    ctx.fillRect(70, 110, 20, 4);
    ctx.fillRect(230, 140, 20, 4);

    // Body / Shirt (Patterned olive shirt)
    ctx.fillStyle = '#C8C39E';
    ctx.beginPath();
    ctx.ellipse(size / 2, size + 20, 80, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shirt pattern dots/leaves
    ctx.fillStyle = '#8B845C';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(100 + (i % 4) * 35, 230 + Math.floor(i / 4) * 25, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Neck
    ctx.fillStyle = '#E8A87C';
    ctx.fillRect(size / 2 - 20, 175, 40, 45);

    // Face / Head
    ctx.fillStyle = '#E8A87C';
    ctx.beginPath();
    ctx.ellipse(size / 2, 160, 42, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#221914';
    ctx.beginPath();
    ctx.arc(size / 2, 145, 46, Math.PI, Math.PI * 2);
    ctx.fill();

    // Glasses frame (Modern dark rectangular glasses)
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(size / 2 - 38, 146, 28, 18);
    ctx.strokeRect(size / 2 + 10, 146, 28, 18);
    // Bridge
    ctx.beginPath();
    ctx.moveTo(size / 2 - 10, 155);
    ctx.lineTo(size / 2 + 10, 155);
    ctx.stroke();

    // Glasses glare / lens
    ctx.fillStyle = 'rgba(147, 197, 253, 0.45)';
    ctx.fillRect(size / 2 - 36, 148, 24, 14);
    ctx.fillRect(size / 2 + 12, 148, 24, 14);

    // Eyes
    ctx.fillStyle = '#1A110B';
    ctx.beginPath();
    ctx.arc(size / 2 - 24, 155, 3.5, 0, Math.PI * 2);
    ctx.arc(size / 2 + 24, 155, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Smile / Teeth
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(size / 2, 182, 14, 7, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, 180, 15, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Camo Safari / Explorer Hat (Matching user's reference)
    // Brim (wide tilted)
    ctx.fillStyle = '#8C8267';
    ctx.beginPath();
    ctx.ellipse(size / 2 - 5, 125, 75, 24, -0.08, 0, Math.PI * 2);
    ctx.fill();

    // Camo spots on brim
    ctx.fillStyle = '#5A5643';
    ctx.beginPath();
    ctx.ellipse(size / 2 - 40, 122, 18, 9, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A3997A';
    ctx.beginPath();
    ctx.ellipse(size / 2 + 30, 126, 16, 7, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Hat Crown
    ctx.fillStyle = '#7C7459';
    ctx.beginPath();
    ctx.moveTo(size / 2 - 42, 122);
    ctx.quadraticCurveTo(size / 2 - 35, 70, size / 2, 68);
    ctx.quadraticCurveTo(size / 2 + 35, 70, size / 2 + 36, 122);
    ctx.closePath();
    ctx.fill();

    // Camo spots on crown
    ctx.fillStyle = '#494432';
    ctx.beginPath();
    ctx.ellipse(size / 2 - 10, 88, 14, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A99F80';
    ctx.beginPath();
    ctx.ellipse(size / 2 + 12, 102, 12, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Chin strap / cord
    ctx.strokeStyle = '#524336';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(size / 2 - 30, 132);
    ctx.lineTo(size / 2 - 4, 215);
    ctx.lineTo(size / 2 + 25, 132);
    ctx.stroke();

    const img = new Image();
    img.onload = () => {
      this.rawImage = img;
      this.process(callback);
    };
    img.src = canvas.toDataURL('image/png');
  }
};
