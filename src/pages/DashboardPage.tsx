import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Play, Timer, GraduationCap, Target, Keyboard } from "lucide-react";
import { useProfileContext } from "../contexts/ProfileContext";
import { getDashboardStats, type DashboardStats } from "../services/statsService";
import { englishBeginnerLessons } from "../data/lessons/englishBeginner";

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

export function DashboardPage() {
  const { activeProfile } = useProfileContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeProfile?.id) return;
    void getDashboardStats(activeProfile.id).then(setStats);
  }, [activeProfile?.id]);

  const nextLesson =
    englishBeginnerLessons.find((l) => l.id === activeProfile?.lastLessonId) ??
    englishBeginnerLessons[0];

  if (!activeProfile) return null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">Welcome back, {activeProfile.displayName} 👋</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Daily goal: {activeProfile.dailyGoalMinutes} minutes · Streak: {stats?.streakDays ?? 0} day(s)
        </p>
      </div>

      <button
        onClick={() => navigate(`/practice/${nextLesson.id}`)}
        className="flex w-full items-center justify-between rounded-xl bg-brand-600 px-5 py-4 text-white shadow hover:bg-brand-700"
      >
        <span className="font-medium">Continue: {nextLesson.title}</span>
        <Play size={18} />
      </button>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Avg WPM" value={stats?.avgWpm ?? 0} />
        <StatCard label="Avg Accuracy" value={`${stats?.avgAccuracy ?? 0}%`} />
        <StatCard label="Best WPM" value={stats?.bestWpm ?? 0} />
        <StatCard label="Lessons Done" value={stats?.lessonsCompleted ?? 0} />
        <StatCard label="Practiced Today" value={`${stats?.minutesTodayPracticed ?? 0} min`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-2 text-sm font-semibold">Weekly Speed</h3>
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
          <h3 className="mb-2 text-sm font-semibold">Weekly Accuracy</h3>
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
          <h3 className="mb-2 text-sm font-semibold">Weakest Keys</h3>
          <div className="flex flex-wrap gap-2">
            {stats.weakKeys.map((k) => (
              <span key={k} className="rounded-md bg-red-50 px-2 py-1 font-mono text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickAction icon={Play} label="Start Lesson" onClick={() => navigate(`/practice/${nextLesson.id}`)} />
        <QuickAction icon={Timer} label="1-Min Test" onClick={() => navigate("/test")} />
        <QuickAction icon={GraduationCap} label="Exam Test" onClick={() => navigate("/exam")} />
        <QuickAction icon={Target} label="Weak Keys" onClick={() => navigate("/review")} />
        <QuickAction icon={Keyboard} label="Keyboard Chart" onClick={() => navigate("/learn")} />
      </div>
    </div>
  );
}
