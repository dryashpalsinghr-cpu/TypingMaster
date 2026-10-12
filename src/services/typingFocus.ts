/** Global practice shortcuts must not consume keys intended for another control. */
export function isTypingControl(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest('input, textarea, select, button, a, [contenteditable=""], [contenteditable="true"], [role="dialog"], [role="menu"], [role="button"]');
}
export function shouldIgnorePracticeKey(target: EventTarget | null): boolean {
  return isTypingControl(target) || !!document.querySelector('[aria-modal="true"], .app-shell[data-nav-open="true"]');
}
