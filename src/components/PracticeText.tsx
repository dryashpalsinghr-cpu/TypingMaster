import clsx from "clsx";
import type { CharacterState } from "../engine/typingEngine";

export function PracticeText({
  characters,
  cursor,
  devanagari,
  variant = "default",
  krutiDev,
  unicodePreview,
}: {
  characters: CharacterState[];
  cursor: number;
  devanagari?: boolean;
  /** "premium" renders the glass card + blue-highlight current-character
   * style used by the redesigned Practice screen. Omitted keeps the
   * original look, so TypingTestPage is unaffected. */
  variant?: "default" | "premium";
  /** Kruti Dev 010: cells hold the ASCII keys you type. They are drawn with the
   * Kruti Dev font (if installed) and `unicodePreview` shows the real Devanagari
   * underneath, so the text is readable even when the font is missing. */
  krutiDev?: boolean;
  unicodePreview?: string;
}) {
  const fontClass = krutiDev ? "font-krutidev" : devanagari ? "font-devanagari" : "font-mono";
  const preview = krutiDev && unicodePreview ? (
    <p
      className="mb-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 font-devanagari dark:bg-slate-800 dark:text-slate-300"
      aria-label="Devanagari preview"
    >
      <span className="mr-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">देवनागरी</span>
      {unicodePreview}
    </p>
  ) : null;
  if (variant === "premium") {
    return (
      <>
      {preview}
      <div
        className={clsx("pp-glass p-6 text-2xl leading-relaxed tracking-wide", fontClass)}
        style={{ wordBreak: "break-word" }}
      >
        {characters.map((c, i) => (
          <span
            key={i}
            className={clsx(
              "pp-char whitespace-pre-wrap",
              c.status === "correct" && "pp-char--completed",
              c.status === "corrected" && "pp-char--completed",
              c.status === "incorrect" && "pp-char--error",
              c.status === "pending" && i !== cursor && "pp-char--upcoming",
              i === cursor && "pp-char--current"
            )}
          >
            {c.expected}
          </span>
        ))}
      </div>
      </>
    );
  }

  return (
    <>
    {preview}
    <div
      className={clsx(
        "rounded-xl bg-white p-6 text-2xl leading-relaxed tracking-wide shadow dark:bg-slate-800",
        fontClass
      )}
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
    </>
  );
}
