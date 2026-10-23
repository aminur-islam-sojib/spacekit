import type { Feature, SqspEnv } from '../shared/types.js';
import { FeatureRegistry } from './registry.js';
import { LifecycleManager } from './lifecycle.js';
import { ConfigClient } from './config-client.js';
import { detectEditor } from '../adapters/squarespace.js';

export const VERSION = '0.1.0';

export const registry = new FeatureRegistry();
export const lifecycle = new LifecycleManager();
export const configClient = new ConfigClient();

export interface SiteKitStatus {
  version: string;
  disabled: boolean;
  isEditor: boolean;
  featuresCount: number;
  activeFeatures: string[];
}

export interface SiteKitGlobal {
  version: string;
  register: <C extends Record<string, unknown> = Record<string, unknown>>(feature: Feature<C>) => void;
  registry: FeatureRegistry;
  lifecycle: LifecycleManager;
  config: ConfigClient;
  status: () => SiteKitStatus;
}

declare global {
  interface Window {
    __SITEKIT__?: SiteKitGlobal;
  }
}

function getEnvironment(): SqspEnv {
  return {
    isEditor: detectEditor(),
    isEditorActive:
      typeof document !== 'undefined' && document.body
        ? document.body.classList.contains('sqs-edit-mode-active')
        : false,
    version: VERSION,
  };
}

/**
 * Core runtime boot.
 * Checks kill switches (?sitekit=off and config.disabled: true).
 * Applies cache-first config and binds to mercury:load AJAX navigations.
 */
let mercuryBound = false;

export function boot(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // URL kill switch: ?sitekit=off (TC-C11)
  const params = new URLSearchParams(window.location.search);
  if (params.get('sitekit') === 'off') {
    return false;
  }

  if (window.__SITEKIT__) {
    return false;
  }

  // Refresh config from cache at boot
  configClient.loadCached();

  // Config kill switch: disabled: true (TC-C10)
  if (configClient.isDisabled()) {
    console.log(`[SiteKit] Stopped: disabled: true in config.`);
    return false;
  }

  const env = getEnvironment();
  const cfg = configClient.getConfig();

  // Initialize registered features with current config
  lifecycle.initAll(registry.getAll(), cfg.features, env);

  // Set up AJAX navigation re-init on mercury:load (TC-C09)
  if (!mercuryBound) {
    window.addEventListener('mercury:load', () => {
      if (!configClient.isDisabled()) {
        lifecycle.initAll(registry.getAll(), configClient.getConfig().features, getEnvironment());
      }
    });
    mercuryBound = true;
  }

  window.__SITEKIT__ = {
    version: VERSION,
    register: (feature) => {
      registry.register(feature);
      if (!configClient.isDisabled()) {
        const featConfig = configClient.getConfig().features[feature.id] || {};
        lifecycle.initFeature(feature, featConfig, getEnvironment());
      }
    },
    registry,
    lifecycle,
    config: configClient,
    status: () => {
      const active = registry
        .getAll()
        .map((f) => f.id)
        .filter((id) => lifecycle.isFeatureActive(id));
      const s: SiteKitStatus = {
        version: VERSION,
        disabled: configClient.isDisabled(),
        isEditor: env.isEditor,
        featuresCount: registry.getAll().length,
        activeFeatures: active,
      };
      console.log('[SiteKit Status]', s);
      return s;
    },
  };

  console.log(`[SiteKit] core v${VERSION} loaded`);

  // Background network revalidation if data-config script attribute is present
  if (typeof document !== 'undefined') {
    const script = document.currentScript as HTMLScriptElement | null;
    const configUrl = script?.dataset?.config;
    if (configUrl) {
      configClient.fetchAndSync(configUrl).then((freshConfig) => {
        if (!freshConfig.disabled) {
          lifecycle.initAll(registry.getAll(), freshConfig.features, getEnvironment());
        } else {
          lifecycle.destroyAll(registry.getAll());
        }
      });
    }
  }

  return true;
}

// Auto-boot in browser context
if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
  const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';
  if (!isTest) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => boot());
    } else {
      boot();
    }
  }
}
