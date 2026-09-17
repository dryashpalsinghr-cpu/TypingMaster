import type { Course, Lesson, TypingLanguage } from "../../types";
import { englishBeginnerCourse, englishBeginnerLessons } from "./englishBeginner";
import { hindiBeginnerCourse, hindiBeginnerLessons } from "./hindiInscriptBeginner";

export const allCourses: Course[] = [englishBeginnerCourse, hindiBeginnerCourse];
export const allLessons: Lesson[] = [...englishBeginnerLessons, ...hindiBeginnerLessons];

export function getLessonsForLanguage(language: TypingLanguage): Lesson[] {
  return allLessons.filter((l) => l.language === language).sort((a, b) => a.order - b.order);
}

export function getCourseForLanguage(language: TypingLanguage): Course | undefined {
  return allCourses.find((c) => c.language === language);
}

export function getLessonById(id: string | undefined): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

/** All exercises within a lesson: the top-level one first, then any extras. */
export function getLessonExercises(lesson: Lesson): { type: Lesson["exerciseType"]; text: string; label?: string; labelHi?: string }[] {
  return [
    { type: lesson.exerciseType, text: lesson.practiceText, label: "Main drill", labelHi: "मुख्य अभ्यास" },
    ...(lesson.exercises ?? []),
  ];
}

/** Mirrors the original Phase 2 dashboard behaviour: "continue" reopens
 * whichever lesson the profile last touched in this language, or lesson 1
 * if none yet / the stored id belongs to the other language. */
export function getContinueLesson(language: TypingLanguage, lastLessonId: string | undefined): Lesson {
  const lessons = getLessonsForLanguage(language);
  const found = lastLessonId ? lessons.find((l) => l.id === lastLessonId) : undefined;
  return found ?? lessons[0];
}

export { englishBeginnerCourse, englishBeginnerLessons, hindiBeginnerCourse, hindiBeginnerLessons };
