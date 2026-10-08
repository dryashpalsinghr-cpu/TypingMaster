import assert from "node:assert/strict";
import { TypingEngine, calculateMetrics } from "../src/engine/typingEngine.ts";
Object.assign(globalThis, { window: globalThis });
let passed = 0;
function check(name: string, fn: () => void) { fn(); passed++; console.log(`PASS ${name}`); }
const engine = (text: string, strictMode = false, backspaceAllowed = true) => new TypingEngine(text, { strictMode, backspaceAllowed });
check("corrected English mistake remains in accuracy and history", () => {
  const e = engine("ab");
  e.typeCharacter("x", 0); e.backspace(100); e.typeCharacter("a", 200); e.typeCharacter("b", 60000);
  const s = e.getSnapshot();
  assert.equal(s.completed, true); assert.equal(s.uncorrectedErrors, 0);
  assert.equal(s.correctedErrors, 1); assert.equal(s.incorrectKeystrokes, 1);
  assert.equal(s.characters[0].status, "corrected"); assert.equal(calculateMetrics(s).accuracy, 66.67);
});
check("backspace reopens completed text", () => {
  const e = engine("a"); e.typeCharacter("a", 0); e.backspace(100);
  assert.equal(e.getSnapshot().completed, false);
  e.typeCharacter("a", 200); assert.equal(e.getSnapshot().completed, true); assert.equal(e.getSnapshot().totalKeystrokes, 2);
});
check("idle time is included without an extra key", () => {
  const e = engine("ab"); e.typeCharacter("a", 0); const s = e.tick(60000);
  assert.equal(s.elapsedMs, 60000); assert.equal(calculateMetrics(s).grossWpm, 0.2);
});
check("completed elapsed time stays frozen", () => {
  const e = engine("ab"); e.typeCharacter("a", 0); e.typeCharacter("b", 1000); assert.equal(e.tick(60000).elapsedMs, 1000);
});
check("Hindi cluster error state clears exactly once", () => {
  const e = engine("कि", true); e.typeCharacter("क", 0); e.typeCharacter("x", 10); e.backspace(20);
  assert.equal(e.getSnapshot().characters[0].status, "pending"); assert.equal(e.getSnapshot().uncorrectedErrors, 0);
  assert.equal(e.getSnapshot().correctedErrors, 1); e.typeCharacter("ि", 30);
  assert.equal(e.getSnapshot().completed, true); assert.equal(e.getSnapshot().characters[0].status, "corrected");
});
check("every wrong physical input is counted in strict mode", () => {
  const e = engine("a", true); e.typeCharacter("x", 0); e.typeCharacter("y", 10);
  assert.equal(e.getSnapshot().incorrectKeystrokes, 2); assert.equal(calculateMetrics(e.getSnapshot()).accuracy, 0);
  e.backspace(20); assert.equal(e.getSnapshot().uncorrectedErrors, 1); e.backspace(30); assert.equal(e.getSnapshot().uncorrectedErrors, 0);
  e.typeCharacter("a", 40); assert.equal(e.getSnapshot().completed, true); assert.equal(calculateMetrics(e.getSnapshot()).accuracy, 33.33);
});
check("Unicode backspace never leaves half a surrogate pair", () => {
  const e = engine("a", true); e.typeCharacter("😀", 0); e.backspace(10); assert.equal(e.getSnapshot().characters[0].typedBuffer, "");
});
check("disabled backspace is a no-op", () => {
  const e = engine("a", false, false); e.typeCharacter("a", 0); e.backspace(10);
  assert.equal(e.getSnapshot().completed, true); assert.equal(e.getSnapshot().backspaces, 0);
});
check("reset clears historical counters", () => {
  const e = engine("a"); e.typeCharacter("x", 0); e.reset("ab"); const s = e.getSnapshot();
  assert.equal(s.incorrectKeystrokes, 0); assert.equal(s.totalKeystrokes, 0); assert.equal(s.completed, false); assert.equal(s.startedAt, null);
});
check("corrected history survives re-editing a corrected cell", () => {
  const e = engine("ab"); e.typeCharacter("x", 0); e.backspace(10); e.typeCharacter("a", 20); e.backspace(30);
  assert.equal(e.getSnapshot().correctedErrors, 1); e.typeCharacter("a", 40); e.typeCharacter("b", 50); assert.equal(e.getSnapshot().correctedErrors, 1);
});
console.log(`${passed} typing engine regression checks passed.`);
