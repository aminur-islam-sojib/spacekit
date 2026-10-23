import type { SiteKitConfig } from '../shared/types.js';
import { validateSiteKitConfig } from '../shared/schema-validate.js';

export const DEFAULT_CONFIG: SiteKitConfig = {
  schemaVersion: 1,
  revision: 0,
  updatedAt: new Date(0).toISOString(),
  disabled: false,
  features: {},
  targets: {},
};

function getStorageKey(key: string): string {
  const host = typeof location !== 'undefined' ? location.hostname : 'localhost';
  return `sitekit:${key}:${host}`;
}

/**
 * Cache-first config client.
 * TC-C02, TC-C03: Reads cached config from localStorage synchronously before network revalidation.
 * TC-C04: Retains cached config on network/server errors.
 * TC-C10: Identifies disabled kill-switch state.
 */
export class ConfigClient {
  private currentConfig: SiteKitConfig;

  constructor() {
    this.currentConfig = this.getCachedConfig() || { ...DEFAULT_CONFIG };
  }

  /**
   * Refreshes internal state from localStorage cache.
   */
  loadCached(): SiteKitConfig {
    this.currentConfig = this.getCachedConfig() || { ...DEFAULT_CONFIG };
    return this.currentConfig;
  }

  /**
   * Reads and validates cached config synchronously from localStorage.
   */
  getCachedConfig(): SiteKitConfig | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(getStorageKey('config'));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return validateSiteKitConfig(parsed);
    } catch {
      return null;
    }
  }

  /**
   * Persists validated config into localStorage.
   */
  setCachedConfig(config: SiteKitConfig): void {
    this.currentConfig = config;
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(getStorageKey('config'), JSON.stringify(config));
    } catch (e) {
      console.warn('[SiteKit] Failed to write config to localStorage:', e);
    }
  }

  /**
   * Returns current active config.
   */
  getConfig(): SiteKitConfig {
    return this.currentConfig;
  }

  /**
   * Returns true if the kill switch (disabled: true) is active.
   */
  isDisabled(): boolean {
    return Boolean(this.currentConfig.disabled);
  }

  /**
   * Revalidates config against a remote URL with timeout and fallback.
   */
  async fetchAndSync(url: string, timeoutMs = 3500): Promise<SiteKitConfig> {
    if (!url) {
      return this.currentConfig;
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

    try {
      const res = await fetch(url, {
        cache: 'no-cache',
        signal: controller ? controller.signal : undefined,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const text = await res.text();
      const parsed = JSON.parse(text);
      const validated = validateSiteKitConfig(parsed);

      if (!validated) {
        throw new Error('Config failed schema validation');
      }

      this.setCachedConfig(validated);
      return validated;
    } catch (err) {
      console.warn('[SiteKit] Remote config fetch failed, keeping active config:', err);
      return this.currentConfig;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
