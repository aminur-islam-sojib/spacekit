import type { Field } from '../../shared/types.js';

export interface BackToTopConfig extends Record<string, unknown> {
  enabled: boolean;
  side: 'left' | 'right';
  offsetX: number;
  offsetY: number;
  size: number;
  radius: number;
  bg: string;
  fg: string;
  showAfter: number;
  smooth: boolean;
}

export const backToTopDefaults: BackToTopConfig = {
  enabled: false,
  side: 'right',
  offsetX: 24,
  offsetY: 24,
  size: 48,
  radius: 50,
  bg: '#0f766e',
  fg: '#ffffff',
  showAfter: 400,
  smooth: true,
};

export const backToTopSchema: Field[] = [
  { key: 'enabled', type: 'toggle', label: 'Show button', group: 'Visibility' },
  { key: 'showAfter', type: 'range', label: 'Appear after scrolling', min: 0, max: 1500, unit: 'px', group: 'Visibility' },
  { key: 'smooth', type: 'toggle', label: 'Smooth scroll', group: 'Visibility' },

  { key: 'side', type: 'select', label: 'Side', options: ['left', 'right'], group: 'Positioning' },
  { key: 'offsetX', type: 'range', label: 'Distance from side', min: 0, max: 120, unit: 'px', group: 'Positioning' },
  { key: 'offsetY', type: 'range', label: 'Distance from bottom', min: 0, max: 120, unit: 'px', group: 'Positioning' },

  { key: 'size', type: 'range', label: 'Size', min: 32, max: 80, unit: 'px', group: 'Appearance' },
  { key: 'radius', type: 'range', label: 'Roundness', min: 0, max: 50, unit: '%', group: 'Appearance' },
  { key: 'bg', type: 'color', label: 'Background', group: 'Appearance' },
  { key: 'fg', type: 'color', label: 'Arrow color', group: 'Appearance' },
];

