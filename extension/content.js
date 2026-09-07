/**
 * MailCraft Extension Content Script
 * Injects rich HTML signatures into Gmail and Outlook Web compose editors
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'INJECT_SIGNATURE') {
    const htmlToInject = request.html;
    if (!htmlToInject) {
      sendResponse({ success: false, error: 'No signature HTML provided' });
      return true;
    }

    const injected = injectIntoActiveCompose(htmlToInject);
    sendResponse({ success: injected });
    return true;
  }
});

function injectIntoActiveCompose(html) {
  // 1. Look for Gmail Compose Box
  // Common Gmail compose selectors: .Am.Al.editable, div[aria-label="Message Body"], div[role="textbox"][g_editable="true"]
  const gmailCompose = document.querySelector('.Am.Al.editable, div[aria-label="Message Body"], div[role="textbox"][g_editable="true"]');
  if (gmailCompose) {
    // Remove previous mailcraft signature if present
    const existingSig = gmailCompose.querySelector('.mailcraft-injected-signature');
    if (existingSig) {
      existingSig.remove();
    }

    const sigWrapper = document.createElement('div');
    sigWrapper.className = 'mailcraft-injected-signature';
    sigWrapper.style.marginTop = '16px';
    sigWrapper.innerHTML = html;

    gmailCompose.appendChild(sigWrapper);
    
    // Dispatch input event so Gmail registers draft change
    gmailCompose.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  // 2. Look for Outlook Web Compose Box
  const outlookCompose = document.querySelector('div[aria-label="Message body, press Alt+F10 to exit"], div[role="textbox"][contenteditable="true"]');
  if (outlookCompose) {
    const existingSig = outlookCompose.querySelector('.mailcraft-injected-signature');
    if (existingSig) {
      existingSig.remove();
    }

    const sigWrapper = document.createElement('div');
    sigWrapper.className = 'mailcraft-injected-signature';
    sigWrapper.style.marginTop = '16px';
    sigWrapper.innerHTML = html;

    outlookCompose.appendChild(sigWrapper);
    outlookCompose.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  // 3. Fallback: Active contenteditable element
  const activeEl = document.activeElement;
  if (activeEl && activeEl.isContentEditable) {
    const sigWrapper = document.createElement('div');
    sigWrapper.className = 'mailcraft-injected-signature';
    sigWrapper.style.marginTop = '16px';
    sigWrapper.innerHTML = html;

    activeEl.appendChild(sigWrapper);
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  return false;
}
