# MailCraft Studio Architecture & System Design

## Overview
MailCraft Studio is a 100% client-side, zero-backend web application engineered to generate pixel-perfect, High-Definition (Retina 2x/3x/4x) email signatures and responsive HTML email templates.

---

## System Architecture

```
email_signature/
├── index.html                   # Master UI shell & layout
├── assets/
│   ├── default-avatar.js        # High-res embedded photo asset
│   └── default-avatar.jpg       # Raw image asset
├── css/
│   ├── studio.css               # Main glassmorphic dark UI design system
│   ├── components.css           # Sliders, shape buttons, DPI chips, toggles
│   └── email-preview.css        # Gmail, Apple Mail, Outlook simulation chrome
├── js/
│   ├── icons.js                 # High-definition SVG icons with XML namespace
│   ├── presets.js               # Aesthetic style presets & email blueprints
│   ├── image-processor.js       # HTML5 Canvas High-DPI scaler & filter engine
│   ├── signature-engine.js      # Email-safe nested table HTML generator
│   ├── email-template-engine.js # Responsive full email builder
│   ├── clipboard.js             # Modern rich-text HTML clipboard writer
│   ├── guides.js                # Email client setup modal guides
│   └── app.js                   # Application coordinator & state manager
└── docs/
    ├── IMPROVEMENT_PLAN.md      # Comprehensive feature & evolution roadmap
    ├── ARCHITECTURE.md          # System architecture & engine specs
    └── USER_GUIDE.md            # Usage & installation instructions
```

---

## Core Engine Modules

### 1. High-DPI Canvas Image Processing Pipeline (`image-processor.js`)
- **Retina Scaling**: Renders uploaded or default photos at physical pixel density = `display_size * DPI_multiplier` (1x, 2x, 3x, 4x).
- **Clipping Masks**: Native 2D canvas clipping paths for Circle, Squircle, Rounded Rectangle, and Square.
- **Filter Matrix**: Dynamic brightness, contrast, and saturation filters applied directly to pixel buffers.
- **Export**: Base64 encoded PNG/JPEG data URIs.

### 2. Email-Safe HTML Generation Engine (`signature-engine.js`)
- **Nested Table Architecture**: Email clients (especially Outlook Desktop) do not support Flexbox or CSS Grid. Layouts are constructed with nested `<table>`, `<tr>`, and `<td>` elements.
- **Inline Styling**: Every style rule is inlined directly onto element `style="..."` attributes with explicit `mso-table-lspace: 0pt` and `mso-table-rspace: 0pt` fixes.
- **Explicit Image Constraints**: Images have explicit HTML `width="..."` and `height="..."` attributes in addition to inline CSS to prevent image explosion in Outlook.

### 3. Clipboard API Exporter (`clipboard.js`)
- Uses `navigator.clipboard.write([new ClipboardItem({'text/html': ..., 'text/plain': ...})])` to write multi-mime payloads.
- Enables direct pasting (`Cmd+V` / `Ctrl+V`) into Gmail, Apple Mail, and Outlook with zero loss of formatting.
- Includes automatic fallback using DOM range selection and `document.execCommand('copy')`.
