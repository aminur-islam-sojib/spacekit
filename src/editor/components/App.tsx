import { useEffect, useState } from 'preact/hooks';
import type { EditorStore } from '../state.js';
import { registry } from '../../core/index.js';
import { Launcher } from './Launcher.js';
import { Panel } from './Panel.js';
import {
  startInspector,
  type PickedTarget,
  setActiveCanvasSelection,
  clearActiveCanvasSelection,
} from '../picker.js';
import { createDefaultButtonRule, type ButtonStylesConfig } from '../../features/buttonStyles/schema.js';
import { createDefaultTextRule, type TextEffectsConfig } from '../../features/textEffects/schema.js';

interface AppProps {
  store: EditorStore;
}

export function App({ store }: AppProps) {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    return store.subscribe(() => {
      setState({ ...store.getState() });
    });
  }, [store]);

  const features = registry.getAll();
  const env = { isEditor: true, isEditorActive: false };

  // Universal Auto-Inspector: when panel is open, hovering over buttons or text
  // allows instant single-click selection to edit that specific element
  useEffect(() => {
    if (!state.open) return;

    const cleanup = startInspector({
      onSelect: (target: PickedTarget) => {
        const currentDraft = store.getState().draft;
        if (target.kind === 'button') {
          const feat = registry.get('buttonStyles');
          if (feat) {
            const currentCfg = (currentDraft.features?.buttonStyles || {}) as ButtonStylesConfig;
            const currentRules = Array.isArray(currentCfg.rules) ? currentCfg.rules : [];
            const exists = currentRules.some((r) => r.selector === target.selector);
            if (!exists) {
              const newRule = {
                ...createDefaultButtonRule(),
                selector: target.selector,
                label: target.label,
              };
              store.updateFeatureValue(feat, 'rules', [...currentRules, newRule], env);
            }
            if (!currentCfg.enabled) {
              store.updateFeatureValue(feat, 'enabled', true, env);
            }
            store.setActiveTargetSelector(target.selector);
            store.setActiveFeatureId('buttonStyles');
          }
        } else if (target.kind === 'text') {
          const feat = registry.get('textEffects');
          if (feat) {
            const currentCfg = (currentDraft.features?.textEffects || {}) as TextEffectsConfig;
            const currentRules = Array.isArray(currentCfg.rules) ? currentCfg.rules : [];
            const exists = currentRules.some((r) => r.selector === target.selector);
            if (!exists) {
              const newRule = {
                ...createDefaultTextRule(),
                selector: target.selector,
                label: target.label,
              };
              store.updateFeatureValue(feat, 'rules', [...currentRules, newRule], env);
            }
            if (!currentCfg.enabled) {
              store.updateFeatureValue(feat, 'enabled', true, env);
            }
            store.setActiveTargetSelector(target.selector);
            store.setActiveFeatureId('textEffects');
          }
        }
      },
    });

    return () => cleanup();
  }, [state.open]);

  // Synchronize on-canvas selection frame with active target
  useEffect(() => {
    if (!state.open || !state.activeTargetSelector) {
      clearActiveCanvasSelection();
      return;
    }

    const btnRules = (state.draft.features?.buttonStyles?.rules as Array<{ selector: string; label: string }>) || [];
    const txtRules = (state.draft.features?.textEffects?.rules as Array<{ selector: string; label: string }>) || [];
    const found = [...btnRules, ...txtRules].find((r) => r.selector === state.activeTargetSelector);
    const label = found?.label || 'Selected Element';

    setActiveCanvasSelection(state.activeTargetSelector, label, () => {
      store.setActiveTargetSelector(null);
    });

    return () => {
      clearActiveCanvasSelection();
    };
  }, [state.open, state.activeTargetSelector, state.draft]);

  return (
    <>
      <Launcher open={state.open} onToggle={() => store.toggleOpen()} />
      <Panel
        open={state.open}
        position={state.position}
        activeFeatureId={state.activeFeatureId}
        activeTargetSelector={state.activeTargetSelector}
        searchQuery={state.searchQuery}
        status={state.status}
        features={features}
        getFeatureConfig={(id) => state.draft.features?.[id] || {}}
        onClose={() => {
          store.setActiveTargetSelector(null);
          store.setOpen(false);
        }}
        onPositionChange={(pos) => store.setPosition(pos)}
        onSearchChange={(q) => store.setSearchQuery(q)}
        onSelectFeature={(id) => {
          if (!id) store.setActiveTargetSelector(null);
          store.setActiveFeatureId(id);
        }}
        onSelectTargetSelector={(sel) => store.setActiveTargetSelector(sel)}
        onUpdateFeatureValue={(feat, key, val) => store.updateFeatureValue(feat, key, val, env)}
        onResetFeature={(feat) => {
          store.setActiveTargetSelector(null);
          store.resetFeature(feat, env);
        }}
        onPublish={() => store.publish()}
      />
    </>
  );
}
