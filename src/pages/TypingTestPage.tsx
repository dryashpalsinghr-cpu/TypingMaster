import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { getTestTextsForLanguage, TEST_DURATIONS_MIN, type TestText } from "../data/testTexts";
import { getKeyboardLayout, getKeyboardRows } from "../keyboards";
import { enQwertyLayout } from "../keyboards/enQwerty";
import { resolveKeyOutput, findKeyForOutput, outputRequiresShift } from "../keyboards/resolveInput";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { calculateMetrics } from "../engine/typingEngine";
import { useT } from "../hooks/useTranslation";
import { useThemeContext } from "../contexts/ThemeContext";
import { useProfileContext } from "../contexts/ProfileContext";
import { PracticeText } from "../components/PracticeText";
import { VirtualKeyboard } from "../components/VirtualKeyboard";
import { HandGuide } from "../components/HandGuide";
import { SessionSidePanel, formatClock } from "../components/practice/SessionSidePanel";
import { saveAttempt } from "../services/statsService";
import type { AttemptResult, KeyboardLayoutId, TypingLanguage } from "../types";
import { unicodeToKrutiDev, untypableChars } from "../converter/krutiDevCore";

const ENGLISH_HINTS = new Map(enQwertyLayout.keys.map((k) => [k.code, k.normalLabel]));

type Phase = "setup" | "running" | "results";

export function TypingTestPage() {
  const navigate = useNavigate();
  const { interfaceLanguage } = useThemeContext();
  const { activeProfile } = useProfileContext();
  const t = useT();

  const [phase, setPhase] = useState<Phase>("setup");
  const [testLanguage, setTestLanguage] = useState<TypingLanguage>("en");
  const [hindiLayout, setHindiLayout] = useState<"unicode-inscript" | "kruti-dev-010">("unicode-inscript");
  const availableTexts = useMemo(() => getTestTextsForLanguage(testLanguage), [testLanguage]);
  const [textId, setTextId] = useState<string>(availableTexts[0]?.id ?? "");
  const [durationMin, setDurationMin] = useState<number>(5);
  const [targetWpm, setTargetWpm] = useState<string>("");
  const [targetAccuracy, setTargetAccuracy] = useState<string>("");

  useEffect(() => {
    // Keep the selected passage valid whenever the language changes.
    const list = getTestTextsForLanguage(testLanguage);
    if (!list.find((x) => x.id === textId)) setTextId(list[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testLanguage]);

  const selectedText: TestText | undefined = availableTexts.find((x) => x.id === textId) ?? availableTexts[0];

  const isHindi = testLanguage === "hi";
  // Hindi passages are stored as Unicode. For Kruti Dev 010 they are converted to
  // the ASCII keystrokes you actually type, and the layout switches with it.
  const layoutId: KeyboardLayoutId = isHindi ? hindiLayout : selectedText?.layout ?? "en-qwerty";
  const isKruti = layoutId === "kruti-dev-010";
  const layout = selectedText ? getKeyboardLayout(layoutId) : null;
  const rows = selectedText ? getKeyboardRows(layoutId) : [];
  const passage = useMemo(
    () => (!selectedText ? "" : isKruti ? unicodeToKrutiDev(selectedText.text) : selectedText.text),
    [selectedText, isKruti]
  );
  const untypable = useMemo(() => (isKruti ? untypableChars(passage) : []), [passage, isKruti]);

  const { snapshot, typeCharacter, backspace, restart } = useTypingEngine(passage, {
    strictMode: false,
    backspaceAllowed: true,
  });

  const [shiftActive, setShiftActive] = useState(false);
  const [pressedCode, setPressedCode] = useState<string | null>(null);
  const [pressedCorrect, setPressedCorrect] = useState<boolean | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [finishedEarly, setFinishedEarly] = useState(false);
  const [usedMs, setUsedMs] = useState(0);
  const [finalMetrics, setFinalMetrics] = useState<ReturnType<typeof calculateMetrics> | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const durationMsRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const snapshotRef = useRef(snapshot);
  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const currentCell = snapshot.characters[snapshot.cursor];
  const nextNeededChar = currentCell ? currentCell.expected[currentCell.typedBuffer.length] ?? null : null;
  const activeKeyDef = layout && nextNeededChar ? findKeyForOutput(layout, nextNeededChar) : null;
  const shiftRequired = layout && nextNeededChar ? outputRequiresShift(layout, nextNeededChar) : false;

  const finishTest = useCallback((usedMs: number) => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    const actualUsedMs = Math.max(usedMs, 1000);
    setUsedMs(actualUsedMs);
    const finalSnapshot = { ...snapshotRef.current, elapsedMs: actualUsedMs };
    setFinalMetrics(calculateMetrics(finalSnapshot, { includeKdph: true }));
    setPhase("results");
  }, []);

  const startTest = () => {
    if (!selectedText) return;
    restart();
    setFinishedEarly(false);
    setFinalMetrics(null);
    setSavedOnce(false);
    durationMsRef.current = durationMin * 60_000;
    setRemainingMs(durationMsRef.current);
    setPhase("running");
  };

  // Countdown timer, running independently of when the first keystroke happens.
  useEffect(() => {
    if (phase !== "running") return;
    const start = performance.now();
    const total = durationMsRef.current;
    timerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const left = Math.max(0, total - elapsed);
      setRemainingMs(left);
      if (left <= 0) {
        finishTest(total);
      }
    }, 250);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Passage fully typed before time ran out - end the test right away.
  useEffect(() => {
    if (phase === "running" && snapshot.completed) {
      setFinishedEarly(true);
      finishTest(durationMsRef.current - remainingMs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.completed, phase]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== "running" || !layout) return;
      if (e.key === "Shift") {
        setShiftActive(true);
        return;
      }
      if (snapshot.completed) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
        setPressedCode("Backspace");
        return;
      }
      const resolved = resolveKeyOutput(layout, e.code, e.shiftKey);
      if (resolved === null) return;
      e.preventDefault();
      const expectedNext = snapshot.characters[snapshot.cursor]?.expected[snapshot.characters[snapshot.cursor].typedBuffer.length];
      setPressedCode(e.code);
      setPressedCorrect(resolved === expectedNext);
      typeCharacter(resolved);
    },
    [phase, layout, backspace, typeCharacter, snapshot]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "Shift") setShiftActive(false);
    setPressedCode(null);
    setPressedCorrect(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Save the attempt once results are shown.
  useEffect(() => {
    if (phase !== "results" || savedOnce || !finalMetrics || !activeProfile?.id || !selectedText) return;
    setSavedOnce(true);
    const keyStats: AttemptResult["keyStats"] = {};
    for (const c of snapshot.characters) {
      const k = c.expected;
      keyStats[k] ??= { attempts: 0, errors: 0, avgMs: 0 };
      keyStats[k].attempts += 1;
      if (c.status === "incorrect" || c.status === "corrected") keyStats[k].errors += 1;
    }
    const wpmTarget = Number(targetWpm) || undefined;
    const accTarget = Number(targetAccuracy) || undefined;
    const passed = (wpmTarget === undefined || finalMetrics.netWpm >= wpmTarget) && (accTarget === undefined || finalMetrics.accuracy >= accTarget);
    void saveAttempt({
      profileId: activeProfile.id,
      language: testLanguage,
      layout: layoutId,
      testId: selectedText.id,
      kind: "test",
      dateTime: new Date().toISOString(),
      durationSec: usedMs / 1000,
      totalKeystrokes: snapshot.totalKeystrokes,
      correctKeystrokes: snapshot.totalKeystrokes - snapshot.uncorrectedErrors,
      incorrectKeystrokes: snapshot.uncorrectedErrors,
      correctedErrors: snapshot.correctedErrors,
      uncorrectedErrors: snapshot.uncorrectedErrors,
      backspaces: snapshot.backspaces,
      grossWpm: finalMetrics.grossWpm,
      netWpm: finalMetrics.netWpm,
      accuracy: finalMetrics.accuracy,
      keyStats,
      bigramStats: {},
      completed: true,
      passed: (wpmTarget !== undefined || accTarget !== undefined) ? passed : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, savedOnce, finalMetrics, activeProfile, selectedText, testLanguage, usedMs, snapshot]);

  const progressRatio = phase === "running" ? 1 - remainingMs / Math.max(durationMsRef.current, 1) : 0;

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div>
          <h1 className="text-xl font-bold font-devanagari">{t("test_title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-devanagari">{t("test_subtitle")}</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-400">{t("test_language")}</label>
            <div className="flex gap-2">
              {(["en", "hi"] as TypingLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setTestLanguage(lang)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium font-devanagari ${
                    testLanguage === lang
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                  }`}
                >
                  {lang === "en" ? "English (QWERTY)" : "हिन्दी"}
                </button>
              ))}
            </div>
          </div>

          {isHindi && (
            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-400">कीबोर्ड / Keyboard</label>
              <div className="flex flex-wrap gap-2">
                {([
                  ["unicode-inscript", "InScript (Unicode)"],
                  ["kruti-dev-010", "Kruti Dev 010"],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setHindiLayout(id)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                      hindiLayout === id
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                        : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {isKruti && (
                <p className="mt-2 text-xs text-slate-500 font-devanagari dark:text-slate-400">
                  पैराग्राफ़ Kruti Dev के key-कोड में बदलकर दिखाया जाएगा (जैसे भारत = Hkkjr)। असली हिंदी रूप ऊपर अलग पंक्ति में दिखेगा।
                  परीक्षा जैसा दृश्य पाने के लिए Kruti Dev 010 फ़ॉन्ट इंस्टॉल हो — देखे�� Font Setup।
                </p>
              )}
              {untypable.length > 0 && (
                <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 font-devanagari">
                  इस पैराग्राफ़ में कुछ चिह्न ({untypable.join(" ")}) सामान्य कीबोर्ड से टाइप नहीं हो सकते। कोई दूसरा पैराग्राफ़ चुनें।
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-400">{t("test_passage")}</label>
            <select
              value={textId}
              onChange={(e) => setTextId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm font-devanagari dark:border-slate-600 dark:bg-slate-800"
            >
              {availableTexts.map((x) => (
                <option key={x.id} value={x.id}>
                  {(interfaceLanguage === "hi" ? x.titleHi : x.title)} · {x.wordCount} {t("test_words")}{isKruti && untypableChars(unicodeToKrutiDev(x.text)).length > 0 ? " ⚠" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-400">{t("test_duration")}</label>
            <div className="flex flex-wrap gap-2">
              {TEST_DURATIONS_MIN.map((m) => (
                <button
                  key={m}
                  onClick={() => setDurationMin(m)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    durationMin === m
                      ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                  }`}
                >
                  {m} {t("test_minutes")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-400">{t("test_target_wpm")}</label>
              <input
                type="number"
                min={0}
                value={targetWpm}
                onChange={(e) => setTargetWpm(e.target.value)}
                placeholder="e.g. 30"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-400">{t("test_target_accuracy")}</label>
              <input
                type="number"
                min={0}
                max={100}
                value={targetAccuracy}
                onChange={(e) => setTargetAccuracy(e.target.value)}
                placeholder="e.g. 95"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
          </div>

          <button
            onClick={startTest}
            disabled={!selectedText}
            className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {t("test_start")}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "results" && finalMetrics) {
    const wpmTarget = Number(targetWpm) || undefined;
    const accTarget = Number(targetAccuracy) || undefined;
    const hasTarget = wpmTarget !== undefined || accTarget !== undefined;
    const passed = (wpmTarget === undefined || finalMetrics.netWpm >= wpmTarget) && (accTarget === undefined || finalMetrics.accuracy >= accTarget);

    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <h1 className="text-xl font-bold font-devanagari">{t("test_result_title")}</h1>

        {finishedEarly && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 font-devanagari dark:bg-amber-900/20 dark:text-amber-300">
            {t("test_finished_early")}
          </p>
        )}

        {hasTarget && (
          <div
            className={`rounded-xl p-4 text-center text-sm font-semibold ${
              passed
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
            }`}
          >
            {passed ? t("test_result_pass") : t("test_result_fail")}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <ResultPill label={t("test_gross_wpm")} value={Math.round(finalMetrics.grossWpm)} />
          <ResultPill label={t("test_net_wpm")} value={Math.round(finalMetrics.netWpm)} />
          <ResultPill label={t("test_accuracy")} value={`${finalMetrics.accuracy}%`} />
          <ResultPill label={t("test_errors")} value={snapshot.uncorrectedErrors} />
          <ResultPill label={t("test_duration_used")} value={formatClock(usedMs / 1000)} />
        </div>

        {activeProfile?.id && <p className="text-xs text-slate-400">{t("test_saved")}</p>}

        <div className="flex gap-3">
          <button
            onClick={startTest}
            className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {t("test_retry")}
          </button>
          <button
            onClick={() => setPhase("setup")}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t("test_new")}
          </button>
        </div>
      </div>
    );
  }

  // phase === "running"
  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-3 p-4 practice-workspace">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="text-lg font-bold font-devanagari">{t("test_title")}</h1>
        <button
          onClick={() => finishTest(durationMsRef.current - remainingMs)}
          className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RotateCcw size={12} /> {t("session_finish")}
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="shrink-0">
            <PracticeText characters={snapshot.characters} cursor={snapshot.cursor} devanagari={isHindi} krutiDev={isKruti} unicodePreview={selectedText?.text} />
          </div>
          <div className="shrink-0">
            <VirtualKeyboard
              rows={rows}
              activeCode={activeKeyDef?.code ?? null}
              pressedCode={pressedCode}
              pressedCorrect={pressedCorrect}
              shiftActive={shiftActive}
              shiftRequired={shiftRequired}
              showFingerColors
              devanagari={isHindi}
              krutiDev={isKruti}
              physicalHints={isHindi && !isKruti ? ENGLISH_HINTS : undefined}
            />
          </div>
          <div className="min-h-0 flex-1">
            <HandGuide activeFinger={activeKeyDef?.finger ?? null} />
          </div>
        </div>

        <SessionSidePanel
          progressLabel={t("session_progress")}
          progressRatio={progressRatio}
          timeLabel={t("session_time_left")}
          timeValue={formatClock(remainingMs / 1000)}
          timeUrgent={remainingMs < 30_000}
          showPrimary={false}
          secondaryLabel={t("session_cancel")}
          onSecondary={() => navigate("/dashboard")}
        />
      </div>
    </div>
  );
}

function ResultPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-slate-900">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] uppercase text-slate-400">{label}</div>
    </div>
  );
}
