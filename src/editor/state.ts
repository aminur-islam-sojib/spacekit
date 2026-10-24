import type { SiteKitConfig, Feature, SqspEnv } from '../shared/types.js';
import { configClient, lifecycle, registry } from '../core/index.js';

export interface EditorPosition {
  x: number;
  y: number;
}

export interface EditorState {
  open: boolean;
  activeFeatureId: string | null;
  activeTargetSelector: string | null;
  searchQuery: string;
  position: EditorPosition | null;
  draft: SiteKitConfig;
  status: string;
  isDirty: boolean;
}

function getStorageKey(key: string): string {
  const host = typeof location !== 'undefined' ? location.hostname : 'localhost';
  return `sitekit:${key}:${host}`;
}

export class EditorStore {
  private state: EditorState;
  private listeners = new Set<() => void>();

  constructor() {
    const cachedConfig = configClient.getConfig();
    const storedDraft = this.loadDraft();

    this.state = {
      open: this.loadOpenState(),
      activeFeatureId: null,
      activeTargetSelector: null,
      searchQuery: '',
      position: this.loadPosition(),
      draft: storedDraft || { ...cachedConfig },
      status: storedDraft ? 'Unsaved changes' : 'Ready',
      isDirty: Boolean(storedDraft),
    };

    // If draft exists from a previous session, apply it immediately
    if (storedDraft) {
      this.applyAllDraftFeatures();
    }
  }

  getState(): EditorState {
    return this.state;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  setOpen(open: boolean): void {
    this.state.open = open;
    this.saveOpenState(open);
    this.notify();
  }

  toggleOpen(): void {
    this.setOpen(!this.state.open);
  }

  setActiveFeatureId(id: string | null): void {
    this.state.activeFeatureId = id;
    this.notify();
  }

  setActiveTargetSelector(sel: string | null): void {
    this.state.activeTargetSelector = sel;
    this.notify();
  }

  setSearchQuery(q: string): void {
    this.state.searchQuery = q;
    this.notify();
  }

  setPosition(pos: EditorPosition): void {
    this.state.position = pos;
    this.savePosition(pos);
    this.notify();
  }

  updateFeatureValue(
    feature: Feature<Record<string, unknown>>,
    key: string,
    value: unknown,
    env: SqspEnv
  ): void {
    const currentFeatures = this.state.draft.features || {};
    const featConfig = {
      ...feature.defaults,
      ...(currentFeatures[feature.id] || {}),
      [key]: value,
    };

    this.state.draft = {
      ...this.state.draft,
      features: {
        ...currentFeatures,
        [feature.id]: featConfig,
      },
    };

    this.state.isDirty = true;
    this.state.status = 'Unsaved changes';
    this.saveDraft(this.state.draft);

    // Live preview: immediate update to page DOM/CSS (TC-E10)
    lifecycle.updateFeature(feature, featConfig, env);

    this.notify();
  }

  resetFeature(feature: Feature<Record<string, unknown>>, env: SqspEnv): void {
    const currentFeatures = { ...(this.state.draft.features || {}) };
    delete currentFeatures[feature.id];

    this.state.draft = {
      ...this.state.draft,
      features: currentFeatures,
    };

    this.state.isDirty = true;
    this.state.status = 'Unsaved changes';
    this.saveDraft(this.state.draft);

    // Live preview: reset back to defaults (TC-E12)
    lifecycle.updateFeature(feature, feature.defaults, env);

    this.notify();
  }

  async publish(): Promise<void> {
    const scriptWithConfig =
      typeof document !== 'undefined'
        ? (document.querySelector('script[data-config]') as HTMLScriptElement | null)
        : null;
    const configUrl = scriptWithConfig?.dataset?.config || '';

    if (!configUrl) {
      this.state.status = 'Saved in browser only (add data-config to publish).';
      this.notify();
      return;
    }

    const isLocal =
      configUrl.includes('localhost') ||
      configUrl.includes('127.0.0.1') ||
      configUrl.includes('trycloudflare.com');
    const token = isLocal
      ? this.loadToken() || 'local-dev-token'
      : this.loadToken() || prompt('SiteKit Admin Token:');

    if (!token) {
      this.state.status = 'Publish cancelled.';
      this.notify();
      return;
    }

    const putUrl = configUrl.replace(/\.json$/, '');

    try {
      this.state.status = 'Publishing...';
      this.notify();

      const res = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'If-Match': String(this.state.draft.revision || 0),
        },
        body: JSON.stringify(this.state.draft),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const publishedData = (await res.json()) as SiteKitConfig;
      this.state.draft = publishedData;
      configClient.setCachedConfig(publishedData);

      this.saveToken(token);
      this.clearDraft();
      this.state.isDirty = false;
      this.state.status = `Published (rev ${publishedData.revision}).`;
    } catch (err) {
      console.error('[SiteKit Editor] Publish request failed:', err);
      const isMixedContent =
        typeof location !== 'undefined' &&
        location.protocol === 'https:' &&
        putUrl.startsWith('http://');

      if (isMixedContent) {
        this.state.status = 'Publish failed (Mixed Content: use npm run tunnel for HTTPS).';
      } else {
        this.state.status = `Publish failed (${(err as Error).message}). Check console.`;
      }
    } finally {
      this.notify();
    }
  }

  private applyAllDraftFeatures(): void {
    const env: SqspEnv = { isEditor: true, isEditorActive: false };
    const features = registry.getAll();
    for (const feat of features) {
      const cfg = this.state.draft.features?.[feat.id];
      if (cfg) {
        lifecycle.updateFeature(feat, cfg, env);
      }
    }
  }

  private loadDraft(): SiteKitConfig | null {
    try {
      const raw = localStorage.getItem(getStorageKey('draft'));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveDraft(draft: SiteKitConfig): void {
    try {
      localStorage.setItem(getStorageKey('draft'), JSON.stringify(draft));
    } catch (e) {
      console.warn('[SiteKit Editor] Failed to save draft', e);
    }
  }

  private clearDraft(): void {
    try {
      localStorage.removeItem(getStorageKey('draft'));
    } catch {}
  }

  private loadOpenState(): boolean {
    try {
      return localStorage.getItem(getStorageKey('open')) === 'true';
    } catch {
      return false;
    }
  }

  private saveOpenState(open: boolean): void {
    try {
      localStorage.setItem(getStorageKey('open'), String(open));
    } catch {}
  }

  private loadPosition(): EditorPosition | null {
    try {
      const raw = localStorage.getItem(getStorageKey('pos'));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private savePosition(pos: EditorPosition): void {
    try {
      localStorage.setItem(getStorageKey('pos'), JSON.stringify(pos));
    } catch {}
  }

  private loadToken(): string {
    try {
      return localStorage.getItem(getStorageKey('token')) || '';
    } catch {
      return '';
    }
  }

  private saveToken(token: string): void {
    try {
      localStorage.setItem(getStorageKey('token'), token);
    } catch {}
  }
}

