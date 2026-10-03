import type { Course, Lesson, LessonExercise } from "../../types";

// English touch-typing course (QWERTY) - 12 lessons.
//
// Order of keys: home row -> E I -> R U -> T O -> Shift + full stop -> C , ->
// G H ' -> V N ? -> W M -> Q P -> B Y -> Z X !
//
// The lesson timer in the app is 5 minutes, so every lesson carries far more
// UNIQUE text than a fast typist can finish in 5 minutes - words never repeat
// inside a lesson until its whole word list has been used. Every lesson has 7 tasks:
//   1 key drill (new keys)         2 key drill (new + earlier keys)
//   3 word drill (new words)       4 word drill again
//   5 revision words (earlier lessons)
//   6 sentences (hand-written + extra practice sentences)
//   7 paragraph of exactly 300 words
// Lessons 1-4 also use "practice words" (letter combinations like ask, dak, lisk)
// because very few real English words exist with only 4-8 letters known.
//
// All practice text below is written fresh for this project - no text is
// copied from any commercial typing-tutor product. Each lesson only uses
// keys taught up to that lesson (capitals from lesson 5, punctuation as taught).

export const englishBeginnerCourse: Course = {
  id: "en-beginner",
  language: "en",
  title: "Beginner Touch Typing",
  titleHi: "बेसिक टच टाइपिंग",
  order: 1,
};

interface Spec {
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  /** Keys introduced in this lesson (what the hand guide / keyboard highlights). */
  newKeys: string[];
  /** Optional hand-made key-drill tokens (space separated). */
  k1?: string;
  k2?: string;
  /** Words that become typable in THIS lesson (earlier words are re-used automatically). */
  words: string;
  sentences: string[];
  /** Real 300-word paragraph (last two lessons). Other lessons build one from their sentences. */
  paragraph?: string;
  seconds: number;
  wpm: number;
  acc: number;
}

function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a; }

/** Deterministic shuffle (no Math.random) - same order every time. */
function shuffle<T>(items: T[], salt = 0): T[] {
  const n = items.length;
  if (n < 3) return [...items];
  let s = Math.max(1, Math.floor(n / 3) + salt);
  while (gcd(s, n) !== 1) s++;
  return items.map((_, i) => items[(i * s + salt) % n]);
}

/** Walk a token list without repeating, wrapping only when the whole list is used up. */
class Feed {
  private pos = 0;
  constructor(private tokens: string[]) {}
  /** Take tokens until the text is about `chars` long. */
  chars(chars: number): string {
    const out: string[] = [];
    let n = 0;
    while (n < chars && this.tokens.length) {
      const w = this.tokens[this.pos++ % this.tokens.length];
      out.push(w);
      n += w.length + 1;
    }
    return out.join(" ");
  }
  /** Take exactly `count` tokens (as an array). */
  take(count: number): string[] {
    const out: string[] = [];
    for (let i = 0; i < count && this.tokens.length; i++) out.push(this.tokens[this.pos++ % this.tokens.length]);
    return out;
  }
}

const split = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
const isLetter = (k: string) => /^[a-z]$/.test(k);
const VOWELS = new Set(["a", "e", "i", "o", "u", "y"]);

/** Distinct key strings (length minLen..maxLen) over `alphabet` that contain at least one of `must`. */
function keyStrings(alphabet: string[], must: string[], minLen: number, maxLen: number, cap = 1600): string[] {
  const out: string[] = [];
  const build = (prefix: string, len: number) => {
    if (out.length > cap * 4) return;
    if (/(.)\1\1/.test(prefix)) return; // no "eee" runs
    if (len >= minLen && must.some((m) => prefix.includes(m))) out.push(prefix);
    if (len === maxLen) return;
    for (const a of alphabet) build(prefix + a, len + 1);
  };
  build("", 0);
  return shuffle(out, 3).slice(0, cap);
}

/** Pick up to `n` keys spread evenly over a list. */
function spread(keys: string[], n: number): string[] {
  if (keys.length <= n) return keys;
  return Array.from({ length: n }, (_, i) => keys[Math.floor((i * keys.length) / n)]);
}

/** Practice words (consonant/vowel patterns) that use at least one of the lesson's new letters. */
function pseudoWords(letters: string[], newLetters: string[], cap = 450): string[] {
  const V = letters.filter((l) => VOWELS.has(l));
  const C = letters.filter((l) => !VOWELS.has(l));
  if (!V.length || !C.length) return [];
  const patterns = ["CVC", "CVCV", "VCV", "CVCC", "CVCVC", "CCVC"];
  const out = new Set<string>();
  const expand = (pat: string, idx: number, acc: string) => {
    if (out.size > cap * 6) return;
    if (idx === pat.length) { out.add(acc); return; }
    for (const ch of pat[idx] === "C" ? C : V) expand(pat, idx + 1, acc + ch);
  };
  for (const pat of patterns) expand(pat, 0, "");
  const ok = Array.from(out).filter((w) => newLetters.some((l) => w.includes(l)));
  return shuffle(ok, 7).slice(0, cap);
}

const SPECS: Spec[] = [
  {
    title: "The Home Row",
    titleHi: "होम रो",
    description: "Rest your fingers on A S D F and J K L ; and learn the basic typing posture.",
    descriptionHi: "कीबोर्ड की बीच वाली लाइन (A S D F और J K L ;) पर उंगलियां रखना और बेसिक टाइपिंग।",
    newKeys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    k1: "ff jj fj jf fjf jfj dd kk dk kd dkd kdk ss ll sl ls sls lsl aa ;; a; ;a a;a ;a;",
    k2: "fd jk fs jl fa j; asdf jkl; fdsa ;lkj adsf jlka dfs kjl sad lak ads fas jla ksd lkj",
    words: "a as ask asks all add adds alas dad dads fad fads fall falls flask flasks lad lads lass sad salad salads salsa sass alfalfa",
    sentences: ["a lad asks dad", "dad adds all salads", "a sad lass falls", "all lads ask dad", "a lass adds a salad as dad falls", "sad lads add all salads", "a flask falls as a lad asks", "dad asks a lass", "all lads fall as dad asks", "a sad dad adds a salad"],
    seconds: 300, wpm: 5, acc: 85,
  },
  {
    title: "Keys E and I",
    titleHi: "E और I keys",
    description: "Reach up with the index finger for E and the middle finger for I.",
    descriptionHi: "पहली उंगली (Index) और बीच वाली उंगली (Middle) से ऊपर की लाइन की E और I keys का अभ्यास।",
    newKeys: ["e", "i"],
    words: "see sea seal seals sell sells self sale sales side sides slide slides life lies lied file files fail fails field fields feel feels fell feed feeds deed deeds idea ideas ideal said safe sake sakes lake lakes leak leaks lead leads leaf lease kid kids elk elks desk desks disk disks dies skill skills skid skies slid silk sill silks jade jail fill fills fiddle fiddles saddle idle ill ail ails aid aids ale ales eel eels else led lid lids lie sled sleds sleek fled flies flee flees deal deals dale dales deaf dead sail sails fake fakes kiss",
    sentences: ["a kid feels safe", "see a lake as a kid sees a field", "dad sells silk files", "a lass is sad as a kid falls", "a lad feels ill as dad sells silks", "a kid slides a disk aside", "all ideas feel ideal", "a lad said a deed is safe", "elks feed as kids see a lake", "a kid feeds a sad elk"],
    seconds: 300, wpm: 6, acc: 85,
  },
  {
    title: "Keys R and U",
    titleHi: "R और U keys",
    description: "Practise R with the index finger and U with the index finger of the right hand.",
    descriptionHi: "R और U keys की प्रैक्टिस।",
    newKeys: ["r", "u"],
    words: "sure rule rules ruler user users fur furs rural dark lark lurk lurks surf slur slurs red rider riders ride rides rise rises fire fires fuse fused rude ruse sulk sulks skull skulls usual use used uses lure lured raid raids rail rails rake rakes rare real ruled sir sirs far fear fears fare fared fairs fair flair flier fliers jar jars rid sue sued sues dull dulls duel duels dual fuel fuels full fulfill lair",
    sentences: ["a rude kid ruled all", "dad sure uses a ruler", "a user fails as a rule", "fire rises as dark lurks", "a lark sails fair as dark rises", "dad said real furs are rare", "a lad rides as a fair rider", "dull skulls fall as dad rails", "a rider feels fear as fire rises", "sure red furs fuel a rural sale"],
    seconds: 300, wpm: 7, acc: 86,
  },
  {
    title: "Keys T and O",
    titleHi: "T और O keys",
    description: "Practise T with the index finger and O with the ring finger.",
    descriptionHi: "T और O keys का इस्तेमाल।",
    newKeys: ["t", "o"],
    words: "tie ties tied toe toes told toll tolls tool tools took tote totes toad toads toast toasts total totals tour tours trust trusts start starts state stated steel stool stools stories store stores stir stirs stout street streets strike strikes strode strolls riot riots root roots rot rots rod rods rode role roles roost rooted soul souls sort sorts sour toil toils tail tails tale tales talk talks task tasks test tests tilt tilts tired tires title titles trial trials trail trails jolt jolts joke jokes fort forts forest forests folk folks food foods foot fool fools floor floors flood floods flour door doors dour odor odors old older oldest order orders outside out our oar oars ours eat eats radio rest rests tries tried",
    sentences: ["dad tells a tale at a door", "a tired kid sits at a door", "a toad sits at a stool", "tools fall off a floor", "dad took a tour of a forest", "a toast is a treat for a sad kid", "stars rise as a rooster sits", "i told dad a joke as a tired old rooster sat", "a total of tasks sits at a stool", "a tired old rooster rode a tour"],
    seconds: 300, wpm: 8, acc: 87,
  },
  {
    title: "Capital Letters and Full Stop",
    titleHi: "कैपिटल लेटर्स और फुल स्टॉप",
    description: "Use the opposite Shift key for capital letters and finish sentences with a full stop (.).",
    descriptionHi: "दोनों तरफ की Shift key का इस्तेमाल करके बड़े अक्षर (Capital letters) और फुल स्टॉप (.) टाइप करना।",
    newKeys: ["Shift", "."],
    k1: "Ja Kd Ls Of Ik Uj Fj Dk Sl Ek Rj Tu Ad Sk Fl Dj Ti Ro Ok Ul",
    k2: "Sa. Lo. Ed. Ku. Ti. Ro. Ja. Fi. Dr. Ko. Ut. Ol. Ida. Rot. Ito. Kol.",
    words: "Dad Sue Kate Ted Lisa Otis Julia Kari Tori Ella Rita Otto Lois Eliot Joel Ida Uri Rudi Ike Ross Jed Toti Luis Odis",
    sentences: ["Dad took a tour of a forest.", "Sue sells silk to Kate.", "Ted told Lisa a joke at Ford.", "Otis tosses a stout rod.", "Julia took toast to Dad.", "Kari fed a tired toad.", "Tori sat at a stool at Ford.", "Ella said Ted is a fair rider.", "Rita sells tools to Otto.", "Lois took Eliot to a ride."],
    seconds: 300, wpm: 9, acc: 88,
  },
  {
    title: "Keys C and Comma (,)",
    titleHi: "C key और कोमा (,)",
    description: "Use the middle finger for C and the comma key.",
    descriptionHi: "नीचे वाली लाइन की C key और कोमा (,) का अभ्यास।",
    newKeys: ["c", ","],
    words: "slick lack lacks cat cats car cars card cards care cared cares cart carts case cases cool cold cord cords core cores code codes coat coats cost costs coast coasts cut cuts cute clock clocks close closed cloud clouds clear coal coals collar collars color colors colt colts cities ice cider circus circle circles act acts actor actors across actress track tracks truck trucks luck deck decks kick kicks sick stick sticks stock stocks struck trick tricks fact facts face faces faced cast casts cooler duck ducks dock docks lock locks rock rocks sock socks suck sucks tuck tucks lick licks secret",
    sentences: ["Cara took a cold cake to Celia.", "Carl, Cora, Kate, Ted, Rita, Lois, Julia, Eliot, Otis.", "Cut a cake, feed a kid, sit, rest.", "Rice, tea, salt, oil, cake, cola, cider.", "A clock is stuck, a cat sits, a cloud rises.", "Dad took a cool cola, a cake, a coat.", "Eric, Cora, Cole, Carla, Celia took a cart.", "A cat, a duck, a rooster, a colt.", "Ciara cut a circle, a stick, a tile.", "Cold cider, cut cake, a cute cat, a clear cloud."],
    seconds: 300, wpm: 10, acc: 88,
  },
  {
    title: "Keys G, H and Apostrophe (')",
    titleHi: "G, H keys और अपॉस्ट्रोफी (')",
    description: "Practise G and H with the index fingers and the apostrophe with the little finger.",
    descriptionHi: "बीच वाली लाइन की G, H और ऊपर लगने वाले कोमा (') की प्रैक्टिस।",
    newKeys: ["g", "h", "'"],
    words: "dish flesh hurdle hurdles truth south cash catch each go goes good goal goals gold golf got gate gates gift gifts girl girls glad glass glasses glide grass great greet greets grid grill guest guests guide guides guard guards hat hats had has hair half hall halls hard harsh haste head heads heal heart hearts heat hello her here hide hides high hill hills hire hit hits hold holds hole holes hot hour hours house houses huge hurt hurts hut shed shell shelf sheet shirt shoe shoes short shout shouts shut shore fish thus this that the there these those thick thought three through thirst tough touch eight height right light lights fight fights sight sights tight flight eagle hugs ahead laugh laughs rough dough though thorough ghost ghosts rich rights rush",
    sentences: ["It's late, Gita, so take a coat.", "Hari's goat ate the grass at Gus's door.", "Rhea's tiger is huge, Hugh said.", "Heidi's ghost stories are great.", "Here's the road to Hugh's house.", "Jackie's cat is tired, so she sits.", "Eight girls took the stage, Lois said.", "Gus's guide fed the ducks.", "Thea, Rita, Heidi, Gail, Hugh, Celia.", "Here's a great gift, Hari said."],
    seconds: 300, wpm: 11, acc: 88,
  },
  {
    title: "Keys V, N and Question Mark (?)",
    titleHi: "V, N keys और प्रश्नवाचक चिह्न (?)",
    description: "Reach down for V and N, and use Shift for the question mark.",
    descriptionHi: "V, N और प्रश्नवाचक चिह्न (?) का अभ्यास।",
    newKeys: ["v", "n", "?"],
    words: "kind fortune action gone green grind ground have hand hands then thin things think night nights vase vast vest vote votes voice voices visit visits live lives love loves leave leaves level levels river rivers silver seven seventh drive drives driver give gives given value values verse virus vine vines vital video videos eleven even event events ever over oven novel never near nest nests net nets neat need needs nice nine noon north nose note notes nurse nuts nut nation nations ant ants and end ends one ones onion onions inside into island islands ink inch instead king kings line lines link links land lands lane lanes learn learns lend lends listen listens lunch lunches iron irons join joins noise noises nerve nerves sun sunset sand sands stand stands stone stones string strong tent tents tend tends trend trends turn turns train trains uncle under until unit united unless union rain rains raining ran rank ranks rent rents ring rings run runs sing sings sink sinks son sons soon sound sounds stun sent send sends sense",
    sentences: ["Is this the right road to the river?", "Is Vera on the north side?", "Is Neil in the garden?", "Did Nina take the green train?", "Is it true that Ivan has seven hens?", "Do the hens like to eat in the garden?", "Can Dan hear the thunder in the north?", "Does Eleanor live near the river?", "Is Nathan late, or is the train late?", "Is the vase on the shelf?"],
    seconds: 300, wpm: 12, acc: 89,
  },
  {
    title: "Keys W and M",
    titleHi: "W और M keys",
    description: "Practise W with the ring finger and M with the index finger.",
    descriptionHi: "W और M keys का इस्तेमाल।",
    newKeys: ["w", "m"],
    words: "grow growth him home show shows wish throw weight might name names narrow town towns what when where which while white who whole window windows wind winds winter wise wishes with without woman women wood woods word words work works world worse worth would wonder write writes wrote walk walks wall walls want wants warm was wash watch water waves we week weeks well went were west wet wheel wild will win wins wing wings man march mark marks market markets master match meal meals mean means meat meet meets melt men mind mine mile miles milk mill minute minutes mirror miss mist model moment moments month months moon more morning most mother mouse mouth move moves much music must sum some same swim swims mom moms mum mall make makes made main",
    sentences: ["What time is the train, Mom?", "We went to the market with Mom.", "Where is the water, Mother?", "Which woman wore the white coat?", "Welcome home, Wendell.", "Mother made a warm meal.", "Will the winter wind move the leaves?", "Who will walk to the market with me?", "Mike wants a new watch, doesn't he?", "We'll meet near the water tomorrow."],
    seconds: 300, wpm: 13, acc: 89,
  },
  {
    title: "Keys Q and P",
    titleHi: "Q और P keys",
    description: "Stretch to the outer keys: Q with the little finger on the left, P on the right.",
    descriptionHi: "कीबोर्ड के सबसे बाहरी अक्षरों (Q और P) की प्रैक्टिस।",
    newKeys: ["q", "p"],
    words: "pick groups group help helps ship ships nap map maps quit quite quiet quick queen question questions quest quote quotes squad square squid equal equals request requests require liquid sequel inquire quarter quarters pass past pat path paths page pages paint pain pair paper parent parents park parks part parts pen pencil people per perfect period picks piece pieces pile pine pink pipe pipes pit pitch place places plain plan plane planes plant plants plate please plot plug plus poem poems point points pole police pond pool poor pop port post pot pound power prefer present press price pride print proper proud pull pulls pump pup pure purple push put puts pie pies pea peas peach peak peaks pear pearl skip skips spin spins spoke spot spots sport sports spring step steps stop stops sleep slept soap soup space spare speak speaks speed spell spend spent split spoil spread supper support surprise",
    sentences: ["Please put the paper on the shelf.", "Pam picked a pink apple from the plant.", "Quiet, please, the queen is speaking.", "Which quilt is the prettiest?", "Peter put the pencils in the right place.", "Paul's quick question was on the plan.", "What's the proper time to open the shop?", "Pat spent a quarter on a paper cup.", "The people in the park are quiet.", "Please quote the price of the pears."],
    seconds: 300, wpm: 14, acc: 90,
  },
  {
    title: "Keys B and Y",
    titleHi: "B और Y keys",
    description: "Stretch your fingers to the awkward B and Y keys without moving your hands.",
    descriptionHi: "B और Y keys का अभ्यास (इन keys तक उंगलियां स्ट्रेच करना सिखाया जाता है)।",
    newKeys: ["b", "y"],
    words: "jury fully today story orderly clearly cry city icy easy lucky thirsty eighty thirty hungry ugly very valley every navy any sunny why way many member members money my quickly quality quantity party pay pays play plays pretty problem supply baby back bad bag bags ball balls band bank banks bar bark barn base basket bat bath be beach bean beans bear bears beat beauty bed bee beef been before began begin behind bell bells belt bench bend best better between big bike bill bird birds bit bite black blade blame blank blind block blood blow blue board boat boats body bone bones book books boot boots born both bottle bottom bowl boy boys brain branch brave bread break breath brick bridge bright bring brother brown brush build builds bulb bunch burn bus busy but butter button buy buys by bye cabin cable bake bakes baker cobweb club clubs job jobs lab labs web webs yes yet yard yarn year years yell yellow yesterday yield you young your youth yourself yoga yolk toy toys try type types typing key keys sky dry fly flying funny happy may maybe study they",
    sentences: ["Bobby's baby brother is very happy today.", "My boy buys bread by the bakery every day.", "Why is the sky so blue on a sunny day?", "Yesterday we played in the yard by the big tree.", "Beth's brother brought a basket of berries.", "Can you bring your book to the library by Friday?", "Barry thinks the boat is better than the bus.", "Buy a new bag, but only if the price is right.", "The busy bees hum by the hive.", "Billy's puppy jumps, runs, and plays by the barn."],
    paragraph: "Every morning, my brother and I walk to the bus stop by the old bridge. The sky is usually blue, and the birds are busy in the trees. Yesterday morning, we saw a yellow butterfly by the river, and my brother tried to follow it. He ran across the grass, jumped over a small rock, and almost fell into the water. I laughed so much that my bag slipped from my shoulder. A kind man nearby helped us pick up our books, and he told us that the butterfly would come back again by the time the sun was high. At school, our teacher gave us a new story about a boy who builds a boat. The boy works hard every day, but nobody believes that his boat will ever float. His grandfather, however, gives him a very useful piece of advice. Begin with a plan, take small steps, and never give up. When the boat is finally ready, the whole village gathers by the lake. The boat floats beautifully, and the boy feels proud of his work. After class, we talked about the story, and many of us wrote a short paragraph about what we learned from it. In the evening, my mother asked me to bring bread and butter from the market. The road was quiet, and the street lights were already bright. I bought the bread, a bottle of milk, and a few bananas, then walked back home carefully. Dinner was warm, fresh, and tasty, and we all sat together to share our stories from the day. Before bed, I opened my notebook and practiced typing for twenty minutes. My fingers are getting faster, my mistakes are becoming fewer, and I truly, honestly believe that regular practice will make me a much better typist every single week.",
    seconds: 300, wpm: 15, acc: 90,
  },
  {
    title: "Keys Z, X and Exclamation (!)",
    titleHi: "Z, X keys और विस्मयादिबोधक चिह्न (!)",
    description: "The last keys: Z and X with the little and ring fingers, and the exclamation mark.",
    descriptionHi: "आखिरी बची हुई keys Z, X और विस्मयादिबोधक चिह्न (!) का अभ्यास।",
    newKeys: ["z", "x", "!"],
    words: "realize next mix quiz prize box zoo zero zone zones zebra zip zips zest zeal size sizes sized prizes freeze frozen dozen lazy crazy fizz buzz jazz maze gaze razor wizard puzzle puzzles boxes fox foxes six sixty wax relax relaxed text texts taxi taxis tax exact example examples excuse exit exits expect expert explain explore express extra exam exams exercise mixed fix fixed fixes complex index max axe axes extend extent lax flax vex",
    sentences: ["The zebra at the zoo was amazing!", "Please fix the box before the exam!", "Wow, what a fantastic day at the zoo!", "Zack quickly mixed the extra juice, and Zoe loved it!", "Watch out for the lazy fox by the maze!", "Jazz music makes everyone relax and dance!", "Can you believe how huge the puzzle is?", "Quiet, please! The exam begins in six minutes.", "Xavier explored the expensive taxi garage.", "Amazing! We finished every lesson and typed the whole alphabet!"],
    paragraph: "Welcome to the final lesson! You have now learned every key on the keyboard, from the home row to the very last letters, Z and X. This is a big achievement, and you should feel proud of it. Typing is a useful skill that grows slowly, just like a small plant in a sunny garden. Water it every day, and soon it quickly becomes strong and useful. Last summer, my cousin Zara visited the zoo with her family. She saw a zebra, a fox, and a huge brown bear. The zookeeper explained that the zebra's stripes are like fingerprints, because no two zebras have exactly the same pattern. Zara was amazed! She took many pictures, wrote a long text message to her friends, and mixed her notes into a colourful little book. Later, she fixed a quiz about animals for her class, and everyone enjoyed the questions. Good typists follow a few simple rules. First, sit straight and keep your wrists relaxed. Second, place your fingers on the home row and return to it after every key. Third, look at the screen instead of the keyboard, because your fingers already know the way. Fourth, type slowly at first and focus on accuracy, since speed will come by itself. Finally, take a short break every half hour, so your eyes and hands can rest. Now it is your turn to prove your skill. Read each word carefully, press each key with the correct finger, and avoid looking down. If you make a mistake, do not panic, just continue calmly. Every expert was once a beginner, and every fast typist once typed one slow letter at a time. Keep practising each day without fail, and soon you will type full pages with ease. Well done, and good luck on your long journey!",
    seconds: 300, wpm: 16, acc: 90,
  },
];

export const englishBeginnerLessons: Lesson[] = SPECS.map((s, i) => {
  const ex = (type: LessonExercise["type"], label: string, labelHi: string, text: string): LessonExercise => ({ type, label, labelHi, text });
  const learnedLetters = SPECS.slice(0, i + 1).flatMap((x) => x.newKeys).filter(isLetter);
  const earlierLetters = SPECS.slice(0, i).flatMap((x) => x.newKeys).filter(isLetter);
  const newOnly = s.newKeys.filter((k) => k !== "Shift");
  const newLetters = newOnly.filter(isLetter);
  const allKeys = SPECS.slice(0, i + 1).flatMap((x) => x.newKeys);
  const usePseudo = i < 4; // lessons 1-4 only; later lessons have plenty of real words
  const capsOn = i >= 4;

  // ---- key drills (distinct strings, not the same 4 groups again and again) ----
  let k1: string[];
  let k2: string[];
  if (i === 4) {
    // Capitals + full stop: capital letter, one or two lowercase letters, sometimes a full stop.
    const caps = earlierLetters.map((l) => l.toUpperCase());
    const two = caps.flatMap((u) => earlierLetters.map((l) => u + l));
    const three = caps.flatMap((u) => spread(earlierLetters, 6).flatMap((a) => spread(earlierLetters, 6).map((b) => u + a + b + ".")));
    k1 = [...split(s.k1 ?? ""), ...shuffle(two, 2)];
    k2 = [...split(s.k2 ?? ""), ...shuffle(three, 4)];
  } else {
    const anchorsA = spread(earlierLetters.length ? earlierLetters : newLetters, 3);
    const anchorsB = spread(earlierLetters.length ? earlierLetters : newLetters, 8);
    k1 = keyStrings(Array.from(new Set([...newOnly, ...anchorsA])).slice(0, 9), newOnly, 3, 4);
    k2 = keyStrings(Array.from(new Set([...newOnly, ...anchorsB])).slice(0, 12), newOnly, 3, 5);
  }

  // ---- word lists: this lesson's words first, then earlier lessons' words ----
  const realNew = split(s.words);
  const realBefore = SPECS.slice(0, i).flatMap((x) => split(x.words));
  const pseudoNew = usePseudo ? pseudoWords(learnedLetters, newLetters.length ? newLetters : learnedLetters) : [];
  const pseudoBefore = usePseudo && i > 0
    ? pseudoWords(earlierLetters, SPECS[0].newKeys.filter(isLetter).concat(earlierLetters), 250)
    : [];
  const newTokens = shuffle([...realNew, ...pseudoNew], 2);
  const oldTokens = shuffle([...realBefore, ...pseudoBefore], 9);
  let master = [...newTokens, ...oldTokens];
  if (i === 4) master = master.map(capitalize);
  else if (i > 4) master = master.map((w, k) => (k % 4 === 0 ? capitalize(w) : w));
  const words = new Feed(master);

  // ---- sentences: hand-written ones first, then extra practice sentences ----
  const sentenceFeed = new Feed(shuffle(master, 5));
  const practiceSentences: string[] = [];
  for (let k = 0; k < 14; k++) {
    const w = sentenceFeed.take(6 + (k % 3));
    practiceSentences.push(capsOn ? capitalize(w.join(" ")) + "." : w.join(" "));
  }
  const sentenceText = [...s.sentences, ...practiceSentences].join(" ");

  // ---- paragraph: exactly 300 words ----
  let paragraph: string;
  if (s.paragraph) {
    paragraph = s.paragraph;
  } else {
    const pw: string[] = split(s.sentences.join(" "));
    const filler = new Feed(shuffle(master, 11));
    let k = 0;
    while (pw.length < 300) {
      const w = filler.take(7 + (k++ % 3));
      if (capsOn) { w[0] = capitalize(w[0]); w[w.length - 1] += "."; }
      pw.push(...w);
    }
    paragraph = pw.slice(0, 300).join(" ");
    if (capsOn && !/[.!?]$/.test(paragraph)) paragraph += ".";
  }

  const exercises: LessonExercise[] = [
    ex("key-drill", "Key drill", "key अभ्यास", new Feed(k1).chars(500)),
    ex("key-drill", "Mixed key drill", "मिश्रित key अभ्यास", new Feed(k2).chars(500)),
    ex("word-drill", "Word drill", "शब्द अभ्यास", words.chars(900)),
    ex("word-drill", "Word drill again", "शब्द अभ्यास दोबारा", words.chars(900)),
    ex("word-drill", "Revision words", "पुराने शब्दों का अभ्यास", words.chars(900)),
    ex("sentence-drill", "Sentences", "वाक्य", sentenceText),
    ex("paragraph-drill", "Paragraph (300 words)", "पैराग्राफ (300 शब्द)", paragraph),
  ];

  return {
    id: `en-b-${String(i + 1).padStart(2, "0")}`,
    courseId: "en-beginner",
    language: "en",
    layout: "en-qwerty",
    order: i + 1,
    title: s.title,
    titleHi: s.titleHi,
    description: s.description,
    descriptionHi: s.descriptionHi,
    newKeys: s.newKeys,
    requiredKeys: allKeys,
    exerciseType: exercises[0].type,
    practiceText: exercises[0].text,
    exercises,
    suggestedDurationSec: s.seconds,
    passWpm: s.wpm,
    passAccuracy: s.acc,
  };
});
