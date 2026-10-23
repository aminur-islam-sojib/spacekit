import type { Feature } from '../shared/types.js';
import { FeatureRegistry } from './registry.js';
import { LifecycleManager } from './lifecycle.js';

export const VERSION = '0.1.0';

export const registry = new FeatureRegistry();
export const lifecycle = new LifecycleManager();

export interface SiteKitGlobal {
  version: string;
  register: <C extends Record<string, unknown> = Record<string, unknown>>(feature: Feature<C>) => void;
  registry: FeatureRegistry;
  lifecycle: LifecycleManager;
}

declare global {
  interface Window {
    __SITEKIT__?: SiteKitGlobal;
  }
}

/**
 * Minimal boot for Milestone M0.
 * Checks for kill switch ?sitekit=off. If present, halts immediately.
 * Otherwise sets window.__SITEKIT__ and logs status.
 */
export function boot(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('sitekit') === 'off') {
    return false;
  }

  if (window.__SITEKIT__) {
    return false;
  }

  window.__SITEKIT__ = {
    version: VERSION,
    register: (feature) => registry.register(feature),
    registry,
    lifecycle,
  };

  console.log(`[SiteKit] core v${VERSION} loaded`);
  return true;
}

// Auto-boot in browser context
if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
  const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';
  if (!isTest) {
    boot();
  }
}
