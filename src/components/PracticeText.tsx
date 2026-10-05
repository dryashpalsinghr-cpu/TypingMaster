import clsx from "clsx";
import type { CharacterState } from "../engine/typingEngine";

export function PracticeText({
  characters,
  cursor,
  devanagari,
  variant = "default",
  krutiDev,
  unicodePreview,
  unicodeText,
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
  /** Full Devanagari text of the passage. When given together with `krutiDev`,
   * the passage is drawn in real Hindi (word by word) while you still type the
   * Kruti Dev keys - no Kruti Dev font needed on the PC. */
  unicodeText?: string;
}) {
  if (krutiDev && unicodeText && variant !== "premium") {
    return <DevanagariWordView characters={characters} cursor={cursor} unicodeText={unicodeText} />;
  }
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

/** Shows a Kruti Dev passage as readable Hindi. The typed keys (ASCII) are tracked
 * per character by the engine; here each word is mapped back to its Devanagari
 * form and coloured by the state of the keys that make it up. */
function DevanagariWordView({
  characters,
  cursor,
  unicodeText,
}: {
  characters: CharacterState[];
  cursor: number;
  unicodeText: string;
}) {
  const uniTokens = unicodeText.split(/(\s+)/);
  const tokens: { start: number; end: number; isSpace: boolean }[] = [];
  let pos = 0;
  const total = characters.length;
  // Walk the key cells and group them into word / whitespace runs.
  while (pos < total) {
    const isSpace = /\s/.test(characters[pos].expected);
    let end = pos + 1;
    while (end < total && /\s/.test(characters[end].expected) === isSpace) end++;
    tokens.push({ start: pos, end, isSpace });
    pos = end;
  }
  // uniTokens alternates word, space, word, ... (may start with an empty word).
  const uniWords = uniTokens.filter((_, i) => i % 2 === 0);
  const uniSpaces = uniTokens.filter((_, i) => i % 2 === 1);
  let wi = 0;
  let si = 0;
  const startsWithSpace = tokens.length > 0 && tokens[0].isSpace;
  if (startsWithSpace) wi = 1; // skip the leading empty word

  return (
    <div
      className="rounded-xl bg-white p-6 text-2xl leading-loose tracking-wide shadow font-devanagari dark:bg-slate-800"
      style={{ wordBreak: "break-word" }}
    >
      {tokens.map((tk) => {
        const cells = characters.slice(tk.start, tk.end);
        const isCurrent = cursor >= tk.start && cursor < tk.end;
        const anyWrong = cells.some((c) => c.status === "incorrect");
        const allDone = cells.every((c) => c.status === "correct" || c.status === "corrected");
        const anyCorrected = cells.some((c) => c.status === "corrected");
        const label = tk.isSpace ? uniSpaces[si++] ?? " " : uniWords[wi++] ?? "";
        let cls = "text-slate-400 dark:text-slate-500";
        if (anyWrong) cls = "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400";
        else if (allDone) cls = anyCorrected ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400";
        else if (cells.some((c) => c.status !== "pending")) cls = "text-slate-700 dark:text-slate-200";
        return (
          <span
            key={tk.start}
            className={clsx(
              "whitespace-pre-wrap",
              cls,
              isCurrent && "border-b-2 border-brand-500 animate-pulse"
            )}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
