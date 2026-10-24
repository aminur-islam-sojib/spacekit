import { render, h } from 'preact';
import { EDITOR_CSS } from './styles.js';
import { EditorStore } from './state.js';
import { App } from './components/App.js';
import { registry } from '../core/index.js';
import { announcementBarFeature } from '../features/announcementBar/index.js';
import { buttonStylesFeature } from '../features/buttonStyles/index.js';
import { textEffectsFeature } from '../features/textEffects/index.js';

// Ensure all catalog features are registered for the editor panel
registry.register(announcementBarFeature);
registry.register(buttonStylesFeature);
registry.register(textEffectsFeature);

let hostEl: HTMLElement | null = null;
let storeInstance: EditorStore | null = null;

export function mountEditor(): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Idempotency: avoid mounting twice
  if (document.getElementById('sitekit-host')) {
    return;
  }

  const host = document.createElement('div');
  host.id = 'sitekit-host';
  host.setAttribute('data-sk', 'host');
  host.style.position = 'relative';
  host.style.zIndex = '2147483647';
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });

  // Scoped CSS in Shadow DOM
  const style = document.createElement('style');
  style.textContent = EDITOR_CSS;
  shadowRoot.appendChild(style);

  const container = document.createElement('div');
  container.className = 'sitekit-container';
  shadowRoot.appendChild(container);

  storeInstance = new EditorStore();
  render(h(App, { store: storeInstance }), container);

  hostEl = host;
  console.log('[SiteKit Editor] Mounted control panel in Shadow DOM.');
}

export function unmountEditor(): void {
  if (hostEl && typeof document !== 'undefined') {
    const container = hostEl.shadowRoot?.querySelector('.sitekit-container');
    if (container) {
      render(null, container);
    }
    hostEl.remove();
    hostEl = null;
    storeInstance = null;
  }
}

// Auto-mount when loaded in browser
if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
  const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';
  if (!isTest) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountEditor);
    } else {
      mountEditor();
    }
  }
}
