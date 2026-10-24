import type { Field } from '../../shared/types.js';

export type ButtonTarget = 'all' | 'primary' | 'secondary' | 'tertiary';
export type ButtonHoverEffect = 'none' | 'lift' | 'scale' | 'glow' | 'shine';
export type ButtonShadow = 'none' | 'subtle' | 'medium' | 'dramatic' | 'colored';
export type ButtonBorderStyle = 'none' | 'solid' | 'dashed' | 'double';

export interface StyledButtonRule {
  id: string;
  selector: string;
  label: string;
  enabled: boolean;

  // Shape & Border
  radius: number;
  borderWidth: number;
  borderStyle: ButtonBorderStyle;
  borderColor: string;

  // Hover & Depth
  hoverEffect: ButtonHoverEffect;
  shadow: ButtonShadow;

  // Sizing & Typography
  paddingY: number;
  paddingX: number;
  fontWeight: string;
  letterSpacing: number;

  // Colors & Fills
  customColors: boolean;
  bg: string;
  useGradient: boolean;
  bgGradientEnd: string;
  gradientAngle: number;
  fg: string;
}

export function createDefaultButtonRule(id: string = `btn_${Date.now()}`): StyledButtonRule {
  return {
    id,
    selector: '',
    label: 'New button element',
    enabled: true,

    radius: 8,
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: '#0f766e',

    hoverEffect: 'lift',
    shadow: 'subtle',

    paddingY: 12,
    paddingX: 24,
    fontWeight: '600',
    letterSpacing: 1,

    customColors: true,
    bg: '#0f766e',
    useGradient: false,
    bgGradientEnd: '#0d9488',
    gradientAngle: 135,
    fg: '#ffffff',
  };
}

export interface ButtonStylesConfig extends Record<string, unknown> {
  enabled: boolean;
  rules?: StyledButtonRule[];
  target?: ButtonTarget;
  radius?: number;
  borderWidth?: number;
  borderStyle?: ButtonBorderStyle;
  borderColor?: string;
  hoverEffect?: ButtonHoverEffect;
  shadow?: ButtonShadow;
  paddingY?: number;
  paddingX?: number;
  fontWeight?: string;
  letterSpacing?: number;
  customColors?: boolean;
  bg?: string;
  useGradient?: boolean;
  bgGradientEnd?: string;
  gradientAngle?: number;
  fg?: string;
}

export const buttonStylesDefaults: ButtonStylesConfig = {
  enabled: false,
  rules: [],
  target: 'all',
  radius: 8,
  borderWidth: 0,
  borderStyle: 'none',
  borderColor: '#0f766e',
  hoverEffect: 'lift',
  shadow: 'subtle',
  paddingY: 12,
  paddingX: 24,
  fontWeight: '600',
  letterSpacing: 1,
  customColors: false,
  bg: '#0f766e',
  useGradient: false,
  bgGradientEnd: '#0d9488',
  gradientAngle: 135,
  fg: '#ffffff',
};

export const buttonStylesSchema: Field[] = [
  // Group: Activation
  { key: 'enabled', type: 'toggle', label: 'Enable custom button styles', group: 'Activation' },
  {
    key: 'target',
    type: 'select',
    label: 'Target buttons',
    options: ['all', 'primary', 'secondary', 'tertiary'],
    group: 'Activation',
  },

  // Group: Shape & Border
  { key: 'radius', type: 'range', label: 'Corner roundness', min: 0, max: 50, unit: 'px', group: 'Shape & Border' },
  { key: 'borderWidth', type: 'range', label: 'Border thickness', min: 0, max: 6, unit: 'px', group: 'Shape & Border' },
  {
    key: 'borderStyle',
    type: 'select',
    label: 'Border style',
    options: ['none', 'solid', 'dashed', 'double'],
    group: 'Shape & Border',
  },
  { key: 'borderColor', type: 'color', label: 'Border color', group: 'Shape & Border' },

  // Group: Hover & Depth
  {
    key: 'hoverEffect',
    type: 'select',
    label: 'Hover animation',
    options: ['none', 'lift', 'scale', 'glow', 'shine'],
    group: 'Hover & Depth',
  },
  {
    key: 'shadow',
    type: 'select',
    label: 'Drop shadow depth',
    options: ['none', 'subtle', 'medium', 'dramatic', 'colored'],
    group: 'Hover & Depth',
  },

  // Group: Typography & Sizing
  { key: 'paddingY', type: 'range', label: 'Vertical padding', min: 6, max: 24, unit: 'px', group: 'Typography & Sizing' },
  { key: 'paddingX', type: 'range', label: 'Horizontal padding', min: 14, max: 48, unit: 'px', group: 'Typography & Sizing' },
  {
    key: 'fontWeight',
    type: 'select',
    label: 'Font weight',
    options: ['normal', '500', '600', '700', '800'],
    group: 'Typography & Sizing',
  },
  { key: 'letterSpacing', type: 'range', label: 'Letter spacing', min: 0, max: 4, unit: 'px', group: 'Typography & Sizing' },

  // Group: Colors
  { key: 'customColors', type: 'toggle', label: 'Use custom button colors', group: 'Colors' },
  { key: 'bg', type: 'color', label: 'Button background color', group: 'Colors' },
  { key: 'useGradient', type: 'toggle', label: 'Use gradient background', group: 'Colors' },
  { key: 'bgGradientEnd', type: 'color', label: 'Gradient end color', group: 'Colors' },
  { key: 'gradientAngle', type: 'range', label: 'Gradient angle', min: 0, max: 360, unit: 'deg', group: 'Colors' },
  { key: 'fg', type: 'color', label: 'Button text color', group: 'Colors' },
];
