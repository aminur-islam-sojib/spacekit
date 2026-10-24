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

  // Support custom rules array (e.g. for textEffects multi-target feature and buttonStyles per-element rules)
  if (Array.isArray(input.rules)) {
    output.rules = input.rules
      .filter((r): r is Record<string, unknown> => Boolean(r && typeof r === 'object' && !Array.isArray(r)))
      .map((r) => {
        const out: Record<string, unknown> = {
          id: typeof r.id === 'string' ? sanitizeString(r.id.slice(0, 50)) : `rule_${Date.now()}`,
          selector: typeof r.selector === 'string' ? sanitizeString(r.selector.slice(0, 200)) : '',
          label: typeof r.label === 'string' ? sanitizeString(r.label.slice(0, 100)) : 'Element',
          enabled: Boolean(r.enabled),
        };

        // Text Options
        if (typeof r.textOptionsEnabled === 'boolean') {
          out.textOptionsEnabled = r.textOptionsEnabled;
        }
        if (typeof r.tag === 'string') {
          out.tag = sanitizeString(r.tag.slice(0, 20));
        }
        if (typeof r.textColor === 'string') {
          out.textColor = COLOR_HEX_REGEX.test(r.textColor) || r.textColor === 'inherit' ? r.textColor : '#ffffff';
        }
        if (typeof r.fontSize === 'number' && Number.isFinite(r.fontSize)) {
          out.fontSize = r.fontSize;
        }
        if (typeof r.mobileFontSize === 'number' && Number.isFinite(r.mobileFontSize)) {
          out.mobileFontSize = r.mobileFontSize;
        }
        if (typeof r.format === 'string' && ['auto', 'bold', 'italic', 'underline', 'strike'].includes(r.format)) {
          out.format = r.format;
        }
        if (typeof r.align === 'string' && ['left', 'center', 'right', 'justify'].includes(r.align)) {
          out.align = r.align;
        }
        if (typeof r.mobileAlign === 'string' && ['left', 'center', 'right'].includes(r.mobileAlign)) {
          out.mobileAlign = r.mobileAlign;
        }
        if (typeof r.lineGap === 'number' && Number.isFinite(r.lineGap)) {
          out.lineGap = r.lineGap;
        }

        // Visual Text Effects (FR-TE12)
        const validEffectTypes = [
          'none',
          'gradient',
          'fill-on-scroll',
          'reveal-on-scroll',
          'underline',
          'stroke',
          'colorful',
          'fill',
          'strong-fill',
          'candy-cane',
        ];
        out.effectType = validEffectTypes.includes(r.effectType as string)
          ? r.effectType
          : (r.gradientEnabled ? 'gradient' : (r.underlineEnabled ? 'underline' : (r.highlightEnabled ? 'fill' : 'none')));

        out.effectTextColor =
          typeof r.effectTextColor === 'string' && (COLOR_HEX_REGEX.test(r.effectTextColor) || r.effectTextColor === 'inherit')
            ? r.effectTextColor
            : '#c2410c';

        out.effectAccentColor =
          typeof r.effectAccentColor === 'string' && (COLOR_HEX_REGEX.test(r.effectAccentColor) || r.effectAccentColor === 'inherit')
            ? r.effectAccentColor
            : '#0f172a';

        out.effectApplyTo = ['all', 'first-word', 'last-word'].includes(r.effectApplyTo as string)
          ? r.effectApplyTo
          : 'all';

        out.effectSpeed = ['slow', 'medium', 'fast'].includes(r.effectSpeed as string)
          ? r.effectSpeed
          : 'medium';

        out.effectAngle =
          typeof r.effectAngle === 'number' && Number.isFinite(r.effectAngle)
            ? r.effectAngle
            : (typeof r.gradientAngle === 'number' ? r.gradientAngle : 135);

        out.effectThickness =
          typeof r.effectThickness === 'number' && Number.isFinite(r.effectThickness)
            ? r.effectThickness
            : (typeof r.underlineThickness === 'number' ? r.underlineThickness : 2);

        // Text Effects (Legacy Gradient, Highlight, Underline, Shadow)
        out.gradientEnabled = Boolean(r.gradientEnabled);
        out.gradientStart =
          typeof r.gradientStart === 'string' && COLOR_HEX_REGEX.test(r.gradientStart)
            ? r.gradientStart
            : '#4f46e5';
        out.gradientEnd =
          typeof r.gradientEnd === 'string' && COLOR_HEX_REGEX.test(r.gradientEnd)
            ? r.gradientEnd
            : '#06b6d4';
        out.gradientAngle =
          typeof r.gradientAngle === 'number' && Number.isFinite(r.gradientAngle)
            ? r.gradientAngle
            : 135;
        out.gradientAnimate = Boolean(r.gradientAnimate);

        out.highlightEnabled = Boolean(r.highlightEnabled);
        out.highlightColor =
          typeof r.highlightColor === 'string' && COLOR_HEX_REGEX.test(r.highlightColor)
            ? r.highlightColor
            : '#fef08a';
        out.highlightStyle = ['underline', 'thick', 'full'].includes(r.highlightStyle as string)
          ? r.highlightStyle
          : 'underline';

        out.underlineEnabled = Boolean(r.underlineEnabled);
        out.underlineColor =
          typeof r.underlineColor === 'string' && COLOR_HEX_REGEX.test(r.underlineColor)
            ? r.underlineColor
            : '#0f766e';
        out.underlineThickness =
          typeof r.underlineThickness === 'number' && Number.isFinite(r.underlineThickness)
            ? r.underlineThickness
            : 3;
        out.underlineHover = ['always', 'hover'].includes(r.underlineHover as string)
          ? r.underlineHover
          : 'hover';

        out.shadowEffect = ['none', 'subtle', 'glow', 'retro-3d', 'soft-drop'].includes(
          r.shadowEffect as string
        )
          ? r.shadowEffect
          : 'none';
        out.shadowColor =
          typeof r.shadowColor === 'string' && COLOR_HEX_REGEX.test(r.shadowColor)
            ? r.shadowColor
            : '#0f766e';

        out.letterSpacing =
          typeof r.letterSpacing === 'number' && Number.isFinite(r.letterSpacing)
            ? r.letterSpacing
            : 0;

        // Button Styles properties (if present)
        if (typeof r.radius === 'number' && Number.isFinite(r.radius)) out.radius = r.radius;
        if (typeof r.borderWidth === 'number' && Number.isFinite(r.borderWidth)) out.borderWidth = r.borderWidth;
        if (typeof r.borderStyle === 'string') out.borderStyle = r.borderStyle;
        if (typeof r.borderColor === 'string') {
          out.borderColor = COLOR_HEX_REGEX.test(r.borderColor) ? r.borderColor : '#0f766e';
        }
        if (typeof r.hoverEffect === 'string') out.hoverEffect = r.hoverEffect;
        if (typeof r.shadow === 'string') out.shadow = r.shadow;
        if (typeof r.paddingY === 'number' && Number.isFinite(r.paddingY)) out.paddingY = r.paddingY;
        if (typeof r.paddingX === 'number' && Number.isFinite(r.paddingX)) out.paddingX = r.paddingX;
        if (typeof r.fontWeight === 'string') out.fontWeight = r.fontWeight;
        if (typeof r.customColors === 'boolean') out.customColors = r.customColors;
        if (typeof r.bg === 'string') out.bg = COLOR_HEX_REGEX.test(r.bg) ? r.bg : '#0f766e';
        if (typeof r.useGradient === 'boolean') out.useGradient = r.useGradient;
        if (typeof r.bgGradientEnd === 'string') {
          out.bgGradientEnd = COLOR_HEX_REGEX.test(r.bgGradientEnd) ? r.bgGradientEnd : '#0d9488';
        }
        if (typeof r.fg === 'string') out.fg = COLOR_HEX_REGEX.test(r.fg) ? r.fg : '#ffffff';

        return out;
      });
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
