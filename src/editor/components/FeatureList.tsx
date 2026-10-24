import type { Feature } from '../../shared/types.js';

interface FeatureListProps {
  features: Feature<Record<string, unknown>>[];
  searchQuery: string;
  filterActiveOnly?: boolean;
  onSearchChange: (q: string) => void;
  onSelectFeature: (id: string) => void;
  getFeatureConfig: (id: string) => Record<string, unknown>;
}

function renderFeatureIcon(id: string) {
  switch (id) {
    case 'buttonStyles':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="6" width="18" height="12" rx="4" />
          <path d="M8 12h8" />
        </svg>
      );
    case 'textEffects':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      );
    case 'announcementBar':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 11 18-5v12L3 13v-2z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    case 'backToTop':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="16 12 12 8 8 12" />
          <line x1="12" y1="16" x2="12" y2="8" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
  }
}

const CATEGORY_MAP: Record<string, string> = {
  buttonStyles: 'Styling & Effects',
  textEffects: 'Styling & Effects',
  backToTop: 'Navigation & Utility',
  announcementBar: 'Announcements & Marketing',
};

const CATEGORY_ORDER = [
  'Styling & Effects',
  'Navigation & Utility',
  'Announcements & Marketing',
  'Other Features',
];

export function FeatureList({
  features,
  searchQuery,
  filterActiveOnly = false,
  onSearchChange,
  onSelectFeature,
  getFeatureConfig,
}: FeatureListProps) {
  const query = searchQuery.toLowerCase().trim();

  let filtered = features;
  if (filterActiveOnly) {
    filtered = filtered.filter((f) => {
      const cfg = getFeatureConfig(f.id);
      return Boolean(cfg.enabled);
    });
  }

  if (query) {
    filtered = filtered.filter((f) => f.label.toLowerCase().includes(query));
  }

  // Group by category
  const groups: { name: string; features: Feature<Record<string, unknown>>[] }[] = [];
  for (const cat of CATEGORY_ORDER) {
    const matching = filtered.filter((f) => (CATEGORY_MAP[f.id] || 'Other Features') === cat);
    if (matching.length > 0) {
      groups.push({ name: cat, features: matching });
    }
  }

  return (
    <div>
      <div class="features-header-area">
        <h2 class="features-title">Features</h2>
        <div class="search-box">
          <svg
            class="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            class="search"
            type="search"
            placeholder="Search features..."
            aria-label="Search features"
            value={searchQuery}
            onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
          />
          {searchQuery ? (
            <button
              type="button"
              class="search-clear-btn"
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
            >
              &#10005;
            </button>
          ) : null}
        </div>
      </div>

      <ul class="items">
        {filtered.length === 0 ? (
          <li class="empty">No features match your search.</li>
        ) : (
          groups.map((group) => (
            <li key={group.name} class="category-group">
              <div class="category-header">{group.name}</div>
              <ul class="sub-items">
                {group.features.map((f) => {
                  const cfg = getFeatureConfig(f.id);
                  const isEnabled = Boolean(cfg.enabled);
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        data-open={f.id}
                        onClick={() => onSelectFeature(f.id)}
                      >
                        <div class="item-icon">{renderFeatureIcon(f.id)}</div>
                        <span class="item-title">{f.label}</span>
                        <div class="item-right">
                          <span class={`badge ${isEnabled ? 'on' : 'off'}`}>
                            {isEnabled ? 'On' : 'Off'}
                          </span>
                          <svg
                            class="chevron"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
