import type { ButtonStylesConfig } from './schema.js';
import { SELECTORS } from '../../adapters/squarespace.js';

export function getButtonSelector(target: string): string {
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

export function generateButtonCss(cfg: ButtonStylesConfig): string {
  const sel = getButtonSelector(cfg.target);
  const selHover = withPseudo(sel, ':hover');
  const selActive = withPseudo(sel, ':active');
  const selFocusNoVis = withPseudo(sel, ':focus:not(:focus-visible)');
  const selFocusVis = withPseudo(sel, ':focus-visible');

  // Accent color used for fallback glow/tint
  const accentColor = cfg.customColors
    ? cfg.bg
    : cfg.borderWidth > 0 && cfg.borderStyle !== 'none'
      ? cfg.borderColor
      : '#0f766e';

  // Border CSS
  let borderCss = 'border: none;';
  if (cfg.borderWidth > 0 && cfg.borderStyle !== 'none') {
    borderCss = `border: ${cfg.borderWidth}px ${cfg.borderStyle} ${cfg.borderColor} !important;`;
  }

  // Shadow CSS
  let shadowCss = 'box-shadow: none;';
  let hoverShadow = '';
  switch (cfg.shadow) {
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
  switch (cfg.hoverEffect) {
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
  if (cfg.customColors) {
    if (cfg.useGradient) {
      const angle = typeof cfg.gradientAngle === 'number' ? cfg.gradientAngle : 135;
      const end = cfg.bgGradientEnd || '#0d9488';
      colorsCss = `background: linear-gradient(${angle}deg, ${cfg.bg}, ${end}) !important; color: ${cfg.fg} !important;`;
    } else {
      colorsCss = `background: ${cfg.bg} !important; color: ${cfg.fg} !important;`;
    }
  }

  return `
/* SiteKit Button Styling Pack */
${sel} {
  border-radius: ${cfg.radius}px !important;
  ${borderCss}
  padding: ${cfg.paddingY}px ${cfg.paddingX}px !important;
  font-weight: ${cfg.fontWeight} !important;
  letter-spacing: ${cfg.letterSpacing}px !important;
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

