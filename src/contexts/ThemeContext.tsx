import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { InterfaceLanguage } from "../types";
import { readPreference, writePreference } from "../services/storage";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
  interfaceLanguage: InterfaceLanguage;
  setInterfaceLanguage: (lang: InterfaceLanguage) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => readPreference("tg-theme") === "dark" ? "dark" : "light"
  );
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>(
    () => readPreference("tg-lang") === "hi" ? "hi" : "en"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    writePreference("tg-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", interfaceLanguage);
    writePreference("tg-lang", interfaceLanguage);
  }, [interfaceLanguage]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, interfaceLanguage, setInterfaceLanguage }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
