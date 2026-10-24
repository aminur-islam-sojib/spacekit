import type { Feature, SqspEnv, ProbeResult } from '../../shared/types.js';
import {
  type TextEffectsConfig,
  type StyledTextRule,
  textEffectsSchema,
  textEffectsDefaults,
} from './schema.js';
import { generateTextEffectsCss } from './styles.js';
import { SELECTORS } from '../../adapters/squarespace.js';

let styleEl: HTMLStyleElement | null = null;
let scrollObserver: IntersectionObserver | null = null;
let scrollListener: (() => void) | null = null;

function unwrapEffectSpans(): void {
  if (typeof document === 'undefined') return;
  const spans = document.querySelectorAll('[data-sk-word]');
  spans.forEach((span) => {
    const parent = span.parentNode;
    if (parent) {
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      span.remove();
    }
  });
}

function applyWordTargeting(rules: StyledTextRule[]): void {
  if (typeof document === 'undefined') return;
  unwrapEffectSpans();

  for (const rule of rules) {
    if (!rule || !rule.enabled || !rule.selector) continue;
    if (rule.effectApplyTo !== 'first-word' && rule.effectApplyTo !== 'last-word') continue;

    const el = document.querySelector(rule.selector);
    if (!el) continue;

    // Helper to find text nodes
    const textNodes: Text[] = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node: Text | null = walk.nextNode() as Text | null;
    while (node) {
      if (node.textContent && node.textContent.trim().length > 0) {
        textNodes.push(node);
      }
      node = walk.nextNode() as Text | null;
    }

    if (textNodes.length === 0) continue;

    if (rule.effectApplyTo === 'first-word') {
      const firstNode = textNodes[0];
      const text = firstNode.textContent || '';
      const match = text.match(/^(\s*)(\S+)(.*)$/s);
      if (match) {
        const [, leading, word, rest] = match;
        const span = document.createElement('span');
        span.setAttribute('data-sk-word', 'first');
        span.className = 'sk-word-first';
        span.textContent = word;

        const frag = document.createDocumentFragment();
        if (leading) frag.appendChild(document.createTextNode(leading));
        frag.appendChild(span);
        if (rest) frag.appendChild(document.createTextNode(rest));

        firstNode.parentNode?.replaceChild(frag, firstNode);
      }
    } else if (rule.effectApplyTo === 'last-word') {
      const lastNode = textNodes[textNodes.length - 1];
      const text = lastNode.textContent || '';
      const match = text.match(/^(.*?)(\S+)(\s*)$/s);
      if (match) {
        const [, start, word, trailing] = match;
        const span = document.createElement('span');
        span.setAttribute('data-sk-word', 'last');
        span.className = 'sk-word-last';
        span.textContent = word;

        const frag = document.createDocumentFragment();
        if (start) frag.appendChild(document.createTextNode(start));
        frag.appendChild(span);
        if (trailing) frag.appendChild(document.createTextNode(trailing));

        lastNode.parentNode?.replaceChild(frag, lastNode);
      }
    }
  }
}

function setupScrollRoutines(rules: StyledTextRule[]): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  cleanupScrollRoutines();

  const revealRules = rules.filter((r) => r && r.enabled && r.effectType === 'reveal-on-scroll');
  const fillRules = rules.filter((r) => r && r.enabled && r.effectType === 'fill-on-scroll');

  if (revealRules.length > 0 && typeof IntersectionObserver !== 'undefined') {
    scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sk-revealed');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealRules.forEach((r) => {
      const el = document.querySelector(r.selector);
      if (el) scrollObserver?.observe(el);
    });
  }

  if (fillRules.length > 0) {
    const onScroll = () => {
      fillRules.forEach((r) => {
        const el = document.querySelector(r.selector) as HTMLElement | null;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const winHeight = window.innerHeight || 800;
        const progress = Math.min(100, Math.max(0, Math.round(((winHeight - rect.top) / (winHeight + rect.height)) * 100)));
        el.style.setProperty('--sk-scroll-fill', `${progress}%`);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    scrollListener = onScroll;
  }
}

function cleanupScrollRoutines(): void {
  if (scrollObserver) {
    scrollObserver.disconnect();
    scrollObserver = null;
  }
  if (scrollListener && typeof window !== 'undefined') {
    window.removeEventListener('scroll', scrollListener);
    scrollListener = null;
  }
  if (typeof document !== 'undefined') {
    document.querySelectorAll('.sk-revealed').forEach((el) => el.classList.remove('sk-revealed'));
  }
}

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

    const hasActiveRules = Array.isArray(cfg.rules) && cfg.rules.some((r) => r && r.enabled);
    if (cfg.enabled === false && !hasActiveRules) {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    const css = generateTextEffectsCss(cfg);
    if (css) {
      const style = document.createElement('style');
      style.setAttribute('data-sk', 'textEffects');
      style.textContent = css;
      document.head.appendChild(style);
      styleEl = style;
    }

    if (Array.isArray(cfg.rules)) {
      applyWordTargeting(cfg.rules);
      setupScrollRoutines(cfg.rules);
    }
  },

  update(cfg: TextEffectsConfig, env: SqspEnv): void {
    const hasActiveRules = Array.isArray(cfg.rules) && cfg.rules.some((r) => r && r.enabled);
    if (cfg.enabled === false && !hasActiveRules) {
      this.destroy();
      return;
    }

    const css = generateTextEffectsCss(cfg);
    if (!css) {
      this.destroy();
      return;
    }

    if (styleEl && document.head.contains(styleEl)) {
      styleEl.textContent = css;
    } else {
      const existing = document.querySelector('style[data-sk="textEffects"]') as HTMLStyleElement | null;
      if (existing) {
        existing.textContent = css;
        styleEl = existing;
      } else {
        this.init(cfg, env);
        return;
      }
    }

    if (Array.isArray(cfg.rules)) {
      applyWordTargeting(cfg.rules);
      setupScrollRoutines(cfg.rules);
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
      unwrapEffectSpans();
    }

    cleanupScrollRoutines();
  },
};

// Auto-register if core runtime is already present
if (typeof window !== 'undefined' && window.__SITEKIT__) {
  window.__SITEKIT__.register(textEffectsFeature);
}
