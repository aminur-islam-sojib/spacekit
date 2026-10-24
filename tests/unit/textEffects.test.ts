import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { textEffectsFeature } from '../../src/features/textEffects/index.js';
import {
  textEffectsDefaults,
  createDefaultTextRule,
  type TextEffectsConfig,
} from '../../src/features/textEffects/schema.js';
import type { SqspEnv } from '../../src/shared/types.js';

describe('Feature: Text & Heading Effects (TC-TE01..TC-TE10)', () => {
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

  it('TC-TE02: injects style tag into document head when enabled is true and rules exist', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_1'),
          selector: '#block-hero h1',
          label: 'Hero Title',
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const styleEl = document.querySelector('style[data-sk="textEffects"]');
    expect(styleEl).not.toBeNull();
    expect(document.head.contains(styleEl)).toBe(true);
  });

  it('TC-TE03: generates gradient text CSS for a picked element selector', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_1'),
          selector: '#block-hero h1',
          label: 'Hero Title',
          gradientEnabled: true,
          gradientStart: '#ff007f',
          gradientEnd: '#7928ca',
          gradientAngle: 90,
          gradientAnimate: false,
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('#block-hero h1');
    expect(css).toContain('linear-gradient(90deg, #ff007f, #7928ca)');
    expect(css).toContain('background-clip: text');
    expect(css).toContain('-webkit-text-fill-color: transparent');
  });

  it('TC-TE04: generates animated gradient and respects prefers-reduced-motion', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_1'),
          selector: '#block-hero h1',
          gradientEnabled: true,
          gradientAnimate: true,
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('animation: sitekit-text-gradient-pan');
    expect(css).toContain('@keyframes sitekit-text-gradient-pan');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('animation: none !important');
  });

  it('TC-TE05: generates highlighter pen effect with customizable coverage', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_1'),
          selector: '#block-yui_123 h2',
          gradientEnabled: false,
          highlightEnabled: true,
          highlightColor: '#fef08a',
          highlightStyle: 'underline',
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('#block-yui_123 h2');
    expect(css).toContain('background-image: linear-gradient(to top, #fef08a 35%, transparent 35%)');
  });

  it('TC-TE06: generates creative underline with animated hover effect', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_1'),
          selector: '#about-section p',
          underlineEnabled: true,
          underlineColor: '#0f766e',
          underlineThickness: 4,
          underlineHover: 'hover',
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('#about-section p::after');
    expect(css).toContain('height: 4px');
    expect(css).toContain('background-color: #0f766e');
    expect(css).toContain('#about-section p:hover::after');
    expect(css).toContain('width: 100%');
  });

  it('TC-TE07: generates text shadow or glow presets', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_1'),
          selector: '#banner h3',
          shadowEffect: 'glow',
          shadowColor: '#38bdf8',
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('#banner h3');
    expect(css).toContain('filter: drop-shadow(0 0 12px #38bdf8)');
  });

  it('TC-TE08: update() updates stylesheet live and destroy() cleans up completely', () => {
    textEffectsFeature.init(
      {
        enabled: true,
        rules: [
          {
            ...createDefaultTextRule('rule_1'),
            selector: '#block-1 h1',
            letterSpacing: 2,
          },
        ],
      },
      mockEnv
    );

    expect(document.querySelector('style[data-sk="textEffects"]')?.textContent).toContain(
      'letter-spacing: 2px'
    );

    textEffectsFeature.update(
      {
        enabled: true,
        rules: [
          {
            ...createDefaultTextRule('rule_1'),
            selector: '#block-1 h1',
            letterSpacing: 5,
          },
        ],
      },
      mockEnv
    );

    const styles = document.querySelectorAll('style[data-sk="textEffects"]');
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).toContain('letter-spacing: 5px');

    textEffectsFeature.destroy();
    expect(document.querySelectorAll('style[data-sk="textEffects"]').length).toBe(0);
  });

  it('TC-TE09: generates independent, non-conflicting CSS for multiple distinct picked text elements', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_hero'),
          selector: '#block-hero h1',
          label: 'Hero Title',
          gradientEnabled: true,
          gradientStart: '#ec4899',
          gradientEnd: '#8b5cf6',
          gradientAngle: 45,
        },
        {
          ...createDefaultTextRule('rule_intro'),
          selector: '#block-intro p',
          label: 'Intro Paragraph',
          gradientEnabled: false,
          highlightEnabled: true,
          highlightColor: '#bbf7d0',
          highlightStyle: 'thick',
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    // Hero gets gradient
    expect(css).toContain('#block-hero h1');
    expect(css).toContain('linear-gradient(45deg, #ec4899, #8b5cf6)');

    // Intro paragraph gets highlighter
    expect(css).toContain('#block-intro p');
    expect(css).toContain('linear-gradient(to top, #bbf7d0 65%, transparent 65%)');

    // Confirm hero does not have intro's highlighter and vice versa
    expect(css).not.toContain('#block-hero h1 { background-image: linear-gradient(to top, #bbf7d0');
  });

  it('TC-TE10: safely skips disabled or empty-selector rules', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_disabled'),
          selector: '#ignored h1',
          enabled: false,
          letterSpacing: 10,
        },
        {
          ...createDefaultTextRule('rule_empty'),
          selector: '',
          enabled: true,
          letterSpacing: 8,
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).not.toContain('#ignored h1');
    expect(css).not.toContain('letter-spacing: 10px');
    expect(css).not.toContain('letter-spacing: 8px');
  });

  it('TC-TE11: generates desktop typography CSS overrides when textOptionsEnabled is true', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_typo'),
          selector: '#block-heading h2',
          textOptionsEnabled: true,
          textColor: '#2563eb',
          fontSize: 54,
          format: 'bold',
          align: 'center',
          lineGap: 1.35,
          gradientEnabled: false,
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('#block-heading h2');
    expect(css).toContain('#block-heading h2 span');
    expect(css).toContain('color: #2563eb !important;');
    expect(css).toContain('font-size: 54px !important;');
    expect(css).toContain('font-weight: 700 !important;');
    expect(css).toContain('text-align: center !important;');
    expect(css).toContain('line-height: 1.35 !important;');
  });

  it('TC-TE12: generates responsive mobile typography rules inside @media (max-width: 767px)', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_mobile'),
          selector: '#block-heading h2',
          textOptionsEnabled: true,
          fontSize: 54,
          mobileFontSize: 30,
          align: 'left',
          mobileAlign: 'center',
          gradientEnabled: false,
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).toContain('@media (max-width: 767px)');
    expect(css).toContain('font-size: 30px !important;');
    expect(css).toContain('text-align: center !important;');
    expect(css).toContain('body.sqs-mobile-view #block-heading h2');
  });

  it('TC-TE13: omits typography overrides when textOptionsEnabled is false', () => {
    const config: TextEffectsConfig = {
      enabled: true,
      rules: [
        {
          ...createDefaultTextRule('rule_disabled_opt'),
          selector: '#block-heading h2',
          textOptionsEnabled: false,
          textColor: '#dc2626',
          fontSize: 60,
          mobileFontSize: 34,
          format: 'italic',
          align: 'right',
          lineGap: 1.5,
          gradientEnabled: false,
        },
      ],
    };

    textEffectsFeature.init(config, mockEnv);
    const css = document.querySelector('style[data-sk="textEffects"]')?.textContent || '';

    expect(css).not.toContain('color: #dc2626 !important;');
    expect(css).not.toContain('font-size: 60px !important;');
    expect(css).not.toContain('font-style: italic !important;');
    expect(css).not.toContain('text-align: right !important;');
    expect(css).not.toContain('line-height: 1.5 !important;');
    expect(css).not.toContain('@media (max-width: 767px)');
  });
});
