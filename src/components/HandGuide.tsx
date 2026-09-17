import type { FingerId } from "../types";

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

function Hand({ side, activeFinger }: { side: "left" | "right"; activeFinger: FingerId | null }) {
  // Five simple original rounded-rectangle "fingers" fanned from a palm shape.
  const fingerOrder: FingerId[] =
    side === "left"
      ? ["left-pinky", "left-ring", "left-middle", "left-index", "left-thumb"]
      : ["right-thumb", "right-index", "right-middle", "right-ring", "right-pinky"];

  return (
    <svg viewBox="0 0 160 120" className="h-20 w-28" role="img" aria-label={`${side} hand guide`}>
      <ellipse cx="80" cy="90" rx="55" ry="28" fill="currentColor" className="text-slate-300 dark:text-slate-600" />
      {fingerOrder.map((finger, i) => {
        const x = 20 + i * 30;
        const isActive = finger === activeFinger;
        return (
          <rect
            key={finger}
            x={x}
            y={i === fingerOrder.length - 1 && side === "left" ? 55 : 20}
            width="18"
            height={i === fingerOrder.length - 1 && side === "left" ? 40 : 55}
            rx="9"
            fill={isActive ? FINGER_COLORS[finger] : "currentColor"}
            className={isActive ? "" : "text-slate-300 dark:text-slate-600"}
            style={isActive ? { transform: "translateY(-4px)", transition: "transform 120ms ease" } : undefined}
          />
        );
      })}
    </svg>
  );
}

export function HandGuide({ activeFinger }: { activeFinger: FingerId | null }) {
  const activeHand = activeFinger?.startsWith("left") ? "left" : activeFinger?.startsWith("right") ? "right" : null;
  return (
    <div className="flex items-end justify-center gap-6 py-2">
      <Hand side="left" activeFinger={activeHand === "left" ? activeFinger : null} />
      <Hand side="right" activeFinger={activeHand === "right" ? activeFinger : null} />
    </div>
  );
}
