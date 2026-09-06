/**
 * MailCraft Studio - Zero-Dependency QR Matrix & RFC 2426 vCard 3.0 Engine
 * Fast, pure JavaScript client-side implementation
 * Generates email-safe SVG and High-DPI Canvas/PNG QR matrices with error correction (Level L & M)
 * Formats standard compliant .vcf contact cards and manages QR embedding
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.QrEngine = exports.QrEngine;
    root.VCardEngine = exports.VCardEngine;
  }
}(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  // Galois Field GF(256) Tables for Reed-Solomon Error Correction
  const EXP_TABLE = new Uint8Array(512);
  const LOG_TABLE = new Uint8Array(256);

  (function initGaloisField() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP_TABLE[i] = x;
      LOG_TABLE[x] = i;
      x <<= 1;
      if (x & 0x100) {
        x ^= 0x11D; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
      }
    }
    for (let i = 255; i < 512; i++) {
      EXP_TABLE[i] = EXP_TABLE[i - 255];
    }
  })();

  function gfMul(x, y) {
    if (x === 0 || y === 0) return 0;
    return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
  }

  function rsPolyMul(p1, p2) {
    const result = new Uint8Array(p1.length + p2.length - 1);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        result[i + j] ^= gfMul(p1[i], p2[j]);
      }
    }
    return result;
  }

  function rsGeneratorPoly(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
      poly = rsPolyMul(poly, new Uint8Array([1, EXP_TABLE[i]]));
    }
    return poly;
  }

  function rsCalculateRemainder(data, numEcBytes) {
    const gen = rsGeneratorPoly(numEcBytes);
    const remainder = new Uint8Array(numEcBytes);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ remainder[0];
      remainder.copyWithin(0, 1);
      remainder[numEcBytes - 1] = 0;
      for (let j = 0; j < numEcBytes; j++) {
        remainder[j] ^= gfMul(gen[j + 1], factor);
      }
    }
    return remainder;
  }

  // QR Version Specifications (Versions 1 to 14 for Byte Mode with Level L/M)
  const QR_SPECS = {
    M: [
      null,
      { dataBytes: 16, ecBytes: 10, blocks: 1, alignment: [] },
      { dataBytes: 28, ecBytes: 16, blocks: 1, alignment: [6, 18] },
      { dataBytes: 44, ecBytes: 26, blocks: 1, alignment: [6, 22] },
      { dataBytes: 64, ecBytes: 18, blocks: 2, alignment: [6, 26] },
      { dataBytes: 86, ecBytes: 24, blocks: 2, alignment: [6, 30] },
      { dataBytes: 108, ecBytes: 16, blocks: 4, alignment: [6, 34] },
      { dataBytes: 124, ecBytes: 18, blocks: 4, alignment: [6, 22, 38] },
      { dataBytes: 154, ecBytes: 22, blocks: 4, alignment: [6, 24, 42] },
      { dataBytes: 182, ecBytes: 22, blocks: 5, alignment: [6, 26, 46] },
      { dataBytes: 216, ecBytes: 26, blocks: 5, alignment: [6, 28, 50] },
      { dataBytes: 252, ecBytes: 30, blocks: 5, alignment: [6, 30, 54] },
      { dataBytes: 290, ecBytes: 22, blocks: 8, alignment: [6, 32, 58] },
      { dataBytes: 330, ecBytes: 22, blocks: 9, alignment: [6, 34, 62] },
      { dataBytes: 370, ecBytes: 24, blocks: 9, alignment: [6, 26, 46, 66] }
    ],
    L: [
      null,
      { dataBytes: 19, ecBytes: 7, blocks: 1, alignment: [] },
      { dataBytes: 34, ecBytes: 10, blocks: 1, alignment: [6, 18] },
      { dataBytes: 55, ecBytes: 15, blocks: 1, alignment: [6, 22] },
      { dataBytes: 80, ecBytes: 20, blocks: 1, alignment: [6, 26] },
      { dataBytes: 108, ecBytes: 26, blocks: 1, alignment: [6, 30] },
      { dataBytes: 136, ecBytes: 18, blocks: 2, alignment: [6, 34] },
      { dataBytes: 156, ecBytes: 20, blocks: 2, alignment: [6, 22, 38] },
      { dataBytes: 194, ecBytes: 24, blocks: 2, alignment: [6, 24, 42] },
      { dataBytes: 232, ecBytes: 30, blocks: 2, alignment: [6, 26, 46] },
      { dataBytes: 274, ecBytes: 18, blocks: 4, alignment: [6, 28, 50] },
      { dataBytes: 324, ecBytes: 20, blocks: 4, alignment: [6, 30, 54] },
      { dataBytes: 370, ecBytes: 24, blocks: 4, alignment: [6, 32, 58] },
      { dataBytes: 428, ecBytes: 26, blocks: 4, alignment: [6, 34, 62] },
      { dataBytes: 461, ecBytes: 30, blocks: 4, alignment: [6, 26, 46, 66] }
    ]
  };

  const FORMAT_INFO = {
    M: [0x5412, 0x5125, 0x5E7C, 0x5B4B, 0x45F9, 0x40CE, 0x4F97, 0x4AA0],
    L: [0x77C4, 0x72F3, 0x7DAA, 0x789D, 0x662F, 0x6318, 0x6C41, 0x6976]
  };

  class BitBuffer {
    constructor() {
      this.buffer = [];
      this.length = 0;
    }
    put(num, length) {
      for (let i = 0; i < length; i++) {
        this.putBit(((num >>> (length - i - 1)) & 1) === 1);
      }
    }
    putBit(bit) {
      const bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) {
        this.buffer.push(0);
      }
      if (bit) {
        this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
      }
      this.length++;
    }
    getBytes() {
      return new Uint8Array(this.buffer);
    }
  }

  function utf8Encode(str) {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(str);
    }
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      let code = str.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if (code < 0xd800 || code >= 0xe000) {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      } else {
        i++;
        code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      }
    }
    return new Uint8Array(bytes);
  }

  /**
   * QR Code Matrix Generator
   */
  const QrEngine = {
    findBestVersion(dataLength, ecLevel = 'M') {
      const specs = QR_SPECS[ecLevel] || QR_SPECS.M;
      for (let v = 1; v < specs.length; v++) {
        const spec = specs[v];
        const countBits = v < 10 ? 8 : 16;
        const totalBitsNeeded = 4 + countBits + (dataLength * 8);
        const maxBitsAvailable = spec.dataBytes * 8;
        if (totalBitsNeeded <= maxBitsAvailable) {
          return v;
        }
      }
      return specs.length - 1;
    },

    generateMatrix(text, ecLevel = 'M') {
      if (!text) text = ' ';
      const ec = (ecLevel === 'L') ? 'L' : 'M';
      const utf8Data = utf8Encode(text);
      const version = this.findBestVersion(utf8Data.length, ec);
      const spec = QR_SPECS[ec][version];
      const size = version * 4 + 17;

      const bb = new BitBuffer();
      bb.put(0x4, 4); // 0100 = Byte Mode
      bb.put(utf8Data.length, version < 10 ? 8 : 16);
      for (let i = 0; i < utf8Data.length; i++) {
        bb.put(utf8Data[i], 8);
      }

      const maxBits = spec.dataBytes * 8;
      const termBits = Math.min(4, maxBits - bb.length);
      bb.put(0x0, termBits);

      while (bb.length % 8 !== 0) {
        bb.putBit(false);
      }

      const padBytes = [0xEC, 0x11];
      let padIdx = 0;
      while (bb.length < maxBits) {
        bb.put(padBytes[padIdx % 2], 8);
        padIdx++;
      }

      const encodedData = bb.getBytes();
      const numBlocks = spec.blocks;
      const totalDataBytes = spec.dataBytes;
      const ecBytesPerBlock = spec.ecBytes;
      const bytesPerBlock = Math.floor(totalDataBytes / numBlocks);
      const extraBlocks = totalDataBytes % numBlocks;

      const dataBlocks = [];
      const ecBlocks = [];
      let offset = 0;

      for (let b = 0; b < numBlocks; b++) {
        const blockSize = bytesPerBlock + (b >= numBlocks - extraBlocks ? 1 : 0);
        const blockData = encodedData.slice(offset, offset + blockSize);
        offset += blockSize;
        dataBlocks.push(blockData);
        ecBlocks.push(rsCalculateRemainder(blockData, ecBytesPerBlock));
      }

      const finalSequence = [];
      const maxBlockSize = bytesPerBlock + (extraBlocks > 0 ? 1 : 0);
      for (let i = 0; i < maxBlockSize; i++) {
        for (let b = 0; b < numBlocks; b++) {
          if (i < dataBlocks[b].length) {
            finalSequence.push(dataBlocks[b][i]);
          }
        }
      }
      for (let i = 0; i < ecBytesPerBlock; i++) {
        for (let b = 0; b < numBlocks; b++) {
          finalSequence.push(ecBlocks[b][i]);
        }
      }

      const matrix = Array.from({ length: size }, () => Array(size).fill(null));
      const reserved = Array.from({ length: size }, () => Array(size).fill(false));

      const setModule = (r, c, val) => {
        matrix[r][c] = val;
        reserved[r][c] = true;
      };

      const drawFinder = (r0, c0) => {
        for (let r = -1; r <= 7; r++) {
          for (let c = -1; c <= 7; c++) {
            const row = r0 + r;
            const col = c0 + c;
            if (row < 0 || row >= size || col < 0 || col >= size) continue;
            const isInside = (r >= 0 && r <= 6 && c >= 0 && c <= 6);
            const isBorder = (r === 0 || r === 6 || c === 0 || c === 6);
            const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            const val = isInside && (isBorder || isCenter);
            setModule(row, col, val);
          }
        }
      };

      drawFinder(0, 0);
      drawFinder(0, size - 7);
      drawFinder(size - 7, 0);

      const alignCoords = spec.alignment;
      for (let i = 0; i < alignCoords.length; i++) {
        for (let j = 0; j < alignCoords.length; j++) {
          const ar = alignCoords[i];
          const ac = alignCoords[j];
          if ((ar < 9 && ac < 9) || (ar < 9 && ac > size - 10) || (ar > size - 10 && ac < 9)) {
            continue;
          }
          for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
              const val = (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0));
              setModule(ar + r, ac + c, val);
            }
          }
        }
      }

      for (let i = 8; i < size - 8; i++) {
        if (!reserved[6][i]) setModule(6, i, i % 2 === 0);
        if (!reserved[i][6]) setModule(i, 6, i % 2 === 0);
      }

      setModule(size - 8, 8, true);

      for (let i = 0; i < 9; i++) {
        if (!reserved[8][i]) { reserved[8][i] = true; matrix[8][i] = false; }
        if (!reserved[i][8]) { reserved[i][8] = true; matrix[i][8] = false; }
        if (i < 8) {
          reserved[8][size - 1 - i] = true; matrix[8][size - 1 - i] = false;
          reserved[size - 1 - i][8] = true; matrix[size - 1 - i][8] = false;
        }
      }

      const dataBits = [];
      for (let i = 0; i < finalSequence.length; i++) {
        const byte = finalSequence[i];
        for (let b = 7; b >= 0; b--) {
          dataBits.push(((byte >>> b) & 1) === 1);
        }
      }

      let bitIdx = 0;
      let upward = true;

      for (let rightCol = size - 1; rightCol > 0; rightCol -= 2) {
        if (rightCol === 6) rightCol--;
        const cols = [rightCol, rightCol - 1];

        const rows = [];
        if (upward) {
          for (let r = size - 1; r >= 0; r--) rows.push(r);
        } else {
          for (let r = 0; r < size; r++) rows.push(r);
        }

        for (let r of rows) {
          for (let c of cols) {
            if (!reserved[r][c]) {
              const bit = bitIdx < dataBits.length ? dataBits[bitIdx++] : false;
              matrix[r][c] = bit;
            }
          }
        }
        upward = !upward;
      }

      const maskPattern = 0;
      const maskFunc = (r, c) => (r + c) % 2 === 0;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (!reserved[r][c]) {
            if (maskFunc(r, c)) {
              matrix[r][c] = !matrix[r][c];
            }
          }
        }
      }

      const formatBits = FORMAT_INFO[ec][maskPattern];
      for (let i = 0; i < 15; i++) {
        const bit = ((formatBits >>> (14 - i)) & 1) === 1;
        if (i <= 5) matrix[8][i] = bit;
        else if (i === 6) matrix[8][7] = bit;
        else if (i === 7) matrix[8][8] = bit;
        else if (i === 8) matrix[7][8] = bit;
        else matrix[14 - i][8] = bit;

        if (i < 8) {
          matrix[size - 1 - i][8] = bit;
        } else {
          matrix[8][size - 15 + i] = bit;
        }
      }

      return matrix;
    },

    renderSvg(text, options = {}) {
      const ecLevel = options.ecLevel || 'M';
      const matrix = this.generateMatrix(text, ecLevel);
      const size = matrix.length;
      const margin = options.margin !== undefined ? options.margin : 2;
      const totalSize = size + (margin * 2);
      const fg = options.color || '#000000';
      const bg = options.bgColor || 'transparent';

      const paths = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c]) {
            paths.push(`M${c + margin},${r + margin}h1v1h-1z`);
          }
        }
      }

      return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges" width="100%" height="100%">
  ${bg !== 'transparent' ? `<rect width="${totalSize}" height="${totalSize}" fill="${bg}" />` : ''}
  <path d="${paths.join('')}" fill="${fg}" />
</svg>
      `.trim();
    },

    renderToCanvas(canvas, text, options = {}) {
      if (!canvas) return;
      const ecLevel = options.ecLevel || 'M';
      const matrix = this.generateMatrix(text, ecLevel);
      const size = matrix.length;
      const margin = options.margin !== undefined ? options.margin : 2;
      const totalModules = size + (margin * 2);
      
      const width = options.width || 200;
      const height = options.height || 200;
      const scale = width / totalModules;
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const fg = options.color || '#000000';
      const bg = options.bgColor || '#FFFFFF';

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = fg;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c]) {
            ctx.fillRect(Math.round((c + margin) * scale), Math.round((r + margin) * scale), Math.ceil(scale), Math.ceil(scale));
          }
        }
      }
    },

    generatePngDataUrl(text, options = {}) {
      if (typeof document === 'undefined') {
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(this.renderSvg(text, options));
      }
      const canvas = document.createElement('canvas');
      const size = options.size || 240;
      this.renderToCanvas(canvas, text, Object.assign({}, options, { width: size, height: size }));
      return canvas.toDataURL('image/png');
    },

    generateSvg(text, options = {}) {
      return this.renderSvg(text, options);
    },

    generateSvgDataUrl(text, options = {}) {
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(this.renderSvg(text, options));
    }
  };

  /**
   * RFC 2426 vCard 3.0 Engine
   */
  const VCardEngine = {
    generateVCard(data = {}) {
      const clean = str => (str || '').toString().trim().replace(/;/g, '\\;').replace(/\n/g, '\\n');

      const fullName = clean(data.fullName || 'Contact');
      const parts = fullName.split(' ');
      const firstName = parts.length > 1 ? parts.slice(0, -1).join(' ') : fullName;
      const lastName = parts.length > 1 ? parts[parts.length - 1] : '';

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N;CHARSET=UTF-8:${lastName};${firstName};;;`,
        `FN;CHARSET=UTF-8:${fullName}`
      ];

      if (data.company || data.department) {
        lines.push(`ORG;CHARSET=UTF-8:${clean(data.company)}${data.department ? ';' + clean(data.department) : ''}`);
      }
      if (data.jobTitle) {
        lines.push(`TITLE;CHARSET=UTF-8:${clean(data.jobTitle)}`);
      }
      if (data.phone) {
        lines.push(`TEL;TYPE=CELL,VOICE,PREF:${data.phone.replace(/[^0-9+]/g, '')}`);
      }
      if (data.email) {
        lines.push(`EMAIL;TYPE=INTERNET,PREF:${clean(data.email)}`);
      }
      if (data.website) {
        const webUrl = data.website.startsWith('http') ? data.website : `https://${data.website}`;
        lines.push(`URL;TYPE=WORK:${clean(webUrl)}`);
      }
      if (data.address || data.country) {
        lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${clean(data.address)};;;${clean(data.country)}`);
      }

      const notes = [];
      if (Array.isArray(data.customFields)) {
        data.customFields.forEach(cf => {
          if (cf && cf.label && cf.value) {
            notes.push(`${cf.label}: ${cf.value}`);
          }
        });
      }
      if (notes.length > 0) {
        lines.push(`NOTE;CHARSET=UTF-8:${notes.join('\\n')}`);
      }

      lines.push('REV:' + new Date().toISOString());
      lines.push('END:VCARD');

      return lines.join('\r\n');
    },

    downloadVcf(data, filename) {
      const vcardContent = this.generateVCard(data);
      const safeName = (filename || data.fullName || 'contact').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });

      if (typeof window !== 'undefined' && window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, `${safeName}.vcf`);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeName}.vcf`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 200);
    },

    generateContactQrDataUrl(data, options = {}) {
      const mode = options.targetMode || 'vcard';
      let qrPayload = '';

      if (mode === 'website' && data.website) {
        qrPayload = data.website.startsWith('http') ? data.website : `https://${data.website}`;
      } else if (mode === 'custom' && options.customUrl) {
        qrPayload = options.customUrl;
      } else {
        qrPayload = this.generateVCard(data);
      }

      return QrEngine.generatePngDataUrl(qrPayload, options);
    },

    generateVCardString(data) {
      return this.generateVCard(data);
    }
  };

  return { QrEngine, VCardEngine };
}));
