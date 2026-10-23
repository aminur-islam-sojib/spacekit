import { describe, it, expect, beforeEach, vi } from 'vitest';
import { boot, VERSION, registry, lifecycle } from '../../src/core/index.js';
import { backToTopFeature } from '../../src/features/backToTop/index.js';
import type { Feature } from '../../src/shared/types.js';

describe('Core boot & lifecycle integration (TC-C09, TC-C10, TC-C11)', () => {
  beforeEach(() => {
    // Reset window state, storage, and search params
    delete window.__SITEKIT__;
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    registry.clear();
    registry.register(backToTopFeature);
    vi.restoreAllMocks();
  });

  it('TC-C11: halts execution when ?sitekit=off is in the query string', () => {
    window.history.replaceState({}, '', '/?sitekit=off');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const booted = boot();

    expect(booted).toBe(false);
    expect(window.__SITEKIT__).toBeUndefined();
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('TC-C10: halts feature activation when config disabled: true is present', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    localStorage.setItem(
      `sitekit:config:${location.hostname}`,
      JSON.stringify({
        schemaVersion: 1,
        revision: 1,
        updatedAt: '2026-10-23T10:00:00Z',
        disabled: true,
        features: {},
      })
    );

    const booted = boot();

    expect(booted).toBe(false);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('disabled: true'));
  });

  it('boots, sets window.__SITEKIT__, and exposes status, enable, and disable helpers', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const booted = boot();

    expect(booted).toBe(true);
    expect(window.__SITEKIT__).toBeDefined();
    expect(window.__SITEKIT__?.version).toBe(VERSION);
    expect(logSpy).toHaveBeenCalledWith(`[SiteKit] core v${VERSION} loaded`);

    const status = window.__SITEKIT__?.status();
    expect(status?.version).toBe(VERSION);
    expect(status?.registeredFeatures).toContain('backToTop');

    // Test enable helper
    window.__SITEKIT__?.enable('backToTop', { showAfter: 0 });
    expect(document.querySelector('[data-sk="backToTop"]')).not.toBeNull();
    expect(window.__SITEKIT__?.status().activeFeatures).toContain('backToTop');

    // Test disable helper
    window.__SITEKIT__?.disable('backToTop');
    expect(document.querySelector('[data-sk="backToTop"]')).toBeNull();
    expect(window.__SITEKIT__?.status().activeFeatures).not.toContain('backToTop');
  });

  it('is idempotent when boot() is called repeatedly', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const first = boot();
    const second = boot();

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-C09: re-runs features on window mercury:load without duplicating', () => {
    let initCalls = 0;
    const testFeat: Feature<{ enabled: boolean }> = {
      id: 'ajaxFeat',
      label: 'AJAX Feat',
      version: 1,
      schema: [{ key: 'enabled', type: 'toggle', label: 'Enabled' }],
      defaults: { enabled: true },
      init() {
        initCalls++;
      },
      update() {},
      destroy() {},
    };

    registry.register(testFeat);
    boot();

    expect(initCalls).toBe(1);

    // Dispatch Squarespace mercury:load AJAX event
    window.dispatchEvent(new Event('mercury:load'));

    // Re-initialized cleanly via lifecycle
    expect(initCalls).toBe(2);
    expect(lifecycle.isFeatureActive('ajaxFeat')).toBe(true);
  });
});
