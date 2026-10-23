export type FieldType = 'toggle' | 'range' | 'color' | 'select' | 'text';

export interface FieldBase {
  key: string;
  label: string;
  type: FieldType;
  group?: string;
}

export interface ToggleField extends FieldBase {
  type: 'toggle';
}

export interface RangeField extends FieldBase {
  type: 'range';
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export interface ColorField extends FieldBase {
  type: 'color';
}

export interface SelectField extends FieldBase {
  type: 'select';
  options: string[];
}

export interface TextField extends FieldBase {
  type: 'text';
  maxLength?: number;
}

export type Field = ToggleField | RangeField | ColorField | SelectField | TextField;

export interface SqspEnv {
  isEditor: boolean;
  isEditorActive: boolean;
  version?: string;
}

export interface ProbeResult {
  ok: boolean;
  reason?: string;
}

export interface Feature<C = Record<string, unknown>> {
  id: string;
  label: string;
  version: number;
  schema: Field[];
  defaults: C;
  migrate?(old: unknown, from: number): C;
  probe?(env: SqspEnv): ProbeResult;
  init(cfg: C, env: SqspEnv): void;
  update(cfg: C, env: SqspEnv): void;
  destroy(): void;
}

export interface SiteKitConfig {
  schemaVersion: number;
  revision: number;
  updatedAt: string;
  disabled: boolean;
  features: Record<string, Record<string, unknown>>;
  targets?: Record<string, unknown>;
}

