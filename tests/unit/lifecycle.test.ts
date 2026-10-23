import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LifecycleManager } from '../../src/core/lifecycle.js';
import { FeatureRegistry } from '../../src/core/registry.js';
import type { Feature, SqspEnv } from '../../src/shared/types.js';

describe('Feature Registry & Lifecycle Manager (TC-C06, TC-C07, TC-C08)', () => {
  let registry: FeatureRegistry;
  let lifecycle: LifecycleManager;

  const mockEnv: SqspEnv = {
    isEditor: false,
    isEditorActive: false,
  };

  beforeEach(() => {
    document.body.replaceChildren();
    registry = new FeatureRegistry();
    lifecycle = new LifecycleManager();
    vi.restoreAllMocks();
  });

  it('TC-C06: init called twice on the same feature is idempotent and does not duplicate DOM or listeners', () => {
    let clickCount = 0;
    const clickHandler = () => {
      clickCount++;
    };

    const testFeature: Feature<{ enabled: boolean }> = {
      id: 'testButton',
      label: 'Test Button',
      version: 1,
      schema: [{ key: 'enabled', type: 'toggle', label: 'Enabled' }],
      defaults: { enabled: true },
      init(cfg) {
        if (!cfg.enabled) return;
        const btn = document.createElement('button');
        btn.setAttribute('data-sk', 'testButton');
        btn.addEventListener('click', clickHandler);
        document.body.appendChild(btn);
      },
      update() {},
      destroy() {
        const nodes = document.querySelectorAll('[data-sk="testButton"]');
        nodes.forEach((n) => {
          n.removeEventListener('click', clickHandler);
          n.remove();
        });
      },
    };

    // First init
    lifecycle.initFeature(testFeature, { enabled: true }, mockEnv);
    expect(document.querySelectorAll('[data-sk="testButton"]').length).toBe(1);

    // Second init (duplicate call)
    lifecycle.initFeature(testFeature, { enabled: true }, mockEnv);

    // Exactly one DOM node remains
    const buttons = document.querySelectorAll('[data-sk="testButton"]');
    expect(buttons.length).toBe(1);

    // Trigger click: handler should only fire once
    buttons[0].dispatchEvent(new MouseEvent('click'));
    expect(clickCount).toBe(1);
  });

  it('TC-C07: destroy cleanly removes all [data-sk] nodes and unbinds listeners', () => {
    const clickSpy = vi.fn();

    const testFeature: Feature<{ enabled: boolean }> = {
      id: 'cleanupFeat',
      label: 'Cleanup Feature',
      version: 1,
      schema: [{ key: 'enabled', type: 'toggle', label: 'Enabled' }],
      defaults: { enabled: true },
      init() {
        const el = document.createElement('div');
        el.setAttribute('data-sk', 'cleanupFeat');
        el.addEventListener('click', clickSpy);
        document.body.appendChild(el);
      },
      update() {},
      destroy() {
        const el = document.querySelector('[data-sk="cleanupFeat"]');
        if (el) {
          el.removeEventListener('click', clickSpy);
          el.remove();
        }
      },
    };

    lifecycle.initFeature(testFeature, { enabled: true }, mockEnv);
    expect(document.querySelectorAll('[data-sk="cleanupFeat"]').length).toBe(1);

    lifecycle.destroyFeature(testFeature);

    // No [data-sk="cleanupFeat"] elements in DOM
    expect(document.querySelectorAll('[data-sk="cleanupFeat"]').length).toBe(0);
    expect(lifecycle.isFeatureActive('cleanupFeat')).toBe(false);
  });

  it('TC-C08: Feature A throwing in init does not stop Feature B from initializing', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const failingFeature: Feature<{ enabled: boolean }> = {
      id: 'featureA',
      label: 'Feature A (Broken)',
      version: 1,
      schema: [],
      defaults: { enabled: true },
      init() {
        throw new Error('Fatal error in Feature A init');
      },
      update() {},
      destroy() {},
    };

    const healthyFeature: Feature<{ enabled: boolean }> = {
      id: 'featureB',
      label: 'Feature B (Healthy)',
      version: 1,
      schema: [],
      defaults: { enabled: true },
      init() {
        const el = document.createElement('span');
        el.setAttribute('data-sk', 'featureB');
        document.body.appendChild(el);
      },
      update() {},
      destroy() {},
    };

    registry.register(failingFeature);
    registry.register(healthyFeature);

    // Init all registered features
    lifecycle.initAll(registry.getAll(), {}, mockEnv);

    // Error was logged with feature id
    expect(errorSpy).toHaveBeenCalled();
    const errorMessage = errorSpy.mock.calls[0].join(' ');
    expect(errorMessage).toContain('featureA');

    // Feature B still initialized successfully
    expect(document.querySelectorAll('[data-sk="featureB"]').length).toBe(1);
    expect(lifecycle.isFeatureActive('featureB')).toBe(true);
    expect(lifecycle.isFeatureActive('featureA')).toBe(false);
  });
});
