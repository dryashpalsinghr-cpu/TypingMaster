import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Play, Timer, GraduationCap, Target, Keyboard } from "lucide-react";
import { useProfileContext } from "../contexts/ProfileContext";
import { useThemeContext } from "../contexts/ThemeContext";
import { useT } from "../hooks/useTranslation";
import { getDashboardStats, getLanguageProgress, type DashboardStats, type LanguageProgress } from "../services/statsService";
import { getContinueLesson } from "../data/lessons";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Play;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium hover:border-brand-300 hover:bg-brand-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <Icon size={16} className="text-brand-600" />
      {label}
    </button>
  );
}

function LanguageProgressCard({ title, progress }: { title: string; progress: LanguageProgress | null }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-2 text-sm font-semibold font-devanagari">{title}</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-lg font-bold">
            {progress?.lessonsCompleted ?? 0}/{progress?.totalLessons ?? 0}
          </div>
          <div className="text-[10px] uppercase text-slate-400">Lessons</div>
        </div>
        <div>
          <div className="text-lg font-bold">{progress?.avgWpm ?? 0}</div>
          <div className="text-[10px] uppercase text-slate-400">Avg WPM</div>
        </div>
        <div>
          <div className="text-lg font-bold">{progress?.avgAccuracy ?? 0}%</div>
          <div className="text-[10px] uppercase text-slate-400">Accuracy</div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { activeProfile } = useProfileContext();
  const { interfaceLanguage } = useThemeContext();
  const t = useT();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [enProgress, setEnProgress] = useState<LanguageProgress | null>(null);
  const [hiProgress, setHiProgress] = useState<LanguageProgress | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeProfile?.id) return;
    void getDashboardStats(activeProfile.id).then(setStats);
    void getLanguageProgress(activeProfile.id, "en").then(setEnProgress);
    void getLanguageProgress(activeProfile.id, "hi").then(setHiProgress);
  }, [activeProfile?.id]);

  if (!activeProfile) return null;

  const typingLanguage = activeProfile.preferredTypingLanguage;
  const continueLesson = getContinueLesson(typingLanguage, activeProfile.lastLessonId);
  const continueLessonTitle =
    interfaceLanguage === "hi" && continueLesson.titleHi ? continueLesson.titleHi : continueLesson.title;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">
          {t("dash_welcome")}, {activeProfile.displayName} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("dash_daily_goal")}: {activeProfile.dailyGoalMinutes} {t("dash_minutes")} · {t("dash_streak")}:{" "}
          {stats?.streakDays ?? 0} {t("dash_days")}
        </p>
      </div>

      <button
        onClick={() => navigate(`/practice/${continueLesson.id}`)}
        className="flex w-full items-center justify-between rounded-xl bg-brand-600 px-5 py-4 text-white shadow hover:bg-brand-700"
      >
        <span className="font-medium font-devanagari">
          {t("dash_continue")}: {continueLessonTitle}
        </span>
        <Play size={18} />
      </button>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t("dash_avg_wpm")} value={stats?.avgWpm ?? 0} />
        <StatCard label={t("dash_avg_accuracy")} value={`${stats?.avgAccuracy ?? 0}%`} />
        <StatCard label={t("dash_best_wpm")} value={stats?.bestWpm ?? 0} />
        <StatCard label={t("dash_lessons_done")} value={stats?.lessonsCompleted ?? 0} />
        <StatCard label={t("dash_practiced_today")} value={`${stats?.minutesTodayPracticed ?? 0} min`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <LanguageProgressCard title={t("dash_english_progress")} progress={enProgress} />
        <LanguageProgressCard title={`${t("dash_hindi_progress")} (हिन्दी)`} progress={hiProgress} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-2 text-sm font-semibold">{t("dash_weekly_speed")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats?.weeklyWpm ?? []}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="wpm" stroke="#2657f5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-2 text-sm font-semibold">{t("dash_weekly_accuracy")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats?.weeklyAccuracy ?? []}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!!stats?.weakKeys.length && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-2 text-sm font-semibold">{t("dash_weakest_keys")}</h3>
          <div className="flex flex-wrap gap-2">
            {stats.weakKeys.map((k) => (
              <span
                key={k}
                className="rounded-md bg-red-50 px-2 py-1 font-mono text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400 font-devanagari"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction icon={Play} label={t("dash_start_lesson")} onClick={() => navigate(`/practice/${continueLesson.id}`)} />
        <QuickAction icon={Timer} label={t("dash_one_min_test")} onClick={() => navigate("/test")} />
        <QuickAction icon={GraduationCap} label={t("dash_exam_test")} onClick={() => navigate("/exam")} />
        <QuickAction icon={Target} label={t("dash_weak_keys")} onClick={() => navigate("/review")} />
        <QuickAction icon={Keyboard} label={t("dash_keyboard_chart")} onClick={() => navigate("/keyboard-chart")} />
      </div>
    </div>
  );
}
