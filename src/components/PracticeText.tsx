import clsx from "clsx";
import type { CharacterState } from "../engine/typingEngine";

export function PracticeText({ characters, cursor }: { characters: CharacterState[]; cursor: number }) {
  return (
    <div
      className="rounded-xl bg-white p-6 font-mono text-2xl leading-relaxed tracking-wide shadow dark:bg-slate-800"
      style={{ wordBreak: "break-word" }}
    >
      {characters.map((c, i) => (
        <span
          key={i}
          className={clsx(
            "whitespace-pre-wrap",
            c.status === "correct" && "text-green-600 dark:text-green-400",
            c.status === "corrected" && "text-amber-600 dark:text-amber-400",
            c.status === "incorrect" && "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
            c.status === "pending" && "text-slate-400 dark:text-slate-500",
            i === cursor && "border-b-2 border-brand-500 animate-pulse"
          )}
        >
          {c.expected}
        </span>
      ))}
    </div>
  );
}
