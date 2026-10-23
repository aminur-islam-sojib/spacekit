import type { Feature, SqspEnv, ProbeResult } from '../../shared/types.js';
import {
  type ButtonStylesConfig,
  buttonStylesSchema,
  buttonStylesDefaults,
} from './schema.js';
import { generateButtonCss } from './styles.js';
import { SELECTORS } from '../../adapters/squarespace.js';

let styleEl: HTMLStyleElement | null = null;

export const buttonStylesFeature: Feature<ButtonStylesConfig> = {
  id: 'buttonStyles',
  label: 'Button styling pack',
  version: 1,
  schema: buttonStylesSchema,
  defaults: buttonStylesDefaults,

  probe(_env: SqspEnv): ProbeResult {
    if (typeof document === 'undefined') return { ok: true };
    const hasButtons = Boolean(document.querySelector(SELECTORS.button));
    return { ok: true, reason: hasButtons ? undefined : 'No buttons detected on current page' };
  },

  init(cfg: ButtonStylesConfig, _env: SqspEnv): void {
    this.destroy();

    if (!cfg.enabled) {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    const style = document.createElement('style');
    style.setAttribute('data-sk', 'buttonStyles');
    style.textContent = generateButtonCss(cfg);
    document.head.appendChild(style);
    styleEl = style;
  },

  update(cfg: ButtonStylesConfig, env: SqspEnv): void {
    if (!cfg.enabled) {
      this.destroy();
      return;
    }

    if (styleEl && document.head.contains(styleEl)) {
      styleEl.textContent = generateButtonCss(cfg);
    } else {
      this.init(cfg, env);
    }
  },

  destroy(): void {
    if (styleEl) {
      styleEl.remove();
      styleEl = null;
    }

    if (typeof document !== 'undefined') {
      const remaining = document.querySelectorAll('style[data-sk="buttonStyles"]');
      remaining.forEach((el) => el.remove());
    }
  },
};

// Auto-register if core runtime is already present
if (typeof window !== 'undefined' && window.__SITEKIT__) {
  window.__SITEKIT__.register(buttonStylesFeature);
}

