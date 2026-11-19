#!/usr/bin/env node
/* Generates js/games/tower/levels.js — the 125 fixed Number Tower levels.
   Run:  node tools/gen-tower-levels.js
   Movement: left, right (across bridges) or up, one room at a time, each room once.
   Every level is built around a gimmick, then checked by the solver in logic.js:
   - it must be solvable,
   - harder levels must have fewer winning routes (expert: one or two),
   - from Medium up, "always grab the biggest number" must lose,
   - the gimmick must matter (e.g. every winning route uses the key).
   The boss number is picked from the solver's results, so difficulty comes from
   the puzzle, not from inflated numbers. Output is deterministic (seeded). */
'use strict';
const fs = require('fs');
const path = require('path');
const TL = require('../js/games/tower/logic.js');

// ---------------------------------------------------------------- helpers
const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (r, a) => a[Math.floor(r() * a.length)];
const U = (r, a, b) => a + r() * (b - a);
// round to a friendly number; harder levels keep messier numbers
function nice(n, messy) {
  n = Math.max(1, n);
  if (n < 10) return Math.round(n);
  if (messy) return n < 100 ? Math.round(n) : Math.round(n / 5) * 5;
  const mag = 10 ** Math.floor(Math.log10(n));
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10];
  let best = mag;
  for (const s of steps) if (Math.abs(s * mag - n) < Math.abs(best - n)) best = s * mag;
  return Math.round(best);
}
const has = (res, f, c) => res.path.some(([a, b]) => a === f && b === c);
// sideways moves in a route (consecutive rooms on the same floor)
const sideways = (res) => res.path.reduce((n, p, i) => n + (i > 0 && p[0] === res.path[i - 1][0] ? 1 : 0), 0);
// a random room that isn't the entrance (0,0)
function spot(c, fMin, fMax) {
  for (;;) {
    const f = fMin + Math.floor(c.r() * (fMax - fMin + 1)), col = Math.floor(c.r() * c.W);
    if (f !== 0 || col !== 0) return [f, col];
  }
}

// ---------------------------------------------------------------- worlds
const WORLDS = [
  { name: 'GRASSLANDS', mech: [] },
  { name: 'FROZEN KINGDOM', mech: ['frozen', 'torch'] },
  { name: 'BURNING LANDS', mech: ['armor', 'reward', 'lava'] },
  { name: 'CURSED REALM', mech: ['thief', 'curse'] },
  { name: 'CELESTIAL KINGDOM', mech: ['frozen', 'torch', 'armor', 'reward', 'lava', 'thief', 'curse'] },
];
const DIFF = ['EASY', 'NORMAL', 'MEDIUM', 'HARD', 'EXPERT'];
// share of all routes that should win, per difficulty
const TARGET = [0.45, 0.28, 0.16, 0.08, 0];

// ---------------------------------------------------------------- templates
// Each template plants its gimmick into a randomly filled board, then says
// whether the solved level really shows the gimmick off.
const T = {};

T.FORK = {
  names: ['THE FORK IN THE ROAD', 'LEFT OR RIGHT?', 'NO WAY BACK', 'TWO PATHS', 'POINT OF NO RETURN', 'THE SPLIT', 'CHOOSE A SIDE', 'PARTING WAYS'],
  tip: 'Above the ground floor there are no bridges between the two sides. Choose your side on the way in.',
  minW: 3, minH: 3,
  plant(c) {
    const sp = 1 + Math.floor(c.r() * (c.W - 1));
    for (let f = 1; f < c.H; f++) c.br[f][sp - 1] = 0;
    c.split = sp;
  },
  accept(c, wins, g) {
    const side = (w) => { const up = w.path.find(([f]) => f >= 1); return up && up[1] >= 0 && up[1] < c.split ? 0 : 1; };
    return wins.length > 0 && wins.every((w) => side(w) === side(wins[0])) && side(g) !== side(wins[0]);
  },
};
T.TRAP = {
  names: ['THE MULTIPLIER TRAP', 'TOO GOOD TO BE TRUE', "FOOL'S GOLD", 'THE BAIT', 'SHINY AND DANGEROUS', 'GREED KILLS', 'THE HONEY POT', 'LOOKS EASY'],
  tip: 'That huge multiplier looks tempting. Look at what waits above it.',
  minH: 3,
  plant(c) {
    const [f, col] = spot(c, 0, c.H - 2);
    c.grid[f][col] = { t: 'gate', op: 'x', v: pick(c.r, [3, 4, 4, 5]) };
    const thief = c.world >= 3 && c.r() < 0.6;
    const foe = () => (thief
      ? { t: 'enemy', ab: 'thief', v: nice(c.E(f) * U(c.r, 1.2, 2.2), c.messy) }
      : { t: 'enemy', v: nice(c.E(f) * U(c.r, 2.6, 4.2), c.messy) });
    c.grid[f + 1][col] = foe();
    for (const x of [col - 1, col + 1]) if (x >= 0 && x < c.W && (f !== 0 || x !== 0) && c.r() < 0.7) c.grid[f][x] = foe();
    c.trap = [f, col];
  },
  accept: (c, wins, g) => wins.every((w) => !has(w, ...c.trap)) && has(g, ...c.trap) && !g.win,
};
T.ORDER = {
  names: ['ADD, THEN MULTIPLY', 'ORDER MATTERS', 'FIRST THINGS FIRST', 'MATH CLASS', 'SEQUENCE OF EVENTS', 'TIMING IS EVERYTHING'],
  tip: 'Adding before you multiply makes the bonus multiply too.',
  minW: 2, minH: 3,
  plant(c) {
    const f = 1 + Math.floor(c.r() * (c.H - 2)), a = Math.floor(c.r() * (c.W - 1)), b = a + 1;
    const X = nice(c.E(f) * U(c.r, 0.45, 0.9), c.messy), m = pick(c.r, [2, 3]);
    const plus = { t: 'gate', op: '+', v: X }, times = { t: 'gate', op: 'x', v: m };
    const swap = c.r() < 0.5;
    c.grid[f][a] = swap ? times : plus; c.grid[f + 1][a] = swap ? { ...plus } : { ...times };
    c.grid[f][b] = swap ? { ...plus } : { ...times }; c.grid[f + 1][b] = swap ? { ...times } : { ...plus };
    c.br[f + 1][a] = 0;
    c.plus = [[f, swap ? b : a], [f + 1, swap ? a : b]];
    c.times = [[f, swap ? a : b], [f + 1, swap ? b : a]];
  },
  accept(c, wins, g) {
    const first = (w, cells) => { const i = w.path.findIndex(([f, x]) => cells.some(([ff, xx]) => ff === f && xx === x)); return i < 0 ? 1e9 : i; };
    const good = (w) => { const p = first(w, c.plus), t = first(w, c.times); return p < 1e9 && t < 1e9 && p < t; };
    return wins.length > 0 && wins.every(good) && !g.win;
  },
};
T.OPTIONAL = {
  names: ['THE OPTIONAL ENEMY', 'GUARDED LOOT', 'RISK IT?', 'THE TREASURE GUARD', 'WORTH THE FIGHT?', 'SIDE QUEST'],
  tip: 'The guard is optional. Beat it for treasure, or play it safe.',
  star: 'treasure', minH: 3,
  plant(c) {
    const f = 1 + Math.floor(c.r() * (c.H - 2)), col = Math.floor(c.r() * c.W);
    c.grid[f][col] = { t: 'enemy', opt: true, drop: 'chest', v: nice(c.E(f) * U(c.r, 0.5, 0.9), c.messy) };
  },
  accept: (c, wins) => wins.some((w) => w.s.treasure) && wins.some((w) => !w.s.treasure),
};
T.TREASURE = {
  names: ['HIDDEN TREASURE', 'X MARKS THE SPOT', 'THE SECRET ROOM', 'LOST LOOT', 'PIRATE GOLD', 'FINDERS KEEPERS'],
  tip: "There's a chest up there somewhere. Can you reach it and still win?",
  star: 'treasure', minH: 3,
  plant(c) {
    const f = 1 + Math.floor(c.r() * (c.H - 2)), col = Math.floor(c.r() * c.W);
    c.grid[f][col] = { t: 'chest' };
  },
  accept: (c, wins) => wins.some((w) => w.s.treasure) && wins.some((w) => !w.s.treasure),
};
T.TIGHT = {
  names: ['NO ROOM FOR ERROR', 'RAZOR THIN', 'ONE TRUE PATH', 'BY A HAIR', 'EXACT CHANGE', 'EVERY POINT COUNTS', 'THE NARROW WAY', 'PERFECTION'],
  tip: 'Only the best route survives. Count carefully.',
  plant() {},
  accept: (c, wins, g) => wins.length >= 1 && wins.length <= 2 && !g.win,
};
T.LOCK = {
  names: ['THE LOCKED FLOOR', 'KEY KEEPER', 'BEHIND BARS', 'THE VAULT', 'UNLOCK IT', 'SKELETON KEY', 'LOCKED OUT'],
  tip: 'Beat the key keeper 🔑 to open the 🔒 locked room.',
  minH: 3,
  plant(c) {
    const f = Math.floor(c.r() * (c.H - 2)), col = Math.floor(c.r() * c.W);
    c.grid[f][col] = { t: 'enemy', drop: 'key', v: nice(c.E(f) * U(c.r, 0.4, 0.8), c.messy) };
    const f2 = f + 1 + Math.floor(c.r() * Math.min(2, c.H - f - 1)), col2 = Math.max(0, Math.min(c.W - 1, col + pick(c.r, [-1, 0, 1])));
    c.grid[f2][col2] = { t: 'gate', op: 'x', v: pick(c.r, [3, 4]), locked: true };
  },
  accept: (c, wins) => wins.length > 0 && wins.every((w) => w.s.unlocks > 0),
};
T.FROZEN = {
  names: ['COLD SNAP', 'THAW IT OUT', 'ICE AGE', 'BRING A TORCH', 'FROZEN SOLID', 'FIRE AND ICE', 'DEEP FREEZE'],
  tip: '❄ Frozen gates do nothing, unless you carry a 🔥 torch to thaw them.',
  minH: 3,
  plant(c) {
    const f = Math.floor(c.r() * (c.H - 2)), col = Math.floor(c.r() * c.W);
    c.grid[f][col] = c.r() < 0.5 ? { t: 'torch' } : { t: 'enemy', drop: 'torch', v: nice(c.E(f) * U(c.r, 0.3, 0.7), c.messy) };
    const f2 = f + 1 + Math.floor(c.r() * Math.min(2, c.H - f - 1)), col2 = Math.max(0, Math.min(c.W - 1, col + pick(c.r, [-1, 0, 1])));
    c.grid[f2][col2] = { t: 'gate', op: 'x', v: pick(c.r, [3, 4]), frozen: true };
    for (let x = 0; x < c.W; x++) if (x !== col2 && c.r() < 0.5) { const g = c.grid[f2][x]; if (g.t === 'gate' && !g.locked) g.frozen = true; }
  },
  accept: (c, wins) => wins.length > 0 && wins.every((w) => w.s.thaws > 0),
};
T.SEQUENCE = {
  names: ['SEQUENCE', 'KEY, THEN FIRE', 'STEP BY STEP', 'THE COMBINATION', 'IN THE RIGHT ORDER', 'DOUBLE LOCK'],
  tip: 'The best gate is locked AND frozen. You need a 🔑 and a 🔥, in time.',
  minH: 4,
  plant(c) {
    const f = Math.floor(c.r() * (c.H - 3)), col = Math.floor(c.r() * c.W);
    c.grid[f][col] = { t: 'enemy', drop: 'key', v: nice(c.E(f) * U(c.r, 0.4, 0.7), c.messy) };
    const col2 = Math.max(0, Math.min(c.W - 1, col + pick(c.r, [-1, 1])));
    c.grid[f + 1][col2] = { t: 'torch' };
    const col3 = Math.max(0, Math.min(c.W - 1, col2 + pick(c.r, [-1, 0, 1])));
    c.grid[f + 2][col3] = { t: 'gate', op: 'x', v: pick(c.r, [4, 5]), locked: true, frozen: true };
  },
  accept: (c, wins) => wins.length > 0 && wins.every((w) => w.s.unlocks > 0 && w.s.thaws > 0),
};
T.ARMOR = {
  names: ['ARMORED KNIGHTS', 'TIN CANS', 'SHIELD WALL', 'HEAVY METAL', 'THICK SKIN', 'IRON GUARD'],
  tip: '🛡 Armored enemies cost DOUBLE their number. Small numbers can still hurt.',
  plant(c) {
    for (let n = 0; n < 2 + Math.floor(c.r() * 2); n++) {
      const f = Math.floor(c.r() * c.H), col = Math.floor(c.r() * c.W);
      c.grid[f][col] = { t: 'enemy', ab: 'armor', v: nice(c.E(f) * U(c.r, 0.3, 0.5), c.messy) };
    }
  },
  accept: (c, wins, g) => wins.length > 0 && (!g.win || c.d < 2),
};
T.SPOILS = {
  names: ['SPOILS OF WAR', 'TO THE VICTOR', 'LOOT DROP', 'BOUNTY', 'PRIZE FIGHT', 'WAR CHEST'],
  tip: 'Some enemies drop a reward when you beat them. Check what they carry.',
  plant(c) {
    const f = Math.floor(c.r() * (c.H - 1)), col = Math.floor(c.r() * c.W);
    c.grid[f][col] = { t: 'enemy', drop: { op: 'x', v: pick(c.r, [2, 3, 3]) }, v: nice(c.E(f) * U(c.r, 0.55, 0.9), c.messy) };
  },
  accept: (c, wins) => wins.length > 0 && wins.every((w) => w.s.rewards > 0),
};
T.LAVA = {
  names: ['LAVA FLOOR', 'THE FLOOR IS LAVA', 'HOT FEET', 'MELTDOWN', 'SCORCHED', 'BURNING BRIDGES'],
  tip: '🔥 Lava burns a percentage of your power. Big power burns big.',
  minH: 3,
  plant(c) {
    const f = 1 + Math.floor(c.r() * (c.H - 2));
    for (let x = 0; x < c.W; x++) c.grid[f][x] = { t: 'gate', op: '%', v: pick(c.r, [25, 50]) };
    c.grid[f][Math.floor(c.r() * c.W)] = { t: 'enemy', v: nice(c.E(f) * U(c.r, 0.5, 0.9), c.messy) };
  },
  accept: (c, wins, g) => wins.length > 0 && !g.win,
};
T.THIEF = {
  names: ['THE POWER THIEF', 'PICKPOCKET', 'HALF AND HALF', 'DAYLIGHT ROBBERY', 'STICKY FINGERS', 'TAX COLLECTOR'],
  tip: 'Thieves steal HALF your power before the fight even starts.',
  minH: 3,
  plant(c) {
    T.TRAP.plant(c);
    const [f, col] = c.trap;
    for (let x = 0; x < c.W; x++) { const e = c.grid[f + 1][x]; if (e.t === 'enemy') { e.ab = 'thief'; e.v = nice(c.E(f) * U(c.r, 1.0, 2.0), c.messy); } }
    void col;
  },
  accept: (c, wins, g) => wins.length > 0 && !g.win,
};
T.SWITCH = {
  names: ['THE OPERATION SWITCH', 'FLIP IT', 'RUNE SWAP', 'REVERSAL', 'TOGGLE', 'THE LEVER', 'SWITCHEROO'],
  tip: '🔄 A switch flips every rune gate to its other side.',
  minH: 3,
  plant(c) {
    const f = Math.floor(c.r() * (c.H - 2)), col = Math.floor(c.r() * c.W);
    c.grid[f][col] = { t: 'switch' };
    let n = 0;
    for (let ff = f + 1; ff < c.H && n < 3; ff++) {
      const x = Math.floor(c.r() * c.W);
      const big = nice(c.E(ff) * U(c.r, 0.5, 1), c.messy);
      c.grid[ff][x] = c.r() < 0.5
        ? { t: 'gate', op: '/', v: pick(c.r, [2, 3]), sw: { op: 'x', v: pick(c.r, [2, 3]) } }
        : { t: 'gate', op: '-', v: big, sw: { op: '+', v: big } };
      n++;
    }
    // a rune gate below the switch that is better BEFORE flipping
    if (f > 0) { const x = Math.floor(c.r() * c.W); c.grid[f - 1][x] = { t: 'gate', op: 'x', v: 2, sw: { op: '/', v: 2 } }; }
  },
  accept: (c, wins) => wins.length > 0 && wins.every((w) => w.s.switches > 0),
};
T.CURSE = {
  names: ['CURSED BLADE', 'TWIST OF FATE', 'BACKWARDS DAY', 'HEX MARKS', 'TURN THE TABLES', 'BLESSING IN DISGUISE'],
  tip: '💀 Beating a cursed enemy flips your next gate: ÷ becomes ×, − becomes +.',
  minH: 3,
  plant(c) {
    const [f, col] = spot(c, 0, c.H - 2);
    c.grid[f][col] = { t: 'enemy', ab: 'curse', v: nice(c.E(f) * U(c.r, 0.3, 0.6), c.messy) };
    const bad = () => (c.r() < 0.5 ? { t: 'gate', op: '/', v: pick(c.r, [3, 4]) } : { t: 'gate', op: '-', v: nice(c.E(f) * U(c.r, 0.6, 1.0), c.messy) });
    c.grid[f + 1][col] = bad();
    for (const x of [col - 1, col + 1]) if (x >= 0 && x < c.W && (f !== 0 || x !== 0) && c.r() < 0.6) c.grid[f][x] = bad();
  },
  accept: (c, wins) => wins.length > 0 && wins.every((w) => w.s.goodFlips > 0),
};
T.DETOUR = {
  names: ['THE LONG WAY ROUND', 'DETOUR', 'GO AROUND', 'SIDE STEP', 'SCENIC ROUTE', 'ROADBLOCK', 'SIDEWAYS', 'THE HALLWAY'],
  tip: 'Straight up looks deadly. Walk sideways along the floors and find another way.',
  minW: 2, minH: 2,
  plant(c) {
    if (c.H > 1) c.grid[1][0] = { t: 'enemy', v: nice(c.E(1) * U(c.r, 2.5, 4), c.messy) };
    for (let n = 0; n < 1 + Math.floor(c.r() * 3); n++) { const [f, col] = spot(c, 1, c.H - 1); c.grid[f][col] = { t: 'wall' }; }
  },
  accept: (c, wins, g) => wins.length > 0 && wins.every((w) => sideways(w) >= 2) && (!g.win || c.d < 2),
};
T.GAUNTLET = {
  names: ['THE GAUNTLET', 'BOSS TOWER', 'THE FINAL CLIMB', 'THRONE ROOM', 'THE SUMMIT'],
  tip: 'Everything this world taught you, all at once.',
  minW: 3, minH: 5,
  plant(c) { for (const k of c.pool.slice(0, 2)) if (T[k] !== T.GAUNTLET && T[k].plant) T[k].plant(c); },
  accept: (c, wins, g) => wins.length >= 1 && wins.length <= 3 && !g.win,
};

const POOLS = [
  ['DETOUR', 'FORK', 'TRAP', 'ORDER', 'OPTIONAL', 'TREASURE', 'TIGHT'],
  ['FROZEN', 'LOCK', 'SEQUENCE', 'DETOUR', 'FROZEN', 'LOCK', 'FORK', 'TRAP', 'OPTIONAL', 'TIGHT'],
  ['ARMOR', 'SPOILS', 'LAVA', 'DETOUR', 'ARMOR', 'SPOILS', 'LAVA', 'TRAP', 'ORDER', 'TREASURE', 'TIGHT'],
  ['THIEF', 'SWITCH', 'CURSE', 'DETOUR', 'THIEF', 'SWITCH', 'CURSE', 'FORK', 'OPTIONAL', 'TIGHT'],
  ['SEQUENCE', 'SWITCH', 'CURSE', 'THIEF', 'SPOILS', 'LAVA', 'DETOUR', 'ARMOR', 'LOCK', 'FROZEN', 'TRAP', 'ORDER', 'TREASURE', 'TIGHT'],
];
const INTRO_FIRST = [null, 'FROZEN', 'ARMOR', 'THIEF', null];

// ---------------------------------------------------------------- random board
function randomCell(c, f) {
  const r = c.r, w = c.world, E = c.E(f), m = c.messy;
  const mech = WORLDS[w].mech;
  const roll = r();
  if (c.d >= 2 && f > 0 && r() < 0.05) return { t: 'wall' };
  if (roll < 0.36) { // enemy
    const e = { t: 'enemy', v: nice(E * U(r, 0.35, 0.95), m) };
    if (mech.includes('armor') && r() < 0.2) { e.ab = 'armor'; e.v = nice(E * U(r, 0.2, 0.45), m); }
    else if (mech.includes('thief') && r() < 0.15) { e.ab = 'thief'; e.v = nice(E * U(r, 0.15, 0.35), m); }
    else if (mech.includes('curse') && r() < 0.1) { e.ab = 'curse'; e.v = nice(E * U(r, 0.2, 0.5), m); }
    if (mech.includes('reward') && r() < 0.12) e.drop = { op: '+', v: nice(E * U(r, 0.8, 1.6), m) };
    return e;
  }
  if (roll < 0.40) return { t: 'empty' };
  if (mech.includes('lava') && roll < 0.45) return { t: 'gate', op: '%', v: pick(r, [25, 50]) };
  if (mech.includes('torch') && roll < 0.47) return { t: 'torch' };
  const g = r();
  let cell;
  if (g < 0.5) cell = { t: 'gate', op: '+', v: nice(E * U(r, 0.25, 1.0), m) };
  else if (g < 0.68) cell = { t: 'gate', op: 'x', v: pick(r, [2, 2, 2, 3, 3]) };
  else if (g < 0.88) cell = { t: 'gate', op: '-', v: nice(E * U(r, 0.2, 0.6), m) };
  else cell = { t: 'gate', op: '/', v: pick(r, [2, 2, 3]) };
  if (mech.includes('frozen') && (cell.op === '+' || cell.op === 'x') && r() < 0.15) cell.frozen = true;
  return cell;
}

function sizeFor(d, world, k, tpl, r) {
  let W = [2, 2, pick(r, [2, 3]), 3, pick(r, [3, 4])][d];
  let H = [pick(r, [2, 3]), pick(r, [3, 4]), 4, pick(r, [4, 5]), pick(r, [5, 6])][d] + (world >= 2 ? 1 : 0);
  if (k === 24) { W = 4; H = 6 + (world >= 2 ? 1 : 0); }
  W = Math.max(W, tpl.minW || 1); H = Math.min(7, Math.max(H, tpl.minH || 2));
  return { W, H };
}

// powers of every surviving partial route that has climbed floors 0..f-1
function powersBefore(c, f) {
  if (f === 0) return [c.S];
  const L = { W: c.W, H: f, grid: c.grid, br: c.br }; // floors below f only; "up" from the top = into floor f
  const out = [];
  const walk = (ff, cc, s) => {
    if (out.length > 4000) return;
    for (const m of TL.moves(L, ff, cc, s)) {
      if (m.f >= f) { out.push(s.p); continue; }
      const r = TL.step(L, s, m.f, m.c);
      if (!r.s.dead) walk(m.f, m.c, r.s);
    }
  };
  walk(-1, -1, TL.fresh(c.S));
  return out.length ? out : [c.S];
}
const MIN_ROUTES = [3, 6, 10, 16, 24];

function build(i, tplName, attempt) {
  const world = Math.floor(i / 25), k = i % 25;
  const d = k === 24 ? 4 : Math.min(4, Math.floor(k / 5));
  const r = mulberry32(9001 + i * 7919 + attempt * 104729);
  const tpl = T[tplName];
  const { W, H } = sizeFor(d, world, k, tpl, r);
  const starts = [10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 80, 100, 120, 150, 200, 250, 300, 400, 500];
  const S = pick(r, starts);
  const c = { r, W, H, world, d, k, S, messy: d >= 3, pool: POOLS[world].filter((n) => n !== tplName) };
  const pClose = [0.08, 0.15, 0.25, 0.3, 0.35][d];
  c.br = [...Array(H)].map(() => [...Array(Math.max(0, W - 1))].map(() => (r() < pClose ? 0 : 1)));
  // Size each floor's numbers from the power a player could really have when they get there.
  c.Emed = [];
  c.E = (f) => c.Emed[Math.min(f, c.Emed.length - 1)] || S;
  c.grid = [];
  for (let f = 0; f < H; f++) {
    const ps = powersBefore(c, f).sort((a, b) => a - b);
    c.Emed[f] = Math.max(4, ps[Math.floor(ps.length * 0.55)]);
    c.grid[f] = [...Array(W)].map(() => randomCell(c, f));
  }
  if (c.grid[0][0].t === 'wall') c.grid[0][0] = { t: 'empty' };
  if (tplName === 'GAUNTLET') c.pool = [pick(r, POOLS[world].slice(0, 3)), pick(r, POOLS[world].slice(3))];
  tpl.plant(c);
  return { c, tpl, d, world, k };
}

function evaluate(i, tplName, attempt) {
  const { c, tpl, d, world, k } = build(i, tplName, attempt);
  const L = { W: c.W, H: c.H, start: c.S, grid: c.grid, br: c.br, boss: { t: 'boss', v: 0 } };
  const all = TL.solve(L);
  if (all.length > 30000 || all.length < MIN_ROUTES[d]) return null;
  const top = all.filter((x) => x.pre !== undefined).sort((a, b) => b.pre - a.pre);
  if (!top.length) return null;
  const distinct = [...new Set(top.map((x) => x.pre))];
  const total = all.length;
  // try each possible boss threshold; keep the one closest to the difficulty target that passes the gimmick test
  let best = null;
  for (let j = 0; j < distinct.length; j++) {
    const hi = distinct[j], lo = j + 1 < distinct.length ? distinct[j + 1] : 0;
    const winsN = top.filter((x) => x.pre >= hi).length;
    if (d === 4 && winsN > 2) break;
    if (d < 4 && winsN / total > TARGET[d] * 1.8 && j > 0) break;
    if (d <= 1 && winsN < 2 && distinct.length > 1 && j === 0 && total > 3) continue;
    // the boss must stop every weaker route, and shouldn't look like a pushover
    const floor = Math.max(lo, Math.ceil(hi * 0.4));
    const bossV = Math.max(1, floor + Math.floor((hi - 1 - floor) * U(c.r, 0.45, 0.95)));
    if (bossV >= hi || bossV < lo) continue;
    const boss = { t: 'boss', v: bossV };
    // the boss is the last fight, so each route's result follows from its power before the boss
    const wins = top.filter((x) => x.pre > bossV).map((x) => ({ ...x, win: true, s: TL.enter(x.top, boss).s }));
    // greedy play can walk sideways on the top floor instead of fighting, so it depends on the boss number
    const g = TL.greedy({ ...L, boss });
    if (!wins.length) continue;
    if (d >= 2 && g.win) continue;
    if (!tpl.accept(c, wins, g, all)) continue;
    const score = Math.abs(wins.length / total - TARGET[d]);
    if (!best || score < best.score) best = { score, L: { ...L, boss }, wins, res: all, g };
  }
  if (!best) return null;
  return { ...best, c, tpl, d, world, k };
}

function chooseStar(i, tpl, wins) {
  if (tpl.star === 'treasure') return { type: 'treasure', text: 'Grab the treasure 💰' };
  const finals = wins.map((w) => w.s.p), kills = wins.map((w) => w.s.kills);
  const opts = [];
  const bestP = Math.max(...finals);
  if (new Set(finals).size > 1) opts.push({ type: 'power', v: bestP, text: `Finish with ${bestP}+ power` });
  if (wins.some((w) => !w.s.neg) && wins.some((w) => w.s.neg)) opts.push({ type: 'noneg', text: 'Never use a − or ÷ gate' });
  if (Math.max(...kills) > Math.min(...kills)) opts.push({ type: 'kills', v: Math.max(...kills), text: `Defeat ${Math.max(...kills)} enemies` });
  if (opts.length) return opts[i % opts.length];
  return null;
}

// ---------------------------------------------------------------- hand-made tutorial levels
const E = (v, x = {}) => ({ t: 'enemy', v, ...x });
const G = (op, v, x = {}) => ({ t: 'gate', op, v, ...x });
const TUTORIAL = [
  { name: 'STEP RIGHT UP', tip: 'Tap a glowing room to move into it. You can go LEFT, RIGHT or UP, never down.', start: 10, W: 2, H: 1,
    grid: [[G('+', 5), G('-', 3)]], boss: 12, star: { type: 'time', v: 20, text: 'Finish in under 20s' } },
  { name: 'FIGHT!', tip: 'Beat enemies with a BIGGER number. You keep what is left: 20 vs 8 leaves 12.', start: 20, W: 2, H: 2,
    grid: [[E(8), E(25)], [G('+', 10), G('+', 4)]], boss: 18, star: { type: 'power', v: 8, text: 'Finish with 8+ power' } },
  { name: 'TIMES TWO', tip: '× multiplies your power. Walk across the bridge to grab it first.', start: 15, W: 2, H: 2,
    grid: [[{ t: 'empty' }, G('x', 2)], [E(12), G('+', 5)]], boss: 30, star: { type: 'power', v: 5, text: 'Finish with 5+ power' } },
  { name: 'THE LONG WAY', tip: 'Straight up is deadly. Walk sideways first. Each room can only be used once!', start: 50, W: 3, H: 2,
    grid: [[{ t: 'empty' }, G('+', 20), G('x', 2)], [E(200), E(60), G('+', 10)]], boss: 120, star: { type: 'time', v: 30, text: 'Finish in under 30s' } },
];

// ---------------------------------------------------------------- main
function main() {
  const levels = [];
  const usedNames = new Set();
  const counters = {};
  const stats = { tries: 0, fails: [] };
  for (let i = 0; i < 125; i++) {
    const world = Math.floor(i / 25), k = i % 25;
    if (i < TUTORIAL.length) {
      const t = TUTORIAL[i];
      const L = { W: t.W, H: t.H, start: t.start, grid: t.grid, br: t.br || t.grid.map(() => [...Array(t.W - 1)].map(() => 1)), boss: { t: 'boss', v: t.boss } };
      const wins = TL.solve(L).filter((x) => x.win);
      if (!wins.length) throw new Error('tutorial level ' + (i + 1) + ' is unsolvable');
      const best = wins.sort((a, b) => b.s.p - a.s.p)[0];
      levels.push({ id: i + 1, world, diff: 'EASY', name: t.name, tip: t.tip, gimmick: 'TUTORIAL', ...L, star: t.star, sol: best.path, routes: TL.solve(L).length, winRoutes: wins.length });
      usedNames.add(t.name);
      continue;
    }
    const pool = POOLS[world];
    let order;
    if (k === 24) order = ['GAUNTLET'];
    else if (k === 0 && INTRO_FIRST[world]) order = [INTRO_FIRST[world]];
    else order = [pool[(k * 3 + world) % pool.length]]; // 3 shares no factor with any pool size, so every template gets used
    order.push(...pool, 'TIGHT');
    let made = null;
    for (const name of order) {
      for (let a = 0; a < 400 && !made; a++) {
        stats.tries++;
        const ev = evaluate(i, name, a);
        if (ev) made = { name, ev };
      }
      if (made) break;
      stats.fails.push(`${i + 1}:${name}`);
    }
    if (!made) throw new Error('could not build level ' + (i + 1));
    const { name, ev } = made;
    const tpl = T[name];
    counters[name] = (counters[name] || 0) + 1;
    let title = tpl.names[(counters[name] - 1) % tpl.names.length];
    if (usedNames.has(title)) title = `${title} ${['II', 'III', 'IV', 'V', 'VI'][Math.min(4, Math.floor((counters[name] - 1) / tpl.names.length))]}`;
    usedNames.add(title);
    const star = chooseStar(i, tpl, ev.wins) || { type: 'time', v: 15 + 6 * ev.L.H, text: `Finish in under ${15 + 6 * ev.L.H}s` };
    const best = ev.wins.slice().sort((a, b) => b.s.p - a.s.p)[0];
    levels.push({
      id: i + 1, world, diff: k === 24 ? 'BOSS' : DIFF[ev.d], name: title, tip: tpl.tip, gimmick: name,
      W: ev.L.W, H: ev.L.H, start: ev.L.start, grid: ev.L.grid, br: ev.L.br, boss: ev.L.boss, star, sol: best.path,
      routes: ev.res.length, winRoutes: ev.wins.length,
    });
  }
  // the first time a mechanic shows up, the level explains it
  const INTRO = {
    frozen: '❄ NEW: Frozen gates do nothing unless you carry a 🔥 torch. Walking through a torch room picks one up.',
    key: '🔑 NEW: Some enemies carry keys. A key opens one 🔒 locked room.',
    armor: '🛡 NEW: Armored enemies cost DOUBLE their number to beat.',
    reward: '🎁 NEW: Some enemies drop a bonus when you beat them.',
    lava: '🔥 NEW: Lava burns a percentage of your power, so it hurts more when you are strong.',
    thief: '🦹 NEW: Thieves steal half your power before the fight starts.',
    curse: '💀 NEW: Beat a cursed enemy and your next gate flips: ÷ becomes ×, − becomes +.',
    switch: '🔄 NEW: Switches flip every rune gate to its other value.',
    chest: '💰 NEW: Treasure! Grab it for the third star.',
    wall: '🧱 NEW: Solid walls block the way. Find a route around them.',
  };
  const seen = new Set();
  for (const L of levels) {
    const found = new Set();
    const scan = (cell) => {
      if (cell.frozen) found.add('frozen');
      if (cell.t === 'torch' || cell.drop === 'torch') found.add('frozen');
      if (cell.locked || cell.drop === 'key') found.add('key');
      if (cell.ab === 'armor') found.add('armor');
      if (cell.drop && cell.drop.op) found.add('reward');
      if (cell.op === '%') found.add('lava');
      if (cell.ab === 'thief') found.add('thief');
      if (cell.ab === 'curse') found.add('curse');
      if (cell.t === 'switch' || cell.sw) found.add('switch');
      if (cell.t === 'chest' || cell.drop === 'chest') found.add('chest');
      if (cell.t === 'wall') found.add('wall');
    };
    L.grid.forEach((row) => row.forEach(scan));
    const intros = [...found].filter((m) => !seen.has(m));
    intros.forEach((m) => seen.add(m));
    if (intros.length) L.intro = intros.map((m) => INTRO[m]);
  }
  const out = `/* GENERATED by tools/gen-tower-levels.js — do not edit by hand. */\nwindow.TOWER_WORLDS = ${JSON.stringify(WORLDS.map((w) => w.name))};\nwindow.TOWER_LEVELS = ${JSON.stringify(levels)};\n`;
  fs.writeFileSync(path.join(__dirname, '../js/games/tower/levels.js'), out);
  // report
  const by = {};
  for (const L of levels) { const w = WORLDS[L.world].name; by[w] ||= []; by[w].push(`${L.id}:${L.gimmick}/${L.diff}/${L.W}x${L.H} win ${L.winRoutes}/${L.routes}`); }
  for (const w in by) console.log(w + '\n  ' + by[w].join('\n  '));
  console.log('tries', stats.tries, 'template fallbacks', stats.fails.length, stats.fails.slice(0, 20).join(' '));
  console.log('bytes', out.length);
}
main();
