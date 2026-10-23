/*! SiteKit v1.0.0 - personal Squarespace toolkit (own code, MIT-style use) */
(() => {
  'use strict';
  if (window.__SITEKIT__) return;
  window.__SITEKIT__ = true;

  const script = document.currentScript;
  const CONFIG_URL = script?.dataset.config || '';

  /* ---------- tiny storage helper (per-host keys) ---------- */
  const K = (s) => `sitekit:${s}:${location.hostname}`;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(K(k))) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(K(k), JSON.stringify(v)); } catch {} },
  };

  /* ---------- FEATURES: add new ones here, panel builds itself ---------- */
  let bttCleanup = () => {};
  const FEATURES = {
    backToTop: {
      label: 'Back to top button',
      hint: 'A floating button that returns visitors to the top of the page.',
      defaults: { enabled: false, side: 'right', offsetX: 24, offsetY: 24, size: 48,
                  radius: 50, bg: '#0f766e', fg: '#ffffff', showAfter: 400, smooth: true },
      fields: [
        { key: 'enabled', type: 'toggle', label: 'Show button' },
        { key: 'side', type: 'select', label: 'Side', options: ['left', 'right'] },
        { key: 'offsetX', type: 'range', label: 'Distance from side', min: 0, max: 120, unit: 'px' },
        { key: 'offsetY', type: 'range', label: 'Distance from bottom', min: 0, max: 120, unit: 'px' },
        { key: 'size', type: 'range', label: 'Size', min: 32, max: 80, unit: 'px' },
        { key: 'radius', type: 'range', label: 'Roundness', min: 0, max: 50, unit: '%' },
        { key: 'bg', type: 'color', label: 'Background' },
        { key: 'fg', type: 'color', label: 'Arrow color' },
        { key: 'showAfter', type: 'range', label: 'Appear after scrolling', min: 0, max: 1500, unit: 'px' },
        { key: 'smooth', type: 'toggle', label: 'Smooth scroll' },
      ],
      apply(c) {
        bttCleanup(); bttCleanup = () => {};
        if (!c.enabled) return;
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Back to top');
        b.dataset.sitekit = 'back-to-top';
        b.innerHTML = '<svg viewBox="0 0 24 24" width="50%" height="50%" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
        Object.assign(b.style, {
          position: 'fixed', bottom: c.offsetY + 'px', [c.side]: c.offsetX + 'px',
          width: c.size + 'px', height: c.size + 'px', borderRadius: c.radius + '%',
          background: c.bg, color: c.fg, border: '0', padding: '0', cursor: 'pointer',
          display: 'grid', placeItems: 'center', zIndex: '2147483000',
          boxShadow: '0 6px 20px rgba(0,0,0,.25)', transition: 'opacity .25s, transform .25s',
        });
        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const update = () => {
          const on = scrollY > c.showAfter;
          b.style.opacity = on ? '1' : '0';
          b.style.transform = on ? 'none' : 'translateY(8px)';
          b.style.pointerEvents = on ? 'auto' : 'none';
        };
        b.addEventListener('click', () => scrollTo({ top: 0, behavior: c.smooth && !reduce ? 'smooth' : 'auto' }));
        addEventListener('scroll', update, { passive: true });
        document.body.appendChild(b);
        update();
        bttCleanup = () => { removeEventListener('scroll', update); b.remove(); };
      },
    },
  };

  /* ---------- state ---------- */
  let state = { features: {} };
  const cfg = (n) => ({ ...FEATURES[n].defaults, ...(state.features[n] || {}) });
  const applyOne = (n) => { try { FEATURES[n].apply(cfg(n)); } catch (e) { console.warn('[sitekit]', n, e); } };
  const applyAll = () => Object.keys(FEATURES).forEach(applyOne);

  /* ---------- editor detection ----------
     Verify in DevTools what your editor exposes; this is a safe default:
     same-origin iframe (Squarespace preview) or ?sitekit=edit / #sitekit-edit */
  // body.sqs-edit-mode is added by Squarespace while you are inside the site editor/backend.
  // It is community-documented, NOT part of Squarespace's official Custom Code Specification,
  // so it is isolated here in one place. ?sitekit=edit is a manual fallback.
  const isEditor = () => {
    const flag = new URLSearchParams(location.search).get('sitekit') === 'edit' || location.hash === '#sitekit-edit';
    return flag || document.body.classList.contains('sqs-edit-mode');
  };

  /* ---------- panel ---------- */
  const CSS = `
  :host{all:initial}
  *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
  .fab{position:fixed;right:20px;bottom:20px;width:44px;height:44px;border-radius:14px;border:0;background:#0f766e;color:#fff;font-size:20px;cursor:pointer;box-shadow:0 8px 24px rgba(15,118,110,.4)}
  .fab:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #0f766e;outline-offset:2px}
  .panel{position:fixed;top:24px;right:24px;width:320px;max-height:min(580px,calc(100vh - 48px));display:flex;flex-direction:column;background:#fff;color:#1c2528;border-radius:20px;box-shadow:0 20px 60px rgba(10,30,32,.28),0 0 0 1px rgba(10,30,32,.06)}
  .panel[hidden]{display:none}
  .bar{display:flex;align-items:center;gap:8px;padding:14px 16px;cursor:grab;touch-action:none;user-select:none;border-bottom:1px solid #e6ecec}
  .bar:active{cursor:grabbing}
  .bar b{font-size:14px;letter-spacing:.2px}.sp{flex:1}
  .bar button{border:0;background:none;font-size:16px;cursor:pointer;color:#5a6a6d;border-radius:8px;padding:4px 8px}
  .body{padding:16px;overflow:auto;flex:1}
  h2{font-size:20px;margin:0 0 12px}
  .search{width:100%;padding:10px 12px;border:1px solid #d5dede;border-radius:10px;font-size:14px;margin-bottom:8px}
  .items{list-style:none;margin:0;padding:0}
  .items button{width:100%;display:flex;justify-content:space-between;align-items:center;padding:13px 4px;border:0;border-bottom:1px solid #e6ecec;background:none;font-size:14px;cursor:pointer;text-align:left;color:inherit}
  .items small{color:#5a6a6d}.empty{padding:12px 4px;color:#5a6a6d;font-size:14px}
  .back,.link{border:0;background:none;color:#0f766e;font-size:13px;cursor:pointer;padding:0;margin-bottom:10px}
  .link{margin:16px 0 0}
  .hint{margin:-6px 0 14px;color:#5a6a6d;font-size:13px;line-height:1.45}
  label{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;font-size:13px}
  label.row{flex-direction:row;justify-content:space-between;align-items:center}
  label span{display:flex;justify-content:space-between}
  input[type=range],select{width:100%}
  input[type=color]{width:100%;height:34px;border:1px solid #d5dede;border-radius:8px;padding:2px;background:#fff}
  input[type=checkbox]{width:18px;height:18px;accent-color:#0f766e}
  select{padding:8px;border:1px solid #d5dede;border-radius:8px;font-size:13px}
  input[type=range]{accent-color:#0f766e}
  footer{display:flex;align-items:center;gap:10px;padding:12px 16px;border-top:1px solid #e6ecec}
  .status{flex:1;font-size:12px;color:#5a6a6d}
  .primary{border:0;background:#0f766e;color:#fff;font-size:13px;padding:9px 16px;border-radius:10px;cursor:pointer}
  @media (max-width:480px){.panel{left:12px!important;right:12px!important;width:auto}}`;

  function control(f, v) {
    const k = `data-k="${f.key}"`;
    if (f.type === 'toggle') return `<label class="row"><span>${f.label}</span><input type="checkbox" ${k} ${v ? 'checked' : ''}></label>`;
    if (f.type === 'range') return `<label><span>${f.label}<b>${v}${f.unit || ''}</b></span><input type="range" ${k} data-unit="${f.unit || ''}" min="${f.min}" max="${f.max}" value="${v}"></label>`;
    if (f.type === 'color') return `<label>${f.label}<input type="color" ${k} value="${v}"></label>`;
    if (f.type === 'select') return `<label>${f.label}<select ${k}>${f.options.map(o => `<option ${o === v ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;
    return '';
  }

  function mountPanel() {
    const host = document.createElement('div');
    host.id = 'sitekit-host';
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style>
      <button class="fab" aria-label="Open SiteKit">&#10022;</button>
      <section class="panel" role="dialog" aria-label="SiteKit" hidden>
        <header class="bar"><b>SiteKit</b><span class="sp"></span><button data-act="close" aria-label="Close panel">&#10005;</button></header>
        <div class="body"></div>
        <footer><span class="status" aria-live="polite"></span><button class="primary" data-act="publish">Publish changes</button></footer>
      </section>`;
    const $ = (s) => root.querySelector(s);
    const panel = $('.panel'), body = $('.body'), bar = $('.bar'), status = $('.status'), fab = $('.fab');
    const setStatus = (t) => { status.textContent = t; };
    const dirty = () => { store.set('draft', state); setStatus('Unsaved changes'); };

    function renderList() {
      body.dataset.feature = '';
      body.innerHTML = '<h2>Features</h2><input class="search" type="search" placeholder="Search features" aria-label="Search features"><ul class="items"></ul>';
      const ul = body.querySelector('.items'), q = body.querySelector('.search');
      const draw = () => {
        const t = q.value.toLowerCase();
        ul.innerHTML = Object.entries(FEATURES).filter(([, f]) => f.label.toLowerCase().includes(t))
          .map(([k, f]) => `<li><button data-open="${k}"><span>${f.label}</span><small>${cfg(k).enabled ? 'On' : 'Off'}</small></button></li>`).join('')
          || '<li class="empty">No features match your search.</li>';
      };
      q.addEventListener('input', draw); draw();
    }
    function renderDetail(n) {
      const f = FEATURES[n], c = cfg(n);
      body.dataset.feature = n;
      body.innerHTML = `<button class="back" data-act="back">&lsaquo; All features</button><h2>${f.label}</h2><p class="hint">${f.hint}</p>`
        + f.fields.map((fl) => control(fl, c[fl.key])).join('')
        + '<button class="link" data-act="reset">Reset to defaults</button>';
    }

    root.addEventListener('click', (e) => {
      const open = e.target.closest('[data-open]');
      if (open) return renderDetail(open.dataset.open);
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') renderList();
      if (act === 'close') { panel.hidden = true; store.set('open', false); }
      if (act === 'reset') { const n = body.dataset.feature; delete state.features[n]; applyOne(n); renderDetail(n); dirty(); }
      if (act === 'publish') publish();
    });
    fab.addEventListener('click', () => { panel.hidden = !panel.hidden; store.set('open', !panel.hidden); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { panel.hidden = true; store.set('open', false); } });

    body.addEventListener('input', (e) => {
      const el = e.target.closest('[data-k]'); if (!el) return;
      const n = body.dataset.feature;
      const v = el.type === 'checkbox' ? el.checked : el.type === 'range' ? Number(el.value) : el.value;
      (state.features[n] ||= {})[el.dataset.k] = v;
      if (el.type === 'range') el.closest('label').querySelector('b').textContent = v + el.dataset.unit;
      applyOne(n); dirty();
    });

    /* drag by header */
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      const r = panel.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
      bar.setPointerCapture(e.pointerId);
      const move = (ev) => {
        panel.style.left = Math.min(Math.max(0, ev.clientX - dx), innerWidth - r.width) + 'px';
        panel.style.top = Math.min(Math.max(0, ev.clientY - dy), innerHeight - 60) + 'px';
        panel.style.right = 'auto';
      };
      const up = () => {
        bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up);
        store.set('pos', { x: panel.offsetLeft, y: panel.offsetTop });
      };
      bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up);
    });
    const pos = store.get('pos', null);
    if (pos) Object.assign(panel.style, { left: Math.min(pos.x, innerWidth - 340) + 'px', top: Math.min(pos.y, innerHeight - 80) + 'px', right: 'auto' });

    async function publish() {
      if (!CONFIG_URL) return setStatus('Saved in this browser only. Add data-config to publish.');
      const token = store.get('token', '') || prompt('Admin token');
      if (!token) return setStatus('Publish cancelled.');
      try {
        const r = await fetch(CONFIG_URL, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(state) });
        if (!r.ok) throw new Error(r.status);
        store.set('token', token); store.set('draft', null); setStatus('Published.');
      } catch (err) {
        if (String(err.message) === '401') store.set('token', '');
        setStatus(`Publish failed (${err.message}). Check your token and connection.`);
      }
    }

    renderList();
    panel.hidden = !store.get('open', false);
  }

  /* ---------- boot ---------- */
  async function boot() {
    if (CONFIG_URL) {
      try { const r = await fetch(CONFIG_URL, { cache: 'no-cache' }); if (r.ok) state = await r.json(); }
      catch (e) { console.warn('[sitekit] config fetch failed', e); }
    }
    state.features ||= {};
    applyAll();
    let mounted = false;
    const tryMount = () => {
      if (mounted || !isEditor()) return;
      mounted = true;
      const draft = store.get('draft', null);
      if (draft) { state = draft; state.features ||= {}; applyAll(); }
      mountPanel();
    };
    tryMount();
    // Squarespace may add the editor class after our script runs
    new MutationObserver(tryMount).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot();
})();
