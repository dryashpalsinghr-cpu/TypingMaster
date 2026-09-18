import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RotateCcw, Clock } from "lucide-react";
import { getLessonById, getLessonExercises, getLessonsForLayout } from "../data/lessons";
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

// Strict per-lesson practice window (spec: "5-minute timer for the practice
// lessons"). Once this elapses, typing stops and the Lesson Complete popup
// appears, regardless of how many exercises inside the lesson were finished.
const LESSON_DURATION_MS = 5 * 60 * 1000;

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

  // Ordered list of lessons for this layout, so "Next Lesson" can move to the
  // actual next lesson (not just the next exercise inside this one).
  const layoutLessons = useMemo(() => getLessonsForLayout(lesson.layout), [lesson.layout]);
  const nextLesson = useMemo(() => {
    const idx = layoutLessons.findIndex((l) => l.id === lesson.id);
    return idx >= 0 && idx < layoutLessons.length - 1 ? layoutLessons[idx + 1] : null;
  }, [layoutLessons, lesson.id]);

  // Strict 5-minute lesson timer (spec section: practice lesson timer).
  const [remainingMs, setRemainingMs] = useState(LESSON_DURATION_MS);
  const [lessonTimeUp, setLessonTimeUp] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setExerciseIndex(0);
    setSavedExercises(new Set());
    // A fresh lesson (or "Next Lesson") always gets a full, freshly-started
    // 5-minute window.
    setRemainingMs(LESSON_DURATION_MS);
    setLessonTimeUp(false);
  }, [lesson.id]);

  // Countdown itself: runs from the moment the lesson mounts/changes, using
  // wall-clock time (not a naive per-tick decrement) so it stays accurate
  // even if the tab is briefly backgrounded. Stops automatically once the
  // 5 minutes are up.
  useEffect(() => {
    if (lessonTimeUp) return;
    const start = performance.now();
    timerIntervalRef.current = window.setInterval(() => {
      const left = Math.max(0, LESSON_DURATION_MS - (performance.now() - start));
      setRemainingMs(left);
      if (left <= 0) {
        if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
        setLessonTimeUp(true);
      }
    }, 250);
    return () => {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, lessonTimeUp]);

  // Loads the next lesson (per spec: "Clicking Next Lesson should load the
  // next lesson and automatically restart the 5-minute timer"). Navigating
  // changes `lessonId`, which the effect above picks up to reset everything.
  const goToNextLesson = useCallback(() => {
    if (nextLesson) navigate(`/practice/${nextLesson.id}`);
    else navigate("/learn");
  }, [nextLesson, navigate]);

  // The very next character still needed to complete the current cell
  // (a Devanagari cell can require more than one physical keystroke).
  // Once the lesson timer is up, typing is over, so no key/finger stays lit.
  const currentCell = snapshot.characters[snapshot.cursor];
  const nextNeededChar = currentCell ? currentCell.expected[currentCell.typedBuffer.length] ?? null : null;
  const activeKeyDef = !lessonTimeUp && nextNeededChar ? findKeyForOutput(layout, nextNeededChar) : null;
  const shiftRequired = !lessonTimeUp && nextNeededChar ? outputRequiresShift(layout, nextNeededChar) : false;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Hard stop: once the 5-minute lesson window elapses, no further
      // keystrokes should register - the Lesson Complete popup takes over.
      if (lessonTimeUp) return;
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
    [backspace, typeCharacter, snapshot, layout, lessonTimeUp]
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
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 p-4 practice-workspace">
      <div className="flex shrink-0 items-center justify-between">
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

      <div className="grid shrink-0 grid-cols-3 gap-4 sm:grid-cols-5">
        <MetricPill label={t("practice_gross_wpm")} value={Math.round(metrics.grossWpm)} />
        <MetricPill label={t("practice_net_wpm")} value={Math.round(metrics.netWpm)} />
        <MetricPill label={t("practice_accuracy")} value={`${metrics.accuracy}%`} />
        <MetricPill label={t("practice_errors")} value={snapshot.uncorrectedErrors} />
        <MetricPill label={t("practice_progress")} value={`${Math.round(progressRatio * 100)}%`} />
      </div>

      {isHindi && (
        <p className="shrink-0 text-xs text-slate-400 font-devanagari">
          {t("practice_input_mode")}: {layout.labelHi} — यह ऐप कुंजी-कोड आधारित मैपिंग उपयोग करता है, इसलिए Windows में
          InScript लेआउट सक्रिय किए बिना भी टाइपिंग सही काम करती है।{" "}
          <button onClick={() => navigate("/keyboard-chart")} className="underline">
            {t("practice_windows_setup")}
          </button>
        </p>
      )}

      {snapshot.completed && (
        <div className="shrink-0 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
          <p className="font-semibold">
            {metrics.grossWpm >= lesson.passWpm && metrics.accuracy >= lesson.passAccuracy
              ? t("practice_lesson_passed")
              : t("practice_lesson_retry")}
          </p>
        </div>
      )}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="shrink-0">
            <PracticeText characters={snapshot.characters} cursor={snapshot.cursor} devanagari={isHindi} />
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
              physicalHints={isHindi ? ENGLISH_HINTS : undefined}
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
          timeUrgent={remainingMs <= 30_000}
          primaryLabel={isLastExercise ? t("practice_back_to_learn") : t("session_next")}
          primaryDisabled={lessonTimeUp || !snapshot.completed}
          onPrimary={goToNextExercise}
          secondaryLabel={t("session_cancel")}
          onSecondary={() => navigate("/learn")}
        />
      </div>

      {lessonTimeUp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lesson-complete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              <Clock size={22} />
            </div>
            <h2 id="lesson-complete-title" className="text-lg font-bold font-devanagari">
              {t("practice_lesson_complete_title")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-devanagari">
              {t("practice_lesson_complete_body")}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-left">
              <MetricPill label={t("practice_gross_wpm")} value={Math.round(metrics.grossWpm)} />
              <MetricPill label={t("practice_accuracy")} value={`${metrics.accuracy}%`} />
              <MetricPill label={t("practice_errors")} value={snapshot.uncorrectedErrors} />
            </div>
            <button
              onClick={goToNextLesson}
              className="mt-5 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t("practice_next_lesson")}
            </button>
          </div>
        </div>
      )}
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
