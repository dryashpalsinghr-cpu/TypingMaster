import { Outlet, Navigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { BackgroundRotator } from "./BackgroundRotator";
import { useProfileContext } from "../contexts/ProfileContext";

export function AppLayout() {
  const { activeProfile } = useProfileContext();

  if (!activeProfile) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen">
      <BackgroundRotator />
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
