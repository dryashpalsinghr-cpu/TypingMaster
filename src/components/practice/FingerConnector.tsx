import { useEffect, useState, type RefObject } from "react";

/**
 * Dashed guide line: keyboard ke NEECHE se finger tak.
 *
 * Pehle line active key ke bottom se shuru hoti thi, isliye upar wali rows
 * (number row / QWERTY row) ki key ke liye line neeche ki saari keys ke UPAR
 * se guzarti thi. Ab line keyboard ke bottom edge se shuru hoti hai (active
 * key ke theek neeche wale x par), to keyboard ke upar kuch draw nahi hota.
 * Line ka color bhi ungali ke marker ke color se match karta hai.
 *
 * Sirf visual overlay hai - typing state yahan nahi hai.
 */
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
      const keyboardEl = stage.querySelector(".pp-keyboard");
      const markerEl = stage.querySelector('[data-pp-marker="true"]');
      if (!keyEl || !keyboardEl || !markerEl || stageRect.width === 0) {
        setConn(null);
        return;
      }

      const keyRect = keyEl.getBoundingClientRect();
      const kbRect = keyboardEl.getBoundingClientRect();
      const markerRect = markerEl.getBoundingClientRect();

      // Start: keyboard ka bottom edge, active key ke x par (keyboard ke andar clamp).
      const keyCenterX = keyRect.left + keyRect.width / 2;
      const startX = Math.min(Math.max(keyCenterX, kbRect.left + 12), kbRect.right - 12);
      const x1 = startX - stageRect.left;
      const y1 = kbRect.bottom - stageRect.top;

      // End: ungali ke marker ka center.
      const x2 = markerRect.left + markerRect.width / 2 - stageRect.left;
      const y2 = markerRect.top + markerRect.height / 2 - stageRect.top;

      // Marker keyboard ke neeche na ho to line mat banao (keyboard par cross na ho).
      if (y2 <= y1 + 4) {
        setConn(null);
        return;
      }

      const midY = y1 + (y2 - y1) * 0.5;
      const color = getComputedStyle(markerEl).backgroundColor || "#4ea8ff";
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
    return () => {
      followUps.forEach((id) => window.clearTimeout(id));
      observer.disconnect();
      window.removeEventListener("resize", recompute);
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
