import { useState } from 'preact/hooks';
import type { StyledButtonRule, ButtonStylesConfig } from '../../features/buttonStyles/schema.js';
import { createDefaultButtonRule } from '../../features/buttonStyles/schema.js';
import { startPicker } from '../picker.js';

interface ButtonStylesEditorProps {
  config: Record<string, unknown>;
  onBack: () => void;
  onUpdateValue: (key: string, value: unknown) => void;
  onReset: () => void;
}

export function ButtonStylesEditor({
  config,
  onBack,
  onUpdateValue,
  onReset,
}: ButtonStylesEditorProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [pickingRuleId, setPickingRuleId] = useState<string | null>(null);

  const cfg = config as unknown as ButtonStylesConfig;
  const enabled = Boolean(cfg.enabled);
  const rules = Array.isArray(cfg.rules) ? cfg.rules : [];

  const handlePickNew = () => {
    setIsPicking(true);
    setPickingRuleId(null);

    startPicker({
      filterKind: 'button',
      onSelect: (target) => {
        setIsPicking(false);
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
      },
      onCancel: () => {
        setIsPicking(false);
      },
    });
  };

  const handleRePick = (ruleId: string) => {
    setIsPicking(true);
    setPickingRuleId(ruleId);

    startPicker({
      filterKind: 'button',
      onSelect: (target) => {
        setIsPicking(false);
        setPickingRuleId(null);
        const nextRules = rules.map((r) =>
          r.id === ruleId
            ? { ...r, selector: target.selector, label: target.label }
            : r
        );
        onUpdateValue('rules', nextRules);
      },
      onCancel: () => {
        setIsPicking(false);
        setPickingRuleId(null);
      },
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    const nextRules = rules.filter((r) => r.id !== ruleId);
    onUpdateValue('rules', nextRules);
  };

  const handleUpdateRule = <K extends keyof StyledButtonRule>(
    ruleId: string,
    key: K,
    val: StyledButtonRule[K]
  ) => {
    const nextRules = rules.map((r) => (r.id === ruleId ? { ...r, [key]: val } : r));
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
      <h2>Button Designs</h2>

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

      {/* Pick Button */}
      <button
        type="button"
        class={`picker-btn ${isPicking ? 'picking' : ''}`}
        onClick={handlePickNew}
      >
        {isPicking && !pickingRuleId
          ? '🎯 Hover & Click button on page... (Esc to cancel)'
          : '🎯 Click to Select Button on Page'}
      </button>

      {/* List of styled buttons */}
      {rules.length === 0 ? (
        <div class="empty-rules-card">
          <div class="empty-icon">🔘</div>
          <p>
            No buttons selected yet.<br />
            Click <b>"🎯 Click to Select Button on Page"</b> above to choose any button on your page!
          </p>
        </div>
      ) : (
        <div class="rules-list">
          {rules.map((rule, idx) => {
            const isThisPicking = isPicking && pickingRuleId === rule.id;
            return (
              <div class="rule-card" key={rule.id}>
                {/* Header */}
                <div class="rule-header">
                  <div class="rule-title-group">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) =>
                        handleUpdateRule(rule.id, 'enabled', (e.target as HTMLInputElement).checked)
                      }
                      title="Toggle this button style"
                    />
                    <div>
                      <div class="rule-label">
                        #{idx + 1}: {rule.label}
                      </div>
                      <code class="rule-selector">{rule.selector || 'No selector'}</code>
                    </div>
                  </div>
                  <div class="rule-actions">
                    <button
                      type="button"
                      class="mini-btn"
                      title="Pick a different button on page"
                      onClick={() => handleRePick(rule.id)}
                    >
                      {isThisPicking ? 'Picking...' : '🎯 Re-pick'}
                    </button>
                    <button
                      type="button"
                      class="mini-btn delete"
                      title="Remove this button design"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      &#10005;
                    </button>
                  </div>
                </div>

                {/* Shape & Border */}
                <div class="sub-group">
                  <div class="sub-title">Shape & Border</div>
                  <label>
                    <span>
                      Corner roundness <b>{rule.radius}px</b>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={rule.radius}
                      onInput={(e) =>
                        handleUpdateRule(
                          rule.id,
                          'radius',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                  </label>
                  <label>
                    <span>
                      Border thickness <b>{rule.borderWidth}px</b>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="6"
                      value={rule.borderWidth}
                      onInput={(e) =>
                        handleUpdateRule(
                          rule.id,
                          'borderWidth',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                  </label>
                  {rule.borderWidth > 0 && (
                    <>
                      <label>
                        <span>Border style</span>
                        <select
                          value={rule.borderStyle}
                          onChange={(e) =>
                            handleUpdateRule(
                              rule.id,
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
                          value={rule.borderColor}
                          onInput={(e) =>
                            handleUpdateRule(rule.id, 'borderColor', (e.target as HTMLInputElement).value)
                          }
                        />
                      </label>
                    </>
                  )}
                </div>

                {/* Colors & Gradient */}
                <div class="sub-group">
                  <div class="sub-title">Colors & Fills</div>
                  <label class="row">
                    <span>Use custom colors</span>
                    <input
                      type="checkbox"
                      checked={rule.customColors}
                      onChange={(e) =>
                        handleUpdateRule(
                          rule.id,
                          'customColors',
                          (e.target as HTMLInputElement).checked
                        )
                      }
                    />
                  </label>
                  {rule.customColors && (
                    <>
                      <label>
                        <span>Background color</span>
                        <input
                          type="color"
                          value={rule.bg}
                          onInput={(e) =>
                            handleUpdateRule(rule.id, 'bg', (e.target as HTMLInputElement).value)
                          }
                        />
                      </label>
                      <label class="row">
                        <span>Gradient fill</span>
                        <input
                          type="checkbox"
                          checked={rule.useGradient}
                          onChange={(e) =>
                            handleUpdateRule(
                              rule.id,
                              'useGradient',
                              (e.target as HTMLInputElement).checked
                            )
                          }
                        />
                      </label>
                      {rule.useGradient && (
                        <>
                          <label>
                            <span>Gradient end color</span>
                            <input
                              type="color"
                              value={rule.bgGradientEnd}
                              onInput={(e) =>
                                handleUpdateRule(
                                  rule.id,
                                  'bgGradientEnd',
                                  (e.target as HTMLInputElement).value
                                )
                              }
                            />
                          </label>
                          <label>
                            <span>
                              Gradient angle <b>{rule.gradientAngle}&deg;</b>
                            </span>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={rule.gradientAngle}
                              onInput={(e) =>
                                handleUpdateRule(
                                  rule.id,
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
                          value={rule.fg}
                          onInput={(e) =>
                            handleUpdateRule(rule.id, 'fg', (e.target as HTMLInputElement).value)
                          }
                        />
                      </label>
                    </>
                  )}
                </div>

                {/* Hover & Depth */}
                <div class="sub-group">
                  <div class="sub-title">Hover & Depth</div>
                  <label>
                    <span>Hover animation</span>
                    <select
                      value={rule.hoverEffect}
                      onChange={(e) =>
                        handleUpdateRule(
                          rule.id,
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
                      value={rule.shadow}
                      onChange={(e) =>
                        handleUpdateRule(
                          rule.id,
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
                <div class="sub-group">
                  <div class="sub-title">Sizing & Typography</div>
                  <label>
                    <span>
                      Vertical padding <b>{rule.paddingY}px</b>
                    </span>
                    <input
                      type="range"
                      min="6"
                      max="24"
                      value={rule.paddingY}
                      onInput={(e) =>
                        handleUpdateRule(
                          rule.id,
                          'paddingY',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                  </label>
                  <label>
                    <span>
                      Horizontal padding <b>{rule.paddingX}px</b>
                    </span>
                    <input
                      type="range"
                      min="14"
                      max="48"
                      value={rule.paddingX}
                      onInput={(e) =>
                        handleUpdateRule(
                          rule.id,
                          'paddingX',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                  </label>
                  <label>
                    <span>Font weight</span>
                    <select
                      value={rule.fontWeight}
                      onChange={(e) =>
                        handleUpdateRule(rule.id, 'fontWeight', (e.target as HTMLSelectElement).value)
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
                      Letter spacing <b>{rule.letterSpacing}px</b>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      value={rule.letterSpacing}
                      onInput={(e) =>
                        handleUpdateRule(
                          rule.id,
                          'letterSpacing',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button type="button" class="reset-btn" data-act="reset" onClick={onReset}>
        Reset all button designs
      </button>
    </div>
  );
}

