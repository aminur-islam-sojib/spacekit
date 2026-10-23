import type { Feature, SqspEnv, ProbeResult } from '../../shared/types.js';
import {
  type TextEffectsConfig,
  textEffectsSchema,
  textEffectsDefaults,
} from './schema.js';
import { generateTextEffectsCss } from './styles.js';
import { SELECTORS } from '../../adapters/squarespace.js';

let styleEl: HTMLStyleElement | null = null;

export const textEffectsFeature: Feature<TextEffectsConfig> = {
  id: 'textEffects',
  label: 'Text & heading effects',
  version: 1,
  schema: textEffectsSchema,
  defaults: textEffectsDefaults,

  probe(_env: SqspEnv): ProbeResult {
    if (typeof document === 'undefined') return { ok: true };
    const hasHeadings = Boolean(document.querySelector(SELECTORS.headingsAll));
    return { ok: true, reason: hasHeadings ? undefined : 'No headings detected on current page' };
  },

  init(cfg: TextEffectsConfig, _env: SqspEnv): void {
    this.destroy();

    if (!cfg.enabled) {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    const style = document.createElement('style');
    style.setAttribute('data-sk', 'textEffects');
    style.textContent = generateTextEffectsCss(cfg);
    document.head.appendChild(style);
    styleEl = style;
  },

  update(cfg: TextEffectsConfig, env: SqspEnv): void {
    if (!cfg.enabled) {
      this.destroy();
      return;
    }

    if (styleEl && document.head.contains(styleEl)) {
      styleEl.textContent = generateTextEffectsCss(cfg);
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
      const remaining = document.querySelectorAll('style[data-sk="textEffects"]');
      remaining.forEach((el) => el.remove());
    }
  },
};

// Auto-register if core runtime is already present
if (typeof window !== 'undefined' && window.__SITEKIT__) {
  window.__SITEKIT__.register(textEffectsFeature);
}
