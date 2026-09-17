import { useThemeContext } from "../contexts/ThemeContext";
import { strings, type StringKey } from "../i18n/strings";

export function useT() {
  const { interfaceLanguage } = useThemeContext();
  return (key: StringKey): string => strings[interfaceLanguage][key] ?? strings.en[key];
}
