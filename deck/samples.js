/* =====================================================================
   SAMPLES — one slide of each type, real script content, for a design
   check before the full deck is built. Loaded by samples.html in place
   of slides.js. Same engine, same keys (P opens the presenter).
   ===================================================================== */

const MEDIA = {
  'ab-test-winner': { file: 'ab-test-winner.png', ratio: '16:9', label: 'Bayaan Institute A/B test: 61.9% vs 38.1% watch-time share' },
};

const SECTIONS = [
  { key: 'market',  label: 'Market',  minutes: 7 },
  { key: 'offer',   label: 'Offer',   minutes: 6 },
  { key: 'content', label: 'Content', minutes: 10 },
];

const SLIDES = [
  {
    type: 'section',
    content: { stage: 'market' },
    image: null,
    notes: `(Part 1 opener. No lines on this slide. Press → for the statement.)`,
    section: 'market',
  },
  {
    type: 'statement',
    content: { text: 'You’re not creating demand. You’re transcribing it.' },
    image: null,
    notes: `[SPEAK OFF THESE]

• The alternative is not more creativity. It's less. Ignore the noise, find the signal — and the signal only comes from talking directly to the market.

• The reframe: you're not inventing something people might want. You're finding demand that already exists and supplying it. If you have what people want and you put it in front of them, they buy. That's the whole mechanism.`,
    section: 'market',
  },
  {
    type: 'diagram',
    content: { layout: 'ladder', items: ['WHAT IT IS', 'WHAT IT DOES', 'WHO I BECOME'] },
    image: null,
    notes: `[WORD FOR WORD]

Every offer has three layers, and almost everyone sells the wrong one.

Layer one is what it is.
[→] Layer two is what it does.
[→] Layer three is what it means about the person buying it.

Layer one is a feature list. Layer three is an identity. And people will pay ten times more for an identity than they'll ever pay for a feature.`,
    section: 'offer',
  },
  {
    type: 'stat',
    content: { value: '100ms', source: 'Princeton University, 2006' },
    image: null,
    notes: `[WORD FOR WORD]

Nobody chooses to watch your video. Their brain chooses for them.

Princeton University ran this study in 2006. A hundred milliseconds of someone's face — a tenth of a second — and people had already rated them for trustworthiness and competence. Give them unlimited time and the rating barely moved. More time didn't make them more accurate. It just made them more confident in their preconceived notion of you.

So you're not competing for a decision. You're competing for the tenth of a second before the decision exists.

⚠ GAP: "Which means better lighting, better editing, a better camera." Unfinished in the script.`,
    section: 'content',
  },
  {
    type: 'image',
    content: {},
    image: 'ab-test-winner',
    notes: `Here's an example — two very similar titles and thumbnails, but you can see the first one won by a long shot. You should always A/B test thumbnails and titles.

(Winner: "It Took Me 9 Years To Realize What I'll Tell You In 18 Minutes" at 61.9% vs "9 Years of Arabic Knowledge In 18 Minutes" at 38.1%.)`,
    section: 'content',
  },
];
