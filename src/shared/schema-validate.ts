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

  // Support custom rules array (e.g. for textEffects multi-target feature)
  if (Array.isArray(input.rules)) {
    output.rules = input.rules
      .filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object' && !Array.isArray(r)))
      .map((r) => ({
        id: typeof r.id === 'string' ? sanitizeString(r.id.slice(0, 50)) : `rule_${Date.now()}`,
        selector: typeof r.selector === 'string' ? sanitizeString(r.selector.slice(0, 200)) : '',
        label: typeof r.label === 'string' ? sanitizeString(r.label.slice(0, 100)) : 'Text Element',
        enabled: Boolean(r.enabled),
        gradientEnabled: Boolean(r.gradientEnabled),
        gradientStart:
          typeof r.gradientStart === 'string' && COLOR_HEX_REGEX.test(r.gradientStart)
            ? r.gradientStart
            : '#4f46e5',
        gradientEnd:
          typeof r.gradientEnd === 'string' && COLOR_HEX_REGEX.test(r.gradientEnd)
            ? r.gradientEnd
            : '#06b6d4',
        gradientAngle:
          typeof r.gradientAngle === 'number' && Number.isFinite(r.gradientAngle)
            ? r.gradientAngle
            : 135,
        gradientAnimate: Boolean(r.gradientAnimate),
        highlightEnabled: Boolean(r.highlightEnabled),
        highlightColor:
          typeof r.highlightColor === 'string' && COLOR_HEX_REGEX.test(r.highlightColor)
            ? r.highlightColor
            : '#fef08a',
        highlightStyle: ['underline', 'thick', 'full'].includes(r.highlightStyle as string)
          ? r.highlightStyle
          : 'underline',
        underlineEnabled: Boolean(r.underlineEnabled),
        underlineColor:
          typeof r.underlineColor === 'string' && COLOR_HEX_REGEX.test(r.underlineColor)
            ? r.underlineColor
            : '#0f766e',
        underlineThickness:
          typeof r.underlineThickness === 'number' && Number.isFinite(r.underlineThickness)
            ? r.underlineThickness
            : 3,
        underlineHover: ['always', 'hover'].includes(r.underlineHover as string)
          ? r.underlineHover
          : 'hover',
        shadowEffect: ['none', 'subtle', 'glow', 'retro-3d', 'soft-drop'].includes(
          r.shadowEffect as string
        )
          ? r.shadowEffect
          : 'none',
        shadowColor:
          typeof r.shadowColor === 'string' && COLOR_HEX_REGEX.test(r.shadowColor)
            ? r.shadowColor
            : '#0f766e',
        letterSpacing:
          typeof r.letterSpacing === 'number' && Number.isFinite(r.letterSpacing)
            ? r.letterSpacing
            : 0,
      }));
  } else if ('rules' in defaults && Array.isArray((defaults as Record<string, unknown>).rules)) {
    output.rules = (defaults as Record<string, unknown>).rules;
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
