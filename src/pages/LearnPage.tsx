import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
import { allCourses, getLessonsForLanguage, getLessonsForLayout, hasLessonsForLayout } from "../data/lessons";
import { useProfileContext } from "../contexts/ProfileContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { useT } from "../hooks/useTranslation";
export function LearnPage() {
  const navigate = useNavigate();
  const { activeProfile } = useProfileContext();
  const { interfaceLanguage } = useThemeContext();
  const t = useT();
  const typingLanguage = activeProfile?.preferredTypingLanguage ?? "en";
  const layout = typingLanguage === "hi" ? "kruti-dev-010" : "en-qwerty";
  const isLegacyLayout = layout === "kruti-dev-010";
  const legacyReady = hasLessonsForLayout(layout);
  const lessons = isLegacyLayout ? getLessonsForLayout(layout) : getLessonsForLanguage(typingLanguage);
  const course = allCourses.find((c) => c.id === lessons[0]?.courseId);
  const isHindi = typingLanguage === "hi";
  const lastLessonIndex = activeProfile?.lastLessonId ? lessons.findIndex((l) => l.id === activeProfile.lastLessonId) : -1;
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">{t("learn_title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t(isHindi ? "learn_subtitle_hi" : "learn_subtitle_en")}</p>
      </div>
      {isLegacyLayout && !legacyReady && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <h2 className="font-semibold text-amber-800 dark:text-amber-300">{t("learn_legacy_locked_title")}</h2>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300/90">{t("learn_legacy_locked_body")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => navigate("/font-setup")} className="rounded-md bg-amber-600 px-3 py-2 text-sm text-white hover:bg-amber-700">Font Setup</button>
            <button onClick={() => navigate("/mapping-validator")} className="rounded-md border border-amber-400 px-3 py-2 text-sm text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/40">Keyboard Mapping Validator</button>
          </div>
        </div>
      )}
      {lessons.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <h2 className="font-semibold font-devanagari">{interfaceLanguage === "hi" && course?.titleHi ? course.titleHi : course?.title}</h2>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {lessons.map((lesson, i) => {
              const isCompleted = lastLessonIndex >= i;
              const title = interfaceLanguage === "hi" && lesson.titleHi ? lesson.titleHi : lesson.title;
              const description = interfaceLanguage === "hi" && lesson.descriptionHi ? lesson.descriptionHi : lesson.description;
              return (
                <li key={lesson.id}>
                  <button onClick={() => navigate(`/practice/${lesson.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800">
                    {isCompleted ? <CheckCircle2 size={18} className="shrink-0 text-green-500" /> : <Circle size={18} className="shrink-0 text-slate-300" />}
                    <div className="flex-1">
                      <div className="text-sm font-medium font-devanagari">{title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-devanagari">{description}</div>
                    </div>
                    <span className="text-xs text-slate-400">{lesson.passWpm} WPM · {lesson.passAccuracy}%</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
