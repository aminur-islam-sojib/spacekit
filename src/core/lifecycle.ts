import type { Feature, SqspEnv } from '../shared/types.js';
import { validateFeatureConfig } from '../shared/schema-validate.js';

/**
 * Manages feature execution lifecycle with error boundaries and cleanup guarantees.
 * Non-negotiable rule 4 & 5: Idempotency, cleanup, and error isolation per feature.
 */
export class LifecycleManager {
  private activeFeatures = new Set<string>();

  /**
   * Checks whether a feature is currently active.
   */
  isFeatureActive(id: string): boolean {
    return this.activeFeatures.has(id);
  }

  /**
   * Initializes a single feature with isolated error handling and guaranteed idempotency.
   */
  initFeature<C extends Record<string, unknown>>(
    feature: Feature<C>,
    rawConfig: unknown,
    env: SqspEnv
  ): boolean {
    try {
      // Idempotency: Clean up existing instance before re-initializing
      if (this.activeFeatures.has(feature.id)) {
        this.destroyFeature(feature);
      }

      // Check probe if provided
      if (feature.probe) {
        const probeResult = feature.probe(env);
        if (!probeResult.ok) {
          console.warn(`[SiteKit:${feature.id}] Probe failed: ${probeResult.reason || 'Element missing'}`);
          return false;
        }
      }

      // Validate config against schema
      const validatedConfig = validateFeatureConfig(feature.schema, rawConfig, feature.defaults);

      // Invoke feature init
      feature.init(validatedConfig, env);
      this.activeFeatures.add(feature.id);
      return true;
    } catch (err) {
      console.error(`[SiteKit:${feature.id}] Failed during init:`, err);
      this.activeFeatures.delete(feature.id);
      return false;
    }
  }

  /**
   * Updates an active feature (used for live preview in editor).
   */
  updateFeature<C extends Record<string, unknown>>(
    feature: Feature<C>,
    rawConfig: unknown,
    env: SqspEnv
  ): boolean {
    try {
      const validatedConfig = validateFeatureConfig(feature.schema, rawConfig, feature.defaults);
      feature.update(validatedConfig, env);
      return true;
    } catch (err) {
      console.error(`[SiteKit:${feature.id}] Failed during update:`, err);
      return false;
    }
  }

  /**
   * Destroys a feature and cleans up any remaining data-sk elements.
   */
  destroyFeature<C extends Record<string, unknown>>(feature: Feature<C>): void {
    try {
      feature.destroy();
    } catch (err) {
      console.error(`[SiteKit:${feature.id}] Error in destroy():`, err);
    } finally {
      // Guaranteed DOM cleanup for elements tagged with data-sk
      if (typeof document !== 'undefined') {
        const remaining = document.querySelectorAll(`[data-sk="${feature.id}"]`);
        remaining.forEach((el) => el.remove());
      }
      this.activeFeatures.delete(feature.id);
    }
  }

  /**
   * Initializes all provided features, isolating errors so one failure cannot halt others (TC-C08).
   */
  initAll(
    features: Feature<Record<string, unknown>>[],
    configs: Record<string, unknown>,
    env: SqspEnv
  ): void {
    for (const feature of features) {
      const featConfig = configs[feature.id] || {};
      this.initFeature(feature, featConfig, env);
    }
  }

  /**
   * Destroys all currently active features.
   */
  destroyAll(features: Feature<Record<string, unknown>>[]): void {
    for (const feature of features) {
      if (this.activeFeatures.has(feature.id)) {
        this.destroyFeature(feature);
      }
    }
  }
}
