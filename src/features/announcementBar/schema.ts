import type { Field } from '../../shared/types.js';

export interface AnnouncementBarConfig extends Record<string, unknown> {
  enabled: boolean;
  text: string;
  linkUrl: string;
  linkText: string;
  bg: string;
  useGradient: boolean;
  bgGradientEnd: string;
  gradientAngle: number;
  fg: string;
  closable: boolean;
  sticky: boolean;
}

export const announcementBarDefaults: AnnouncementBarConfig = {
  enabled: false,
  text: 'Special announcement! Get 15% off with code SAVE15.',
  linkUrl: '',
  linkText: 'Learn more',
  bg: '#1e293b',
  useGradient: false,
  bgGradientEnd: '#3b82f6',
  gradientAngle: 90,
  fg: '#f8fafc',
  closable: true,
  sticky: true,
};

export const announcementBarSchema: Field[] = [
  { key: 'enabled', type: 'toggle', label: 'Show announcement bar' },
  { key: 'text', type: 'text', label: 'Announcement text', maxLength: 300 },
  { key: 'linkUrl', type: 'text', label: 'Button / Link URL', maxLength: 300 },
  { key: 'linkText', type: 'text', label: 'Button / Link text', maxLength: 100 },
  { key: 'bg', type: 'color', label: 'Background / Start color' },
  { key: 'useGradient', type: 'toggle', label: 'Use gradient background' },
  { key: 'bgGradientEnd', type: 'color', label: 'Gradient end color' },
  { key: 'gradientAngle', type: 'range', label: 'Gradient angle', min: 0, max: 360, step: 15, unit: 'deg' },
  { key: 'fg', type: 'color', label: 'Text color' },
  { key: 'closable', type: 'toggle', label: 'Allow visitor to dismiss' },
  { key: 'sticky', type: 'toggle', label: 'Sticky / Stay at top when scrolling' },
];

