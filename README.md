# MailCraft Studio

<div align="center">

```
  __  __       _ _  ____            __ _     ____  _             _ _       
 |  \/  | __ _(_) |/ ___|_ __ __ _ / _| |_  / ___|| |_ _   _  __| (_) ___  
 | |\/| |/ _` | | | |   | '__/ _` | |_| __| \___ \| __| | | |/ _` | |/ _ \ 
 | |  | | (_| | | | |___| | | (_| |  _| |_   ___) | |_| |_| | (_| | | (_) |
 |_|  |_|\__,_|_|_|\____|_|  \__,_|_|  \__| |____/ \__|\__,_|\__,_|_|\___/ 
```

**The Definitive High-Definition Email Signature & Responsive Email Architecture Studio**

[![Version](https://img.shields.io/badge/version-2.2.0-00DC82.svg?style=flat-square)](https://github.com/heisenberg-611/MailCraft_Studio/releases/tag/v2.2.0)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Client-Side](https://img.shields.io/badge/architecture-100%25%20Client--Side-brightgreen.svg?style=flat-square)](#architecture)
[![Zero-Dependencies](https://img.shields.io/badge/dependencies-0%20(Vanilla%20JS)-orange.svg?style=flat-square)](#technology-stack)
[![Retina HD](https://img.shields.io/badge/DPI-1x%20%7C%202x%20%7C%203x%20%7C%204x-blueviolet.svg?style=flat-square)](#core-features)
[![Deploy with Vercel](https://img.shields.io/badge/deploy-Vercel-black.svg?style=flat-square&logo=vercel)](https://vercel.com/new)

[Overview](#overview) • [What's New in v2.2](#whats-new-in-v22) • [Key Features](#key-features) • [Chrome Extension](#chrome-extension) • [Quick Start](#quick-start) • [Email Client Setup](#email-client-setup) • [Architecture](#architecture) • [Deployment](#deployment) • [Author](#author)

</div>

---

## Overview

**MailCraft Studio** is an open-source, high-performance, 100% client-side web application designed for developers, researchers, executives, academics, and creative professionals who demand pixel-perfect, typography-disciplined email signatures and responsive HTML email communications.

Unlike typical cloud-based signature generators that charge monthly subscriptions, inject tracking pixels, or store your personal address book on third-party servers, MailCraft Studio runs **entirely inside your web browser**. Every HTML compilation, 4x Retina canvas rasterization, QR matrix generation, quote shuffle, CSV roster parse, and enterprise deployment package creation happens on your device with **zero telemetry and zero server dependencies**.

---

## 🚀 What's New in v2.2

MailCraft Studio v2.2 introduces remote HTTPS asset hosting, full Day/Dark theme icon adaptation, external media URL support, and real-time session persistence:

- **🌐 Remote HTTPS Asset Hosting (Mobile Gmail Safe)**: 126 pre-rendered Retina 2x PNG icons deployed on Vercel Edge CDN across 5 visual schemes (`brand`, `brand-dark`, `mono`, `white`, `accent`) and root fallback. Eliminates Base64 data bloat, shrinking HTML payload to ~8.2 KB to prevent Gmail's 102KB clipping and mobile image stripping.
- **🌗 Adaptive Day & Dark Theme Icon Engine**: Intelligent dark theme icon routing where dark brand logos (GitHub, X, Medium) automatically adapt to high-contrast `#FFFFFF` in dark mode, ensuring complete visibility across dark backgrounds.
- **🔗 External HTTPS URL Support for Avatars, Logos & Banners**: Added dedicated external HTTPS inputs with "Mobile Gmail Safe" telemetry badges for user avatars, company logos, and campaign promo banners (including click-through URLs).
- **💾 State Persistence Engine & Session Cache**: Implemented dual-layer storage (`sessionStorage` + `localStorage`) with `beforeunload` listeners. In-flight edits to identity, design, custom links, and email templates now completely survive browser tab reloads.
- **🔍 Mobile Gmail Linter Audit**: Real-time compatibility auditor now checks remote image delivery vs Base64 weight, verifying signatures against Gmail's 102KB ceiling.

---

## Key Features

### 📐 1. Robust HTML Signature Engine (`SignatureEngine`)
- **Strict Table Architecture**: Conforms to W3C HTML 4.01 / XHTML Transitional standards using nested tables with inline styles to guarantee seamless rendering across legacy and modern mail clients (Gmail, Apple Mail, Outlook Desktop, Outlook 365, Thunderbird, Yahoo, and iOS Mail).
- **13 Signature Blueprints**:
  1. `Vertical Divider`: High-contrast dual-column layout with an accent colored vertical separator.
  2. `Horizontal Bar`: Sleek header identity bar with bottom contact rows.
  3. `Two-Column Grid`: Balanced identity on the left, social and contact rows on the right.
  4. `Modern Card`: Encapsulated card aesthetic with accent border accents.
  5. `Header Banner`: Top hero brand banner bar layout.
  6. `Academic Multi-Affiliation`: Editorial faculty & laboratory multi-affiliation layout.
  7. `Micro Thread Quick Reply`: Ultra-minimal single-row quick reply signature.
  8. `ASCII Terminal Obsidian`: Monospace hacker terminal with command prompt prefixes.
  9. `Minimal Left`: Crisp left-accent border with minimalist typography.
  10. `Compact Inline`: Single-line horizontal flow for ultra-clean daily correspondence.
  11. `Clean Typographic`: Zero-image mobile-safe layout with bullet-separated text hyperlinks.
  12. `Editorial Serif`: Refined left accent bar with pipe-separated text hyperlinks and zero images.
  13. `Modern Chip Badges`: Interactive CSS pill badges with background tints and zero image dependencies.

### ✏️ 2. Direct WYSIWYG Inline Live Editing
- **Click-and-Type Canvas**: Edit your name, role, organization, phone, email, bio, or quote directly inside the live email client preview stage.
- **Two-Way Synchronization**: Edits in the canvas immediately update the sidebar input fields and trigger automatic state persistence.
- **Link Interception**: Prevents accidental navigation during design and editing sessions.

### 🧩 3. Universal Modular Block Organizer
- **Customizable Block Order**: Re-order identity rows with 1-click Move Up / Move Down controls:
  - `Name & Title`
  - `Avatar / Logo`
  - `Contact Rows`
  - `Social Badges`
  - `Badges & CTA Buttons`
  - `Quotes Block`
  - `Promo Banner`
  - `Legal Disclaimer`
- **Universal Engine Support**: Works consistently across all 10 architectural templates.

### 🖼️ 4. High-DPI Avatar & Image Processing Engine (`ImageProcessor`)
- **Retina 2x/3x/4x DPI Scaling**: Eliminates blurry avatars on 4K/5K displays and smartphone screens by rasterizing photos at high pixel densities with explicit HTML display constraints.
- **Dynamic Framing & Shapes**: Full-bleed square, circle (`50%`), squircle (`22%`), and rounded rectangle (`10px`) clipping.
- **In-Browser Image Controls**: Real-time zoom/crop slider, brightness, contrast, and saturation adjustments using HTML5 Canvas.
- **Independent Logo System**: Secondary company / brand logo with distinct shape, scale, and positioning options.

### 📱 5. QR Code Matrix & RFC 2426 vCard 3.0 Engine (`qr-vcard-engine.js`)
- **Galois Field GF(256) Reed-Solomon Encoding**: Pure JavaScript QR matrix generator rendering high-resolution scannable contact badges directly to SVG and Canvas.
- **RFC 2426 vCard Compiler**: In-browser `.vcf` contact card generator with instant download and direct signature embedding.

### 🎨 6. Granular 16-Color Palette Engine
- Complete color customization across both signature and full email template elements:
  - **Signature**: Full Name, Job Title, Body Text, Labels, Links, Dividers, Quote Text, and Disclaimers.
  - **Email Template**: Header Text, Header Background, Greeting, Paragraphs, Highlight Box, CTA Button, and Footer Text.
- Synchronized color pickers with bidirectional Hex input fields.

### 💾 7. Production Presets & Custom Preset Manager (`PresetManager`)
- **12+ Curated Presets**: Developer / Terminal, Academic Scholar, Corporate Executive, Creative Agency, Minimalist One-Liner, Marketing & Promo, Silicon Valley, Nordic Clean, Cyberpunk Neon, and more.
- **Preset CRUD & Backup**: Save named custom presets to `localStorage`, clone presets, export full library as JSON, and import backups with 1 click.

### 👥 8. Team & Organization CSV Batch Generator (`TeamEngine`)
- **Instant CSV Roster Parsing**: Upload any company CSV file with standard headers (`Full Name`, `Job Title`, `Email`, `Phone`, `Department`, `Avatar URL`, etc.).
- **Batch ZIP Generator**: Compiles individual `.html` signatures for every team member into a single downloadable `.zip` file entirely in-browser using [`ZipBuilder`](file:///Users/dhrubojyoti/Projects/portfolio/email_signature/js/zip-builder.js).

### 💬 9. Academic, Tech & Philosophy Quotes Engine (`Quotes`)
- **160+ Curated Quotes**: Computer science, physics, philosophy, and mathematics quotes (Turing, Knuth, Dijkstra, Feynman, Einstein, Marcus Aurelius, etc.).
- **Dynamic Quote Rolling**: 1-click quote shuffler and optional auto-shuffle on every clipboard copy.

### 📋 10. Zero-Data-Loss Multi-MIME Clipboard API (`ClipboardManager`)
- Writes both `text/html` (rich rendered tables with inline CSS) and `text/plain` fallback payloads using the modern `navigator.clipboard.write([new ClipboardItem(...)])` API.
- Native fallback via DOM Range Selection and `document.execCommand('copy')`.

### 📸 11. Lossless Super HD PNG Export
- Instant 1-click PNG rasterization for social media headers, forum profiles, and graphics applications.

### 🌓 12. Email Client Chrome & Dark Mode Simulation
- Live preview switches between **Gmail Web**, **Apple Mail**, and **Outlook Desktop** client chrome.
- Dynamic dark mode simulation testing dark theme contrast and invert filters.

---

## 🧩 Chrome Extension (Manifest V3)

MailCraft Studio includes an official browser extension for Google Chrome, Brave, Microsoft Edge, and Chromium browsers:

### Features
- **1-Click Gmail & Outlook Injection**: Directly inject your active signature into any open compose window.
- **Live Profile Switcher**: Toggle effortlessly between *Developer*, *Academic*, *Corporate*, and *Custom* identities.
- **Rich-Text Clipboard Copy**: Copy formatted HTML signatures for any client in one click.
- **100% Offline & Private**: Zero external network requests or tracking.

### Installation
1. Navigate to `chrome://extensions/` in your browser.
2. Enable **"Developer mode"** in the top-right corner.
3. Click **"Load unpacked"** and select the [`extension/`](file:///Users/dhrubojyoti/Projects/portfolio/email_signature/extension/) directory.
4. You can also export a ready-to-load Extension ZIP directly from the studio under **Admin Tools > Download Chrome Extension ZIP**.

---

## Quick Start

MailCraft Studio is 100% static and requires no compilers, build pipelines, or npm packages.

### Option 1: Direct Browser Launch
Simply open [`index.html`](file:///Users/dhrubojyoti/Projects/portfolio/email_signature/index.html) in any modern web browser (Chrome, Firefox, Safari, Edge, Arc, Brave).

### Option 2: Local HTTP Server

```bash
# Clone repository
git clone https://github.com/heisenberg-611/MailCraft_Studio.git
cd MailCraft_Studio

# Using Python 3
python3 -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

Open `http://localhost:8080` in your browser.

---

## Email Client Setup

### 🔴 Gmail & Google Workspace
1. In MailCraft Studio, click **`[Copy Signature]`**.
2. Open Gmail > click the **Settings Gear (⚙)** > **See all settings**.
3. Under the **General** tab, scroll down to the **Signature** section.
4. Click **+ Create new**, name your signature, and click in the signature editor.
5. Press <kbd>Cmd</kbd> + <kbd>V</kbd> (macOS) or <kbd>Ctrl</kbd> + <kbd>V</kbd> (Windows) to paste.
6. Set the signature as default for **New Emails** and **On Reply/Forward**.
7. Scroll down to the bottom and click **Save Changes**.

### 🍏 Apple Mail (macOS)
1. In MailCraft Studio, click **`[Copy Signature]`** (or export `.mailsignature` in Admin Tools).
2. Open Apple Mail > **Settings** (or **Preferences**) > **Signatures** tab.
3. Select your mail account and click **`+`** to add a new signature.
4. **Important**: Uncheck *"Always match my default message font"*.
5. Paste (<kbd>Cmd</kbd> + <kbd>V</kbd>) into the signature preview pane and close settings.

### 🔷 Microsoft Outlook (Desktop & Web 365)
- **Outlook Web (M365)**:
  1. Click **Settings Gear (⚙)** > **Mail** > **Compose and reply**.
  2. Under *Email signature*, click **+ New signature**, paste (<kbd>Ctrl</kbd> + <kbd>V</kbd>), and click **Save**.
- **Outlook Desktop (Windows/Mac)**:
  1. Go to **File** > **Options** > **Mail** > **Signatures...**
  2. Click **New**, name your signature, click in the edit box, and paste (<kbd>Ctrl</kbd> + <kbd>V</kbd>).
  3. Click **OK** to save.

### 🐦 Mozilla Thunderbird
1. Click **`[View Code]`** in MailCraft Studio and click **`[Copy HTML]`**.
2. In Thunderbird, right-click your account > **Settings**.
3. Check the box **"Use HTML (e.g., &lt;b&gt;bold&lt;/b&gt;)"**.
4. Paste the raw HTML into the **Signature text** box.

---

## Architecture

```
MailCraft_Studio/
├── index.html                   # Showcase landing page, feature index, legal policies
├── studio.html                  # Master Studio IDE & live preview environment
├── vercel.json                  # Zero-config static deployment & security headers
├── site.webmanifest             # PWA manifest & application icons
├── sw.js                        # Offline PWA Stale-While-Revalidate service worker
├── favicon.ico / favicon.svg    # Tab bar branding & vector favicons
├── assets/
│   ├── favicon.svg              # Scalable emerald SVG favicon
│   ├── favicon-32x32.png        # 32x32 raster favicon
│   ├── favicon-16x16.png        # 16x16 raster favicon
│   ├── apple-touch-icon.png     # 180x180 iOS touch icon
│   ├── icon-192.png / 512.png   # PWA application icons
│   ├── default-avatar.jpg       # High-resolution photo asset
│   └── default-avatar.js        # Offline Base64 embedded avatar module
├── css/
│   ├── studio.css               # Obsidian dark terminal UI design system & typography
│   ├── components.css           # UI components (sliders, chips, toggles, color pickers, modals)
│   └── email-preview.css        # Client chrome simulators (Gmail, Apple Mail, Outlook)
├── js/
│   ├── app.js                   # Application coordinator & state persistence
│   ├── signature-engine.js      # W3C table-layout HTML signature engine (10 Blueprints)
│   ├── email-template-engine.js # Responsive HTML email newsletter / outreach builder
│   ├── image-processor.js       # HTML5 Canvas High-DPI rasterizer & filter engine
│   ├── qr-vcard-engine.js       # Zero-dependency Reed-Solomon QR & RFC 2426 vCard 3.0 engine
│   ├── banner-builder.js        # HTML5 Canvas 2x Retina promotional banner designer
│   ├── admin-tools.js           # Multi-platform deployment generator (.mailsignature, .htm, .gs, .ps1, extension zip)
│   ├── linter.js                # Real-time email size & Gmail 102KB clipping safety auditor
│   ├── presets.js               # Built-in aesthetic presets & template definitions
│   ├── preset-manager.js        # LocalStorage custom preset manager (CRUD + JSON IO)
│   ├── team-engine.js           # Batch CSV parsing, team roster management & Zip export
│   ├── zip-builder.js           # In-browser binary ZIP archive packager
│   ├── quotes.js                # 160+ curated philosophy & tech quotes library
│   ├── icons.js                 # High-definition SVG icons with XML namespace
│   ├── guides.js                # Interactive email client setup modal guides
│   └── dot-matrix.js            # Ambient dot-matrix canvas animation
├── extension/                   # Manifest V3 Chrome Extension
│   ├── manifest.json            # Extension manifest v3 configuration
│   ├── popup.html               # Extension interactive popup UI
│   ├── popup.css                # Extension popup styling
│   ├── popup.js                 # Signature switcher & 1-click compose injector logic
│   ├── content.js               # Content script for Gmail & Outlook Web DOM injection
│   └── README.md                # Chrome extension loading handbook
└── docs/
    ├── ARCHITECTURE.md          # Technical engine specifications
    ├── USER_GUIDE.md            # User manual & installation instructions
    └── IMPROVEMENT_PLAN.md      # Feature roadmap & implementation history
```

---

## Technology Stack

- **Core**: Vanilla HTML5, Modern ECMAScript (ES6+), Vanilla CSS3.
- **Design System**: Obsidian Dark Terminal aesthetic with emerald green neon accents (`#00DC82`), custom glassmorphic modals, and interactive dot matrix canvas.
- **Typography**: Google Fonts ([`JetBrains Mono`](https://fonts.google.com/specimen/JetBrains+Mono), [`Geist`](https://fonts.google.com/specimen/Geist), and [`Inter`](https://fonts.google.com/specimen/Inter)).
- **Email Compatibility**: Inline CSS, nested `<table>` layout, `mso-table-lspace/rspace` optimizations, MSO VML vector roundrect buttons, and explicit image dimensions.

---

## Deployment

### Deploy to Vercel (1-Click)

MailCraft Studio includes a pre-configured [`vercel.json`](file:///Users/dhrubojyoti/Projects/portfolio/email_signature/vercel.json) file:

1. Import your GitHub fork/repository into [Vercel](https://vercel.com/new).
2. Set **Framework Preset** to **`Other`**.
3. Leave **Build Command** and **Output Directory** empty.
4. Click **Deploy**. Clean URLs (`/studio`) and caching headers are configured automatically.

### Deploy to GitHub Pages
1. Go to repository **Settings** > **Pages**.
2. Select **Source**: `Deploy from a branch` > branch: `main` / root (`/`).
3. Click **Save**.

---

## Privacy & Client-Side Guarantee

MailCraft Studio is built on strict privacy principles:
- **Zero Remote Storage**: Your personal identity data, phone numbers, and avatars are never transmitted to any external server.
- **Zero Tracking**: No advertising cookies, no Google Analytics, and no telemetry scripts.
- **Local Persistence**: Drafts and custom presets are stored exclusively in your browser's `localStorage` (`mailcraft_state`, `mailcraft_user_presets`).
- **Data Portability**: You can export your entire preset library as a standalone JSON backup file at any time.

---

## Author

**Dhrubojyoti Saha**
- GitHub: [@heisenberg-611](https://github.com/heisenberg-611)
- LinkedIn: [Dhrubojyoti Saha](https://www.linkedin.com/in/dhrubojyoti-saha-3084a02bb/)

---

## License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for personal, academic, and commercial purposes.
