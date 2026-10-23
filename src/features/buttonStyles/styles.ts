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

export function generateButtonCss(cfg: ButtonStylesConfig): string {
  const sel = getButtonSelector(cfg.target);

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
      const tintColor = cfg.customColors ? cfg.bg : '#0f766e';
      shadowCss = `box-shadow: 0 8px 20px ${tintColor}40;`;
      hoverShadow = `box-shadow: 0 12px 28px ${tintColor}60;`;
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
      hoverShadow = `box-shadow: 0 0 20px ${cfg.customColors ? cfg.bg : '#0f766e'};`;
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

${sel}:hover {
  ${hoverTransform}
  ${hoverShadow}
  ${hoverFilter}
}

${sel}:active {
  transform: translateY(0) scale(0.98) !important;
}

${sel}:focus-visible {
  outline: 2px solid ${cfg.customColors ? cfg.bg : '#0f766e'} !important;
  outline-offset: 3px !important;
}

@media (prefers-reduced-motion: reduce) {
  ${sel}, ${sel}:hover, ${sel}:active {
    transition: none !important;
    transform: none !important;
  }
}
`.trim();
}
