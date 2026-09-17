import type { FingerId } from "../types";

// Original SVG hand illustration (no traced/copied artwork). Fingers stay a
// natural skin tone at all times; only the fingertip of the finger that
// should press next gets a coloured marker dot, matching the visual
// language of commercial typing tutors without reusing any of their assets.

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

// Relative length/offset per finger slot (index 0 = outer finger of the hand).
const FINGER_SHAPE = [
  { len: 58, dx: 0, rot: -18 }, // pinky
  { len: 78, dx: 0, rot: -7 }, // ring
  { len: 86, dx: 0, rot: 0 }, // middle
  { len: 76, dx: 0, rot: 8 }, // index
  { len: 46, dx: 10, rot: 42 }, // thumb
];

function Hand({ side, activeFinger }: { side: "left" | "right"; activeFinger: FingerId | null }) {
  const fingerOrder: FingerId[] =
    side === "left"
      ? ["left-pinky", "left-ring", "left-middle", "left-index", "left-thumb"]
      : ["right-thumb", "right-index", "right-middle", "right-ring", "right-pinky"];

  const shapes = side === "left" ? FINGER_SHAPE : [...FINGER_SHAPE].reverse();
  const skin = "text-[#eabf94] dark:text-[#c99568]";
  const skinShadow = "text-[#d9a877] dark:text-[#b0824f]";

  return (
    <svg viewBox="0 0 200 190" className="h-24 w-32 sm:h-28 sm:w-36" role="img" aria-label={`${side} hand guide`}>
      {/* palm */}
      <path
        d="M40 185 C20 150 22 110 32 90 C40 74 60 66 100 66 C140 66 160 74 168 90 C178 110 180 150 160 185 Z"
        fill="currentColor"
        className={skin}
      />
      {fingerOrder.map((finger, i) => {
        const shape = shapes[i];
        const isActive = finger === activeFinger;
        const baseX = 34 + i * 33 + shape.dx;
        const width = finger.includes("thumb") ? 30 : 24;
        return (
          <g
            key={finger}
            style={{
              transformOrigin: `${baseX}px 84px`,
              transform: `rotate(${shape.rot}deg) translateY(${isActive ? -6 : 0}px)`,
              transition: "transform 140ms ease",
            }}
          >
            <rect
              x={baseX - width / 2}
              y={84 - shape.len}
              width={width}
              height={shape.len + 6}
              rx={width / 2}
              fill="currentColor"
              className={isActive ? undefined : skin}
              style={isActive ? { fill: "#f3cd9f" } : undefined}
            />
            {/* knuckle crease */}
            <rect
              x={baseX - width / 2 + 3}
              y={84 - shape.len * 0.42}
              width={width - 6}
              height={3}
              rx={1.5}
              fill="currentColor"
              className={skinShadow}
              opacity={0.6}
            />
            {isActive && (
              <>
                <circle cx={baseX} cy={84 - shape.len + 2} r={11} fill={FINGER_COLORS[finger]} opacity={0.35}>
                  <animate attributeName="r" values="9;13;9" dur="1s" repeatCount="indefinite" />
                </circle>
                <circle
                  cx={baseX}
                  cy={84 - shape.len + 2}
                  r={7}
                  fill={FINGER_COLORS[finger]}
                  stroke="white"
                  strokeWidth={2}
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function HandGuide({ activeFinger }: { activeFinger: FingerId | null }) {
  const activeHand = activeFinger?.startsWith("left") ? "left" : activeFinger?.startsWith("right") ? "right" : null;
  return (
    <div className="flex items-end justify-center gap-10 rounded-2xl bg-white/60 py-3 dark:bg-slate-900/40">
      <Hand side="left" activeFinger={activeHand === "left" ? activeFinger : null} />
      <Hand side="right" activeFinger={activeHand === "right" ? activeFinger : null} />
    </div>
  );
}
