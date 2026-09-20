import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RotateCcw, Clock, Gauge, TrendingUp, Target, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getLessonById, getLessonExercises, getLessonsForLayout } from "../data/lessons";
import { getKeyboardLayout, getKeyboardRows } from "../keyboards";
import { enQwertyLayout } from "../keyboards/enQwerty";
import { resolveKeyOutput, findKeyForOutput, outputRequiresShift } from "../keyboards/resolveInput";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { calculateMetrics } from "../engine/typingEngine";
import { useT } from "../hooks/useTranslation";
import { DualTypingSequence } from "../components/practice/DualTypingSequence";
import { VirtualKeyboard } from "../components/VirtualKeyboard";
import { HandGuide } from "../components/HandGuide";
import { SessionSidePanel, formatClock } from "../components/practice/SessionSidePanel";
import { FingerConnector } from "../components/practice/FingerConnector";
import { PremiumStatCard } from "../components/practice/PremiumStatCard";
import { useProfileContext } from "../contexts/ProfileContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { saveAttempt } from "../services/statsService";
import { touchProfileActivity } from "../services/profileService";
import type { AttemptResult } from "../types";

// Short, dynamic coaching tip keyed off the row of the key the learner needs
// next - real guidance derived from the active key, not decorative filler.
function tipForRow(row: string | undefined): string {
  switch (row) {
    case "home":
      return "Keep your fingers resting on the home row keys.";
    case "top":
      return "Reach up from the home row, then return - don't move your wrist.";
    case "bottom":
      return "Curl your finger down gently to reach the bottom row.";
    case "number":
      return "Stretch up to the number row and snap back to home row after.";
    case "space":
      return "Use your thumb for the space bar without looking down.";
    default:
      return "Stay relaxed - accuracy first, speed follows naturally.";
  }
}

// English key -> normal-label lookup, used as the optional physical-key
// hint overlay when practicing Hindi InScript (spec section 11).
const ENGLISH_HINTS = new Map(enQwertyLayout.keys.map((k) => [k.code, k.normalLabel]));

// Strict per-lesson practice window (spec: "5-minute timer for the practice
// lessons"). Once this elapses, typing stops and the Lesson Complete popup
// appears. The lesson text never "runs out" before that: when the learner
// finishes the last exercise early, the exercises simply loop again (see
// advanceChunk below) until the full 5 minutes are used.
const LESSON_DURATION_MS = 5 * 60 * 1000;

export function LessonPracticePage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { activeProfile, setActiveProfile } = useProfileContext();
  const { interfaceLanguage } = useThemeContext();
  const t = useT();

  const lesson = getLessonById(lessonId) ?? getLessonById("en-b-01")!;
  const exercises = useMemo(() => getLessonExercises(lesson), [lesson]);
  // `chunk` counts every exercise the learner has been given in this lesson
  // (0, 1, 2, ...). The exercise shown is chunk % exercises.length, so the
  // lesson text loops for as long as the 5-minute timer is still running.
  const [chunk, setChunk] = useState(0);
  const exerciseIndex = chunk % exercises.length;
  const exercise = exercises[exerciseIndex];

  const layout = getKeyboardLayout(lesson.layout);
  const rows = getKeyboardRows(lesson.layout);
  const isHindi = lesson.language === "hi";
  const isKruti = lesson.layout === "kruti-dev-010";

  const { snapshot, typeCharacter, backspace, restart, loadText, metrics } = useTypingEngine(exercise.text, {
    strictMode: false,
    backspaceAllowed: true,
  });

  const [shiftActive, setShiftActive] = useState(false);
  const [pressedCode, setPressedCode] = useState<string | null>(null);
  const [pressedCorrect, setPressedCorrect] = useState<boolean | null>(null);
  const [savedExercises, setSavedExercises] = useState<Set<number>>(new Set());
  // Totals of all finished/skipped chunks in this lesson session, so the WPM /
  // accuracy / error cards keep counting across rounds instead of resetting.
  const [carry, setCarry] = useState({ keystrokes: 0, errors: 0, ms: 0 });
  // Result of the round that just finished (shown as a small banner while the
  // next round is already running).
  const [lastRoundPassed, setLastRoundPassed] = useState<boolean | null>(null);

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
  // The countdown starts once, at the first key of the lesson, and is NOT
  // restarted when the next exercise round begins.
  const [lessonStarted, setLessonStarted] = useState(false);
  const lessonStartRef = useRef<number | null>(null);

  useEffect(() => {
    setChunk(0);
    setSavedExercises(new Set());
    setCarry({ keystrokes: 0, errors: 0, ms: 0 });
    setLastRoundPassed(null);
    // A fresh lesson (or "Next Lesson") always gets a full, freshly-started
    // 5-minute window.
    lessonStartRef.current = null;
    setLessonStarted(false);
    setRemainingMs(LESSON_DURATION_MS);
    setLessonTimeUp(false);
  }, [lesson.id]);

  // Countdown itself: starts only once the user presses their first key of
  // the lesson. Uses wall-clock time (not a naive per-tick decrement) so it
  // stays accurate even if the tab is briefly backgrounded. Stops
  // automatically once the 5 minutes are up.
  useEffect(() => {
    if (lessonTimeUp || !lessonStarted) return;
    const start = lessonStartRef.current ?? performance.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, LESSON_DURATION_MS - (performance.now() - start));
      setRemainingMs(left);
      if (left <= 0) {
        window.clearInterval(id);
        setLessonTimeUp(true);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [lesson.id, lessonTimeUp, lessonStarted]);

  // ---- Resume progress ---------------------------------------------------
  // Remembers how far the learner got, so after closing and re-opening the
  // app "Continue" (Dashboard) and the tick marks (Learn) point to the right
  // lesson instead of Lesson 1. Progress only ever moves FORWARD, so
  // revising an older lesson never sets it back.
  const rememberProgress = (targetLessonId: string) => {
    const profile = activeProfile;
    if (!profile?.id || profile.lastLessonId === targetLessonId) return;
    const targetIdx = layoutLessons.findIndex((l) => l.id === targetLessonId);
    const currentIdx = layoutLessons.findIndex((l) => l.id === profile.lastLessonId);
    if (targetIdx < 0 || targetIdx < currentIdx) return;
    // Save to the database (survives closing the app) and refresh the
    // in-memory profile so Dashboard / Learn show it without a restart.
    void touchProfileActivity(profile.id, targetLessonId).then(() => {
      setActiveProfile({ ...profile, lastLessonId: targetLessonId });
    });
  };

  // The moment the learner types the first key, this lesson is "where they are"
  // (so closing the app in the middle of a lesson resumes at this lesson).
  useEffect(() => {
    if (!lessonStarted || lessonStartRef.current === null) return;
    rememberProgress(lesson.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonStarted, lesson.id]);

  // When the 5 minutes are over the lesson counts as done, so the NEXT lesson
  // becomes the place to continue from (stays put on the very last lesson).
  useEffect(() => {
    if (!lessonTimeUp || lessonStartRef.current === null) return;
    rememberProgress(nextLesson ? nextLesson.id : lesson.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonTimeUp, lesson.id]);

  // Roll into the next exercise (looping back to the first one after the
  // last). Everything typed so far is added to the session totals.
  const advanceChunk = useCallback(() => {
    setCarry((c) => ({
      keystrokes: c.keystrokes + snapshot.totalKeystrokes,
      errors: c.errors + snapshot.uncorrectedErrors,
      ms: c.ms + snapshot.elapsedMs,
    }));
    const nextIndex = (chunk + 1) % exercises.length;
    setChunk(chunk + 1);
    loadText(exercises[nextIndex].text);
  }, [chunk, exercises, loadText, snapshot.totalKeystrokes, snapshot.uncorrectedErrors, snapshot.elapsedMs]);

  // Exercise finished but the 5 minutes are not over yet -> keep going with
  // the next round immediately, so the lesson never ends early.
  useEffect(() => {
    if (!snapshot.completed || lessonTimeUp) return;
    setLastRoundPassed(metrics.grossWpm >= lesson.passWpm && metrics.accuracy >= lesson.passAccuracy);
    advanceChunk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.completed]);

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

  // Stage that wraps the virtual keyboard + hand guide, so FingerConnector
  // can measure both and draw the guide line between them (premium theme).
  const keyboardStageRef = useRef<HTMLDivElement>(null);
  const currentKeyLabel = !lessonTimeUp && nextNeededChar ? (nextNeededChar === " " ? "Space" : nextNeededChar) : null;
  const currentTip = tipForRow(activeKeyDef?.row);

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

      if (lessonStartRef.current === null) {
        lessonStartRef.current = performance.now();
        setLessonStarted(true);
      }

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

  useEffect(() => {
    if (!snapshot.completed || savedExercises.has(chunk) || !activeProfile?.id) return;
    setSavedExercises((s) => new Set(s).add(chunk));

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.completed, chunk, activeProfile, lesson, metrics, snapshot]);

  // Session-wide numbers (all rounds so far + the round in progress) for the
  // stat cards and the Lesson Complete popup.
  const sessionMetrics = calculateMetrics(
    {
      ...snapshot,
      totalKeystrokes: carry.keystrokes + snapshot.totalKeystrokes,
      uncorrectedErrors: carry.errors + snapshot.uncorrectedErrors,
      elapsedMs: carry.ms + snapshot.elapsedMs,
    },
    { includeKdph: true }
  );
  const sessionErrors = carry.errors + snapshot.uncorrectedErrors;

  const progressRatio = snapshot.characters.length ? snapshot.cursor / snapshot.characters.length : 0;

  return (
    <div className="practice-premium mx-auto flex h-full max-w-[1800px] flex-col gap-4 overflow-x-hidden p-4 practice-workspace">
      <div className="practice-premium__bg" aria-hidden="true" />
      <div className="practice-premium__grid" aria-hidden="true" />
      <div className="pp-motivation right-6 top-2 hidden text-sm lg:block" aria-hidden="true">
        Small Steps
        <br />
        Big Progress
      </div>

      <div className="mx-auto flex w-full max-w-6xl shrink-0 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-[#1677e8] font-devanagari">
              {interfaceLanguage === "hi" ? layout.labelHi : layout.label}
            </div>
            <h1 className="text-2xl font-extrabold text-[#0f2a52] dark:text-slate-100 font-devanagari">
              {interfaceLanguage === "hi" && lesson.titleHi ? lesson.titleHi : lesson.title}
            </h1>
            <p className="text-sm text-[#5c7599] dark:text-slate-400 font-devanagari">
              {interfaceLanguage === "hi" && lesson.descriptionHi ? lesson.descriptionHi : lesson.description}
            </p>
            <p className="mt-1 text-xs text-[#7c93b8] dark:text-slate-500">
              {t("practice_exercise")} {exerciseIndex + 1} {t("practice_of")} {exercises.length}
              {exercise.label ? ` · ${interfaceLanguage === "hi" && exercise.labelHi ? exercise.labelHi : exercise.label}` : ""}
            </p>
          </div>
          <button onClick={restart} className="pp-restart-btn">
            <RotateCcw size={14} /> {t("practice_restart")}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          <PremiumStatCard icon={Gauge} label={t("practice_gross_wpm")} value={Math.round(sessionMetrics.grossWpm)} color="#1677e8" />
          <PremiumStatCard icon={TrendingUp} label={t("practice_net_wpm")} value={Math.round(sessionMetrics.netWpm)} color="#0ea5e9" />
          <PremiumStatCard icon={Target} label={t("practice_accuracy")} value={`${sessionMetrics.accuracy}%`} color="#22c55e" />
          <PremiumStatCard icon={AlertTriangle} label={t("practice_errors")} value={sessionErrors} color="#ef4444" />
          <PremiumStatCard icon={CheckCircle2} label={t("practice_progress")} value={`${Math.round(progressRatio * 100)}%`} color="#8b5cf6" />
        </div>

        {isKruti && (
          <p className="pp-glass px-4 py-2 text-xs text-[#2d4f7c] dark:text-slate-400 font-devanagari">
            कृति देव 010: कीबोर्ड पर सामान्य अंग्रेज़ी अक्षर टाइप होते हैं और Kruti Dev फ़ॉन्ट उन्हें हिंदी की शक्ल देता है।
            हर बॉक्स में वही हिंदी अक्षर दिखता है जो वह key बनाएगी। परीक्षा-कंप्यूटर पर यही फ़ॉन्ट होता है।{" "}
            <button onClick={() => navigate("/font-setup")} className="underline">
              Font Setup
            </button>
          </p>
        )}
        {isHindi && !isKruti && (
          <p className="pp-glass px-4 py-2 text-xs text-[#2d4f7c] dark:text-slate-400 font-devanagari">
            {t("practice_input_mode")}: {layout.labelHi} — यह ऐप कुंजी-कोड आधारित मैपिंग उपयोग करता है, इसलिए Windows में
            InScript लेआउट सक्रिय किए बिना भी टाइपिंग सही काम करती है।{" "}
            <button onClick={() => navigate("/keyboard-chart")} className="underline">
              {t("practice_windows_setup")}
            </button>
          </p>
        )}

        {lastRoundPassed !== null && !lessonTimeUp && (
          <div className="rounded-xl border border-green-200 bg-green-50/90 p-4 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
            <p className="font-semibold">
              {lastRoundPassed ? t("practice_lesson_passed") : t("practice_lesson_retry")}
            </p>
          </div>
        )}
      </div>

      <div className="grid min-h-0 min-w-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          <div className="pp-glass shrink-0 basis-[18%]">
            <DualTypingSequence characters={snapshot.characters} cursor={snapshot.cursor} devanagari={isHindi} krutiDev={isKruti} />
          </div>
          <div ref={keyboardStageRef} className="relative flex min-h-0 min-w-0 flex-1 flex-col gap-3">
            <FingerConnector
              stageRef={keyboardStageRef}
              activeCode={activeKeyDef?.code ?? null}
              activeFinger={activeKeyDef?.finger ?? null}
            />
            <div className="shrink-0 basis-[46%]">
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
                variant="premium"
              />
            </div>
            <div className="min-h-0 flex-1 basis-[54%]">
              <HandGuide activeFinger={activeKeyDef?.finger ?? null} variant="premium" />
            </div>
          </div>
        </div>

        <SessionSidePanel
          variant="premium"
          progressLabel={t("session_progress")}
          progressRatio={progressRatio}
          timeLabel={t("session_time_left")}
          timeValue={formatClock(remainingMs / 1000)}
          timeUrgent={remainingMs <= 30_000}
          currentKeyLabel={currentKeyLabel}
          currentKeyCaption="Current Key"
          tip={currentTip}
          primaryLabel={t("session_next")}
          primaryDisabled={lessonTimeUp}
          onPrimary={advanceChunk}
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
          <div className="pp-glass w-full max-w-sm p-6 text-center !bg-white dark:!bg-slate-900">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1677e8] to-[#4ea8ff] text-white shadow-lg">
              <Clock size={22} />
            </div>
            <h2 id="lesson-complete-title" className="text-lg font-bold text-[#0f2a52] dark:text-slate-100 font-devanagari">
              {t("practice_lesson_complete_title")}
            </h2>
            <p className="mt-1 text-sm text-[#5c7599] dark:text-slate-400 font-devanagari">
              {t("practice_lesson_complete_body")}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-left">
              <PremiumStatCard icon={Gauge} label={t("practice_gross_wpm")} value={Math.round(sessionMetrics.grossWpm)} color="#1677e8" />
              <PremiumStatCard icon={Target} label={t("practice_accuracy")} value={`${sessionMetrics.accuracy}%`} color="#22c55e" />
              <PremiumStatCard icon={AlertTriangle} label={t("practice_errors")} value={sessionErrors} color="#ef4444" />
            </div>
            <button onClick={goToNextLesson} className="pp-btn-primary mt-5">
              {t("practice_next_lesson")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
