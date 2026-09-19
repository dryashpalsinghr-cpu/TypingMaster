import clsx from "clsx";
import { Check } from "lucide-react";
import type { CharacterState } from "../../engine/typingEngine";
import { krutiKeyLabel } from "../../converter/krutiDevCore";

/**
 * Redesigned Practice-screen typing sequence: instead of the full lesson
 * paragraph, shows a small rolling window of the upcoming characters split
 * into two side-by-side groups of `groupSize` boxes each. Purely a view over
 * the real `useTypingEngine` state (`characters`/`cursor`) - no separate
 * typing state of its own, so it always reflects what the engine is doing.
 */
interface SequenceSlot {
  index: number;
  char: CharacterState | null;
}

function buildWindow(characters: CharacterState[], cursor: number, size: number): SequenceSlot[] {
  // Include one already-completed cell (if any) so the learner can see the
  // key they just finished turn green before it scrolls out, then the
  // current cell, then as many upcoming cells as are needed to fill the
  // window. Past the end of the exercise the remaining slots are empty.
  const start = Math.max(0, cursor - 1);
  const slots: SequenceSlot[] = [];
  for (let i = 0; i < size; i++) {
    const idx = start + i;
    slots.push({ index: idx, char: characters[idx] ?? null });
  }
  return slots;
}

function SequenceBox({ slot, cursor, devanagari, krutiDev }: { slot: SequenceSlot; cursor: number; devanagari?: boolean; krutiDev?: boolean }) {
  const { index, char } = slot;
  const isSpace = char?.expected === " ";
  const isCurrent = index === cursor && !!char;
  const isCompleted = !!char && index < cursor && (char.status === "correct" || char.status === "corrected");
  const isWrong = !!char && char.status === "incorrect";
  const isUpcoming = !!char && !isCurrent && !isCompleted && !isWrong;

  return (
    <div
      className={clsx(
        "pp-seq-key",
        isSpace && "pp-seq-key--space",
        isCurrent && "pp-seq-key--current",
        isCompleted && "pp-seq-key--completed",
        isWrong && "pp-seq-key--wrong",
        isUpcoming && "pp-seq-key--upcoming",
        !char && "pp-seq-key--empty",
        devanagari && "font-devanagari"
      )}
    >
      {char ? (
        isSpace ? (
          <span className="pp-seq-key__label">Space</span>
        ) : (
          <span>{krutiDev ? krutiKeyLabel(char.expected) : char.expected}</span>
        )
      ) : null}
      {isCompleted && <Check size={12} className="pp-seq-key__check" />}
    </div>
  );
}

export function DualTypingSequence({
  characters,
  cursor,
  devanagari,
  krutiDev,
  groupSize = 6,
}: {
  characters: CharacterState[];
  cursor: number;
  devanagari?: boolean;
  /** Kruti Dev: each box shows the Devanagari shape the key draws (d -> क). */
  krutiDev?: boolean;
  groupSize?: number;
}) {
  const slots = buildWindow(characters, cursor, groupSize * 2);
  const left = slots.slice(0, groupSize);
  const right = slots.slice(groupSize, groupSize * 2);

  return (
    <div className="pp-seq" aria-label="Upcoming typing sequence">
      <div className="pp-seq-group">
        {left.map((slot) => (
          <SequenceBox key={slot.index} slot={slot} cursor={cursor} devanagari={devanagari} krutiDev={krutiDev} />
        ))}
      </div>
      <div className="pp-seq-divider" aria-hidden="true" />
      <div className="pp-seq-group">
        {right.map((slot) => (
          <SequenceBox key={slot.index} slot={slot} cursor={cursor} devanagari={devanagari} krutiDev={krutiDev} />
        ))}
      </div>
    </div>
  );
}
