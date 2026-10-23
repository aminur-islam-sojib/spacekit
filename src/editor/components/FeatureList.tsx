import type { Feature } from '../../shared/types.js';

interface FeatureListProps {
  features: Feature<Record<string, unknown>>[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectFeature: (id: string) => void;
  getFeatureConfig: (id: string) => Record<string, unknown>;
}

export function FeatureList({
  features,
  searchQuery,
  onSearchChange,
  onSelectFeature,
  getFeatureConfig,
}: FeatureListProps) {
  const query = searchQuery.toLowerCase().trim();
  const filtered = features.filter((f) => f.label.toLowerCase().includes(query));

  return (
    <div>
      <h2>Features</h2>
      <input
        class="search"
        type="search"
        placeholder="Search features..."
        aria-label="Search features"
        value={searchQuery}
        onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
      />
      <ul class="items">
        {filtered.length > 0 ? (
          filtered.map((f) => {
            const cfg = getFeatureConfig(f.id);
            const isEnabled = Boolean(cfg.enabled);
            return (
              <li key={f.id}>
                <button
                  type="button"
                  data-open={f.id}
                  onClick={() => onSelectFeature(f.id)}
                >
                  <span>{f.label}</span>
                  <span class={`badge ${isEnabled ? 'on' : 'off'}`}>
                    {isEnabled ? 'On' : 'Off'}
                  </span>
                </button>
              </li>
            );
          })
        ) : (
          <li class="empty">No features match your search.</li>
        )}
      </ul>
    </div>
  );
}
