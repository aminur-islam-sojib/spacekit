export interface PickedTarget {
  selector: string;
  label: string;
  textSnippet: string;
}

export interface PickerOptions {
  onSelect: (target: PickedTarget) => void;
  onCancel?: () => void;
}

export function extractTargetLabel(el: HTMLElement): string {
  const tag = el.tagName.toUpperCase();
  let tagDisplay = tag;
  if (tag === 'H1') tagDisplay = 'Heading 1 (H1)';
  else if (tag === 'H2') tagDisplay = 'Heading 2 (H2)';
  else if (tag === 'H3') tagDisplay = 'Heading 3 (H3)';
  else if (tag === 'H4') tagDisplay = 'Heading 4 (H4)';
  else if (tag === 'P') tagDisplay = 'Paragraph';

  const rawText = (el.textContent || '').trim().replace(/\s+/g, ' ');
  const snippet = rawText.length > 40 ? `${rawText.slice(0, 40)}…` : rawText;
  return `${tagDisplay}: "${snippet}"`;
}

export function extractTargetSelector(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase();

  // 1. Look for closest Squarespace block container with an id
  const block = el.closest('[id^="block-"], [data-block-id], [data-sqsp-block]');
  if (block && block.id && block !== el) {
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

  // 2. Look for closest section with an id
  const section = el.closest('section[id], [data-section-id]');
  if (section && section.id) {
    const matching = Array.from(section.querySelectorAll(tag));
    if (matching.length <= 1) {
      return `#${section.id} ${tag}`;
    }
    const idx = matching.indexOf(el);
    return `#${section.id} ${tag}:nth-of-type(${idx + 1})`;
  }

  // 3. Fallback: spec-first text block content
  const textContent = el.closest('[data-sqsp-text-block-content]');
  if (textContent) {
    return `[data-sqsp-text-block-content] ${tag}`;
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
    'position:fixed;pointer-events:none;border:2px solid #0f766e;background:rgba(15,118,110,0.14);border-radius:4px;z-index:2147483647;display:none;box-sizing:border-box;box-shadow:0 0 16px rgba(15,118,110,0.35);transition:all 0.05s ease;';

  const badge = document.createElement('div');
  badge.style.cssText =
    'position:absolute;top:-26px;left:0;background:#0f766e;color:#fff;font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;white-space:nowrap;font-family:system-ui,-apple-system,sans-serif;pointer-events:none;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,0.2);';
  badge.textContent = 'Click to style text (Esc to cancel)';
  highlight.appendChild(badge);

  document.body.appendChild(highlight);

  let currentTargetEl: HTMLElement | null = null;

  const findTextElement = (target: HTMLElement | null): HTMLElement | null => {
    if (!target || target === document.body || target === document.documentElement) return null;
    // Never pick SiteKit editor components
    if (target.closest('#sitekit-host') || target.closest('[data-sk]')) return null;

    // Find nearest text node container
    return (
      (target.closest(
        'h1, h2, h3, h4, h5, h6, p, blockquote, .sqsrte-large, .sqsrte-small'
      ) as HTMLElement | null) ||
      (target.closest('[data-sqsp-text-block-content] *') as HTMLElement | null) ||
      target
    );
  };

  const onMouseMove = (e: MouseEvent) => {
    const el = findTextElement(e.target as HTMLElement);
    if (!el || el === currentTargetEl) {
      if (!el) highlight.style.display = 'none';
      return;
    }

    currentTargetEl = el;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      highlight.style.display = 'none';
      return;
    }

    highlight.style.display = 'block';
    highlight.style.top = `${rect.top - 3}px`;
    highlight.style.left = `${rect.left - 3}px`;
    highlight.style.width = `${rect.width + 6}px`;
    highlight.style.height = `${rect.height + 6}px`;

    badge.textContent = `🎯 ${extractTargetLabel(el)}`;
  };

  const onClick = (e: MouseEvent) => {
    // If clicking inside editor panel, let it work normally
    const target = e.target as HTMLElement | null;
    if (target && (target.closest('#sitekit-host') || target.closest('[data-sk="host"]'))) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (currentTargetEl) {
      const selector = extractTargetSelector(currentTargetEl);
      const label = extractTargetLabel(currentTargetEl);
      const textSnippet = (currentTargetEl.textContent || '').trim();

      cleanup();
      options.onSelect({ selector, label, textSnippet });
    } else {
      cleanup(true);
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup(true);
    }
  };

  const cleanup = (cancelled = false) => {
    window.removeEventListener('mousemove', onMouseMove, true);
    window.removeEventListener('click', onClick, true);
    window.removeEventListener('keydown', onKeyDown, true);
    highlight.remove();
    if (cancelled && options.onCancel) {
      options.onCancel();
    }
  };

  window.addEventListener('mousemove', onMouseMove, true);
  window.addEventListener('click', onClick, true);
  window.addEventListener('keydown', onKeyDown, true);

  return () => cleanup(false);
}
