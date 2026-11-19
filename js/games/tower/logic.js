/* =====================================================================
   NUMBER TOWER — rules engine (shared by the game and the level generator)
   Works in the browser (window.TowerLogic) and in Node (require).

   Board: W towers side by side, H floors each (floor 0 at the bottom), plus a
   boss room on top. The hero starts at the base, then climbs one floor per move:
   straight up, or across a bridge to the tower next door. Any top-floor room
   leads to the boss.

   Combat (Option A): beat an enemy if your power is higher; you keep the
   difference. 300 vs 250 → you win with 50 left. Equal or lower → defeated.
   ===================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TowerLogic = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // op codes: + - x / are plain math; % is lava (lose v% of power); ^ is its cursed flip (gain v%)
  const OPS = {
    '+': (p, v) => p + v,
    '-': (p, v) => p - v,
    x: (p, v) => p * v,
    '/': (p, v) => Math.floor(p / v),
    '%': (p, v) => p - Math.floor((p * v) / 100),
    '^': (p, v) => p + Math.floor((p * v) / 100),
  };
  const NEG = { '-': true, '/': true, '%': true };
  const FLIP = { '+': '-', '-': '+', x: '/', '/': 'x', '%': '^', '^': '%' };
  const SYMBOL = { '+': '+', '-': '−', x: '×', '/': '÷', '%': '−', '^': '+' };
  const label = (op, v) => (op === '%' || op === '^' ? `${SYMBOL[op]}${v}%` : `${SYMBOL[op]}${v}`);

  const fresh = (start) => ({
    p: start, keys: 0, torches: 0, sw: false, curse: false,
    neg: false, treasure: false, opt: 0, kills: 0, unlocks: 0, thaws: 0, switches: 0, rewards: 0, goodFlips: 0, dead: false,
  });

  const canEnter = (s, cell) => !!cell && cell.t !== 'wall' && (!cell.locked || s.keys > 0);

  // The op a gate shows right now (rune gates swap value when the switch is flipped).
  function gateOp(cell, s) {
    if (cell.sw && s.sw) return { op: cell.sw.op, v: cell.sw.v };
    return { op: cell.op, v: cell.v };
  }

  function applyGate(s, op, v, ev) {
    const from = s.p;
    s.p = OPS[op](s.p, v);
    if (NEG[op]) s.neg = true;
    ev.push({ k: 'gate', op, v, from, to: s.p });
    if (s.p <= 0) { s.p = 0; s.dead = true; ev.push({ k: 'die', why: 'drained' }); }
  }

  // Enter a room. Returns the new state and a list of events (for animation).
  function enter(state, cell) {
    const s = { ...state };
    const ev = [];
    if (cell.locked) { s.keys--; s.unlocks++; ev.push({ k: 'unlock' }); }
    switch (cell.t) {
      case 'key': s.keys++; ev.push({ k: 'key' }); break;
      case 'torch': s.torches++; ev.push({ k: 'torch' }); break;
      case 'chest': s.treasure = true; ev.push({ k: 'chest' }); break;
      case 'switch': s.sw = !s.sw; s.switches++; ev.push({ k: 'switch', on: s.sw }); break;
      case 'gate': {
        let { op, v } = gateOp(cell, s);
        if (cell.frozen) {
          if (s.torches > 0) { s.torches--; s.thaws++; ev.push({ k: 'thaw' }); }
          else { ev.push({ k: 'frozen' }); break; }
        }
        if (s.curse) {
          const was = op; op = FLIP[op]; s.curse = false;
          if (NEG[was] && !NEG[op]) s.goodFlips++;
          ev.push({ k: 'flip', from: was, op });
        }
        applyGate(s, op, v, ev);
        break;
      }
      case 'enemy':
      case 'boss': {
        if (cell.ab === 'thief') { const from = s.p; s.p = Math.floor(s.p / 2); ev.push({ k: 'steal', from, to: s.p }); }
        const cost = cell.ab === 'armor' ? cell.v * 2 : cell.v;
        if (s.p <= cost) { ev.push({ k: 'fight', cost, from: s.p, to: 0, win: false }); s.dead = true; ev.push({ k: 'die', why: 'fight' }); return { s, ev }; }
        ev.push({ k: 'fight', cost, from: s.p, to: s.p - cost, win: true });
        s.p -= cost; s.kills++;
        if (cell.opt) s.opt++;
        if (cell.ab === 'curse') { s.curse = true; ev.push({ k: 'cursed' }); }
        if (cell.drop === 'key') { s.keys++; ev.push({ k: 'key' }); }
        if (cell.drop === 'torch') { s.torches++; ev.push({ k: 'torch' }); }
        if (cell.drop === 'chest') { s.treasure = true; ev.push({ k: 'chest' }); }
        if (cell.drop && cell.drop.op) { s.rewards++; applyGate(s, cell.drop.op, cell.drop.v, ev); }
        break;
      }
      default: break; // empty room
    }
    return { s, ev };
  }

  const bridgeOpen = (L, f, a, b) => {
    const lo = Math.min(a, b);
    return !L.br || !L.br[f] || L.br[f][lo] !== 0;
  };

  // Rooms you can move to from position (f, c). f = -1 is the start, f = H is the boss.
  function moves(L, f, c, s) {
    if (f === L.H - 1) return [{ f: L.H, c: -1 }];
    if (f >= L.H) return [];
    const nf = f + 1, out = [];
    const cols = f < 0 ? [...Array(L.W).keys()] : [c - 1, c, c + 1].filter((x) => x >= 0 && x < L.W && (x === c || bridgeOpen(L, nf, c, x)));
    for (const x of cols) if (canEnter(s, L.grid[nf][x])) out.push({ f: nf, c: x });
    return out;
  }
  const cellAt = (L, f, c) => (f === L.H ? L.boss : L.grid[f][c]);

  // Explore every route. Each result: { path, s (final state), win, pre (power before the boss) }
  function solve(L, opts = {}) {
    const out = [];
    const limit = opts.limit || 200000;
    const walk = (f, c, s, path) => {
      if (out.length >= limit) return;
      const ms = moves(L, f, c, s);
      if (!ms.length) { out.push({ path, s, win: false, stuck: true }); return; }
      for (const m of ms) {
        if (m.f === L.H) {
          const pre = s.p;
          const r = enter(s, L.boss);
          out.push({ path: [...path, [m.f, m.c]], s: r.s, win: !r.s.dead, pre, top: s });
          continue;
        }
        const r = enter(s, L.grid[m.f][m.c]);
        const np = [...path, [m.f, m.c]];
        if (r.s.dead) { out.push({ path: np, s: r.s, win: false }); continue; }
        walk(m.f, m.c, r.s, np);
      }
    };
    walk(-1, -1, fresh(L.start), []);
    return out;
  }

  // A naive player: always take the room that leaves the most power right now.
  function greedy(L) {
    let f = -1, c = -1, s = fresh(L.start);
    const path = [];
    for (;;) {
      const ms = moves(L, f, c, s);
      if (!ms.length) return { path, s, win: false };
      let best = null;
      for (const m of ms) {
        const r = enter(s, cellAt(L, m.f, m.c));
        const score = r.s.dead ? -1 : r.s.p;
        if (!best || score > best.score) best = { m, r, score };
      }
      path.push([best.m.f, best.m.c]);
      s = best.r.s;
      if (s.dead) return { path, s, win: false };
      if (best.m.f === L.H) return { path, s, win: true };
      f = best.m.f; c = best.m.c;
    }
  }

  // Third-star check for a finished run.
  function starMet(L, s, seconds) {
    const st = L.star;
    if (!st) return false;
    switch (st.type) {
      case 'power': return s.p >= st.v;
      case 'treasure': return s.treasure;
      case 'noneg': return !s.neg;
      case 'kills': return s.kills >= st.v;
      case 'time': return seconds <= st.v;
      default: return false;
    }
  }

  return { OPS, NEG, FLIP, SYMBOL, label, fresh, canEnter, gateOp, enter, moves, cellAt, solve, greedy, starMet, bridgeOpen };
});
