// Screen router + menu. No build step: open index.html in a browser.
(() => {
  const SAVE_KEY = 'rfag.save.v1';
  const $ = (s) => document.querySelector(s);

  // ---------- Save data ----------
  const defaultSave = { cleared: {}, settings: { music: 70, sfx: 80, shake: true } };
  function load() {
    try { return { ...defaultSave, ...JSON.parse(localStorage.getItem(SAVE_KEY)) }; }
    catch { return structuredClone(defaultSave); }
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state.save)); } catch {} }

  const state = { screen: 'title', currentGame: null, selected: 0, save: load() };

  // ---------- Screens ----------
  function show(name) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active', 'fade-in'));
    const el = $('#screen-' + name);
    el.classList.add('active', 'fade-in');
    state.screen = name;
    if (name === 'menu') { renderMenu(); focusCard(state.selected); }
    if (name === 'title') $('#btn-start').focus();
  }

  // ---------- Overlays ----------
  function openOverlay(id) { closeOverlays(); $('#overlay-' + id).classList.add('open'); $('#overlay-' + id + ' .btn').focus(); }
  function closeOverlays() { document.querySelectorAll('.overlay.open').forEach((o) => o.classList.remove('open')); }
  const overlayOpen = () => !!document.querySelector('.overlay.open');

  // ---------- Menu ----------
  function renderMenu() {
    const grid = $('#game-grid');
    grid.innerHTML = '';
    GAMES.forEach((g, i) => {
      const done = !!state.save.cleared[g.id];
      const card = document.createElement('button');
      card.className = 'card';
      card.setAttribute('role', 'listitem');
      card.style.setProperty('--c', g.color);
      card.dataset.index = i;
      card.innerHTML = `
        <div class="card-thumb">
          <span class="card-hook">${g.adHook}</span>
          <span>${g.emoji}</span>
          <span class="card-num">#${i + 1}</span>
        </div>
        <div class="card-body">
          <span class="card-name">${g.name}</span>
          <span class="card-tag">${g.tagline}</span>
          <span class="card-status ${done ? 'cleared' : ''}">${done ? '★ CLEARED' : '▶ PLAY'}</span>
        </div>`;
      card.addEventListener('click', () => openGame(i));
      card.addEventListener('focus', () => setSelected(i));
      card.addEventListener('mouseenter', () => setSelected(i));
      grid.appendChild(card);
    });
    const n = Object.keys(state.save.cleared).length;
    $('#clear-count').textContent = `🏆 ${n} / ${GAMES.length}`;
  }
  function setSelected(i) {
    state.selected = i;
    document.querySelectorAll('.card').forEach((c, j) => c.classList.toggle('selected', i === j));
  }
  function focusCard(i) {
    const cards = document.querySelectorAll('.card');
    i = (i + cards.length) % cards.length;
    setSelected(i);
    cards[i].focus();
  }
  function moveSelection(dx, dy) {
    const cards = [...document.querySelectorAll('.card')];
    // Work out columns from layout so arrow keys match the visible grid.
    const top0 = cards[0].offsetTop;
    const cols = cards.filter((c) => c.offsetTop === top0).length || 1;
    focusCard(Math.min(cards.length - 1, Math.max(0, state.selected + dx + dy * cols)));
  }

  // ---------- Game host (placeholder until real modules exist) ----------
  function openGame(i) {
    const g = GAMES[i];
    state.currentGame = g;
    $('#game-title').textContent = g.name;
    $('#game-stage').innerHTML = `
      <div class="placeholder">
        <div class="big">${g.emoji}</div>
        <h2>${g.name}</h2>
        <p>${g.genre} · coming soon</p>
        <button class="btn" data-action="debug-clear">MARK AS CLEARED (debug)</button>
      </div>`;
    show('game');
  }

  // ---------- Actions ----------
  const actions = {
    start: () => show('menu'),
    'back-title': () => show('title'),
    'back-menu': () => { closeOverlays(); show('menu'); },
    settings: () => openOverlay('settings'),
    credits: () => openOverlay('credits'),
    pause: () => openOverlay('pause'),
    restart: () => { closeOverlays(); openGame(state.selected); },
    'close-overlay': () => { closeOverlays(); if (state.screen === 'menu') focusCard(state.selected); },
    'reset-progress': () => { if (confirm('Reset all progress?')) { state.save.cleared = {}; save(); renderMenu(); } },
    'debug-clear': () => { state.save.cleared[state.currentGame.id] = true; save(); show('menu'); },
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action]');
    if (t && actions[t.dataset.action]) actions[t.dataset.action]();
  });

  // ---------- Keyboard ----------
  document.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'Escape') {
      if (overlayOpen()) return actions['close-overlay']();
      if (state.screen === 'game') return actions.pause();
      if (state.screen === 'menu') return show('title');
    }
    if (overlayOpen()) return;
    if (state.screen === 'title' && (k === 'Enter' || k === ' ')) { e.preventDefault(); return show('menu'); }
    if (state.screen === 'menu') {
      const map = { ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0], ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1] };
      if (map[k]) { e.preventDefault(); moveSelection(...map[k]); }
    }
  });

  // ---------- Settings wiring ----------
  const s = state.save.settings;
  $('#set-music').value = s.music; $('#set-sfx').value = s.sfx; $('#set-shake').checked = s.shake;
  $('#set-music').oninput = (e) => { s.music = +e.target.value; save(); };
  $('#set-sfx').oninput = (e) => { s.sfx = +e.target.value; save(); };
  $('#set-shake').onchange = (e) => { s.shake = e.target.checked; save(); };

  show('title');
})();
