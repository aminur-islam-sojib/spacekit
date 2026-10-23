import type { Field } from '../../shared/types.js';

export interface StyledTextRule {
  id: string;
  selector: string;
  label: string;
  enabled: boolean;

  // Gradient text
  gradientEnabled: boolean;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  gradientAnimate: boolean;

  // Highlighter effect
  highlightEnabled: boolean;
  highlightColor: string;
  highlightStyle: 'underline' | 'thick' | 'full';

  // Creative underline
  underlineEnabled: boolean;
  underlineColor: string;
  underlineThickness: number;
  underlineHover: 'always' | 'hover';

  // Shadow & Glow
  shadowEffect: 'none' | 'subtle' | 'glow' | 'retro-3d' | 'soft-drop';
  shadowColor: string;

  // Typography
  letterSpacing: number;
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

    gradientEnabled: true,
    gradientStart: '#4f46e5',
    gradientEnd: '#06b6d4',
    gradientAngle: 135,
    gradientAnimate: false,

    highlightEnabled: false,
    highlightColor: '#fef08a',
    highlightStyle: 'underline',

    underlineEnabled: false,
    underlineColor: '#0f766e',
    underlineThickness: 3,
    underlineHover: 'hover',

    shadowEffect: 'none',
    shadowColor: '#0f766e',

    letterSpacing: 0,
  };
}

export const textEffectsDefaults: TextEffectsConfig = {
  enabled: false,
  rules: [],
};

export const textEffectsSchema: Field[] = [
  { key: 'enabled', type: 'toggle', label: 'Enable text & heading effects', group: 'Activation' },
];
