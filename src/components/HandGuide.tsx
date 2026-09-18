import { useLayoutEffect, useRef, useState } from "react";
import type { FingerId } from "../types";
import typingHands from "../assets/typing-hands.png";
import typingHandsPremium from "../assets/typing-hands-premium.png";

const FINGER_COLORS: Record<FingerId, string> = {
  "left-pinky": "#f97316", "left-ring": "#eab308", "left-middle": "#22c55e",
  "left-index": "#0ea5e9", "left-thumb": "#94a3b8", "right-thumb": "#94a3b8",
  "right-index": "#0ea5e9", "right-middle": "#ec4899", "right-ring": "#f43f5e",
  "right-pinky": "#8b5cf6",
};

// Percentages are calibrated against the *actual image pixels* of
// typing-hands.png (1882x824), i.e. 0%-100% left/top map onto the image
// itself - not onto whatever box happens to contain it.
const FINGER_POSITIONS: Record<FingerId, { left: number; top: number }> = {
  "left-pinky": { left: 12.5, top: 27 },
  "left-ring": { left: 20.2, top: 17 },
  "left-middle": { left: 29.2, top: 10 },
  "left-index": { left: 38.2, top: 4 },
  "left-thumb": { left: 42.2, top: 45 },
  "right-thumb": { left: 61.7, top: 45 },
  "right-index": { left: 66.6, top: 4 },
  "right-middle": { left: 75.3, top: 10 },
  "right-ring": { left: 84.0, top: 17 },
  "right-pinky": { left: 91.5, top: 27 },
};

// Natural size of typing-hands.png. Used as a fallback before the image has
// loaded, and to compute the aspect ratio for the letterbox math below.
const IMAGE_NATURAL_WIDTH = 1882;
const IMAGE_NATURAL_HEIGHT = 824;

// Calibrated against typing-hands-premium.png (1659x928) the same way the
// map above is calibrated against typing-hands.png - percentages measured
// against the actual image pixels, not the letterboxed container.
const PREMIUM_FINGER_POSITIONS: Record<FingerId, { left: number; top: number }> = {
  "left-pinky": { left: 15.8, top: 15.2 },
  "left-ring": { left: 25.0, top: 4.5 },
  "left-middle": { left: 32.0, top: 1.9 },
  "left-index": { left: 39.5, top: 7.0 },
  "left-thumb": { left: 45.0, top: 44.3 },
  "right-thumb": { left: 54.0, top: 44.3 },
  "right-index": { left: 66.5, top: 7.5 },
  "right-middle": { left: 74.0, top: 1.9 },
  "right-ring": { left: 81.0, top: 5.0 },
  "right-pinky": { left: 88.5, top: 15.2 },
};
const PREMIUM_IMAGE_NATURAL_WIDTH = 1400;
const PREMIUM_IMAGE_NATURAL_HEIGHT = 783;

interface ImageBox { left: number; top: number; width: number; height: number; }

function computeImageBox(
  container: HTMLDivElement,
  img: HTMLImageElement | null,
  fallbackWidth = IMAGE_NATURAL_WIDTH,
  fallbackHeight = IMAGE_NATURAL_HEIGHT
): ImageBox | null {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  if (containerWidth === 0 || containerHeight === 0) return null;

  const naturalWidth = img?.naturalWidth || fallbackWidth;
  const naturalHeight = img?.naturalHeight || fallbackHeight;
  const imageAspect = naturalWidth / naturalHeight;
  const containerAspect = containerWidth / containerHeight;

  // Replicates `object-fit: contain` centered inside the container: the
  // image is scaled to fit fully within the container on whichever axis is
  // the tighter constraint, and is centered on the other axis. The
  // resulting gap on that axis is the "letterbox" that finger-position
  // percentages must NOT be measured against - that was the original bug.
  let width: number, height: number;
  if (containerAspect > imageAspect) {
    height = containerHeight;
    width = height * imageAspect;
  } else {
    width = containerWidth;
    height = width / imageAspect;
  }
  return { left: (containerWidth - width) / 2, top: (containerHeight - height) / 2, width, height };
}

interface HandGuideProps {
  activeFinger: FingerId | null;
  /** "premium" swaps in the realistic hand photo + glass glow marker used by
   * the redesigned Practice screen. Omitted keeps the original art exactly
   * as before, so TypingTestPage (which also renders this component) is
   * unaffected. */
  variant?: "default" | "premium";
}

export function HandGuide({ activeFinger, variant = "default" }: HandGuideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageBox, setImageBox] = useState<ImageBox | null>(null);
  const isPremium = variant === "premium";
  const fallbackWidth = isPremium ? PREMIUM_IMAGE_NATURAL_WIDTH : IMAGE_NATURAL_WIDTH;
  const fallbackHeight = isPremium ? PREMIUM_IMAGE_NATURAL_HEIGHT : IMAGE_NATURAL_HEIGHT;
  const positions = isPremium ? PREMIUM_FINGER_POSITIONS : FINGER_POSITIONS;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const recompute = () => {
      const box = computeImageBox(container, imgRef.current, fallbackWidth, fallbackHeight);
      if (box) setImageBox(box);
    };
    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    return () => observer.disconnect();
  }, [fallbackWidth, fallbackHeight]);

  const finger = activeFinger ? positions[activeFinger] : null;
  const marker = finger && imageBox
    ? {
        left: imageBox.left + (finger.left / 100) * imageBox.width,
        top: imageBox.top + (finger.top / 100) * imageBox.height,
      }
    : null;

  if (isPremium) {
    return (
      <div className="pp-hands" aria-label="Realistic typing hand guide">
        <div className="pp-hands__art" ref={containerRef}>
          <img
            ref={imgRef}
            src={typingHandsPremium}
            alt="Hands positioned over the keyboard"
            draggable={false}
            onLoad={() => {
              const container = containerRef.current;
              if (!container) return;
              const box = computeImageBox(container, imgRef.current, fallbackWidth, fallbackHeight);
              if (box) setImageBox(box);
            }}
          />
          {activeFinger && marker && (
            <span
              data-pp-marker="true"
              className="pp-hands__marker"
              style={{
                left: marker.left,
                top: marker.top,
                backgroundColor: FINGER_COLORS[activeFinger],
                boxShadow: `0 0 0 7px ${FINGER_COLORS[activeFinger]}33, 0 0 22px ${FINGER_COLORS[activeFinger]}`,
              }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="typing-hands" aria-label="Realistic typing hand guide">
      <div className="typing-hands__art" ref={containerRef}>
        <img
          ref={imgRef}
          src={typingHands}
          alt="Hands positioned over the keyboard"
          draggable={false}
          onLoad={() => {
            // Natural size is only known once the image has loaded; the
            // ResizeObserver above fires on container resize, so also
            // recompute here in case the container's size never changes
            // after mount (e.g. a fixed-size layout).
            const container = containerRef.current;
            if (!container) return;
            const box = computeImageBox(container, imgRef.current, fallbackWidth, fallbackHeight);
            if (box) setImageBox(box);
          }}
        />
        {activeFinger && marker && (
          <span
            data-pp-marker="true"
            className="typing-hands__marker"
            style={{
              left: marker.left,
              top: marker.top,
              backgroundColor: FINGER_COLORS[activeFinger],
              boxShadow: `0 0 0 7px ${FINGER_COLORS[activeFinger]}33, 0 0 22px ${FINGER_COLORS[activeFinger]}`,
            }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="typing-hands__labels" aria-hidden="true"><span>Left hand</span><span>Right hand</span></div>
    </div>
  );
}
