import type { Course, Lesson, LessonExercise, TypingLanguage, KeyboardLayoutId } from "../../types";
import { englishBeginnerCourse, englishBeginnerLessons } from "./englishBeginner";
import { hindiBeginnerCourse, hindiBeginnerLessons } from "./hindiInscriptBeginner";
import { krutiDevBeginnerCourse, krutiDevBeginnerLessons } from "./krutiDevBeginner";
import { remingtonGailBeginnerCourse, remingtonGailBeginnerLessons } from "./remingtonGailBeginner";
export const allCourses: Course[] = [englishBeginnerCourse, hindiBeginnerCourse, krutiDevBeginnerCourse, remingtonGailBeginnerCourse];
export const allLessons: Lesson[] = [...englishBeginnerLessons, ...hindiBeginnerLessons, ...krutiDevBeginnerLessons, ...remingtonGailBeginnerLessons];
export function getLessonsForLanguage(language: TypingLanguage): Lesson[] { return allLessons.filter((l) => l.language === language).sort((a, b) => a.order - b.order); }
export function getLessonsForLayout(layout: KeyboardLayoutId): Lesson[] { return allLessons.filter((l) => l.layout === layout).sort((a, b) => a.order - b.order); }
export function hasLessonsForLayout(layout: KeyboardLayoutId): boolean { return getLessonsForLayout(layout).length > 0; }
export function getCourseForLanguage(language: TypingLanguage): Course | undefined { return allCourses.find((c) => c.language === language); }
export function getLessonById(id: string | undefined): Lesson | undefined { return allLessons.find((l) => l.id === id); }
export function getLessonExercises(lesson: Lesson): LessonExercise[] {
  if (lesson.exercises && lesson.exercises.length > 0) return lesson.exercises;
  return [{ type: lesson.exerciseType, text: lesson.practiceText }];
}
export function getContinueLesson(language: TypingLanguage, lastLessonId: string | undefined): Lesson {
  const lessons = language === "hi" ? getLessonsForLayout("kruti-dev-010") : getLessonsForLayout("en-qwerty");
  const found = lastLessonId ? lessons.find((l) => l.id === lastLessonId) : undefined;
  return found ?? lessons[0];
}
export { englishBeginnerCourse, englishBeginnerLessons, hindiBeginnerCourse, hindiBeginnerLessons, krutiDevBeginnerCourse, krutiDevBeginnerLessons, remingtonGailBeginnerCourse, remingtonGailBeginnerLessons };
