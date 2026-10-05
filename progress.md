# MailCraft Studio - HTTPS Remote Assets & Mobile Gmail Compatibility

## Project Overview
Implementation of direct HTTPS asset linking for all email signature graphics (Avatar, Company Logo, Social Icons, Campaign Promo Banner) to prevent mobile Gmail app from stripping/blocking embedded Base64 (`data:image/...`) images and to prevent email truncation under Gmail's 102KB clipping limit.

---

## Technical Context & Architectural Decisions

### 1. The Mobile Gmail Constraint
- **Problem**: The Gmail Mobile App (iOS & Android) actively drops or fails to render inline Base64 Data URIs (`data:image/png;base64,...`). Google's Image Proxy (`googleusercontent.com/proxy`) is designed to cache HTTP/HTTPS endpoints and ignores `data:` URIs.
- **Size Bloat**: Base64 images inflate payload size by ~33%. Including a Retina avatar and multiple social icons in Base64 easily exceeds Gmail's strict **102KB clipping threshold**, causing Gmail to truncate the email with `[Message clipped] View entire message`.
- **Solution**:
  - When **HTTPS links are present**: Images are referenced via `<img src="https://...">` and fonts use standard email-safe font stacks without Base64 `@font-face` blobs. HTML signature size remains under 5KB to 8KB (100% Mobile Gmail Safe).
  - When **no link is present**: Falls back to local embedded Base64 for offline drag-and-drop convenience.

### 2. Asset Strategy
- **Social Logos / Icons**: **Automated** — 21 pre-rendered Retina PNG icons hosted under `/assets/icons/{id}.png` on the Vercel-deployed site (`window.location.origin` or `https://mailcraftstudio.vercel.app`). Automatically linked in the signature HTML with zero manual input required from the user.
- **Personal Avatar**: **External Link Input** — Because avatars are unique to each user, an external HTTPS URL field is provided (e.g. GitHub avatar, LinkedIn, Cloudinary, Imgur, S3). Takes priority over local Canvas Base64.
- **Company Logo**: **External Link Input** — Unique to each organization, an external HTTPS URL field is provided.
- **Campaign Promo Banner**:
  - **Banner Image Source**: Supports external HTTPS URL so the graphic displays on mobile Gmail without Base64 bloat.
  - **Banner Destination**: Supports click-through target URL with optional UTM tracking parameters.
- **Team Batch Engine**: Preserves per-member HTTPS URLs when importing CSV rosters.

---

## Implementation Progress Tracker

- [x] **Task 1: Assets Setup**
  - [x] Copied all 21 social icons from `scratch/test_*.png` to `assets/icons/*.png` for permanent Vercel Edge CDN hosting.
- [x] **Task 2: Core Signature Engine Updates (`js/signature-engine.js` & `extension/signature-engine.js`)**
  - [x] Added Vercel/asset origin detection helper (`getAssetOrigin(settings)`).
  - [x] Updated `renderAvatarHtml`: prioritize `d.avatarUrl` when it starts with `http://` or `https://` (also supports relative `/assets/...` resolution).
  - [x] Updated `renderLogoHtml`: prioritize `d.logoUrl` when it starts with `http://` or `https://` (also supports relative `/assets/...` resolution).
  - [x] Updated `renderPromoBanner`: prioritize `d.promoBanner.imageUrl` when it starts with `http://` or `https://` and wrapped in bulletproof email markup.
  - [x] Updated `renderSocialsRow`: automatically link social icons to `${origin}/assets/icons/${item.id}.png` (fallback to Base64 when explicitly requested).
- [x] **Task 3: Studio UI Additions (`studio.html`)**
  - [x] Added External HTTPS URL input for Avatar in Tab [02] with "Mobile Gmail Safe" badge.
  - [x] Added External HTTPS URL input for Company Logo in Tab [02] with "Mobile Gmail Safe" badge.
  - [x] Added External HTTPS URL input for Campaign Promo Banner Image in Tab [05] with "Mobile Gmail Safe" badge.
- [x] **Task 4: Application State & Input Bindings (`js/app.js`)**
  - [x] Bound `avatarUrlInput` to `this.state.data.avatarUrl`.
  - [x] Bound `logoUrlInput` to `this.state.data.logoUrl`.
  - [x] Bound `promoBannerImageUrl` to `this.state.data.promoBanner.imageUrl`.
  - [x] Updated `updateAvatarTelemetry` to display "Remote HTTPS Asset" and "0 KB Base64 (Mobile Gmail Safe)".
  - [x] Synchronized all inputs in `syncFormWithState`.
- [x] **Task 5: Team Batch Engine (`js/team-engine.js`)**
  - [x] Verified member `avatarUrl` HTTPS links are preserved and properly compiled in batch signatures.
- [x] **Task 6: Compatibility Linter (`js/linter.js`)**
  - [x] Added `mobile_gmail_images` check: audits signature for Base64 vs remote HTTPS links. Passes with green check when all images are HTTPS links.
- [x] **Task 7: Testing & Verification**
  - [x] Created and executed `scratch/test-https-implementation.js` covering all 6 test suites. All 6 passed.
  - [x] Verified HTML payload byte count: reduced to ~8.2 KB (well below Gmail's 102 KB limit).
  - [x] Synced changes between `js/` and `extension/`.
- [x] **Task 8: Local Preview & Production Vercel Origin Optimization**
  - [x] Enhanced `getAssetOrigin(s)`: during live studio preview (`isExport === false`), uses relative `./` resolution so local icons load reliably under any local dev server, subpath, or file protocol.
  - [x] Added robust self-nullifying `onerror` fallback (`this.onerror=null; this.src='...'`) to prevent broken icon frames in local preview.
  - [x] Confirmed that for exported signatures (`isExport === true`), assets point to production Vercel (`https://mailcraftstudio.vercel.app/assets/icons/*.png`). Pushing to Vercel is required for external email recipients on mobile Gmail.

---

## Verification Test Results
```
--- TEST 1: Automatic Hosted HTTPS Social Icons ---
✔ Social icons automatically use remote Vercel HTTPS links
--- TEST 2: Unique Avatar & Company Logo External HTTPS Links ---
✔ Unique avatar and company logo render external HTTPS links directly without base64 embedding
--- TEST 3: Campaign Promo Banner HTTPS Links ---
✔ Campaign promo banner properly links remote HTTPS image and click destination
--- TEST 4: Relative Path Resolution to Vercel Origin ---
✔ Relative asset paths correctly auto-expand to full Vercel HTTPS URLs
--- TEST 5: Linter Mobile Gmail Audit Check ---
Total HTML payload bytes: 8398 (8.2 KB)
✔ Linter successfully validates 100% Mobile Gmail App remote image delivery
--- TEST 6: Graceful Base64 Fallback When Requested ---
✔ Linter warns when Base64 is used, guiding users to HTTPS

========================================
 ALL 6 VERIFICATION TEST SUITES PASSED! 
========================================
```

---

## Local Testing vs. Vercel Push Explanation
1. **Why logos/icons don't show when testing external emails before pushing to Vercel**:
   - The exported signature HTML targets `https://mailcraftstudio.vercel.app/assets/icons/*.png`.
   - Because `assets/icons/` is a new directory created locally and hasn't been committed/pushed to Vercel yet, requesting those URLs from Gmail or an email client returns `HTTP 404 Not Found`.
   - **Resolution**: Pushing to Vercel (`git add .`, `git commit`, `git push`) publishes the icons to Vercel's global Edge CDN, making them immediately accessible to Gmail and all email apps.
2. **Local Studio Preview (`studio.html`)**:
   - In the live editor canvas, `SignatureEngine` now uses relative paths (`./assets/icons/*.png`) with an automatic in-memory Base64 fallback, ensuring live preview always displays all icons locally even before deploying to Vercel.
