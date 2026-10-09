import { useEffect, useRef, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { BackgroundRotator } from "./BackgroundRotator";
import { useProfileContext } from "../contexts/ProfileContext";
import "./responsive-fixes.css";
export function AppLayout() {
  const { activeProfile } = useProfileContext();
  const [navOpen, setNavOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  useEffect(() => setNavOpen(false), [location.pathname]);
  useEffect(() => {
    if (!navOpen) return;
    const desktop = window.matchMedia("(min-width: 768px)");
    if (desktop.matches) { setNavOpen(false); return; }
    const onBreakpointChange = () => { if (desktop.matches) setNavOpen(false); };
    desktop.addEventListener("change", onBreakpointChange);
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("#app-navigation a"));
    links[0]?.focus();
    const close = (e: KeyboardEvent) => {
      if (desktop.matches) return;
      if (e.key === "Escape") { setNavOpen(false); menuRef.current?.focus(); }
      if (e.key === "Tab" && links.length) {
        const first = links[0], last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("keydown", close);
      desktop.removeEventListener("change", onBreakpointChange);
    };
  }, [navOpen]);
  if (!activeProfile) return <Navigate to="/" replace />;
  return <div className="app-shell flex overflow-hidden" data-nav-open={navOpen}>
    <BackgroundRotator />
    <button className="mobile-nav-backdrop" aria-label="Close navigation" onClick={() => { setNavOpen(false); menuRef.current?.focus(); }} />
    <AppSidebar />
    <div className="flex min-w-0 flex-1 flex-col">
      <button ref={menuRef} className="mobile-menu-toggle" aria-label={navOpen ? "Close navigation" : "Open navigation"} aria-expanded={navOpen} aria-controls="app-navigation" onClick={() => setNavOpen((v) => !v)}>Menu</button>
      <AppHeader />
      <main className="min-h-0 flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  </div>;
}
