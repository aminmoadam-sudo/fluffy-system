/* =====================================================================
   DECK CONTENT — the only file you edit to change what is on screen.
   Speaker notes are cut verbatim from script.md. "PROPOSED" marks a slide
   the script doesn't call for; "FILLED IN" marks a gap that was closed.
   ===================================================================== */

/* ---------------------------------------------------------------------
   MEDIA — image key → file in /images. Drop the screenshot into images/
   with this filename and it replaces the placeholder. ratio sets the
   placeholder's shape until then.
   --------------------------------------------------------------------- */
const MEDIA = {
  "stripe-3k-to-30k": { file: "stripe-3k-to-30k.png", ratio: "16:9", label: "Client's Stripe dashboard, 3k → 30k a month" },
  "ab-test-winner": { file: "ab-test-winner.png", ratio: "16:9", label: "Bayaan Institute A/B test: 61.9% vs 38.1% watch-time share" },
  "43-optins": { file: "43-optins.png", ratio: "16:9", label: "43 opt-ins, 198 clicks" },
  "claude-chad": { file: "claude-chad.png", ratio: "1:1", label: "The Claude meme" },
  "chatgpt-meme": { file: "chatgpt-meme.png", ratio: "1:1", label: "The ChatGPT meme" },
  "yt-110k-views": { file: "yt-110k-views.png", ratio: "16:9", label: "110.7K views, 1.7K watch hours, +778 subscribers" },
  "yt-short-157k": { file: "yt-short-157k.png", ratio: "16:9", label: "157.6K views on a Short, +412 subscribers" },
  "whisprflow": { file: "whisprflow.png", ratio: "16:9", label: "Wispr Flow logo" },
  "story-poll-results": { file: "story-poll-results.png", ratio: "9:16", label: "PROPOSED: story poll with the answer split visible" },
  "poll-dm-opener": { file: "poll-dm-opener.png", ratio: "9:16", label: "PROPOSED: DM opening \"Saw you answered my poll\"" },
  "claude-sales-call-analysis": { file: "claude-sales-call-analysis.png", ratio: "16:9", label: "PROPOSED: Claude analysing a sales-call transcript" },
  "outlier-videos": { file: "outlier-videos.png", ratio: "16:9", label: "PROPOSED: a channel sorted by views, outliers obvious" },
  "credentials-first-seconds": { file: "credentials-first-seconds.png", ratio: "16:9", label: "PROPOSED: client video frame showing proof in the first seconds" },
  "thumbnail-concepts-phone": { file: "thumbnail-concepts-phone.png", ratio: "16:9", label: "PROPOSED: three thumbnail concepts at phone size" },
  "claude-project-docs": { file: "claude-project-docs.png", ratio: "16:9", label: "PROPOSED: the Claude project holding the foundation docs" },
};

/* ---------------------------------------------------------------------
   SECTIONS — pacing budget in minutes, in talk order. Sections without
   spine:false make up the MARKET → OFFER → CONTENT spine.
   --------------------------------------------------------------------- */
const SECTIONS = [
  { key: "hook", label: "Hook", minutes: 0.8, spine: false },
  { key: "market", label: "Market", minutes: 6.1 },
  { key: "offer", label: "Offer", minutes: 5.1 },
  { key: "content", label: "Content", minutes: 9.6 },
  { key: "close", label: "Close", minutes: 1.1, spine: false },
];

/* ---------------------------------------------------------------------
   SLIDES — the entire deck. Add a slide = add an object.

   { type: 'statement', content: { text } }
   { type: 'image',     image: '<MEDIA key>' or ['<key>', '<key>'] }
   { type: 'stat',      content: { value, source } }
   { type: 'section',   content: { stage: '<section key>' | 'none' | 'all' } }
   { type: 'diagram',   content: { layout, items, ...options } }
       layout: 'flow' | 'rows' | 'stack' | 'steps' | 'boxes' | 'ladder' | 'html'
       lit: n        item n bright, the rest dimmed (no builds)
       staged: false show everything on arrival
       from: n       first n items already shown on arrival
       until: n      only the first n items ever appear (rest stay as empty boxes)
       cols, compact, arrows, footer: layout-specific

   Every slide also has notes (presenter window only) and section.
   --------------------------------------------------------------------- */
const SLIDES = [
  // 1 · hook · stat · ~46s
  {
    type: "stat",
    content: {"value": "10M+", "source": "Organic views for coaches, last 8 months"},
    image: null,
    notes: `[WORD FOR WORD]

Over the last 8 months I've done over 10 million organic views for coaches online.

And here's the thing nobody tells you about doing that many views. You don't just learn about content. You start to learn about people as well.

Because once you've watched enough videos hit and enough videos flop, you figure out that the difference usually isn't the video. It's whether you knew what was going on in someone's head before they ever clicked.

Over 10 million views and hundreds of thousands of dollars collected from that. In the next few minutes I'm going to show you what that taught me about how people actually think, and how to turn it into money.`,
    section: "hook",
  },
  // 2 · hook · section · ~5s
  {
    type: "section",
    content: {"stage": "none"},
    image: null,
    notes: `We'll break it into 3 parts:`,
    section: "hook",
  },
  // 3 · market · section · ~5s
  {
    type: "section",
    content: {"stage": "market"},
    image: null,
    notes: `(Part 1, The Mirror. Beat, then →.)`,
    section: "market",
  },
  // 4 · market · statement · ~41s
  {
    type: "statement",
    content: {"text": "People don’t pay attention to you. They pay attention to themselves."},
    image: null,
    notes: `[WORD FOR WORD]

Nobody is interested in you.

I know that sounds harsh. It's not an insult, it's just how attention works. People are interested in themselves, and you get attention only to the exact degree that you reflect them back.

So here's the uncomfortable part. Almost every offer I've ever been handed to scale was built on an assumption. Somebody sat in a room, decided what their market needed, and built it. And then wondered why the content didn't land, why the calls were full of unqualified people, why nothing converted.

It wasn't the content. You can't reflect a market you've never actually spoken to.`,
    section: "market",
  },
  // 5 · market · diagram · ~26s
  {
    type: "diagram",
    content: {"layout": "steps", "cols": 4, "lit": 0, "items": ["NICHE", "OFFER", "FUNNEL", "TRAFFIC", "SALES", "ONBOARDING", "FULFILLMENT", "SCALE"]},
    image: null,
    notes: `[WORD FOR WORD]

There's a sequence every business runs on, whether you've named it or not.

Niche. Offer. Funnel. Traffic. Sales. Onboarding. Fulfillment. Scale.

Eight steps. Everyone obsesses over four through six. But the first one sets the terms for all of them. Get the niche right and the rest is a walk. Get it wrong and every single stage after it is an uphill fight, forever.`,
    section: "market",
  },
  // 6 · market · diagram · ~53s
  {
    type: "diagram",
    content: {"layout": "rows", "items": ["NO RESONANCE", "NO TRACTION", "WRONG PEOPLE", "UNQUALIFIED CALLS", "NO SALES"]},
    image: null,
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

[SPEAK OFF THESE]

- The two failure patterns.
  - Pattern one: funnel-hack a competitor, copy the offer, never understand why it worked, pray.
  - Pattern two: have a fresh idea, think it sounds great, build it, pray. Both end the same way.
- Why both fail is the same reason. Assumption. You're guessing what people want and handing them your guess.
- What it costs you, in order: offer doesn't resonate → messaging gets no traction → the people who do respond are the wrong ones → you take calls with unqualified leads → no sales. Five stages of pain, one root cause.`,
    section: "market",
  },
  // 7 · market · statement · ~36s
  {
    type: "statement",
    content: {"text": "You’re not creating demand. You’re transcribing it."},
    image: null,
    notes: `[SPEAK OFF THESE]

- The alternative is not more creativity. It's less. Ignore the noise, find the signal — and the signal only comes from talking directly to the market.
- The reframe: you're not inventing something people might want. You're finding demand that already exists and supplying it. If you have what people want and you put it in front of them, they buy. That's the whole mechanism.`,
    section: "market",
  },
  // 8 · market · diagram · ~38s
  {
    type: "diagram",
    content: {"layout": "rows", "compact": true, "staged": false, "items": ["Why did you get started with x, and why do you want to x it?", "What’s the main goal you have with x?", "What’s stopping you from getting there?", "If you had a step-by-step plan — what’s a realistic timeline, and what’s your desired timeline?", "What have you already tried? What worked, what didn’t work?", "What was the worst experience you’ve had trying to get this outcome?"]},
    image: null,
    notes: `I'll give you some questions you can ask the market. These are literally the questions we use when running market research for our clients:

1. Why did you get started with x, and why do you want to x it?
2. What's the main goal you have with x?
3. What's stopping you from getting there?
4. If you had a step-by-step plan — what's a realistic timeline, and what's your desired timeline?
5. What have you already tried? What worked, what didn't work?
6. What was the worst experience you've had trying to get this outcome?

(One slide, no animation. Pause so people can screenshot it.)`,
    section: "market",
  },
  // 9 · market · stat · ~27s
  {
    type: "stat",
    content: {"value": "20–30", "source": "Conversations, our client market research"},
    image: null,
    notes: `[SPEAK OFF THESE]

- Have like 20 to 30 conversations before you conclude anything. Below that you're pattern-matching on noise. This is the step everyone shortcuts and it's why their research produces nothing usable.
- Write down every answer verbatim. Not your summary of it — their words. Their words become your hooks.`,
    section: "market",
  },
  // 10 · market · image · ~34s
  {
    type: "image",
    content: {},
    image: "story-poll-results",
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

[SPEAK OFF THESE]

- You post a story that makes qualified people identify themselves — a story poll, a question, a free guide gated behind a few questions.
- Two things come back at once: conversations, and a ratio. If you ask "do you own an agency or do you want to start one," the split tells you which offer to build before you've built anything.`,
    section: "market",
  },
  // 11 · market · image · ~21s
  {
    type: "image",
    content: {},
    image: "poll-dm-opener",
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

[SPEAK OFF THESE]

- Opening line is simple. "Saw you answered my poll — you run an agency, right?" That's it. That's the whole outreach.
- Works anywhere you have traffic. Stories, polls, DMs, email list, YouTube community tab, YouTube comments, etc.`,
    section: "market",
  },
  // 12 · market · image · ~45s
  {
    type: "image",
    content: {},
    image: "claude-sales-call-analysis",
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

[SPEAK OFF THESE]

- Sales calls. What did they say right before they bought? What were the objections? Those recordings are research you already paid for and never used.
  - You can use Claude for this.
- Current clients. Are they getting results? What would they change?
- Referrals. A product people market for you for free is a product that works.
- Best thing is you can use Claude heavily in building this out, when analyzing your sales calls and building out your offer.`,
    section: "market",
  },
  // 13 · market · diagram · ~22s
  {
    type: "diagram",
    content: {"layout": "stack", "items": ["CHANGE THE OFFER", "NOT ENOUGH DATA", "THE OFFER IS GOOD"]},
    image: null,
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

And you'll land in one of three places:

- Either the data says the offer needs to change,
- or you don't have enough data to call it,
- or you've got enough to say the offer is good.

All three are fine. The only bad outcome is not knowing which one you're in.`,
    section: "market",
  },
  // 14 · market · statement · ~17s
  {
    type: "statement",
    content: {"text": "Most coaches don’t have a content problem. They have a listening problem."},
    image: null,
    notes: `(Let it sit.)

[WORD FOR WORD]

So now you've got their actual language — the real goal, the real roadblock, the thing they're afraid of. Here's where most people waste all of it. Because knowing what someone wants and knowing what they'll pay for are two completely different things.`,
    section: "market",
  },
  // 15 · offer · section · ~5s
  {
    type: "section",
    content: {"stage": "offer"},
    image: null,
    notes: `(Part 2, The Ladder. Beat, then →.)`,
    section: "offer",
  },
  // 16 · offer · statement · ~5s
  {
    type: "statement",
    content: {"text": "Nobody buys the thing. They buy who it makes them."},
    image: null,
    notes: `[WORD FOR WORD]

Every offer has three layers, and almost everyone sells the wrong one.`,
    section: "offer",
  },
  // 17 · offer · diagram · ~20s
  {
    type: "diagram",
    content: {"layout": "ladder", "items": ["WHAT IT IS", "WHAT IT DOES", "WHO I BECOME"]},
    image: null,
    notes: `[WORD FOR WORD]

Layer one is what it is.
Layer two is what it does.
Layer three is what it means about the person buying it.

Layer one is a feature list. Layer three is an identity. And people will pay ten times more for an identity than they'll ever pay for a feature.`,
    section: "offer",
  },
  // 18 · offer · diagram · ~51s
  {
    type: "diagram",
    content: {"layout": "ladder", "items": ["A SYSTEM", "MORE LEADS", "PREDICTABLE REVENUE", "I RUN AN ACTUAL COMPANY"]},
    image: null,
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

[SPEAK OFF THESE]

- Keep asking *why does someone actually care about this* until you hit something you can't go underneath. That floor is your real offer.
- Worked example, say it out loud: a system → more leads → predictable revenue → I'm not scrambling anymore, I run an actual company. That's what's being bought.
- For my market, working with offer owners: they don't want automation. They want to stop being the bottleneck in their own business. It's my job to take all this off their shoulders and help them focus on what pushes the needle forward.`,
    section: "offer",
  },
  // 19 · offer · statement · ~15s
  {
    type: "statement",
    content: {"text": "Most offers aren’t bad. They’re incomplete."},
    image: null,
    notes: `[WORD FOR WORD]

Now, knowing what they're really buying is one thing. Turning it into an offer somebody says yes to on a call — that's a construction problem. And most offers I see are missing three of the five pieces.`,
    section: "offer",
  },
  // 20 · offer · diagram · ~62s
  {
    type: "diagram",
    content: {"layout": "boxes", "items": ["RESULT", "TIMEFRAME", "MARKET", "RISK REVERSAL", "MECHANISM"], "until": 3},
    image: null,
    notes: `A complete offer has five parts. I'll name them, because you should be able to look at your own offer tonight and count how many you actually have.

1. **A quantifiable end result.** Not "grow your business." A number, or a state they'd recognize. And critically — it's not the result you think is impressive. It's the one they said out loud when you asked them what they wanted.
2. **A timeframe.** People buy speed. An offer without a clock attached is an offer they can start next year. Most coaches leave this off entirely because they're scared to commit to it.
3. **A specific market.** And this is the one everyone fights me on — the narrower you go, the more money you make. Broad offers feel safe because they theoretically include everybody. What actually happens is nobody reads it and thinks *that's me*. You can't speak directly to someone you refuse to name.`,
    section: "offer",
  },
  // 21 · offer · diagram · ~28s
  {
    type: "diagram",
    content: {"layout": "boxes", "items": ["RESULT", "TIMEFRAME", "MARKET", "RISK REVERSAL", "MECHANISM"], "from": 3},
    image: null,
    notes: `4. **Risk reversal.** When this is in place correctly, the only real reason a qualified person says no is money. That's it. Every other objection dissolves. Most coaches never put it in because it sounds expensive — it's the single highest-leverage thing in the whole offer.
5. **A unique mechanism.** The answer to why you and not the twelve other people doing this. Without it you're competing on price and personality.`,
    section: "offer",
  },
  // 22 · offer · diagram · ~41s
  {
    type: "diagram",
    content: {"layout": "boxes", "items": ["RESULT", "TIMEFRAME", "MARKET", "RISK REVERSAL", "MECHANISM"], "lit": 4, "staged": false},
    image: null,
    notes: `[WORD FOR WORD]

I want to sit on number five for a second, because it's the one that creates outliers.

I have a client in the personal development niche. Kind of a crowded space, and a lot of people are offering the same thing, and he had about 4k followers when we started working together. Offer was very similar to everybody else in his market.

But we'd figured out a structurally different way to do the thing — not a better version of the standard approach, a different route to the same outcome he was promising even before. We named it, we built the offer around it.`,
    section: "offer",
  },
  // 23 · offer · image · ~20s
  {
    type: "image",
    content: {},
    image: "stripe-3k-to-30k",
    notes: `And today, this is what his Stripe dashboard looks like. He went from 3k a month to 30k a month organically, and we're still scaling.

That's what a real mechanism does. It takes you out of comparison entirely. Nobody's price-shopping you against someone else, because there isn't someone else.`,
    section: "offer",
  },
  // 24 · offer · statement · ~23s
  {
    type: "statement",
    content: {"text": "A mechanism isn’t invented. It’s found."},
    image: null,
    notes: `And here's what I'll tell you about where mechanisms come from — they don't come from brainstorming. You don't sit down and invent one. They come out of the research layer I talked about in part one. The mechanism is already in your business or in your market's language. The work is finding it and naming it correctly.`,
    section: "offer",
  },
  // 25 · offer · diagram · ~37s
  {
    type: "diagram",
    content: {"layout": "rows", "items": ["GOAL → RESULT", "REALISTIC VS DESIRED → TIMEFRAME", "TRIED VS WORKED → MECHANISM"]},
    image: null,
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

[WORD FOR WORD]

This is the other half of what we do before we touch anything else. Research, then offer construction — in that order, always, because every one of those five components is sourced from something the market told us.

The end result comes from their goal. The timeframe comes from what they said was realistic versus what they want. The mechanism comes from the gap between what they've tried and what actually worked.

That's why I said assumption-based offers can't be fixed with better content. The components aren't wrong, they're unsourced. There's nothing underneath them.`,
    section: "offer",
  },
  // 26 · content · section · ~20s
  {
    type: "section",
    content: {"stage": "content"},
    image: null,
    notes: `[WORD FOR WORD]

Alright. You know who they are. You know what they're really buying and how to package it. Now you have to get them to look — and this is where the psychology gets genuinely strange, because that decision isn't made by the person. It's made before they're even conscious of it.

(→ Part 3, The Shortcut.)`,
    section: "content",
  },
  // 27 · content · statement · ~5s
  {
    type: "statement",
    content: {"text": "THEIR BRAIN DECIDES. NOT THEM."},
    image: null,
    notes: `[WORD FOR WORD]

Nobody chooses to watch your video. Their brain chooses for them.`,
    section: "content",
  },
  // 28 · content · stat · ~40s
  {
    type: "stat",
    content: {"value": "100ms", "source": "Princeton University, 2006"},
    image: null,
    notes: `Princeton University ran this study in 2006. A hundred milliseconds of someone's face — a tenth of a second — and people had already rated them for trustworthiness and competence. Give them unlimited time and the rating barely moved. More time didn't make them more accurate. It just made them more confident in their preconceived notion of you.

So you're not competing for a decision. You're competing for the tenth of a second before the decision exists.

FILLED IN (not in the script, check before filming): "Which means better lighting, better editing, a better camera won’t save you if that first tenth of a second goes against you."`,
    section: "content",
  },
  // 29 · content · diagram · ~27s
  {
    type: "diagram",
    content: {"layout": "stack", "items": ["FAMILIAR?", "UNEXPECTED?", "ME?"]},
    image: null,
    notes: `[SPEAK OFF THESE]

Before your viewer knows they're deciding anything, their brain runs three checks.

Say them long, write them short:

1. Have I seen something like this and liked it?
2. Is something happening I didn't expect?
3. Does this have anything to do with me?

Three no's and you're done.`,
    section: "content",
  },
  // 30 · content · diagram · ~26s
  {
    type: "diagram",
    content: {"layout": "stack", "items": ["FAMILIAR?", "UNEXPECTED?", "ME?"], "lit": 0, "staged": false},
    image: null,
    notes: `A format the brain has never seen doesn't excite it. It actually confuses it, and confusion is the fastest exit there is. So the trick is not to invent formats.

You find one already doing numbers and you put your message inside it. Steal the format, keep the hook, the outro, and the overall message. The originality goes in the body of the video.`,
    section: "content",
  },
  // 31 · content · diagram · ~54s
  {
    type: "diagram",
    content: {"layout": "stack", "items": ["FAMILIAR?", "UNEXPECTED?", "ME?"], "lit": 1, "staged": false},
    image: null,
    notes: `In 1994 a psychologist named George Loewenstein studied this and said: curiosity isn't interest — it's deprivation.

There's a gap between what you know and what you want to know, and it registers as genuine discomfort. This is why you can't leave a text on read, can't skip an episode of a show, or ignore a notification. This is called the information gap. It pains you *not* to know.

But the gap has to be the right size. Too small and nobody really cares. Too big and they can't feel it, because you need to know something already to know what you're missing.

Which is why one and two are the same move. The familiar format is what makes the gap the right size. Stealing a structure isn't separate from curiosity — it's what makes curiosity possible.`,
    section: "content",
  },
  // 32 · content · diagram · ~21s
  {
    type: "diagram",
    content: {"layout": "stack", "items": ["FAMILIAR?", "UNEXPECTED?", "ME?"], "lit": 2, "staged": false},
    image: null,
    notes: `Your first line should be a sentence your market already said in some form. Not your clean summary of their problem. Their actual sentence, with their actual words in it.

And when it works it keeps working, because the strongest version of *this involves me* is *this says something about me*.`,
    section: "content",
  },
  // 33 · content · diagram · ~24s
  {
    type: "diagram",
    content: {"layout": "stack", "items": ["FAMILIAR?", "UNEXPECTED?", "ME?"], "staged": false},
    image: null,
    notes: `(Trust shortcut: none of the three checks is trust.)

Notice none of the three checks is "do I trust this guy?" The brain doesn't check. It takes a shortcut. A specific number in the first two seconds gets accepted before they've decided to judge you. A claim gets judged. A number gets filed. That's not manipulation, it's how the media has always worked. You're just doing it on purpose.`,
    section: "content",
  },
  // 34 · content · stat · ~30s
  {
    type: "stat",
    content: {"value": "50ms", "source": "Carleton University"},
    image: null,
    notes: `Carleton University flashed web pages at people for fifty milliseconds. One twentieth of a second, and they could reliably rate visual appeal.

Here's the part that should scare you: that snap read created a halo. It colored how they judged the credibility of everything on the page afterward.

Your thumbnail isn't deciding the click. It's deciding how good your video is allowed to be.

All the leverage sits before you film. Everything after is execution.`,
    section: "content",
  },
  // 35 · content · image · ~51s
  {
    type: "image",
    content: {},
    image: "outlier-videos",
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

[SPEAK OFF THESE]

My hook process has almost nothing to do with writing.

- **Formats first.** I don't invent them, I find them. I go into the niche and the niches next to it and pull videos sitting way above what that account normally does, and other outliers in that niche.
- **Then the hook** — and it doesn't come out of my head. Most of the time you take the hook from the outlier video. You don't need to change it, it's clearly already working. Add your own flavor from your niche, but don't change much.`,
    section: "content",
  },
  // 36 · content · image · ~14s
  {
    type: "image",
    content: {},
    image: "credentials-first-seconds",
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

- **Credentials in the first few seconds.** Show proof as fast as possible or people won't believe you. You have to prove your claims in the first few seconds for people to stay curious.`,
    section: "content",
  },
  // 37 · content · diagram · ~15s
  {
    type: "diagram",
    content: {"layout": "flow", "items": ["TITLE", "THUMBNAIL", "SCRIPT"]},
    image: null,
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

- **Packaging before the script.** Title first, thumbnail second, script last. If I can't write a title I'd click on myself, there's no point in filming. Nothing in the edit saves it later if the packaging is garbage.`,
    section: "content",
  },
  // 38 · content · image · ~21s
  {
    type: "image",
    content: {},
    image: "thumbnail-concepts-phone",
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

- **Thumbnails:** three concepts minimum, checked at phone size before anything else. If I can't read it small, it's dead. Three words max, high contrast.
- **Pro tip:** only A/B test two thumbnails and two titles. Three is a bit much — I personally haven't seen it work, so stick with 2.`,
    section: "content",
  },
  // 39 · content · stat · ~8s
  {
    type: "stat",
    content: {"value": "61.9%", "source": "Bayaan Institute A/B test, watch-time share"},
    image: null,
    notes: `Here's an example — two very similar titles and thumbnails, but you can see the first one won by a long shot.`,
    section: "content",
  },
  // 40 · content · image · ~5s
  {
    type: "image",
    content: {},
    image: "ab-test-winner",
    notes: `You should always A/B test thumbnails and titles.

(Winner: "It Took Me 9 Years To Realize What I'll Tell You In 18 Minutes" at 61.9% vs "9 Years of Arabic Knowledge In 18 Minutes" at 38.1%.)`,
    section: "content",
  },
  // 41 · content · image · ~10s
  {
    type: "image",
    content: {},
    image: "43-optins",
    notes: `And you can see here how well the video has performed since it's been posted — 43 applications from it in the past two weeks:`,
    section: "content",
  },
  // 42 · content · statement · ~57s
  {
    type: "statement",
    content: {"text": "DON’T ASK IT. FEED IT."},
    image: null,
    notes: `[SPEAK OFF THESE]

Everyone's using AI to script now. Almost everyone's doing it in the order that guarantees a bad one.

They open a blank chat and type *write me a video about a [topic]*. And it does exactly what it was asked — averages everything it's ever seen on that topic and hands it back. Then they wonder why the video isn't performing.

The tool isn't the problem. You gave it nothing of yours, so it gave you nothing of yours back.

When I'm scripting for my clients, I don't ask it to write. I feed Claude until writing is the only thing left to do.`,
    section: "content",
  },
  // 43 · content · image · ~10s
  {
    type: "image",
    content: {},
    image: ["claude-chad", "chatgpt-meme"],
    notes: `Btw use Claude for this. Claude is chaddddd fr lol.

FILLED IN (not in the script, check before filming): the "Claude = / ChatGPT:" comparison is the two memes side by side, no text.`,
    section: "content",
  },
  // 44 · content · image · ~23s
  {
    type: "image",
    content: {},
    image: "claude-project-docs",
    notes: `PROPOSED: not called for in the script. Delete this slide if you don't want it.

FILLED IN (not in the script, check before filming): the 3 documents are never named, so the count is cut:

What we do is create a project holding our client intake documents, our market research ICP, and the offer doc we built from them. You can start adding transcripts of sales calls and coaching calls as time goes on if you don't have any.`,
    section: "content",
  },
  // 45 · content · image · ~5s
  {
    type: "image",
    content: {},
    image: "yt-110k-views",
    notes: `Because we understand our ICP so deeply we get results like this:`,
    section: "content",
  },
  // 46 · content · image · ~16s
  {
    type: "image",
    content: {},
    image: "yt-short-157k",
    notes: `Every script after that starts from something that already knows who we're talking to and how our clients sound. Most people rebuild that context from scratch every time and wonder why the output reads like a stranger wrote it.`,
    section: "content",
  },
  // 47 · content · image · ~44s
  {
    type: "image",
    content: {},
    image: "whisprflow",
    notes: `Speak about the video topic for like 10–15 minutes, completely unfiltered. Just talk. You're emptying your head onto the page so Claude has raw material that only you could have given it.

Don't get me wrong — AI has great structure but it lacks substance. That part has to come from a human. It can organize a video, pace a hook, sequence an argument. But if you don't feed it that, it'll give you AI slop generic advice. Doing this removes that from happening.

Use Whisprflow for this. Transcribe it so you have everything written down.

Everyone skips this and it's why most coaches sound like bots in their videos.`,
    section: "content",
  },
  // 48 · content · diagram · ~26s
  {
    type: "diagram",
    content: {"layout": "boxes", "arrows": true, "items": ["FOUNDATION", "DUMP", "EXTRACT", "REWRITE"], "from": 2},
    image: null,
    notes: `(Stages one and two are already on screen. Build EXTRACT, then REWRITE.)

I feed Claude the structure of the outlier video. I want to change the body but I'll keep the hook and the CTA most of the time. I'll probably keep the structure but I'll make it make sense for my creator.

I'll rewrite the body to make it relevant to the niche I'm scripting the video for, but I'll keep the skeleton from the outlier video.`,
    section: "content",
  },
  // 49 · content · diagram · ~23s
  {
    type: "diagram",
    content: {"layout": "boxes", "arrows": true, "items": ["FAMILIAR FORMAT", "THEIR WORDS", "CURIOSITY GAP"], "footer": "+ ONE NUMBER — first two seconds"},
    image: null,
    notes: `I write three things: hook, transitions, CTA. Everything else is bullet points so I sound natural. Natural beats precise.

Underneath: **+ ONE NUMBER — first two seconds**

Attention isn't an asset. Attention should be looked at as a liability, and it runs out in about four seconds. The asset is what you've built to capture that attention from the audience.`,
    section: "content",
  },
  // 50 · close · section · ~36s
  {
    type: "section",
    content: {"stage": "all"},
    image: null,
    notes: `[WORD FOR WORD]

Here's the part that took me 10 million views to actually get.

These aren't three tactics. They're one thing broken up in three stages, and they only work in that order.

If you don't know what's in their head, your offer is a guess. If your offer is a guess, your content is a guess that looks good. And if your content is a guess, you can post every single day for a year and end up exactly where you started — which is what most coaches are doing right now.`,
    section: "close",
  },
  // 51 · close · statement · ~30s
  {
    type: "statement",
    content: {"text": "You don’t have a content problem. You have an order problem."},
    image: null,
    notes: `(Let it sit. Hold this slide through the CTA, or press B to blank and talk to camera.)

[WORD FOR WORD]

If you're a Muslim coach doing between 5k and 50k a month, with an offer, and you're looking to scale up — book a call on the link below. I'll run a business audit for you to see where you're at and where you should be at. I'll tell you if I can help you. If I can't, you'll still leave with some value on how to scale up your current offer.

Alright, peace y'all.`,
    section: "close",
  },
];
