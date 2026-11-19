// Screen router, menu, overlays, input and UI sounds. No build step: open index.html.
(() => {
  const SAVE_KEY = 'rfag.save.v1';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // ---------------- Save data ----------------
  const defaults = () => ({ cleared: {}, levels: {}, coins: 0, games: {}, settings: { music: 70, sfx: 80, shake: true } });
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
      const d = defaults();
      return raw ? { ...d, ...raw, settings: { ...d.settings, ...raw.settings } } : d;
    } catch { return defaults(); }
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state.save)); } catch {} }

  const state = { screen: 'title', selected: 0, busy: false, save: load() };

  // ---------------- UI sounds (Web Audio, no files) ----------------
  let ctx;
  function blip(freq = 520, dur = 0.08, type = 'square', slide = 1.6, gain = 1) {
    const vol = (state.save.settings.sfx / 100) * gain;
    if (!vol) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
      g.gain.setValueAtTime(0.12 * vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch {}
  }
  const sfx = {
    hover: () => blip(880, 0.04, 'triangle', 1.2),
    click: () => blip(440, 0.09, 'square', 2),
    back: () => blip(520, 0.1, 'square', 0.5),
    whoosh: () => blip(200, 0.25, 'sawtooth', 4),
  };

  // ---------------- Screens + wipe transition ----------------
  function show(name) {
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
    state.screen = name;
    if (name === 'menu') { renderMenu(); select(state.selected, false); }
    if (name === 'title') $('#btn-start').focus({ preventScroll: true });
  }
  function go(name, before) {
    if (state.busy) return;
    state.busy = true;
    const wipe = $('#wipe');
    sfx.whoosh();
    wipe.className = 'cover';
    setTimeout(() => {
      before && before();
      closeOverlays();
      show(name);
      wipe.className = 'uncover';
      setTimeout(() => { wipe.className = ''; state.busy = false; }, 380);
    }, 320);
  }

  // ---------------- Overlays ----------------
  function openOverlay(id) {
    closeOverlays();
    const o = $('#overlay-' + id);
    o.classList.add('open');
    o.querySelector('.btn, input').focus({ preventScroll: true });
  }
  function closeOverlays() { $$('.overlay.open').forEach((o) => o.classList.remove('open')); }
  const overlayOpen = () => !!$('.overlay.open');

  // ---------------- Menu ----------------
  const levelsDone = (g) => state.save.levels[g.id] || 0;
  const starStr = (g) => { const n = Math.round((levelsDone(g) / g.levels) * 3); return '★'.repeat(n) + '☆'.repeat(3 - n); };

  function renderMenu() {
    const list = $('#game-list');
    list.innerHTML = '';
    GAMES.forEach((g, i) => {
      const done = !!state.save.cleared[g.id];
      const t = document.createElement('button');
      t.className = 'tile';
      t.setAttribute('role', 'listitem');
      t.style.setProperty('--c', g.color);
      t.style.setProperty('--d', g.dark);
      t.innerHTML = `
        <span class="tile-thumb">${ART[g.id]}</span>
        <span class="tile-text"><span class="tile-num">GAME ${i + 1}</span><span class="tile-name">${g.name}</span></span>
        <span class="tile-badge ${done ? 'done' : ''}" title="${done ? 'Cleared' : 'Not cleared'}">${done ? '★' : '★'}</span>`;
      t.addEventListener('click', () => {
        if (matchMedia('(hover: hover)').matches) return play();
        select(i); // touch: first tap previews, PLAY button starts
        $('.menu-main').scrollTo({ top: 0, behavior: 'smooth' });
      });
      t.addEventListener('dblclick', play);
      t.addEventListener('mouseenter', () => select(i, false));
      list.appendChild(t);
    });
    $('#clear-count').textContent = `${Object.keys(state.save.cleared).length}/${GAMES.length}`;
    $('#coin-count').textContent = state.save.coins.toLocaleString();
  }

  function renderFeatured() {
    const g = GAMES[state.selected];
    const f = $('#featured');
    f.style.setProperty('--c', g.color);
    f.style.setProperty('--d', g.dark);
    const pct = Math.round((levelsDone(g) / g.levels) * 100);
    f.innerHTML = `
      <div class="feat-art">
        <span class="sticker">${g.adHook}</span>
        <span class="feat-ad">Ad ⓘ</span>
        ${ART[g.id]}
      </div>
      <div class="feat-info">
        <span class="feat-num">GAME ${state.selected + 1} · ${g.genre.toUpperCase()}</span>
        <h3 class="feat-name">${g.name}</h3>
        <p class="feat-tag">${g.tagline}</p>
        <div class="feat-meta"><span class="stars">${starStr(g)}</span>
          <span class="progress" title="${pct}%"><i style="width:${pct}%"></i></span>
          <span>${levelsDone(g)}/${g.levels}</span></div>
        <button class="btn btn-play b-green" data-action="play">PLAY ▶</button>
      </div>`;
  }

  function select(i, withSound = true) {
    const n = GAMES.length;
    i = ((i % n) + n) % n;
    const changed = i !== state.selected || !$('#featured').childElementCount;
    state.selected = i;
    $$('.tile').forEach((t, j) => t.classList.toggle('selected', i === j));
    if (changed) { renderFeatured(); if (withSound) sfx.hover(); }
  }

  // ---------------- Game host ----------------
  // A game listed with `scripts` in the registry is loaded on demand and must register
  // window.GAME_MODULES[id] = { create(stage, api) -> { pause(), resume(), destroy() } }.
  let current = null, mountToken = 0;
  const loaded = {};
  const loadScript = (src) => (loaded[src] ||= new Promise((res, rej) => {
    const el = document.createElement('script');
    el.src = src; el.onload = res;
    el.onerror = () => { loaded[src] = null; rej(new Error('Could not load ' + src)); };
    document.head.appendChild(el);
  }));
  function makeApi(g) {
    state.save.games ||= {};
    return {
      data: (state.save.games[g.id] ||= {}),
      get settings() { return state.save.settings; },
      save,
      blip,
      setProgress(n) { state.save.levels[g.id] = Math.max(0, Math.min(n, g.levels)); save(); },
      clear() { state.save.cleared[g.id] = true; state.save.levels[g.id] = g.levels; save(); },
    };
  }
  function unmountGame() {
    mountToken++;
    if (current) { try { current.destroy(); } catch (err) { console.error(err); } current = null; }
    $('#screen-game').classList.remove('live');
  }
  function mountGame(g) {
    unmountGame();
    const token = mountToken, stage = $('#game-stage');
    $('#game-title').textContent = g.name;
    if (!g.scripts) return mountPlaceholder(g);
    $('#screen-game').classList.add('live');
    stage.innerHTML = `<div class="game-loading"><svg viewBox="0 0 100 100"><use href="#blob" x="10" y="10" width="80" height="80" style="color:${g.color}"/></svg><span>LOADING…</span></div>`;
    g.scripts.reduce((p, src) => p.then(() => loadScript(src)), Promise.resolve())
      .then(() => {
        if (token !== mountToken || state.screen !== 'game') return;
        stage.innerHTML = '';
        document.activeElement?.blur?.();
        current = window.GAME_MODULES[g.id].create(stage, makeApi(g));
      })
      .catch((err) => {
        console.error(err);
        if (token !== mountToken) return;
        stage.innerHTML = `<div class="game-loading"><span>Couldn't start the game 😢</span><small>${String(err.message || err)}</small>
          <button class="btn b-blue" data-action="back-menu">◀ BACK</button></div>`;
      });
  }
  function play() {
    const g = GAMES[state.selected];
    sfx.click();
    go('game', () => mountGame(g));
  }
  function mountPlaceholder(g) {
      $('#game-stage').innerHTML = `
        <div class="wip">
          <div class="featured" style="--c:${g.color};--d:${g.dark}">
            <div class="feat-art">${ART[g.id]}<div class="tape"><span>UNDER CONSTRUCTION</span></div></div>
            <div class="wip-actions">
              <button class="btn b-blue" data-action="back-menu">◀ BACK</button>
              <button class="btn b-orange" data-action="debug-clear">DEBUG: CLEAR IT</button>
            </div>
          </div>
        </div>`;
  }

  // ---------------- Actions ----------------
  const actions = {
    start: () => { sfx.click(); go('menu'); },
    play,
    'back-title': () => { sfx.back(); go('title'); },
    'back-menu': () => { sfx.back(); go('menu', unmountGame); },
    settings: () => { sfx.click(); openOverlay('settings'); },
    credits: () => { sfx.click(); openOverlay('credits'); },
    wardrobe: () => { sfx.click(); openOverlay('wardrobe'); },
    pause: () => { sfx.click(); current?.pause(); openOverlay('pause'); },
    restart: () => { closeOverlays(); play(); },
    'close-overlay': () => {
      sfx.back(); closeOverlays();
      if (state.screen === 'menu') $$('.tile')[state.selected]?.focus({ preventScroll: true });
      if (state.screen === 'game') { document.activeElement?.blur?.(); current?.resume(); }
    },
    'reset-progress': (btn) => {
      // Two taps instead of confirm(): embedded viewers block browser dialogs.
      clearTimeout(btn._t);
      if (btn.dataset.armed !== '1') {
        btn.dataset.armed = '1'; btn.textContent = 'TAP AGAIN TO RESET';
        btn._t = setTimeout(() => { btn.dataset.armed = ''; btn.textContent = 'RESET PROGRESS'; }, 3000);
        return;
      }
      btn.dataset.armed = ''; btn.textContent = 'PROGRESS RESET ✓';
      btn._t = setTimeout(() => { btn.textContent = 'RESET PROGRESS'; }, 2000);
      const settings = state.save.settings;
      unmountGame();
      state.save = { ...defaults(), settings };
      save(); renderMenu(); select(state.selected, false); renderFeatured();
    },
    'debug-clear': () => {
      const g = GAMES[state.selected];
      state.save.cleared[g.id] = true;
      state.save.levels[g.id] = g.levels;
      state.save.coins += 500;
      save(); go('menu');
    },
    'fake-close': () => {
      blip(300, 0.15, 'square', 0.6);
      const chip = $('.ad-chip'), msg = $('#nice-try');
      chip.classList.remove('dodge'); msg.classList.remove('show');
      void chip.offsetWidth;
      chip.classList.add('dodge'); msg.classList.add('show');
    },
  };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action]');
    if (t && actions[t.dataset.action]) { e.stopPropagation(); return actions[t.dataset.action](t); }
    // "Press any button": any click on the title screen starts.
    if (state.screen === 'title' && !overlayOpen()) actions.start();
  });
  document.addEventListener('mouseover', (e) => {
    const b = e.target.closest('.btn');
    if (b && !b.contains(e.relatedTarget)) sfx.hover();
  });

  // ---------------- Keyboard ----------------
  document.addEventListener('keydown', (e) => {
    const k = e.key;
    if (state.busy) return;
    if (k === 'Escape') {
      if (overlayOpen()) return actions['close-overlay']();
      if (state.screen === 'game') return actions.pause();
      if (state.screen === 'menu') return actions['back-title']();
      return;
    }
    if (overlayOpen()) return;
    if (state.screen === 'title' && !['Tab', 'Shift', 'Alt', 'Control', 'Meta'].includes(k)) { e.preventDefault(); return actions.start(); }
    if (state.screen === 'menu') {
      const up = ['ArrowUp', 'w', 'W', 'ArrowLeft', 'a', 'A'], down = ['ArrowDown', 's', 'S', 'ArrowRight', 'd', 'D'];
      if (up.includes(k)) { e.preventDefault(); select(state.selected - 1); $$('.tile')[state.selected].focus({ preventScroll: false }); }
      if (down.includes(k)) { e.preventDefault(); select(state.selected + 1); $$('.tile')[state.selected].focus({ preventScroll: false }); }
      if ((k === 'Enter' || k === ' ') && document.activeElement?.classList.contains('tile')) { e.preventDefault(); play(); }
    }
  });

  // Pause the game when the tab is hidden; save when the page closes.
  const autoPause = () => { if (state.screen === 'game' && current && !overlayOpen() && !state.busy) actions.pause(); };
  document.addEventListener('visibilitychange', () => document.hidden && autoPause());
  window.addEventListener('pagehide', () => save());

  // ---------------- Settings wiring ----------------
  const s = state.save.settings;
  $('#set-music').value = s.music; $('#set-sfx').value = s.sfx; $('#set-shake').checked = s.shake;
  $('#set-music').oninput = (e) => { s.music = +e.target.value; save(); };
  $('#set-sfx').oninput = (e) => { s.sfx = +e.target.value; save(); };
  $('#set-sfx').onchange = () => sfx.click();
  $('#set-shake').onchange = (e) => { s.shake = e.target.checked; save(); sfx.click(); };

  show('title');
})();
