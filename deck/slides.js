/* =====================================================================
   DECK CONTENT — the only file you edit to change what is on screen.
   ===================================================================== */

/* ---------------------------------------------------------------------
   MEDIA — image key → file in /images.
   To swap in a real screenshot: drop the file in images/ and make sure
   `file` matches. Until the file loads, the slot renders as a dark,
   labeled placeholder at the given aspect ratio.
   --------------------------------------------------------------------- */
const MEDIA = {
  'sample-screen': { file: 'sample-screen.png', ratio: '16:9', label: 'SAMPLE: full-bleed product screenshot' },
};

/* ---------------------------------------------------------------------
   SECTIONS — the MARKET → OFFER → CONTENT spine, in order.
   `minutes` is the pacing budget the presenter window counts against.
   --------------------------------------------------------------------- */
const SECTIONS = [
  { key: 'market',  label: 'Market',  minutes: 4 },
  { key: 'offer',   label: 'Offer',   minutes: 5 },
  { key: 'content', label: 'Content', minutes: 6 },
];

/* ---------------------------------------------------------------------
   SLIDES — the entire deck. Add a slide = add an object.

   { type: 'statement', content: { text },                            notes, section }
   { type: 'image',     image: '<MEDIA key>', content: { caption? },  notes, section }
   { type: 'diagram',   content: { title?, layout: 'flow'|'rows'|'ladder', items: [...] }, notes, section }
   { type: 'diagram',   content: { title?, layout: 'html', html: '<div data-step="1">…' }, notes, section }
   { type: 'stat',      content: { value, label?, source },           notes, section }
   { type: 'section',   content: { stage? },  (stage defaults to section)  notes, section }

   Diagram reveal: flow/rows/ladder show the first item on arrival, then one more
   per keypress. In 'html', anything with data-step="n" appears on the nth
   press; anything without data-step is always visible.
   --------------------------------------------------------------------- */
const SLIDES = [
  {
    type: 'statement',
    content: { text: 'Sample statement. One line, alone.' },
    image: null,
    notes: `SAMPLE: replace with script.

This is the statement slide. Check that the line sits dead centre and that nothing else is on screen.

Press → to go to the image slide. Watch the presenter window: the current preview, next preview and counter should all move together.`,
    section: 'market',
  },
  {
    type: 'image',
    content: {},
    image: 'sample-screen',
    notes: `SAMPLE: replace with script.

This is an image slot. There is no file yet, so you should see the dark labeled placeholder at 16:9.

To test the swap, put any PNG at deck/images/sample-screen.png and reload.`,
    section: 'market',
  },
  {
    type: 'diagram',
    content: {
      title: 'Sample staged diagram',
      layout: 'flow',
      items: ['Attention', 'Trust', 'Offer', 'Sale'],
    },
    image: null,
    notes: `SAMPLE: replace with script.

Staged diagram: four builds. Arrival shows the first node. Each → reveals one more.

Press ← here to step back through the builds before leaving the slide. Coming back into this slide from the next one would show it fully built.`,
    section: 'offer',
  },
];
