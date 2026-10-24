import { useState } from 'preact/hooks';
import type { StyledTextRule, TextEffectsConfig } from '../../features/textEffects/schema.js';
import { createDefaultTextRule } from '../../features/textEffects/schema.js';
import { startPicker } from '../picker.js';

interface TextEffectsEditorProps {
  config: Record<string, unknown>;
  activeSelector?: string | null;
  onSelectSelector?: (sel: string | null) => void;
  onBack: () => void;
  onUpdateValue: (key: string, value: unknown) => void;
  onReset: () => void;
}

export function TextEffectsEditor({
  config,
  activeSelector,
  onSelectSelector,
  onBack,
  onUpdateValue,
  onReset,
}: TextEffectsEditorProps) {
  const [isPicking, setIsPicking] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const cfg = config as unknown as TextEffectsConfig;
  const enabled = Boolean(cfg.enabled);
  const rules = Array.isArray(cfg.rules) ? cfg.rules : [];

  // Determine active rule from selection
  const activeRule = activeSelector
    ? rules.find((r) => r.selector === activeSelector) || null
    : null;

  const handlePickNew = () => {
    setIsPicking(true);

    startPicker({
      filterKind: 'text',
      onSelect: (target) => {
        setIsPicking(false);
        const existing = rules.find((r) => r.selector === target.selector);
        if (existing) {
          onSelectSelector?.(existing.selector);
          return;
        }

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

  const handleUpdateActiveRule = <K extends keyof StyledTextRule>(
    key: K,
    val: StyledTextRule[K]
  ) => {
    if (!activeRule) return;
    const nextRules = rules.map((r) => (r.id === activeRule.id ? { ...r, [key]: val } : r));
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

      <div class="detail-header-row">
        <h2 class="detail-title">Text</h2>
        {activeRule ? (
          <div class="editing-badge">
            <span>Editing: {activeRule.label.length > 18 ? `${activeRule.label.slice(0, 18)}…` : activeRule.label}</span>
            <button
              type="button"
              class="editing-done-btn"
              onClick={() => onSelectSelector?.(null)}
              title="Deselect this text element"
            >
              Done
            </button>
          </div>
        ) : null}
      </div>

      {/* Activation card */}
      <div class="field-group">
        <label class="row">
          <span>Enable custom text designs</span>
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
          {/* Gradient text */}
          <div class="field-group">
            <div class="field-group-title">Gradient Text Fill</div>
            <label class="row">
              <span>Enable gradient fill</span>
              <input
                type="checkbox"
                checked={activeRule.gradientEnabled}
                onChange={(e) =>
                  handleUpdateActiveRule(
                    'gradientEnabled',
                    (e.target as HTMLInputElement).checked
                  )
                }
              />
            </label>
            {activeRule.gradientEnabled && (
              <>
                <label>
                  <span>Start color</span>
                  <input
                    type="color"
                    value={activeRule.gradientStart}
                    onInput={(e) =>
                      handleUpdateActiveRule(
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
                    value={activeRule.gradientEnd}
                    onInput={(e) =>
                      handleUpdateActiveRule(
                        'gradientEnd',
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
                <label class="row">
                  <span>Animate gradient wave</span>
                  <input
                    type="checkbox"
                    checked={activeRule.gradientAnimate}
                    onChange={(e) =>
                      handleUpdateActiveRule(
                        'gradientAnimate',
                        (e.target as HTMLInputElement).checked
                      )
                    }
                  />
                </label>
              </>
            )}
          </div>

          {/* Highlighter effect */}
          <div class="field-group">
            <div class="field-group-title">Highlighter Pen Effect</div>
            <label class="row">
              <span>Enable highlighter</span>
              <input
                type="checkbox"
                checked={activeRule.highlightEnabled}
                onChange={(e) =>
                  handleUpdateActiveRule(
                    'highlightEnabled',
                    (e.target as HTMLInputElement).checked
                  )
                }
              />
            </label>
            {activeRule.highlightEnabled && (
              <>
                <label>
                  <span>Highlighter color</span>
                  <input
                    type="color"
                    value={activeRule.highlightColor}
                    onInput={(e) =>
                      handleUpdateActiveRule(
                        'highlightColor',
                        (e.target as HTMLInputElement).value
                      )
                    }
                  />
                </label>
                <label>
                  <span>Highlight style</span>
                  <select
                    value={activeRule.highlightStyle}
                    onChange={(e) =>
                      handleUpdateActiveRule(
                        'highlightStyle',
                        (e.target as HTMLSelectElement).value as StyledTextRule['highlightStyle']
                      )
                    }
                  >
                    <option value="underline">Subtle underline</option>
                    <option value="thick">Thick marker line</option>
                    <option value="full">Full text highlight</option>
                  </select>
                </label>
              </>
            )}
          </div>

          {/* Creative underline */}
          <div class="field-group">
            <div class="field-group-title">Accent Underline</div>
            <label class="row">
              <span>Enable accent underline</span>
              <input
                type="checkbox"
                checked={activeRule.underlineEnabled}
                onChange={(e) =>
                  handleUpdateActiveRule(
                    'underlineEnabled',
                    (e.target as HTMLInputElement).checked
                  )
                }
              />
            </label>
            {activeRule.underlineEnabled && (
              <>
                <label>
                  <span>Underline color</span>
                  <input
                    type="color"
                    value={activeRule.underlineColor}
                    onInput={(e) =>
                      handleUpdateActiveRule(
                        'underlineColor',
                        (e.target as HTMLInputElement).value
                      )
                    }
                  />
                </label>
                <label>
                  <span>
                    Thickness <b>{activeRule.underlineThickness}px</b>
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={activeRule.underlineThickness}
                    onInput={(e) =>
                      handleUpdateActiveRule(
                        'underlineThickness',
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                  />
                </label>
                <label>
                  <span>Underline visibility</span>
                  <select
                    value={activeRule.underlineHover}
                    onChange={(e) =>
                      handleUpdateActiveRule(
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
          <div class="field-group">
            <div class="field-group-title">Shadow & Glow Depth</div>
            <label>
              <span>Shadow preset</span>
              <select
                value={activeRule.shadowEffect}
                onChange={(e) =>
                  handleUpdateActiveRule(
                    'shadowEffect',
                    (e.target as HTMLSelectElement).value as StyledTextRule['shadowEffect']
                  )
                }
              >
                <option value="none">None</option>
                <option value="subtle">Subtle drop shadow</option>
                <option value="glow">Neon outer glow</option>
                <option value="retro-3d">Retro 3D shadow</option>
                <option value="soft-drop">Soft diffused shadow</option>
              </select>
            </label>
            {activeRule.shadowEffect !== 'none' && (
              <label>
                <span>Shadow / glow color</span>
                <input
                  type="color"
                  value={activeRule.shadowColor}
                  onInput={(e) =>
                    handleUpdateActiveRule(
                      'shadowColor',
                      (e.target as HTMLInputElement).value
                    )
                  }
                />
              </label>
            )}
          </div>

          {/* Typography */}
          <div class="field-group">
            <div class="field-group-title">Letter Spacing</div>
            <label>
              <span>
                Spacing <b>{activeRule.letterSpacing}px</b>
              </span>
              <input
                type="range"
                min="0"
                max="10"
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
            Remove styling from this text element
          </button>
        </div>
      ) : (
        /* IDLE STATE: No element actively focused */
        <div class="empty-selection-card">
          <div class="empty-icon">✍️</div>
          <p>
            <b>No text element selected</b><br />
            Click any heading or paragraph on your page to style it.
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
          ? '🎯 Click text on page... (Esc to cancel)'
          : '🎯 Click to Select Text on Page'}
      </button>

      {/* Collapsed Drawer of all configured text elements */}
      {rules.length > 0 && (
        <div class="styled-drawer">
          <button
            type="button"
            class="styled-drawer-trigger"
            onClick={() => setShowDrawer(!showDrawer)}
          >
            <span>📋 Styled text on this site ({rules.length})</span>
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
        Reset all text designs
      </button>
    </div>
  );
}
