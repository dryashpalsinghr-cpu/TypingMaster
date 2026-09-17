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

  const metrics = calculateMetrics(snapshot, { includeKdph: true });

  return { snapshot, typeCharacter, backspace, restart, metrics };
}
