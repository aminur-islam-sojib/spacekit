import type { StyledTextRule, TextEffectsConfig } from './schema.js';

export function generateRuleCss(rule: StyledTextRule): string {
  const targetSel = rule.selector ? rule.selector.trim() : '';
  if (!targetSel) return '';

  const effectType =
    rule.effectType && rule.effectType !== 'none'
      ? rule.effectType
      : rule.gradientEnabled
        ? 'gradient'
        : rule.underlineEnabled
          ? 'underline'
          : rule.highlightEnabled
            ? 'fill'
            : (rule.effectType || 'none');

  const isTransparentFillEffect = ['gradient', 'colorful', 'candy-cane', 'stroke', 'fill-on-scroll'].includes(effectType);

  let textOptionsDesktopCss = '';
  let textOptionsMobileCss = '';

  if (rule.textOptionsEnabled) {
    const desktopDecls: string[] = [];
    const desktopInnerDecls: string[] = [];

    // 1. Text color (applies to target and all inner spans/children unless visual effect masks fill)
    const textColor = rule.textColor || '#ffffff';
    if (!isTransparentFillEffect) {
      desktopDecls.push(`color: ${textColor} !important;`);
      desktopInnerDecls.push(`color: ${textColor} !important;`);
    }

    // 2. Desktop font size (applies to target and all inner spans/children)
    const fontSize = typeof rule.fontSize === 'number' && rule.fontSize > 0 ? rule.fontSize : 48;
    desktopDecls.push(`font-size: ${fontSize}px !important;`);
    desktopInnerDecls.push(`font-size: ${fontSize}px !important;`);

    // 3. Formatting
    if (rule.format === 'bold') {
      desktopDecls.push('font-weight: 700 !important;');
      desktopInnerDecls.push('font-weight: 700 !important;');
    } else if (rule.format === 'italic') {
      desktopDecls.push('font-style: italic !important;');
      desktopInnerDecls.push('font-style: italic !important;');
    } else if (rule.format === 'underline' && effectType !== 'underline') {
      desktopDecls.push('text-decoration: underline !important;');
      desktopInnerDecls.push('text-decoration: underline !important;');
    } else if (rule.format === 'strike') {
      desktopDecls.push('text-decoration: line-through !important;');
      desktopInnerDecls.push('text-decoration: line-through !important;');
    }

    // 4. Desktop alignment
    const align = rule.align || 'left';
    desktopDecls.push(`text-align: ${align} !important;`);
    desktopDecls.push('display: block !important;');
    desktopDecls.push('width: 100% !important;');

    // 5. Line gap (line-height)
    const lineGap = typeof rule.lineGap === 'number' && rule.lineGap > 0 ? rule.lineGap : 1.2;
    desktopDecls.push(`line-height: ${lineGap} !important;`);
    desktopInnerDecls.push(`line-height: ${lineGap} !important;`);

    if (desktopDecls.length > 0) {
      textOptionsDesktopCss = `
${targetSel} {
  ${desktopDecls.join('\n  ')}
}
${targetSel} *,
${targetSel} span {
  ${desktopInnerDecls.join('\n  ')}
}
`;
    }

    // Mobile overrides (@media (max-width: 767px) + Squarespace in-editor mobile view)
    const mobileFontSize = typeof rule.mobileFontSize === 'number' && rule.mobileFontSize > 0 ? rule.mobileFontSize : 32;
    const mobileAlign = rule.mobileAlign || align;

    const mobileDecls = [
      `font-size: ${mobileFontSize}px !important;`,
      `text-align: ${mobileAlign} !important;`,
      'display: block !important;',
      'width: 100% !important;',
    ];
    const mobileInnerDecls = [
      `font-size: ${mobileFontSize}px !important;`,
    ];

    if (mobileDecls.length > 0) {
      textOptionsMobileCss = `
@media (max-width: 767px), (max-device-width: 767px) {
  ${targetSel} {
    ${mobileDecls.join('\n    ')}
  }
  ${targetSel} *,
  ${targetSel} span {
    ${mobileInnerDecls.join('\n    ')}
  }
}
body.sqs-mobile-view ${targetSel},
.sqs-layout-preview-mobile ${targetSel} {
  ${mobileDecls.join('\n  ')}
}
body.sqs-mobile-view ${targetSel} *,
.sqs-layout-preview-mobile ${targetSel} * {
  ${mobileInnerDecls.join('\n  ')}
}
`;
    }
  }

  // Determine selector targeted by visual text effect (All words vs First word vs Last word)
  const effectSel =
    rule.effectApplyTo === 'first-word'
      ? `${targetSel} [data-sk-word="first"], ${targetSel} .sk-word-first`
      : rule.effectApplyTo === 'last-word'
        ? `${targetSel} [data-sk-word="last"], ${targetSel} .sk-word-last`
        : `${targetSel}, ${targetSel} span, ${targetSel} *`;

  // Color & speed parameters
  const effectTextColor =
    (rule.gradientEnabled && rule.gradientStart)
      ? rule.gradientStart
      : (rule.effectTextColor || rule.textColor || '#c2410c');

  const effectAccentColor =
    (rule.gradientEnabled && rule.gradientEnd)
      ? rule.gradientEnd
      : (rule.effectAccentColor || '#0f172a');

  const angle =
    rule.gradientEnabled && typeof rule.gradientAngle === 'number'
      ? rule.gradientAngle
      : (typeof rule.effectAngle === 'number' ? rule.effectAngle : 135);

  const thickness = typeof rule.effectThickness === 'number' ? rule.effectThickness : (typeof rule.underlineThickness === 'number' ? rule.underlineThickness : (rule.underlineEnabled ? 4 : 2));
  const speedSec = rule.effectSpeed === 'slow' ? 9 : (rule.effectSpeed === 'fast' ? 2.5 : 5);

  let visualEffectCss = '';
  let keyframesCss = '';

  switch (effectType) {
    case 'gradient': {
      const isAnimated = rule.effectType === 'gradient' || Boolean(rule.gradientAnimate);

      if (isAnimated) {
        visualEffectCss = `
${effectSel} {
  background: linear-gradient(${angle}deg, ${effectTextColor}, ${effectAccentColor}, ${effectTextColor}) !important;
  background-size: 200% auto !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  display: inline-block;
  animation: sitekit-text-gradient-pan ${speedSec}s linear infinite !important;
}
`;
        keyframesCss = `
@keyframes sitekit-text-gradient-pan {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
`;
      } else {
        visualEffectCss = `
${effectSel} {
  background: linear-gradient(${angle}deg, ${effectTextColor}, ${effectAccentColor}) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  display: inline-block;
}
`;
      }
      break;
    }

    case 'fill-on-scroll': {
      visualEffectCss = `
${effectSel} {
  background: linear-gradient(to right, ${effectAccentColor} var(--sk-scroll-fill, 50%), ${effectTextColor} var(--sk-scroll-fill, 50%)) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  display: inline-block;
  transition: background 0.1s ease;
}
`;
      break;
    }

    case 'reveal-on-scroll': {
      visualEffectCss = `
${effectSel} {
  transition: filter ${speedSec * 0.25}s ease, opacity ${speedSec * 0.25}s ease, transform ${speedSec * 0.25}s ease !important;
  filter: blur(0px) !important;
  opacity: 1 !important;
}
${targetSel}:not(.sk-revealed) ${effectSel} {
  filter: blur(6px) !important;
  opacity: 0.25 !important;
  transform: translateY(6px) !important;
}
`;
      break;
    }

    case 'underline': {
      if (rule.underlineHover === 'hover') {
        const selAfter = `${targetSel}::after`;
        const selHoverAfter = `${targetSel}:hover::after`;
        visualEffectCss = `
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
  height: ${thickness}px;
  background-color: ${rule.underlineColor || effectAccentColor};
  transition: width 0.3s ease;
}
${selHoverAfter} {
  width: 100%;
}
`;
      } else {
        visualEffectCss = `
${effectSel} {
  text-decoration: underline !important;
  text-decoration-color: ${rule.underlineColor || effectAccentColor} !important;
  text-decoration-thickness: ${thickness}px !important;
  text-underline-offset: 4px !important;
}
`;
      }
      break;
    }

    case 'stroke': {
      visualEffectCss = `
${effectSel} {
  -webkit-text-stroke: ${thickness}px ${effectAccentColor} !important;
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
}
`;
      break;
    }

    case 'colorful': {
      visualEffectCss = `
${effectSel} {
  background: linear-gradient(135deg, #f43f5e, #8b5cf6, #06b6d4, #10b981, #f59e0b) !important;
  background-size: 300% 300% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  display: inline-block;
  animation: sitekit-colorful-shimmer ${speedSec}s ease infinite alternate !important;
}
`;
      keyframesCss = `
@keyframes sitekit-colorful-shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
`;
      break;
    }

    case 'fill': {
      let coverage = '45%';
      if (rule.highlightStyle === 'underline') coverage = '35%';
      else if (rule.highlightStyle === 'thick') coverage = '65%';
      else if (rule.highlightStyle === 'full') coverage = '100%';
      const fillColor = rule.highlightColor || effectAccentColor;
      visualEffectCss = `
${effectSel} {
  background-image: linear-gradient(to top, ${fillColor} ${coverage}, transparent ${coverage}) !important;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  padding: 0 4px;
  border-radius: 2px;
}
`;
      break;
    }

    case 'strong-fill': {
      visualEffectCss = `
${effectSel} {
  background-color: ${effectAccentColor} !important;
  color: ${effectTextColor} !important;
  -webkit-text-fill-color: ${effectTextColor} !important;
  padding: 2px 8px;
  border-radius: 6px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
`;
      break;
    }

    case 'candy-cane': {
      visualEffectCss = `
${effectSel} {
  background: repeating-linear-gradient(${angle}deg, ${effectTextColor}, ${effectTextColor} 10px, ${effectAccentColor} 10px, ${effectAccentColor} 20px) !important;
  background-size: 200% 200% !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  display: inline-block;
  animation: sitekit-candycane-move ${speedSec}s linear infinite !important;
}
`;
      keyframesCss = `
@keyframes sitekit-candycane-move {
  0% { background-position: 0 0; }
  100% { background-position: 40px 40px; }
}
`;
      break;
    }

    case 'none':
    default:
      break;
  }

  // Shadow preset (if configured)
  let shadowCss = '';
  switch (rule.shadowEffect) {
    case 'subtle':
      shadowCss = 'filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) !important;';
      break;
    case 'soft-drop':
      shadowCss = 'filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35)) !important;';
      break;
    case 'glow':
      shadowCss = `filter: drop-shadow(0 0 12px ${rule.shadowColor || '#0f766e'}) !important;`;
      break;
    case 'retro-3d':
      shadowCss = `filter: drop-shadow(2px 2px 0px ${rule.shadowColor || '#0f766e'}) drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.2)) !important;`;
      break;
    default:
      break;
  }

  const letterSpacingCss =
    rule.letterSpacing && rule.letterSpacing !== 0 ? `letter-spacing: ${rule.letterSpacing}px !important;` : '';

  const extraRules =
    shadowCss || letterSpacingCss
      ? `
${targetSel} {
  ${shadowCss}
  ${letterSpacingCss}
}
`
      : '';

  const reducedMotionRules = `
@media (prefers-reduced-motion: reduce) {
  ${effectSel} {
    animation: none !important;
    background-size: auto !important;
    transition: none !important;
  }
}
`;

  return `
${textOptionsDesktopCss}
${visualEffectCss}
${extraRules}
${textOptionsMobileCss}
${keyframesCss}
${reducedMotionRules}
`.trim();
}

export function generateTextEffectsCss(cfg: TextEffectsConfig): string {
  if (!Array.isArray(cfg.rules) || cfg.rules.length === 0) {
    return '';
  }

  if (cfg.enabled === false && !cfg.rules.some((r) => r && r.enabled)) {
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
