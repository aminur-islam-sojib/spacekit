import { useState } from 'preact/hooks';
import {
  type StyledTextRule,
  type TextEffectsConfig,
  type TextEffectType,
  type TextEffectApplyTo,
  type TextEffectSpeed,
  TEXT_EFFECTS_CATALOG,
  createDefaultTextRule,
} from '../../features/textEffects/schema.js';
import { startPicker } from '../picker.js';

function getTagDisplayName(t: string): string {
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
}

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
  const [isEffectsMenuOpen, setIsEffectsMenuOpen] = useState(false);
  const [hoveredEffectId, setHoveredEffectId] = useState<TextEffectType | null>(null);

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
    if (!enabled) {
      onUpdateValue('enabled', true);
    }
  };

  // Determine current active effect type
  const activeEffectType: TextEffectType =
    activeRule?.effectType ||
    (activeRule?.gradientEnabled
      ? 'gradient'
      : activeRule?.underlineEnabled
        ? 'underline'
        : activeRule?.highlightEnabled
          ? 'fill'
          : 'none');

  const activeDescriptor =
    TEXT_EFFECTS_CATALOG.find((e) => e.id === activeEffectType) || TEXT_EFFECTS_CATALOG[0];

  const handleSelectEffect = (type: TextEffectType) => {
    if (!activeRule) return;
    setIsEffectsMenuOpen(false);
    setHoveredEffectId(null);

    const nextRules = rules.map((r) => {
      if (r.id !== activeRule.id) return r;
      return {
        ...r,
        effectType: type,
        // Reset legacy booleans if 'none'
        gradientEnabled: type === 'gradient',
        highlightEnabled: type === 'fill',
        underlineEnabled: type === 'underline',
        shadowEffect: 'none' as const,
      };
    });
    onUpdateValue('rules', nextRules);
    if (!enabled) {
      onUpdateValue('enabled', true);
    }
  };

  const handleResetTextEffects = () => {
    if (!activeRule) return;
    setIsEffectsMenuOpen(false);
    setHoveredEffectId(null);

    const nextRules = rules.map((r) => {
      if (r.id !== activeRule.id) return r;
      return {
        ...r,
        effectType: 'none' as TextEffectType,
        effectTextColor: '#c2410c',
        effectAccentColor: '#0f172a',
        effectApplyTo: 'all' as TextEffectApplyTo,
        effectSpeed: 'medium' as TextEffectSpeed,
        gradientEnabled: false,
        highlightEnabled: false,
        underlineEnabled: false,
        shadowEffect: 'none' as const,
      };
    });
    onUpdateValue('rules', nextRules);
  };

  // Apply To cycling: 'all' -> 'first-word' -> 'last-word'
  const applyToOptions: TextEffectApplyTo[] = ['all', 'first-word', 'last-word'];
  const applyToLabels: Record<TextEffectApplyTo, string> = {
    all: 'All words',
    'first-word': 'First word',
    'last-word': 'Last word',
  };

  const cycleApplyTo = (direction: 'prev' | 'next') => {
    if (!activeRule) return;
    const current = activeRule.effectApplyTo || 'all';
    const idx = applyToOptions.indexOf(current);
    const nextIdx =
      direction === 'next'
        ? (idx + 1) % applyToOptions.length
        : (idx - 1 + applyToOptions.length) % applyToOptions.length;
    handleUpdateActiveRule('effectApplyTo', applyToOptions[nextIdx]);
  };

  // Speed cycling: 'slow' -> 'medium' -> 'fast'
  const speedOptions: TextEffectSpeed[] = ['slow', 'medium', 'fast'];
  const speedLabels: Record<TextEffectSpeed, string> = {
    slow: 'Slow',
    medium: 'Medium',
    fast: 'Fast',
  };

  const cycleSpeed = (direction: 'prev' | 'next') => {
    if (!activeRule) return;
    const current = activeRule.effectSpeed || 'medium';
    const idx = speedOptions.indexOf(current);
    const nextIdx =
      direction === 'next'
        ? Math.min(speedOptions.length - 1, idx + 1)
        : Math.max(0, idx - 1);
    handleUpdateActiveRule('effectSpeed', speedOptions[nextIdx]);
  };

  const hoveredDescriptor = hoveredEffectId
    ? TEXT_EFFECTS_CATALOG.find((e) => e.id === hoveredEffectId) || null
    : null;

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
            <span>
              Editing: {activeRule.label.length > 18 ? `${activeRule.label.slice(0, 18)}…` : activeRule.label}
            </span>
            <button
              type="button"
              class="editing-done-btn"
              onClick={() => onSelectSelector?.(null)}
              title="Deselect this text element"
            >
              Done
            </button>
          </div>
        ) : (
          <span class="badge count-badge">{rules.length} styled</span>
        )}
      </div>

      {activeRule ? (
        <div class="active-rule-panel">
          {/* 1. TEXT OPTIONS SECTION (FR-TE11) */}
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
                  title="Reset text options to defaults"
                  onClick={() => {
                    handleUpdateActiveRule('textColor', '#ffffff');
                    handleUpdateActiveRule('fontSize', 48);
                    handleUpdateActiveRule('mobileFontSize', 32);
                    handleUpdateActiveRule('format', 'auto');
                    handleUpdateActiveRule('align', 'left');
                    handleUpdateActiveRule('mobileAlign', 'left');
                    handleUpdateActiveRule('lineGap', 1.2);
                  }}
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

            {/* Typography tag display */}
            <div style="margin: 10px 0 2px 0;">
              <span class="tag-text-label" style="font-size: 13.5px; font-weight: 700; color: #0f172a;">
                {getTagDisplayName(activeRule.tag || 'h2')}
              </span>
            </div>

            <p class="section-desc" style="margin: 2px 0 10px 0;">
              Adjust font size, color, alignment, spacing, and formatting.
            </p>

            {activeRule.textOptionsEnabled && (
              <div class="section-body">
                {/* Text Color */}
                <label>
                  <span>Color</span>
                  <div class="color-picker-row">
                    <input
                      type="color"
                      class="color-swatch-input"
                      value={activeRule.textColor || '#ffffff'}
                      onInput={(e) =>
                        handleUpdateActiveRule(
                          'textColor',
                          (e.target as HTMLInputElement).value
                        )
                      }
                    />
                    <input
                      type="text"
                      class="color-hex-input"
                      value={activeRule.textColor || '#ffffff'}
                      onInput={(e) =>
                        handleUpdateActiveRule(
                          'textColor',
                          (e.target as HTMLInputElement).value
                        )
                      }
                    />
                  </div>
                </label>

                {/* Size (Desktop) */}
                <label>
                  <span>
                    Size <b>{activeRule.fontSize || 48}px</b>
                  </span>
                  <div class="slider-with-number">
                    <input
                      type="range"
                      min="12"
                      max="140"
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
                      max="140"
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
                    Mobile size <span class="mobile-tag">📱 Mobile</span> <b>{activeRule.mobileFontSize || 32}px</b>
                  </span>
                  <div class="slider-with-number">
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

          {/* 2. TEXT EFFECTS SECTION (FR-TE12) */}
          <div class="section-card">
            <div class="section-header">
              <div class="section-title-wrap">
                <div class="section-icon">H</div>
                <div class="section-title">Text effects</div>
              </div>
              <div class="section-actions">
                {activeEffectType !== 'none' && (
                  <button
                    type="button"
                    class="section-reset-btn"
                    title="Reset text effects"
                    onClick={handleResetTextEffects}
                  >
                    ↺
                  </button>
                )}

                <div class="effect-dropdown-wrap">
                  <button
                    type="button"
                    class="effect-dropdown-trigger"
                    onClick={() => setIsEffectsMenuOpen(!isEffectsMenuOpen)}
                  >
                    <span>
                      {activeDescriptor.name.length > 14
                        ? `${activeDescriptor.name.slice(0, 14)}…`
                        : activeDescriptor.name}
                    </span>
                    <span>{isEffectsMenuOpen ? '▴' : '▾'}</span>
                  </button>

                  {/* Dropdown Menu List with Live Hover Preview */}
                  {isEffectsMenuOpen && (
                    <ul class="effect-dropdown-menu">
                      {TEXT_EFFECTS_CATALOG.map((item) => (
                        <li
                          key={item.id}
                          class={`effect-menu-item ${activeEffectType === item.id ? 'active' : ''}`}
                          onMouseEnter={() => setHoveredEffectId(item.id)}
                          onMouseLeave={() => setHoveredEffectId(null)}
                          onClick={() => handleSelectEffect(item.id)}
                        >
                          <span>{item.name}</span>
                          {activeEffectType === item.id && (
                            <span class="effect-menu-check">✓</span>
                          )}
                        </li>
                      ))}

                      {/* Floating Specimen Hover Preview Popover */}
                      {hoveredDescriptor && hoveredDescriptor.id !== 'none' && (
                        <div class="effect-hover-popover">
                          <div
                            class={`popover-title popover-preview-${hoveredDescriptor.id}`}
                          >
                            {hoveredDescriptor.previewTitle}
                          </div>
                          <div class="popover-subtitle">
                            {hoveredDescriptor.previewSubtitle}
                          </div>
                        </div>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Sub-panel Controls when Effect is Selected (Image 2) */}
            {activeEffectType !== 'none' ? (
              <div class="section-body" style="margin-top: 12px;">
                {/* 1. Text color */}
                <div class="color-swatch-row">
                  <span class="color-swatch-label">Text color</span>
                  <div class="color-swatch-wrap">
                    <span
                      class="color-swatch-circle"
                      style={{
                        backgroundColor:
                          activeRule.effectTextColor || activeRule.textColor || '#c2410c',
                      }}
                      title="Pick text color"
                    >
                      <input
                        type="color"
                        value={
                          activeRule.effectTextColor || activeRule.textColor || '#c2410c'
                        }
                        onInput={(e) =>
                          handleUpdateActiveRule(
                            'effectTextColor',
                            (e.target as HTMLInputElement).value
                          )
                        }
                      />
                    </span>
                    <button
                      type="button"
                      class="swatch-clear-btn"
                      title="Reset text color"
                      onClick={() => handleUpdateActiveRule('effectTextColor', '#c2410c')}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 2. Accent color */}
                <div class="color-swatch-row">
                  <span class="color-swatch-label">Accent color</span>
                  <div class="color-swatch-wrap">
                    <span
                      class="color-swatch-circle"
                      style={{
                        backgroundColor: activeRule.effectAccentColor || '#0f172a',
                      }}
                      title="Pick accent color"
                    >
                      <input
                        type="color"
                        value={activeRule.effectAccentColor || '#0f172a'}
                        onInput={(e) =>
                          handleUpdateActiveRule(
                            'effectAccentColor',
                            (e.target as HTMLInputElement).value
                          )
                        }
                      />
                    </span>
                    <button
                      type="button"
                      class="swatch-clear-btn"
                      title="Reset accent color"
                      onClick={() => handleUpdateActiveRule('effectAccentColor', '#0f172a')}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 3. Apply style to (< All words >) */}
                <div class="stepper-row">
                  <span class="stepper-label">Apply style to</span>
                  <div class="stepper-control">
                    <button
                      type="button"
                      class="stepper-btn"
                      title="Previous word option"
                      onClick={() => cycleApplyTo('prev')}
                    >
                      ‹
                    </button>
                    <span class="stepper-value">
                      {applyToLabels[activeRule.effectApplyTo || 'all']}
                    </span>
                    <button
                      type="button"
                      class="stepper-btn"
                      title="Next word option"
                      onClick={() => cycleApplyTo('next')}
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* 4. Animation speed (- Medium +) */}
                <div class="stepper-row">
                  <span class="stepper-label">Animation speed</span>
                  <div class="stepper-control">
                    <button
                      type="button"
                      class="stepper-btn"
                      title="Slower speed"
                      onClick={() => cycleSpeed('prev')}
                    >
                      –
                    </button>
                    <span class="stepper-value">
                      {speedLabels[activeRule.effectSpeed || 'medium']}
                    </span>
                    <button
                      type="button"
                      class="stepper-btn"
                      title="Faster speed"
                      onClick={() => cycleSpeed('next')}
                    >
                      +
                    </button>
                  </div>
                </div>

                <p class="section-desc" style="margin: 10px 0 0 0;">
                  A range of visual design effects to make your headings stand out.
                </p>
              </div>
            ) : (
              <p class="section-desc" style="margin: 8px 0 0 0;">
                A range of visual design effects to make your headings stand out.
              </p>
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
                <button type="button" class="section-reset-btn" title="Reset word loop">
                  ↺
                </button>
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
                <select
                  style="width: auto; padding: 4px 8px; font-size: 12px; font-weight: 600;"
                  disabled
                >
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
            <b>No text element selected</b>
            <br />
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
