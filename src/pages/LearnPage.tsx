import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
import { englishBeginnerCourse, englishBeginnerLessons } from "../data/lessons/englishBeginner";
import { useProfileContext } from "../contexts/ProfileContext";

export function LearnPage() {
  const navigate = useNavigate();
  const { activeProfile } = useProfileContext();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">Learn</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Structured lessons for {activeProfile?.preferredTypingLanguage === "hi" ? "Hindi" : "English"} touch typing.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <h2 className="font-semibold">{englishBeginnerCourse.title}</h2>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {englishBeginnerLessons.map((lesson, i) => {
            const isCompleted = activeProfile?.lastLessonId
              ? englishBeginnerLessons.findIndex((l) => l.id === activeProfile.lastLessonId) > i
              : false;
            return (
              <li key={lesson.id}>
                <button
                  onClick={() => navigate(`/practice/${lesson.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {isCompleted ? (
                    <CheckCircle2 size={18} className="shrink-0 text-green-500" />
                  ) : (
                    <Circle size={18} className="shrink-0 text-slate-300" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{lesson.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{lesson.description}</div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {lesson.passWpm} WPM · {lesson.passAccuracy}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
