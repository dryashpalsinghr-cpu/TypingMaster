import Dexie, { type Table } from "dexie";
import type { KeystrokeRecord, ReviewSession } from "../types/analytics";
// Phase 6 uses its OWN IndexedDB database so the main schema is untouched.
export class AnalyticsDB extends Dexie {
  keystrokes!: Table<KeystrokeRecord, number>;
  reviewSessions!: Table<ReviewSession, number>;
  constructor() {
    super("typeguru-analytics-db");
    this.version(1).stores({
      keystrokes: "++id, profileId, at, expected",
      reviewSessions: "++id, profileId, at",
    });
  }
}
export const analyticsDb = new AnalyticsDB();
