import { useState } from 'preact/hooks';
import type { StyledTextRule, TextEffectsConfig } from '../../features/textEffects/schema.js';
import { createDefaultTextRule } from '../../features/textEffects/schema.js';
import { startPicker } from '../picker.js';

interface TextEffectsEditorProps {
  config: Record<string, unknown>;
  onBack: () => void;
  onUpdateValue: (key: string, value: unknown) => void;
  onReset: () => void;
}

export function TextEffectsEditor({
  config,
  onBack,
  onUpdateValue,
  onReset,
}: TextEffectsEditorProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [pickingRuleId, setPickingRuleId] = useState<string | null>(null);

  const cfg = config as unknown as TextEffectsConfig;
  const enabled = Boolean(cfg.enabled);
  const rules = Array.isArray(cfg.rules) ? cfg.rules : [];

  const handlePickNew = () => {
    setIsPicking(true);
    setPickingRuleId(null);

    startPicker({
      onSelect: (target) => {
        setIsPicking(false);
        const newRule: StyledTextRule = {
          ...createDefaultTextRule(),
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

  const handleUpdateRule = <K extends keyof StyledTextRule>(
    ruleId: string,
    key: K,
    val: StyledTextRule[K]
  ) => {
    const nextRules = rules.map((r) => (r.id === ruleId ? { ...r, [key]: val } : r));
    onUpdateValue('rules', nextRules);
  };

  return (
    <div class="text-effects-editor">
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
      <h2>Text & Heading Designs</h2>

      {/* Activation card */}
      <div class="field-group">
        <label class="row">
          <span>Enable custom text designs</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onUpdateValue('enabled', (e.target as HTMLInputElement).checked)}
          />
        </label>
      </div>

      {/* Big Pick Button */}
      <button
        type="button"
        class={`picker-btn ${isPicking ? 'picking' : ''}`}
        onClick={handlePickNew}
      >
        {isPicking && !pickingRuleId
          ? '🎯 Hover & Click text on page... (Esc to cancel)'
          : '🎯 Click to Select Text on Page'}
      </button>

      {/* List of styled elements */}
      {rules.length === 0 ? (
        <div class="empty-rules-card">
          <div class="empty-icon">✍️</div>
          <p>
            No text elements selected yet.<br />
            Click <b>"🎯 Click to Select Text on Page"</b> above to choose any heading or paragraph!
          </p>
        </div>
      ) : (
        <div class="rules-list">
          {rules.map((rule, idx) => {
            const isThisPicking = isPicking && pickingRuleId === rule.id;
            return (
              <div class="rule-card" key={rule.id}>
                <div class="rule-header">
                  <div class="rule-title-group">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      title="Enable/disable this element"
                      onChange={(e) =>
                        handleUpdateRule(
                          rule.id,
                          'enabled',
                          (e.target as HTMLInputElement).checked
                        )
                      }
                    />
                    <div>
                      <div class="rule-label">{rule.label || `Element #${idx + 1}`}</div>
                      <code class="rule-selector">{rule.selector}</code>
                    </div>
                  </div>
                  <div class="rule-actions">
                    <button
                      type="button"
                      class="mini-btn repick"
                      onClick={() => handleRePick(rule.id)}
                    >
                      {isThisPicking ? 'Picking...' : '🎯 Re-pick'}
                    </button>
                    <button
                      type="button"
                      class="mini-btn delete"
                      title="Delete design"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Controls for this specific element */}
                <div class="rule-controls">
                  {/* Gradient Section */}
                  <div class="sub-group">
                    <div class="sub-title">Gradient Fill</div>
                    <label class="row">
                      <span>Enable gradient fill</span>
                      <input
                        type="checkbox"
                        checked={rule.gradientEnabled}
                        onChange={(e) =>
                          handleUpdateRule(
                            rule.id,
                            'gradientEnabled',
                            (e.target as HTMLInputElement).checked
                          )
                        }
                      />
                    </label>
                    {rule.gradientEnabled && (
                      <>
                        <label>
                          <span>Start color</span>
                          <input
                            type="color"
                            value={rule.gradientStart}
                            onInput={(e) =>
                              handleUpdateRule(
                                rule.id,
                                'gradientStart',
                                (e.target as HTMLInputElement).value
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>End color</span>
                          <input
                            type="color"
                            value={rule.gradientEnd}
                            onInput={(e) =>
                              handleUpdateRule(
                                rule.id,
                                'gradientEnd',
                                (e.target as HTMLInputElement).value
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>
                            Angle <b>{rule.gradientAngle}°</b>
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="15"
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
                        <label class="row">
                          <span>Animate wave effect</span>
                          <input
                            type="checkbox"
                            checked={rule.gradientAnimate}
                            onChange={(e) =>
                              handleUpdateRule(
                                rule.id,
                                'gradientAnimate',
                                (e.target as HTMLInputElement).checked
                              )
                            }
                          />
                        </label>
                      </>
                    )}
                  </div>

                  {/* Highlighter Section */}
                  <div class="sub-group">
                    <div class="sub-title">Marker Highlighter</div>
                    <label class="row">
                      <span>Enable highlighter</span>
                      <input
                        type="checkbox"
                        checked={rule.highlightEnabled}
                        onChange={(e) =>
                          handleUpdateRule(
                            rule.id,
                            'highlightEnabled',
                            (e.target as HTMLInputElement).checked
                          )
                        }
                      />
                    </label>
                    {rule.highlightEnabled && (
                      <>
                        <label>
                          <span>Highlight color</span>
                          <input
                            type="color"
                            value={rule.highlightColor}
                            onInput={(e) =>
                              handleUpdateRule(
                                rule.id,
                                'highlightColor',
                                (e.target as HTMLInputElement).value
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Highlight height</span>
                          <select
                            value={rule.highlightStyle}
                            onChange={(e) =>
                              handleUpdateRule(
                                rule.id,
                                'highlightStyle',
                                (e.target as HTMLSelectElement).value as StyledTextRule['highlightStyle']
                              )
                            }
                          >
                            <option value="underline">Underline bar (35%)</option>
                            <option value="thick">Thick swipe (65%)</option>
                            <option value="full">Full text highlight (100%)</option>
                          </select>
                        </label>
                      </>
                    )}
                  </div>

                  {/* Creative Underline */}
                  <div class="sub-group">
                    <div class="sub-title">Accent Underline</div>
                    <label class="row">
                      <span>Enable underline</span>
                      <input
                        type="checkbox"
                        checked={rule.underlineEnabled}
                        onChange={(e) =>
                          handleUpdateRule(
                            rule.id,
                            'underlineEnabled',
                            (e.target as HTMLInputElement).checked
                          )
                        }
                      />
                    </label>
                    {rule.underlineEnabled && (
                      <>
                        <label>
                          <span>Underline color</span>
                          <input
                            type="color"
                            value={rule.underlineColor}
                            onInput={(e) =>
                              handleUpdateRule(
                                rule.id,
                                'underlineColor',
                                (e.target as HTMLInputElement).value
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>
                            Thickness <b>{rule.underlineThickness}px</b>
                          </span>
                          <input
                            type="range"
                            min="1"
                            max="8"
                            step="1"
                            value={rule.underlineThickness}
                            onInput={(e) =>
                              handleUpdateRule(
                                rule.id,
                                'underlineThickness',
                                Number((e.target as HTMLInputElement).value)
                              )
                            }
                          />
                        </label>
                        <label>
                          <span>Hover trigger</span>
                          <select
                            value={rule.underlineHover}
                            onChange={(e) =>
                              handleUpdateRule(
                                rule.id,
                                'underlineHover',
                                (e.target as HTMLSelectElement).value as StyledTextRule['underlineHover']
                              )
                            }
                          >
                            <option value="hover">Expand on hover</option>
                            <option value="always">Always visible</option>
                          </select>
                        </label>
                      </>
                    )}
                  </div>

                  {/* Shadow & Glow */}
                  <div class="sub-group">
                    <div class="sub-title">Shadow & Glow</div>
                    <label>
                      <span>Effect preset</span>
                      <select
                        value={rule.shadowEffect}
                        onChange={(e) =>
                          handleUpdateRule(
                            rule.id,
                            'shadowEffect',
                            (e.target as HTMLSelectElement).value as StyledTextRule['shadowEffect']
                          )
                        }
                      >
                        <option value="none">None</option>
                        <option value="subtle">Subtle shadow</option>
                        <option value="soft-drop">Soft drop shadow</option>
                        <option value="glow">Vibrant glow</option>
                        <option value="retro-3d">Retro 3D offset</option>
                      </select>
                    </label>
                    {rule.shadowEffect !== 'none' && (
                      <label>
                        <span>Glow / Shadow color</span>
                        <input
                          type="color"
                          value={rule.shadowColor}
                          onInput={(e) =>
                            handleUpdateRule(
                              rule.id,
                              'shadowColor',
                              (e.target as HTMLInputElement).value
                            )
                          }
                        />
                      </label>
                    )}
                  </div>

                  {/* Typography */}
                  <div class="sub-group">
                    <div class="sub-title">Typography</div>
                    <label>
                      <span>
                        Letter spacing <b>{rule.letterSpacing}px</b>
                      </span>
                      <input
                        type="range"
                        min="-2"
                        max="10"
                        step="0.5"
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
              </div>
            );
          })}
        </div>
      )}

      <button type="button" class="reset-btn" onClick={onReset}>
        Reset to defaults
      </button>
    </div>
  );
}
