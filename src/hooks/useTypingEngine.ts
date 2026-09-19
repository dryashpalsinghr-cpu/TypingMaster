import { useCallback, useEffect, useRef, useState } from "react";
import { TypingEngine, calculateMetrics, type EngineConfig, type EngineSnapshot } from "../engine/typingEngine";

export function useTypingEngine(expectedText: string, config: EngineConfig) {
  const engineRef = useRef<TypingEngine>(new TypingEngine(expectedText, config));
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(engineRef.current.getSnapshot());

  useEffect(() => {
    engineRef.current = new TypingEngine(expectedText, config);
    setSnapshot(engineRef.current.getSnapshot());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedText]);

  const typeCharacter = useCallback((char: string) => {
    setSnapshot(engineRef.current.typeCharacter(char));
  }, []);

  const backspace = useCallback(() => {
    setSnapshot(engineRef.current.backspace());
  }, []);

  const restart = useCallback(() => {
    engineRef.current.reset(expectedText);
    setSnapshot(engineRef.current.getSnapshot());
  }, [expectedText]);

  // Load a (possibly identical) text into the engine right now, in the same
  // React batch as the caller's other state updates. Used by the timed lesson
  // page to roll straight into the next exercise round without a stale
  // "completed" frame - and it also works when the next text is the same as
  // the current one (single-exercise lessons), where the effect above would
  // not fire.
  const loadText = useCallback((text: string) => {
    engineRef.current.reset(text);
    setSnapshot(engineRef.current.getSnapshot());
  }, []);

  const metrics = calculateMetrics(snapshot, { includeKdph: true });

  return { snapshot, typeCharacter, backspace, restart, loadText, metrics };
}
