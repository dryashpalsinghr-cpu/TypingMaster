export interface KeyInfo { finger: string; hand: "left" | "right"; }
const GROUPS: { finger: string; hand: "left" | "right"; keys: string[] }[] = [
  { finger: "L pinky", hand: "left", keys: ["1", "q", "a", "z"] },
  { finger: "L ring", hand: "left", keys: ["2", "w", "s", "x"] },
  { finger: "L middle", hand: "left", keys: ["3", "e", "d", "c"] },
  { finger: "L index", hand: "left", keys: ["4", "5", "r", "t", "f", "g", "v", "b"] },
  { finger: "R index", hand: "right", keys: ["6", "7", "y", "u", "h", "j", "n", "m"] },
  { finger: "R middle", hand: "right", keys: ["8", "i", "k", ","] },
  { finger: "R ring", hand: "right", keys: ["9", "o", "l", "."] },
  { finger: "R pinky", hand: "right", keys: ["0", "p", ";", "/"] },
];
export const FINGER_MAP: Record<string, KeyInfo> = (() => {
  const m: Record<string, KeyInfo> = {};
  for (const g of GROUPS) for (const k of g.keys) m[k] = { finger: g.finger, hand: g.hand };
  return m;
})();
export function fingerForKey(ch: string): KeyInfo | null {
  if (!ch) return null;
  return FINGER_MAP[ch.toLowerCase()] ?? null;
}
export const KEYBOARD_ROWS: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];
export const FINGER_ORDER: string[] = ["L pinky", "L ring", "L middle", "L index", "R index", "R middle", "R ring", "R pinky"];
