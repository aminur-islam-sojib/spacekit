import { describe, it, expect, beforeEach } from 'vitest';
import { detectEditor, SELECTORS } from '../../src/adapters/squarespace.js';

describe('Squarespace Adapter (detectEditor & SELECTORS)', () => {
  beforeEach(() => {
    document.body.className = '';
    window.history.replaceState({}, '', '/');
  });

  it('returns false for regular visitor page', () => {
    expect(detectEditor()).toBe(false);
  });

  it('returns true when ?sitekit=edit is in query parameters', () => {
    window.history.replaceState({}, '', '/?sitekit=edit');
    expect(detectEditor()).toBe(true);
  });

  it('returns true when #sitekit-edit is in hash', () => {
    window.history.replaceState({}, '', '/#sitekit-edit');
    expect(detectEditor()).toBe(true);
  });

  it('returns true when body has sqs-edit-mode or sqs-edit-mode-active', () => {
    document.body.className = 'sqs-edit-mode';
    expect(detectEditor()).toBe(true);

    document.body.className = 'sqs-edit-mode-active';
    expect(detectEditor()).toBe(true);
  });

  it('returns true when body has squarespace-config or squarespace-editable (verified on Squarespace 7.1)', () => {
    document.body.className = 'squarespace-config squarespace-editable sqs-frame-loaded';
    expect(detectEditor()).toBe(true);
  });

  it('returns true when pathname starts with /config/', () => {
    window.history.replaceState({}, '', '/config/');
    expect(detectEditor()).toBe(true);
  });

  it('provides spec-first selectors', () => {
    expect(SELECTORS.section).toBe('[data-sqsp-section]');
    expect(SELECTORS.block('button')).toBe('[data-sqsp-block="button"]');
    expect(SELECTORS.textContent).toBe('[data-sqsp-text-block-content]');
  });
});
