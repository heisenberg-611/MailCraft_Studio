# MailCraft Studio Architecture & System Design

## Overview
MailCraft Studio is a 100% client-side, zero-backend enterprise web application engineered to generate pixel-perfect, High-Definition (Retina 2x/3x/4x) email signatures, responsive HTML email templates, and enterprise deployment packages.

---

## System Architecture

```
email_signature/
├── studio.html                  # Master Studio IDE UI & layout
├── index.html                   # Landing page redirect / showcase
├── site.webmanifest             # PWA Web Application Manifest
├── sw.js                        # Offline PWA Stale-While-Revalidate Service Worker
├── assets/
│   ├── default-avatar.js        # High-res embedded photo asset
│   └── default-avatar.jpg       # Raw image asset
├── css/
│   ├── studio.css               # Main glassmorphic dark UI design system & linter/banner styling
│   ├── components.css           # Sliders, shape buttons, DPI chips, toggles, gauge meters
│   └── email-preview.css        # Gmail, Apple Mail, Outlook simulation chrome
├── js/
│   ├── qr-vcard-engine.js       # Zero-dependency Reed-Solomon QR & RFC 2426 vCard 3.0 engine
│   ├── banner-builder.js        # HTML5 Canvas 2x Retina promotional banner designer
│   ├── admin-tools.js           # Desktop files (.mailsignature, .htm) & Admin deployers (.gs, .ps1)
│   ├── linter.js                # Real-time email size & Gmail 102KB clipping safety auditor
│   ├── icons.js                 # High-definition SVG icons with XML namespace
│   ├── quotes.js                # Curated inspirational quote shuffler
│   ├── presets.js               # 12+ aesthetic presets & 10 architectural templates
│   ├── preset-manager.js        # LocalStorage custom preset persistence & JSON export/import
│   ├── team-engine.js           # Batch CSV parsing, team roster management & 1-click Zip exporter
│   ├── image-processor.js       # HTML5 Canvas High-DPI scaler & filter engine
│   ├── signature-engine.js      # Email-safe nested table HTML generator (10 Blueprints)
│   ├── email-template-engine.js # Responsive full email builder
│   ├── clipboard.js             # Modern rich-text HTML clipboard writer
│   ├── guides.js                # Email client setup modal guides
│   ├── dot-matrix.js            # Ambient canvas background visualizer
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

### 2. Zero-Dependency QR Matrix & RFC 2426 vCard 3.0 Engine (`qr-vcard-engine.js`)
- **Galois Field GF(256) Reed-Solomon Encoding**: Pure JavaScript QR matrix generator with error correction levels L and M, rendering directly to vector SVG and Canvas 2x/3x PNG.
- **vCard 3.0 Compiler**: Generates RFC 2426 compliant `.vcf` contact cards with structured names, organizations, contact endpoints, custom metadata notes, and instant 1-click downloads.
- **Dynamic Signature Embedding**: Injects high-resolution scannable contact badges into signatures with zero external network requests or tracking servers.

### 3. Real-Time Compatibility & Size Linter (`linter.js`)
- **Gmail 102KB Clipping Safety**: Real-time byte length calculation against Gmail's 102,400 byte cutoff with visual meter and alert rating.
- **MSO Word Layout Engine Verification**: Validates table structures, zero-spacing resets (`mso-table-lspace: 0pt; mso-table-rspace: 0pt;`), and border collapses.
- **Dark Mode Dual Protocol**: Checks for `@media (prefers-color-scheme: dark)` and Outlook Web `[data-ogsc]` selector compliance.
- **Interactive Checklist Report**: Modal dialog offering itemized pass/warn/fail status chips and 1-click clipboard export of audit diagnostics.

### 4. Interactive Promotional Campaign Banner Designer (`banner-builder.js`)
- **2x Retina Canvas Rendering**: Instant on-device generation of high-resolution marketing banners (Hiring, Research Papers, Product Launches, Keynotes, Custom).
- **Custom Gradients & Typography**: Preset color themes (Emerald Matrix, Electric Sapphire, Cyber Violet, Amber Gold, Crimson, Dark Slate) with auto-contrast CTA button calculation.
- **Instant Signature Injection**: 1-click transfer of canvas output to active signature promo banner.

### 5. Enterprise Deployment & Desktop File Exporter (`admin-tools.js`)
- **macOS Apple Mail**: Generates `.mailsignature` files with RFC 822 MIME headers (`Content-Type`, `Message-Id: <UUID@mailcraft.local>`, `Mime-Version: 1.0`).
- **Windows Microsoft Outlook**: Generates `.htm` files formatted for `%APPDATA%\Microsoft\Signatures\`.
- **Mozilla Thunderbird**: Generates clean HTML snippets.
- **Google Workspace Admin Deployer**: Generates ready-to-run Google Apps Script (`.gs`) using Gmail and Admin Directory APIs for single-user or domain-wide batch deployment.
- **Microsoft 365 Exchange Online Deployer**: Generates PowerShell (`.ps1`) scripts utilizing `Set-MailboxMessageConfiguration` with Base64 payload transport.

### 6. Email-Safe HTML Generation Engine (`signature-engine.js`)
- **10 Architectural Layout Blueprints**:
  1. `vertical-divider` - Classic terminal and modern vertical divider.
  2. `horizontal-bar` - Sleek horizontal accent separator.
  3. `two-column` - Corporate dual-column layout.
  4. `modern-card` - Boxed container card design.
  5. `header-banner` - Top hero brand banner bar.
  6. `academic-affil` - Editorial faculty & laboratory multi-affiliation.
  7. `micro-thread` - Minimal single-row quick reply signature.
  8. `ascii-terminal` - Monospace hacker terminal with prompt prefixes.
  9. `minimal-left` - Left-aligned clean minimalist layout.
  10. `compact-inline` - Single-line ultra-compact signature.
- **Add-on Injection**: Renders Calendar booking badges (VML-safe bulletproof buttons), live dynamic status indicators, QR badges, and dynamic custom key-value rows.

### 7. Offline Progressive Web App (`sw.js`)
- Stale-While-Revalidate caching strategy for instant offline studio access.
