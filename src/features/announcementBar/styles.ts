import type { AnnouncementBarConfig } from './schema.js';

/**
 * Applies styles directly to the announcement bar container.
 * Enforces accessibility: 44px touch targets and visible focus.
 */
export function applyAnnouncementBarStyles(bar: HTMLElement, cfg: AnnouncementBarConfig): void {
  bar.style.position = cfg.sticky ? 'sticky' : 'relative';
  bar.style.top = '0';
  bar.style.left = '0';
  bar.style.right = '0';
  bar.style.width = '100%';
  bar.style.boxSizing = 'border-box';
  bar.style.background = cfg.bg;
  bar.style.color = cfg.fg;
  bar.style.padding = '10px 48px';
  bar.style.minHeight = '44px';
  bar.style.display = 'flex';
  bar.style.alignItems = 'center';
  bar.style.justifyContent = 'center';
  bar.style.fontSize = '14px';
  bar.style.lineHeight = '1.4';
  bar.style.textAlign = 'center';
  bar.style.zIndex = '2147482000';
  bar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
  bar.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
}

/**
 * Applies styles to the dismiss button.
 * Enforces TC-AB04 and 44x44px touch hit target.
 */
export function applyDismissButtonStyles(btn: HTMLButtonElement): void {
  btn.style.position = 'absolute';
  btn.style.right = '8px';
  btn.style.top = '50%';
  btn.style.transform = 'translateY(-50%)';
  btn.style.minWidth = '44px';
  btn.style.minHeight = '44px';
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.background = 'transparent';
  btn.style.border = '0';
  btn.style.color = 'inherit';
  btn.style.cursor = 'pointer';
  btn.style.padding = '0';
  btn.style.borderRadius = '4px';
}
