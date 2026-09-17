export type GameId = "letter-bubbles" | "word-runner" | "key-defender";
export interface GameScore {
  id?: number;
  profileId: number;
  game: GameId;
  score: number;
  accuracy: number;
  at: number;
}
export interface GameProps {
  profileId: number;
  layoutId: string;
  onExit: () => void;
}
