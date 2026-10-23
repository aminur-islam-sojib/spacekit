import type { Feature } from '../../shared/types.js';
import { FieldControl } from './Controls.js';

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
  return (
    <div>
      <button type="button" class="back" onClick={onBack}>
        &lsaquo; All features
      </button>
      <h2>{feature.label}</h2>
      <div class="fields">
        {feature.schema.map((field) => (
          <FieldControl
            key={field.key}
            field={field}
            value={config[field.key] ?? feature.defaults[field.key]}
            onChange={onUpdateValue}
          />
        ))}
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
