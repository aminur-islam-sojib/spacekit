import type { BackToTopConfig } from './schema.js';

/**
 * Applies CSS properties directly to the Back to top button element.
 * Enforces TC-B05 (offsets & colors) and TC-B06 (minimum 44x44 px touch target).
 */
export function applyBackToTopStyles(button: HTMLButtonElement, cfg: BackToTopConfig): void {
  button.style.position = 'fixed';
  button.style.bottom = `${cfg.offsetY}px`;

  if (cfg.side === 'left') {
    button.style.left = `${cfg.offsetX}px`;
    button.style.right = 'auto';
  } else {
    button.style.right = `${cfg.offsetX}px`;
    button.style.left = 'auto';
  }

  button.style.width = `${cfg.size}px`;
  button.style.height = `${cfg.size}px`;
  // TC-B06: Minimum 44x44 px touch hit target for accessibility
  button.style.minWidth = '44px';
  button.style.minHeight = '44px';

  button.style.borderRadius = `${cfg.radius}%`;
  button.style.background = cfg.bg;
  button.style.color = cfg.fg;
  button.style.border = '0';
  button.style.padding = '0';
  button.style.cursor = 'pointer';
  button.style.display = 'grid';
  button.style.placeItems = 'center';
  button.style.zIndex = '2147483000';
  button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
  button.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
}
