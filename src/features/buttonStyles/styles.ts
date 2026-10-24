import type { ButtonStylesConfig, StyledButtonRule } from './schema.js';
import { SELECTORS } from '../../adapters/squarespace.js';

export function getButtonSelector(target: string = 'all'): string {
  switch (target) {
    case 'primary':
      return SELECTORS.buttonsPrimary;
    case 'secondary':
      return SELECTORS.buttonsSecondary;
    case 'tertiary':
      return SELECTORS.buttonsTertiary;
    case 'all':
    default:
      return SELECTORS.buttonsAll;
  }
}

export function withPseudo(selectorList: string, pseudo: string): string {
  return selectorList
    .split(',')
    .map((s) => `${s.trim()}${pseudo}`)
    .join(', ');
}

export function generateButtonRuleCss(rule: StyledButtonRule): string {
  const sel = rule.selector || SELECTORS.buttonsAll;
  const selHover = withPseudo(sel, ':hover');
  const selActive = withPseudo(sel, ':active');
  const selFocusNoVis = withPseudo(sel, ':focus:not(:focus-visible)');
  const selFocusVis = withPseudo(sel, ':focus-visible');

  // Accent color used for fallback glow/tint
  const accentColor = rule.customColors
    ? rule.bg
    : rule.borderWidth > 0 && rule.borderStyle !== 'none'
      ? rule.borderColor
      : '#0f766e';

  // Border CSS
  let borderCss = 'border: none;';
  if (rule.borderWidth > 0 && rule.borderStyle !== 'none') {
    borderCss = `border: ${rule.borderWidth}px ${rule.borderStyle} ${rule.borderColor} !important;`;
  }

  // Shadow CSS
  let shadowCss = 'box-shadow: none;';
  let hoverShadow = '';
  switch (rule.shadow) {
    case 'subtle':
      shadowCss = 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);';
      hoverShadow = 'box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);';
      break;
    case 'medium':
      shadowCss = 'box-shadow: 0 8px 20px rgba(0, 0, 0, 0.14);';
      hoverShadow = 'box-shadow: 0 12px 28px rgba(0, 0, 0, 0.20);';
      break;
    case 'dramatic':
      shadowCss = 'box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);';
      hoverShadow = 'box-shadow: 0 20px 38px rgba(0, 0, 0, 0.30);';
      break;
    case 'colored': {
      shadowCss = `box-shadow: 0 8px 20px ${accentColor}40;`;
      hoverShadow = `box-shadow: 0 12px 28px ${accentColor}60;`;
      break;
    }
    case 'none':
    default:
      shadowCss = 'box-shadow: none;';
      hoverShadow = 'box-shadow: none;';
      break;
  }

  // Hover animation
  let hoverTransform = '';
  let hoverFilter = '';
  switch (rule.hoverEffect) {
    case 'lift':
      hoverTransform = 'transform: translateY(-3px);';
      break;
    case 'scale':
      hoverTransform = 'transform: scale(1.04);';
      break;
    case 'glow':
      hoverShadow = `box-shadow: 0 0 20px ${accentColor};`;
      break;
    case 'shine':
      hoverFilter = 'filter: brightness(1.12);';
      break;
    case 'none':
    default:
      break;
  }

  // Colors
  let colorsCss = '';
  if (rule.customColors) {
    if (rule.useGradient) {
      const angle = typeof rule.gradientAngle === 'number' ? rule.gradientAngle : 135;
      const end = rule.bgGradientEnd || '#0d9488';
      colorsCss = `background: linear-gradient(${angle}deg, ${rule.bg}, ${end}) !important; color: ${rule.fg} !important;`;
    } else {
      colorsCss = `background: ${rule.bg} !important; color: ${rule.fg} !important;`;
    }
  }

  return `
/* SiteKit Button Rule: ${rule.label} */
${sel} {
  border-radius: ${rule.radius}px !important;
  ${borderCss}
  padding: ${rule.paddingY}px ${rule.paddingX}px !important;
  font-weight: ${rule.fontWeight} !important;
  letter-spacing: ${rule.letterSpacing}px !important;
  ${shadowCss}
  ${colorsCss}
  min-height: 44px;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease, background 0.2s ease !important;
}

${selHover} {
  ${hoverTransform}
  ${hoverShadow}
  ${hoverFilter}
}

${selActive} {
  transform: translateY(0) scale(0.98) !important;
}

${selFocusNoVis} {
  outline: none !important;
}

${selFocusVis} {
  outline: 2px solid currentColor !important;
  outline-offset: -2px !important;
}

@media (prefers-reduced-motion: reduce) {
  ${sel}, ${selHover}, ${selActive} {
    transition: none !important;
    transform: none !important;
  }
}
`.trim();
}

export function generateButtonCss(cfg: ButtonStylesConfig): string {
  // If per-element rules are configured, generate CSS for each rule
  if (Array.isArray(cfg.rules) && cfg.rules.length > 0) {
    const activeRules = cfg.rules.filter((r) => r.enabled !== false);
    if (activeRules.length === 0) return '';
    return activeRules.map((r) => generateButtonRuleCss(r)).join('\n\n');
  }

  // Fallback: Legacy global configuration
  const legacyRule: StyledButtonRule = {
    id: 'legacy-global',
    selector: getButtonSelector(cfg.target || 'all'),
    label: 'Global Button Styles',
    enabled: true,
    radius: typeof cfg.radius === 'number' ? cfg.radius : 8,
    borderWidth: typeof cfg.borderWidth === 'number' ? cfg.borderWidth : 0,
    borderStyle: cfg.borderStyle || 'none',
    borderColor: cfg.borderColor || '#0f766e',
    hoverEffect: cfg.hoverEffect || 'lift',
    shadow: cfg.shadow || 'subtle',
    paddingY: typeof cfg.paddingY === 'number' ? cfg.paddingY : 12,
    paddingX: typeof cfg.paddingX === 'number' ? cfg.paddingX : 24,
    fontWeight: cfg.fontWeight || '600',
    letterSpacing: typeof cfg.letterSpacing === 'number' ? cfg.letterSpacing : 1,
    customColors: Boolean(cfg.customColors),
    bg: cfg.bg || '#0f766e',
    useGradient: Boolean(cfg.useGradient),
    bgGradientEnd: cfg.bgGradientEnd || '#0d9488',
    gradientAngle: typeof cfg.gradientAngle === 'number' ? cfg.gradientAngle : 135,
    fg: cfg.fg || '#ffffff',
  };

  return generateButtonRuleCss(legacyRule);
}
