import { useEffect, useState } from "react";
import { hasKrutiFont } from "../services/legacyFont";
export function useKrutiFont(enabled: boolean): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void hasKrutiFont().then((ready) => { if (!cancelled) setAvailable(ready); });
    return () => { cancelled = true; };
  }, [enabled]);
  return enabled ? available : true;
}
