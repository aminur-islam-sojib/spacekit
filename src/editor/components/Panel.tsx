import { useEffect, useRef } from 'preact/hooks';
import type { Feature } from '../../shared/types.js';
import { FeatureList } from './FeatureList.js';
import { FeatureDetail } from './FeatureDetail.js';
import type { EditorPosition } from '../state.js';

interface PanelProps {
  open: boolean;
  position: EditorPosition | null;
  activeFeatureId: string | null;
  searchQuery: string;
  status: string;
  features: Feature<Record<string, unknown>>[];
  getFeatureConfig: (id: string) => Record<string, unknown>;
  onClose: () => void;
  onPositionChange: (pos: EditorPosition) => void;
  onSearchChange: (q: string) => void;
  onSelectFeature: (id: string | null) => void;
  onUpdateFeatureValue: (feature: Feature<Record<string, unknown>>, key: string, value: unknown) => void;
  onResetFeature: (feature: Feature<Record<string, unknown>>) => void;
  onPublish: () => void;
}

export function Panel({
  open,
  position,
  activeFeatureId,
  searchQuery,
  status,
  features,
  getFeatureConfig,
  onClose,
  onPositionChange,
  onSearchChange,
  onSelectFeature,
  onUpdateFeatureValue,
  onResetFeature,
  onPublish,
}: PanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLElement>(null);

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

  const activeFeature = features.find((f) => f.id === activeFeatureId);

  const styleObj: Record<string, string> = {};
  if (position) {
    const maxX = Math.max(0, typeof window !== 'undefined' ? window.innerWidth - 340 : 500);
    const maxY = Math.max(0, typeof window !== 'undefined' ? window.innerHeight - 80 : 500);
    styleObj.left = `${Math.min(position.x, maxX)}px`;
    styleObj.top = `${Math.min(position.y, maxY)}px`;
    styleObj.right = 'auto';
  }

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
        <b>SiteKit</b>
        <span class="sp" />
        <button
          type="button"
          data-act="close"
          aria-label="Close panel"
          onClick={onClose}
        >
          &#10005;
        </button>
      </header>
      <div class="body">
        {activeFeature ? (
          <FeatureDetail
            feature={activeFeature}
            config={getFeatureConfig(activeFeature.id)}
            onBack={() => onSelectFeature(null)}
            onUpdateValue={(key, val) => onUpdateFeatureValue(activeFeature, key, val)}
            onReset={() => onResetFeature(activeFeature)}
          />
        ) : (
          <FeatureList
            features={features}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSelectFeature={onSelectFeature}
            getFeatureConfig={getFeatureConfig}
          />
        )}
      </div>
      <footer>
        <span class="status" aria-live="polite">
          {status}
        </span>
        <button type="button" class="primary" onClick={onPublish}>
          Publish changes
        </button>
      </footer>
    </section>
  );
}
