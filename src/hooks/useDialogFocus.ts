import { useEffect, type RefObject } from "react";
export function useDialogFocus(ref: RefObject<HTMLElement | null>, open: boolean) {
  useEffect(() => {
    if (!open || !ref.current) return;
    const previous = document.activeElement as HTMLElement | null;
    const box = ref.current;
    const controls = () => Array.from(box.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'));
    (controls()[0] ?? box).focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = controls();
      if (!elements.length) { event.preventDefault(); box.focus(); return; }
      const first = elements[0], last = elements[elements.length - 1];
      if (!box.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { document.removeEventListener("keydown", trap); if (previous?.isConnected) previous.focus(); };
  }, [ref, open]);
}
