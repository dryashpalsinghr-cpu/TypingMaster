import { db, DEFAULT_SETTINGS } from "../db/database";
import type { Profile } from "../types";
import { analyticsDb } from "../db/analyticsDb";
import { examDb } from "../db/examDb";
import { gamesDb } from "../db/gamesDb";

const AVATAR_COLORS = [
  "#2657f5",
  "#f97316",
  "#22c55e",
  "#ec4899",
  "#8b5cf6",
  "#0ea5e9",
  "#eab308",
];

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export async function createProfile(
  input: Pick<
    Profile,
    | "displayName"
    | "preferredInterfaceLanguage"
    | "preferredTypingLanguage"
    | "preferredLayout"
    | "skillLevel"
    | "dailyGoalMinutes"
  >
): Promise<Profile> {
  const now = new Date().toISOString();
  const profile: Profile = {
    ...input,
    avatarColor: randomAvatarColor(),
    createdAt: now,
    lastActiveAt: now,
  };
  const id = await db.profiles.add(profile);
  await db.settings.add({ profileId: id as number, ...DEFAULT_SETTINGS });
  return { ...profile, id: id as number };
}

export async function listProfiles(): Promise<Profile[]> {
  return db.profiles.toArray();
}

export async function getProfile(id: number): Promise<Profile | undefined> {
  return db.profiles.get(id);
}

export async function updateProfile(
  id: number,
  changes: Partial<Profile>
): Promise<void> {
  await db.profiles.update(id, changes);
}

export async function touchProfileActivity(
  id: number,
  lastLessonId?: string
): Promise<void> {
  await db.profiles.update(id, {
    lastActiveAt: new Date().toISOString(),
    ...(lastLessonId ? { lastLessonId } : {}),
  });
}

export async function deleteProfile(id: number): Promise<void> {
  await db.transaction(
    "rw",
    [db.profiles, db.settings, db.attempts, db.certificates, db.dailyProgress],
    async () => {
      await db.profiles.delete(id);
      await db.settings.where("profileId").equals(id).delete();
      await db.attempts.where("profileId").equals(id).delete();
      await db.certificates.where("profileId").equals(id).delete();
      await db.dailyProgress.where("profileId").equals(id).delete();
    }
  );
  // Phase 5-7 data lives in separate databases; remove it too so deleting a
  // profile does not leave scores, analytics, exam results or certificates.
  await analyticsDb.transaction("rw", analyticsDb.keystrokes, analyticsDb.reviewSessions, async () => {
    await analyticsDb.keystrokes.where("profileId").equals(id).delete();
    await analyticsDb.reviewSessions.where("profileId").equals(id).delete();
  });
  await examDb.transaction("rw", examDb.examResults, examDb.certificates, async () => {
    await examDb.examResults.where("profileId").equals(id).delete();
    await examDb.certificates.where("profileId").equals(id).delete();
  });
  await gamesDb.highScores.where("profileId").equals(id).delete();
}

export async function ensureDemoProfile(): Promise<Profile> {
  const existing = await db.profiles.filter((p) => !!p.isDemo).first();
  if (existing) return existing;

  const now = new Date().toISOString();
  const demo: Profile = {
    displayName: "Demo",
    avatarColor: "#94a3b8",
    preferredInterfaceLanguage: "en",
    preferredTypingLanguage: "en",
    preferredLayout: "en-qwerty",
    skillLevel: "intermediate",
    dailyGoalMinutes: 15,
    createdAt: now,
    lastActiveAt: now,
    isDemo: true,
  };
  const id = await db.profiles.add(demo);
  await db.settings.add({ profileId: id as number, ...DEFAULT_SETTINGS });
  return { ...demo, id: id as number };
}
