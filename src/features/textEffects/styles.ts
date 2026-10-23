import type { TextEffectsConfig } from './schema.js';
import { SELECTORS } from '../../adapters/squarespace.js';

export function withPseudo(selectorList: string, pseudo: string): string {
  return selectorList
    .split(',')
    .map((s) => `${s.trim()}${pseudo}`)
    .join(', ');
}

export function normalizeTargetId(rawId: string): string[] {
  if (!rawId || !rawId.trim()) return [];
  return rawId
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((id) => {
      // If user typed e.g. "block-yui_123" or "hero", prepend "#"
      if (!id.startsWith('#') && !id.startsWith('.') && !id.startsWith('[')) {
        return `#${id}`;
      }
      return id;
    });
}

export function getTextTargetSelector(target: string, targetId?: string): string {
  const ids = targetId ? normalizeTargetId(targetId) : [];

  // Global selector fallback when no targetId is specified
  if (ids.length === 0) {
    switch (target) {
      case 'h1':
        return SELECTORS.headingsH1;
      case 'h2':
        return SELECTORS.headingsH2;
      case 'h3':
        return SELECTORS.headingsH3;
      case 'all':
        return SELECTORS.allText;
      case 'headings':
      default:
        return SELECTORS.headingsAll;
    }
  }

  // Determine tag list to scope
  let tags: string[] = ['h1'];
  switch (target) {
    case 'h2':
      tags = ['h2'];
      break;
    case 'h3':
      tags = ['h3'];
      break;
    case 'all':
      tags = ['h1', 'h2', 'h3', 'h4', 'p'];
      break;
    case 'headings':
      tags = ['h1', 'h2', 'h3', 'h4'];
      break;
    case 'h1':
    default:
      tags = ['h1'];
      break;
  }

  // Scoped selectors by ID
  const scopedSelectors: string[] = [];
  for (const id of ids) {
    for (const tag of tags) {
      scopedSelectors.push(
        `${id} [data-sqsp-text-block-content] ${tag}`,
        `${id} .sqs-block-html ${tag}`,
        `${id} ${tag}`,
        `${id}:is(${tag})`
      );
    }
  }

  return scopedSelectors.join(', ');
}

export function generateTextEffectsCss(cfg: TextEffectsConfig): string {
  const targetSel = getTextTargetSelector(cfg.target, cfg.targetId);

  // Gradient text
  let gradientCss = '';
  let keyframesCss = '';
  if (cfg.gradientEnabled) {
    const angle = typeof cfg.gradientAngle === 'number' ? cfg.gradientAngle : 135;
    if (cfg.gradientAnimate) {
      gradientCss = `
  background: linear-gradient(${angle}deg, ${cfg.gradientStart}, ${cfg.gradientEnd}, ${cfg.gradientStart}) !important;
  background-size: 200% auto !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  display: inline-block;
  animation: sitekit-text-gradient-pan 6s linear infinite !important;
`;
      keyframesCss = `
@keyframes sitekit-text-gradient-pan {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
`;
    } else {
      gradientCss = `
  background: linear-gradient(${angle}deg, ${cfg.gradientStart}, ${cfg.gradientEnd}) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  display: inline-block;
`;
    }
  }

  // Shadow / Glow
  let shadowCss = '';
  switch (cfg.shadowEffect) {
    case 'subtle':
      shadowCss = 'filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) !important;';
      break;
    case 'soft-drop':
      shadowCss = 'filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35)) !important;';
      break;
    case 'glow':
      shadowCss = `filter: drop-shadow(0 0 12px ${cfg.shadowColor}) !important;`;
      break;
    case 'retro-3d':
      shadowCss = `filter: drop-shadow(2px 2px 0px ${cfg.shadowColor}) drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.2)) !important;`;
      break;
    case 'none':
    default:
      break;
  }

  // Letter spacing
  const letterSpacingCss =
    cfg.letterSpacing !== 0 ? `letter-spacing: ${cfg.letterSpacing}px !important;` : '';

  // Highlighter effect
  let highlightRules = '';
  if (cfg.highlightEnabled) {
    let coverage = '35%';
    if (cfg.highlightStyle === 'thick') coverage = '65%';
    if (cfg.highlightStyle === 'full') coverage = '100%';

    let highlightSel = targetSel;
    if (cfg.highlightTarget === 'strong') {
      highlightSel = `${withPseudo(targetSel, ' strong')}, ${withPseudo(targetSel, ' b')}`;
    } else if (cfg.highlightTarget === 'em') {
      highlightSel = `${withPseudo(targetSel, ' em')}, ${withPseudo(targetSel, ' i')}`;
    }

    highlightRules = `
${highlightSel} {
  background-image: linear-gradient(to top, ${cfg.highlightColor} ${coverage}, transparent ${coverage}) !important;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
`;
  }

  // Accent Underline
  let underlineRules = '';
  let selAfter = '';
  if (cfg.underlineEnabled) {
    if (cfg.underlineHover === 'always') {
      underlineRules = `
${targetSel} {
  text-decoration: underline !important;
  text-decoration-color: ${cfg.underlineColor} !important;
  text-decoration-thickness: ${cfg.underlineThickness}px !important;
  text-underline-offset: 4px !important;
}
`;
    } else {
      selAfter = withPseudo(targetSel, '::after');
      const selHoverAfter = withPseudo(targetSel, ':hover::after');
      underlineRules = `
${targetSel} {
  position: relative;
  text-decoration: none !important;
}
${selAfter} {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0%;
  height: ${cfg.underlineThickness}px;
  background-color: ${cfg.underlineColor};
  transition: width 0.3s ease;
}
${selHoverAfter} {
  width: 100%;
}
`;
    }
  }

  return `
/* SiteKit Text & Heading Effects */
${targetSel} {
  ${gradientCss.trim()}
  ${shadowCss}
  ${letterSpacingCss}
}
${highlightRules}
${underlineRules}
${keyframesCss}
@media (prefers-reduced-motion: reduce) {
  ${targetSel} {
    animation: none !important;
    background-size: auto !important;
  }
  ${selAfter ? `${selAfter} { transition: none !important; }` : ''}
}
`.trim();
}

