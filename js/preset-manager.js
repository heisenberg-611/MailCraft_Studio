/**
 * Custom Presets & Profile Manager
 * 100% on-device localStorage persistence & JSON file export/import
 * Supports unlimited custom user presets, duplicate, export, and delete
 */

const PresetManager = {
  STORAGE_KEY: 'mailcraft_user_presets',

  /**
   * Get list of all user-saved presets from localStorage
   */
  getUserPresets() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to parse user presets from localStorage', e);
      return [];
    }
  },

  /**
   * Save user presets array to localStorage
   */
  saveUserPresetsList(list) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Failed to save user presets to localStorage', e);
      return false;
    }
  },

  /**
   * Save current configuration as a new or updated user preset
   */
  savePreset(name, description = '', data = {}, settings = {}) {
    if (!name || !name.trim()) {
      throw new Error('Preset name cannot be empty');
    }

    const id = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const presets = this.getUserPresets();

    const newPreset = {
      id,
      name: name.trim(),
      description: (description || 'Custom user configuration').trim(),
      isCustom: true,
      updatedAt: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(data)),
      settings: JSON.parse(JSON.stringify(settings))
    };

    presets.unshift(newPreset);
    this.saveUserPresetsList(presets);
    return newPreset;
  },

  /**
   * Delete a custom user preset by ID
   */
  deletePreset(id) {
    let presets = this.getUserPresets();
    const initialLen = presets.length;
    presets = presets.filter(p => p.id !== id);
    if (presets.length !== initialLen) {
      this.saveUserPresetsList(presets);
      return true;
    }
    return false;
  },

  /**
   * Duplicate an existing user preset
   */
  duplicatePreset(id) {
    const presets = this.getUserPresets();
    const target = presets.find(p => p.id === id);
    if (!target) return null;

    const copy = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      name: `${target.name} (Copy)`,
      updatedAt: new Date().toISOString()
    };

    presets.unshift(copy);
    this.saveUserPresetsList(presets);
    return copy;
  },

  /**
   * Export single or all presets as downloadable .json file
   */
  exportPresetAsJson(preset) {
    if (!preset) return;
    const jsonStr = JSON.stringify(preset, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mailcraft-preset-${preset.id || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  /**
   * Export all user presets into one JSON backup bundle
   */
  exportAllUserPresets() {
    const presets = this.getUserPresets();
    const payload = {
      app: 'MailCraft Studio',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      presets
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mailcraft-presets-backup-${Date.now().toString(36)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  /**
   * Import preset(s) from JSON string or file
   */
  importFromJsonString(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      const existing = this.getUserPresets();
      let count = 0;

      if (parsed.presets && Array.isArray(parsed.presets)) {
        // Multi-preset bundle
        parsed.presets.forEach(p => {
          if (p.settings || p.data) {
            p.id = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
            p.isCustom = true;
            existing.unshift(p);
            count++;
          }
        });
      } else if (parsed.settings || parsed.data || parsed.name) {
        // Single preset
        parsed.id = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        parsed.isCustom = true;
        parsed.name = parsed.name || 'Imported Preset';
        existing.unshift(parsed);
        count = 1;
      } else {
        throw new Error('Invalid JSON format: missing settings or preset structure');
      }

      this.saveUserPresetsList(existing);
      return { success: true, count };
    } catch (e) {
      console.error('Import failed', e);
      return { success: false, error: e.message };
    }
  }
};
