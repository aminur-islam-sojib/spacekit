import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  extractTargetSelector,
  extractTargetLabel,
  startPicker,
  startInspector,
  setActiveCanvasSelection,
  clearActiveCanvasSelection,
} from '../../src/editor/picker.js';

describe('Target Picker (TC-TP01..TC-TP05)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('TC-TP01: extracts unique selector from element with Squarespace block ID', () => {
    const block = document.createElement('div');
    block.id = 'block-yui_12345';
    block.className = 'sqs-block sqs-block-html';

    const content = document.createElement('div');
    content.setAttribute('data-sqsp-text-block-content', '');

    const h1 = document.createElement('h1');
    h1.id = 'hero-title';
    h1.textContent = 'Welcome to SiteKit';

    content.appendChild(h1);
    block.appendChild(content);
    document.body.appendChild(block);

    const selector = extractTargetSelector(h1);

    expect(selector).toContain('#block-yui_12345');
    expect(selector).toContain('h1');
  });

  it('TC-TP02: extracts unique selector from element within a section ID', () => {
    const section = document.createElement('section');
    section.id = 'about-us';
    section.setAttribute('data-sqsp-section', 'fluid-engine');

    const content = document.createElement('div');
    content.setAttribute('data-sqsp-text-block-content', '');

    const h2 = document.createElement('h2');
    h2.textContent = 'Our Story';

    content.appendChild(h2);
    section.appendChild(content);
    document.body.appendChild(section);

    const selector = extractTargetSelector(h2);

    expect(selector).toContain('#about-us');
    expect(selector).toContain('h2');
  });

  it('TC-TP03: creates descriptive label with tag name and text snippet', () => {
    const h1 = document.createElement('h1');
    h1.textContent = 'Transform Your Squarespace Site';
    document.body.appendChild(h1);

    const label = extractTargetLabel(h1);
    expect(label).toContain('H1');
    expect(label).toContain('Transform Your Squarespace');
  });

  it('TC-TP04: ignores elements inside #sitekit-host during picking', () => {
    const host = document.createElement('div');
    host.id = 'sitekit-host';

    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.textContent = 'SiteKit';
    host.appendChild(fab);

    const block = document.createElement('div');
    block.id = 'block-1';

    const p = document.createElement('p');
    p.textContent = 'Real Content';
    block.appendChild(p);

    document.body.appendChild(host);
    document.body.appendChild(block);

    const onSelect = vi.fn();
    const cleanup = startPicker({ onSelect });

    fab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    // Should not trigger onSelect for editor UI
    expect(onSelect).not.toHaveBeenCalled();

    cleanup();
  });

  it('TC-TP05: cancels cleanly on Escape key without leaving picker overlays', () => {
    const h1 = document.createElement('h1');
    h1.textContent = 'Page Title';
    document.body.appendChild(h1);

    const onCancel = vi.fn();
    startPicker({ onSelect: vi.fn(), onCancel });

    expect(document.querySelector('[data-sk="picker-highlight"]')).not.toBeNull();

    // Press Escape
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-sk="picker-highlight"]')).toBeNull();
  });

  it('TC-TP06: detects button elements vs text elements with proper kind classification', () => {
    const btnBlock = document.createElement('div');
    btnBlock.id = 'block-yui_btn1';
    const btn = document.createElement('a');
    btn.className = 'sqs-block-button-element';
    btn.textContent = 'Shop Now';
    btnBlock.appendChild(btn);
    document.body.appendChild(btnBlock);

    const onSelect = vi.fn();
    const cleanup = startPicker({ onSelect });

    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'button',
        selector: '#block-yui_btn1 .sqs-block-button-element',
        label: 'Button: "Shop Now"',
      })
    );

    cleanup();
  });

  it('TC-TP07: universal auto-inspector tracks hover on buttons and fires selection', () => {
    const btn = document.createElement('button');
    btn.className = 'sqs-block-button-element';
    btn.textContent = 'Book Now';
    document.body.appendChild(btn);

    const onSelect = vi.fn();
    const cleanup = startInspector({ onSelect });

    // Hover creates inspector highlight
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 10, clientY: 10 }));

    // Click triggers element selection
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'button',
        label: 'Button: "Book Now"',
      })
    );

    cleanup();
  });

  it('TC-TP08: canvas overlays and selection frame have z-index strictly below editor panel (<= 2147483640)', () => {
    // 1. Check picker highlight
    const cleanupPicker = startPicker({ onSelect: vi.fn() });
    const pickerEl = document.querySelector('[data-sk="picker-highlight"]') as HTMLElement;
    expect(pickerEl).not.toBeNull();
    const pickerZIndex = parseInt(pickerEl.style.zIndex, 10);
    expect(pickerZIndex).toBeLessThan(2147483647);
    expect(pickerZIndex).toBeLessThanOrEqual(2147483640);
    cleanupPicker();

    // 2. Check inspector highlight
    const cleanupInspector = startInspector({ onSelect: vi.fn() });
    const inspectorEl = document.querySelector('[data-sk="inspector-highlight"]') as HTMLElement;
    expect(inspectorEl).not.toBeNull();
    const inspectorZIndex = parseInt(inspectorEl.style.zIndex, 10);
    expect(inspectorZIndex).toBeLessThan(2147483647);
    expect(inspectorZIndex).toBeLessThanOrEqual(2147483640);
    cleanupInspector();

    // 3. Check active selection frame
    const h1 = document.createElement('h1');
    h1.id = 'target-title';
    h1.textContent = 'Hero Element';
    document.body.appendChild(h1);

    setActiveCanvasSelection('#target-title', 'Hero Element');
    const frame = document.querySelector('[data-sk="active-selection"]') as HTMLElement;
    expect(frame).not.toBeNull();
    const frameZIndex = parseInt(frame.style.zIndex, 10);
    expect(frameZIndex).toBeLessThan(2147483647);
    expect(frameZIndex).toBeLessThanOrEqual(2147483640);

    clearActiveCanvasSelection();
    expect(document.querySelector('[data-sk="active-selection"]')).toBeNull();
  });
});
