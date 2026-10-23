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

