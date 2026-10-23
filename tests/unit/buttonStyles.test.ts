import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buttonStylesFeature } from '../../src/features/buttonStyles/index.js';
import {
  buttonStylesDefaults,
  type ButtonStylesConfig,
} from '../../src/features/buttonStyles/schema.js';
import type { SqspEnv } from '../../src/shared/types.js';

describe('Feature: Button Styling Pack (TC-BS01..TC-BS08)', () => {
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
    buttonStylesFeature.destroy();
  });

  it('TC-BS01: does not inject style tag when enabled is false', () => {
    buttonStylesFeature.init({ ...buttonStylesDefaults, enabled: false }, mockEnv);
    const styleEl = document.querySelector('style[data-sk="buttonStyles"]');
    expect(styleEl).toBeNull();
  });

  it('TC-BS02: injects style tag into document head when enabled is true', () => {
    buttonStylesFeature.init({ ...buttonStylesDefaults, enabled: true }, mockEnv);
    const styleEl = document.querySelector('style[data-sk="buttonStyles"]');
    expect(styleEl).not.toBeNull();
    expect(document.head.contains(styleEl)).toBe(true);
  });

  it('TC-BS03: applies custom border radius, border width, and padding', () => {
    const config: ButtonStylesConfig = {
      ...buttonStylesDefaults,
      enabled: true,
      radius: 24,
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: '#0f766e',
      paddingY: 16,
      paddingX: 32,
    };

    buttonStylesFeature.init(config, mockEnv);
    const styleEl = document.querySelector('style[data-sk="buttonStyles"]');
    const css = styleEl?.textContent || '';

    expect(css).toContain('border-radius: 24px');
    expect(css).toContain('2px solid #0f766e');
    expect(css).toContain('padding: 16px 32px');
  });

  it('TC-BS04: generates hover effects (lift, scale, glow) in CSS', () => {
    buttonStylesFeature.init(
      {
        ...buttonStylesDefaults,
        enabled: true,
        hoverEffect: 'lift',
        shadow: 'medium',
      },
      mockEnv
    );

    let css = document.querySelector('style[data-sk="buttonStyles"]')?.textContent || '';
    expect(css).toContain('translateY(-3px)');

    buttonStylesFeature.update(
      {
        ...buttonStylesDefaults,
        enabled: true,
        hoverEffect: 'scale',
      },
      mockEnv
    );

    css = document.querySelector('style[data-sk="buttonStyles"]')?.textContent || '';
    expect(css).toContain('scale(1.04)');
  });

  it('TC-BS05: generates custom solid and gradient colors when customColors is true', () => {
    buttonStylesFeature.init(
      {
        ...buttonStylesDefaults,
        enabled: true,
        customColors: true,
        bg: '#4f46e5',
        fg: '#ffffff',
        useGradient: true,
        bgGradientEnd: '#06b6d4',
        gradientAngle: 135,
      },
      mockEnv
    );

    const css = document.querySelector('style[data-sk="buttonStyles"]')?.textContent || '';
    expect(css).toContain('linear-gradient(135deg, #4f46e5, #06b6d4)');
    expect(css).toContain('color: #ffffff');
  });

  it('TC-BS06: respects prefers-reduced-motion in generated CSS', () => {
    buttonStylesFeature.init({ ...buttonStylesDefaults, enabled: true }, mockEnv);
    const css = document.querySelector('style[data-sk="buttonStyles"]')?.textContent || '';

    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('transition: none !important');
    expect(css).toContain('transform: none !important');
  });

  it('TC-BS07: update() updates the stylesheet live in place', () => {
    buttonStylesFeature.init(
      { ...buttonStylesDefaults, enabled: true, radius: 10 },
      mockEnv
    );
    expect(document.querySelector('style[data-sk="buttonStyles"]')?.textContent).toContain(
      'border-radius: 10px'
    );

    buttonStylesFeature.update(
      { ...buttonStylesDefaults, enabled: true, radius: 30 },
      mockEnv
    );

    const styles = document.querySelectorAll('style[data-sk="buttonStyles"]');
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).toContain('border-radius: 30px');
  });

  it('TC-BS08: destroy() completely removes stylesheet from DOM', () => {
    buttonStylesFeature.init({ ...buttonStylesDefaults, enabled: true }, mockEnv);
    expect(document.querySelectorAll('style[data-sk="buttonStyles"]').length).toBe(1);

    buttonStylesFeature.destroy();
    expect(document.querySelectorAll('style[data-sk="buttonStyles"]').length).toBe(0);
  });
});
