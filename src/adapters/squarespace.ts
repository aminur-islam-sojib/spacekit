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

  // Community-documented (NOT guaranteed by Squarespace) - UNSTABLE
  // UNSTABLE: Squarespace editor mode indicators
  editMode: 'body.sqs-edit-mode',
  editActive: 'body.sqs-edit-mode-active',
  // UNSTABLE: Section identity attribute (may change on section conversion)
  sectionIdAttr: 'data-section-id',
} as const;

/**
 * Detects whether the current page is being viewed inside the Squarespace editor.
 * Uses community body class with manual query param / hash fallback.
 */
export function detectEditor(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  const hasEditFlag = params.get('sitekit') === 'edit' || window.location.hash === '#sitekit-edit';
  // UNSTABLE: body.sqs-edit-mode is community-documented
  const hasEditClass = document.body ? document.body.classList.contains('sqs-edit-mode') : false;
  return hasEditFlag || hasEditClass;
}
