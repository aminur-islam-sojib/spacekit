import { useEffect, useRef, useState } from 'preact/hooks';
import type { Feature } from '../../shared/types.js';
import { FeatureList } from './FeatureList.js';
import { FeatureDetail } from './FeatureDetail.js';
import type { EditorPosition } from '../state.js';

interface PanelProps {
  open: boolean;
  position: EditorPosition | null;
  activeFeatureId: string | null;
  activeTargetSelector?: string | null;
  searchQuery: string;
  status: string;
  features: Feature<Record<string, unknown>>[];
  getFeatureConfig: (id: string) => Record<string, unknown>;
  onClose: () => void;
  onPositionChange: (pos: EditorPosition) => void;
  onSearchChange: (q: string) => void;
  onSelectFeature: (id: string | null) => void;
  onSelectTargetSelector?: (sel: string | null) => void;
  onUpdateFeatureValue: (feature: Feature<Record<string, unknown>>, key: string, value: unknown) => void;
  onResetFeature: (feature: Feature<Record<string, unknown>>) => void;
  onPublish: () => void;
}

export function Panel({
  open,
  position,
  activeFeatureId,
  activeTargetSelector,
  searchQuery,
  status,
  features,
  getFeatureConfig,
  onClose,
  onPositionChange,
  onSearchChange,
  onSelectFeature,
  onSelectTargetSelector,
  onUpdateFeatureValue,
  onResetFeature,
  onPublish,
}: PanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  // Keyboard shortcut: Esc to close panel when open (TC-E05)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Header dragging with viewport clamping (TC-E06, TC-E07)
  const handlePointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const dx = e.clientX - rect.left;
    const dy = e.clientY - rect.top;

    const onPointerMove = (ev: PointerEvent) => {
      const maxX = Math.max(0, window.innerWidth - rect.width);
      const maxY = Math.max(0, window.innerHeight - 60);

      const newX = Math.min(Math.max(0, ev.clientX - dx), maxX);
      const newY = Math.min(Math.max(0, ev.clientY - dy), maxY);

      panel.style.left = `${newX}px`;
      panel.style.top = `${newY}px`;
      panel.style.right = 'auto';
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      onPositionChange({ x: panel.offsetLeft, y: panel.offsetTop });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleSearchFocus = () => {
    const input = panelRef.current?.querySelector('.search') as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.select();
    }
  };

  const activeFeature = features.find((f) => f.id === activeFeatureId);

  const styleObj: Record<string, string> = {};
  if (position) {
    const maxX = Math.max(0, typeof window !== 'undefined' ? window.innerWidth - 350 : 500);
    const maxY = Math.max(0, typeof window !== 'undefined' ? window.innerHeight - 80 : 500);
    styleObj.left = `${Math.min(position.x, maxX)}px`;
    styleObj.top = `${Math.min(position.y, maxY)}px`;
    styleObj.right = 'auto';
  }

  // Count features with customizations for the notification badge
  const isDirty = status === 'Unsaved changes';
  const dirtyCount =
    features.filter((f) => {
      const cfg = getFeatureConfig(f.id);
      return cfg && Object.keys(cfg).length > 0;
    }).length || 1;

  return (
    <section
      ref={panelRef}
      class="panel"
      role="dialog"
      aria-label="SiteKit"
      hidden={!open}
      style={styleObj}
    >
      <header
        ref={barRef}
        class="bar"
        onPointerDown={handlePointerDown}
      >
        <div class="brand-mark" title="SiteKit">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#0f766e" aria-hidden="true">
            <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
          </svg>
        </div>
        <div class="sp" />
        <div class="header-actions">
          <button
            type="button"
            class="header-icon-btn"
            aria-label="Help & Documentation"
            title="Help"
            onClick={() => setShowHelp((prev) => !prev)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
          <button
            type="button"
            class={`header-icon-btn ${filterActiveOnly ? 'active' : ''}`}
            aria-label="Filter active features"
            title={filterActiveOnly ? 'Showing active features only' : 'Filter features'}
            onClick={() => setFilterActiveOnly((prev) => !prev)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </button>
          <button
            type="button"
            class="header-icon-btn"
            aria-label="Search features"
            title="Search"
            onClick={handleSearchFocus}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button
            type="button"
            class="header-icon-btn"
            data-act="close"
            aria-label="Close panel"
            title="Close"
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {showHelp ? (
        <div class="help-banner">
          <b>SiteKit v0.1.0 • Squarespace Toolkit</b>
          <span>Changes are previewed live and kept in draft until published.</span>
          <span>Press <code>Esc</code> to close this panel anytime.</span>
        </div>
      ) : null}

      <div class="body">
        {activeFeature ? (
          <FeatureDetail
            feature={activeFeature}
            config={getFeatureConfig(activeFeature.id)}
            activeSelector={activeTargetSelector}
            onSelectSelector={onSelectTargetSelector}
            onBack={() => {
              onSelectTargetSelector?.(null);
              onSelectFeature(null);
            }}
            onUpdateValue={(key, val) => onUpdateFeatureValue(activeFeature, key, val)}
            onReset={() => onResetFeature(activeFeature)}
          />
        ) : (
          <FeatureList
            features={features}
            searchQuery={searchQuery}
            filterActiveOnly={filterActiveOnly}
            onSearchChange={onSearchChange}
            onSelectFeature={onSelectFeature}
            getFeatureConfig={getFeatureConfig}
          />
        )}
      </div>

      <footer class="floating-footer">
        <div class="publish-pill-wrapper">
          <button
            type="button"
            class="primary publish-pill"
            aria-label="Publish changes"
            onClick={onPublish}
          >
            <span class="pill-text">Publish</span>
            <span class="pill-divider" aria-hidden="true" />
            <span class="pill-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          {isDirty ? (
            <span class="pill-badge" aria-label={`${dirtyCount} unsaved changes`}>
              {dirtyCount}
            </span>
          ) : null}
        </div>
        <span class="status" aria-live="polite">
          {status}
        </span>
      </footer>
    </section>
  );
}
