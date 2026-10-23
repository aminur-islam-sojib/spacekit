import type { Feature, SqspEnv } from '../../shared/types.js';
import {
  type BackToTopConfig,
  backToTopSchema,
  backToTopDefaults,
} from './schema.js';
import { applyBackToTopStyles } from './styles.js';

let buttonEl: HTMLButtonElement | null = null;
let scrollListener: (() => void) | null = null;
let clickListener: (() => void) | null = null;

function createSvgArrow(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '50%');
  svg.setAttribute('height', '50%');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 19V5M5 12l7-7 7 7');
  svg.appendChild(path);

  return svg;
}

function updateVisibility(button: HTMLButtonElement, cfg: BackToTopConfig): void {
  const currentScroll = typeof window !== 'undefined' ? window.scrollY || 0 : 0;
  const isVisible = currentScroll > cfg.showAfter;

  if (isVisible) {
    button.style.opacity = '1';
    button.style.transform = 'none';
    button.style.pointerEvents = 'auto';
    button.setAttribute('aria-hidden', 'false');
    button.tabIndex = 0;
  } else {
    button.style.opacity = '0';
    button.style.transform = 'translateY(8px)';
    button.style.pointerEvents = 'none';
    button.setAttribute('aria-hidden', 'true');
    button.tabIndex = -1;
  }
}

export const backToTopFeature: Feature<BackToTopConfig> = {
  id: 'backToTop',
  label: 'Back to top button',
  version: 1,
  schema: backToTopSchema,
  defaults: backToTopDefaults,

  init(cfg: BackToTopConfig, _env: SqspEnv): void {
    this.destroy();

    if (!cfg.enabled) {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Back to top');
    button.setAttribute('data-sk', 'backToTop');

    applyBackToTopStyles(button, cfg);
    button.appendChild(createSvgArrow());

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    clickListener = () => {
      window.scrollTo({
        top: 0,
        behavior: cfg.smooth && !prefersReducedMotion ? 'smooth' : 'auto',
      });
    };
    button.addEventListener('click', clickListener);

    scrollListener = () => {
      updateVisibility(button, cfg);
    };
    window.addEventListener('scroll', scrollListener, { passive: true });

    document.body.appendChild(button);
    updateVisibility(button, cfg);

    buttonEl = button;
  },

  update(cfg: BackToTopConfig, env: SqspEnv): void {
    if (!buttonEl) {
      this.init(cfg, env);
      return;
    }

    if (!cfg.enabled) {
      this.destroy();
      return;
    }

    applyBackToTopStyles(buttonEl, cfg);
    updateVisibility(buttonEl, cfg);
  },

  destroy(): void {
    if (scrollListener && typeof window !== 'undefined') {
      window.removeEventListener('scroll', scrollListener);
      scrollListener = null;
    }

    if (clickListener && buttonEl) {
      buttonEl.removeEventListener('click', clickListener);
      clickListener = null;
    }

    if (buttonEl) {
      buttonEl.remove();
      buttonEl = null;
    }

    if (typeof document !== 'undefined') {
      const remaining = document.querySelectorAll('[data-sk="backToTop"]');
      remaining.forEach((el) => el.remove());
    }
  },
};

// Auto-register if core runtime is already present
if (typeof window !== 'undefined' && window.__SITEKIT__) {
  window.__SITEKIT__.register(backToTopFeature);
}

