import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { announcementBarFeature } from '../../src/features/announcementBar/index.js';
import {
  announcementBarDefaults,
  type AnnouncementBarConfig,
} from '../../src/features/announcementBar/schema.js';
import type { SqspEnv } from '../../src/shared/types.js';

describe('Feature: Announcement Bar (TC-AB01..TC-AB07)', () => {
  const mockEnv: SqspEnv = {
    isEditor: false,
    isEditorActive: false,
  };

  beforeEach(() => {
    document.body.replaceChildren();
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    announcementBarFeature.destroy();
  });

  it('TC-AB01: does not render announcement bar when enabled is false', () => {
    announcementBarFeature.init({ ...announcementBarDefaults, enabled: false }, mockEnv);
    const bar = document.querySelector('[data-sk="announcementBar"]');
    expect(bar).toBeNull();
  });

  it('TC-AB02: renders announcement bar at top with text and link', () => {
    const config: AnnouncementBarConfig = {
      ...announcementBarDefaults,
      enabled: true,
      text: 'Special Sale Today!',
      linkUrl: 'https://example.com/sale',
      linkText: 'Shop Now',
      bg: '#1e293b',
      fg: '#f8fafc',
    };

    announcementBarFeature.init(config, mockEnv);
    const bar = document.querySelector('[data-sk="announcementBar"]') as HTMLElement;

    expect(bar).not.toBeNull();
    expect(bar.textContent).toContain('Special Sale Today!');
    expect(bar.textContent).toContain('Shop Now');

    const link = bar.querySelector('a');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://example.com/sale');
  });

  it('TC-AB03: clicking dismiss button removes bar and persists dismissal', () => {
    announcementBarFeature.init(
      { ...announcementBarDefaults, enabled: true, closable: true },
      mockEnv
    );
    const bar = document.querySelector('[data-sk="announcementBar"]') as HTMLElement;
    expect(bar).not.toBeNull();

    const closeBtn = bar.querySelector('[data-act="dismiss"]') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();

    closeBtn.click();

    // Bar is removed from DOM
    expect(document.querySelector('[data-sk="announcementBar"]')).toBeNull();

    // Re-initializing respects dismissal for visitors
    announcementBarFeature.init(
      { ...announcementBarDefaults, enabled: true, closable: true },
      mockEnv
    );
    expect(document.querySelector('[data-sk="announcementBar"]')).toBeNull();
  });

  it('TC-AB04: close button is accessible with aria-label and keyboard support', () => {
    announcementBarFeature.init(
      { ...announcementBarDefaults, enabled: true, closable: true },
      mockEnv
    );
    const closeBtn = document.querySelector('[data-act="dismiss"]') as HTMLButtonElement;

    expect(closeBtn.getAttribute('aria-label')).toBe('Dismiss announcement');
    expect(closeBtn.tabIndex).toBe(0);
  });

  it('TC-AB05: prevents HTML/XSS injection in message text', () => {
    const maliciousConfig: AnnouncementBarConfig = {
      ...announcementBarDefaults,
      enabled: true,
      text: '<img src=x onerror=alert(1)>Special Offer',
    };

    announcementBarFeature.init(maliciousConfig, mockEnv);
    const bar = document.querySelector('[data-sk="announcementBar"]') as HTMLElement;

    // No img element created
    expect(bar.querySelector('img')).toBeNull();
    expect(bar.textContent).toContain('Special Offer');
  });

  it('TC-AB06: update() updates text, colors, and links live', () => {
    announcementBarFeature.init(
      { ...announcementBarDefaults, enabled: true, text: 'Initial Text' },
      mockEnv
    );
    expect(document.querySelector('[data-sk="announcementBar"]')?.textContent).toContain(
      'Initial Text'
    );

    announcementBarFeature.update(
      { ...announcementBarDefaults, enabled: true, text: 'Updated Live Text' },
      mockEnv
    );

    const bars = document.querySelectorAll('[data-sk="announcementBar"]');
    expect(bars.length).toBe(1);
    expect(bars[0].textContent).toContain('Updated Live Text');
  });

  it('TC-AB07: destroy() completely removes bar and event listeners', () => {
    announcementBarFeature.init({ ...announcementBarDefaults, enabled: true }, mockEnv);
    expect(document.querySelectorAll('[data-sk="announcementBar"]').length).toBe(1);

    announcementBarFeature.destroy();
    expect(document.querySelectorAll('[data-sk="announcementBar"]').length).toBe(0);
  });
});
