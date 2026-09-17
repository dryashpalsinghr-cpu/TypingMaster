import type { KeyDefinition, KeyboardLayoutDefinition } from "../types";

// Each row is defined top-to-bottom. Finger assignments follow standard
// touch-typing convention (spec section 5).
const numberRow: KeyDefinition[] = [
  { code: "Backquote", normalLabel: "`", shiftLabel: "~", output: "`", shiftOutput: "~", finger: "left-pinky", hand: "left", row: "number" },
  { code: "Digit1", normalLabel: "1", shiftLabel: "!", output: "1", shiftOutput: "!", finger: "left-pinky", hand: "left", row: "number" },
  { code: "Digit2", normalLabel: "2", shiftLabel: "@", output: "2", shiftOutput: "@", finger: "left-ring", hand: "left", row: "number" },
  { code: "Digit3", normalLabel: "3", shiftLabel: "#", output: "3", shiftOutput: "#", finger: "left-middle", hand: "left", row: "number" },
  { code: "Digit4", normalLabel: "4", shiftLabel: "$", output: "4", shiftOutput: "$", finger: "left-index", hand: "left", row: "number" },
  { code: "Digit5", normalLabel: "5", shiftLabel: "%", output: "5", shiftOutput: "%", finger: "left-index", hand: "left", row: "number" },
  { code: "Digit6", normalLabel: "6", shiftLabel: "^", output: "6", shiftOutput: "^", finger: "right-index", hand: "right", row: "number" },
  { code: "Digit7", normalLabel: "7", shiftLabel: "&", output: "7", shiftOutput: "&", finger: "right-index", hand: "right", row: "number" },
  { code: "Digit8", normalLabel: "8", shiftLabel: "*", output: "8", shiftOutput: "*", finger: "right-middle", hand: "right", row: "number" },
  { code: "Digit9", normalLabel: "9", shiftLabel: "(", output: "9", shiftOutput: "(", finger: "right-ring", hand: "right", row: "number" },
  { code: "Digit0", normalLabel: "0", shiftLabel: ")", output: "0", shiftOutput: ")", finger: "right-pinky", hand: "right", row: "number" },
  { code: "Minus", normalLabel: "-", shiftLabel: "_", output: "-", shiftOutput: "_", finger: "right-pinky", hand: "right", row: "number" },
  { code: "Equal", normalLabel: "=", shiftLabel: "+", output: "=", shiftOutput: "+", finger: "right-pinky", hand: "right", row: "number" },
  { code: "Backspace", normalLabel: "Backspace", output: "", finger: "right-pinky", hand: "right", row: "number", isModifier: true, width: 2 },
];

const topRow: KeyDefinition[] = [
  { code: "Tab", normalLabel: "Tab", output: "\t", finger: "left-pinky", hand: "left", row: "top", isModifier: true, width: 1.5 },
  { code: "KeyQ", normalLabel: "Q", output: "q", shiftOutput: "Q", finger: "left-pinky", hand: "left", row: "top" },
  { code: "KeyW", normalLabel: "W", output: "w", shiftOutput: "W", finger: "left-ring", hand: "left", row: "top" },
  { code: "KeyE", normalLabel: "E", output: "e", shiftOutput: "E", finger: "left-middle", hand: "left", row: "top" },
  { code: "KeyR", normalLabel: "R", output: "r", shiftOutput: "R", finger: "left-index", hand: "left", row: "top" },
  { code: "KeyT", normalLabel: "T", output: "t", shiftOutput: "T", finger: "left-index", hand: "left", row: "top" },
  { code: "KeyY", normalLabel: "Y", output: "y", shiftOutput: "Y", finger: "right-index", hand: "right", row: "top" },
  { code: "KeyU", normalLabel: "U", output: "u", shiftOutput: "U", finger: "right-index", hand: "right", row: "top" },
  { code: "KeyI", normalLabel: "I", output: "i", shiftOutput: "I", finger: "right-middle", hand: "right", row: "top" },
  { code: "KeyO", normalLabel: "O", output: "o", shiftOutput: "O", finger: "right-ring", hand: "right", row: "top" },
  { code: "KeyP", normalLabel: "P", output: "p", shiftOutput: "P", finger: "right-pinky", hand: "right", row: "top" },
  { code: "BracketLeft", normalLabel: "[", shiftLabel: "{", output: "[", shiftOutput: "{", finger: "right-pinky", hand: "right", row: "top" },
  { code: "BracketRight", normalLabel: "]", shiftLabel: "}", output: "]", shiftOutput: "}", finger: "right-pinky", hand: "right", row: "top" },
  { code: "Backslash", normalLabel: "\\", shiftLabel: "|", output: "\\", shiftOutput: "|", finger: "right-pinky", hand: "right", row: "top", width: 1.5 },
];

const homeRow: KeyDefinition[] = [
  { code: "CapsLock", normalLabel: "Caps Lock", output: "", finger: "left-pinky", hand: "left", row: "home", isModifier: true, width: 1.75 },
  { code: "KeyA", normalLabel: "A", output: "a", shiftOutput: "A", finger: "left-pinky", hand: "left", row: "home" },
  { code: "KeyS", normalLabel: "S", output: "s", shiftOutput: "S", finger: "left-ring", hand: "left", row: "home" },
  { code: "KeyD", normalLabel: "D", output: "d", shiftOutput: "D", finger: "left-middle", hand: "left", row: "home" },
  { code: "KeyF", normalLabel: "F", output: "f", shiftOutput: "F", finger: "left-index", hand: "left", row: "home", displayHint: "home-key" },
  { code: "KeyG", normalLabel: "G", output: "g", shiftOutput: "G", finger: "left-index", hand: "left", row: "home" },
  { code: "KeyH", normalLabel: "H", output: "h", shiftOutput: "H", finger: "right-index", hand: "right", row: "home" },
  { code: "KeyJ", normalLabel: "J", output: "j", shiftOutput: "J", finger: "right-index", hand: "right", row: "home", displayHint: "home-key" },
  { code: "KeyK", normalLabel: "K", output: "k", shiftOutput: "K", finger: "right-middle", hand: "right", row: "home" },
  { code: "KeyL", normalLabel: "L", output: "l", shiftOutput: "L", finger: "right-ring", hand: "right", row: "home" },
  { code: "Semicolon", normalLabel: ";", shiftLabel: ":", output: ";", shiftOutput: ":", finger: "right-pinky", hand: "right", row: "home" },
  { code: "Quote", normalLabel: "'", shiftLabel: '"', output: "'", shiftOutput: '"', finger: "right-pinky", hand: "right", row: "home" },
  { code: "Enter", normalLabel: "Enter", output: "\n", finger: "right-pinky", hand: "right", row: "home", isModifier: true, width: 2 },
];

const bottomRow: KeyDefinition[] = [
  { code: "ShiftLeft", normalLabel: "Shift", output: "", finger: "left-pinky", hand: "left", row: "bottom", isModifier: true, width: 2.25 },
  { code: "KeyZ", normalLabel: "Z", output: "z", shiftOutput: "Z", finger: "left-pinky", hand: "left", row: "bottom" },
  { code: "KeyX", normalLabel: "X", output: "x", shiftOutput: "X", finger: "left-ring", hand: "left", row: "bottom" },
  { code: "KeyC", normalLabel: "C", output: "c", shiftOutput: "C", finger: "left-middle", hand: "left", row: "bottom" },
  { code: "KeyV", normalLabel: "V", output: "v", shiftOutput: "V", finger: "left-index", hand: "left", row: "bottom" },
  { code: "KeyB", normalLabel: "B", output: "b", shiftOutput: "B", finger: "left-index", hand: "left", row: "bottom" },
  { code: "KeyN", normalLabel: "N", output: "n", shiftOutput: "N", finger: "right-index", hand: "right", row: "bottom" },
  { code: "KeyM", normalLabel: "M", output: "m", shiftOutput: "M", finger: "right-index", hand: "right", row: "bottom" },
  { code: "Comma", normalLabel: ",", shiftLabel: "<", output: ",", shiftOutput: "<", finger: "right-middle", hand: "right", row: "bottom" },
  { code: "Period", normalLabel: ".", shiftLabel: ">", output: ".", shiftOutput: ">", finger: "right-ring", hand: "right", row: "bottom" },
  { code: "Slash", normalLabel: "/", shiftLabel: "?", output: "/", shiftOutput: "?", finger: "right-pinky", hand: "right", row: "bottom" },
  { code: "ShiftRight", normalLabel: "Shift", output: "", finger: "right-pinky", hand: "right", row: "bottom", isModifier: true, width: 2.75 },
];

const spaceRow: KeyDefinition[] = [
  { code: "Space", normalLabel: "Space", output: " ", finger: "left-thumb", hand: "left", row: "space", width: 6.25 },
];

export const enQwertyLayout: KeyboardLayoutDefinition = {
  id: "en-qwerty",
  label: "English QWERTY",
  labelHi: "अंग्रेज़ी QWERTY",
  isLegacyEncoding: false,
  keys: [...numberRow, ...topRow, ...homeRow, ...bottomRow, ...spaceRow],
};

export const enQwertyRows = [numberRow, topRow, homeRow, bottomRow, spaceRow];
