import type { FingerId, KeyDefinition } from "../types";
import clsx from "clsx";

interface VirtualKeyboardProps {
  rows: KeyDefinition[][];
  activeCode: string | null;
  pressedCode: string | null;
  pressedCorrect: boolean | null;
  shiftActive: boolean;
  shiftRequired: boolean;
  showFingerColors: boolean;
  /** When set, shows the English key's normal label as a small hint under
   * the Hindi glyph - spec section 11: "option to show or hide English
   * physical-key hints". Pass the base English layout keyed by code. */
  physicalHints?: Map<string, string>;
  devanagari?: boolean;
}

// Flat pastel finger-tint background, matching commercial typing-tutor
// keyboards: soft colour by finger group, with the "next key to press"
// picked out in a solid accent fill so it reads instantly at a glance.
const fingerBg: Record<FingerId, string> = {
  "left-pinky": "bg-finger-left-pinky/30",
  "left-ring": "bg-finger-left-ring/30",
  "left-middle": "bg-finger-left-middle/30",
  "left-index": "bg-finger-left-index/30",
  "left-thumb": "bg-finger-left-thumb/20",
  "right-thumb": "bg-finger-right-thumb/20",
  "right-index": "bg-finger-right-index/30",
  "right-middle": "bg-finger-right-middle/30",
  "right-ring": "bg-finger-right-ring/30",
  "right-pinky": "bg-finger-right-pinky/30",
};

const fingerBorder: Record<FingerId, string> = {
  "left-pinky": "border-finger-left-pinky/60",
  "left-ring": "border-finger-left-ring/60",
  "left-middle": "border-finger-left-middle/60",
  "left-index": "border-finger-left-index/60",
  "left-thumb": "border-finger-left-thumb/60",
  "right-thumb": "border-finger-right-thumb/60",
  "right-index": "border-finger-right-index/60",
  "right-middle": "border-finger-right-middle/60",
  "right-ring": "border-finger-right-ring/60",
  "right-pinky": "border-finger-right-pinky/60",
};

export function VirtualKeyboard({
  rows,
  activeCode,
  pressedCode,
  pressedCorrect,
  shiftActive,
  shiftRequired,
  showFingerColors,
  physicalHints,
  devanagari,
}: VirtualKeyboardProps) {
  return (
    <div
      className="select-none rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      aria-label="Virtual keyboard"
    >
      {rows.map((row, ri) => (
        <div key={ri} className="mb-2 flex gap-2 last:mb-0">
          {row.map((key) => {
            const isActive = key.code === activeCode;
            const isPressed = key.code === pressedCode;
            const isShiftKey = key.code === "ShiftLeft" || key.code === "ShiftRight";
            const hint = physicalHints?.get(key.code);
            return (
              <div
                key={key.code}
                className={clsx(
                  "relative flex h-11 flex-col items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all duration-75",
                  key.isModifier
                    ? "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    : clsx(
                        "border-transparent bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
                        showFingerColors && fingerBg[key.finger],
                        showFingerColors && fingerBorder[key.finger]
                      ),
                  isActive && "!border-amber-400 !bg-amber-300 !text-amber-950 shadow-[0_0_0_3px_rgba(251,191,36,0.35)]",
                  isPressed && pressedCorrect === true && "!border-green-500 !bg-green-400 !text-white",
                  isPressed && pressedCorrect === false && "!border-red-500 !bg-red-400 !text-white",
                  isPressed && "translate-y-[1px]",
                  isShiftKey && (shiftActive || shiftRequired) && "!border-sky-400 !bg-sky-200",
                  devanagari && !key.isModifier && "font-devanagari"
                )}
                style={{ flex: key.width ?? 1 }}
              >
                <span>{key.code === "Space" ? "" : shiftActive && key.shiftLabel ? key.shiftLabel : key.normalLabel}</span>
                {hint && !key.isModifier && (
                  <span className="absolute bottom-0.5 right-1 text-[8px] font-normal text-slate-400 dark:text-slate-500">
                    {hint}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
