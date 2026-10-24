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
          tag: target.tag || 'h2',
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

  const handleResetTextOptions = () => {
    if (!activeRule) return;
    const nextRules = rules.map((r) =>
      r.id === activeRule.id
        ? {
            ...r,
            textOptionsEnabled: false,
            textColor: '#18181b',
            fontSize: 48,
            mobileFontSize: 32,
            format: 'auto' as const,
            align: 'left' as const,
            mobileAlign: 'left' as const,
            lineGap: 1.2,
          }
        : r
    );
    onUpdateValue('rules', nextRules);
  };

  const handleTagChange = (newTag: string) => {
    if (!activeRule) return;
    const oldTag = activeRule.tag || 'h2';
    let nextSel = activeRule.selector;
    if (oldTag && nextSel.includes(oldTag)) {
      nextSel = nextSel.replace(new RegExp(`\\b${oldTag}\\b`, 'g'), newTag);
    }
    const getTagDisplayName = (t: string) => {
      switch (t.toLowerCase()) {
        case 'h1':
          return 'Heading 1';
        case 'h2':
          return 'Heading 2';
        case 'h3':
          return 'Heading 3';
        case 'h4':
          return 'Heading 4';
        case 'p':
          return 'Paragraph';
        default:
          return t.toUpperCase();
      }
    };
    const nextRules = rules.map((r) =>
      r.id === activeRule.id
        ? {
            ...r,
            tag: newTag,
            selector: nextSel,
            label: r.label.replace(/Heading \d|Paragraph/i, getTagDisplayName(newTag)),
          }
        : r
    );
    onUpdateValue('rules', nextRules);
  };

  let activeEffectType = 'none';
  if (activeRule?.gradientEnabled) activeEffectType = 'gradient';
  else if (activeRule?.highlightEnabled) activeEffectType = 'highlight';
  else if (activeRule?.underlineEnabled) activeEffectType = 'underline';
  else if (activeRule?.shadowEffect && activeRule.shadowEffect !== 'none') activeEffectType = 'shadow';

  const handleEffectTypeChange = (type: string) => {
    if (!activeRule) return;
    const nextRules = rules.map((r) => {
      if (r.id !== activeRule.id) return r;
      return {
        ...r,
        gradientEnabled: type === 'gradient',
        highlightEnabled: type === 'highlight',
        underlineEnabled: type === 'underline',
        shadowEffect: type === 'shadow' ? ('glow' as const) : ('none' as const),
      };
    });
    onUpdateValue('rules', nextRules);
  };

  const handleResetTextEffects = () => {
    handleEffectTypeChange('none');
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
          {/* 1. TEXT OPTIONS SECTION */}
          <div class="section-card">
            <div class="section-header">
              <div class="section-title-wrap">
                <div class="section-icon">T</div>
                <div class="section-title">Text options</div>
              </div>
              <div class="section-actions">
                <button
                  type="button"
                  class="section-reset-btn"
                  title="Reset text options"
                  onClick={handleResetTextOptions}
                >
                  ↺
                </button>
                <label class="switch">
                  <input
                    type="checkbox"
                    checked={activeRule.textOptionsEnabled}
                    onChange={(e) =>
                      handleUpdateActiveRule(
                        'textOptionsEnabled',
                        (e.target as HTMLInputElement).checked
                      )
                    }
                  />
                  <span class="slider-round" />
                </label>
              </div>
            </div>

            {activeRule.textOptionsEnabled && (
              <div class="section-body">
                {/* Heading tag select */}
                <div class="tag-select-wrapper">
                  <select
                    class="tag-select"
                    value={activeRule.tag || 'h2'}
                    onChange={(e) => handleTagChange((e.target as HTMLSelectElement).value)}
                  >
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="h4">Heading 4</option>
                    <option value="p">Paragraph</option>
                  </select>
                  <span class="tag-select-chevron">▾</span>
                </div>

                <p class="section-desc">Adjust font size, color, alignment, spacing, and formatting.</p>

                {/* Color */}
                <label>
                  <span>Color</span>
                  <input
                    type="color"
                    value={activeRule.textColor || '#18181b'}
                    onInput={(e) =>
                      handleUpdateActiveRule('textColor', (e.target as HTMLInputElement).value)
                    }
                  />
                </label>

                {/* Size (Desktop) */}
                <label>
                  <span>
                    Size <b>{activeRule.fontSize || 48}px</b>
                  </span>
                  <div class="row-input-group">
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={activeRule.fontSize || 48}
                      onInput={(e) =>
                        handleUpdateActiveRule(
                          'fontSize',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                    <input
                      type="number"
                      class="number-pill-input"
                      min="12"
                      max="120"
                      value={activeRule.fontSize || 48}
                      onInput={(e) =>
                        handleUpdateActiveRule(
                          'fontSize',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                  </div>
                </label>

                {/* Mobile Size */}
                <label>
                  <span>
                    <span>Mobile size <span class="mobile-tag">📱 Mobile</span></span>
                    <b>{activeRule.mobileFontSize || 32}px</b>
                  </span>
                  <div class="row-input-group">
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={activeRule.mobileFontSize || 32}
                      onInput={(e) =>
                        handleUpdateActiveRule(
                          'mobileFontSize',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                    <input
                      type="number"
                      class="number-pill-input"
                      min="10"
                      max="80"
                      value={activeRule.mobileFontSize || 32}
                      onInput={(e) =>
                        handleUpdateActiveRule(
                          'mobileFontSize',
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                    />
                  </div>
                </label>

                {/* Formation pills */}
                <label>
                  <span>Formation</span>
                  <div class="segmented-group">
                    {(
                      [
                        { id: 'auto', label: 'Auto' },
                        { id: 'bold', label: 'Bold' },
                        { id: 'italic', label: 'Italic' },
                        { id: 'underline', label: 'Underline' },
                        { id: 'strike', label: 'Strike' },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        class={`segmented-btn ${(activeRule.format || 'auto') === f.id ? 'active' : ''}`}
                        onClick={() => handleUpdateActiveRule('format', f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </label>

                {/* Align (Desktop) */}
                <label>
                  <span>Align</span>
                  <div class="segmented-group">
                    {(
                      [
                        { id: 'left', label: '⇤ Left' },
                        { id: 'center', label: '↔ Center' },
                        { id: 'right', label: '⇥ Right' },
                        { id: 'justify', label: '☰ Justify' },
                      ] as const
                    ).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        class={`segmented-btn ${(activeRule.align || 'left') === a.id ? 'active' : ''}`}
                        onClick={() => handleUpdateActiveRule('align', a.id)}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </label>

                {/* Mobile Align */}
                <label>
                  <span>
                    <span>Mobile align <span class="mobile-tag">📱 Mobile</span></span>
                  </span>
                  <div class="segmented-group">
                    {(
                      [
                        { id: 'left', label: '⇤ Left' },
                        { id: 'center', label: '↔ Center' },
                        { id: 'right', label: '⇥ Right' },
                      ] as const
                    ).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        class={`segmented-btn ${(activeRule.mobileAlign || 'left') === a.id ? 'active' : ''}`}
                        onClick={() => handleUpdateActiveRule('mobileAlign', a.id)}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </label>

                {/* Line gap (Line height) */}
                <label>
                  <span>
                    Line gap <b>{(activeRule.lineGap ?? 1.2).toFixed(2)}×</b>
                  </span>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.05"
                    value={activeRule.lineGap ?? 1.2}
                    onInput={(e) =>
                      handleUpdateActiveRule(
                        'lineGap',
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                  />
                </label>
              </div>
            )}
          </div>

          {/* 2. TEXT EFFECTS SECTION */}
          <div class="section-card">
            <div class="section-header">
              <div class="section-title-wrap">
                <div class="section-icon">H</div>
                <div class="section-title">Text effects</div>
              </div>
              <div class="section-actions">
                <button
                  type="button"
                  class="section-reset-btn"
                  title="Reset text effects"
                  onClick={handleResetTextEffects}
                >
                  ↺
                </button>
                <select
                  style="width: auto; padding: 4px 8px; font-size: 12px; font-weight: 600;"
                  value={activeEffectType}
                  onChange={(e) => handleEffectTypeChange((e.target as HTMLSelectElement).value)}
                >
                  <option value="none">None ▾</option>
                  <option value="gradient">Gradient Fill</option>
                  <option value="highlight">Highlighter Pen</option>
                  <option value="underline">Accent Underline</option>
                  <option value="shadow">Shadow & Glow</option>
                </select>
              </div>
            </div>
            <p class="section-desc" style="margin: 8px 0 0 0;">
              A range of visual design effects to make your headings stand out.
            </p>

            {/* Gradient controls */}
            {activeEffectType === 'gradient' && (
              <div class="section-body">
                <label>
                  <span>Start color</span>
                  <input
                    type="color"
                    value={activeRule.gradientStart}
                    onInput={(e) =>
                      handleUpdateActiveRule('gradientStart', (e.target as HTMLInputElement).value)
                    }
                  />
                </label>
                <label>
                  <span>End color</span>
                  <input
                    type="color"
                    value={activeRule.gradientEnd}
                    onInput={(e) =>
                      handleUpdateActiveRule('gradientEnd', (e.target as HTMLInputElement).value)
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
              </div>
            )}

            {/* Highlight controls */}
            {activeEffectType === 'highlight' && (
              <div class="section-body">
                <label>
                  <span>Highlighter color</span>
                  <input
                    type="color"
                    value={activeRule.highlightColor}
                    onInput={(e) =>
                      handleUpdateActiveRule('highlightColor', (e.target as HTMLInputElement).value)
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
              </div>
            )}

            {/* Underline controls */}
            {activeEffectType === 'underline' && (
              <div class="section-body">
                <label>
                  <span>Underline color</span>
                  <input
                    type="color"
                    value={activeRule.underlineColor}
                    onInput={(e) =>
                      handleUpdateActiveRule('underlineColor', (e.target as HTMLInputElement).value)
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
              </div>
            )}

            {/* Shadow & Glow controls */}
            {activeEffectType === 'shadow' && (
              <div class="section-body">
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
                    <option value="subtle">Subtle drop shadow</option>
                    <option value="glow">Neon outer glow</option>
                    <option value="retro-3d">Retro 3D shadow</option>
                    <option value="soft-drop">Soft diffused shadow</option>
                  </select>
                </label>
                <label>
                  <span>Shadow / glow color</span>
                  <input
                    type="color"
                    value={activeRule.shadowColor}
                    onInput={(e) =>
                      handleUpdateActiveRule('shadowColor', (e.target as HTMLInputElement).value)
                    }
                  />
                </label>
              </div>
            )}
          </div>

          {/* 3. WORD LOOP SECTION */}
          <div class="section-card">
            <div class="section-header">
              <div class="section-title-wrap">
                <div class="section-icon">🔄</div>
                <div class="section-title">Word loop</div>
              </div>
              <div class="section-actions">
                <button type="button" class="section-reset-btn" title="Reset word loop">↺</button>
                <label class="switch">
                  <input type="checkbox" disabled />
                  <span class="slider-round" />
                </label>
              </div>
            </div>
            <p class="section-desc" style="margin: 8px 0 0 0;">
              Type "loop" where the effect should appear.
            </p>
          </div>

          {/* 4. NUMBER COUNTER SECTION */}
          <div class="section-card">
            <div class="section-header">
              <div class="section-title-wrap">
                <div class="section-icon">9</div>
                <div class="section-title">Number counter</div>
              </div>
              <div class="section-actions">
                <label class="switch">
                  <input type="checkbox" disabled />
                  <span class="slider-round" />
                </label>
              </div>
            </div>
            <p class="section-desc" style="margin: 8px 0 0 0;">
              Animates numbers to highlight milestones, achievements, and metrics.
            </p>
          </div>

          {/* 5. PARAGRAPH STYLES SECTION */}
          <div class="section-card">
            <div class="section-header">
              <div class="section-title-wrap">
                <div class="section-icon">¶</div>
                <div class="section-title">Paragraph styles</div>
              </div>
              <div class="section-actions">
                <select style="width: auto; padding: 4px 8px; font-size: 12px; font-weight: 600;" disabled>
                  <option>None ▾</option>
                </select>
              </div>
            </div>
            <p class="section-desc" style="margin: 8px 0 0 0;">
              A range of text styles to improve readability.
            </p>
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
