import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProfileProvider, useProfileContext, ACTIVE_PROFILE_STORAGE_KEY } from "./contexts/ProfileContext";
import { AppLayout } from "./components/AppLayout";
import { AppEnhancements } from "./components/AppEnhancements";
import { ProfileSelectPage } from "./pages/ProfileSelectPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LearnPage } from "./pages/LearnPage";
import { LessonPracticePage } from "./pages/LessonPracticePage";
import { TypingTestPage } from "./pages/TypingTestPage";
import { SettingsPage } from "./pages/SettingsPage";
import { KeyboardChartPage } from "./pages/KeyboardChartPage";
import { MappingValidatorPage } from "./pages/MappingValidatorPage";
import { FontSetupPage } from "./pages/FontSetupPage";
import { ConverterPage } from "./pages/ConverterPage";
import { ExamPage } from "./pages/ExamPage";
import { CertificatesPage } from "./pages/CertificatesPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { ReviewPage } from "./pages/ReviewPage";
import { GamesPage } from "./pages/GamesPage";
import { BackupPage } from "./pages/BackupPage";
import { getProfile } from "./services/profileService";
function ProfileRestorer({ children }: { children: React.ReactNode }) {
  const { setActiveProfile } = useProfileContext();
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    const savedId = localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
    if (!savedId) { setRestored(true); return; }
    void getProfile(Number(savedId)).then((p) => { if (p) setActiveProfile(p); setRestored(true); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!restored) return null;
  return <>{children}</>;
}
export default function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <ProfileRestorer>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ProfileSelectPage />} />
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/practice" element={<LearnPage />} />
                <Route path="/practice/:lessonId" element={<LessonPracticePage />} />
                <Route path="/keyboard-chart" element={<KeyboardChartPage />} />
                <Route path="/font-setup" element={<FontSetupPage />} />
                <Route path="/mapping-validator" element={<MappingValidatorPage />} />
                <Route path="/converter" element={<ConverterPage />} />
                <Route path="/test" element={<TypingTestPage />} />
                <Route path="/exam" element={<ExamPage />} />
                <Route path="/review" element={<ReviewPage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/certificates" element={<CertificatesPage />} />
                <Route path="/backup" element={<BackupPage />} />
                <Route path="/profiles" element={<ProfileSelectPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
            <AppEnhancements />
          </BrowserRouter>
        </ProfileRestorer>
      </ProfileProvider>
    </ThemeProvider>
  );
}
