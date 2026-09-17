import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
import { getCourseForLanguage, getLessonsForLanguage } from "../data/lessons";
import { useProfileContext } from "../contexts/ProfileContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { useT } from "../hooks/useTranslation";

export function LearnPage() {
  const navigate = useNavigate();
  const { activeProfile } = useProfileContext();
  const { interfaceLanguage } = useThemeContext();
  const t = useT();

  const typingLanguage = activeProfile?.preferredTypingLanguage ?? "en";
  const course = getCourseForLanguage(typingLanguage);
  const lessons = getLessonsForLanguage(typingLanguage);
  const isHindi = typingLanguage === "hi";

  const lastLessonIndex = activeProfile?.lastLessonId
    ? lessons.findIndex((l) => l.id === activeProfile.lastLessonId)
    : -1;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">{t("learn_title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t(isHindi ? "learn_subtitle_hi" : "learn_subtitle_en")}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-4 dark:border-slate-800">
          <h2 className="font-semibold font-devanagari">
            {interfaceLanguage === "hi" && course?.titleHi ? course.titleHi : course?.title}
          </h2>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {lessons.map((lesson, i) => {
            const isCompleted = lastLessonIndex > i;
            const title = interfaceLanguage === "hi" && lesson.titleHi ? lesson.titleHi : lesson.title;
            const description =
              interfaceLanguage === "hi" && lesson.descriptionHi ? lesson.descriptionHi : lesson.description;
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
                    <div className="text-sm font-medium font-devanagari">{title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-devanagari">{description}</div>
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
