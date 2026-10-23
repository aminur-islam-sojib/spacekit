import type { Field } from '../../shared/types.js';

interface ControlProps {
  field: Field;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
}

export function FieldControl({ field, value, onChange }: ControlProps) {
  switch (field.type) {
    case 'toggle': {
      const checked = Boolean(value);
      return (
        <label class="row">
          <span>{field.label}</span>
          <input
            type="checkbox"
            data-k={field.key}
            checked={checked}
            onChange={(e) => onChange(field.key, (e.target as HTMLInputElement).checked)}
          />
        </label>
      );
    }
    case 'range': {
      const num = typeof value === 'number' ? value : field.min;
      const unit = field.unit || '';
      return (
        <label>
          <span>
            {field.label} <b>{num}{unit}</b>
          </span>
          <input
            type="range"
            data-k={field.key}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            value={num}
            onInput={(e) => onChange(field.key, Number((e.target as HTMLInputElement).value))}
          />
        </label>
      );
    }
    case 'color': {
      const hex = typeof value === 'string' ? value : '#000000';
      return (
        <label>
          <span>{field.label}</span>
          <input
            type="color"
            data-k={field.key}
            value={hex}
            onInput={(e) => onChange(field.key, (e.target as HTMLInputElement).value)}
          />
        </label>
      );
    }
    case 'select': {
      const str = typeof value === 'string' ? value : field.options[0];
      return (
        <label>
          <span>{field.label}</span>
          <select
            data-k={field.key}
            value={str}
            onChange={(e) => onChange(field.key, (e.target as HTMLSelectElement).value)}
          >
            {field.options.map((opt) => (
              <option key={opt} value={opt} selected={opt === str}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      );
    }
    case 'text': {
      const text = typeof value === 'string' ? value : '';
      return (
        <label>
          <span>{field.label}</span>
          <input
            type="text"
            data-k={field.key}
            maxLength={field.maxLength}
            value={text}
            onInput={(e) => onChange(field.key, (e.target as HTMLInputElement).value)}
          />
        </label>
      );
    }
    default:
      return null;
  }
}
