import type { FingerId } from "../types";
import typingHands from "../assets/typing-hands.png";

const FINGER_COLORS: Record<FingerId, string> = {
  "left-pinky": "#f97316", "left-ring": "#eab308", "left-middle": "#22c55e",
  "left-index": "#0ea5e9", "left-thumb": "#94a3b8", "right-thumb": "#94a3b8",
  "right-index": "#0ea5e9", "right-middle": "#ec4899", "right-ring": "#f43f5e",
  "right-pinky": "#8b5cf6",
};

const FINGER_POSITIONS: Record<FingerId, { left: string; top: string }> = {
  "left-pinky": { left: "12.5%", top: "27%" },
  "left-ring": { left: "20.2%", top: "17%" },
  "left-middle": { left: "29.2%", top: "10%" },
  "left-index": { left: "38.2%", top: "4%" },
  "left-thumb": { left: "42.2%", top: "45%" },
  "right-thumb": { left: "61.7%", top: "45%" },
  "right-index": { left: "66.6%", top: "4%" },
  "right-middle": { left: "75.3%", top: "10%" },
  "right-ring": { left: "84.0%", top: "17%" },
  "right-pinky": { left: "91.5%", top: "27%" },
};

export function HandGuide({ activeFinger }: { activeFinger: FingerId | null }) {
  const marker = activeFinger ? FINGER_POSITIONS[activeFinger] : null;
  return (
    <div className="typing-hands" aria-label="Realistic typing hand guide">
      <div className="typing-hands__art">
        <img src={typingHands} alt="Hands positioned over the keyboard" draggable={false} />
        {activeFinger && marker && (
          <span className="typing-hands__marker" style={{ left: marker.left, top: marker.top,
            backgroundColor: FINGER_COLORS[activeFinger],
            boxShadow: `0 0 0 7px ${FINGER_COLORS[activeFinger]}33, 0 0 22px ${FINGER_COLORS[activeFinger]}` }} aria-hidden="true" />
        )}
      </div>
      <div className="typing-hands__labels" aria-hidden="true"><span>Left hand</span><span>Right hand</span></div>
    </div>
  );
}
