import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Keyboard,
  Timer,
  GraduationCap,
  Target,
  Gamepad2,
  BarChart3,
  Award,
  Users,
  Settings as SettingsIcon,
  Grid3x3,
} from "lucide-react";
import clsx from "clsx";
import { useT } from "../hooks/useTranslation";
import type { StringKey } from "../i18n/strings";

const NAV_ITEMS: { to: string; key: StringKey; icon: typeof LayoutDashboard }[] = [
  { to: "/dashboard", key: "nav_dashboard", icon: LayoutDashboard },
  { to: "/learn", key: "nav_learn", icon: BookOpen },
  { to: "/practice", key: "nav_practice", icon: Keyboard },
  { to: "/keyboard-chart", key: "nav_keyboard_chart", icon: Grid3x3 },
  { to: "/test", key: "nav_test", icon: Timer },
  { to: "/exam", key: "nav_exam", icon: GraduationCap },
  { to: "/review", key: "nav_review", icon: Target },
  { to: "/games", key: "nav_games", icon: Gamepad2 },
  { to: "/statistics", key: "nav_statistics", icon: BarChart3 },
  { to: "/certificates", key: "nav_certificates", icon: Award },
  { to: "/profiles", key: "nav_profiles", icon: Users },
  { to: "/settings", key: "nav_settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const t = useT();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:block">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white font-bold">TG</div>
        <span className="text-lg font-semibold">TypeGuru Pro</span>
      </div>
      <nav className="space-y-1">
        {NAV_ITEMS.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )
            }
          >
            <Icon size={18} />
            {t(key)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
