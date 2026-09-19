// Run:  node --experimental-strip-types scripts/krutidev-selftest.ts
import { unicodeToKrutiDev as u2k, krutiDevToUnicode as k2u, untypableChars } from "../src/converter/krutiDevCore.ts";

// Well-known Kruti Dev spellings (what you actually type) -> Unicode.
const KNOWN: [string, string][] = [
  ["Hkkjr", "भारत"], ["jktLFkku", "राजस्थान"], ["f'k{kk", "शिक्षा"], ["iz/kkuea=h", "प्रधानमंत्री"],
  ["xf.kr", "गणित"], ["ewfrZ", "मूर्ति"], ["dk;kZy;", "कार्यालय"], ["/keZ", "धर्म"], ["fgUnh", "हिन्दी"],
  ["fganh", "हिंदी"], ["L=h", "स्त्री"], ["fo|k", "विद्या"], ["gsyks oYMZ", "हेलो वर्ल्ड"], ["eqf'dy", "मुश्किल"],
  ["{kek", "क्षमा"], ["Kku", "ज्ञान"], ["f=dks.k", "त्रिकोण"], ["jk\"Vz", "राष्ट्र"], ["iw.kZ", "पूर्ण"],
  ["vFkZ", "अर्थ"], ["iq=", "पुत्र"], ["xzke", "ग्राम"], ["izse", "प्रेम"], ["d`ik", "कृपा"], ["djsa", "करें"],
  ["esa", "में"], ["gS", "है"], ["vkSj", "और"], ["vkt", "आज"], [",d", "एक"], ["dSls", "कैसे"], ["#i;k", "रुपया"],
  ["VekVj", "टमाटर"], ["cPpk", "बच्चा"], ["iDdk", "पक्का"], ["fnYyh", "दिल्ली"], ["Ldwy", "स्कूल"],
  ["t:j", "जरूर"], ["Hkkjr ,d ns'k gSA", "भारत एक देश है।"], ["ge lc Hkkjr ds yksx gSaA", "हम सब भारत के लोग हैं।"],
  ["t+:j", "ज़रूर"], ["ifo=", "पवित्र"], ["Jfed", "श्रमिक"], ["deZ", "कर्म"], ["lnhZ", "सर्दी"], ["izdkj", "प्रकार"],
];
let bad = 0;
for (const [k, u] of KNOWN) {
  const a = u2k(u), b = k2u(k);
  const okA = a === k, okB = b === u.normalize("NFC");
  if (!okA || !okB) { bad++; console.log(`FAIL  ${u}  uni->kruti=${a} (want ${k})  kruti->uni=${b} (want ${u})`); }
}
console.log(`known pairs: ${KNOWN.length - bad}/${KNOWN.length} ok`);

// Untypable characters check
console.log("untypable in 'भारत एक देश है।':", untypableChars(u2k("भारत एक देश है।")));
process.exit(bad ? 1 : 0);
