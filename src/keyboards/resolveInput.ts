import type { KeyboardLayoutDefinition, KeyDefinition } from "../types";

/**
 * Resolve what a physical key (by KeyboardEvent.code) produces on the given
 * layout, independent of whatever keyboard layout Windows/the OS currently
 * has active. This is the "direct-key mapping practice mode for browser
 * consistency" mentioned in spec section 10: the app decides the output
 * from its own layout table rather than trusting e.key, so Hindi InScript
 * typing works the same in-browser whether or not the user has actually
 * switched their OS to the InScript layout.
 */
export function resolveKeyOutput(
  layout: KeyboardLayoutDefinition,
  code: string,
  shift: boolean
): string | null {
  const key = layout.keys.find((k) => k.code === code);
  if (!key) return null;
  if (key.isModifier) {
    // Modifiers that do carry an output (Space, Enter, Tab) still return it.
    if (code === "Space") return " ";
    if (code === "Enter") return "\n";
    if (code === "Tab") return "\t";
    return null;
  }
  return shift ? key.shiftOutput ?? key.output : key.output;
}

/** Find the key definition responsible for producing a given output character. */
export function findKeyForOutput(
  layout: KeyboardLayoutDefinition,
  char: string
): KeyDefinition | null {
  if (char === " ") return layout.keys.find((k) => k.code === "Space") ?? null;
  return (
    layout.keys.find((k) => k.output === char || k.shiftOutput === char) ?? null
  );
}

/** True when producing this character requires holding Shift on this layout. */
export function outputRequiresShift(layout: KeyboardLayoutDefinition, char: string): boolean {
  const key = findKeyForOutput(layout, char);
  if (!key) return false;
  return key.shiftOutput === char && key.output !== char;
}
