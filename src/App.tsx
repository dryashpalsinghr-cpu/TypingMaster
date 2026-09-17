import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProfileProvider, useProfileContext, ACTIVE_PROFILE_STORAGE_KEY } from "./contexts/ProfileContext";
import { AppLayout } from "./components/AppLayout";
import { ProfileSelectPage } from "./pages/ProfileSelectPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LearnPage } from "./pages/LearnPage";
import { LessonPracticePage } from "./pages/LessonPracticePage";
import { TypingTestPage } from "./pages/TypingTestPage";
import { SettingsPage } from "./pages/SettingsPage";
import { KeyboardChartPage } from "./pages/KeyboardChartPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { getProfile } from "./services/profileService";

function ProfileRestorer({ children }: { children: React.ReactNode }) {
  const { setActiveProfile } = useProfileContext();
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const savedId = localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
    if (!savedId) {
      setRestored(true);
      return;
    }
    void getProfile(Number(savedId)).then((p) => {
      if (p) setActiveProfile(p);
      setRestored(true);
    });
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
                <Route path="/test" element={<TypingTestPage />} />
                <Route
                  path="/exam"
                  element={
                    <RoadmapPage
                      title="Government Exam Mode"
                      phase="Phase 5"
                      description="Editable SSC/RRB/CPCT exam templates with focus-loss warnings and KDPH targets."
                    />
                  }
                />
                <Route
                  path="/review"
                  element={
                    <RoadmapPage
                      title="Personalized Review"
                      phase="Phase 6"
                      description="Weak-key, slow-key, and difficult-bigram practice generated from your real attempt history."
                    />
                  }
                />
                <Route
                  path="/games"
                  element={
                    <RoadmapPage
                      title="Typing Games"
                      phase="Phase 7"
                      description="Letter Bubbles, Word Runner, and Key Defender - original games, no assets copied from any commercial product."
                    />
                  }
                />
                <Route
                  path="/statistics"
                  element={
                    <RoadmapPage
                      title="Statistics"
                      phase="Phase 6"
                      description="Full keyboard heatmap, finger performance, and bigram analysis charts."
                    />
                  }
                />
                <Route
                  path="/certificates"
                  element={
                    <RoadmapPage
                      title="Certificates"
                      phase="Phase 5"
                      description="Printable practice-performance certificates generated from real test results."
                    />
                  }
                />
                <Route
                  path="/profiles"
                  element={<ProfileSelectPage />}
                />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ProfileRestorer>
      </ProfileProvider>
    </ThemeProvider>
  );
}
