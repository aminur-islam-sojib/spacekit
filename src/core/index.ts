import type { Feature, SqspEnv } from '../shared/types.js';
import { FeatureRegistry } from './registry.js';
import { LifecycleManager } from './lifecycle.js';
import { ConfigClient } from './config-client.js';
import { detectEditor } from '../adapters/squarespace.js';
import { backToTopFeature } from '../features/backToTop/index.js';

export const VERSION = '0.1.0';

export const registry = new FeatureRegistry();
export const lifecycle = new LifecycleManager();
export const configClient = new ConfigClient();

// Register built-in foundations
registry.register(backToTopFeature);

export interface SiteKitStatus {
  version: string;
  disabled: boolean;
  isEditor: boolean;
  featuresCount: number;
  registeredFeatures: string[];
  activeFeatures: string[];
}

export interface SiteKitGlobal {
  version: string;
  register: <C extends Record<string, unknown> = Record<string, unknown>>(feature: Feature<C>) => void;
  registry: FeatureRegistry;
  lifecycle: LifecycleManager;
  config: ConfigClient;
  status: () => SiteKitStatus;
  enable: (featureId: string, customConfig?: Record<string, unknown>) => void;
  disable: (featureId: string) => void;
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

function getBaseUrl(): string {
  if (typeof document === 'undefined') return '/';
  const script =
    (document.currentScript as HTMLScriptElement | null) ||
    (document.querySelector('script[src*="sitekit.core"]') as HTMLScriptElement | null) ||
    (document.querySelector('script[data-config]') as HTMLScriptElement | null);
  if (script && script.src) {
    return script.src.substring(0, script.src.lastIndexOf('/') + 1);
  }
  return '/';
}

/**
 * Dynamically injects the editor bundle only when the Squarespace editor is detected.
 * FR-E1, FR-E2, TC-E01: Visitors never download the editor chunk.
 */
function loadEditorChunk(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('sitekit-editor-script')) return;

  const editorScript = document.createElement('script');
  editorScript.id = 'sitekit-editor-script';
  editorScript.src = `${getBaseUrl()}sitekit.editor.js`;
  editorScript.defer = true;
  document.head.appendChild(editorScript);
}

const FEATURE_CHUNKS = ['announcementBar', 'buttonStyles'];

function loadFeatureChunk(featureId: string): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(`sitekit-feat-${featureId}`)) return;

  const script = document.createElement('script');
  script.id = `sitekit-feat-${featureId}`;
  script.src = `${getBaseUrl()}features/${featureId}.js`;
  script.defer = true;
  document.head.appendChild(script);
}

let mercuryBound = false;

/**
 * Core runtime boot.
 * Checks kill switches (?sitekit=off and config.disabled: true).
 * Applies cache-first config and binds to mercury:load AJAX navigations.
 */
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

  // Lazy-load enabled feature chunks for visitors
  for (const featureId of FEATURE_CHUNKS) {
    if (cfg.features[featureId]?.enabled && !registry.get(featureId)) {
      loadFeatureChunk(featureId);
    }
  }

  // Lazy-load editor chunk if editor is detected (TC-E01, TC-E02, TC-E03, TC-E04)
  if (env.isEditor) {
    loadEditorChunk();
  } else if (typeof document !== 'undefined' && document.body) {
    const observer = new MutationObserver(() => {
      if (detectEditor()) {
        loadEditorChunk();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // Set up AJAX navigation re-init on mercury:load (TC-C09)
  if (!mercuryBound) {
    window.addEventListener('mercury:load', () => {
      if (!configClient.isDisabled()) {
        const curCfg = configClient.getConfig();
        for (const featureId of FEATURE_CHUNKS) {
          if (curCfg.features[featureId]?.enabled && !registry.get(featureId)) {
            loadFeatureChunk(featureId);
          }
        }
        lifecycle.initAll(registry.getAll(), curCfg.features, getEnvironment());
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
      const all = registry.getAll().map((f) => f.id);
      const active = all.filter((id) => lifecycle.isFeatureActive(id));
      const s: SiteKitStatus = {
        version: VERSION,
        disabled: configClient.isDisabled(),
        isEditor: env.isEditor,
        featuresCount: all.length,
        registeredFeatures: all,
        activeFeatures: active,
      };
      console.log('[SiteKit Status]', s);
      return s;
    },
    enable: (featureId, customConfig) => {
      const feat = registry.get(featureId);
      if (!feat) {
        console.warn(`[SiteKit] Unknown feature '${featureId}'`);
        return;
      }
      const current = configClient.getConfig();
      const currentFeatConfig = current.features[featureId] || {};
      const nextConfig = {
        ...current,
        features: {
          ...current.features,
          [featureId]: {
            ...currentFeatConfig,
            ...(customConfig || {}),
            enabled: true,
          },
        },
      };
      configClient.setCachedConfig(nextConfig);
      lifecycle.initFeature(feat, nextConfig.features[featureId], getEnvironment());
      console.log(`[SiteKit] Feature '${featureId}' enabled.`);
    },
    disable: (featureId) => {
      const feat = registry.get(featureId);
      if (!feat) return;
      const current = configClient.getConfig();
      const currentFeatConfig = current.features[featureId] || {};
      const nextConfig = {
        ...current,
        features: {
          ...current.features,
          [featureId]: {
            ...currentFeatConfig,
            enabled: false,
          },
        },
      };
      configClient.setCachedConfig(nextConfig);
      lifecycle.destroyFeature(feat);
      console.log(`[SiteKit] Feature '${featureId}' disabled.`);
    },
  };

  console.log(`[SiteKit] core v${VERSION} loaded`);

  // Background network revalidation if data-config script attribute is present
  if (typeof document !== 'undefined') {
    const script =
      (document.currentScript as HTMLScriptElement | null) ||
      (document.querySelector('script[data-config]') as HTMLScriptElement | null);
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
