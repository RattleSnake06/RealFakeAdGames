/* =====================================================================
   NUMBER TOWER — rules engine (shared by the game and the level generator)
   Works in the browser (window.TowerLogic) and in Node (require).

   Board: W towers side by side, H floors each (floor 0 at the bottom), plus a
   boss room on top. The hero's home tower is bridged to the bottom-left room.
   Each move goes one room LEFT, RIGHT (across a bridge to the next tower) or UP.
   You can't go down, and every room can only be entered once. Any top-floor
   room leads up to the boss.

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
    used: 0, // bit mask of rooms already entered (bit = f * W + c)
  });
  const bit = (L, f, c) => 2 ** (f * L.W + c);
  const isUsed = (L, s, f, c) => Math.floor(s.used / bit(L, f, c)) % 2 === 1;

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

  // Rooms you can move to from (f, c): left, right (over a bridge) or up. f = -1 is home, f = H is the boss.
  function moves(L, f, c, s) {
    if (f >= L.H) return [];
    const ok = (ff, cc) => !isUsed(L, s, ff, cc) && canEnter(s, L.grid[ff][cc]);
    if (f < 0) return ok(0, 0) ? [{ f: 0, c: 0 }] : [];
    const out = [];
    for (const x of [c - 1, c + 1]) if (x >= 0 && x < L.W && bridgeOpen(L, f, c, x) && ok(f, x)) out.push({ f, c: x });
    if (f === L.H - 1) out.push({ f: L.H, c: -1 });
    else if (ok(f + 1, c)) out.push({ f: f + 1, c });
    return out;
  }
  const cellAt = (L, f, c) => (f === L.H ? L.boss : L.grid[f][c]);
  // enter a room and mark it used
  function step(L, s, f, c) {
    const r = enter(s, cellAt(L, f, c));
    if (f < L.H) r.s.used = s.used + bit(L, f, c);
    return r;
  }

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
        const r = step(L, s, m.f, m.c);
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
        const r = step(L, s, m.f, m.c);
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

  return { OPS, NEG, FLIP, SYMBOL, label, fresh, canEnter, gateOp, enter, step, moves, cellAt, solve, greedy, starMet, bridgeOpen, isUsed };
});
