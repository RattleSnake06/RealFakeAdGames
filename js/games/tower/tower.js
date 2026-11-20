/* =====================================================================
   NUMBER TOWER — Game 2 (number puzzle tower climbing)
   125 fixed levels (js/games/tower/levels.js, made by tools/gen-tower-levels.js),
   rules in logic.js. Coins from stars buy outfits only — never power.
   ===================================================================== */
(() => {
  'use strict';
  const TL = window.TowerLogic;
  const LEVELS = window.TOWER_LEVELS;
  const WORLDS = window.TOWER_WORLDS;

  // ---------------------------------------------------------------- look & feel
  const THEMES = [
    { sky: ['#4fb8ff', '#e9fbff'], ground: '#5cc25a', tower: '#c3bce3', room: '#6fb2ff', brick: '#5a9ef0', foe: '#7bd34a', icon: '🌿', roofA: '#6a8cff', roofB: '#ff4f7b', flag: '#ffe14d' },
    { sky: ['#3f63b8', '#e9f7ff'], ground: '#f4fbff', tower: '#e2edf9', room: '#a6d4ff', brick: '#8cc2f2', foe: '#5aa8f0', icon: '❄️', roofA: '#5aa8f0', roofB: '#3a6fd0', flag: '#5dffb4', snow: true },
    { sky: ['#4a0f24', '#ffc56b'], ground: '#2e1a20', tower: '#5e3530', room: '#ff9b6b', brick: '#e87a4e', foe: '#ff4060', icon: '🔥', roofA: '#3a2026', roofB: '#2a1418', flag: '#ff6a24' },
    { sky: ['#0e0420', '#6a3aa0'], ground: '#2a1846', tower: '#4f4275', room: '#8f72d6', brick: '#7c60c4', foe: '#a6ffcf', icon: '💀', roofA: '#2e1650', roofB: '#1d0e33', flag: '#a6ffcf' },
    { sky: ['#ff9fda', '#fff5d8'], ground: '#ffffff', tower: '#fff6e2', room: '#ffe08a', brick: '#f5c84f', foe: '#ffffff', icon: '✨', roofA: '#ffc21c', roofB: '#ff9fda', flag: '#ffffff' },
  ];
  const COLORS = [
    { id: 'blue', name: 'Sky', c: '#2fb4ff', price: 0 }, { id: 'pink', name: 'Bubblegum', c: '#ff7ab8', price: 40 },
    { id: 'green', name: 'Lime', c: '#3ccf6e', price: 40 }, { id: 'orange', name: 'Tangerine', c: '#ff9a3d', price: 60 },
    { id: 'purple', name: 'Grape', c: '#8d5bff', price: 80 }, { id: 'white', name: 'Marshmallow', c: '#f4f2ff', price: 100 },
    { id: 'black', name: 'Shadow', c: '#3b3552', price: 150 }, { id: 'gold', name: 'Golden', c: '#ffc330', price: 250 },
  ];
  const HATS = [
    { id: 'none', name: 'No hat', price: 0 }, { id: 'cap', name: 'Cap', price: 50 }, { id: 'party', name: 'Party hat', price: 60 },
    { id: 'tophat', name: 'Top hat', price: 100 }, { id: 'wizard', name: 'Wizard hat', price: 120 }, { id: 'viking', name: 'Viking helm', price: 150 },
    { id: 'crown', name: 'Crown', price: 250 }, { id: 'halo', name: 'Halo', price: 400 },
  ];
  const OL = '#2a1650';
  const fmtN = (n) => (n >= 1e6 ? (n / 1e6).toFixed(n < 1e7 ? 2 : 1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(n < 1e5 ? 1 : 0) + 'K' : String(n));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------------------------------------------------------------- SVG art
  // the hero is a caped stick figure; every world has its own creature, and the boss is a dragon
  function heroSVG(outfit) {
    const col = (COLORS.find((x) => x.id === outfit.color) || COLORS[0]).c;
    return `<svg class="nt-hero-svg" viewBox="-40 -150 92 154" overflow="visible" aria-hidden="true">${window.STICK.hero({ color: col, hat: outfit.hat })}</svg>`;
  }
  const FOES = ['goblin', 'yeti', 'imp', 'skeleton', 'knight'];
  const DRAGONS = [
    { color: '#ff4f7b', wing: '#7a1f2b' }, { color: '#5aa8f0', wing: '#2a4f9a', belly: '#e9f8ff' },
    { color: '#ff6a24', wing: '#4a0f24' }, { color: '#7c4dd6', wing: '#2e1650', belly: '#a6ffcf' },
    { color: '#ffc21c', wing: '#ffffff', belly: '#fff6e2' },
  ];
  function monsterSVG(world, o = {}) {
    const ST = window.STICK;
    const tint = world === 0 || world === 2 ? { color: THEMES[world].foe } : {};
    const art = o.boss ? ST.creature('dragon', DRAGONS[world]) : ST.creature(FOES[world], tint) + ST.gear(o.ab);
    return `<svg viewBox="0 0 100 100" overflow="visible" aria-hidden="true">${art}</svg>`;
  }
  function gateSVG(op) {
    if (op === '%') return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 92 C22 92 16 66 30 46 C32 60 40 62 40 54 C40 36 52 26 56 8 C66 30 84 44 80 66 C78 82 68 92 50 92Z" fill="#ff6a24" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/><path d="M50 84 C38 84 36 72 42 64 C44 70 48 70 48 66 C48 58 54 54 56 46 C62 58 68 66 64 76 C62 82 56 84 50 84Z" fill="#ffe14d"/></svg>`;
    if (op === '-') return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="40" y="6" width="20" height="18" rx="4" fill="#c77b3c" stroke="${OL}" stroke-width="5"/><path d="M42 24 V36 Q16 46 16 68 Q16 94 50 94 Q84 94 84 68 Q84 46 58 36 V24 Z" fill="#b23cff" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>${window.STICK.skull(50, 66, 1.15)}</svg>`;
    const bad = op === '/';
    const blade = bad ? '#c2453e' : op === 'x' ? '#e6f3ff' : '#cfe9ff';
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><g transform="rotate(${bad ? 35 : -35} 50 50)">
      <path d="M44 70 L44 14 L50 2 L56 14 L56 70 Z" fill="${blade}" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M50 10 V66" stroke="#fff" stroke-width="3" opacity=".7"/>
      <rect x="28" y="66" width="44" height="12" rx="5" fill="${bad ? '#5d2fd1' : '#ffc21c'}" stroke="${OL}" stroke-width="5"/>
      <rect x="44" y="76" width="12" height="20" rx="4" fill="#8a4a20" stroke="${OL}" stroke-width="5"/></g></svg>`;
  }
  const ICONS = {
    key: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="32" cy="50" r="20" fill="#ffc21c" stroke="${OL}" stroke-width="6"/><circle cx="32" cy="50" r="7" fill="${THEMES[0].room}" stroke="${OL}" stroke-width="4"/><path d="M50 50 H92 V64 M78 50 V62" fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 50 H92 V64 M78 50 V62" fill="none" stroke="#ffc21c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    torch: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M42 50 L46 96 H54 L58 50 Z" fill="#8a4a20" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/><rect x="36" y="44" width="28" height="10" rx="3" fill="#b9c3d6" stroke="${OL}" stroke-width="4"/><path d="M50 44 C30 40 34 20 46 6 C46 18 54 18 52 12 C66 22 70 40 50 44Z" fill="#ff6a24" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/><path d="M50 40 C42 38 44 28 50 22 C52 30 58 32 50 40Z" fill="#ffe14d"/></svg>`,
    chest: `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="12" y="44" width="76" height="44" rx="6" fill="#c77b3c" stroke="${OL}" stroke-width="6"/><path d="M12 48 Q12 18 50 18 Q88 18 88 48 Z" fill="#e0954f" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/><path d="M12 48 H88" stroke="${OL}" stroke-width="6"/><rect x="42" y="40" width="16" height="20" rx="4" fill="#ffc21c" stroke="${OL}" stroke-width="5"/><path d="M30 20 V88 M70 20 V88" stroke="#ffc21c" stroke-width="6" opacity=".9"/></svg>`,
    switch: `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="18" y="62" width="64" height="26" rx="8" fill="#9aa6c0" stroke="${OL}" stroke-width="6"/><path class="lever" d="M50 70 L72 24" stroke="${OL}" stroke-width="10" stroke-linecap="round"/><circle class="lever-k" cx="72" cy="24" r="11" fill="#ff4f7b" stroke="${OL}" stroke-width="5"/></svg>`,
    empty: '',
    lock: `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M30 46 V32 Q30 12 50 12 Q70 12 70 32 V46" fill="none" stroke="${OL}" stroke-width="14"/><path d="M30 46 V32 Q30 12 50 12 Q70 12 70 32 V46" fill="none" stroke="#b9c3d6" stroke-width="6"/><rect x="20" y="44" width="60" height="46" rx="10" fill="#ffc21c" stroke="${OL}" stroke-width="6"/><circle cx="50" cy="64" r="7" fill="${OL}"/><rect x="47" y="64" width="6" height="14" fill="${OL}"/></svg>`,
  };

  // ---------------------------------------------------------------- layout constants (board units, scaled to fit)
  const RW = 136, RH = 104, GAP = 46, HERO_W = 120, SIDE = 26, GROUND = 40, BOSS_W = 210, BOSS_H = 136, ROOF = 70, TOP_PAD = 34, HERO_GAP = 54;

  class NumberTower {
    constructor(stage, api) {
      this.stage = stage; this.api = api;
      const d = (this.d = api.data);
      if (d.v !== 2) { // the climb-only puzzles were replaced; outfits and coins are kept
        d.stars = {}; d.unlocked = 1; d.world = 0; d.v = 2;
        api.setProgress(0);
      }
      d.stars ??= {}; d.unlocked ??= 1; d.world ??= 0;
      d.outfit ??= { color: 'blue', hat: 'none' };
      d.owned ??= { color: ['blue'], hat: ['none'] };
      this.running = true;
      stage.classList.add('nt-stage');
      stage.innerHTML = `
        <div class="nt-scene" aria-hidden="true"></div>
        <div class="nt-view nt-select">
          <div class="nt-sel-top">
            <h2 class="nt-logo"><span>NUMBER</span> TOWER</h2>
            <div class="nt-sel-pills"><span class="pill"><i class="nt-star-i">★</i><b class="nt-total-stars">0</b></span>
            <span class="pill"><i class="coin"></i><b class="nt-coins">0</b></span>
            <button class="btn btn-sm b-pink" data-nt="wardrobe">🎩 OUTFITS</button></div>
          </div>
          <div class="nt-worlds" role="tablist"></div>
          <div class="nt-world-card"></div>
          <div class="nt-grid"></div>
        </div>
        <div class="nt-view nt-play" hidden>
          <div class="nt-hud">
            <div class="nt-title"><b class="nt-lv"></b><span class="nt-sub"></span></div>
            <div class="nt-chips"></div>
          </div>
          <div class="nt-wrap"><div class="nt-board"></div></div>
          <div class="nt-actions">
            <button class="btn btn-sm b-white" data-nt="levels">☰ LEVELS</button>
            <button class="btn btn-sm b-orange" data-nt="restart">↻ RESTART</button>
            <button class="btn btn-sm b-purple" data-nt="hint">💡 HINT</button>
          </div>
        </div>
        <div class="nt-modal" hidden><div class="panel nt-panel"></div></div>
        <div class="nt-toast"></div>`;
      const q = (s) => stage.querySelector(s);
      this.el = {
        scene: q('.nt-scene'), select: q('.nt-select'), play: q('.nt-play'), worlds: q('.nt-worlds'), worldCard: q('.nt-world-card'), grid: q('.nt-grid'),
        totalStars: q('.nt-total-stars'), coins: q('.nt-coins'), lv: q('.nt-lv'), sub: q('.nt-sub'), chips: q('.nt-chips'),
        wrap: q('.nt-wrap'), board: q('.nt-board'), modal: q('.nt-modal'), panel: q('.nt-panel'), toast: q('.nt-toast'),
      };
      this.onClick = (e) => this.click(e);
      stage.addEventListener('click', this.onClick);
      this.ro = new ResizeObserver(() => this.fit());
      this.ro.observe(this.el.wrap);
      this.showSelect(Math.min(d.world, this.worldOf(d.unlocked - 1)));
      if (/[?&]debug\b/.test(location.search)) window.NT = this;
    }

    worldOf(i) { return Math.floor(i / 25); }
    // swap the painted backdrop (and per-world tower styling) when the world changes
    setWorld(w) {
      if (this.sceneWorld === w) return;
      this.sceneWorld = w;
      this.stage.dataset.world = w;
      const layer = document.createElement('div');
      layer.className = 'sc-layer';
      layer.innerHTML = window.TOWER_SCENES ? window.TOWER_SCENES.html(w) : '';
      const old = [...this.el.scene.children];
      this.el.scene.appendChild(layer);
      setTimeout(() => old.forEach((o) => o.remove()), 600);
    }
    starsOf(i) { const m = this.d.stars[i] || 0; return (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1); }
    sfx(kind) {
      const b = this.api.blip;
      const S = {
        tap: () => b(520, 0.05, 'triangle', 1.4, 0.5), step: () => b(300, 0.06, 'triangle', 1.6, 0.4),
        up: () => b(520, 0.12, 'square', 1.8, 0.5), down: () => b(420, 0.18, 'sawtooth', 0.5, 0.45),
        hit: () => b(160, 0.08, 'square', 0.6, 0.6), win: () => [523, 659, 784].forEach((f, i) => setTimeout(() => b(f, 0.1, 'square', 1.02, 0.55), i * 80)),
        lose: () => [330, 262, 196].forEach((f, i) => setTimeout(() => b(f, 0.16, 'sawtooth', 0.9, 0.5), i * 130)),
        item: () => b(880, 0.08, 'triangle', 1.5, 0.5), no: () => b(140, 0.12, 'square', 0.8, 0.45),
        clear: () => [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => b(f, 0.12, 'square', 1.01, 0.6), i * 90)),
      };
      S[kind] && S[kind]();
    }
    toast(text, cls = '') {
      const t = this.el.toast; t.className = 'nt-toast show ' + cls; t.textContent = text;
      clearTimeout(this._toastT); this._toastT = setTimeout(() => { t.className = 'nt-toast'; }, 1600);
    }

    // ================================================================ LEVEL SELECT
    showSelect(world) {
      this.view = 'select';
      this.el.play.hidden = true; this.el.select.hidden = false; this.closeModal();
      const d = this.d;
      this.selWorld = world; d.world = world;
      this.setWorld(world);
      const total = LEVELS.reduce((a, _, i) => a + this.starsOf(i), 0);
      this.el.totalStars.textContent = `${total}/${LEVELS.length * 3}`;
      this.el.coins.textContent = this.api.coins.toLocaleString();
      this.el.worlds.innerHTML = WORLDS.map((name, w) => {
        const open = d.unlocked > w * 25;
        return `<button class="nt-wtab ${w === world ? 'on' : ''} ${open ? '' : 'locked'}" data-nt="world" data-w="${w}" style="--a:${THEMES[w].sky[0]};--b:${THEMES[w].sky[1]}" role="tab" aria-selected="${w === world}">
          <span class="ico">${open ? THEMES[w].icon : '🔒'}</span><span class="nm">${name}</span></button>`;
      }).join('');
      const ws = LEVELS.slice(world * 25, world * 25 + 25).reduce((a, _, k) => a + this.starsOf(world * 25 + k), 0);
      const th = THEMES[world];
      this.el.worldCard.style.setProperty('--a', th.sky[0]); this.el.worldCard.style.setProperty('--b', th.sky[1]);
      this.el.worldCard.innerHTML = `<div class="nt-wc-text"><small>WORLD ${world + 1}</small><b>${WORLDS[world]}</b><span>★ ${ws}/75</span></div>
        <div class="nt-wc-art">${monsterSVG(world, { boss: false })}${monsterSVG(world, { boss: true })}</div>`;
      this.el.grid.innerHTML = LEVELS.slice(world * 25, world * 25 + 25).map((L, k) => {
        const i = world * 25 + k, open = i < d.unlocked, st = this.starsOf(i), cur = i === d.unlocked - 1;
        return `<button class="nt-lvbtn ${open ? '' : 'locked'} ${cur ? 'cur' : ''} ${L.diff === 'BOSS' ? 'boss' : ''}" data-nt="level" data-i="${i}" ${open ? '' : 'aria-disabled="true"'}>
          <b>${open ? L.id : '🔒'}</b><span class="st">${[0, 1, 2].map((s) => `<i class="${s < st ? 'on' : ''}">★</i>`).join('')}</span>
          ${L.diff === 'BOSS' ? '<em>BOSS</em>' : ''}</button>`;
      }).join('');
      const cur = this.el.grid.querySelector('.cur');
      if (cur) cur.scrollIntoView({ block: 'nearest' });
    }

    // ================================================================ PLAY
    openLevel(i, intro = true) {
      const L = LEVELS[i];
      this.i = i; this.L = L; this.world = L.world;
      this.view = 'play';
      this.el.select.hidden = true; this.el.play.hidden = false;
      if (this.sessionLevel !== i) { this.sessionLevel = i; this.attempts = 0; this.hintUsed = false; }
      this.reset();
      if (intro) this.showIntro(); else this.closeModal();
    }
    reset() {
      const L = this.L;
      this.s = TL.fresh(L.start); this.f = -1; this.c = -1; this.path = []; this.done = new Set();
      this.busy = false; this.t0 = null; this.elapsed = 0; this.over = false; this.hintCell = null;
      clearTimeout(this._endT); // a win/lose card still on its way must not cover the fresh level
      const th = THEMES[L.world];
      this.stage.style.setProperty('--nt-a', th.sky[0]); this.stage.style.setProperty('--nt-b', th.sky[1]);
      this.setWorld(L.world);
      this.el.lv.textContent = `LEVEL ${L.id} · ${L.name}`;
      this.el.sub.textContent = `${WORLDS[L.world]} · ${L.diff}`;
      this.renderBoard();
      this.updateChips();
      this.highlight();
      this.fit();
    }
    showIntro() {
      const L = this.L;
      this.modal(`
        <div class="panel-head b-${L.diff === 'BOSS' ? 'red' : 'purple'}">LEVEL ${L.id}</div>
        <div class="panel-body">
          <p class="nt-m-name">${L.name}</p>
          <p class="nt-m-diff"><span class="nt-diff d-${L.diff.toLowerCase()}">${L.diff}</span> · start with <b>${L.start}</b> power</p>
          ${(L.intro || []).map((t) => `<p class="nt-m-new">${t}</p>`).join('')}
          <p class="nt-m-tip">${L.tip}</p>
          <div class="nt-m-stars"><span>★ Clear the tower</span><span>★ No deaths, restarts or hints</span><span>★ ${L.star.text}</span></div>
          <button class="btn b-green" data-nt="close-modal">CLIMB! ▶</button>
        </div>`);
    }

    // ---------------------------------------------------------------- board
    geom() {
      const L = this.L;
      const towersW = L.W * RW + (L.W - 1) * GAP;
      const x0 = SIDE + HERO_W + HERO_GAP;
      const W = x0 + towersW + SIDE;
      const H = GROUND + L.H * RH + 30 + BOSS_H + ROOF + TOP_PAD;
      return { towersW, x0, W, H, bossX: x0 + towersW / 2 - BOSS_W / 2, bossY: GROUND + L.H * RH + 30 };
    }
    roomRect(f, c) {
      const g = this.geom();
      if (f === -1) return { x: SIDE + 8, y: GROUND + 6, w: HERO_W - 16, h: RH - 12 };
      if (f === this.L.H) return { x: g.bossX + 12, y: g.bossY + 8, w: BOSS_W - 24, h: BOSS_H - 22 };
      return { x: g.x0 + c * (RW + GAP) + 6, y: GROUND + f * RH + 6, w: RW - 12, h: RH - 12 };
    }
    renderBoard() {
      const L = this.L, g = this.geom(), b = this.el.board, th = THEMES[L.world];
      b.style.width = g.W + 'px'; b.style.height = g.H + 'px';
      b.style.setProperty('--tower', th.tower); b.style.setProperty('--room', th.room); b.style.setProperty('--brick', th.brick); b.style.setProperty('--ground', th.ground);
      const parts = [];
      parts.push(`<div class="nt-ground" style="height:${GROUND}px"></div>`);
      // hero's little tower
      parts.push(`<div class="nt-bridge home" style="left:${SIDE + HERO_W - 4}px;bottom:${GROUND + 4}px;width:${HERO_GAP + 6}px"></div>`);
      parts.push(`<div class="nt-tower nt-home" style="left:${SIDE}px;bottom:${GROUND - 6}px;width:${HERO_W}px;height:${RH + 6}px"></div>
        <div class="nt-roof" style="left:${SIDE - 10}px;bottom:${GROUND + RH}px;width:${HERO_W + 20}px"><svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M3 58 L50 4 L97 58 Z" fill="${th.roofA}" stroke="#2a1650" stroke-width="5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${th.snow ? '<path d="M22 32 L50 4 L78 32 Q68 26 62 34 Q56 26 50 34 Q44 26 38 34 Q32 26 22 32Z" fill="#fff" stroke="#2a1650" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' : '<path d="M30 40 H70" stroke="#fff" stroke-width="3" opacity=".35" vector-effect="non-scaling-stroke"/>'}</svg></div>
        <div class="nt-room home" style="left:${SIDE + 8}px;bottom:${GROUND + 6}px;width:${HERO_W - 16}px;height:${RH - 12}px"></div>`);
      // enemy towers + the walkway on top
      for (let c = 0; c < L.W; c++) {
        const x = g.x0 + c * (RW + GAP);
        parts.push(`<div class="nt-tower" style="left:${x - 8}px;bottom:${GROUND - 6}px;width:${RW + 16}px;height:${L.H * RH + 12}px"></div>`);
      }
      parts.push(`<div class="nt-walk" style="left:${g.x0 - 10}px;bottom:${GROUND + L.H * RH + 4}px;width:${g.towersW + 20}px"></div>`);
      // bridges
      for (let f = 0; f < L.H; f++) for (let c = 0; c < L.W - 1; c++) {
        const x = g.x0 + c * (RW + GAP) + RW;
        parts.push(TL.bridgeOpen(L, f, c, c + 1)
          ? `<div class="nt-bridge" style="left:${x - 4}px;bottom:${GROUND + f * RH + 4}px;width:${GAP + 8}px"></div>`
          : `<div class="nt-gap" style="left:${x + GAP / 2 - 9}px;bottom:${GROUND + f * RH + 26}px" title="No bridge">✕</div>`);
      }
      // boss keep
      parts.push(`<div class="nt-tower nt-keep" style="left:${g.bossX}px;bottom:${g.bossY - 4}px;width:${BOSS_W}px;height:${BOSS_H + 4}px"></div>
        <div class="nt-roof boss" style="left:${g.bossX - 14}px;bottom:${g.bossY + BOSS_H}px;width:${BOSS_W + 28}px"><svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M3 58 L50 4 L97 58 Z" fill="${th.roofB}" stroke="#2a1650" stroke-width="5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${th.snow ? '<path d="M22 32 L50 4 L78 32 Q68 26 62 34 Q56 26 50 34 Q44 26 38 34 Q32 26 22 32Z" fill="#fff" stroke="#2a1650" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' : '<path d="M30 40 H70" stroke="#fff" stroke-width="3" opacity=".35" vector-effect="non-scaling-stroke"/>'}</svg></div>
        <div class="nt-flag" style="left:${g.bossX + BOSS_W / 2 - 3}px;bottom:${g.bossY + BOSS_H + 58}px"><svg viewBox="0 0 60 70" aria-hidden="true"><path d="M4 70 V4" stroke="#2a1650" stroke-width="6" stroke-linecap="round"/><path class="nt-flag-cloth" d="M6 6 Q30 0 52 10 Q38 18 52 28 Q30 34 6 26Z" fill="${th.flag}" stroke="#2a1650" stroke-width="4" stroke-linejoin="round"/></svg></div>`);
      // rooms
      for (let f = 0; f < L.H; f++) for (let c = 0; c < L.W; c++) parts.push(this.roomHTML(f, c));
      parts.push(this.roomHTML(L.H, -1));
      parts.push(`<div class="nt-hero"><div class="nt-power">${L.start}</div>${heroSVG(this.d.outfit)}</div>`);
      b.innerHTML = parts.join('');
      this.heroEl = b.querySelector('.nt-hero');
      this.powerEl = b.querySelector('.nt-power');
      this.placeHero(-1, -1, true);
    }
    roomHTML(f, c) {
      const L = this.L, cell = TL.cellAt(L, f, c), r = this.roomRect(f, c);
      const style = `left:${r.x}px;bottom:${r.y}px;width:${r.w}px;height:${r.h}px`;
      return `<button class="nt-room ${this.roomClass(cell)}" data-f="${f}" data-c="${c}" style="${style}" aria-label="${this.roomLabel(cell)}">${this.roomInner(cell)}</button>`;
    }
    roomClass(cell) {
      const k = ['t-' + cell.t];
      if (cell.t === 'gate') k.push(TL.NEG[this.liveOp(cell).op] ? 'neg' : 'pos');
      if (cell.locked) k.push('locked');
      if (cell.frozen) k.push('frozen');
      if (cell.sw) k.push('rune');
      if (cell.t === 'boss') k.push('boss');
      return k.join(' ');
    }
    liveOp(cell) { return TL.gateOp(cell, this.s || TL.fresh(0)); }
    roomLabel(cell) {
      if (cell.t === 'gate') { const { op, v } = this.liveOp(cell); return `Gate ${TL.label(op, v)}`; }
      if (cell.t === 'enemy' || cell.t === 'boss') return `Enemy power ${cell.v}`;
      return cell.t;
    }
    roomInner(cell) {
      const w = this.L.world;
      let val = '', ico = '', badge = '';
      switch (cell.t) {
        case 'gate': {
          const { op, v } = this.liveOp(cell);
          val = `<span class="nt-val ${TL.NEG[op] ? 'neg' : 'pos'}">${TL.label(op, v)}</span>`;
          ico = gateSVG(op);
          if (cell.sw) { const alt = this.s && this.s.sw ? { op: cell.op, v: cell.v } : cell.sw; badge += `<span class="nt-badge rune">🔄 ${TL.label(alt.op, alt.v)}</span>`; }
          break;
        }
        case 'enemy': case 'boss': {
          val = `<span class="nt-val foe">${fmtN(cell.v)}</span>`;
          ico = monsterSVG(w, { ab: cell.ab, boss: cell.t === 'boss' });
          if (cell.ab === 'armor') badge += '<span class="nt-badge">🛡 ×2</span>';
          if (cell.ab === 'thief') badge += '<span class="nt-badge">🦹 ½</span>';
          if (cell.ab === 'curse') badge += '<span class="nt-badge">💀 flip</span>';
          if (cell.drop === 'key') badge += '<span class="nt-badge drop">🔑</span>';
          if (cell.drop === 'torch') badge += '<span class="nt-badge drop">🔥</span>';
          if (cell.drop === 'chest') badge += '<span class="nt-badge drop">💰</span>';
          if (cell.drop && cell.drop.op) badge += `<span class="nt-badge drop">🎁 ${TL.label(cell.drop.op, cell.drop.v)}</span>`;
          if (cell.opt) badge += '<span class="nt-badge opt">OPTIONAL</span>';
          break;
        }
        case 'key': ico = ICONS.key; val = '<span class="nt-val item">KEY</span>'; break;
        case 'torch': ico = ICONS.torch; val = '<span class="nt-val item">TORCH</span>'; break;
        case 'chest': ico = ICONS.chest; val = '<span class="nt-val item">TREASURE</span>'; break;
        case 'switch': ico = ICONS.switch; val = '<span class="nt-val item">SWITCH</span>'; break;
        case 'wall': return '<span class="nt-wall-face"></span>';
        default: break;
      }
      const ice = cell.frozen ? '<span class="nt-ice">❄</span>' : '';
      const lock = cell.locked ? `<span class="nt-lock">${ICONS.lock}</span>` : '';
      return `${val}<span class="nt-ico">${ico}</span>${badge ? `<span class="nt-badges">${badge}</span>` : ''}${ice}${lock}`;
    }
    roomEl(f, c) { return this.el.board.querySelector(`.nt-room[data-f="${f}"][data-c="${c}"]`); }
    refreshRoom(f, c) {
      const el = this.roomEl(f, c), cell = TL.cellAt(this.L, f, c);
      if (!el) return;
      const used = this.done.has(f + ',' + c);
      el.className = `nt-room ${this.roomClass(cell)} ${used ? 'used' : ''}`;
      if (!used) el.innerHTML = this.roomInner(cell);
    }
    placeHero(f, c, instant) {
      const r = this.roomRect(f, c);
      const h = this.heroEl;
      if (instant) h.style.transition = 'none';
      h.style.left = r.x + 6 + 'px';
      h.style.bottom = r.y + 4 + 'px';
      if (instant) { void h.offsetWidth; h.style.transition = ''; }
    }
    fit() {
      if (this.view !== 'play' || !this.L) return;
      const g = this.geom(), wrap = this.el.wrap;
      const s = Math.min(wrap.clientWidth / g.W, wrap.clientHeight / g.H, 1.2);
      this.el.board.style.transform = `translateX(-50%) scale(${s})`;
    }

    // which rooms can be entered next; which are adjacent but blocked
    nextMoves() { return TL.moves(this.L, this.f, this.c, this.s); }
    highlight() {
      const ms = this.over ? [] : this.nextMoves();
      const ok = new Set(ms.map((m) => m.f + ',' + m.c));
      this.el.board.querySelectorAll('.nt-room').forEach((el) => {
        const k = el.dataset.f + ',' + el.dataset.c;
        el.classList.toggle('go', ok.has(k));
        el.classList.toggle('hint', this.hintCell === k);
      });
      if (this.L.id === 1 && this.f === -1 && !this.over) { const first = this.roomEl(0, 0); if (first) first.classList.add('point'); }
    }
    updateChips() {
      const s = this.s, L = this.L, chips = [];
      chips.push(`<span class="nt-chip goal">★ ${L.star.text}</span>`);
      if (L.star.type === 'time') chips.push(`<span class="nt-chip timer">⏱ <b class="nt-time">${Math.floor(this.elapsed)}</b>s</span>`);
      if (s.keys) chips.push(`<span class="nt-chip">🔑 ×${s.keys}</span>`);
      if (s.torches) chips.push(`<span class="nt-chip">🔥 ×${s.torches}</span>`);
      if (s.curse) chips.push('<span class="nt-chip curse">💀 Next gate flips!</span>');
      if (s.sw) chips.push('<span class="nt-chip">🔄 Switch ON</span>');
      if (s.treasure) chips.push('<span class="nt-chip">💰 Treasure</span>');
      this.el.chips.innerHTML = chips.join('');
    }

    // ---------------------------------------------------------------- input
    click(e) {
      const a = e.target.closest('[data-nt]');
      if (a) {
        const act = a.dataset.nt;
        this.sfx('tap');
        if (act === 'world') { const w = +a.dataset.w; if (this.d.unlocked > w * 25) this.showSelect(w); else this.toast(`Beat level ${w * 25} to unlock ${WORLDS[w]}`, 'warn'); }
        if (act === 'level') { const i = +a.dataset.i; if (i < this.d.unlocked) this.openLevel(i); else this.toast('Beat the level before it first 🔒', 'warn'); }
        if (act === 'close-modal') { this.closeModal(); }
        if (act === 'levels') this.showSelect(this.worldOf(this.i));
        if (act === 'restart') { if (!this.busy) { if (this.path.length && !this.over) this.attempts++; this.reset(); this.closeModal(); } }
        if (act === 'retry') { this.reset(); this.closeModal(); }
        if (act === 'next') { const n = this.i + 1; if (n < LEVELS.length) this.openLevel(n); else this.showSelect(4); }
        if (act === 'replay') { this.attempts = 0; this.hintUsed = false; this.reset(); this.closeModal(); }
        if (act === 'hint') this.hint();
        if (act === 'wardrobe') this.wardrobe('color');
        if (act === 'wtab') this.wardrobe(a.dataset.tab);
        if (act === 'buy') this.buy(a.dataset.kind, a.dataset.id);
        return;
      }
      const room = e.target.closest('.nt-room');
      if (room && this.view === 'play') this.tapRoom(+room.dataset.f, +room.dataset.c, room);
    }
    tapRoom(f, c, el) {
      if (this.busy || this.over || !this.el.modal.hidden) return;
      const ok = this.nextMoves().some((m) => m.f === f && m.c === c);
      if (!ok) {
        el.classList.remove('nope'); void el.offsetWidth; el.classList.add('nope');
        this.sfx('no');
        const cell = TL.cellAt(this.L, f, c);
        const reach = TL.moves(this.L, this.f, this.c, { ...this.s, keys: 99 }).some((m) => m.f === f && m.c === c);
        const beside = f === this.f && Math.abs(c - this.c) === 1;
        if (cell.t === 'wall') this.toast('🧱 Solid wall! Find a way around', 'warn');
        else if (reach && cell.locked) this.toast('🔒 Locked! Beat a key keeper first', 'warn');
        else if (f >= 0 && f < this.L.H && TL.isUsed(this.L, this.s, f, c)) this.toast('Already used that room', 'warn');
        else if (f < this.f) this.toast("You can't go back down", 'warn');
        else if (beside) this.toast('No bridge that way ✕', 'warn');
        else this.toast('One room at a time: left, right or up', 'warn');
        return;
      }
      this.move(f, c);
    }

    // ---------------------------------------------------------------- a move, animated
    async move(f, c) {
      this.busy = true;
      if (this.t0 === null) { this.t0 = performance.now(); this.tick(); }
      this.hintCell = null;
      this.el.board.querySelectorAll('.nt-room.go, .nt-room.point, .nt-room.hint').forEach((el) => el.classList.remove('go', 'point', 'hint'));
      this.placeHero(f, c);
      this.sfx('step');
      await wait(420);
      if (this.disposed) return;
      const cell = TL.cellAt(this.L, f, c);
      const { s, ev } = TL.step(this.L, this.s, f, c);
      const roomEl = this.roomEl(f, c);
      for (const e of ev) {
        if (this.disposed) return;
        await this.play(e, roomEl, cell);
      }
      this.s = s; this.f = f; this.c = c; this.path.push([f, c]);
      this.done.add(f + ',' + c);
      if (!s.dead) this.refreshRoom(f, c);
      // rune gates change face when the switch flips
      if (ev.some((x) => x.k === 'switch')) this.L.grid.forEach((row, ff) => row.forEach((cl, cc) => { if (cl.sw && !this.done.has(ff + ',' + cc)) this.refreshRoom(ff, cc); }));
      this.setPower(s.dead ? 0 : s.p);
      this.updateChips();
      this.heroEl.classList.toggle('cursed', s.curse);
      if (s.dead) return this.lose(ev);
      if (f === this.L.H) return this.win();
      this.busy = false;
      this.highlight();
    }
    setPower(p) { this.powerEl.textContent = fmtN(p); }
    count(el, from, to, ms) {
      return new Promise((res) => {
        const t0 = performance.now();
        const step = (t) => {
          const k = Math.min(1, (t - t0) / ms), e = 1 - (1 - k) ** 3;
          el.textContent = fmtN(Math.round(from + (to - from) * e));
          if (k < 1 && !this.disposed) requestAnimationFrame(step); else res();
        };
        requestAnimationFrame(step);
      });
    }
    pop(text, cls, anchor) {
      const r = (anchor || this.heroEl).getBoundingClientRect(), sr = this.stage.getBoundingClientRect();
      const el = document.createElement('div');
      el.className = 'nt-pop ' + cls; el.textContent = text;
      el.style.left = r.left - sr.left + r.width / 2 + 'px'; el.style.top = r.top - sr.top + 'px';
      this.stage.appendChild(el);
      setTimeout(() => el.remove(), 1100);
    }
    async play(e, roomEl, cell) {
      const h = this.heroEl;
      switch (e.k) {
        case 'unlock': roomEl.classList.add('opening'); this.pop('🔓', 'item', roomEl); this.sfx('item'); await wait(350); break;
        case 'key': this.pop('+🔑', 'item', roomEl); this.sfx('item'); await wait(300); break;
        case 'torch': this.pop('+🔥', 'item', roomEl); this.sfx('item'); await wait(300); break;
        case 'chest': this.pop('💰 TREASURE!', 'item', roomEl); this.sfx('win'); await wait(450); break;
        case 'switch': roomEl.classList.toggle('flipped', e.on); this.pop(e.on ? '🔄 RUNES FLIPPED!' : '🔄 RUNES BACK!', 'item', roomEl); this.sfx('item'); await wait(450); break;
        case 'frozen': this.pop('❄ FROZEN', 'neg', roomEl); this.sfx('no'); await wait(450); break;
        case 'thaw': roomEl.classList.add('thawing'); this.pop('🔥 THAWED!', 'item', roomEl); this.sfx('item'); await wait(400); break;
        case 'flip': this.pop(`💀 ${TL.SYMBOL[e.from]} → ${TL.SYMBOL[e.op]}`, 'curse', roomEl); await wait(450); break;
        case 'cursed': this.pop('💀 CURSED', 'curse'); await wait(300); break;
        case 'steal':
          this.pop('🦹 −50%', 'neg'); this.sfx('down');
          await this.count(this.powerEl, e.from, e.to, 350); break;
        case 'gate': {
          const good = e.to >= e.from;
          roomEl.classList.add('consume');
          this.pop(TL.label(e.op, e.v), good ? 'pos' : 'neg', roomEl);
          this.sfx(good ? 'up' : 'down');
          h.classList.add(good ? 'glow' : 'hurt');
          await this.count(this.powerEl, e.from, e.to, 450);
          h.classList.remove('glow', 'hurt');
          break;
        }
        case 'fight': {
          const foe = roomEl.querySelector('.nt-val');
          h.classList.add('attack'); roomEl.classList.add('clash');
          this.sfx('hit'); setTimeout(() => this.sfx('hit'), 180);
          await Promise.all([this.count(this.powerEl, e.from, e.to, 520), foe ? this.count(foe, e.cost, e.win ? 0 : e.cost - e.from, 520) : 0]);
          h.classList.remove('attack'); roomEl.classList.remove('clash');
          if (e.win) { roomEl.classList.add('beaten'); this.sfx('win'); await wait(260); }
          this.lastFight = e;
          break;
        }
        case 'die': h.classList.add('dead'); this.sfx('lose'); await wait(500); break;
        default: break;
      }
    }
    tick() {
      if (this.disposed || this.t0 === null || this.over) return;
      if (this.running) this.elapsed += 0.25;
      const el = this.el.chips.querySelector('.nt-time');
      if (el) el.textContent = Math.floor(this.elapsed);
      this._tick = setTimeout(() => this.tick(), 250);
    }

    lose(ev) {
      this.over = true; this.busy = false; this.attempts++;
      const fight = ev.find((x) => x.k === 'fight' && !x.win);
      const why = fight ? `Your <b>${fmtN(fight.from)}</b> wasn't more than <b>${fmtN(fight.cost)}</b>.` : 'Your power hit zero.';
      clearTimeout(this._endT);
      this._endT = setTimeout(() => {
        if (this.disposed) return;
        this.modal(`
          <div class="panel-head b-red">DEFEATED!</div>
          <div class="panel-body">
            <p class="nt-m-why">${why}</p>
            <p class="nt-m-tip">${this.L.tip}</p>
            <button class="btn b-green" data-nt="retry">↻ TRY AGAIN</button>
            <button class="btn b-purple" data-nt="hint">💡 SHOW A HINT</button>
            <button class="btn btn-sm b-white" data-nt="levels">☰ LEVELS</button>
          </div>`);
      }, 400);
    }
    win() {
      this.over = true; this.busy = false;
      const L = this.L, secs = this.elapsed;
      const clean = this.attempts === 0 && !this.hintUsed;
      const mask = 1 | (clean ? 2 : 0) | (TL.starMet(L, this.s, secs) ? 4 : 0);
      const before = this.d.stars[this.i] || 0;
      const fresh = mask & ~before;
      this.d.stars[this.i] = before | mask;
      const newStars = (fresh & 1) + ((fresh >> 1) & 1) + ((fresh >> 2) & 1);
      const coins = newStars * 5 * (1 + L.world);
      if (coins) this.api.addCoins(coins);
      if (this.i + 1 >= this.d.unlocked) this.d.unlocked = Math.min(LEVELS.length, this.i + 2);
      const cleared = LEVELS.reduce((a, _, i) => a + ((this.d.stars[i] || 0) & 1), 0);
      this.api.setProgress(Math.floor((cleared / LEVELS.length) * 10));
      if (cleared === LEVELS.length) this.api.clear();
      this.api.save();
      this.sfx('clear');
      const got = [mask & 1, mask & 2, mask & 4];
      const why = ['Cleared the tower', clean ? 'No deaths, restarts or hints' : this.hintUsed ? 'Used a hint' : `Took ${this.attempts + 1} tries`, L.star.text];
      clearTimeout(this._endT);
      this._endT = setTimeout(() => {
        if (this.disposed) return;
        this.modal(`
          <div class="panel-head b-green">TOWER CLEARED!</div>
          <div class="panel-body">
            <div class="nt-bigstars">${got.map((g, k) => `<i class="${g ? 'on' : ''}" style="animation-delay:${0.15 + k * 0.2}s">★</i>`).join('')}</div>
            <div class="nt-m-stars res">${why.map((t, k) => `<span class="${got[k] ? 'on' : ''}">${got[k] ? '★' : '☆'} ${t}</span>`).join('')}</div>
            <p class="nt-m-final">Finished with <b>${fmtN(this.s.p)}</b> power${L.star.type === 'time' ? ` in <b>${Math.floor(secs)}s</b>` : ''}</p>
            ${coins ? `<p class="nt-m-coins"><i class="coin"></i> +${coins} coins</p>` : ''}
            ${this.i + 1 < LEVELS.length ? '<button class="btn b-green" data-nt="next">NEXT LEVEL ▶</button>' : '<p class="nt-m-name">YOU CONQUERED EVERY TOWER! 👑</p>'}
            <button class="btn btn-sm b-orange" data-nt="replay">↻ REPLAY</button>
            <button class="btn btn-sm b-white" data-nt="levels">☰ LEVELS</button>
          </div>`);
      }, 500);
    }

    // a winning continuation from where you stand (costs the "no hints" star)
    hint() {
      if (this.busy) return;
      if (this.over) { this.reset(); this.closeModal(); }
      const L = this.L;
      let found = null;
      const walk = (f, c, s, first) => {
        if (found) return;
        for (const m of TL.moves(L, f, c, s)) {
          const r = TL.step(L, s, m.f, m.c);
          if (r.s.dead) continue;
          const fm = first || m;
          if (m.f === L.H) { found = fm; return; }
          walk(m.f, m.c, r.s, fm);
          if (found) return;
        }
      };
      walk(this.f, this.c, this.s, null);
      this.hintUsed = true;
      if (!found) { this.toast("No winning route from here. Restart!", 'warn'); return; }
      this.hintCell = found.f + ',' + found.c;
      this.highlight();
      this.toast('💡 Try the glowing room');
    }

    // ================================================================ OUTFITS
    wardrobe(tab) {
      const d = this.d, list = tab === 'hat' ? HATS : COLORS, kind = tab === 'hat' ? 'hat' : 'color';
      this.modal(`
        <div class="panel-head b-pink">OUTFITS</div>
        <div class="panel-body">
          <div class="nt-wd-top"><div class="nt-wd-hero">${heroSVG(d.outfit)}</div>
            <div><p class="nt-wd-coins"><i class="coin"></i> <b>${this.api.coins.toLocaleString()}</b></p><p class="nt-wd-note">Earn coins from new stars. Outfits are just for looks.</p></div></div>
          <div class="nt-wd-tabs"><button class="btn btn-sm ${kind === 'color' ? 'b-purple' : 'b-white'}" data-nt="wtab" data-tab="color">COLORS</button>
            <button class="btn btn-sm ${kind === 'hat' ? 'b-purple' : 'b-white'}" data-nt="wtab" data-tab="hat">HATS</button></div>
          <div class="nt-wd-grid">${list.map((it) => {
            const own = d.owned[kind].includes(it.id), on = d.outfit[kind] === it.id;
            const prev = kind === 'hat' ? heroSVG({ color: d.outfit.color, hat: it.id }) : heroSVG({ color: it.id, hat: d.outfit.hat });
            return `<button class="nt-wd-item ${on ? 'on' : ''}" data-nt="buy" data-kind="${kind}" data-id="${it.id}">
              <span class="pv">${prev}</span><span class="nm">${it.name}</span>
              <span class="pr">${on ? 'WEARING' : own ? 'WEAR' : `<i class="coin"></i>${it.price}`}</span></button>`;
          }).join('')}</div>
          <button class="btn b-green" data-nt="close-modal">DONE</button>
        </div>`);
      this.wdTab = tab;
    }
    buy(kind, id) {
      const d = this.d, list = kind === 'hat' ? HATS : COLORS, it = list.find((x) => x.id === id);
      if (!it) return;
      if (!d.owned[kind].includes(id)) {
        if (!this.api.spendCoins(it.price)) { this.toast(`Need ${it.price - this.api.coins} more coins`, 'warn'); this.sfx('no'); return; }
        d.owned[kind].push(id); this.sfx('clear');
      }
      d.outfit[kind] = id;
      this.api.save();
      this.wardrobe(kind === 'hat' ? 'hat' : 'color');
      this.el.coins.textContent = this.api.coins.toLocaleString();
      if (this.heroEl) { const p = this.powerEl.textContent; this.heroEl.innerHTML = `<div class="nt-power">${p}</div>${heroSVG(d.outfit)}`; this.powerEl = this.heroEl.querySelector('.nt-power'); }
    }

    // ================================================================ modal + lifecycle
    modal(html) { this.el.panel.innerHTML = html; this.el.modal.hidden = false; }
    closeModal() { this.el.modal.hidden = true; if (this.view === 'play') this.highlight(); }
    pause() { this.running = false; }
    resume() { this.running = true; }
    destroy() {
      this.disposed = true;
      clearTimeout(this._tick); clearTimeout(this._toastT); clearTimeout(this._endT);
      this.api.save();
      this.ro.disconnect();
      this.stage.removeEventListener('click', this.onClick);
      this.stage.classList.remove('nt-stage');
      this.stage.style.removeProperty('--nt-a'); this.stage.style.removeProperty('--nt-b');
      delete this.stage.dataset.world;
      this.stage.innerHTML = '';
    }
  }

  window.GAME_MODULES = window.GAME_MODULES || {};
  window.GAME_MODULES.tower = { create: (stage, api) => new NumberTower(stage, api) };
})();
