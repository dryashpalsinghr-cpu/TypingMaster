import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { englishBeginnerLessons } from "../data/lessons/englishBeginner";
import { enQwertyLayout } from "../keyboards/enQwerty";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { PracticeText } from "../components/PracticeText";
import { VirtualKeyboard } from "../components/VirtualKeyboard";
import { HandGuide } from "../components/HandGuide";
import { useProfileContext } from "../contexts/ProfileContext";
import { saveAttempt } from "../services/statsService";
import { touchProfileActivity } from "../services/profileService";
import type { AttemptResult } from "../types";

export function LessonPracticePage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { activeProfile } = useProfileContext();
  const lesson = englishBeginnerLessons.find((l) => l.id === lessonId) ?? englishBeginnerLessons[0];

  const { snapshot, typeCharacter, backspace, restart, metrics } = useTypingEngine(lesson.practiceText, {
    strictMode: false,
    backspaceAllowed: true,
  });

  const [shiftActive, setShiftActive] = useState(false);
  const [pressedCode, setPressedCode] = useState<string | null>(null);
  const [pressedCorrect, setPressedCorrect] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);

  const expectedChar = snapshot.characters[snapshot.cursor]?.expected ?? null;
  const activeKeyDef = expectedChar
    ? enQwertyLayout.keys.find(
        (k) => k.output === expectedChar || k.shiftOutput === expectedChar || (expectedChar === " " && k.code === "Space")
      )
    : null;

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
      if (e.key.length !== 1 && e.key !== "Enter" && e.key !== "Tab") return;
      e.preventDefault();

      const char = e.key === "Enter" ? "\n" : e.key === "Tab" ? "\t" : e.key;
      const expected = snapshot.characters[snapshot.cursor]?.expected;
      setPressedCode(e.code);
      setPressedCorrect(char === expected);
      typeCharacter(char);
    },
    [backspace, typeCharacter, snapshot]
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
    if (!snapshot.completed || saved || !activeProfile?.id) return;
    setSaved(true);

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
      language: "en",
      layout: "en-qwerty",
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

    void touchProfileActivity(activeProfile.id, lesson.id);
  }, [snapshot.completed, saved, activeProfile, lesson, metrics, snapshot]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase text-brand-600">English QWERTY</div>
          <h1 className="text-xl font-bold">{lesson.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{lesson.description}</p>
        </div>
        <button
          onClick={() => {
            restart();
            setSaved(false);
          }}
          className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RotateCcw size={14} /> Restart
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
        <MetricPill label="Gross WPM" value={Math.round(metrics.grossWpm)} />
        <MetricPill label="Net WPM" value={Math.round(metrics.netWpm)} />
        <MetricPill label="Accuracy" value={`${metrics.accuracy}%`} />
        <MetricPill label="Errors" value={snapshot.uncorrectedErrors} />
        <MetricPill label="Progress" value={`${Math.round((snapshot.cursor / snapshot.characters.length) * 100)}%`} />
      </div>

      <PracticeText characters={snapshot.characters} cursor={snapshot.cursor} />

      {snapshot.completed && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
          <p className="font-semibold">
            {metrics.grossWpm >= lesson.passWpm && metrics.accuracy >= lesson.passAccuracy
              ? "Lesson passed! Great job."
              : "Lesson complete. Try again to hit the pass targets."}
          </p>
          <button
            onClick={() => navigate("/learn")}
            className="mt-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Back to Learn
          </button>
        </div>
      )}

      <VirtualKeyboard
        activeCode={activeKeyDef?.code ?? null}
        pressedCode={pressedCode}
        pressedCorrect={pressedCorrect}
        shiftActive={shiftActive}
        showFingerColors
      />
      <HandGuide activeFinger={activeKeyDef?.finger ?? null} />
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
