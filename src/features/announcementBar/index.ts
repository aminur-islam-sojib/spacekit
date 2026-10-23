import type { Feature, SqspEnv, ProbeResult } from '../../shared/types.js';
import { SELECTORS } from '../../adapters/squarespace.js';
import {
  type AnnouncementBarConfig,
  announcementBarSchema,
  announcementBarDefaults,
} from './schema.js';
import {
  applyAnnouncementBarStyles,
  applyInnerContainerStyles,
  applyDismissButtonStyles,
} from './styles.js';

let barEl: HTMLElement | null = null;
let dismissListener: (() => void) | null = null;
let currentDismissBtn: HTMLButtonElement | null = null;
let headerEl: HTMLElement | null = null;
let originalHeaderTop: string | null = null;
let scrollListener: (() => void) | null = null;

const DISMISS_KEY = 'sitekit:announcementBar:dismissed';

function isDismissed(): boolean {
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(DISMISS_KEY) === 'true') {
      return true;
    }
    if (typeof localStorage !== 'undefined' && localStorage.getItem(DISMISS_KEY) === 'true') {
      return true;
    }
  } catch {
    // Ignore storage errors (e.g. private browsing mode)
  }
  return false;
}

function setDismissed(): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    }
  } catch {
    // Ignore storage errors
  }
}

function createSvgClose(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M18 6L6 18M6 6l12 12');
  svg.appendChild(path);

  return svg;
}

export const announcementBarFeature: Feature<AnnouncementBarConfig> = {
  id: 'announcementBar',
  label: 'Announcement bar',
  version: 1,
  schema: announcementBarSchema,
  defaults: announcementBarDefaults,

  probe(_env: SqspEnv): ProbeResult {
    return { ok: true };
  },

  init(cfg: AnnouncementBarConfig, env: SqspEnv): void {
    this.destroy();

    if (!cfg.enabled) {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    // Dismissal only silences the bar for visitors; in-editor preview always displays
    if (!env.isEditor && isDismissed()) {
      return;
    }

    const bar = document.createElement('div');
    bar.setAttribute('data-sk', 'announcementBar');
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Announcement');

    applyAnnouncementBarStyles(bar, cfg);

    const inner = document.createElement('div');
    inner.setAttribute('data-sk-part', 'container');
    applyInnerContainerStyles(inner, cfg);

    // 1. Info group (Location & Contact)
    const hasLocation = Boolean(cfg.locationText && cfg.locationText.trim() !== '');
    const hasContact = Boolean(cfg.contactText && cfg.contactText.trim() !== '');

    if (hasLocation || hasContact) {
      const infoSpan = document.createElement('div');
      infoSpan.setAttribute('data-sk-part', 'info');
      infoSpan.style.display = 'inline-flex';
      infoSpan.style.alignItems = 'center';
      infoSpan.style.flexWrap = 'wrap';
      infoSpan.style.gap = '12px';
      infoSpan.style.fontSize = '13px';

      if (hasLocation) {
        const loc = document.createElement('span');
        loc.textContent = cfg.locationText;
        infoSpan.appendChild(loc);
      }

      if (hasContact) {
        if (cfg.contactUrl && cfg.contactUrl.trim() !== '') {
          const contactLink = document.createElement('a');
          contactLink.href = cfg.contactUrl;
          contactLink.textContent = cfg.contactText;
          contactLink.style.color = 'inherit';
          contactLink.style.textDecoration = 'underline';
          contactLink.style.textUnderlineOffset = '2px';
          infoSpan.appendChild(contactLink);
        } else {
          const contactSpan = document.createElement('span');
          contactSpan.textContent = cfg.contactText;
          infoSpan.appendChild(contactSpan);
        }
      }

      inner.appendChild(infoSpan);
    }

    // 2. Main Announcement Message & CTA Link
    const contentSpan = document.createElement('div');
    contentSpan.setAttribute('data-sk-part', 'message');
    contentSpan.style.display = 'inline-flex';
    contentSpan.style.alignItems = 'center';
    contentSpan.style.justifyContent = 'center';
    contentSpan.style.flexWrap = 'wrap';
    contentSpan.style.gap = '8px';

    const textSpan = document.createElement('span');
    textSpan.textContent = cfg.text;
    contentSpan.appendChild(textSpan);

    if (cfg.linkUrl && cfg.linkUrl.trim() !== '') {
      const link = document.createElement('a');
      link.href = cfg.linkUrl;
      link.textContent = cfg.linkText || 'Learn more';
      link.style.color = 'inherit';
      link.style.fontWeight = '600';
      link.style.textDecoration = 'underline';
      link.style.textUnderlineOffset = '2px';
      contentSpan.appendChild(link);
    }

    inner.appendChild(contentSpan);
    bar.appendChild(inner);

    if (cfg.closable) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.setAttribute('data-act', 'dismiss');
      closeBtn.setAttribute('aria-label', 'Dismiss announcement');
      closeBtn.tabIndex = 0;

      applyDismissButtonStyles(closeBtn);
      closeBtn.appendChild(createSvgClose());

      dismissListener = () => {
        setDismissed();
        this.destroy();
      };
      closeBtn.addEventListener('click', dismissListener);
      bar.appendChild(closeBtn);
      currentDismissBtn = closeBtn;
    }

    document.body.insertBefore(bar, document.body.firstChild);
    barEl = bar;

    // Coordinate with Squarespace 7.1 header to prevent overlap (TC-AB09)
    const header = document.querySelector(SELECTORS.header) as HTMLElement | null;
    if (header) {
      const computed = typeof window !== 'undefined' ? window.getComputedStyle(header) : null;
      const isFixed =
        computed?.position === 'fixed' ||
        computed?.position === 'sticky' ||
        header.style.position === 'fixed' ||
        header.style.position === 'sticky';

      if (isFixed) {
        headerEl = header;
        originalHeaderTop = header.style.top || '';
        const barHeight = Math.max(
          bar.offsetHeight || 0,
          Math.round(bar.getBoundingClientRect().height || 0),
          44
        );

        if (cfg.sticky) {
          header.style.top = `${barHeight}px`;
        } else {
          const updateOffset = () => {
            if (!headerEl) return;
            const scroll = typeof window !== 'undefined' ? window.scrollY || 0 : 0;
            const remaining = Math.max(0, barHeight - scroll);
            headerEl.style.top = `${remaining}px`;
          };
          updateOffset();
          scrollListener = updateOffset;
          window.addEventListener('scroll', scrollListener, { passive: true });
        }
      }
    }
  },

  update(cfg: AnnouncementBarConfig, env: SqspEnv): void {
    if (!cfg.enabled) {
      this.destroy();
      return;
    }

    this.init(cfg, env);
  },

  destroy(): void {
    if (scrollListener && typeof window !== 'undefined') {
      window.removeEventListener('scroll', scrollListener);
      scrollListener = null;
    }

    if (headerEl) {
      if (originalHeaderTop !== null) {
        headerEl.style.top = originalHeaderTop;
      } else {
        headerEl.style.removeProperty('top');
      }
      headerEl = null;
      originalHeaderTop = null;
    }

    if (dismissListener && currentDismissBtn) {
      currentDismissBtn.removeEventListener('click', dismissListener);
      dismissListener = null;
      currentDismissBtn = null;
    }

    if (barEl) {
      barEl.remove();
      barEl = null;
    }

    if (typeof document !== 'undefined') {
      const remaining = document.querySelectorAll('[data-sk="announcementBar"]');
      remaining.forEach((el) => el.remove());
    }
  },
};

// Auto-register if core runtime is already present
if (typeof window !== 'undefined' && window.__SITEKIT__) {
  window.__SITEKIT__.register(announcementBarFeature);
}
