import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { textEffectsFeature } from '../../src/features/textEffects/index.js';
import {
  textEffectsDefaults,
  type TextEffectsConfig,
} from '../../src/features/textEffects/schema.js';
import type { SqspEnv } from '../../src/shared/types.js';

describe('Feature: Text & Heading Effects (TC-TE01..TC-TE08)', () => {
  const mockEnv: SqspEnv = {
    isEditor: false,
    isEditorActive: false,
  };

  beforeEach(() => {
    document.head.replaceChildren();
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    textEffectsFeature.destroy();
  });

  it('TC-TE01: does not inject style tag when enabled is false', () => {
    textEffectsFeature.init({ ...textEffectsDefaults, enabled: false }, mockEnv);
    const styleEl = document.querySelector('style[data-sk="textEffects"]');
    expect(styleEl).toBeNull();
  });

  it('TC-TE02: injects style tag into document head when enabled is true', () => {
    textEffectsFeature.init({ ...textEffectsDefaults, enabled: true }, mockEnv);
    const styleEl = document.querySelector('style[data-sk="textEffects"]');
    expect(styleEl).not.toBeNull();
    expect(document.head.contains(styleEl)).toBe(true);
  });

  it('TC-TE03: generates gradient text CSS with linear-gradient and background-clip text', () => {
    const config: TextEffectsConfig = {
      ...textEffectsDefaults,
      enabled: true,
      target: 'h1',
      gradientEnabled: true,
      gradientStart: '#ff007f',
      gradientEnd: '#7928ca',
      gradientAngle: 90,
      gradientAnimate: false,
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('linear-gradient(90deg, #ff007f, #7928ca)');
    expect(css).toContain('background-clip: text');
    expect(css).toContain('-webkit-text-fill-color: transparent');
  });

  it('TC-TE04: generates animated gradient and respects prefers-reduced-motion', () => {
    const config: TextEffectsConfig = {
      ...textEffectsDefaults,
      enabled: true,
      gradientEnabled: true,
      gradientAnimate: true,
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('animation: sitekit-text-gradient-pan');
    expect(css).toContain('@keyframes sitekit-text-gradient-pan');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('animation: none !important');
  });

  it('TC-TE05: generates highlighter pen effect with customizable coverage and target', () => {
    const config: TextEffectsConfig = {
      ...textEffectsDefaults,
      enabled: true,
      target: 'headings',
      gradientEnabled: false,
      highlightEnabled: true,
      highlightColor: '#fef08a',
      highlightStyle: 'underline',
      highlightTarget: 'strong',
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('background-image: linear-gradient(to top, #fef08a 35%, transparent 35%)');
    expect(css).toContain('strong');
  });

  it('TC-TE06: generates creative underline with animated hover effect', () => {
    const config: TextEffectsConfig = {
      ...textEffectsDefaults,
      enabled: true,
      underlineEnabled: true,
      underlineColor: '#0f766e',
      underlineThickness: 4,
      underlineHover: 'hover',
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('::after');
    expect(css).toContain('height: 4px');
    expect(css).toContain('background-color: #0f766e');
    expect(css).toContain('width: 100%');
  });

  it('TC-TE07: generates text shadow or glow presets', () => {
    textEffectsFeature.init(
      {
        ...textEffectsDefaults,
        enabled: true,
        shadowEffect: 'glow',
        shadowColor: '#38bdf8',
      },
      mockEnv
    );

    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';
    expect(css).toContain('filter: drop-shadow(0 0 12px #38bdf8)');
  });

  it('TC-TE08: update() updates stylesheet live and destroy() cleans up completely', () => {
    textEffectsFeature.init(
      { ...textEffectsDefaults, enabled: true, letterSpacing: 2 },
      mockEnv
    );

    expect(document.querySelector('style[data-sk="textEffects"]')?.textContent).toContain(
      'letter-spacing: 2px'
    );

    textEffectsFeature.update(
      { ...textEffectsDefaults, enabled: true, letterSpacing: 5 },
      mockEnv
    );

    const styles = document.querySelectorAll('style[data-sk="textEffects"]');
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).toContain('letter-spacing: 5px');

    textEffectsFeature.destroy();
    expect(document.querySelectorAll('style[data-sk="textEffects"]').length).toBe(0);
  });

  it('TC-TE09: scopes text effects selector to specific Block ID or Section ID when targetId is provided', () => {
    // 1. Scopes by single ID without leading #
    textEffectsFeature.init(
      {
        ...textEffectsDefaults,
        enabled: true,
        target: 'h1',
        targetId: 'block-yui_12345',
      },
      mockEnv
    );

    let css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';
    expect(css).toContain('#block-yui_12345 [data-sqsp-text-block-content] h1');
    expect(css.startsWith('/* SiteKit Text & Heading Effects */\n[data-sqsp-text-block-content] h1')).toBe(false);

    // 2. Scopes by ID with leading # and multiple comma-separated IDs
    textEffectsFeature.update(
      {
        ...textEffectsDefaults,
        enabled: true,
        target: 'h2',
        targetId: '#hero, block-promo_99',
      },
      mockEnv
    );

    css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';
    expect(css).toContain('#hero [data-sqsp-text-block-content] h2');
    expect(css).toContain('#block-promo_99 [data-sqsp-text-block-content] h2');

    // 3. Reverts to global selector when targetId is cleared
    textEffectsFeature.update(
      {
        ...textEffectsDefaults,
        enabled: true,
        target: 'h1',
        targetId: '',
      },
      mockEnv
    );

    css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';
    expect(css).toContain('[data-sqsp-text-block-content] h1');
    expect(css).not.toContain('#block-yui_12345');
    expect(css).not.toContain('#hero');
  });
});


