/**
 * WYSIWYG & Rich Text Editor Subsystem
 * Handles inline canvas direct editing, modular drag-and-drop block ordering,
 * and email paragraph markdown/rich-text formatting toolbars.
 * Zero external dependencies.
 */

const RichTextEditor = {
  /**
   * Helper: Resolve active App instance with fallback
   */
  _getApp(app) {
    if (app && app.state) return app;
    if (typeof App !== 'undefined' && App.state) return App;
    return app || {};
  },

  /**
   * Bind inline editable spans directly inside live email signature canvas
   */
  bindInlineCanvasEditing(app) {
    app = this._getApp(app);
    const canvas = document.getElementById('liveRenderCanvas');
    if (!canvas) return;

    // Prevent navigation when clicking links containing inline editable spans
    canvas.addEventListener('click', (e) => {
      const fieldSpan = e.target.closest('[data-inline-field]');
      if (fieldSpan) {
        const anchor = e.target.closest('a');
        if (anchor) {
          e.preventDefault();
        }
      }
    });

    // Direct input typing on editable canvas fields
    canvas.addEventListener('input', (e) => {
      const fieldSpan = e.target.closest('[data-inline-field]');
      if (!fieldSpan) return;

      const fieldName = fieldSpan.getAttribute('data-inline-field');
      const val = fieldSpan.innerText || fieldSpan.textContent || '';

      if (fieldName.startsWith('customField_')) {
        const idx = parseInt(fieldName.replace('customField_', ''), 10);
        if (app.state && app.state.data && app.state.data.customFields && app.state.data.customFields[idx]) {
          app.state.data.customFields[idx].value = val;
          const input = document.getElementById(`customFieldVal_${idx}`);
          if (input) input.value = val;
        }
      } else if (fieldName === 'statusText') {
        if (!app.state.data.statusBadge) app.state.data.statusBadge = {};
        app.state.data.statusBadge.text = val;
        app.state.data.statusText = val;
        const input = document.getElementById('statusBadgeText');
        if (input) input.value = val;
      } else if (fieldName === 'bookingBadgeText') {
        if (!app.state.data.bookingBadge) app.state.data.bookingBadge = {};
        app.state.data.bookingBadge.text = val;
        const input = document.getElementById('bookingBadgeText');
        if (input) input.value = val;
      } else if (app.state && app.state.data && fieldName in app.state.data) {
        app.state.data[fieldName] = val;
        const input = document.getElementById(fieldName);
        if (input) input.value = val;
      }

      if (typeof app.scheduleSaveToStorage === 'function') {
        app.scheduleSaveToStorage(250);
      } else if (typeof app.saveToStorage === 'function') {
        app.saveToStorage();
      }
    });

    // Blur / Focusout: Re-run live preview for complete layout sync & linter audit
    canvas.addEventListener('focusout', (e) => {
      const fieldSpan = e.target.closest('[data-inline-field]');
      if (!fieldSpan) return;
      if (typeof app.updateLivePreview === 'function') {
        app.updateLivePreview();
      }
    });

    // Keydown: Prevent unwanted newline line breaks on single-line header fields
    canvas.addEventListener('keydown', (e) => {
      const fieldSpan = e.target.closest('[data-inline-field]');
      if (!fieldSpan) return;
      const fieldName = fieldSpan.getAttribute('data-inline-field');
      const multilineFields = ['disclaimerText', 'quoteText', 'address'];
      if (e.key === 'Enter' && !multilineFields.includes(fieldName)) {
        e.preventDefault();
        fieldSpan.blur();
      }
    });
  },

  /**
   * Modular Block Organizer (Drag & Drop + Up/Down Reordering)
   */
  bindBlockOrganizerEvents(app) {
    app = this._getApp(app);
    const container = document.getElementById('blockOrganizerList');
    const resetBtn = document.getElementById('resetBlockOrderBtn');
    if (!container) return;

    const defaultOrder = ['identity', 'contact', 'socials', 'badges', 'banner', 'footer'];
    if (!app.state.settings.blockOrder || !Array.isArray(app.state.settings.blockOrder) || app.state.settings.blockOrder.length === 0) {
      app.state.settings.blockOrder = [...defaultOrder];
    }

    const syncOrganizerDom = () => {
      const order = app.state.settings.blockOrder || defaultOrder;
      const items = Array.from(container.querySelectorAll('.block-item'));
      order.forEach(blockKey => {
        const item = items.find(el => el.dataset.block === blockKey);
        if (item) container.appendChild(item);
      });
    };

    syncOrganizerDom();

    // Up / Down reorder button clicks
    container.addEventListener('click', (e) => {
      const btnUp = e.target.closest('.block-btn-up');
      const btnDown = e.target.closest('.block-btn-down');
      if (!btnUp && !btnDown) return;

      const item = e.target.closest('.block-item');
      if (!item) return;
      const blockKey = item.dataset.block;
      let order = [...(app.state.settings.blockOrder || defaultOrder)];
      const idx = order.indexOf(blockKey);
      if (idx === -1) return;

      if (btnUp && idx > 0) {
        const temp = order[idx];
        order[idx] = order[idx - 1];
        order[idx - 1] = temp;
      } else if (btnDown && idx < order.length - 1) {
        const temp = order[idx];
        order[idx] = order[idx + 1];
        order[idx + 1] = temp;
      }

      app.state.settings.blockOrder = order;
      syncOrganizerDom();
      if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
      if (typeof app.saveToStorage === 'function') app.saveToStorage();
    });

    // HTML5 Drag and Drop Handlers
    let draggedItem = null;

    container.addEventListener('dragstart', (e) => {
      draggedItem = e.target.closest('.block-item');
      if (draggedItem) {
        draggedItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedItem.dataset.block);
      }
    });

    container.addEventListener('dragend', () => {
      if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
      }
      container.querySelectorAll('.block-item').forEach(el => el.classList.remove('drag-over'));
    });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const targetItem = e.target.closest('.block-item');
      if (targetItem && targetItem !== draggedItem) {
        container.querySelectorAll('.block-item').forEach(el => el.classList.remove('drag-over'));
        targetItem.classList.add('drag-over');
      }
    });

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const targetItem = e.target.closest('.block-item');
      if (targetItem && draggedItem && targetItem !== draggedItem) {
        const items = Array.from(container.querySelectorAll('.block-item'));
        const draggedIdx = items.indexOf(draggedItem);
        const targetIdx = items.indexOf(targetItem);

        let order = [...(app.state.settings.blockOrder || defaultOrder)];
        const [removed] = order.splice(draggedIdx, 1);
        order.splice(targetIdx, 0, removed);

        app.state.settings.blockOrder = order;
        syncOrganizerDom();
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
        if (typeof app.saveToStorage === 'function') app.saveToStorage();
      }
      container.querySelectorAll('.block-item').forEach(el => el.classList.remove('drag-over'));
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        app.state.settings.blockOrder = [...defaultOrder];
        syncOrganizerDom();
        if (typeof app.updateLivePreview === 'function') app.updateLivePreview();
        if (typeof app.saveToStorage === 'function') app.saveToStorage();
        if (typeof app.showToast === 'function') app.showToast('Reset block order to default hierarchy', 'info');
      });
    }
  },

  /**
   * Initialize rich text formatting toolbars for paragraph textareas
   */
  initParagraphFormattingToolbars(app) {
    app = this._getApp(app);
    const toolbars = document.querySelectorAll('.rich-format-toolbar');
    toolbars.forEach(toolbar => {
      const targetId = toolbar.dataset.target;
      const textarea = document.getElementById(targetId);
      if (!textarea) return;

      const buttons = toolbar.querySelectorAll('.format-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const action = btn.dataset.action;
          this.applyTextareaFormatting(textarea, action, app);
        });
      });
    });
  },

  /**
   * Apply rich text formatting (markdown/HTML) to a textarea selection
   * @param {HTMLTextAreaElement} textarea
   * @param {string} action - 'bold' | 'italic' | 'underline' | 'link' | 'highlight' | 'code' | 'bullet' | 'clear'
   * @param {Object} [app]
   */
  applyTextareaFormatting(textarea, action, app) {
    if (!textarea) return;
    textarea.focus();
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const val = textarea.value || '';
    const selected = val.substring(start, end);

    let replacement = '';
    let newCursorStart = start;
    let newCursorEnd = end;

    switch (action) {
      case 'bold':
        if (selected) {
          if (selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4) {
            replacement = selected.slice(2, -2);
          } else {
            replacement = `**${selected}**`;
          }
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          replacement = '**bold text**';
          newCursorStart = start + 2;
          newCursorEnd = start + 11;
        }
        break;

      case 'italic':
        if (selected) {
          if (selected.startsWith('*') && selected.endsWith('*') && selected.length >= 2 && !selected.startsWith('**')) {
            replacement = selected.slice(1, -1);
          } else {
            replacement = `*${selected}*`;
          }
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          replacement = '*italic text*';
          newCursorStart = start + 1;
          newCursorEnd = start + 12;
        }
        break;

      case 'underline':
        if (selected) {
          if (selected.startsWith('<u>') && selected.endsWith('</u>')) {
            replacement = selected.slice(3, -4);
          } else {
            replacement = `<u>${selected}</u>`;
          }
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          replacement = '<u>underlined text</u>';
          newCursorStart = start + 3;
          newCursorEnd = start + 18;
        }
        break;

      case 'link': {
        const linkUrl = typeof prompt === 'function'
          ? prompt('Enter Link Destination URL (https://...):', 'https://')
          : 'https://';
        if (!linkUrl) return;
        const linkText = selected || 'link text';
        replacement = `[${linkText}](${linkUrl})`;
        newCursorStart = start;
        newCursorEnd = start + replacement.length;
        break;
      }

      case 'highlight':
        if (selected) {
          if (selected.startsWith('<mark>') && selected.endsWith('</mark>')) {
            replacement = selected.slice(6, -7);
          } else {
            replacement = `<mark>${selected}</mark>`;
          }
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          replacement = '<mark>highlighted text</mark>';
          newCursorStart = start + 6;
          newCursorEnd = start + 22;
        }
        break;

      case 'code':
        if (selected) {
          if (selected.startsWith('`') && selected.endsWith('`') && selected.length >= 2) {
            replacement = selected.slice(1, -1);
          } else {
            replacement = `\`${selected}\``;
          }
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          replacement = '`code`';
          newCursorStart = start + 1;
          newCursorEnd = start + 5;
        }
        break;

      case 'bullet':
        if (selected) {
          const lines = selected.split('\n');
          const bulleted = lines.map(line => line.startsWith('- ') ? line.slice(2) : `- ${line}`).join('\n');
          replacement = bulleted;
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          replacement = '\n- ';
          newCursorStart = start + replacement.length;
          newCursorEnd = start + replacement.length;
        }
        break;

      case 'clear':
        if (selected) {
          let cleaned = selected;
          // Strip markdown symbols
          cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
          cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');
          cleaned = cleaned.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
          cleaned = cleaned.replace(/`(.*?)`/g, '$1');
          // Strip HTML tags
          cleaned = cleaned.replace(/<\/?(strong|b|em|i|u|ins|mark|code|a|p|span)[^>]*>/gi, '');
          replacement = cleaned;
          newCursorStart = start;
          newCursorEnd = start + replacement.length;
        } else {
          return;
        }
        break;

      default:
        return;
    }

    textarea.value = val.substring(0, start) + replacement + val.substring(end);
    if (typeof textarea.setSelectionRange === 'function') {
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    }

    // Trigger input event to update live preview and sync state
    if (typeof Event === 'function') {
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
};

if (typeof window !== 'undefined') {
  window.RichTextEditor = RichTextEditor;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RichTextEditor;
}
