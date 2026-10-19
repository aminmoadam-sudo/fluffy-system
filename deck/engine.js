/* =====================================================================
   DECK ENGINE — renderer, navigation, two-window sync, print.
   Content lives in slides.js; nothing here changes when slides change.

   Sync model: the slide window (index.html) owns the state. The presenter
   (index.html#presenter, opened with window.open on P) talks to it through
   window.opener + postMessage only. Presenter keys send commands; the
   slide window applies them and posts the new state back. The presenter
   pings once a second so either window can reload and re-link.
   ===================================================================== */
(function () {
  'use strict';

  const W = 1920, H = 1080;
  const FADE_MS = 150;              // slide and build transition; 0 = instant cut
  const NS = 'deck-sync-v1';        // tag on every message we send or accept
  const PING_MS = 1000;             // presenter heartbeat while linked
  const RELINK_MS = 150;            // presenter heartbeat while waiting to (re)link
  const LINK_TIMEOUT_MS = 2500;
  const IS_PRESENTER = location.hash === '#presenter';
  const TYPES = ['image', 'statement', 'diagram', 'stat', 'section'];
  const LAYOUTS = ['flow', 'rows', 'ladder', 'html'];

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  const pad2 = n => String(n).padStart(2, '0');
  function fmt(sec) {
    const s = Math.max(0, Math.floor(sec));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return h ? `${h}:${pad2(m)}:${pad2(r)}` : `${m}:${pad2(r)}`;
  }
  function parseRatio(r) {
    const [a, b] = String(r || '16:9').split(/[:/x]/).map(Number);
    return a > 0 && b > 0 ? a / b : 16 / 9;
  }
  const sectionIndex = key => SECTIONS.findIndex(s => s.key === key);
  const mediaSrc = m => 'images/' + m.file.split('/').map(encodeURIComponent).join('/');

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  }

  /* ------------------------------------------------------------------
     Validation — problems go to the console and the presenter window,
     never to the slide window.
     ------------------------------------------------------------------ */
  function validate() {
    const problems = [];
    SLIDES.forEach((s, i) => {
      const n = `Slide ${i + 1}`;
      const c = s.content || {};
      if (!TYPES.includes(s.type)) problems.push(`${n}: unknown type "${s.type}"`);
      if (s.type === 'image' && !MEDIA[s.image]) problems.push(`${n}: image "${s.image}" is not in MEDIA`);
      if (s.type === 'diagram' && !LAYOUTS.includes(c.layout)) problems.push(`${n}: diagram layout "${c.layout}" is not one of ${LAYOUTS.join(', ')}`);
      if (s.section && sectionIndex(s.section) < 0) problems.push(`${n}: section "${s.section}" is not in SECTIONS`);
      if (s.type === 'section' && sectionIndex(c.stage || s.section) < 0) problems.push(`${n}: section slide has no valid stage`);
    });
    problems.forEach(p => console.warn('[deck] ' + p));
    return problems;
  }

  /* ------------------------------------------------------------------
     Builds (staged reveal)
     ------------------------------------------------------------------ */
  const stepCache = new WeakMap();
  function stepsOf(slide) {
    if (!slide || slide.type !== 'diagram') return 0;
    if (stepCache.has(slide)) return stepCache.get(slide);
    const c = slide.content || {};
    let max = 0;
    if (c.layout === 'html') {
      const t = document.createElement('template');
      t.innerHTML = c.html || '';
      t.content.querySelectorAll('[data-step]').forEach(n => { max = Math.max(max, Number(n.dataset.step) || 0); });
    } else {
      max = Math.max(0, (c.items || []).length - 1);
    }
    stepCache.set(slide, max);
    return max;
  }
  function applyStep(root, step) {
    root.querySelectorAll('[data-step]').forEach(n => {
      const k = Number(n.dataset.step);
      n.classList.toggle('on', k <= step);
      n.classList.toggle('cur', k === step); // the build just revealed
    });
  }

  /* ------------------------------------------------------------------
     Media — preloaded once, so re-renders never flash the placeholder.
     ------------------------------------------------------------------ */
  const IMG = {};
  function preloadMedia() {
    Object.keys(MEDIA).forEach(key => {
      const m = MEDIA[key];
      const rec = IMG[key] = { state: m.file ? 'pending' : 'missing', waiters: [] };
      if (!m.file) return;
      const img = new Image();
      img.onload = () => { rec.state = 'ok'; rec.waiters.splice(0).forEach(fn => fn()); };
      img.onerror = () => { rec.state = 'missing'; rec.waiters.length = 0; };
      img.src = mediaSrc(m);
    });
  }
  function fillImage(slot, m) {
    const img = el('img');
    img.alt = '';
    img.draggable = false;
    img.src = mediaSrc(m);
    slot.replaceChildren(img);
    slot.classList.add('loaded');
  }

  /* ------------------------------------------------------------------
     Renderers — one per slide type. Each fills a 1920×1080 .slide root.
     ------------------------------------------------------------------ */
  function fitBox(node, max, min) {
    node.dataset.fit = '';
    node.dataset.fitMax = max;
    node.dataset.fitMin = min;
    return node;
  }

  const RENDER = {
    statement(root, slide, c) {
      root.appendChild(fitBox(el('div', 'statement-text', c.text || ''), 130, 90));
    },

    image(root, slide, c) {
      const key = slide.image;
      const m = MEDIA[key] || { file: '', ratio: '16:9', label: `Missing MEDIA key "${key}"` };
      const ratio = parseRatio(m.ratio);
      let w = W, h = W / ratio;
      if (h > H) { h = H; w = H * ratio; }
      const slot = el('div', 'img-slot');
      slot.style.width = w + 'px';
      slot.style.height = h + 'px';

      const rec = IMG[key];
      if (rec && rec.state === 'ok') {
        fillImage(slot, m);
      } else {
        const ph = el('div', 'img-placeholder');
        ph.append(
          el('div', 'ph-label', m.label || key),
          el('div', 'ph-meta', `images/${m.file || '—'}  ·  ${m.ratio || '16:9'}`)
        );
        slot.appendChild(ph);
        if (rec && rec.state === 'pending') rec.waiters.push(() => fillImage(slot, m));
      }
      root.appendChild(slot);
      if (c.caption) root.appendChild(el('div', 'img-caption', c.caption));
    },

    diagram(root, slide, c) {
      if (c.title) root.appendChild(el('div', 'diagram-title', c.title));
      const body = el('div', 'diagram-body');
      const items = c.items || [];
      if (c.layout === 'flow') {
        const flow = fitBox(el('div', 'flow'), 80, 40);
        items.forEach((item, i) => {
          if (i > 0) {
            const arrow = el('div', 'flow-arrow');
            arrow.dataset.step = i;
            flow.appendChild(arrow);
          }
          const node = el('div', 'flow-node');
          node.dataset.step = i;
          node.append(el('div', 'flow-num', pad2(i + 1)), el('div', 'flow-label', item));
          flow.appendChild(node);
        });
        body.appendChild(flow);
      } else if (c.layout === 'rows') {
        const rows = el('div', 'rows');
        items.forEach((item, i) => {
          const row = el('div', 'row');
          row.dataset.step = i;
          row.append(el('div', 'row-num', pad2(i + 1)), el('div', 'row-text', item));
          rows.appendChild(row);
        });
        body.appendChild(rows);
      } else if (c.layout === 'ladder') {
        // First item is the bottom rung; each build climbs one rung.
        const ladder = el('div', 'ladder');
        items.forEach((item, i) => {
          const rung = el('div', 'rung');
          rung.dataset.step = i;
          rung.append(el('div', 'rung-bar'), el('div', 'rung-num', pad2(i + 1)), el('div', 'rung-label', item));
          ladder.appendChild(rung);
        });
        body.appendChild(ladder);
      } else if (c.layout === 'html') {
        body.classList.add('diagram-html');
        body.innerHTML = c.html || '';
      }
      root.appendChild(body);
    },

    stat(root, slide, c) {
      root.appendChild(fitBox(el('div', 'stat-value', c.value != null ? String(c.value) : ''), 320, 200));
      if (c.label) root.appendChild(el('div', 'stat-label', c.label));
      if (c.source) root.appendChild(el('div', 'stat-source', c.source));
    },

    section(root, slide, c) {
      const lit = sectionIndex(c.stage || slide.section);
      const spine = fitBox(el('div', 'spine'), 104, 64);
      SECTIONS.forEach((s, i) => {
        if (i > 0) spine.appendChild(el('div', 'spine-arrow'));
        spine.appendChild(el('div', 'spine-stage' + (i === lit ? ' lit' : i < lit ? ' past' : ''), s.label));
      });
      root.appendChild(spine);
    },
  };

  function buildSlide(slide, step, isStatic) {
    const root = el('div', `slide t-${slide.type}` + (isStatic ? ' static' : ''));
    const render = RENDER[slide.type];
    if (render) render(root, slide, slide.content || {});
    applyStep(root, step);
    return root;
  }

  // Shrink [data-fit] boxes until they fit their container's content width.
  // Must run after the slide is in the DOM (layout is in unscaled px).
  function fitAll(root) {
    root.querySelectorAll('[data-fit]').forEach(node => {
      const parent = node.parentElement;
      const cs = getComputedStyle(parent);
      const avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const max = Number(node.dataset.fitMax), min = Number(node.dataset.fitMin);
      node.classList.remove('wrap');
      let size = max;
      node.style.fontSize = size + 'px';
      while (node.offsetWidth > avail && size > min) {
        size = Math.max(min, size - 2);
        node.style.fontSize = size + 'px';
      }
      if (node.offsetWidth > avail) {
        // Too long for one line even at the minimum: two balanced lines, sized between min and max.
        node.classList.add('wrap');
        node.style.fontSize = Math.round((max + min) / 2) + 'px';
      }
    });
  }

  // Mount a full-size slide into a box and scale it to the box's width.
  function mountScaled(box, slide, step) {
    const node = buildSlide(slide, step, true);
    box.replaceChildren(node);
    fitAll(node);
    scaleInto(box);
    return node;
  }
  function scaleInto(box) {
    const node = box.querySelector(':scope > .slide');
    if (node) node.style.transform = `scale(${box.clientWidth / W})`;
  }

  /* ------------------------------------------------------------------
     Navigation — pure functions on a state object, shared by both windows.
     ------------------------------------------------------------------ */
  function newState() {
    return { index: 0, step: 0, blank: false, timerStart: Date.now() };
  }
  function move(state, dir) {
    const max = stepsOf(SLIDES[state.index]);
    if (dir > 0) {
      if (state.step < max) state.step++;
      else if (state.index < SLIDES.length - 1) { state.index++; state.step = 0; }
      else return false;
    } else {
      if (state.step > 0) state.step--;
      else if (state.index > 0) { state.index--; state.step = stepsOf(SLIDES[state.index]); }
      else return false;
    }
    return true;
  }
  function applyCmd(state, cmd) {
    switch (cmd.do) {
      case 'next':
      case 'prev':
        // While blanked, the first nav press only brings the screen back.
        if (state.blank) { state.blank = false; return true; }
        return move(state, cmd.do === 'next' ? 1 : -1);
      case 'first':
        state.index = 0; state.step = 0; state.blank = false; return true;
      case 'last':
        state.index = SLIDES.length - 1; state.step = stepsOf(SLIDES[state.index]); state.blank = false; return true;
      case 'goto': {
        const i = Math.max(0, Math.min(SLIDES.length - 1, cmd.index | 0));
        state.index = i; state.step = 0; state.blank = false; return true;
      }
      case 'blank':
        state.blank = !state.blank; return true;
      case 'timer':
        state.timerStart = Date.now(); return true;
    }
    return false;
  }
  function peekNext(state) {
    const s = Object.assign({}, state, { blank: false });
    return move(s, 1) ? s : null;
  }

  function keyToCmd(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return null; // leave browser shortcuts (print, reload) alone
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': return 'next';
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': return 'prev';
      case ' ': return e.shiftKey ? 'prev' : 'next';
      case 'Home': return 'first';
      case 'End': return 'last';
      case 'b': case 'B': case '.': return 'blank';   // many clickers send "." or "b" for blank
      case 't': case 'T': return 'timer';
      case 'f': case 'F': return 'fullscreen';
      case 'p': case 'P': return 'presenter';
      case 'Escape': case 'g': case 'G': return 'grid';
    }
    return null;
  }

  /* ------------------------------------------------------------------
     Grid overview — used by both windows. Each window's grid is local:
     opening it in the presenter is private to the presenter.
     ------------------------------------------------------------------ */
  function Grid(getIndex, onPick) {
    const root = el('div');
    root.id = 'grid';
    document.body.appendChild(root);
    let open = false, sel = 0, wraps = [];

    function highlight() {
      wraps.forEach((w, i) => w.classList.toggle('sel', i === sel));
      if (wraps[sel]) wraps[sel].scrollIntoView({ block: 'nearest' });
    }
    function rescale() { wraps.forEach(w => scaleInto(w.querySelector('.thumb'))); }
    function show() {
      open = true;
      root.classList.add('open');
      root.replaceChildren();
      wraps = SLIDES.map((slide, i) => {
        const wrap = el('div', 'thumb-wrap');
        const box = el('div', 'thumb');
        wrap.append(el('div', 'thumb-num', pad2(i + 1)), box);
        wrap.addEventListener('click', () => { hide(); onPick(i); });
        root.appendChild(wrap);
        mountScaled(box, slide, stepsOf(slide));
        return wrap;
      });
      sel = getIndex();
      highlight();
    }
    function hide() { open = false; root.classList.remove('open'); root.replaceChildren(); wraps = []; }
    function columns() {
      if (!wraps.length) return 1;
      const top = wraps[0].offsetTop;
      const n = wraps.findIndex(w => w.offsetTop !== top);
      return n < 0 ? wraps.length : n;
    }
    // Returns true when the grid consumed the key.
    function key(e) {
      if (!open) return false;
      const cols = columns();
      switch (e.key) {
        case 'Escape': case 'g': case 'G': hide(); break;
        case 'ArrowRight': sel = Math.min(wraps.length - 1, sel + 1); highlight(); break;
        case 'ArrowLeft': sel = Math.max(0, sel - 1); highlight(); break;
        case 'ArrowDown': sel = Math.min(wraps.length - 1, sel + cols); highlight(); break;
        case 'ArrowUp': sel = Math.max(0, sel - cols); highlight(); break;
        case 'Enter': case ' ': { const i = sel; hide(); onPick(i); break; }
        default: return false;
      }
      e.preventDefault();
      return true;
    }
    window.addEventListener('resize', () => { if (open) rescale(); });
    return { show, hide, key, toggle: () => (open ? hide() : show()), isOpen: () => open };
  }

  /* ------------------------------------------------------------------
     Print — every slide, fully built, one per page. Notes never rendered.
     ------------------------------------------------------------------ */
  function buildPrint() {
    const root = el('div');
    root.id = 'print';
    document.body.appendChild(root);
    SLIDES.forEach(slide => {
      const page = el('div', 'print-page');
      const node = buildSlide(slide, stepsOf(slide), true);
      page.appendChild(node);
      root.appendChild(page);
      fitAll(node);
    });
  }

  /* ==================================================================
     SLIDE WINDOW — what the audience sees. Slides only.
     ================================================================== */
  function startSlideWindow() {
    const viewport = el('div');
    viewport.id = 'viewport';
    const stage = el('div');
    stage.id = 'stage';
    viewport.appendChild(stage);
    const blank = el('div');
    blank.id = 'blank';
    document.body.append(viewport, blank);

    function fitStage() {
      const k = Math.min(innerWidth / W, innerHeight / H);
      stage.style.transform = `translate(-50%, -50%) scale(${k})`;
    }
    window.addEventListener('resize', fitStage);
    fitStage();

    const state = newState();
    let fresh = true;      // nothing has happened here yet: a re-linking presenter may restore position
    let presenter = null;  // WindowProxy of the presenter, once known
    let current = null;    // { index, node }

    function render() {
      blank.classList.toggle('on', state.blank);
      if (current && current.index === state.index) {
        applyStep(current.node, state.step);
        return;
      }
      stage.querySelectorAll('.slide.leaving').forEach(n => n.remove());
      const node = buildSlide(SLIDES[state.index], state.step, false);
      const old = current && current.node;
      if (old && FADE_MS > 0) node.classList.add('entering');
      stage.appendChild(node);
      fitAll(node);
      if (old) {
        old.classList.add('leaving');
        if (FADE_MS > 0) {
          void node.offsetWidth; // commit the transparent frame before fading in
          node.classList.remove('entering');
          setTimeout(() => old.remove(), FADE_MS + 50);
        } else {
          old.remove();
        }
      }
      current = { index: state.index, node };
    }

    function post(msg) {
      if (!presenter || presenter.closed) return;
      try { presenter.postMessage(Object.assign({ ns: NS }, msg), '*'); } catch (err) { /* window gone */ }
    }
    const sendState = () => post({ type: 'state', state });

    function commit() { fresh = false; render(); sendState(); }
    function run(cmd) { if (applyCmd(state, cmd)) commit(); }

    function openPresenter() {
      if (presenter && !presenter.closed) { presenter.focus(); return; }
      const url = location.href.split('#')[0] + '#presenter';
      const w = window.open(url, 'deck-presenter', 'popup,width=1280,height=800');
      if (w) presenter = w;
      else console.warn('[deck] The browser blocked the presenter window. Allow pop-ups for this file and press P again.');
    }

    window.addEventListener('message', e => {
      const m = e.data;
      if (!m || m.ns !== NS || !e.source || e.source === window) return;
      presenter = e.source; // adopt whoever is talking to us; this is how we re-link after a reload
      if (fresh && m.state) {
        // This window was reloaded mid-talk: pick up where the presenter says we were.
        state.index = Math.max(0, Math.min(SLIDES.length - 1, m.state.index | 0));
        state.step = Math.max(0, Math.min(stepsOf(SLIDES[state.index]), m.state.step | 0));
        state.blank = !!m.state.blank;
        if (m.state.timerStart) state.timerStart = m.state.timerStart;
        fresh = false;
        render();
      }
      if (m.type === 'cmd' && m.cmd) run(m.cmd);
      else sendState();
    });
    window.addEventListener('pagehide', () => post({ type: 'bye' }));

    const grid = Grid(() => state.index, i => run({ do: 'goto', index: i }));

    window.addEventListener('keydown', e => {
      if (grid.key(e)) return;
      const cmd = keyToCmd(e);
      if (!cmd) return;
      e.preventDefault();
      if (cmd === 'presenter') openPresenter();
      else if (cmd === 'fullscreen') toggleFullscreen();
      else if (cmd === 'grid') grid.toggle();
      else run({ do: cmd });
    });

    // Hide the cursor when it is not moving.
    let idleTimer;
    function wake() {
      document.body.classList.remove('idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => document.body.classList.add('idle'), 1500);
    }
    window.addEventListener('mousemove', wake);
    wake();

    render();
  }

  /* ==================================================================
     PRESENTER WINDOW — private. Previews, notes, timer, pacing.
     ================================================================== */
  function startPresenter() {
    document.title = 'Presenter · ' + document.title;
    const problems = validate();

    const ui = {};
    const root = el('div', 'p-root');
    root.innerHTML = `
      <div class="p-current">
        <div class="p-label">Current</div>
        <div class="preview" data-ref="cur"></div>
      </div>
      <div class="p-notes-wrap">
        <div class="p-label">Notes</div>
        <div class="p-warn" data-ref="warn"></div>
        <div class="p-notes" data-ref="notes"></div>
      </div>
      <div class="p-side">
        <div>
          <div class="p-label" data-ref="nextLabel">Next</div>
          <div class="preview" data-ref="next"></div>
        </div>
        <div class="p-meta">
          <div>
            <div class="p-label">Elapsed</div>
            <div class="p-timer" data-ref="timer">0:00</div>
          </div>
          <div class="p-counter"><span data-ref="counter"></span><span class="p-build" data-ref="build"></span></div>
          <div>
            <div class="p-section" data-ref="section"></div>
            <div class="p-range" data-ref="range"></div>
            <div class="p-pace" data-ref="pace"></div>
          </div>
        </div>
        <div class="p-foot">
          <div class="p-link" data-ref="link"></div>
          <div class="p-keys">→ / Space next · ← back · B blank · T reset timer · Esc or G grid (private) · F fullscreen</div>
        </div>
      </div>`;
    document.body.appendChild(root);
    root.querySelectorAll('[data-ref]').forEach(n => { ui[n.dataset.ref] = n; });
    const blankTag = el('div', 'p-blank', 'Screen blanked · B to return');
    ui.warn.textContent = problems.join('\n');

    let state = newState();
    let haveState = false;
    let linkedAt = 0;
    let lastKey = '';
    const main = window.opener;

    // Every message carries our last known state, so a reloaded slide window
    // can restore position from whichever message reaches it first.
    function post(msg) {
      if (!main || main.closed) return false;
      try {
        main.postMessage(Object.assign({ ns: NS, state: haveState ? state : null }, msg), '*');
        return true;
      } catch (err) { return false; }
    }
    const linked = () => Date.now() - linkedAt < LINK_TIMEOUT_MS;

    function command(cmd) {
      if (linked()) post({ type: 'cmd', cmd });
      else if (applyCmd(state, cmd)) { haveState = true; render(); } // rehearsal mode: no slide window
    }

    function renderPreviews() {
      const slide = SLIDES[state.index];
      mountScaled(ui.cur, slide, state.step);
      ui.cur.appendChild(blankTag);

      const nx = peekNext(state);
      if (nx) {
        mountScaled(ui.next, SLIDES[nx.index], nx.step);
        const max = stepsOf(SLIDES[nx.index]);
        ui.nextLabel.textContent = nx.index === state.index
          ? `Next · build ${nx.step + 1} of ${max + 1}`
          : `Next · slide ${nx.index + 1}`;
      } else {
        ui.next.replaceChildren(el('div', 'preview-end', 'End of deck'));
        ui.nextLabel.textContent = 'Next';
      }

      const notes = (slide.notes || '').trim();
      ui.notes.textContent = notes || 'No notes for this slide.';
      ui.notes.classList.toggle('empty', !notes);
      ui.notes.scrollTop = 0;

      ui.counter.textContent = `${state.index + 1} / ${SLIDES.length}`;
      const max = stepsOf(slide);
      ui.build.textContent = max ? `build ${state.step + 1} of ${max + 1}` : '';
    }

    function renderClock() {
      const elapsed = (Date.now() - state.timerStart) / 1000;
      ui.timer.textContent = fmt(elapsed);

      const slide = SLIDES[state.index];
      const si = sectionIndex(slide.section);
      if (si < 0) {
        ui.section.textContent = '';
        ui.range.textContent = '';
        ui.pace.textContent = '';
      } else {
        let start = 0;
        for (let k = 0; k < si; k++) start += SECTIONS[k].minutes * 60;
        const end = start + SECTIONS[si].minutes * 60;
        const total = SECTIONS.reduce((t, s) => t + s.minutes * 60, 0);
        ui.section.textContent = SECTIONS[si].label;
        ui.range.textContent = `Target ${fmt(start)}–${fmt(end)} of ${fmt(total)}`;
        let text, over = false;
        if (elapsed > end) { text = `Over by ${fmt(elapsed - end)}`; over = true; }
        else if (elapsed < start) text = `Ahead by ${fmt(start - elapsed)}`;
        else text = `${fmt(end - elapsed)} left in section`;
        ui.pace.textContent = text;
        ui.pace.classList.toggle('over', over);
      }

      const up = linked();
      ui.link.classList.toggle('down', !up);
      ui.link.textContent = up
        ? 'Linked to slide window'
        : !main
          ? 'Not linked: opened directly. Open index.html and press P there.'
          : 'Not linked: slide window closed or reloading. Keys drive this window only.';
    }

    function render() {
      const key = state.index + ':' + state.step;
      if (key !== lastKey) { lastKey = key; renderPreviews(); }
      blankTag.classList.toggle('on', state.blank);
      renderClock();
    }

    window.addEventListener('message', e => {
      const m = e.data;
      if (!m || m.ns !== NS || (main && e.source !== main)) return;
      if (m.type === 'state' && m.state) {
        state = Object.assign(newState(), m.state);
        haveState = true;
        linkedAt = Date.now();
        render();
      } else if (m.type === 'bye') {
        linkedAt = 0;
        renderClock();
      }
    });

    const grid = Grid(() => state.index, i => command({ do: 'goto', index: i }));

    window.addEventListener('keydown', e => {
      if (grid.key(e)) return;
      const cmd = keyToCmd(e);
      if (!cmd) return;
      e.preventDefault();
      if (cmd === 'presenter') return;
      if (cmd === 'fullscreen') toggleFullscreen();
      else if (cmd === 'grid') grid.toggle();
      else command({ do: cmd });
    });

    function rescale() { scaleInto(ui.cur); scaleInto(ui.next); }
    if (window.ResizeObserver) new ResizeObserver(rescale).observe(ui.cur);
    window.addEventListener('resize', rescale);

    // Heartbeat: slow while linked, fast while waiting for the slide window to come back.
    (function ping() {
      post({ type: 'ping' });
      setTimeout(ping, linked() ? PING_MS : RELINK_MS);
    })();
    setInterval(renderClock, 250);

    render();
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  function boot() {
    document.documentElement.style.setProperty('--fade', FADE_MS + 'ms');
    if (!IS_PRESENTER) validate();
    preloadMedia();
    buildPrint();
    if (IS_PRESENTER) startPresenter();
    else startSlideWindow();
  }

  // Wait for the bundled font so text fitting measures real glyphs.
  const fontReady = document.fonts && document.fonts.load
    ? document.fonts.load('600 100px InterDeck').catch(() => {})
    : Promise.resolve();
  Promise.race([fontReady, new Promise(r => setTimeout(r, 1500))]).then(boot);
})();
