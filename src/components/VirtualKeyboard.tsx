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

// Same hex palette as HandGuide.tsx, so the keyboard tint always matches the
// hand/finger colour. Applied via inline style (not Tailwind theme classes)
// so it renders correctly even if the project's tailwind.config has no
// "finger-*" colors defined - avoids the "background not showing" bug where
// bg-finger-left-pinky/30 etc. silently compiled to nothing.
const FINGER_COLORS: Record<FingerId, string> = {
  "left-pinky": "#f97316",
  "left-ring": "#eab308",
  "left-middle": "#22c55e",
  "left-index": "#06b6d4",
  "left-thumb": "#94a3b8",
  "right-thumb": "#94a3b8",
  "right-index": "#8b5cf6",
  "right-middle": "#ec4899",
  "right-ring": "#f43f5e",
  "right-pinky": "#0ea5e9",
};

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
            const applyFingerTint = showFingerColors && !key.isModifier && !isActive && !isPressed;
            const fingerColor = FINGER_COLORS[key.finger];
            return (
              <div
                key={key.code}
                className={clsx(
                  "relative flex h-11 flex-col items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all duration-75",
                  key.isModifier
                    ? "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    : "text-slate-700 dark:text-slate-200",
                  !key.isModifier && !applyFingerTint && "bg-slate-50 dark:bg-slate-800",
                  isActive && "!bg-amber-300 !text-amber-950 shadow-[0_0_0_3px_rgba(251,191,36,0.35)]",
                  isPressed && pressedCorrect === true && "!bg-green-400 !text-white",
                  isPressed && pressedCorrect === false && "!bg-red-400 !text-white",
                  isPressed && "translate-y-[1px]",
                  isShiftKey && (shiftActive || shiftRequired) && "!bg-sky-200",
                  devanagari && !key.isModifier && "font-devanagari"
                )}
                style={{
                  flex: key.width ?? 1,
                  ...(applyFingerTint
                    ? {
                        backgroundColor: hexToRgba(fingerColor, 0.3),
                        borderColor: hexToRgba(fingerColor, 0.6),
                      }
                    : !key.isModifier && !isActive && !isPressed
                    ? { borderColor: "transparent" }
                    : {}),
                  ...(isActive
                    ? { borderColor: "#fbbf24" }
                    : isPressed && pressedCorrect === true
                    ? { borderColor: "#22c55e" }
                    : isPressed && pressedCorrect === false
                    ? { borderColor: "#ef4444" }
                    : isShiftKey && (shiftActive || shiftRequired)
                    ? { borderColor: "#38bdf8" }
                    : {}),
                }}
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
