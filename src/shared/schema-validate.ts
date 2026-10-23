import type { Field, SiteKitConfig } from './types.js';

const COLOR_HEX_REGEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Sanitizes a string by escaping HTML special characters to prevent XSS.
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates raw feature configuration against its schema and defaults.
 * Unknown keys are dropped (TC-C16).
 * Invalid colors / malicious CSS are rejected (TC-S02).
 * HTML content in strings is escaped (TC-S01).
 */
export function validateFeatureConfig<C extends Record<string, unknown>>(
  schema: Field[],
  raw: unknown,
  defaults: C
): C {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...defaults };
  }

  const input = raw as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const field of schema) {
    const val = input[field.key];

    if (val === undefined || val === null) {
      output[field.key] = defaults[field.key];
      continue;
    }

    switch (field.type) {
      case 'toggle': {
        output[field.key] = typeof val === 'boolean' ? val : defaults[field.key];
        break;
      }
      case 'range': {
        if (typeof val === 'number' && Number.isFinite(val) && val >= field.min && val <= field.max) {
          output[field.key] = val;
        } else {
          output[field.key] = defaults[field.key];
        }
        break;
      }
      case 'color': {
        if (typeof val === 'string' && COLOR_HEX_REGEX.test(val)) {
          output[field.key] = val;
        } else {
          output[field.key] = defaults[field.key];
        }
        break;
      }
      case 'select': {
        if (typeof val === 'string' && field.options.includes(val)) {
          output[field.key] = val;
        } else {
          output[field.key] = defaults[field.key];
        }
        break;
      }
      case 'text': {
        if (typeof val === 'string') {
          const max = field.maxLength || 100;
          const trimmed = val.slice(0, max);
          output[field.key] = sanitizeString(trimmed);
        } else {
          output[field.key] = defaults[field.key];
        }
        break;
      }
      default: {
        const fallbackKey = (field as { key: string }).key;
        output[fallbackKey] = defaults[fallbackKey];
      }
    }
  }

  return output as C;
}

/**
 * Validates a top-level SiteKitConfig payload.
 * Returns null if the structure is invalid or corrupt (TC-C05).
 */
export function validateSiteKitConfig(raw: unknown): SiteKitConfig | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.schemaVersion !== 'number') return null;
  if (typeof obj.revision !== 'number') return null;
  if (typeof obj.disabled !== 'boolean' && obj.disabled !== undefined) return null;
  if (!obj.features || typeof obj.features !== 'object' || Array.isArray(obj.features)) return null;

  return {
    schemaVersion: obj.schemaVersion,
    revision: obj.revision,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
    disabled: Boolean(obj.disabled),
    features: obj.features as Record<string, Record<string, unknown>>,
    targets:
      obj.targets && typeof obj.targets === 'object' && !Array.isArray(obj.targets)
        ? (obj.targets as Record<string, unknown>)
        : {},
  };
}
