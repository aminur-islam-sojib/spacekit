import { describe, it, expect } from 'vitest';
import {
  validateFeatureConfig,
  validateSiteKitConfig,
  sanitizeString,
} from '../../src/shared/schema-validate.js';
import type { Field } from '../../src/shared/types.js';

describe('Schema Validator (TC-C05, TC-C16, TC-S01, TC-S02)', () => {
  const testSchema: Field[] = [
    { key: 'enabled', type: 'toggle', label: 'Enabled' },
    { key: 'count', type: 'range', label: 'Count', min: 0, max: 100 },
    { key: 'color', type: 'color', label: 'Color' },
    { key: 'theme', type: 'select', label: 'Theme', options: ['light', 'dark'] },
    { key: 'title', type: 'text', label: 'Title', maxLength: 50 },
  ];

  const testDefaults = {
    enabled: false,
    count: 10,
    color: '#0f766e',
    theme: 'light',
    title: 'Hello',
  };

  describe('validateFeatureConfig', () => {
    it('TC-C16: drops unknown keys not present in the schema', () => {
      const raw = {
        enabled: true,
        count: 50,
        color: '#123456',
        theme: 'dark',
        title: 'Valid',
        maliciousKey: 'maliciousValue',
        unknownField: 12345,
      };

      const result = validateFeatureConfig(testSchema, raw, testDefaults);

      expect(result).toEqual({
        enabled: true,
        count: 50,
        color: '#123456',
        theme: 'dark',
        title: 'Valid',
      });
      expect((result as Record<string, unknown>).maliciousKey).toBeUndefined();
      expect((result as Record<string, unknown>).unknownField).toBeUndefined();
    });

    it('TC-S02: rejects CSS injection or invalid color formats and falls back to default', () => {
      const raw = {
        color: 'red;} body{display:none',
      };

      const result = validateFeatureConfig(testSchema, raw, testDefaults);

      expect(result.color).toBe(testDefaults.color);
    });

    it('TC-S01: sanitizes and escapes HTML strings to prevent script injection', () => {
      const raw = {
        title: '<img src=x onerror=alert(1)>',
      };

      const result = validateFeatureConfig(testSchema, raw, testDefaults);

      expect(result.title).not.toContain('<img');
      expect(result.title).toBe('&lt;img src=x onerror=alert(1)&gt;');
    });

    it('clamps or rejects out-of-range numbers', () => {
      const rawTooHigh = { count: 150 };
      const rawTooLow = { count: -10 };

      expect(validateFeatureConfig(testSchema, rawTooHigh, testDefaults).count).toBe(
        testDefaults.count
      );
      expect(validateFeatureConfig(testSchema, rawTooLow, testDefaults).count).toBe(
        testDefaults.count
      );
    });

    it('rejects invalid select options', () => {
      const raw = { theme: 'invalid-theme' };
      const result = validateFeatureConfig(testSchema, raw, testDefaults);

      expect(result.theme).toBe(testDefaults.theme);
    });

    it('uses defaults when non-object input is supplied', () => {
      expect(validateFeatureConfig(testSchema, null, testDefaults)).toEqual(testDefaults);
      expect(validateFeatureConfig(testSchema, 'invalid', testDefaults)).toEqual(testDefaults);
    });
    it('TC-S01 & TC-S02: sanitizes rules array, drops malicious keys, and enforces valid colors', () => {
      const raw = {
        enabled: true,
        rules: [
          {
            id: 'r1',
            selector: '<script>alert(1)</script>#hero h1',
            label: '<b>Hero Title</b>',
            enabled: true,
            gradientEnabled: true,
            gradientStart: 'red;} body{display:none',
            gradientEnd: '#123456',
            maliciousProp: 'pwned',
          },
        ],
      };

      const result = validateFeatureConfig([], raw, { enabled: false, rules: [] }) as Record<
        string,
        unknown
      >;
      const rules = result.rules as Array<Record<string, unknown>>;
      expect(rules).toHaveLength(1);
      expect(rules[0].selector).not.toContain('<script>');
      expect(rules[0].selector).toContain('&lt;script&gt;');
      expect(rules[0].label).toContain('&lt;b&gt;');
      expect(rules[0].gradientStart).toBe('#4f46e5'); // Invalid color reverted to safe default
      expect(rules[0].gradientEnd).toBe('#123456');
      expect(rules[0].maliciousProp).toBeUndefined();
    });

    it('TC-S03: preserves and validates textOptions and buttonStyles properties in rules array', () => {
      const raw = {
        enabled: true,
        rules: [
          {
            id: 'rule_text',
            selector: '#block-hero h2',
            label: 'Hero Heading',
            enabled: true,
            textOptionsEnabled: true,
            tag: 'h2',
            textColor: '#3b82f6',
            fontSize: 56,
            mobileFontSize: 30,
            format: 'bold',
            align: 'center',
            mobileAlign: 'center',
            lineGap: 1.3,
            effectType: 'stroke',
            effectTextColor: '#f43f5e',
            effectAccentColor: '#0ea5e9',
            effectApplyTo: 'first-word',
            effectSpeed: 'fast',
            effectAngle: 90,
            effectThickness: 3,
          },
        ],
      };

      const result = validateFeatureConfig([], raw, { enabled: false, rules: [] }) as Record<
        string,
        unknown
      >;
      const rules = result.rules as Array<Record<string, unknown>>;
      expect(rules).toHaveLength(1);
      expect(rules[0].textOptionsEnabled).toBe(true);
      expect(rules[0].tag).toBe('h2');
      expect(rules[0].textColor).toBe('#3b82f6');
      expect(rules[0].fontSize).toBe(56);
      expect(rules[0].mobileFontSize).toBe(30);
      expect(rules[0].format).toBe('bold');
      expect(rules[0].align).toBe('center');
      expect(rules[0].mobileAlign).toBe('center');
      expect(rules[0].lineGap).toBe(1.3);
      expect(rules[0].effectType).toBe('stroke');
      expect(rules[0].effectTextColor).toBe('#f43f5e');
      expect(rules[0].effectAccentColor).toBe('#0ea5e9');
      expect(rules[0].effectApplyTo).toBe('first-word');
      expect(rules[0].effectSpeed).toBe('fast');
      expect(rules[0].effectAngle).toBe(90);
      expect(rules[0].effectThickness).toBe(3);
    });
  });

  describe('validateSiteKitConfig', () => {
    it('validates a well-formed SiteKitConfig object', () => {
      const valid = {
        schemaVersion: 1,
        revision: 10,
        updatedAt: '2026-10-23T10:00:00Z',
        disabled: false,
        features: {
          testFeat: { enabled: true },
        },
      };

      const result = validateSiteKitConfig(valid);
      expect(result).not.toBeNull();
      expect(result?.revision).toBe(10);
      expect(result?.disabled).toBe(false);
    });

    it('TC-C05: returns null for invalid config shape or corrupt payload', () => {
      expect(validateSiteKitConfig(null)).toBeNull();
      expect(validateSiteKitConfig('string')).toBeNull();
      expect(validateSiteKitConfig({})).toBeNull();
      expect(
        validateSiteKitConfig({
          schemaVersion: 'not-a-number',
          revision: 1,
          features: {},
        })
      ).toBeNull();
    });
  });

  describe('sanitizeString', () => {
    it('escapes dangerous HTML characters', () => {
      expect(sanitizeString('<script>')).toBe('&lt;script&gt;');
      expect(sanitizeString('"quoted" & \'single\'')).toBe('&quot;quoted&quot; &amp; &#39;single&#39;');
    });
  });
});

