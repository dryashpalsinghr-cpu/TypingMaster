import { useEffect, useState, type RefObject } from "react";

/**
 * Draws the subtle dashed "key -> correct finger" guide line described in
 * the Practice screen redesign (spec section 12). Purely a visual overlay:
 * it reads DOM positions of the already-rendered active key
 * (`[data-key-code]`, added in VirtualKeyboard) and the active finger
 * marker (`[data-pp-marker]`, added in HandGuide) inside `stageRef`, and
 * draws an SVG curve between them. No typing state lives here.
 */
export function FingerConnector({
  stageRef,
  activeCode,
  activeFinger,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  activeCode: string | null;
  activeFinger: string | null;
}) {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !activeCode || !activeFinger) {
      setPath(null);
      return;
    }

    const recompute = () => {
      const stageRect = stage.getBoundingClientRect();
      const keyEl = stage.querySelector(`[data-key-code="${CSS.escape(activeCode)}"]`);
      const markerEl = stage.querySelector('[data-pp-marker="true"]');
      if (!keyEl || !markerEl || stageRect.width === 0) {
        setPath(null);
        return;
      }
      const keyRect = keyEl.getBoundingClientRect();
      const markerRect = markerEl.getBoundingClientRect();
      const x1 = keyRect.left + keyRect.width / 2 - stageRect.left;
      const y1 = keyRect.bottom - stageRect.top;
      const x2 = markerRect.left + markerRect.width / 2 - stageRect.left;
      const y2 = markerRect.top + markerRect.height / 2 - stageRect.top;
      const midY = y1 + (y2 - y1) * 0.5;
      setPath(`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`);
    };

    recompute();
    // The marker animates into place over ~140ms (CSS transition on
    // left/top in HandGuide) - a couple of follow-up frames keep the line
    // glued to it instead of freezing at the pre-transition position.
    const followUps = [30, 90, 160, 260].map((ms) => window.setTimeout(recompute, ms));
    const observer = new ResizeObserver(recompute);
    observer.observe(stage);
    window.addEventListener("resize", recompute);
    return () => {
      followUps.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [stageRef, activeCode, activeFinger]);

  if (!path) return null;

  return (
    <svg className="pp-connector" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
