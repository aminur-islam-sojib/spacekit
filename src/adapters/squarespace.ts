/**
 * All Squarespace-specific selectors and DOM assumptions live in this file.
 * Non-negotiable rule 2: Prefer attributes from Squarespace's Custom Code Specification.
 * Anything else must be marked `// UNSTABLE` and have a fallback and a test.
 */

export const SELECTORS = {
  // Official Custom Code Specification (stable)
  section: '[data-sqsp-section]',
  block: (type: string): string => `[data-sqsp-block="${type}"]`,
  textContent: '[data-sqsp-text-block-content]',
  button: '[data-sqsp-button]',
  imageBlock: '[data-sqsp-image-block-image]',

  // Community-documented / Empirically Verified (NOT guaranteed by Squarespace) - UNSTABLE
  // UNSTABLE: Squarespace editor mode indicators
  editMode: 'body.sqs-edit-mode',
  editActive: 'body.sqs-edit-mode-active',
  configMode: 'body.squarespace-config',
  editableMode: 'body.squarespace-editable',
  // UNSTABLE: Section identity attribute (may change on section conversion)
  sectionIdAttr: 'data-section-id',
  // UNSTABLE: Squarespace 7.1 Header container
  header: 'header#header, header.header, #header',
  // UNSTABLE: Squarespace 7.1 button selectors with class-based fallbacks (scoped to interactive a and button tags)
  buttonsAll:
    'a[data-sqsp-button], button[data-sqsp-button], a.sqs-block-button-element, button.sqs-block-button-element, a.sqs-button-element--primary, button.sqs-button-element--primary, a.sqs-button-element--secondary, button.sqs-button-element--secondary, a.sqs-button-element--tertiary, button.sqs-button-element--tertiary',
  buttonsPrimary:
    'a[data-sqsp-button]:not(.sqs-button-element--secondary):not(.sqs-button-element--tertiary), button[data-sqsp-button]:not(.sqs-button-element--secondary):not(.sqs-button-element--tertiary), a.sqs-button-element--primary, button.sqs-button-element--primary',
  buttonsSecondary: 'a.sqs-button-element--secondary, button.sqs-button-element--secondary',
  buttonsTertiary: 'a.sqs-button-element--tertiary, button.sqs-button-element--tertiary',
  // UNSTABLE: Squarespace 7.1 text & heading selectors with class-based fallbacks
  headingsAll:
    '[data-sqsp-text-block-content] h1, [data-sqsp-text-block-content] h2, [data-sqsp-text-block-content] h3, [data-sqsp-text-block-content] h4, .sqs-block-html h1, .sqs-block-html h2, .sqs-block-html h3, .sqs-block-html h4',
  headingsH1: '[data-sqsp-text-block-content] h1, .sqs-block-html h1',
  headingsH2: '[data-sqsp-text-block-content] h2, .sqs-block-html h2',
  headingsH3: '[data-sqsp-text-block-content] h3, .sqs-block-html h3',
  allText:
    '[data-sqsp-text-block-content] p, [data-sqsp-text-block-content] h1, [data-sqsp-text-block-content] h2, [data-sqsp-text-block-content] h3, [data-sqsp-text-block-content] h4, .sqs-block-html p, .sqs-block-html h1, .sqs-block-html h2',
} as const;

/**
 * Detects whether the current page is being viewed inside the Squarespace editor.
 * Uses verified empirical classes ('squarespace-config', 'squarespace-editable'),
 * community classes ('sqs-edit-mode'), pathname (/config/), and query param / hash fallback.
 */
export function detectEditor(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  // 1. Manual override flags
  const params = new URLSearchParams(window.location.search);
  if (params.get('sitekit') === 'edit' || window.location.hash === '#sitekit-edit') {
    return true;
  }

  // 2. Path-based detection (Squarespace admin backend URLs start with /config)
  if (window.location.pathname.startsWith('/config')) {
    return true;
  }

  // 3. Body class detection (verified empirical classes + community conventions)
  const body = document.body;
  if (body) {
    const list = body.classList;
    if (
      list.contains('squarespace-config') ||
      list.contains('squarespace-editable') ||
      list.contains('sqs-edit-mode') ||
      list.contains('sqs-edit-mode-active')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if an element is a Squarespace button element.
 */
export function isButtonElement(el: HTMLElement): boolean {
  if (!el || typeof el.closest !== 'function') return false;
  return Boolean(
    el.closest(
      'a.sqs-block-button-element, button.sqs-block-button-element, .sqs-button-element--primary, .sqs-button-element--secondary, .sqs-button-element--tertiary, [data-sqsp-button], .sqs-block-button a, .sqs-block-button button, a.sqs-button-element'
    )
  );
}

/**
 * Checks if an element is a text/heading element.
 */
export function isTextElement(el: HTMLElement): boolean {
  if (!el || typeof el.closest !== 'function') return false;
  // If it's a button, it takes precedence as a button
  if (isButtonElement(el)) return false;
  return Boolean(
    el.closest(
      'h1, h2, h3, h4, h5, h6, p, blockquote, .sqsrte-large, .sqsrte-small, [data-sqsp-text-block-content] *'
    )
  );
}

