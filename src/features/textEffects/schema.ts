import type { Field } from '../../shared/types.js';

export type TextEffectType =
  | 'none'
  | 'gradient'
  | 'fill-on-scroll'
  | 'reveal-on-scroll'
  | 'underline'
  | 'stroke'
  | 'colorful'
  | 'fill'
  | 'strong-fill'
  | 'candy-cane';

export type TextEffectApplyTo = 'all' | 'first-word' | 'last-word';
export type TextEffectSpeed = 'slow' | 'medium' | 'fast';

export interface EffectDescriptor {
  id: TextEffectType;
  name: string;
  previewTitle: string;
  previewSubtitle: string;
}

export const TEXT_EFFECTS_CATALOG: EffectDescriptor[] = [
  { id: 'none', name: 'None', previewTitle: 'Standard Text', previewSubtitle: 'No extra effect applied' },
  { id: 'gradient', name: 'Gradient animated', previewTitle: 'Gradient Text', previewSubtitle: 'Animated Or Static' },
  { id: 'fill-on-scroll', name: 'Fill on scroll', previewTitle: 'Fill On Scroll', previewSubtitle: 'Fills as you scroll' },
  { id: 'reveal-on-scroll', name: 'Reveal on scroll', previewTitle: 'Reveal On Scroll', previewSubtitle: 'Sharpens into view' },
  { id: 'underline', name: 'Underline', previewTitle: 'Accent Underline', previewSubtitle: 'Expanding accent line' },
  { id: 'stroke', name: 'Stroke', previewTitle: 'Outlined Stroke', previewSubtitle: 'Hollow modern contour' },
  { id: 'colorful', name: 'Colorful', previewTitle: 'Colorful Palette', previewSubtitle: 'Multi-color vibrant tones' },
  { id: 'fill', name: 'Fill', previewTitle: 'Marker Fill', previewSubtitle: 'Subtle highlighter tape' },
  { id: 'strong-fill', name: 'Strong fill', previewTitle: 'Strong Fill', previewSubtitle: 'Bold solid badge' },
  { id: 'candy-cane', name: 'Candy cane', previewTitle: 'Candy Cane', previewSubtitle: 'Diagonal barber stripes' },
];

export interface StyledTextRule {
  id: string;
  selector: string;
  label: string;
  enabled: boolean;

  // Text options (FR-TE11)
  textOptionsEnabled: boolean;
  tag: string;
  textColor?: string;
  fontSize?: number;            // Desktop font size in px
  mobileFontSize?: number;      // Mobile font size in px
  format?: 'auto' | 'bold' | 'italic' | 'underline' | 'strike';
  align?: 'left' | 'center' | 'right' | 'justify';
  mobileAlign?: 'left' | 'center' | 'right';
  lineGap?: number;             // Line height (e.g. 1.2 or 1.5)

  // Visual Text Effects (FR-TE12)
  effectType?: TextEffectType;
  effectTextColor?: string;     // Text / primary effect color
  effectAccentColor?: string;   // Accent / secondary effect color
  effectApplyTo?: TextEffectApplyTo; // 'all' | 'first-word' | 'last-word'
  effectSpeed?: TextEffectSpeed;     // 'slow' | 'medium' | 'fast'
  effectAngle?: number;         // Angle in degrees for gradients / candy-cane
  effectThickness?: number;     // Pixel thickness for stroke / underline

  // Legacy/Individual effect fallbacks
  gradientEnabled?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  gradientAnimate?: boolean;

  highlightEnabled?: boolean;
  highlightColor?: string;
  highlightStyle?: 'underline' | 'thick' | 'full';

  underlineEnabled?: boolean;
  underlineColor?: string;
  underlineThickness?: number;
  underlineHover?: 'always' | 'hover';

  shadowEffect?: 'none' | 'subtle' | 'glow' | 'retro-3d' | 'soft-drop';
  shadowColor?: string;

  letterSpacing?: number;
}

export interface TextEffectsConfig extends Record<string, unknown> {
  enabled: boolean;
  rules: StyledTextRule[];
}

export function createDefaultTextRule(id: string = `rule_${Date.now()}`): StyledTextRule {
  return {
    id,
    selector: '',
    label: 'New text element',
    enabled: true,

    // Text options
    textOptionsEnabled: true,
    tag: 'h2',
    textColor: '#ffffff',
    fontSize: 48,
    mobileFontSize: 32,
    format: 'auto',
    align: 'left',
    mobileAlign: 'left',
    lineGap: 1.2,

    // Visual Text Effects
    effectType: 'none',
    effectApplyTo: 'all',
    effectSpeed: 'medium',

    // Legacy effect defaults
    highlightStyle: 'underline',
    underlineHover: 'hover',
    shadowEffect: 'none',
    letterSpacing: 0,
  };
}

export const textEffectsDefaults: TextEffectsConfig = {
  enabled: true,
  rules: [],
};

export const textEffectsSchema: Field[] = [
  { key: 'enabled', type: 'toggle', label: 'Enable text & heading effects', group: 'Activation' },
];
