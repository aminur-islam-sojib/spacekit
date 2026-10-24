import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'preact/test-utils';
import { mountEditor, unmountEditor } from '../../src/editor/index.js';
import { registry, lifecycle } from '../../src/core/index.js';
import { backToTopFeature } from '../../src/features/backToTop/index.js';
import { buttonStylesFeature } from '../../src/features/buttonStyles/index.js';
import { textEffectsFeature } from '../../src/features/textEffects/index.js';

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
    expect(host?.style.position).toBe('relative');
    expect(host?.style.zIndex).toBe('2147483647');
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

  it('TC-E15: auto-inspector running when panel is open clicks button on page and routes to buttonStyles editor', () => {
    registry.register(buttonStylesFeature);
    const btn = document.createElement('a');
    btn.className = 'sqs-block-button-element';
    btn.textContent = 'Get Quote';
    document.body.appendChild(btn);

    act(() => {
      mountEditor();
    });
    const host = document.getElementById('sitekit-host')!;
    const shadow = host.shadowRoot!;
    const fab = shadow.querySelector('.fab') as HTMLButtonElement;

    // Open panel
    act(() => {
      fab.click();
    });

    // Click button on page
    act(() => {
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    // Panel should have navigated to Button
    expect(shadow.querySelector('h2')?.textContent).toBe('Button');
    expect(shadow.querySelector('.button-styles-editor')).not.toBeNull();
  });

  it('TC-E16: renders single focused property inspector when element is selected, without showing other element cards, and deselects with Done button', () => {
    registry.register(buttonStylesFeature);
    const btn1 = document.createElement('a');
    btn1.id = 'btn-1';
    btn1.className = 'sqs-block-button-element';
    btn1.textContent = 'Button One';
    const btn2 = document.createElement('a');
    btn2.id = 'btn-2';
    btn2.className = 'sqs-block-button-element';
    btn2.textContent = 'Button Two';
    document.body.appendChild(btn1);
    document.body.appendChild(btn2);

    act(() => {
      mountEditor();
    });
    const shadow = document.getElementById('sitekit-host')!.shadowRoot!;
    act(() => {
      (shadow.querySelector('.fab') as HTMLButtonElement).click();
    });

    // Click btn1
    act(() => {
      btn1.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    // Inspector should focus ONLY on btn1
    expect(shadow.querySelector('.editing-badge')?.textContent).toContain('Editing: Button');
    expect(shadow.querySelector('.editing-badge')?.textContent).toContain('Done');
    expect(shadow.querySelector('.focused-inspector')).not.toBeNull();
    // No stacked card forms for other elements
    expect(shadow.querySelectorAll('.rule-card').length).toBe(0);

    // Click Done to deselect
    const doneBtn = shadow.querySelector('.editing-done-btn') as HTMLButtonElement;
    expect(doneBtn).not.toBeNull();
    act(() => {
      doneBtn.click();
    });

    // Active inspector clears, shows idle empty-selection prompt
    expect(shadow.querySelector('.editing-badge')).toBeNull();
    expect(shadow.querySelector('.empty-selection-card')).not.toBeNull();
  });

  it('TC-E17: renders Text options section when text element is selected on page, and toggles switch', () => {
    registry.register(textEffectsFeature);
    const heading = document.createElement('h2');
    heading.id = 'heading-test';
    heading.textContent = 'Photographe';
    document.body.appendChild(heading);

    act(() => {
      mountEditor();
    });
    const shadow = document.getElementById('sitekit-host')!.shadowRoot!;
    act(() => {
      (shadow.querySelector('.fab') as HTMLButtonElement).click();
    });

    // Click heading
    act(() => {
      heading.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    expect(shadow.querySelector('.detail-title')?.textContent).toBe('Text');
    expect(shadow.querySelector('.section-title')?.textContent).toContain('Text options');

    // Section body should be visible because textOptionsEnabled is true by default
    expect(shadow.querySelector('.tag-text-label')).not.toBeNull();
    expect(shadow.querySelector('.tag-text-label')?.textContent).toContain('Heading 2');
    expect(shadow.querySelector('.segmented-group')).not.toBeNull();

    // Verify editing color immediately updates live CSS in document.head via feature.update
    const colorInput = shadow.querySelector('.color-swatch-input') as HTMLInputElement;
    expect(colorInput).not.toBeNull();
    act(() => {
      colorInput.value = '#ef4444';
      colorInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const styleEl = document.querySelector('style[data-sk="textEffects"]');
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain('color: #ef4444 !important;');
  });

  it('TC-E18: opens Text effects menu, selects an effect, and renders dynamic customizer with swatches & steppers', () => {
    registry.register(textEffectsFeature);
    const heading = document.createElement('h1');
    heading.id = 'hero-effects-h1';
    heading.textContent = 'Créateur de contenu';
    document.body.appendChild(heading);

    act(() => {
      mountEditor();
    });
    const shadow = document.getElementById('sitekit-host')!.shadowRoot!;
    act(() => {
      (shadow.querySelector('.fab') as HTMLButtonElement).click();
    });

    // Click heading on canvas to focus it in editor
    act(() => {
      heading.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    // Click dropdown trigger
    const trigger = shadow.querySelector('.effect-dropdown-trigger') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    expect(trigger.textContent).toContain('None');

    act(() => {
      trigger.click();
    });

    // Menu should be open
    const menu = shadow.querySelector('.effect-dropdown-menu');
    expect(menu).not.toBeNull();

    // Select "Gradient animated"
    const items = shadow.querySelectorAll('.effect-menu-item');
    expect(items.length).toBeGreaterThan(0);
    const gradientItem = Array.from(items).find((el) => el.textContent?.includes('Gradient animated')) as HTMLElement;
    expect(gradientItem).not.toBeNull();

    act(() => {
      gradientItem.click();
    });

    // Trigger should now show Gradient animated
    expect(shadow.querySelector('.effect-dropdown-trigger')?.textContent).toContain('Gradient');

    // Dynamic customizer controls should appear
    const colorSwatches = shadow.querySelectorAll('.color-swatch-circle');
    expect(colorSwatches.length).toBe(2); // Text color + Accent color

    const steppers = shadow.querySelectorAll('.stepper-control');
    expect(steppers.length).toBe(2); // Apply style to + Animation speed

    expect(shadow.querySelector('.stepper-value')?.textContent).toBe('All words');

    // Check live CSS contains gradient text
    const styleEl = document.querySelector('style[data-sk="textEffects"]');
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain('sitekit-text-gradient-pan');
  });
});

