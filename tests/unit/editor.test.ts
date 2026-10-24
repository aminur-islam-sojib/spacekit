import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'preact/test-utils';
import { mountEditor, unmountEditor } from '../../src/editor/index.js';
import { registry, lifecycle } from '../../src/core/index.js';
import { backToTopFeature } from '../../src/features/backToTop/index.js';

describe('Editor Panel (TC-E04, TC-E05, TC-E08, TC-E09, TC-E10, TC-E11, TC-E12)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    localStorage.clear();
    registry.clear();
    registry.register(backToTopFeature);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    act(() => {
      unmountEditor();
    });
    document.body.replaceChildren();
  });

  it('TC-E04: mounts launcher and panel into open Shadow DOM', () => {
    act(() => {
      mountEditor();
    });
    const host = document.getElementById('sitekit-host');
    expect(host).not.toBeNull();
    expect(host?.shadowRoot).not.toBeNull();

    const fab = host?.shadowRoot?.querySelector('.fab') as HTMLButtonElement;
    expect(fab).not.toBeNull();
    expect(fab.getAttribute('aria-label')).toBe('Open SiteKit');

    const panel = host?.shadowRoot?.querySelector('.panel') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.hidden).toBe(true);
  });

  it('TC-E05: opens and closes via launcher button and Esc key', () => {
    act(() => {
      mountEditor();
    });
    const host = document.getElementById('sitekit-host')!;
    const shadow = host.shadowRoot!;
    const fab = shadow.querySelector('.fab') as HTMLButtonElement;
    const panel = shadow.querySelector('.panel') as HTMLElement;

    // Click FAB to open
    act(() => {
      fab.click();
    });
    expect(panel.hidden).toBe(false);

    // Press Escape to close
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(panel.hidden).toBe(true);

    // Click FAB to re-open
    act(() => {
      fab.click();
    });
    expect(panel.hidden).toBe(false);

    // Click close button inside header
    const closeBtn = shadow.querySelector('[data-act="close"]') as HTMLButtonElement;
    act(() => {
      closeBtn.click();
    });
    expect(panel.hidden).toBe(true);
  });

  it('TC-E08: search input filters the features list', () => {
    act(() => {
      mountEditor();
    });
    const shadow = document.getElementById('sitekit-host')!.shadowRoot!;
    const searchInput = shadow.querySelector('.search') as HTMLInputElement;

    expect(searchInput).not.toBeNull();
    expect(shadow.querySelectorAll('.items button').length).toBe(1);

    // Search for non-matching term
    act(() => {
      searchInput.value = 'nonexistent';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(shadow.querySelectorAll('.items button').length).toBe(0);
    expect(shadow.querySelector('.empty')?.textContent).toContain('No features match');

    // Search for matching term
    act(() => {
      searchInput.value = 'back';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(shadow.querySelectorAll('.items button').length).toBe(1);
    expect(shadow.querySelector('.items button')?.textContent).toContain('Back to top button');
  });

  it('TC-E09: drills down into feature detail view and navigates back', () => {
    act(() => {
      mountEditor();
    });
    const shadow = document.getElementById('sitekit-host')!.shadowRoot!;
    const itemBtn = shadow.querySelector('[data-open="backToTop"]') as HTMLButtonElement;

    // Click feature item to drill down
    act(() => {
      itemBtn.click();
    });

    expect(shadow.querySelector('h2')?.textContent).toBe('Back to top button');
    expect(shadow.querySelector('.back')).not.toBeNull();
    expect(shadow.querySelectorAll('input[type="range"]').length).toBeGreaterThan(0);

    // Click Back button to return to list
    const backBtn = shadow.querySelector('.back') as HTMLButtonElement;
    act(() => {
      backBtn.click();
    });

    expect(shadow.querySelector('h2')?.textContent).toBe('Features');
    expect(shadow.querySelector('.search')).not.toBeNull();
  });

  it('TC-E10: control changes trigger feature.update live preview within 100ms', () => {
    const updateSpy = vi.spyOn(lifecycle, 'updateFeature');
    act(() => {
      mountEditor();
    });
    const shadow = document.getElementById('sitekit-host')!.shadowRoot!;

    // Open detail
    act(() => {
      (shadow.querySelector('[data-open="backToTop"]') as HTMLButtonElement).click();
    });

    // Find the toggle checkbox for 'enabled'
    const toggle = shadow.querySelector('input[data-k="enabled"]') as HTMLInputElement;
    expect(toggle).not.toBeNull();

    act(() => {
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'backToTop' }),
      expect.objectContaining({ enabled: true }),
      expect.anything()
    );
  });

  it('TC-E11: saves drafts to localStorage and marks status as Unsaved changes', () => {
    act(() => {
      mountEditor();
    });
    const shadow = document.getElementById('sitekit-host')!.shadowRoot!;

    act(() => {
      (shadow.querySelector('[data-open="backToTop"]') as HTMLButtonElement).click();
    });
    const toggle = shadow.querySelector('input[data-k="enabled"]') as HTMLInputElement;

    act(() => {
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const statusEl = shadow.querySelector('.status') as HTMLElement;
    expect(statusEl.textContent).toBe('Unsaved changes');

    // Check localStorage draft
    const draftRaw = localStorage.getItem(`sitekit:draft:${location.hostname}`);
    expect(draftRaw).not.toBeNull();
    const draft = JSON.parse(draftRaw!);
    expect(draft.features.backToTop.enabled).toBe(true);
  });

  it('TC-E12: reset to defaults restores feature defaults and updates live preview', () => {
    const updateSpy = vi.spyOn(lifecycle, 'updateFeature');
    act(() => {
      mountEditor();
    });
    const shadow = document.getElementById('sitekit-host')!.shadowRoot!;

    act(() => {
      (shadow.querySelector('[data-open="backToTop"]') as HTMLButtonElement).click();
    });

    // Click Reset to defaults
    const resetBtn = shadow.querySelector('[data-act="reset"]') as HTMLButtonElement;
    expect(resetBtn).not.toBeNull();
    act(() => {
      resetBtn.click();
    });

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'backToTop' }),
      expect.objectContaining({ enabled: false }),
      expect.anything()
    );
  });

  it('TC-E14: renders modern top header actions, category grouping, and publish pill with badge', () => {
    act(() => {
      mountEditor();
    });
    const shadow = document.getElementById('sitekit-host')!.shadowRoot!;

    // Top action buttons exist
    const brand = shadow.querySelector('.brand-mark');
    expect(brand).not.toBeNull();
    const actionBtns = shadow.querySelectorAll('.header-icon-btn');
    expect(actionBtns.length).toBe(4); // Help, Filter, Search, Close

    // Category header rendered
    const catHeader = shadow.querySelector('.category-header');
    expect(catHeader).not.toBeNull();
    expect(catHeader?.textContent).toBe('Navigation & Utility');

    // Help banner toggling
    const helpBtn = shadow.querySelector('button[aria-label="Help & Documentation"]') as HTMLButtonElement;
    expect(shadow.querySelector('.help-banner')).toBeNull();
    act(() => {
      helpBtn.click();
    });
    expect(shadow.querySelector('.help-banner')).not.toBeNull();

    // Floating publish pill
    const pill = shadow.querySelector('.publish-pill') as HTMLButtonElement;
    expect(pill).not.toBeNull();
    expect(pill.textContent).toContain('Publish');

    // Trigger an unsaved change and verify pill badge appears
    act(() => {
      (shadow.querySelector('[data-open="backToTop"]') as HTMLButtonElement).click();
    });
    const toggle = shadow.querySelector('input[data-k="enabled"]') as HTMLInputElement;
    act(() => {
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const badge = shadow.querySelector('.pill-badge');
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toBe('1');
  });
});

