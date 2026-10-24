import { isButtonElement, isTextElement } from '../adapters/squarespace.js';

export type TargetKind = 'button' | 'text';

export interface PickedTarget {
  kind: TargetKind;
  selector: string;
  label: string;
  textSnippet: string;
}

export interface PickerOptions {
  filterKind?: 'button' | 'text' | 'all';
  onSelect: (target: PickedTarget) => void;
  onCancel?: () => void;
}

export interface InspectorOptions {
  onSelect: (target: PickedTarget) => void;
}

export function detectElementTarget(
  target: HTMLElement | null,
  filterKind: 'button' | 'text' | 'all' = 'all'
): { element: HTMLElement; kind: TargetKind } | null {
  if (!target || typeof target.closest !== 'function' || target === document.body || target === document.documentElement) {
    return null;
  }
  // Never pick SiteKit editor components or Squarespace admin headers
  if (target.closest('#sitekit-host') || target.closest('[data-sk]') || target.closest('.sqs-edit-mode-header')) {
    return null;
  }

  // 1. Check Button first
  if (filterKind !== 'text' && isButtonElement(target)) {
    const btn = (target.closest(
      'a.sqs-block-button-element, button.sqs-block-button-element, .sqs-button-element--primary, .sqs-button-element--secondary, .sqs-button-element--tertiary, [data-sqsp-button], .sqs-block-button a, .sqs-block-button button, a.sqs-button-element'
    ) || target) as HTMLElement;
    return { element: btn, kind: 'button' };
  }

  // 2. Check Text
  if (filterKind !== 'button' && isTextElement(target)) {
    const txt = (target.closest(
      'h1, h2, h3, h4, h5, h6, p, blockquote, .sqsrte-large, .sqsrte-small'
    ) || target.closest('[data-sqsp-text-block-content] *') || target) as HTMLElement;
    return { element: txt, kind: 'text' };
  }

  return null;
}

export function extractTargetLabel(el: HTMLElement, kind: TargetKind = 'text'): string {
  const rawText = (el.textContent || '').trim().replace(/\s+/g, ' ');
  const snippet = rawText.length > 35 ? `${rawText.slice(0, 35)}…` : rawText;

  if (kind === 'button') {
    return `Button: "${snippet || 'Button'}"`;
  }

  const tag = el.tagName.toUpperCase();
  let tagDisplay = tag;
  if (tag === 'H1') tagDisplay = 'Heading 1 (H1)';
  else if (tag === 'H2') tagDisplay = 'Heading 2 (H2)';
  else if (tag === 'H3') tagDisplay = 'Heading 3 (H3)';
  else if (tag === 'H4') tagDisplay = 'Heading 4 (H4)';
  else if (tag === 'P') tagDisplay = 'Paragraph';

  return `${tagDisplay}: "${snippet}"`;
}

export function extractTargetSelector(el: HTMLElement, kind: TargetKind = 'text'): string {
  const tag = el.tagName.toLowerCase();

  // 1. Look for closest Squarespace block container with an id
  const block = el.closest('[id^="block-"], [data-block-id], [data-sqsp-block]');
  if (block && block.id && block !== el) {
    if (kind === 'button') {
      if (el.classList.contains('sqs-block-button-element')) {
        return `#${block.id} .sqs-block-button-element`;
      }
      return `#${block.id} ${tag}`;
    }

    const matching = Array.from(block.querySelectorAll(tag));
    if (matching.length <= 1) {
      return `#${block.id} ${tag}`;
    }
    const idx = matching.indexOf(el);
    return `#${block.id} ${tag}:nth-of-type(${idx + 1})`;
  }

  // 2. If element has its own distinct id (not auto-generated empty)
  if (el.id && !el.id.startsWith('sitekit-')) {
    return `#${el.id}`;
  }

  // 3. Look for closest section with an id
  const section = el.closest('section[id], [data-section-id]');
  if (section && section.id) {
    if (kind === 'button') {
      return `#${section.id} ${tag}.sqs-block-button-element, #${section.id} ${tag}`;
    }
    const matching = Array.from(section.querySelectorAll(tag));
    if (matching.length <= 1) {
      return `#${section.id} ${tag}`;
    }
    const idx = matching.indexOf(el);
    return `#${section.id} ${tag}:nth-of-type(${idx + 1})`;
  }

  // 4. Fallback: spec-first text block content
  const textContent = el.closest('[data-sqsp-text-block-content]');
  if (textContent) {
    return `[data-sqsp-text-block-content] ${tag}`;
  }

  if (kind === 'button') {
    return `${tag}.sqs-block-button-element, ${tag}`;
  }

  return tag;
}

export function startPicker(options: PickerOptions): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  // Clean up any stale picker elements
  const existing = document.querySelectorAll('[data-sk="picker-highlight"]');
  existing.forEach((e) => e.remove());

  const highlight = document.createElement('div');
  highlight.setAttribute('data-sk', 'picker-highlight');
  highlight.style.cssText =
    'position:fixed;pointer-events:none;border:2px solid #0f766e;background:rgba(15,118,110,0.14);border-radius:6px;z-index:2147483647;display:none;box-sizing:border-box;box-shadow:0 0 16px rgba(15,118,110,0.35);transition:all 0.05s ease;';

  const badge = document.createElement('div');
  badge.style.cssText =
    'position:absolute;top:-26px;left:0;background:#0f766e;color:#fff;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;white-space:nowrap;font-family:system-ui,-apple-system,sans-serif;pointer-events:none;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.2);';
  badge.textContent = 'Click to select element (Esc to cancel)';
  highlight.appendChild(badge);

  document.body.appendChild(highlight);

  let currentTargetEl: HTMLElement | null = null;
  let currentKind: TargetKind = 'text';
  let lastSelectTime = 0;

  const triggerSelect = (el: HTMLElement, kind: TargetKind) => {
    const now = Date.now();
    if (now - lastSelectTime < 350) return;
    lastSelectTime = now;

    const selector = extractTargetSelector(el, kind);
    const label = extractTargetLabel(el, kind);
    const textSnippet = (el.textContent || '').trim();

    cleanup();
    options.onSelect({ kind, selector, label, textSnippet });
  };

  const onMouseMove = (e: MouseEvent) => {
    const rawTarget = e.target as HTMLElement | null;
    if (!rawTarget || typeof rawTarget.closest !== 'function') return;

    const res = detectElementTarget(rawTarget, options.filterKind || 'all');
    if (!res || res.element === currentTargetEl) {
      if (!res) highlight.style.display = 'none';
      return;
    }

    currentTargetEl = res.element;
    currentKind = res.kind;
    const rect = currentTargetEl.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      highlight.style.display = 'none';
      return;
    }

    highlight.style.display = 'block';
    highlight.style.borderRadius = currentKind === 'button' ? '10px' : '4px';
    highlight.style.top = `${rect.top - 3}px`;
    highlight.style.left = `${rect.left - 3}px`;
    highlight.style.width = `${rect.width + 6}px`;
    highlight.style.height = `${rect.height + 6}px`;

    badge.textContent = `🎯 ${extractTargetLabel(currentTargetEl, currentKind)}`;
  };

  const onPointerDown = (e: MouseEvent | PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (!target || typeof target.closest !== 'function') return;

    // If clicking inside editor panel, let it work normally
    if (target.closest('#sitekit-host') || target.closest('[data-sk="host"]')) {
      return;
    }

    const targetEl = currentTargetEl || detectElementTarget(target, options.filterKind || 'all')?.element;
    const kind = (currentTargetEl ? currentKind : detectElementTarget(target, options.filterKind || 'all')?.kind) || 'text';

    if (targetEl) {
      e.preventDefault();
      e.stopPropagation();
      triggerSelect(targetEl, kind);
    }
  };

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target || typeof target.closest !== 'function') return;

    if (target.closest('#sitekit-host') || target.closest('[data-sk="host"]')) {
      return;
    }

    const targetEl = currentTargetEl || detectElementTarget(target, options.filterKind || 'all')?.element;
    const kind = (currentTargetEl ? currentKind : detectElementTarget(target, options.filterKind || 'all')?.kind) || 'text';

    if (targetEl) {
      e.preventDefault();
      e.stopPropagation();
      triggerSelect(targetEl, kind);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup(true);
    }
  };

  const cleanup = (cancelled = false) => {
    window.removeEventListener('mousemove', onMouseMove, true);
    window.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('click', onClick, true);
    window.removeEventListener('keydown', onKeyDown, true);
    highlight.remove();
    if (cancelled && options.onCancel) {
      options.onCancel();
    }
  };

  window.addEventListener('mousemove', onMouseMove, true);
  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('click', onClick, true);
  window.addEventListener('keydown', onKeyDown, true);

  return () => cleanup(false);
}

/**
 * Universal auto-inspector that runs whenever the editor panel is open.
 * Highlights buttons and text on hover and instantly routes on first click.
 */
export function startInspector(options: InspectorOptions): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  // Clean up any stale inspector highlights
  const existing = document.querySelectorAll('[data-sk="inspector-highlight"]');
  existing.forEach((e) => e.remove());

  const highlight = document.createElement('div');
  highlight.setAttribute('data-sk', 'inspector-highlight');
  highlight.style.cssText =
    'position:fixed;pointer-events:none;border:2px solid #0f766e;background:rgba(15,118,110,0.12);border-radius:6px;z-index:2147483645;display:none;box-sizing:border-box;box-shadow:0 0 16px rgba(15,118,110,0.3);transition:all 0.05s ease;cursor:pointer;';

  const badge = document.createElement('div');
  badge.style.cssText =
    'position:absolute;top:-26px;left:0;background:#0f766e;color:#fff;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;white-space:nowrap;font-family:system-ui,-apple-system,sans-serif;pointer-events:none;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.2);';
  highlight.appendChild(badge);

  document.body.appendChild(highlight);

  let currentTargetEl: HTMLElement | null = null;
  let currentKind: TargetKind = 'text';
  let lastSelectTime = 0;

  const triggerSelect = (el: HTMLElement, kind: TargetKind) => {
    const now = Date.now();
    if (now - lastSelectTime < 350) return;
    lastSelectTime = now;

    const selector = extractTargetSelector(el, kind);
    const label = extractTargetLabel(el, kind);
    const textSnippet = (el.textContent || '').trim();

    highlight.style.display = 'none';
    currentTargetEl = null;

    options.onSelect({ kind, selector, label, textSnippet });
  };

  const onMouseMove = (e: MouseEvent) => {
    // If picker is actively running, pause auto-inspector
    if (document.querySelector('[data-sk="picker-highlight"]')) {
      highlight.style.display = 'none';
      currentTargetEl = null;
      return;
    }

    const rawTarget = e.target as HTMLElement | null;
    if (!rawTarget || typeof rawTarget.closest !== 'function') {
      highlight.style.display = 'none';
      currentTargetEl = null;
      return;
    }

    // If hovering inside editor, hide overlay
    if (rawTarget.closest('#sitekit-host') || rawTarget.closest('[data-sk="host"]')) {
      highlight.style.display = 'none';
      currentTargetEl = null;
      return;
    }

    const res = detectElementTarget(rawTarget, 'all');
    if (!res || res.element === currentTargetEl) {
      if (!res) {
        highlight.style.display = 'none';
        currentTargetEl = null;
      }
      return;
    }

    currentTargetEl = res.element;
    currentKind = res.kind;
    const rect = currentTargetEl.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      highlight.style.display = 'none';
      return;
    }

    highlight.style.display = 'block';
    highlight.style.borderRadius = currentKind === 'button' ? '10px' : '4px';
    highlight.style.top = `${rect.top - 3}px`;
    highlight.style.left = `${rect.left - 3}px`;
    highlight.style.width = `${rect.width + 6}px`;
    highlight.style.height = `${rect.height + 6}px`;

    badge.textContent = `🎯 ${extractTargetLabel(currentTargetEl, currentKind)}`;
  };

  const onPointerDown = (e: MouseEvent | PointerEvent) => {
    if (e.button !== 0) return;
    const rawTarget = e.target as HTMLElement | null;
    if (!rawTarget || typeof rawTarget.closest !== 'function') return;

    // Normal click inside editor panel
    if (rawTarget.closest('#sitekit-host') || rawTarget.closest('[data-sk="host"]')) {
      return;
    }

    const targetEl = currentTargetEl || detectElementTarget(rawTarget, 'all')?.element;
    const kind = (currentTargetEl ? currentKind : detectElementTarget(rawTarget, 'all')?.kind) || 'text';

    if (targetEl) {
      e.preventDefault();
      e.stopPropagation();
      triggerSelect(targetEl, kind);
    }
  };

  const onClick = (e: MouseEvent) => {
    const rawTarget = e.target as HTMLElement | null;
    if (!rawTarget || typeof rawTarget.closest !== 'function') return;

    // Normal click inside editor panel
    if (rawTarget.closest('#sitekit-host') || rawTarget.closest('[data-sk="host"]')) {
      return;
    }

    const targetEl = currentTargetEl || detectElementTarget(rawTarget, 'all')?.element;
    const kind = (currentTargetEl ? currentKind : detectElementTarget(rawTarget, 'all')?.kind) || 'text';

    if (targetEl) {
      e.preventDefault();
      e.stopPropagation();
      triggerSelect(targetEl, kind);
    }
  };

  window.addEventListener('mousemove', onMouseMove, true);
  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('click', onClick, true);

  return () => {
    window.removeEventListener('mousemove', onMouseMove, true);
    window.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('click', onClick, true);
    highlight.remove();
  };
}

let activeSelectionCleanup: (() => void) | null = null;

export function setActiveCanvasSelection(
  selector: string | null,
  label: string = '',
  onDone?: () => void
): void {
  if (typeof document === 'undefined') return;

  if (activeSelectionCleanup) {
    activeSelectionCleanup();
    activeSelectionCleanup = null;
  }

  if (!selector) return;

  const targetEl = document.querySelector(selector) as HTMLElement | null;
  if (!targetEl) return;

  const frame = document.createElement('div');
  frame.setAttribute('data-sk', 'active-selection');
  frame.style.cssText =
    'position:fixed;pointer-events:none;border:2px solid #0f766e;border-radius:8px;z-index:2147483644;box-sizing:border-box;box-shadow:0 0 0 3px rgba(15,118,110,0.25), 0 4px 16px rgba(15,118,110,0.3);transition:top 0.1s ease, left 0.1s ease, width 0.1s ease, height 0.1s ease;';

  const miniToolbar = document.createElement('div');
  miniToolbar.style.cssText =
    'position:absolute;top:-30px;left:0;display:flex;align-items:center;gap:6px;pointer-events:auto;background:#0f766e;color:#fff;font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-family:system-ui,-apple-system,sans-serif;line-height:1;white-space:nowrap;';

  const labelSpan = document.createElement('span');
  labelSpan.textContent = `🎯 ${label || 'Selected Element'}`;
  miniToolbar.appendChild(labelSpan);

  if (onDone) {
    const doneBtn = document.createElement('button');
    doneBtn.type = 'button';
    doneBtn.textContent = '✕ Done';
    doneBtn.style.cssText =
      'border:0;background:rgba(255,255,255,0.25);color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;cursor:pointer;line-height:1;transition:background 0.15s;';
    doneBtn.onmouseenter = () => {
      doneBtn.style.background = 'rgba(255,255,255,0.4)';
    };
    doneBtn.onmouseleave = () => {
      doneBtn.style.background = 'rgba(255,255,255,0.25)';
    };
    doneBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onDone();
    };
    miniToolbar.appendChild(doneBtn);
  }

  frame.appendChild(miniToolbar);
  document.body.appendChild(frame);

  const updatePos = () => {
    if (!document.body.contains(targetEl)) {
      frame.remove();
      return;
    }
    const rect = targetEl.getBoundingClientRect();
    frame.style.top = `${rect.top - 3}px`;
    frame.style.left = `${rect.left - 3}px`;
    frame.style.width = `${rect.width + 6}px`;
    frame.style.height = `${rect.height + 6}px`;
  };

  updatePos();
  window.addEventListener('scroll', updatePos, true);
  window.addEventListener('resize', updatePos);

  activeSelectionCleanup = () => {
    window.removeEventListener('scroll', updatePos, true);
    window.removeEventListener('resize', updatePos);
    frame.remove();
  };
}

export function clearActiveCanvasSelection(): void {
  if (activeSelectionCleanup) {
    activeSelectionCleanup();
    activeSelectionCleanup = null;
  }
  if (typeof document !== 'undefined') {
    const existing = document.querySelectorAll('[data-sk="active-selection"]');
    existing.forEach((el) => el.remove());
  }
}

