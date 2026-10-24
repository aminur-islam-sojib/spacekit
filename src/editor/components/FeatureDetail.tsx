import type { Feature } from '../../shared/types.js';
import { FieldControl } from './Controls.js';
import { TextEffectsEditor } from './TextEffectsEditor.js';

interface FeatureDetailProps {
  feature: Feature<Record<string, unknown>>;
  config: Record<string, unknown>;
  onBack: () => void;
  onUpdateValue: (key: string, value: unknown) => void;
  onReset: () => void;
}

export function FeatureDetail({
  feature,
  config,
  onBack,
  onUpdateValue,
  onReset,
}: FeatureDetailProps) {
  if (feature.id === 'textEffects') {
    return (
      <TextEffectsEditor
        config={config}
        onBack={onBack}
        onUpdateValue={onUpdateValue}
        onReset={onReset}
      />
    );
  }

  const hasGroups = feature.schema.some((f) => Boolean(f.group));

  const groups: { name: string; fields: typeof feature.schema }[] = [];
  const ungrouped: typeof feature.schema = [];

  if (hasGroups) {
    for (const field of feature.schema) {
      if (field.group) {
        let g = groups.find((item) => item.name === field.group);
        if (!g) {
          g = { name: field.group, fields: [] };
          groups.push(g);
        }
        g.fields.push(field);
      } else {
        ungrouped.push(field);
      }
    }
  }

  return (
    <div>
      <button type="button" class="back" onClick={onBack}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>All features</span>
      </button>
      <h2>{feature.label}</h2>
      <div class="fields">
        {hasGroups ? (
          <>
            {ungrouped.length > 0 && (
              <div class="field-group">
                <div class="field-group-body">
                  {ungrouped.map((field) => (
                    <FieldControl
                      key={field.key}
                      field={field}
                      value={config[field.key] ?? feature.defaults[field.key]}
                      onChange={onUpdateValue}
                    />
                  ))}
                </div>
              </div>
            )}
            {groups.map((group) => (
              <div class="field-group" key={group.name}>
                <div class="field-group-title">{group.name}</div>
                <div class="field-group-body">
                  {group.fields.map((field) => (
                    <FieldControl
                      key={field.key}
                      field={field}
                      value={config[field.key] ?? feature.defaults[field.key]}
                      onChange={onUpdateValue}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          feature.schema.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={config[field.key] ?? feature.defaults[field.key]}
              onChange={onUpdateValue}
            />
          ))
        )}
      </div>
      <button
        type="button"
        class="reset-btn"
        data-act="reset"
        onClick={onReset}
      >
        Reset to defaults
      </button>
    </div>
  );
}
