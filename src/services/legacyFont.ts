/** FontFaceSet.check can succeed for a fallback. Require an actually loaded face. */
export async function hasKrutiFont(): Promise<boolean> {
  if (!document.fonts?.load) return false;
  try {
    const faces = await document.fonts.load('20px "KrutiDev010Local"', 'Hkkjr');
    return faces.length > 0 && faces.some((face) => face.status === "loaded");
  } catch { return false; }
}
