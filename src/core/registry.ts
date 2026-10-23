import type { Feature } from '../shared/types.js';

/**
 * Registry holding all loaded SiteKit features.
 */
export class FeatureRegistry {
  private features = new Map<string, Feature<Record<string, unknown>>>();

  register<C extends Record<string, unknown> = Record<string, unknown>>(feature: Feature<C>): void {
    if (!feature || !feature.id) {
      console.warn('[SiteKit] Attempted to register invalid feature without an id.');
      return;
    }
    this.features.set(feature.id, feature as unknown as Feature<Record<string, unknown>>);
  }

  get<C extends Record<string, unknown> = Record<string, unknown>>(id: string): Feature<C> | undefined {
    return this.features.get(id) as Feature<C> | undefined;
  }

  getAll(): Feature<Record<string, unknown>>[] {
    return Array.from(this.features.values());
  }

  has(id: string): boolean {
    return this.features.has(id);
  }

  clear(): void {
    this.features.clear();
  }
}
