import { useState } from 'preact/hooks';
import type { StyledButtonRule, ButtonStylesConfig } from '../../features/buttonStyles/schema.js';
import { createDefaultButtonRule } from '../../features/buttonStyles/schema.js';
import { startPicker } from '../picker.js';

interface ButtonStylesEditorProps {
  config: Record<string, unknown>;
  activeSelector?: string | null;
  onSelectSelector?: (sel: string | null) => void;
  onBack: () => void;
  onUpdateValue: (key: string, value: unknown) => void;
  onReset: () => void;
}

export function ButtonStylesEditor({
  config,
  activeSelector,
  onSelectSelector,
  onBack,
  onUpdateValue,
  onReset,
}: ButtonStylesEditorProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const cfg = config as unknown as ButtonStylesConfig;
  const enabled = Boolean(cfg.enabled);
  const rules = Array.isArray(cfg.rules) ? cfg.rules : [];

  // Determine which rule is actively being edited
  const activeRule = activeSelector
    ? rules.find((r) => r.selector === activeSelector) || null
    : null;

  const handlePickNew = () => {
    setIsPicking(true);

    startPicker({
      filterKind: 'button',
      onSelect: (target) => {
        setIsPicking(false);
        const existingRule = rules.find((r) => r.selector === target.selector);
        if (existingRule) {
          onSelectSelector?.(existingRule.selector);
          return;
        }

        const newRule: StyledButtonRule = {
          ...createDefaultButtonRule(),
          selector: target.selector,
          label: target.label,
        };
        const nextRules = [...rules, newRule];
        onUpdateValue('rules', nextRules);
        if (!enabled) {
          onUpdateValue('enabled', true);
        }
        onSelectSelector?.(newRule.selector);
      },
      onCancel: () => {
        setIsPicking(false);
      },
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    const nextRules = rules.filter((r) => r.id !== ruleId);
    onUpdateValue('rules', nextRules);
    if (activeRule && activeRule.id === ruleId) {
      onSelectSelector?.(null);
    }
  };

  const handleUpdateActiveRule = <K extends keyof StyledButtonRule>(
    key: K,
    val: StyledButtonRule[K]
  ) => {
    if (!activeRule) return;
    const nextRules = rules.map((r) => (r.id === activeRule.id ? { ...r, [key]: val } : r));
    onUpdateValue('rules', nextRules);
  };

  return (
    <div class="button-styles-editor">
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

      <div class="detail-header-row">
        <h2 class="detail-title">Button</h2>
        {activeRule ? (
          <div class="editing-badge">
            <span>Editing: {activeRule.label.length > 18 ? `${activeRule.label.slice(0, 18)}…` : activeRule.label}</span>
            <button
              type="button"
              class="editing-done-btn"
              onClick={() => onSelectSelector?.(null)}
              title="Deselect this button"
            >
              Done
            </button>
          </div>
        ) : null}
      </div>

      {/* Activation card */}
      <div class="field-group">
        <label class="row">
          <span>Enable custom button designs</span>
          <input
            type="checkbox"
            data-k="enabled"
            checked={enabled}
            onChange={(e) => onUpdateValue('enabled', (e.target as HTMLInputElement).checked)}
          />
        </label>
      </div>

      {activeRule ? (
        /* SINGLE FOCUSED ELEMENT PROPERTY INSPECTOR */
        <div class="focused-inspector">
          {/* Shape & Border */}
          <div class="field-group">
            <div class="field-group-title">Shape & Border</div>
            <label>
              <span>
                Corner roundness <b>{activeRule.radius}px</b>
              </span>
              <input
                type="range"
                min="0"
                max="50"
                value={activeRule.radius}
                onInput={(e) =>
                  handleUpdateActiveRule(
                    'radius',
                    Number((e.target as HTMLInputElement).value)
                  )
                }
              />
            </label>
            <label>
              <span>
                Border thickness <b>{activeRule.borderWidth}px</b>
              </span>
              <input
                type="range"
                min="0"
                max="6"
                value={activeRule.borderWidth}
                onInput={(e) =>
                  handleUpdateActiveRule(
                    'borderWidth',
                    Number((e.target as HTMLInputElement).value)
                  )
                }
              />
            </label>
            {activeRule.borderWidth > 0 && (
              <>
                <label>
                  <span>Border style</span>
                  <select
                    value={activeRule.borderStyle}
                    onChange={(e) =>
                      handleUpdateActiveRule(
                        'borderStyle',
                        (e.target as HTMLSelectElement).value as StyledButtonRule['borderStyle']
                      )
                    }
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="double">Double</option>
                  </select>
                </label>
                <label>
                  <span>Border color</span>
                  <input
                    type="color"
                    value={activeRule.borderColor}
                    onInput={(e) =>
                      handleUpdateActiveRule('borderColor', (e.target as HTMLInputElement).value)
                    }
                  />
                </label>
              </>
            )}
          </div>

          {/* Colors & Fills */}
          <div class="field-group">
            <div class="field-group-title">Colors & Fills</div>
            <label class="row">
              <span>Use custom colors</span>
              <input
                type="checkbox"
                checked={activeRule.customColors}
                onChange={(e) =>
                  handleUpdateActiveRule(
                    'customColors',
                    (e.target as HTMLInputElement).checked
                  )
                }
              />
            </label>
            {activeRule.customColors && (
              <>
                <label>
                  <span>Background color</span>
                  <input
                    type="color"
                    value={activeRule.bg}
                    onInput={(e) =>
                      handleUpdateActiveRule('bg', (e.target as HTMLInputElement).value)
                    }
                  />
                </label>
                <label class="row">
                  <span>Gradient fill</span>
                  <input
                    type="checkbox"
                    checked={activeRule.useGradient}
                    onChange={(e) =>
                      handleUpdateActiveRule(
                        'useGradient',
                        (e.target as HTMLInputElement).checked
                      )
                    }
                  />
                </label>
                {activeRule.useGradient && (
                  <>
                    <label>
                      <span>Gradient end color</span>
                      <input
                        type="color"
                        value={activeRule.bgGradientEnd}
                        onInput={(e) =>
                          handleUpdateActiveRule(
                            'bgGradientEnd',
                            (e.target as HTMLInputElement).value
                          )
                        }
                      />
                    </label>
                    <label>
                      <span>
                        Gradient angle <b>{activeRule.gradientAngle}&deg;</b>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={activeRule.gradientAngle}
                        onInput={(e) =>
                          handleUpdateActiveRule(
                            'gradientAngle',
                            Number((e.target as HTMLInputElement).value)
                          )
                        }
                      />
                    </label>
                  </>
                )}
                <label>
                  <span>Text color</span>
                  <input
                    type="color"
                    value={activeRule.fg}
                    onInput={(e) =>
                      handleUpdateActiveRule('fg', (e.target as HTMLInputElement).value)
                    }
                  />
                </label>
              </>
            )}
          </div>

          {/* Hover & Depth */}
          <div class="field-group">
            <div class="field-group-title">Hover & Depth</div>
            <label>
              <span>Hover animation</span>
              <select
                value={activeRule.hoverEffect}
                onChange={(e) =>
                  handleUpdateActiveRule(
                    'hoverEffect',
                    (e.target as HTMLSelectElement).value as StyledButtonRule['hoverEffect']
                  )
                }
              >
                <option value="none">None</option>
                <option value="lift">Lift (-3px)</option>
                <option value="scale">Scale up</option>
                <option value="glow">Glow</option>
                <option value="shine">Shine</option>
              </select>
            </label>
            <label>
              <span>Drop shadow depth</span>
              <select
                value={activeRule.shadow}
                onChange={(e) =>
                  handleUpdateActiveRule(
                    'shadow',
                    (e.target as HTMLSelectElement).value as StyledButtonRule['shadow']
                  )
                }
              >
                <option value="none">None</option>
                <option value="subtle">Subtle</option>
                <option value="medium">Medium</option>
                <option value="dramatic">Dramatic</option>
                <option value="colored">Colored tint</option>
              </select>
            </label>
          </div>

          {/* Sizing & Typography */}
          <div class="field-group">
            <div class="field-group-title">Sizing & Typography</div>
            <label>
              <span>
                Vertical padding <b>{activeRule.paddingY}px</b>
              </span>
              <input
                type="range"
                min="6"
                max="24"
                value={activeRule.paddingY}
                onInput={(e) =>
                  handleUpdateActiveRule(
                    'paddingY',
                    Number((e.target as HTMLInputElement).value)
                  )
                }
              />
            </label>
            <label>
              <span>
                Horizontal padding <b>{activeRule.paddingX}px</b>
              </span>
              <input
                type="range"
                min="14"
                max="48"
                value={activeRule.paddingX}
                onInput={(e) =>
                  handleUpdateActiveRule(
                    'paddingX',
                    Number((e.target as HTMLInputElement).value)
                  )
                }
              />
            </label>
            <label>
              <span>Font weight</span>
              <select
                value={activeRule.fontWeight}
                onChange={(e) =>
                  handleUpdateActiveRule('fontWeight', (e.target as HTMLSelectElement).value)
                }
              >
                <option value="normal">Normal</option>
                <option value="500">500 Medium</option>
                <option value="600">600 Semi-Bold</option>
                <option value="700">700 Bold</option>
                <option value="800">800 Extra-Bold</option>
              </select>
            </label>
            <label>
              <span>
                Letter spacing <b>{activeRule.letterSpacing}px</b>
              </span>
              <input
                type="range"
                min="0"
                max="4"
                value={activeRule.letterSpacing}
                onInput={(e) =>
                  handleUpdateActiveRule(
                    'letterSpacing',
                    Number((e.target as HTMLInputElement).value)
                  )
                }
              />
            </label>
          </div>

          <button
            type="button"
            class="reset-btn"
            style="margin-bottom: 12px;"
            onClick={() => handleDeleteRule(activeRule.id)}
          >
            Remove styling from this button
          </button>
        </div>
      ) : (
        /* IDLE STATE: No element actively focused */
        <div class="empty-selection-card">
          <div class="empty-icon">🔘</div>
          <p>
            <b>No button selected</b><br />
            Click any button on your page to style it.
          </p>
        </div>
      )}

      {/* Pick Button */}
      <button
        type="button"
        class={`picker-btn ${isPicking ? 'picking' : ''}`}
        onClick={handlePickNew}
      >
        {isPicking
          ? '🎯 Click button on page... (Esc to cancel)'
          : '🎯 Click to Select Button on Page'}
      </button>

      {/* Collapsed Drawer of all configured buttons */}
      {rules.length > 0 && (
        <div class="styled-drawer">
          <button
            type="button"
            class="styled-drawer-trigger"
            onClick={() => setShowDrawer(!showDrawer)}
          >
            <span>📋 Styled buttons on this site ({rules.length})</span>
            <span>{showDrawer ? '▴' : '▾'}</span>
          </button>
          {showDrawer && (
            <ul class="styled-drawer-list">
              {rules.map((r) => (
                <li key={r.id} class="styled-drawer-item">
                  <div
                    class="styled-drawer-label"
                    onClick={() => onSelectSelector?.(r.selector)}
                  >
                    {r.label}
                    <span class="styled-drawer-selector">{r.selector}</span>
                  </div>
                  <button
                    type="button"
                    class="drawer-del-btn"
                    title="Remove styling"
                    onClick={() => handleDeleteRule(r.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button type="button" class="reset-btn" data-act="reset" onClick={onReset}>
        Reset all button designs
      </button>
    </div>
  );
}
