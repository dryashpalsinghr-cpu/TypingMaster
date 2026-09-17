import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { getLessonById, getLessonExercises } from "../data/lessons";
import { getKeyboardLayout, getKeyboardRows } from "../keyboards";
import { enQwertyLayout } from "../keyboards/enQwerty";
import { resolveKeyOutput, findKeyForOutput, outputRequiresShift } from "../keyboards/resolveInput";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { useT } from "../hooks/useTranslation";
import { PracticeText } from "../components/PracticeText";
import { VirtualKeyboard } from "../components/VirtualKeyboard";
import { HandGuide } from "../components/HandGuide";
import { SessionSidePanel, formatClock } from "../components/practice/SessionSidePanel";
import { useProfileContext } from "../contexts/ProfileContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { saveAttempt } from "../services/statsService";
import { touchProfileActivity } from "../services/profileService";
import type { AttemptResult } from "../types";

// English key -> normal-label lookup, used as the optional physical-key
// hint overlay when practicing Hindi InScript (spec section 11).
const ENGLISH_HINTS = new Map(enQwertyLayout.keys.map((k) => [k.code, k.normalLabel]));

export function LessonPracticePage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { activeProfile } = useProfileContext();
  const { interfaceLanguage } = useThemeContext();
  const t = useT();

  const lesson = getLessonById(lessonId) ?? getLessonById("en-b-01")!;
  const exercises = useMemo(() => getLessonExercises(lesson), [lesson]);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const exercise = exercises[exerciseIndex];

  const layout = getKeyboardLayout(lesson.layout);
  const rows = getKeyboardRows(lesson.layout);
  const isHindi = lesson.language === "hi";

  const { snapshot, typeCharacter, backspace, restart, metrics } = useTypingEngine(exercise.text, {
    strictMode: false,
    backspaceAllowed: true,
  });

  const [shiftActive, setShiftActive] = useState(false);
  const [pressedCode, setPressedCode] = useState<string | null>(null);
  const [pressedCorrect, setPressedCorrect] = useState<boolean | null>(null);
  const [savedExercises, setSavedExercises] = useState<Set<number>>(new Set());

  useEffect(() => {
    setExerciseIndex(0);
    setSavedExercises(new Set());
  }, [lesson.id]);

  // The very next character still needed to complete the current cell
  // (a Devanagari cell can require more than one physical keystroke).
  const currentCell = snapshot.characters[snapshot.cursor];
  const nextNeededChar = currentCell ? currentCell.expected[currentCell.typedBuffer.length] ?? null : null;
  const activeKeyDef = nextNeededChar ? findKeyForOutput(layout, nextNeededChar) : null;
  const shiftRequired = nextNeededChar ? outputRequiresShift(layout, nextNeededChar) : false;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
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

      // Resolve the character this physical key produces on the ACTIVE
      // layout, regardless of the OS keyboard layout currently selected in
      // Windows - this is what makes Hindi InScript typing consistent in
      // the browser (spec section 10).
      const resolved = resolveKeyOutput(layout, e.code, e.shiftKey);
      if (resolved === null) return;
      e.preventDefault();

      const expectedNext = snapshot.characters[snapshot.cursor]?.expected[snapshot.characters[snapshot.cursor].typedBuffer.length];
      setPressedCode(e.code);
      setPressedCorrect(resolved === expectedNext);
      typeCharacter(resolved);
    },
    [backspace, typeCharacter, snapshot, layout]
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

  const isLastExercise = exerciseIndex === exercises.length - 1;

  useEffect(() => {
    if (!snapshot.completed || savedExercises.has(exerciseIndex) || !activeProfile?.id) return;
    setSavedExercises((s) => new Set(s).add(exerciseIndex));

    const keyStats: AttemptResult["keyStats"] = {};
    for (const c of snapshot.characters) {
      const k = c.expected;
      keyStats[k] ??= { attempts: 0, errors: 0, avgMs: 0 };
      keyStats[k].attempts += 1;
      if (c.status === "incorrect" || c.status === "corrected") keyStats[k].errors += 1;
    }

    const passed = metrics.grossWpm >= lesson.passWpm && metrics.accuracy >= lesson.passAccuracy;

    void saveAttempt({
      profileId: activeProfile.id,
      language: lesson.language,
      layout: lesson.layout,
      courseId: lesson.courseId,
      lessonId: lesson.id,
      kind: "lesson",
      dateTime: new Date().toISOString(),
      durationSec: Math.round(snapshot.elapsedMs / 1000),
      totalKeystrokes: snapshot.totalKeystrokes,
      correctKeystrokes: snapshot.totalKeystrokes - snapshot.uncorrectedErrors,
      incorrectKeystrokes: snapshot.uncorrectedErrors,
      correctedErrors: snapshot.correctedErrors,
      uncorrectedErrors: snapshot.uncorrectedErrors,
      backspaces: snapshot.backspaces,
      grossWpm: metrics.grossWpm,
      netWpm: metrics.netWpm,
      accuracy: metrics.accuracy,
      keyStats,
      bigramStats: {},
      completed: true,
      passed,
    });

    if (isLastExercise) {
      void touchProfileActivity(activeProfile.id, lesson.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.completed, exerciseIndex, activeProfile, lesson, metrics, snapshot, isLastExercise]);

  const goToNextExercise = () => {
    if (!isLastExercise) setExerciseIndex((i) => i + 1);
    else navigate("/learn");
  };

  const progressRatio = snapshot.characters.length ? snapshot.cursor / snapshot.characters.length : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase text-brand-600 font-devanagari">
            {interfaceLanguage === "hi" ? layout.labelHi : layout.label}
          </div>
          <h1 className="text-xl font-bold font-devanagari">{interfaceLanguage === "hi" && lesson.titleHi ? lesson.titleHi : lesson.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-devanagari">
            {interfaceLanguage === "hi" && lesson.descriptionHi ? lesson.descriptionHi : lesson.description}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {t("practice_exercise")} {exerciseIndex + 1} {t("practice_of")} {exercises.length}
            {exercise.label ? ` · ${interfaceLanguage === "hi" && exercise.labelHi ? exercise.labelHi : exercise.label}` : ""}
          </p>
        </div>
        <button
          onClick={restart}
          className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RotateCcw size={14} /> {t("practice_restart")}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
        <MetricPill label={t("practice_gross_wpm")} value={Math.round(metrics.grossWpm)} />
        <MetricPill label={t("practice_net_wpm")} value={Math.round(metrics.netWpm)} />
        <MetricPill label={t("practice_accuracy")} value={`${metrics.accuracy}%`} />
        <MetricPill label={t("practice_errors")} value={snapshot.uncorrectedErrors} />
        <MetricPill label={t("practice_progress")} value={`${Math.round(progressRatio * 100)}%`} />
      </div>

      {isHindi && (
        <p className="text-xs text-slate-400 font-devanagari">
          {t("practice_input_mode")}: {layout.labelHi} — यह ऐप कुंजी-कोड आधारित मैपिंग उपयोग करता है, इसलिए Windows में
          InScript लेआउट सक्रिय किए बिना भी टाइपिंग सही काम करती है।{" "}
          <button onClick={() => navigate("/keyboard-chart")} className="underline">
            {t("practice_windows_setup")}
          </button>
        </p>
      )}

      {snapshot.completed && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
          <p className="font-semibold">
            {metrics.grossWpm >= lesson.passWpm && metrics.accuracy >= lesson.passAccuracy
              ? t("practice_lesson_passed")
              : t("practice_lesson_retry")}
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <PracticeText characters={snapshot.characters} cursor={snapshot.cursor} devanagari={isHindi} />
          <VirtualKeyboard
            rows={rows}
            activeCode={activeKeyDef?.code ?? null}
            pressedCode={pressedCode}
            pressedCorrect={pressedCorrect}
            shiftActive={shiftActive}
            shiftRequired={shiftRequired}
            showFingerColors
            devanagari={isHindi}
            physicalHints={isHindi ? ENGLISH_HINTS : undefined}
          />
          <HandGuide activeFinger={activeKeyDef?.finger ?? null} />
        </div>

        <SessionSidePanel
          progressLabel={t("session_progress")}
          progressRatio={progressRatio}
          timeLabel={t("session_time")}
          timeValue={formatClock(snapshot.elapsedMs / 1000)}
          primaryLabel={isLastExercise ? t("practice_back_to_learn") : t("session_next")}
          primaryDisabled={!snapshot.completed}
          onPrimary={goToNextExercise}
          secondaryLabel={t("session_cancel")}
          onSecondary={() => navigate("/learn")}
        />
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white p-2 text-center shadow-sm dark:bg-slate-900">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] uppercase text-slate-400">{label}</div>
    </div>
  );
}
