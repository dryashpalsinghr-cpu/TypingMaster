import { useCallback, useEffect, useRef, useState } from "react";
import { TypingEngine, calculateMetrics, type EngineConfig, type EngineSnapshot } from "../engine/typingEngine";

export function useTypingEngine(expectedText: string, config: EngineConfig) {
  const engineRef = useRef<TypingEngine | null>(null);
  const clockPausedRef = useRef(false);
  if (engineRef.current === null) engineRef.current = new TypingEngine(expectedText, config);
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(() => engineRef.current!.getSnapshot());
  useEffect(() => {
    clockPausedRef.current = false;
    engineRef.current = new TypingEngine(expectedText, config);
    setSnapshot(engineRef.current.getSnapshot());
  }, [expectedText, config.strictMode, config.backspaceAllowed]);
  // Include idle time, but freeze the clock once the session ends.
  useEffect(() => {
    const id = window.setInterval(() => {
      const engine = engineRef.current!;
      const current = engine.getSnapshot();
      if (!clockPausedRef.current && current.startedAt !== null && !current.completed) setSnapshot(engine.tick());
    }, 250);
    return () => window.clearInterval(id);
  }, []);
  const typeCharacter = useCallback((char: string) => { setSnapshot(engineRef.current!.typeCharacter(char)); }, []);
  const backspace = useCallback(() => { setSnapshot(engineRef.current!.backspace()); }, []);
  const restart = useCallback(() => {
    clockPausedRef.current = false;
    engineRef.current!.reset(expectedText);
    setSnapshot(engineRef.current!.getSnapshot());
  }, [expectedText]);
  const loadText = useCallback((text: string) => {
    clockPausedRef.current = false;
    engineRef.current!.reset(text);
    setSnapshot(engineRef.current!.getSnapshot());
  }, []);
  const pauseClock = useCallback(() => {
    if (clockPausedRef.current) return;
    clockPausedRef.current = true;
    setSnapshot(engineRef.current!.tick());
  }, []);
  const metrics = calculateMetrics(snapshot, { includeKdph: true });
  return { snapshot, typeCharacter, backspace, restart, loadText, pauseClock, metrics };
}
