import Dexie, { type Table } from "dexie";
import type { GameScore } from "../types/games";
// Phase 7 uses its OWN IndexedDB database so all earlier schemas stay untouched.
export class GamesDB extends Dexie {
  highScores!: Table<GameScore, number>;
  constructor() {
    super("typeguru-games-db");
    this.version(1).stores({
      highScores: "++id, profileId, game, score, at",
    });
  }
}
export const gamesDb = new GamesDB();
