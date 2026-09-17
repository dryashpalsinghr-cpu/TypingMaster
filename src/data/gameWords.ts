// Original short word pools authored for TypeGuru Pro. Not copied from any product.
export const EN_WORDS: string[] = [
  "time", "work", "home", "hand", "word", "fast", "slow", "jump", "code", "type",
  "line", "page", "key", "desk", "blue", "green", "river", "stone", "cloud", "light",
  "quick", "brave", "north", "south", "plant", "sugar", "table", "chair", "paper", "music",
  "level", "focus", "speed", "train", "bridge", "garden", "rocket", "planet", "school", "friend",
  "orange", "silver", "golden", "winter", "summer", "spring", "season", "letter", "number", "finger",
];
export const HI_WORDS: string[] = [
  "घर", "जल", "फल", "कमल", "नदी", "पवन", "समय", "पुस्तक", "विजय", "प्रकाश",
  "सूरज", "चंद्रमा", "नमस्ते", "विद्यालय", "परिवार", "भारत", "संगीत", "प्रगति", "सफलता", "जीवन",
];
export const LETTERS: string[] = "abcdefghijklmnopqrstuvwxyz".split("");
export function randomLetter(): string { return LETTERS[Math.floor(Math.random() * LETTERS.length)]; }
export function randomWord(hindi: boolean): string {
  const pool = hindi ? HI_WORDS : EN_WORDS;
  return pool[Math.floor(Math.random() * pool.length)];
}
