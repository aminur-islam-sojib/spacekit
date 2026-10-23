import type { Field } from '../../shared/types.js';

export interface TextEffectsConfig extends Record<string, unknown> {
  enabled: boolean;
  target: 'h1' | 'h2' | 'h3' | 'headings' | 'all';

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
  highlightTarget: 'strong' | 'em' | 'all-target';

  // Creative underline
  underlineEnabled: boolean;
  underlineColor: string;
  underlineThickness: number;
  underlineHover: 'always' | 'hover';

  // Shadow & Glow
  shadowEffect: 'none' | 'subtle' | 'glow' | 'retro-3d' | 'soft-drop';
  shadowColor: string;

  // Letter spacing
  letterSpacing: number;
}

export const textEffectsDefaults: TextEffectsConfig = {
  enabled: false,
  target: 'h1',

  gradientEnabled: true,
  gradientStart: '#4f46e5',
  gradientEnd: '#06b6d4',
  gradientAngle: 135,
  gradientAnimate: false,

  highlightEnabled: false,
  highlightColor: '#fef08a',
  highlightStyle: 'underline',
  highlightTarget: 'strong',

  underlineEnabled: false,
  underlineColor: '#0f766e',
  underlineThickness: 3,
  underlineHover: 'hover',

  shadowEffect: 'none',
  shadowColor: '#0f766e',

  letterSpacing: 0,
};

export const textEffectsSchema: Field[] = [
  // Activation
  { key: 'enabled', type: 'toggle', label: 'Enable text & heading effects', group: 'Activation' },
  {
    key: 'target',
    type: 'select',
    label: 'Target elements',
    options: ['h1', 'h2', 'h3', 'headings', 'all'],
    group: 'Activation',
  },

  // Gradient Headline
  { key: 'gradientEnabled', type: 'toggle', label: 'Enable gradient text', group: 'Gradient Text' },
  { key: 'gradientStart', type: 'color', label: 'Gradient start', group: 'Gradient Text' },
  { key: 'gradientEnd', type: 'color', label: 'Gradient end', group: 'Gradient Text' },
  { key: 'gradientAngle', type: 'range', label: 'Gradient angle', min: 0, max: 360, step: 15, unit: 'deg', group: 'Gradient Text' },
  { key: 'gradientAnimate', type: 'toggle', label: 'Animate shifting gradient', group: 'Gradient Text' },

  // Highlighter / Marker
  { key: 'highlightEnabled', type: 'toggle', label: 'Enable marker highlighter', group: 'Highlighter' },
  { key: 'highlightColor', type: 'color', label: 'Highlighter color', group: 'Highlighter' },
  {
    key: 'highlightStyle',
    type: 'select',
    label: 'Highlight height',
    options: ['underline', 'thick', 'full'],
    group: 'Highlighter',
  },
  {
    key: 'highlightTarget',
    type: 'select',
    label: 'Words to highlight',
    options: ['strong', 'em', 'all-target'],
    group: 'Highlighter',
  },

  // Creative Underline
  { key: 'underlineEnabled', type: 'toggle', label: 'Enable accent underline', group: 'Accent Underline' },
  { key: 'underlineColor', type: 'color', label: 'Underline color', group: 'Accent Underline' },
  { key: 'underlineThickness', type: 'range', label: 'Thickness', min: 1, max: 8, step: 1, unit: 'px', group: 'Accent Underline' },
  {
    key: 'underlineHover',
    type: 'select',
    label: 'Underline trigger',
    options: ['hover', 'always'],
    group: 'Accent Underline',
  },

  // Shadow & Glow
  {
    key: 'shadowEffect',
    type: 'select',
    label: 'Shadow / Glow preset',
    options: ['none', 'subtle', 'soft-drop', 'glow', 'retro-3d'],
    group: 'Shadow & Glow',
  },
  { key: 'shadowColor', type: 'color', label: 'Shadow / Glow color', group: 'Shadow & Glow' },

  // Typography
  { key: 'letterSpacing', type: 'range', label: 'Letter spacing', min: -2, max: 10, step: 0.5, unit: 'px', group: 'Typography' },
];
