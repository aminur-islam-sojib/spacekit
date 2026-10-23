import { useEffect, useState } from 'preact/hooks';
import type { EditorStore } from '../state.js';
import { registry } from '../../core/index.js';
import { Launcher } from './Launcher.js';
import { Panel } from './Panel.js';

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

  return (
    <>
      <Launcher open={state.open} onToggle={() => store.toggleOpen()} />
      <Panel
        open={state.open}
        position={state.position}
        activeFeatureId={state.activeFeatureId}
        searchQuery={state.searchQuery}
        status={state.status}
        features={features}
        getFeatureConfig={(id) => state.draft.features?.[id] || {}}
        onClose={() => store.setOpen(false)}
        onPositionChange={(pos) => store.setPosition(pos)}
        onSearchChange={(q) => store.setSearchQuery(q)}
        onSelectFeature={(id) => store.setActiveFeatureId(id)}
        onUpdateFeatureValue={(feat, key, val) => store.updateFeatureValue(feat, key, val, env)}
        onResetFeature={(feat) => store.resetFeature(feat, env)}
        onPublish={() => store.publish()}
      />
    </>
  );
}
