import { describe, it, expect, beforeEach, vi } from 'vitest';
import { boot, VERSION } from '../../src/core/index.js';

describe('Core boot & kill switch (TC-C11)', () => {
  beforeEach(() => {
    // Reset window state and search params
    delete window.__SITEKIT__;
    window.history.replaceState({}, '', '/');
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

  it('boots and sets window.__SITEKIT__ with version when kill switch is absent', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const booted = boot();

    expect(booted).toBe(true);
    expect(window.__SITEKIT__).toBeDefined();
    expect(window.__SITEKIT__?.version).toBe(VERSION);
    expect(logSpy).toHaveBeenCalledWith(`[SiteKit] core v${VERSION} loaded`);
  });

  it('is idempotent when boot() is called repeatedly', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const first = boot();
    const second = boot();

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });
});

