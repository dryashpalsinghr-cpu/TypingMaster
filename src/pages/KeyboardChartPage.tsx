import { useState } from "react";
import { getKeyboardLayout, getKeyboardRows } from "../keyboards";
import { enQwertyLayout } from "../keyboards/enQwerty";
import { VirtualKeyboard } from "../components/VirtualKeyboard";
import type { KeyboardLayoutId } from "../types";
import { useThemeContext } from "../contexts/ThemeContext";

const ENGLISH_HINTS = new Map(enQwertyLayout.keys.map((k) => [k.code, k.normalLabel]));

export function KeyboardChartPage() {
  const { interfaceLanguage } = useThemeContext();
  const [selected, setSelected] = useState<KeyboardLayoutId>("en-qwerty");
  const layout = getKeyboardLayout(selected);
  const rows = getKeyboardRows(selected);
  const isHindi = selected === "unicode-inscript";
  const isKruti = selected === "kruti-dev-010";

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">Keyboard Chart</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Reference chart for the keyboard layouts this app supports today.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSelected("en-qwerty")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            selected === "en-qwerty"
              ? "bg-brand-600 text-white"
              : "border border-slate-300 dark:border-slate-700"
          }`}
        >
          English QWERTY
        </button>
        <button
          onClick={() => setSelected("kruti-dev-010")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${selected === "kruti-dev-010" ? "bg-brand-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}
        >
          Kruti Dev 010
        </button>
        <button
          onClick={() => setSelected("unicode-inscript")}
          className={`rounded-md px-3 py-2 text-sm font-medium font-devanagari ${
            selected === "unicode-inscript"
              ? "bg-brand-600 text-white"
              : "border border-slate-300 dark:border-slate-700"
          }`}
        >
          हिन्दी InScript
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 text-sm font-medium font-devanagari">
          {interfaceLanguage === "hi" ? layout.labelHi : layout.label}
        </div>
        <VirtualKeyboard
          rows={rows}
          activeCode={null}
          pressedCode={null}
          pressedCorrect={null}
          shiftActive={false}
          shiftRequired={false}
          showFingerColors
          devanagari={isHindi || isKruti}
          krutiDev={isKruti}
          physicalHints={isHindi ? ENGLISH_HINTS : undefined}
        />
      </div>

      {isKruti && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200"><h2 className="font-semibold">Kruti Dev 010 chart</h2><p className="mt-1 font-devanagari">हर key में ऊपर Shift glyph/symbol और नीचे normal glyph/English key दिखती है—आपके reference chart की तरह।</p></div>}
      {isHindi && <WindowsInscriptSetupGuide />}
    </div>
  );
}

function WindowsInscriptSetupGuide() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
      <h2 className="mb-2 font-semibold">Do you need to enable InScript in Windows?</h2>
      <p className="mb-2 font-devanagari">
        नहीं — इस ऐप के अंदर टाइपिंग के लिए Windows में InScript लेआउट सक्रिय करना{" "}
        <strong>ज़रूरी नहीं है</strong>। ऐप हर भौतिक कुंजी (KeyboardEvent.code) को सीधे हिन्दी अक्षर से
        जोड़ता है, चाहे Windows में कोई भी लेआउट चुना हो।
      </p>
      <p className="mb-3">
        This app maps each physical key directly to its Hindi output, so it works the same whether
        or not Windows is set to InScript. Enable the OS-level layout only if you also want to type
        Hindi InScript <em>outside</em> this app (in Word, browser address bars, etc.):
      </p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>Settings → Time &amp; Language → Language &amp; region</li>
        <li>Add a language → search "Hindi" → Next → Install</li>
        <li>Open the installed Hindi language's "Language options"</li>
        <li>Add a keyboard → choose "Devanagari - INSCRIPT"</li>
        <li>Switch input methods with Win + Space when you want to type Hindi elsewhere</li>
      </ol>
      <p className="mt-3 text-xs">
        If your physical keyboard doesn't match this chart at all (e.g. a laptop with a different
        regional layout), keys may not line up 1:1 with the diagram above — the app still goes by
        <code className="mx-1 rounded bg-black/5 px-1 dark:bg-white/10">KeyboardEvent.code</code>
        (physical position), not by what's printed on your keycaps.
      </p>
    </div>
  );
}
