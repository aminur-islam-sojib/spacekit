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
