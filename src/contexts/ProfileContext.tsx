import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Profile } from "../types";
import { touchProfileActivity } from "../services/profileService";
import { writePreference } from "../services/storage";
import { useThemeContext } from "./ThemeContext";

interface ProfileContextValue {
  activeProfile: Profile | null;
  setActiveProfile: (p: Profile | null) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const STORAGE_KEY = "tg-active-profile-id";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { setInterfaceLanguage } = useThemeContext();
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);

  const setActiveProfile = (p: Profile | null) => {
    if (p && p.id !== activeProfile?.id) setInterfaceLanguage(p.preferredInterfaceLanguage);
    setActiveProfileState(p);
    if (p?.id) {
      writePreference(STORAGE_KEY, String(p.id));
      void touchProfileActivity(p.id).catch(() => { /* Profile remains usable in memory. */ });
    } else {
      writePreference(STORAGE_KEY, null);
    }
  };

  useEffect(() => {
    // Profile restoration on relaunch is handled by the ProfileSelect page,
    // which reads STORAGE_KEY itself so it can validate the id still exists.
  }, []);

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileContext must be used within ProfileProvider");
  return ctx;
}

export { STORAGE_KEY as ACTIVE_PROFILE_STORAGE_KEY };
