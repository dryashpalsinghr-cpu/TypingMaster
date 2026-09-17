import { enQwertyRows } from "../keyboards/enQwerty";
import type { FingerId } from "../types";
import clsx from "clsx";

interface VirtualKeyboardProps {
  activeCode: string | null;
  pressedCode: string | null;
  pressedCorrect: boolean | null;
  shiftActive: boolean;
  showFingerColors: boolean;
}

const fingerBg: Record<FingerId, string> = {
  "left-pinky": "bg-finger-left-pinky/25",
  "left-ring": "bg-finger-left-ring/25",
  "left-middle": "bg-finger-left-middle/25",
  "left-index": "bg-finger-left-index/25",
  "left-thumb": "bg-finger-left-thumb/25",
  "right-thumb": "bg-finger-right-thumb/25",
  "right-index": "bg-finger-right-index/25",
  "right-middle": "bg-finger-right-middle/25",
  "right-ring": "bg-finger-right-ring/25",
  "right-pinky": "bg-finger-right-pinky/25",
};

export function VirtualKeyboard({
  activeCode,
  pressedCode,
  pressedCorrect,
  shiftActive,
  showFingerColors,
}: VirtualKeyboardProps) {
  return (
    <div
      className="select-none rounded-2xl bg-slate-200/60 p-3 shadow-inner dark:bg-slate-800/60"
      style={{ perspective: "800px" }}
      aria-label="Virtual keyboard"
    >
      {enQwertyRows.map((row, ri) => (
        <div key={ri} className="mb-1.5 flex gap-1.5 last:mb-0">
          {row.map((key) => {
            const isActive = key.code === activeCode;
            const isPressed = key.code === pressedCode;
            const isShiftKey = key.code === "ShiftLeft" || key.code === "ShiftRight";
            return (
              <div
                key={key.code}
                className={clsx(
                  "flex h-11 items-center justify-center rounded-lg border text-xs font-medium",
                  "border-slate-300 bg-white shadow-[0_3px_0_rgba(0,0,0,0.15)] transition-transform duration-75 dark:border-slate-600 dark:bg-slate-700",
                  showFingerColors && !key.isModifier && fingerBg[key.finger],
                  isActive && "ring-2 ring-brand-400",
                  isPressed && pressedCorrect === true && "!bg-green-400 !text-white",
                  isPressed && pressedCorrect === false && "!bg-red-400 !text-white",
                  isPressed && "translate-y-[2px] shadow-none",
                  isShiftKey && shiftActive && "ring-2 ring-amber-400"
                )}
                style={{ flex: key.width ?? 1 }}
              >
                {key.code === "Space" ? "" : shiftActive && key.shiftLabel ? key.shiftLabel : key.normalLabel}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
