import { useEffect, useState } from "react";
import bg1 from "../assets/bg-1.png";
import bg2 from "../assets/bg-2.png";
import bg3 from "../assets/bg-3.png";

// The 3 internal-page background artworks. Cycled slowly behind the app so
// the dashboard / practice / all other screens don't feel flat-white, while
// the opaque white cards on top stay perfectly readable.
const BACKGROUNDS = [bg1, bg2, bg3];
const ROTATE_INTERVAL_MS = 10000; // how long each background stays before crossfading
const FADE_DURATION_MS = 1800;

export function BackgroundRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % BACKGROUNDS.length);
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {BACKGROUNDS.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === index ? 1 : 0,
            transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
          }}
        />
      ))}
      {/* Soft wash so text/cards drawn on top always stay readable, and so
          the app still looks right in dark mode. */}
      <div className="absolute inset-0 bg-white/55 dark:bg-slate-950/70" />
    </div>
  );
}
