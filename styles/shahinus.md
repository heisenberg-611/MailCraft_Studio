/* ==========================================================================
   SAHINUR.DEV THEME & DESIGN SYSTEM
   Source: https://www.sahinur.dev/
   Style: Matrix Terminal / Cyberpunk Hacker / Dev CLI Architecture
   ========================================================================== */

:root {
  /* Core Color Palette */
  --sahinur-accent: #00FF88;
  --sahinur-accent-hover: #00e57a;
  --sahinur-accent-dim: rgba(0, 255, 136, 0.1);
  --sahinur-accent-glow: rgba(0, 255, 136, 0.35);
  
  --sahinur-bg: #0A0A0A;
  --sahinur-surface: #111111;
  --sahinur-surface-2: #161616;
  --sahinur-surface-hover: #1c1c1c;
  
  --sahinur-border: #242424;
  --sahinur-border-strong: #3A3A3A;
  --sahinur-border-accent: rgba(0, 255, 136, 0.3);
  
  --sahinur-text-bright: #FFFFFF;
  --sahinur-text: #D4D4D8;
  --sahinur-text-dim: #9CA3AF;
  --sahinur-text-faint: #52525B;
  
  /* Typography */
  --font-sahinur-mono: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace;
  --font-sahinur-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* macOS Traffic Lights */
  --mac-dot-red: #ff5f56;
  --mac-dot-yellow: #ffbd2e;
  --mac-dot-green: #27c93f;
}

/* 1. Matrix Background Grid Overlay */
.sahinur-bg-grid {
  background-size: 32px 32px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
}

/* 2. Terminal Framed Window */
.sahinur-terminal {
  background: var(--sahinur-surface);
  border: 1px solid var(--sahinur-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 255, 136, 0.03);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.sahinur-terminal:hover {
  border-color: var(--sahinur-border-strong);
}

.sahinur-terminal-header {
  background: var(--sahinur-surface-2);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--sahinur-border);
  font-family: var(--font-sahinur-mono);
  font-size: 0.75rem;
  color: var(--sahinur-text-faint);
}

.sahinur-traffic-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sahinur-traffic-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.sahinur-traffic-dot.red { background: var(--mac-dot-red); }
.sahinur-traffic-dot.yellow { background: var(--mac-dot-yellow); }
.sahinur-traffic-dot.green { background: var(--mac-dot-green); }

/* 3. Terminal Prompt & Blinking Cursor */
.sahinur-prompt-prefix {
  color: var(--sahinur-accent);
  font-family: var(--font-sahinur-mono);
  margin-right: 8px;
}

.sahinur-caret {
  display: inline-block;
  width: 8px;
  height: 1.1em;
  background-color: var(--sahinur-accent);
  vertical-align: middle;
  margin-left: 4px;
  animation: sahinurBlink 1s step-end infinite;
}

@keyframes sahinurBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 4. Glowing Status Indicator Badge */
.sahinur-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  border: 1px solid var(--sahinur-border-strong);
  background: var(--sahinur-surface);
  font-family: var(--font-sahinur-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--sahinur-text-dim);
}

.sahinur-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--sahinur-accent);
  box-shadow: 0 0 10px var(--sahinur-accent);
  animation: sahinurPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes sahinurPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

/* 5. Terminal Interactive Buttons */
.sahinur-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--sahinur-accent);
  color: #001A0E;
  font-family: var(--font-sahinur-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 6px;
  transition: all 0.2s ease;
  box-shadow: 0 0 20px var(--sahinur-accent-dim);
}

.sahinur-btn-primary:hover {
  background: var(--sahinur-accent-hover);
  box-shadow: 0 0 25px var(--sahinur-accent-glow);
  transform: translateY(-1px);
}

.sahinur-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--sahinur-surface);
  color: var(--sahinur-text);
  border: 1px solid var(--sahinur-border);
  font-family: var(--font-sahinur-mono);
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.sahinur-btn-ghost:hover {
  background: var(--sahinur-surface-2);
  border-color: var(--sahinur-border-strong);
  color: var(--sahinur-text-bright);
}

/* 6. Hover-Glow Tool Cards */
.sahinur-card {
  background: var(--sahinur-surface);
  border: 1px solid var(--sahinur-border);
  border-radius: 6px;
  padding: 16px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.sahinur-card:hover {
  border-color: var(--sahinur-border-accent);
  background: var(--sahinur-surface-2);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6), 0 0 15px var(--sahinur-accent-dim);
}

/* 7. Section Numerals & Eyebrow */
.sahinur-section-index {
  font-family: var(--font-sahinur-mono);
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--sahinur-border-strong);
  line-height: 1;
}

.sahinur-eyebrow {
  font-family: var(--font-sahinur-mono);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sahinur-accent);
}

/* 8. Dashed Divider */
.sahinur-dashed-divider {
  border-top: 1px dashed var(--sahinur-border);
  margin: 16px 0;
}
