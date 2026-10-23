import type { Field } from '../../shared/types.js';

export type AnnouncementBarAlignment = 'center' | 'space-between' | 'left';
export type AnnouncementBarIcon = 'none' | 'megaphone' | 'tag' | 'bell' | 'star' | 'info';
export type AnnouncementBarContactIcon = 'phone' | 'email' | 'none';

export interface AnnouncementBarConfig extends Record<string, unknown> {
  enabled: boolean;
  text: string;
  icon: AnnouncementBarIcon;
  linkUrl: string;
  linkText: string;
  locationText: string;
  showLocationIcon: boolean;
  contactText: string;
  contactUrl: string;
  contactIcon: AnnouncementBarContactIcon;
  alignment: AnnouncementBarAlignment;
  paddingX: number;
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
  icon: 'megaphone',
  linkUrl: '',
  linkText: 'Learn more',
  locationText: '',
  showLocationIcon: true,
  contactText: '',
  contactUrl: '',
  contactIcon: 'phone',
  alignment: 'center',
  paddingX: 32,
  bg: '#1e293b',
  useGradient: false,
  bgGradientEnd: '#3b82f6',
  gradientAngle: 90,
  fg: '#f8fafc',
  closable: true,
  sticky: true,
};

export const announcementBarSchema: Field[] = [
  // Group: Announcement Message
  { key: 'enabled', type: 'toggle', label: 'Show announcement bar', group: 'Announcement Message' },
  {
    key: 'icon',
    type: 'select',
    label: 'Announcement icon',
    options: ['none', 'megaphone', 'tag', 'bell', 'star', 'info'],
    group: 'Announcement Message',
  },
  { key: 'text', type: 'text', label: 'Message text', maxLength: 300, group: 'Announcement Message' },
  { key: 'linkUrl', type: 'text', label: 'Button / Link URL', maxLength: 300, group: 'Announcement Message' },
  { key: 'linkText', type: 'text', label: 'Button / Link text', maxLength: 100, group: 'Announcement Message' },

  // Group: Location & Contact
  { key: 'locationText', type: 'text', label: 'Location info (optional)', maxLength: 120, group: 'Location & Contact' },
  { key: 'showLocationIcon', type: 'toggle', label: 'Show location pin icon', group: 'Location & Contact' },
  { key: 'contactText', type: 'text', label: 'Contact info (phone/email)', maxLength: 120, group: 'Location & Contact' },
  { key: 'contactUrl', type: 'text', label: 'Contact link (tel: or mailto:)', maxLength: 200, group: 'Location & Contact' },
  {
    key: 'contactIcon',
    type: 'select',
    label: 'Contact icon',
    options: ['phone', 'email', 'none'],
    group: 'Location & Contact',
  },

  // Group: Layout & Placement
  {
    key: 'alignment',
    type: 'select',
    label: 'Layout alignment',
    options: ['center', 'space-between', 'left'],
    group: 'Layout & Placement',
  },
  {
    key: 'paddingX',
    type: 'range',
    label: 'Side margin / spacing',
    min: 12,
    max: 120,
    step: 4,
    unit: 'px',
    group: 'Layout & Placement',
  },
  { key: 'sticky', type: 'toggle', label: 'Sticky / Stay at top when scrolling', group: 'Layout & Placement' },
  { key: 'closable', type: 'toggle', label: 'Allow visitor to dismiss', group: 'Layout & Placement' },

  // Group: Colors & Styling
  { key: 'bg', type: 'color', label: 'Background / Start color', group: 'Colors & Styling' },
  { key: 'useGradient', type: 'toggle', label: 'Use gradient background', group: 'Colors & Styling' },
  { key: 'bgGradientEnd', type: 'color', label: 'Gradient end color', group: 'Colors & Styling' },
  { key: 'gradientAngle', type: 'range', label: 'Gradient angle', min: 0, max: 360, step: 15, unit: 'deg', group: 'Colors & Styling' },
  { key: 'fg', type: 'color', label: 'Text color', group: 'Colors & Styling' },
];

