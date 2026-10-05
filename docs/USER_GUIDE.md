# MailCraft Studio User Guide & Installation Handbook (v2.2)

## Quick Start

### Running the Application
1. Double-click [index.html](file:///Users/dhrubojyoti/Projects/portfolio/email_signature/index.html) to open directly in any modern web browser, or:
2. Run a local server:
   ```bash
   python3 -m http.server 8080
   ```
   and visit `http://localhost:8080`.

---

## Interactive Studio Features (v2.2)

### 0. State Persistence & Reload Survival (New in v2.2)
- All edits (Identity, Avatars, Colors, Custom Links, Email Templates) automatically persist in real time via dual `sessionStorage` and `localStorage` caching.
- Refreshing the browser or switching tabs preserves 100% of your in-flight progress without losing work.

### 0.1 Remote HTTPS Image Assets (Mobile Gmail Safe)
- Social icons automatically link to high-speed, Edge CDN hosted Retina PNGs on `mailcraftstudio.vercel.app` across 5 visual schemes and Day/Dark modes.
- Enter external HTTPS URLs for your Avatar, Company Logo, and Promo Banner to ensure complete delivery on mobile phone mail apps (iOS Mail, Android Gmail) without image stripping or 102KB truncation.

### 1. Direct WYSIWYG Live Canvas Editing
- Click directly on any text element in the signature preview pane (Name, Job Title, Organization, Phone, Email, Bio, Quote).
- Type naturally to update your signature; your changes automatically sync back to the sidebar input controls.

### 2. Universal Modular Block Organizer
- Re-order your signature elements by clicking the **Move Up [▲]** and **Move Down [▼]** buttons under **Design > Modular Block Order**.
- Orderable modules include:
  - `Name & Title`
  - `Avatar / Logo`
  - `Contact Rows`
  - `Social Badges`
  - `Badges & CTA Buttons`
  - `Quotes Block`
  - `Promo Banner`
  - `Legal Disclaimer`

### 3. 10 Architectural Layout Blueprints
- Open the **Design** tab and choose your layout:
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

### 4. High-Definition Photo / Logo System
- Open the **Dual Media** tab.
- Upload any PNG, JPEG, WEBP, or SVG file (or use the built-in high-definition avatar).
- Choose your DPI scaling: **1x Standard**, **2x Retina (Recommended)**, **3x Super HD**, or **4x Ultra HD**.
- Select shape (*Circle, Squircle, Rounded, Square*), display size, zoom/crop, border width, and color.
- Configure an independent secondary company/brand logo.

### 5. QR Code & vCard 3.0 Engine
- Open the **Add-ons** tab to enable a contact QR code.
- Generates a pure client-side Reed-Solomon QR matrix linking to an RFC 2426 `.vcf` contact card or custom URL.

### 6. Chrome Extension (Manifest V3)
- Navigate to `chrome://extensions/` in Chrome/Brave/Edge.
- Enable **Developer mode** and click **Load unpacked**.
- Select the `extension/` directory.
- Use the extension popup to switch signatures and inject directly into Gmail or Outlook Web compose boxes with 1 click.

### 7. Full Email Builder Mode
- Switch to **Full Email Builder** in the top navigation bar.
- Choose a blueprint (*Professional Outreach, Portfolio Showcase, Meeting Follow-up, Thesis Update, Formal Inquiry*).
- Customize the subject line, preheader preview text, greeting, paragraphs, bullet points, CTA button, and closing.
- Use the **Preheader Preview** toggle to inspect inbox envelope rendering with anti-leak whitespace padding.

---

## Installing into Email Clients

### Gmail (Web & Workspace)
1. Click **"Copy Signature"** in MailCraft Studio.
2. In Gmail, click the **Settings icon (gear)** > **See all settings**.
3. Under the **General** tab, scroll to **Signature** and click **+ Create new**.
4. Click inside the text box and press `Cmd + V` (Mac) or `Ctrl + V` (Windows) to paste.
5. Set the new signature as default for new emails and replies.
6. Scroll down and click **Save Changes**.

### Apple Mail (macOS)
1. Click **"Copy Signature"** (or use **Admin Tools > macOS Apple Mail (.mailsignature)**).
2. Open Apple Mail > **Settings** (or **Preferences**) > **Signatures** tab.
3. Select your account and click **+**.
4. Uncheck *"Always match my default message font"*.
5. Paste (`Cmd + V`) into the signature box and close settings.

### Outlook (Microsoft 365 & Desktop)
1. Click **"Copy Signature"** (or use **Admin Tools > Windows Outlook (.htm)**).
2. In Outlook Web: **Settings (gear)** > **Mail** > **Compose and reply** > Paste into signature box and Save.
3. In Outlook Desktop: **File** > **Options** > **Mail** > **Signatures** > New > Paste into editor.

### Mozilla Thunderbird
1. Click **View Code** in MailCraft Studio and click **Copy HTML**.
2. In Thunderbird, right-click your account > **Settings**.
3. Check the box **"Use HTML (e.g., &lt;b&gt;bold&lt;/b&gt;)"**.
4. Paste the raw HTML into the **Signature text** box.
