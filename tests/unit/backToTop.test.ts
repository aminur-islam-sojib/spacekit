import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { backToTopFeature } from '../../src/features/backToTop/index.js';
import { backToTopDefaults, type BackToTopConfig } from '../../src/features/backToTop/schema.js';
import type { SqspEnv } from '../../src/shared/types.js';

describe('Feature: Back to top (TC-B01..B07, TC-B13)', () => {
  const mockEnv: SqspEnv = {
    isEditor: false,
    isEditorActive: false,
  };

  beforeEach(() => {
    document.body.replaceChildren();
    window.scrollY = 0;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    backToTopFeature.destroy();
  });

  it('TC-B01: does not render button when disabled: false', () => {
    backToTopFeature.init({ ...backToTopDefaults, enabled: false }, mockEnv);
    const btn = document.querySelector('[data-sk="backToTop"]');
    expect(btn).toBeNull();
  });

  it('TC-B02: renders button hidden with aria-hidden="true" and tabIndex="-1" when scrollY < showAfter', () => {
    backToTopFeature.init({ ...backToTopDefaults, enabled: true, showAfter: 300 }, mockEnv);
    const btn = document.querySelector('[data-sk="backToTop"]') as HTMLButtonElement;

    expect(btn).not.toBeNull();
    expect(btn.getAttribute('aria-hidden')).toBe('true');
    expect(btn.tabIndex).toBe(-1);
    expect(btn.style.opacity).toBe('0');
    expect(btn.style.pointerEvents).toBe('none');
  });

  it('TC-B03: shows button with aria-hidden="false" and tabIndex="0" when scrolled past showAfter', () => {
    backToTopFeature.init({ ...backToTopDefaults, enabled: true, showAfter: 200 }, mockEnv);
    const btn = document.querySelector('[data-sk="backToTop"]') as HTMLButtonElement;

    // Simulate scroll past showAfter
    Object.defineProperty(window, 'scrollY', { value: 350, writable: true });
    window.dispatchEvent(new Event('scroll'));

    expect(btn.getAttribute('aria-hidden')).toBe('false');
    expect(btn.tabIndex).toBe(0);
    expect(btn.style.opacity).toBe('1');
    expect(btn.style.pointerEvents).toBe('auto');
  });

  it('TC-B04: clicking the button triggers scrollTo top', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    backToTopFeature.init({ ...backToTopDefaults, enabled: true, smooth: true }, mockEnv);
    const btn = document.querySelector('[data-sk="backToTop"]') as HTMLButtonElement;

    btn.click();

    expect(scrollSpy).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0 })
    );
  });

  it('TC-B05: applies configured side, offsets, and colors', () => {
    const customConfig: BackToTopConfig = {
      ...backToTopDefaults,
      enabled: true,
      side: 'left',
      offsetX: 40,
      offsetY: 60,
      bg: '#123456',
      fg: '#ffffff',
    };

    backToTopFeature.init(customConfig, mockEnv);
    const btn = document.querySelector('[data-sk="backToTop"]') as HTMLButtonElement;

    expect(btn.style.left).toBe('40px');
    expect(btn.style.bottom).toBe('60px');
    expect(btn.style.background).toBe('rgb(18, 52, 86)'); // rgb equivalent of #123456
  });

  it('TC-B06: maintains minimum 44px hit area even when size is 32px', () => {
    backToTopFeature.init({ ...backToTopDefaults, enabled: true, size: 32 }, mockEnv);
    const btn = document.querySelector('[data-sk="backToTop"]') as HTMLButtonElement;

    expect(btn.style.minWidth).toBe('44px');
    expect(btn.style.minHeight).toBe('44px');
  });

  it('TC-B07: has accessible name "Back to top"', () => {
    backToTopFeature.init({ ...backToTopDefaults, enabled: true }, mockEnv);
    const btn = document.querySelector('[data-sk="backToTop"]') as HTMLButtonElement;

    expect(btn.getAttribute('aria-label')).toBe('Back to top');
  });

  it('TC-B13: update cleanly updates existing button without duplicating DOM or listeners', () => {
    backToTopFeature.init({ ...backToTopDefaults, enabled: true, side: 'right', offsetX: 20 }, mockEnv);
    expect(document.querySelectorAll('[data-sk="backToTop"]').length).toBe(1);

    backToTopFeature.update({ ...backToTopDefaults, enabled: true, side: 'left', offsetX: 50 }, mockEnv);

    const buttons = document.querySelectorAll('[data-sk="backToTop"]');
    expect(buttons.length).toBe(1);
    expect((buttons[0] as HTMLButtonElement).style.left).toBe('50px');
  });

  it('destroy fully removes button and listeners from DOM', () => {
    backToTopFeature.init({ ...backToTopDefaults, enabled: true }, mockEnv);
    expect(document.querySelectorAll('[data-sk="backToTop"]').length).toBe(1);

    backToTopFeature.destroy();
    expect(document.querySelectorAll('[data-sk="backToTop"]').length).toBe(0);
  });
});

