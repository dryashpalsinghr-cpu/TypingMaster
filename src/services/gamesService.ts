import { gamesDb } from "../db/gamesDb";
import type { GameScore, GameId } from "../types/games";
export { recordKeystrokes } from "./analyticsService";
export async function saveScore(s: GameScore): Promise<number> {
  const { id: _id, ...rest } = s;
  void _id;
  return await gamesDb.highScores.add(rest as GameScore);
}
export async function getHighScores(profileId: number, game: GameId): Promise<GameScore[]> {
  const all = await gamesDb.highScores.where("profileId").equals(profileId).toArray();
  return all.filter((s) => s.game === game).sort((a, b) => b.score - a.score).slice(0, 5);
}
export async function getBest(profileId: number, game: GameId): Promise<number> {
  const top = await getHighScores(profileId, game);
  return top[0]?.score ?? 0;
}
