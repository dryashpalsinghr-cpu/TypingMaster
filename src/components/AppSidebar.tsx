import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, Keyboard, Timer, GraduationCap, Target, Gamepad2, BarChart3, Award, Users, Settings as SettingsIcon, Grid3x3, Trophy } from "lucide-react";
import clsx from "clsx";
import { useT } from "../hooks/useTranslation";
import type { StringKey } from "../i18n/strings";
const NAV_ITEMS: { to: string; key: StringKey; icon: typeof LayoutDashboard; color: string }[] = [
  { to: "/dashboard", key: "nav_dashboard", icon: LayoutDashboard, color: "#7dd3fc" },
  { to: "/learn", key: "nav_learn", icon: BookOpen, color: "#86efac" },
  { to: "/practice", key: "nav_practice", icon: Keyboard, color: "#fde68a" },
  { to: "/keyboard-chart", key: "nav_keyboard_chart", icon: Grid3x3, color: "#c4b5fd" },
  { to: "/font-setup", key: "nav_font_setup", icon: Keyboard, color: "#f9a8d4" },
  { to: "/mapping-validator", key: "nav_mapping_validator", icon: Grid3x3, color: "#fca5a5" },
  { to: "/converter", key: "nav_converter", icon: BookOpen, color: "#67e8f9" },
  { to: "/test", key: "nav_test", icon: Timer, color: "#fdba74" },
  { to: "/exam", key: "nav_exam", icon: GraduationCap, color: "#a7f3d0" },
  { to: "/review", key: "nav_review", icon: Target, color: "#fca5a5" },
  { to: "/games", key: "nav_games", icon: Gamepad2, color: "#f0abfc" },
  { to: "/statistics", key: "nav_statistics", icon: BarChart3, color: "#93c5fd" },
  { to: "/certificates", key: "nav_certificates", icon: Award, color: "#fde047" },
  { to: "/profiles", key: "nav_profiles", icon: Users, color: "#a5f3fc" },
  { to: "/settings", key: "nav_settings", icon: SettingsIcon, color: "#e2e8f0" },
];
export function AppSidebar() {
  const t = useT();
  return (
    <aside className="pp-sidebar hidden w-60 shrink-0 flex-col p-4 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="pp-sidebar-logo grid h-9 w-9 place-items-center rounded-lg font-bold">TG</div>
        <div className="leading-tight">
          <div className="text-lg font-bold text-white">TypeGuru Pro</div>
          <div className="text-[10px] font-medium text-white/70">Master Your Typing Skills</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, key, icon: Icon, color }) => (
          <NavLink key={to} to={to} className={({ isActive }) => clsx("pp-nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium", isActive && "pp-nav-item--active")}>
            {({ isActive }) => (
              <>
                <Icon size={18} color={isActive ? "#ffffff" : color} />
                {t(key)}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="pp-sidebar-card mt-3 flex items-center gap-2 p-3">
        <Trophy size={22} className="shrink-0 text-yellow-300" />
        <div className="text-xs font-semibold leading-tight">
          Practice Today
          <br />
          Better Tomorrow
        </div>
      </div>
    </aside>
  );
}
