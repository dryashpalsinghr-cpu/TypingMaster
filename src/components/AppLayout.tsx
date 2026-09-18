import { Outlet, Navigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { BackgroundRotator } from "./BackgroundRotator";
import { useProfileContext } from "../contexts/ProfileContext";

export function AppLayout() {
  const { activeProfile } = useProfileContext();

  if (!activeProfile) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      <BackgroundRotator />
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
