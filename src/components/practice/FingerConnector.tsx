import { useEffect, useState, type RefObject } from "react";

/** Dashed guide from the required key to its finger marker. */
type Connector = { d: string; color: string; x1: number; y1: number };

export function FingerConnector({
  stageRef,
  activeCode,
  activeFinger,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  activeCode: string | null;
  activeFinger: string | null;
}) {
  const [conn, setConn] = useState<Connector | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !activeCode || !activeFinger) {
      setConn(null);
      return;
    }

    const recompute = () => {
      const stageRect = stage.getBoundingClientRect();
      const keyEl = stage.querySelector(`[data-key-code="${CSS.escape(activeCode)}"]`);
      const markerEl = stage.querySelector('[data-pp-marker="true"]');
      if (!keyEl || !markerEl || stageRect.width === 0) {
        setConn(null);
        return;
      }

      const keyRect = keyEl.getBoundingClientRect();
      const markerRect = markerEl.getBoundingClientRect();

      const x1 = keyRect.left + keyRect.width / 2 - stageRect.left;
      const y1 = keyRect.top + keyRect.height / 2 - stageRect.top;

      // End: ungali ke marker ka center.
      const x2 = markerRect.left + markerRect.width / 2 - stageRect.left;
      const y2 = markerRect.top + markerRect.height / 2 - stageRect.top;

      // Hide the connector if the hand guide has no visible height.
      if (y2 <= y1 + 4) {
        setConn(null);
        return;
      }

      const midY = y1 + (y2 - y1) * 0.5;
      const color = "#2563eb";
      setConn({
        d: `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`,
        color,
        x1,
        y1,
      });
    };

    recompute();
    // Marker ~140ms me apni jagah slide karta hai (HandGuide ki CSS transition),
    // isliye kuch follow-up frames me dobara measure karte hain.
    const followUps = [30, 90, 160, 260].map((ms) => window.setTimeout(recompute, ms));
    const observer = new ResizeObserver(recompute);
    observer.observe(stage);
    window.addEventListener("resize", recompute);
    stage.addEventListener("scroll", recompute, true);
    return () => {
      followUps.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
      window.removeEventListener("resize", recompute);
      stage.removeEventListener("scroll", recompute, true);
    };
  }, [stageRef, activeCode, activeFinger]);

  if (!conn) return null;

  return (
    <svg className="pp-connector" aria-hidden="true" style={{ width: "100%", height: "100%" }}>
      <path d={conn.d} style={{ stroke: conn.color }} />
      <circle cx={conn.x1} cy={conn.y1} r={4} fill={conn.color} opacity={0.85} />
    </svg>
  );
}
