import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigClient, DEFAULT_CONFIG } from '../../src/core/config-client.js';
import type { SiteKitConfig } from '../../src/shared/types.js';

describe('Config Client (TC-C02, TC-C03, TC-C04, TC-C10)', () => {
  const mockConfig: SiteKitConfig = {
    schemaVersion: 1,
    revision: 5,
    updatedAt: '2026-10-23T10:00:00Z',
    disabled: false,
    features: {
      backToTop: { enabled: true, side: 'right' },
    },
    targets: {},
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('TC-C02: returns cached config from localStorage if available, falls back to defaults', () => {
    const client = new ConfigClient();
    expect(client.getConfig()).toEqual(DEFAULT_CONFIG);

    client.setCachedConfig(mockConfig);
    const client2 = new ConfigClient();
    expect(client2.getConfig()).toEqual(mockConfig);
  });

  it('TC-C03: applies cached config immediately on load to prevent visual flash', async () => {
    const client = new ConfigClient();
    client.setCachedConfig(mockConfig);

    // Mock fetch that resolves later with updated config
    const updatedConfig: SiteKitConfig = {
      ...mockConfig,
      revision: 6,
      features: { backToTop: { enabled: true, side: 'left' } },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(updatedConfig), { status: 200 })
    );

    // Initial sync read should be immediate from cache
    expect(client.getCachedConfig()).toEqual(mockConfig);

    // Network revalidation
    const remote = await client.fetchAndSync('https://example.com/config.json');
    expect(remote).toEqual(updatedConfig);
    expect(client.getConfig()).toEqual(updatedConfig);
  });

  it('TC-C04: gracefully handles network failure / 500 / timeout by retaining cached config', async () => {
    const client = new ConfigClient();
    client.setCachedConfig(mockConfig);

    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await client.fetchAndSync('https://example.com/config.json');

    expect(result).toEqual(mockConfig);
    expect(client.getConfig()).toEqual(mockConfig);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('TC-C10: kill switch disabled: true halts activation and signals disabled state', () => {
    const disabledConfig: SiteKitConfig = {
      ...mockConfig,
      disabled: true,
    };

    const client = new ConfigClient();
    client.setCachedConfig(disabledConfig);

    expect(client.isDisabled()).toBe(true);
  });

  it('drops invalid remote JSON without corrupting the local cache', async () => {
    const client = new ConfigClient();
    client.setCachedConfig(mockConfig);

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('invalid { json', { status: 200 })
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await client.fetchAndSync('https://example.com/config.json');

    expect(client.getConfig()).toEqual(mockConfig);
    expect(warnSpy).toHaveBeenCalled();
  });
});
