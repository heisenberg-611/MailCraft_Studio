/**
 * Client-Side Zero-Dependency ZIP Archive Builder
 * Creates standard PKZIP archives purely in-browser using standard typed arrays.
 * 100% On-Device • Zero server dependencies
 */

const ZipBuilder = {
  // CRC-32 Table
  crcTable: (() => {
    let c;
    const table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c;
    }
    return table;
  })(),

  // Compute CRC-32 checksum
  crc32(str) {
    let crc = 0 ^ (-1);
    const bytes = typeof str === 'string' ? new TextEncoder().encode(str) : str;
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ this.crcTable[(crc ^ bytes[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  },

  /**
   * Build a ZIP Blob from an array of files
   * @param {Array<{name: string, content: string}>} files 
   * @returns {Blob}
   */
  createZip(files) {
    const encoder = new TextEncoder();
    const fileEntries = [];
    let offset = 0;

    // Process each file
    files.forEach(file => {
      const nameBytes = encoder.encode(file.name);
      const contentBytes = typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
      const crc = this.crc32(contentBytes);
      const size = contentBytes.length;

      // Local file header (30 bytes + name length)
      const header = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(header.buffer);

      view.setUint32(0, 0x04034b50, true); // Local file header signature
      view.setUint16(4, 20, true);         // Version needed to extract (2.0)
      view.setUint16(6, 0, true);          // General purpose bit flag
      view.setUint16(8, 0, true);          // Compression method (0 = stored / uncompressed)
      view.setUint16(10, 0, true);         // File last mod time
      view.setUint16(12, 0, true);         // File last mod date
      view.setUint32(14, crc, true);       // CRC-32
      view.setUint32(18, size, true);      // Compressed size
      view.setUint32(22, size, true);      // Uncompressed size
      view.setUint16(26, nameBytes.length, true); // File name length
      view.setUint16(28, 0, true);         // Extra field length
      header.set(nameBytes, 30);

      fileEntries.push({
        nameBytes,
        contentBytes,
        crc,
        size,
        offset,
        header
      });

      offset += header.length + size;
    });

    // Central directory records
    let centralDirSize = 0;
    const centralDirEntries = [];

    fileEntries.forEach(entry => {
      // Central directory header (46 bytes + name length)
      const cdHeader = new Uint8Array(46 + entry.nameBytes.length);
      const view = new DataView(cdHeader.buffer);

      view.setUint32(0, 0x02014b50, true); // Central directory signature
      view.setUint16(4, 20, true);         // Version made by
      view.setUint16(6, 20, true);         // Version needed
      view.setUint16(8, 0, true);          // Bit flag
      view.setUint16(10, 0, true);         // Compression (0 = store)
      view.setUint16(12, 0, true);         // Mod time
      view.setUint16(14, 0, true);         // Mod date
      view.setUint32(16, entry.crc, true); // CRC-32
      view.setUint32(20, entry.size, true);// Compressed size
      view.setUint32(24, entry.size, true);// Uncompressed size
      view.setUint16(28, entry.nameBytes.length, true); // File name length
      view.setUint16(30, 0, true);         // Extra field length
      view.setUint16(32, 0, true);         // Comment length
      view.setUint16(34, 0, true);         // Disk number start
      view.setUint16(36, 0, true);         // Internal file attributes
      view.setUint32(38, 0, true);         // External file attributes
      view.setUint32(42, entry.offset, true); // Relative offset of local header
      cdHeader.set(entry.nameBytes, 46);

      centralDirEntries.push(cdHeader);
      centralDirSize += cdHeader.length;
    });

    // End of central directory record (22 bytes)
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
    eocdView.setUint16(4, 0, true);          // Number of this disk
    eocdView.setUint16(6, 0, true);          // Disk with start of central directory
    eocdView.setUint16(8, fileEntries.length, true);  // Total entries on disk
    eocdView.setUint16(10, fileEntries.length, true); // Total entries
    eocdView.setUint32(12, centralDirSize, true);     // Size of central directory
    eocdView.setUint32(16, offset, true);             // Offset of start of central directory
    eocdView.setUint16(20, 0, true);                  // Comment length

    // Assemble final parts into a Blob
    const parts = [];
    fileEntries.forEach(entry => {
      parts.push(entry.header);
      parts.push(entry.contentBytes);
    });
    centralDirEntries.forEach(cd => parts.push(cd));
    parts.push(eocd);

    return new Blob(parts, { type: 'application/zip' });
  },

  /**
   * Helper: Trigger download of generated ZIP file
   */
  downloadZip(files, zipFilename = 'team-signatures.zip') {
    const blob = this.createZip(files);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
};
