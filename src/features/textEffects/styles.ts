import type { StyledTextRule, TextEffectsConfig } from './schema.js';

export function generateRuleCss(rule: StyledTextRule): string {
  const targetSel = rule.selector ? rule.selector.trim() : '';
  if (!targetSel) return '';

  let gradientCss = '';
  let keyframesCss = '';
  if (rule.gradientEnabled) {
    const angle = typeof rule.gradientAngle === 'number' ? rule.gradientAngle : 135;
    if (rule.gradientAnimate) {
      gradientCss = `
  background: linear-gradient(${angle}deg, ${rule.gradientStart}, ${rule.gradientEnd}, ${rule.gradientStart}) !important;
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
  background: linear-gradient(${angle}deg, ${rule.gradientStart}, ${rule.gradientEnd}) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  display: inline-block;
`;
    }
  }

  let shadowCss = '';
  switch (rule.shadowEffect) {
    case 'subtle':
      shadowCss = 'filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) !important;';
      break;
    case 'soft-drop':
      shadowCss = 'filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35)) !important;';
      break;
    case 'glow':
      shadowCss = `filter: drop-shadow(0 0 12px ${rule.shadowColor}) !important;`;
      break;
    case 'retro-3d':
      shadowCss = `filter: drop-shadow(2px 2px 0px ${rule.shadowColor}) drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.2)) !important;`;
      break;
    case 'none':
    default:
      break;
  }

  const letterSpacingCss =
    rule.letterSpacing !== 0 ? `letter-spacing: ${rule.letterSpacing}px !important;` : '';

  let highlightRules = '';
  if (rule.highlightEnabled) {
    let coverage = '35%';
    if (rule.highlightStyle === 'thick') coverage = '65%';
    if (rule.highlightStyle === 'full') coverage = '100%';

    highlightRules = `
${targetSel} {
  background-image: linear-gradient(to top, ${rule.highlightColor} ${coverage}, transparent ${coverage}) !important;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
`;
  }

  let underlineRules = '';
  let selAfter = '';
  if (rule.underlineEnabled) {
    if (rule.underlineHover === 'always') {
      underlineRules = `
${targetSel} {
  text-decoration: underline !important;
  text-decoration-color: ${rule.underlineColor} !important;
  text-decoration-thickness: ${rule.underlineThickness}px !important;
  text-underline-offset: 4px !important;
}
`;
    } else {
      selAfter = `${targetSel}::after`;
      const selHoverAfter = `${targetSel}:hover::after`;
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
  height: ${rule.underlineThickness}px;
  background-color: ${rule.underlineColor};
  transition: width 0.3s ease;
}
${selHoverAfter} {
  width: 100%;
}
`;
    }
  }

  const baseRules =
    gradientCss || shadowCss || letterSpacingCss
      ? `
${targetSel} {
  ${gradientCss.trim()}
  ${shadowCss}
  ${letterSpacingCss}
}
`
      : '';

  const reducedMotionRules = `
@media (prefers-reduced-motion: reduce) {
  ${targetSel} {
    animation: none !important;
    background-size: auto !important;
  }
  ${selAfter ? `${selAfter} { transition: none !important; }` : ''}
}
`;

  return `
${baseRules}
${highlightRules}
${underlineRules}
${keyframesCss}
${reducedMotionRules}
`.trim();
}

export function generateTextEffectsCss(cfg: TextEffectsConfig): string {
  if (!cfg.enabled || !Array.isArray(cfg.rules) || cfg.rules.length === 0) {
    return '';
  }

  const chunks: string[] = ['/* SiteKit Text & Heading Effects */'];
  for (const rule of cfg.rules) {
    if (rule && rule.enabled && rule.selector) {
      const css = generateRuleCss(rule);
      if (css) chunks.push(css);
    }
  }

  if (chunks.length <= 1) return '';
  return chunks.join('\n\n').trim();
}
