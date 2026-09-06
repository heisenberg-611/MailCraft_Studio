# MailCraft Studio

<div align="center">

```
  __  __       _ _  ____            __ _     ____  _             _ _       
 |  \/  | __ _(_) |/ ___|_ __ __ _ / _| |_  / ___|| |_ _   _  __| (_) ___  
 | |\/| |/ _` | | | |   | '__/ _` | |_| __| \___ \| __| | | |/ _` | |/ _ \ 
 | |  | | (_| | | | |___| | | (_| |  _| |_   ___) | |_| |_| | (_| | | (_) |
 |_|  |_|\__,_|_|_|\____|_|  \__,_|_|  \__| |____/ \__|\__,_|\__,_|_|\___/ 
```

**The Definitive High-Definition Email Signature & Architecture Studio**

[![Version](https://img.shields.io/badge/version-1.1.0-00DC82.svg?style=flat-square)](https://github.com/heisenberg-611/MailCraft_Studio/releases/tag/v1.1)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Client-Side](https://img.shields.io/badge/architecture-100%25%20Client--Side-brightgreen.svg?style=flat-square)](#architecture)
[![Zero-Dependencies](https://img.shields.io/badge/dependencies-0%20(Vanilla%20JS)-orange.svg?style=flat-square)](#technology-stack)
[![Retina HD](https://img.shields.io/badge/DPI-1x%20%7C%202x%20%7C%203x%20%7C%204x-blueviolet.svg?style=flat-square)](#core-features)
[![Deploy with Vercel](https://img.shields.io/badge/deploy-Vercel-black.svg?style=flat-square&logo=vercel)](https://vercel.com/new)

[Overview](#overview) • [Key Features](#key-features) • [Quick Start](#quick-start) • [Email Client Setup](#email-client-setup) • [Architecture](#architecture) • [Deployment](#deployment) • [Author](#author)

</div>

---

## Overview

**MailCraft Studio** is an open-source, high-performance, 100% client-side web application designed for developers, researchers, executives, academics, and creative professionals who demand pixel-perfect, typography-disciplined email signatures and HTML email communications.

Unlike typical cloud-based signature generators that charge monthly subscriptions, inject tracking pixels, or store your personal address book on third-party servers, MailCraft Studio runs **entirely inside your web browser**. Every HTML compilation, 4x Retina canvas rasterization, quotes shuffle, CSV roster parse, and ZIP export happens on your device with **zero telemetry and zero server dependencies**.

---

## Key Features

### 📐 1. Robust HTML Signature Engine (`SignatureEngine`)
- **Strict Table Architecture**: Conforms to W3C HTML 4.01 / XHTML Transitional standards using nested tables with inline styles to guarantee seamless rendering across legacy and modern mail clients (Gmail, Apple Mail, Outlook Desktop, Outlook 365, Thunderbird, Yahoo, and iOS Mail).
- **6 Signature Blueprints**:
  1. `Vertical Divider`: High-contrast dual-column layout with an accent colored vertical separator.
  2. `Horizontal Bar`: Sleek header identity bar with bottom contact rows.
  3. `Two-Column Grid`: Balanced identity on the left, social and contact rows on the right.
  4. `Modern Card`: Encapsulated card aesthetic with accent border accents.
  5. `Minimal Left`: Crisp left-accent border with minimalist typography.
  6. `Compact Inline`: Single-line horizontal flow for ultra-clean daily correspondence.

### 🖼️ 2. High-DPI Avatar & Image Processing Engine (`ImageProcessor`)
- **Retina 2x/3x/4x DPI Scaling**: Eliminates blurry avatars on 4K/5K displays and smartphone screens by rasterizing photos at high pixel densities with explicit HTML display constraints.
- **Dynamic Framing & Shapes**: Full-bleed square, circle (`50%`), squircle (`22%`), and rounded rectangle (`10px`) clipping.
- **In-Browser Image Controls**: Real-time zoom/crop slider, brightness, contrast, and saturation adjustments using HTML5 Canvas.
- **Independent Logo System**: Secondary company / brand logo with distinct shape, scale, and positioning options.

### 🎨 3. Granular 16-Color Palette Engine
- Complete color customization across both signature and full email template elements:
  - **Signature**: Full Name, Job Title, Body Text, Labels, Links, Dividers, Quote Text, and Disclaimers.
  - **Email Template**: Header Text, Header Background, Greeting, Paragraphs, Highlight Box (Title, Text, Background), CTA Button, and Footer Text.
- Synchronized color pickers with bidirectional Hex input fields.

### 💾 4. Production Presets & Custom Preset Manager (`PresetManager`)
- **9 Curated Presets**:
  - `Developer / Terminal`: Neon emerald on obsidian dark.
  - `Academic Scholar`: Deep navy with ORCID, Google Scholar, and ResearchGate identifiers.
  - `Corporate Executive`: Refined slate and graphite typography.
  - `Creative Agency`: Vibrant electric violet with promo banner integration.
  - `Minimalist One-Liner`: Compact horizontal layout.
  - `Marketing & Promo`: High-conversion CTA banner layout.
  - `Silicon Valley`: Crisp modern blue.
  - `Nordic Clean`: Understated minimalist design.
- **Preset CRUD & Backup**: Save named custom presets to `localStorage`, clone presets, export full library as JSON, and import backups with 1 click.

### 👥 5. Team & Organization CSV Batch Generator (`TeamEngine`)
- **Instant CSV Roster Parsing**: Upload any company CSV file with standard headers (`Full Name`, `Job Title`, `Email`, `Phone`, `Department`, `Avatar URL`, etc.).
- **Batch ZIP Generator**: Compiles individual `.html` signatures for every team member into a single downloadable `.zip` file entirely in-browser using [`ZipBuilder`](file:///Users/dhrubojyoti/Projects/portfolio/email_signature/js/zip-builder.js).

### 💬 6. Academic, Tech & Philosophy Quotes Engine (`Quotes`)
- **160+ Curated Quotes**: Computer science, physics, philosophy, and mathematics quotes (Turing, Knuth, Dijkstra, Feynman, Einstein, Marcus Aurelius, etc.).
- **Dynamic Quote Rolling**: 1-click quote shuffler and optional auto-shuffle on every clipboard copy.

### 📋 7. Zero-Data-Loss Multi-MIME Clipboard API (`ClipboardManager`)
- Writes both `text/html` (rich rendered tables with inline CSS) and `text/plain` fallback payloads using the modern `navigator.clipboard.write([new ClipboardItem(...)])` API.
- Native fallback via DOM Range Selection and `document.execCommand('copy')`.

### 📸 8. Lossless 3x Super HD PNG Export
- Instant 1-click PNG rasterization for social media headers, forum profiles, and graphics applications.

### 🌓 9. Email Client Chrome & Dark Mode Simulation
- Live preview switches between **Gmail Web**, **Apple Mail**, and **Outlook Desktop** client chrome.
- Dynamic dark mode simulation testing dark theme contrast and invert filters.

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
1. In MailCraft Studio, click **`[Copy Signature]`**.
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
├── index.html                   # Landing page, feature overview, setup docs, legal modals
├── studio.html                  # Core interactive signature & email builder studio
├── vercel.json                  # Vercel zero-config static hosting & security headers
├── site.webmanifest             # PWA web manifest & theme configurations
├── favicon.ico / favicon.svg    # Tab bar branding & scalable vector icons
├── assets/
│   ├── favicon.svg              # Scalable emerald obsidian SVG favicon
│   ├── favicon-32x32.png        # 32x32 raster favicon
│   ├── favicon-16x16.png        # 16x16 raster favicon
│   ├── apple-touch-icon.png     # 180x180 iOS touch icon
│   ├── icon-192.png / 512.png   # PWA application icons
│   ├── default-avatar.jpg       # Master high-resolution avatar image
│   └── default-avatar.js        # Offline base64 data URI avatar bundle
├── css/
│   ├── studio.css               # Obsidian terminal design system & typography
│   ├── components.css           # UI components (toggles, color pickers, modals, sliders)
│   └── email-preview.css        # Client chrome simulators (Gmail, Apple Mail, Outlook)
├── js/
│   ├── app.js                   # State manager & event coordinator
│   ├── signature-engine.js      # W3C table-layout HTML signature generator
│   ├── image-processor.js       # HTML5 Canvas High-DPI rasterizer & filter pipeline
│   ├── presets.js               # Built-in curated style presets
│   ├── preset-manager.js        # LocalStorage custom preset manager (CRUD + JSON IO)
│   ├── team-engine.js           # CSV roster parser & bulk signature compiler
│   ├── zip-builder.js           # In-browser binary ZIP archive packager
│   ├── quotes.js                # 160+ curated philosophy & tech quotes library
│   ├── icons.js                 # High-resolution social, contact & academic SVG vectors
│   └── dot-matrix.js            # Interactive ambient dot-matrix canvas animation
└── docs/
    ├── ARCHITECTURE.md          # Technical engine specifications
    ├── USER_GUIDE.md            # User manual & installation instructions
    └── IMPROVEMENT_PLAN.md      # Engineering roadmap
```

---

## Technology Stack

- **Core**: Vanilla HTML5, Modern ECMAScript (ES6+), Vanilla CSS3.
- **Design System**: Obsidian Dark Terminal aesthetic with emerald green neon accents (`#00DC82`), custom glassmorphic modals, and interactive dot matrix canvas.
- **Typography**: Google Fonts ([`JetBrains Mono`](https://fonts.google.com/specimen/JetBrains+Mono), [`Geist`](https://fonts.google.com/specimen/Geist), and [`Inter`](https://fonts.google.com/specimen/Inter)).
- **Email Compatibility**: Inline CSS, nested `<table>` layout, `mso-table-lspace/rspace` optimizations, and explicit image dimensions.

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
