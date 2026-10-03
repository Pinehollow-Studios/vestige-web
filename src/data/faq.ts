import { progressConfig } from "./progressConfig";

const courses = progressConfig.coursesMapped.toLocaleString("en-GB");
const total = progressConfig.coursesTotal?.toLocaleString("en-GB");

export const faq: ReadonlyArray<{ q: string; a: string; link?: { href: string; label: string } }> = [
  {
    q: "Is it really free?",
    a: "Yes. The full app and your whole collection are free, and always will be. Mapping a course, filling in your collection, seeing where you stand: none of it costs anything. A paid tier may come later for a few extras, and it will only ever sit on top of the free app.",
  },
  {
    q: "Does it track my score or handicap?",
    a: "No. Vestige isn’t a scorecard or a swing analyser. Jot a score against a round if you like, but the point is the collection itself.",
  },
  {
    q: "How does it know which courses I’ve played?",
    a: "You tell it. One tap marks a course as played, and that is all there is to it.",
  },
  {
    q: "Which courses are in it?",
    a: `Every course in England: all ${courses} of them, from Open Championship links to your local nine-hole pitch and putt, completed county by county. Scotland and Wales are being mapped next, which takes the map to around ${total ?? "every"} courses across Great Britain.`,
    link: { href: "/courses", label: "Browse every course" },
  },
  {
    q: "Which countries does it cover?",
    a: "England, Scotland and Wales: the whole of Great Britain on one map. England is finished. Scotland and Wales are being mapped now, and until they are they sit on the map as still to come.",
  },
  {
    q: "Can I get it outside the UK?",
    a: "At launch, Vestige will be on the UK App Store only, because the map is British courses and there is not much in it for you if you have never played one. If you are British and abroad, the app travels fine: it is where you download it that has to be the UK.",
  },
  {
    q: "What do you do with my data?",
    a: "As little as possible, and no ads. We will never sell your personal data: no names, nothing that ties back to you. Your collection is yours, and you can export or delete it whenever you like.",
  },
  {
    q: "When can I actually use it?",
    a: "Version 1.0 arrives in January 2027, publicly available and free, and March 2027 is launch day proper. Until then Vestige is in beta, by invitation. Leave your email and you’ll hear the day 1.0 lands.",
  },
];
