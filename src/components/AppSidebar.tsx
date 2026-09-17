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
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/practice", label: "Practice", icon: Keyboard },
  { to: "/test", label: "Typing Test", icon: Timer },
  { to: "/exam", label: "Exam Mode", icon: GraduationCap },
  { to: "/review", label: "Personalized Review", icon: Target },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/statistics", label: "Statistics", icon: BarChart3 },
  { to: "/certificates", label: "Certificates", icon: Award },
  { to: "/profiles", label: "Profiles", icon: Users },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:block">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-white font-bold">TG</div>
        <span className="text-lg font-semibold">TypeGuru Pro</span>
      </div>
      <nav className="space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
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
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
