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

function createAnnouncementIcon(icon: string): SVGElement | null {
  if (icon === 'none') {
    return null;
  }

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('data-sk-part', 'icon');
  svg.style.flexShrink = '0';
  svg.style.marginRight = '2px';

  let pathData = '';
  switch (icon) {
    case 'megaphone':
      pathData = 'M3 11l18-5v12L3 13v-2zm8-5v12M6 13v6a2 2 0 002 2h0a2 2 0 002-2v-6';
      break;
    case 'tag':
      pathData = 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01';
      break;
    case 'bell':
      pathData = 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0';
      break;
    case 'star':
      pathData = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
      break;
    case 'info':
      pathData = 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01';
      break;
    default:
      return null;
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  svg.appendChild(path);

  return svg;
}

function createLocationIcon(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '15');
  svg.setAttribute('height', '15');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('data-sk-part', 'location-icon');
  svg.style.flexShrink = '0';
  svg.style.marginRight = '4px';

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z');
  svg.appendChild(path);

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '10');
  circle.setAttribute('r', '3');
  svg.appendChild(circle);

  return svg;
}

function createContactIcon(type: string): SVGElement | null {
  if (type === 'none') return null;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '15');
  svg.setAttribute('height', '15');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('data-sk-part', 'contact-icon');
  svg.style.flexShrink = '0';
  svg.style.marginRight = '4px';

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  if (type === 'email') {
    path.setAttribute(
      'd',
      'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm18 2l-10 7L2 6'
    );
  } else {
    path.setAttribute(
      'd',
      'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z'
    );
  }
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
        loc.style.display = 'inline-flex';
        loc.style.alignItems = 'center';

        if (cfg.showLocationIcon !== false) {
          loc.appendChild(createLocationIcon());
        }

        const locText = document.createElement('span');
        locText.textContent = cfg.locationText;
        loc.appendChild(locText);
        infoSpan.appendChild(loc);
      }

      if (hasContact) {
        const contactIconType = cfg.contactIcon || (cfg.contactUrl?.startsWith('mailto:') ? 'email' : 'phone');

        if (cfg.contactUrl && cfg.contactUrl.trim() !== '') {
          const contactLink = document.createElement('a');
          contactLink.href = cfg.contactUrl;
          contactLink.style.display = 'inline-flex';
          contactLink.style.alignItems = 'center';
          contactLink.style.color = 'inherit';
          contactLink.style.textDecoration = 'underline';
          contactLink.style.textUnderlineOffset = '2px';

          const icon = createContactIcon(contactIconType);
          if (icon) {
            contactLink.appendChild(icon);
          }

          const cText = document.createElement('span');
          cText.textContent = cfg.contactText;
          contactLink.appendChild(cText);
          infoSpan.appendChild(contactLink);
        } else {
          const contactSpan = document.createElement('span');
          contactSpan.style.display = 'inline-flex';
          contactSpan.style.alignItems = 'center';

          const icon = createContactIcon(contactIconType);
          if (icon) {
            contactSpan.appendChild(icon);
          }

          const cText = document.createElement('span');
          cText.textContent = cfg.contactText;
          contactSpan.appendChild(cText);
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

    const iconEl = createAnnouncementIcon(cfg.icon || 'megaphone');
    if (iconEl) {
      contentSpan.appendChild(iconEl);
    }

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
