import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/database";
import { getKeyboardLayout, getKeyboardRows } from "../keyboards";
import { mergeKeyboardOverrides } from "../keyboards/mergeOverrides";
import type { KeyboardLayoutId, KeyboardLayoutOverride } from "../types";
export function useKeyboardLayout(id: KeyboardLayoutId) {
  const overrides = useLiveQuery(() => db.keyboardLayoutOverrides.where("layoutId").equals(id).toArray(), [id]);
  return useMemo(() => {
    const layout = mergeKeyboardOverrides(getKeyboardLayout(id), overrides ?? [] as KeyboardLayoutOverride[]);
    const byCode = new Map(layout.keys.map((k) => [k.code, k]));
    const rows = getKeyboardRows(id).map((row) => row.map((k) => byCode.get(k.code)!));
    return { layout, rows, ready: overrides !== undefined };
  }, [id, overrides]);
}
