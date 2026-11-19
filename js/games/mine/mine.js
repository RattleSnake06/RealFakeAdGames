/* =====================================================================
   ORE RUSH — Game 1 (arcade idle mining)
   Drive the digger into the ore, unload at the grinder, grab the coins,
   park on upgrade pads. Goal: earn $1,000,000.
   Needs window.THREE (three.js r159 UMD build, vendored in js/vendor).
   ===================================================================== */
(() => {
  'use strict';
  const T = window.THREE;

  // ------------------------------------------------------------------
  // Tuning
  // ------------------------------------------------------------------
  const TIERS = [
    { name: 'COPPER',  color: 0xe07a3c, metal: 1.0, rough: 0.30, value: 1,   gem: false, css: '#e07a3c' },
    { name: 'SILVER',  color: 0xe4e9f2, metal: 1.0, rough: 0.20, value: 3,   gem: false, css: '#b9c3d6' },
    { name: 'GOLD',    color: 0xffc330, metal: 1.0, rough: 0.20, value: 8,   gem: false, css: '#ffc330' },
    { name: 'EMERALD', color: 0x10c266, metal: 0.2, rough: 0.06, value: 25,  gem: true,  css: '#1fd67a', glow: 0x04381c },
    { name: 'RUBY',    color: 0xff2d5c, metal: 0.2, rough: 0.06, value: 70,  gem: true,  css: '#ff2d5c', glow: 0x3d0210 },
    { name: 'DIAMOND', color: 0xc6f6ff, metal: 0.3, rough: 0.02, value: 200, gem: true,  css: '#7fe3ff', glow: 0x1d4652 },
  ];
  const BAND = 16;                                     // depth of each ore band
  const FIELD_START = -6;                              // ore begins here (north of base)
  const FIELD_END = FIELD_START - BAND * TIERS.length; // -102
  const HALF_W = 11;                                   // field half-width
  const CLAMP_X = 10.4, BASE_S = 11;                   // drivable bounds
  const MILESTONES = [100, 500, 2e3, 6e3, 2e4, 6e4, 1.5e5, 3.5e5, 6.5e5, 1e6];
  const CART_CAP = [20, 35, 55, 80, 110, 150, 200, 260, 330, 400];
  const REGROW_AFTER = 40;                             // seconds before mined ore grows back

  const nice = (n) => { const p = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 1); return Math.round(n / p) * p; };
  const UPG = [
    { id: 'pickaxe', name: 'PICKAXE', icon: '⛏️', color: '#ff4f7b', max: 6, start: 1, pos: [3.4, -1.5],
      cost: (l) => [60, 450, 3000, 15000, 80000][l - 1], next: (l) => `Mine ${TIERS[l].name}` },
    { id: 'engine', name: 'ENGINE', icon: '🚜', color: '#ffb81c', max: 8, start: 1, pos: [6.8, -1.5],
      cost: (l) => nice(35 * 2.1 ** (l - 1)), next: () => 'Drive faster' },
    { id: 'cart', name: 'CART', icon: '🛒', color: '#2fb4ff', max: 10, start: 1, pos: [10.2, -1.5],
      cost: (l) => nice(45 * 2.25 ** (l - 1)), next: (l) => `Holds ${CART_CAP[l]} ore` },
    { id: 'grinder', name: 'GRINDER', icon: '⚙️', color: '#8d5bff', max: 10, start: 1, pos: [5.1, 4],
      cost: (l) => nice(90 * 2.3 ** (l - 1)), next: (l) => `x${(1 + 0.25 * l).toFixed(2)} value, faster` },
    { id: 'collector', name: 'AUTO COLLECT', icon: '🤖', color: '#27c46b', max: 5, start: 0, pos: [8.5, 4],
      cost: (l) => [400, 2000, 8000, 30000, 100000][l], next: (l) => (l === 0 ? 'Collects coins for you' : 'Collects faster') },
  ];

  // World layout
  const GRINDER = { x: -8, z: -1.5 };
  const SELL = { x: -8, z: 2.7 };
  const PILE = { x: -3.6, z: -1.4 };
  const VAULT = { x: -3.6, z: 3.6 };
  const START = { x: 0, z: 8 };

  const OL = 0x2a1650;

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  const fmt = (n) => {
    n = Math.floor(n);
    if (n < 1e4) return '$' + n.toLocaleString('en-US');
    if (n < 1e6) return '$' + (n / 1e3).toFixed(n < 1e5 ? 1 : 0) + 'K';
    return '$' + (n / 1e6).toFixed(n < 1e7 ? 2 : 1) + 'M';
  };
  const mulberry32 = (a) => () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const std = (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0, ...o });
  const BOX = new T.BoxGeometry(1, 1, 1);
  function box(mat, sx, sy, sz, x = 0, y = 0, z = 0, parent) {
    const m = new T.Mesh(BOX, mat);
    m.scale.set(sx, sy, sz); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    if (parent) parent.add(m);
    return m;
  }
  const angleTo = (a, b, max) => {
    let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + Math.max(-max, Math.min(max, d));
  };
  const easeOutBack = (t) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;

  // A soft studio environment so metals and gems look shiny (no image files needed).
  function makeEnvironment(renderer) {
    const s = new T.Scene();
    const room = new T.Mesh(BOX, new T.MeshBasicMaterial({ color: 0x8476c8, side: T.BackSide }));
    room.scale.set(30, 16, 30); room.position.y = 7; s.add(room);
    const floor = new T.Mesh(new T.PlaneGeometry(30, 30), new T.MeshBasicMaterial({ color: 0x35286a }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.9; s.add(floor);
    const panel = (c, k, x, y, z, sx, sy, sz) => {
      const m = new T.MeshBasicMaterial({ color: c }); m.color.multiplyScalar(k);
      const b = new T.Mesh(BOX, m); b.position.set(x, y, z); b.scale.set(sx, sy, sz); s.add(b);
    };
    panel(0xffffff, 7, 0, 14.6, 0, 12, 0.2, 12);
    panel(0xffe0b0, 4, -14.6, 6, 4, 0.2, 6, 10);
    panel(0xb8e4ff, 3.5, 14.6, 6, -4, 0.2, 6, 10);
    panel(0xffa6dc, 2.5, 0, 5, -14.6, 10, 4, 0.2);
    const pm = new T.PMREMGenerator(renderer);
    const tex = pm.fromScene(s, 0.04).texture;
    pm.dispose();
    return tex;
  }

  function canvasTex(draw, size = 256) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    draw(c.getContext('2d'), size);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4;
    return t;
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  const padTexture = (color, kind) => canvasTex((g, S) => {
    g.fillStyle = '#2a1650'; roundRect(g, 0, 0, S, S, 44); g.fill();
    g.fillStyle = '#ffffff'; roundRect(g, 10, 10, S - 20, S - 20, 36); g.fill();
    g.fillStyle = color; roundRect(g, 22, 22, S - 44, S - 44, 28); g.fill();
    if (kind === 'sell') {
      g.save(); roundRect(g, 22, 22, S - 44, S - 44, 28); g.clip();
      g.fillStyle = '#2a1650';
      for (let i = -S; i < S * 2; i += 44) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 22, 0); g.lineTo(i + 22 - S, S); g.lineTo(i - S, S); g.fill(); }
      g.restore();
      g.fillStyle = '#2a1650'; roundRect(g, 48, 84, S - 96, 88, 18); g.fill();
      g.fillStyle = '#ffe14d'; g.font = '64px "Lilita One", "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('SELL', S / 2, S / 2 + 4);
    } else {
      g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = '#2a1650'; g.fillStyle = '#ffffff';
      g.beginPath(); g.moveTo(128, 52); g.lineTo(200, 128); g.lineTo(158, 128); g.lineTo(158, 200);
      g.lineTo(98, 200); g.lineTo(98, 128); g.lineTo(56, 128); g.closePath(); g.stroke(); g.fill();
    }
  });

  // ------------------------------------------------------------------
  // Flying objects (ore into the cart, coins into the pile, etc.)
  // ------------------------------------------------------------------
  class Flyers {
    constructor(scene, geo, mat, cap, colored) {
      this.mesh = new T.InstancedMesh(geo, mat, cap);
      this.mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
      this.mesh.frustumCulled = false; this.mesh.count = 0; this.mesh.castShadow = true;
      if (colored) this.mesh.setColorAt(0, new T.Color());
      scene.add(this.mesh);
      this.cap = cap; this.list = []; this.colored = colored;
      this._m = new T.Matrix4(); this._q = new T.Quaternion(); this._e = new T.Euler(); this._p = new T.Vector3();
      this._s = new T.Vector3(); this._to = new T.Vector3(); this._c = new T.Color();
    }
    add(from, to, dur, h, scale, color, onArrive) {
      if (this.list.length >= this.cap) { onArrive && onArrive(); return; }
      this.list.push({ from: from.clone(), to, dur, h, scale, color, onArrive, t: 0, spin: Math.random() * 6 });
    }
    update(dt) {
      const L = this.list;
      for (let i = L.length - 1; i >= 0; i--) {
        const f = L[i];
        f.t += dt / f.dur;
        if (f.t >= 1) { f.onArrive && f.onArrive(); L[i] = L[L.length - 1]; L.pop(); }
      }
      for (let i = 0; i < L.length; i++) {
        const f = L[i];
        const to = typeof f.to === 'function' ? f.to(this._to) : f.to;
        const e = f.t * f.t * (3 - 2 * f.t);
        this._p.lerpVectors(f.from, to, e); this._p.y += f.h * 4 * e * (1 - e);
        this._q.setFromEuler(this._e.set(f.spin + f.t * 9, f.spin + f.t * 6, 0));
        this._s.setScalar(f.scale * (f.t > 0.85 ? 1 - (f.t - 0.85) * 3 : 1));
        this._m.compose(this._p, this._q, this._s);
        this.mesh.setMatrixAt(i, this._m);
        if (this.colored) this.mesh.setColorAt(i, this._c.setHex(f.color));
      }
      this.mesh.count = L.length;
      this.mesh.instanceMatrix.needsUpdate = true;
      if (this.colored && this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    }
  }

  // ------------------------------------------------------------------
  // The game
  // ------------------------------------------------------------------
  class OreRush {
    constructor(stage, api) {
      this.stage = stage; this.api = api;
      const d = (this.d = api.data);
      d.money ??= 0; d.total ??= 0; d.ms ??= 0; d.won ??= false; d.bought ??= 0;
      d.up ??= {}; d.paid ??= {};
      for (const u of UPG) { d.up[u.id] ??= u.start; d.paid[u.id] ??= 0; }
      this.mobile = matchMedia('(pointer: coarse)').matches;
      this.time = 0; this.running = true; this.disposed = false;
      this.cargo = []; this.hopper = []; this.pile = 0;
      this.pos = new T.Vector2(START.x, START.z); this.heading = 0; this.speed = 0;
      this.budget = 0; this.grindBudget = 0; this.unloadBudget = 0; this.autoT = 0; this.payFx = 0;
      this.cool = {}; this.floats = []; this.shake = 0; this.moneyShown = d.money; this.lastHard = -99;
      this.keys = new Set(); this.joy = { on: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
      this.tmp = new T.Vector3(); this.tmp2 = new T.Vector3(); this.m4 = new T.Matrix4(); this.q = new T.Quaternion();

      this.buildDom();
      this.initThree();
      this.buildWorld();
      this.bindInput();
      this.applyUpgrades();
      this.updateHud(true);
      this.last = performance.now();
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
      this.banner(d.total > 0 ? 'WELCOME BACK!' : 'ORE RUSH!');
      if (/[?&]debug\b/.test(location.search)) window.ORE = this; // handy for testing in the console
    }

    get S() {
      const u = this.d.up;
      return {
        maxTier: u.pickaxe - 1,
        drill: 9 + 5 * (u.pickaxe - 1),
        speed: 4.6 + 0.75 * (u.engine - 1),
        cap: CART_CAP[u.cart - 1],
        grind: 6 + 3 * (u.grinder - 1),
        mult: 1 + 0.25 * (u.grinder - 1),
        autoEvery: [0, 2.5, 1.6, 1.0, 0.6, 0.35][u.collector],
      };
    }

    // ---------------- DOM / HUD ----------------
    buildDom() {
      const st = this.stage;
      st.classList.add('mine-stage');
      st.innerHTML = `
        <canvas class="mine-canvas"></canvas>
        <div class="mh-labels"></div>
        <div class="mh-top">
          <div class="mh-money"><i class="coin"></i><b>$0</b></div>
          <div class="mh-goal"><span class="mh-goal-t">GOAL</span><span class="progress"><i></i></span><span class="mh-goal-v">$1M</span></div>
        </div>
        <div class="mh-bottom">
          <div class="mh-hint"></div>
          <div class="mh-cargo"><span class="mh-cargo-t">ORE</span><span class="progress"><i></i></span><b>0/20</b></div>
        </div>
        <div class="mh-joy"><i></i></div>
        <div class="mh-banner"></div>
        <div class="mh-win" hidden>
          <div class="panel">
            <div class="panel-head b-green">THE AD WAS REAL!</div>
            <div class="panel-body">
              <p class="mh-win-big">$1,000,000</p>
              <p>You dug your way from zero to a million. Game cleared! ★</p>
              <button class="btn b-orange" data-mine="keep">KEEP DIGGING</button>
              <button class="btn b-blue" data-action="back-menu">BACK TO MENU</button>
            </div>
          </div>
        </div>`;
      const q = (s) => st.querySelector(s);
      this.el = {
        canvas: q('.mine-canvas'), labels: q('.mh-labels'), money: q('.mh-money b'),
        goalBar: q('.mh-goal .progress i'), goalT: q('.mh-goal-t'), goalV: q('.mh-goal-v'),
        hint: q('.mh-hint'), cargo: q('.mh-cargo'), cargoBar: q('.mh-cargo .progress i'), cargoT: q('.mh-cargo b'),
        joy: q('.mh-joy'), knob: q('.mh-joy i'), banner: q('.mh-banner'), win: q('.mh-win'),
      };
      q('[data-mine=keep]').addEventListener('click', () => { this.el.win.hidden = true; });
    }

    label(html, x, y, z, cls = 'm-tag', anchor = 'bottom') {
      const el = document.createElement('div');
      el.className = 'm-label ' + cls; el.innerHTML = html;
      this.el.labels.appendChild(el);
      const L = { el, pos: new T.Vector3(x, y, z), anchor, show: true };
      (this.labels ||= []).push(L);
      return L;
    }
    float(text, pos, cls = '') {
      const el = document.createElement('div');
      el.className = 'm-label m-float ' + cls; el.textContent = text;
      this.el.labels.appendChild(el);
      this.floats.push({ el, pos: pos.clone(), t: 0 });
    }
    banner(text) {
      const b = this.el.banner; b.textContent = text; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    }
    throttle(key, sec) { if ((this.cool[key] || -99) > this.time - sec) return false; this.cool[key] = this.time; return true; }

    // ---------------- three.js setup ----------------
    initThree() {
      const r = (this.renderer = new T.WebGLRenderer({ canvas: this.el.canvas, antialias: true, powerPreference: 'high-performance' }));
      r.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.5 : 2));
      r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 0.92;
      r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
      const scene = (this.scene = new T.Scene());
      scene.background = new T.Color(0x9b8cdb);
      scene.fog = new T.Fog(0x9b8cdb, 38, 72);
      scene.environment = makeEnvironment(r);
      this.camera = new T.PerspectiveCamera(45, 1, 0.5, 200);
      this.camOff = new T.Vector3(0, 16, 11.5);
      this.camPos = new T.Vector3(START.x, 16, START.z + 11.5);
      scene.add(new T.HemisphereLight(0xffffff, 0x6a58b8, 0.35));
      const sun = (this.sun = new T.DirectionalLight(0xfff2dc, 2.0));
      sun.castShadow = true;
      const ss = this.mobile ? 1024 : 2048;
      sun.shadow.mapSize.set(ss, ss);
      Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 60 });
      sun.shadow.camera.updateProjectionMatrix();
      sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
      scene.add(sun, sun.target);

      this.resize = () => {
        const w = this.stage.clientWidth, h = this.stage.clientHeight;
        if (!w || !h) return;
        r.setSize(w, h, false);
        const a = w / h, portrait = a < 0.9;
        this.camera.aspect = a; this.camera.fov = portrait ? 52 : 42;
        this.camOff.set(0, portrait ? 20 : 17.5, portrait ? 13.5 : 12.5);
        this.portrait = portrait; this.vw = w; this.vh = h;
        this.camera.updateProjectionMatrix();
      };
      this.ro = new ResizeObserver(this.resize); this.ro.observe(this.stage); this.resize();
    }

    // ---------------- World ----------------
    buildWorld() {
      const sc = this.scene;
      // Ground layers
      const ground = new T.Mesh(new T.PlaneGeometry(140, 240), std(0x9a8bdb, { roughness: 1 }));
      ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, -45); ground.receiveShadow = true; sc.add(ground);
      const fieldLen = FIELD_START - FIELD_END + 4;
      const floor = new T.Mesh(new T.PlaneGeometry(HALF_W * 2 + 3, fieldLen), std(0xd4caf8, { roughness: 0.95 }));
      floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.005, (FIELD_START + FIELD_END) / 2 - 1); floor.receiveShadow = true; sc.add(floor);
      const tiles = canvasTex((g, S) => {
        g.fillStyle = '#f4f0ff'; g.fillRect(0, 0, S, S);
        g.strokeStyle = '#dcd2f7'; g.lineWidth = 8; g.strokeRect(4, 4, S - 8, S - 8);
      }, 128);
      tiles.wrapS = tiles.wrapT = T.RepeatWrapping; tiles.repeat.set(13, 9);
      const base = new T.Mesh(new T.PlaneGeometry(26, 18), std(0xe9e3ff, { map: tiles, roughness: 0.9 }));
      base.rotation.x = -Math.PI / 2; base.position.set(0, 0.01, 3.5); base.receiveShadow = true; sc.add(base);
      // Curb between base and field
      const curbMat = std(0xffc21c, { roughness: 0.5 });
      for (let x = -12; x <= 12; x += 2.4) {
        if (Math.abs(x) < 3) continue; // gap for the road
        box(curbMat, 1.6, 0.25, 0.5, x, 0.125, -5.3, sc);
      }

      this.oreMat = std(0xffffff, { metalness: 0.85, roughness: 0.22 });
      this.coinGeo = new T.CylinderGeometry(0.26, 0.26, 0.07, 16);
      this.coinMat = std(0xffb000, { metalness: 1, roughness: 0.32 });
      this.buildRocks();
      this.buildOre();
      this.buildVehicle();
      this.buildGrinder();
      this.buildPile();
      this.buildVault();
      this.buildPads();

      // Flyers
      this.oreFly = new Flyers(sc, new T.IcosahedronGeometry(0.22, 1), this.oreMat, 220, true);
      this.coinFly = new Flyers(sc, this.coinGeo, this.coinMat, 260, false);

      // Arrow that points to the SELL pad when the cart is full
      const arrow = (this.arrow = new T.Group());
      const am = std(0xffe14d, { emissive: 0x6b4a00, roughness: 0.4 });
      const head = new T.Mesh(new T.ConeGeometry(0.5, 0.9, 4), am); head.rotation.x = -Math.PI / 2; head.position.z = -0.6;
      const shaft = box(am, 0.35, 0.18, 0.9, 0, 0, 0.2);
      arrow.add(head, shaft); arrow.visible = false; sc.add(arrow);

      // Band signs
      TIERS.forEach((t, i) => {
        const z = FIELD_START - i * BAND - 0.5;
        this['band' + i] = this.label('', 0, 1.4, z, 'm-tag m-band');
      });
      this.label('GRINDER', GRINDER.x, 4.4, GRINDER.z, 'm-tag');
      this.pileLabel = this.label('', PILE.x, 1.9, PILE.z, 'm-tag m-cash');
    }

    buildRocks() {
      const rng = mulberry32(7);
      const geo = new T.DodecahedronGeometry(1, 0);
      const mat = std(0xffffff, { roughness: 0.85, flatShading: true });
      const items = [];
      const add = (x, y, z, sx, sy, sz) => items.push([x, y, z, sx, sy, sz]);
      for (let z = 14; z > FIELD_END - 4; z -= 2.1) {
        for (const side of [-1, 1]) {
          add(side * (12.8 + rng() * 1.2), 0.4, z + rng(), 1.6 + rng() * 1.4, 1.2 + rng() * (z < FIELD_START ? 3.2 : 1.2), 1.6 + rng());
          add(side * (16 + rng() * 2), 0.6, z + rng(), 2.4 + rng() * 2, 2 + rng() * 4, 2.2 + rng());
        }
      }
      for (let x = -15; x <= 15; x += 2.2) add(x + rng(), 0.5, FIELD_END - 3 - rng() * 1.5, 1.8 + rng() * 1.5, 2 + rng() * 4, 1.8 + rng());
      const rocks = new T.InstancedMesh(geo, mat, items.length);
      const pal = [0xe0b077, 0xcf9b62, 0xebc08d, 0xc58d58];
      const c = new T.Color(), e = new T.Euler();
      items.forEach(([x, y, z, sx, sy, sz], i) => {
        this.m4.compose(this.tmp.set(x, y, z), this.q.setFromEuler(e.set(rng() * 3, rng() * 3, rng() * 3)), this.tmp2.set(sx, sy, sz));
        rocks.setMatrixAt(i, this.m4); rocks.setColorAt(i, c.setHex(pal[i % pal.length]));
      });
      rocks.castShadow = true; rocks.receiveShadow = true; rocks.computeBoundingSphere();
      this.scene.add(rocks);

      // Crystal clusters on the canyon walls, colored by the band they sit in
      this.tierMats = TIERS.map((t) => std(t.color, {
        metalness: t.metal, roughness: t.rough, flatShading: t.gem, envMapIntensity: t.gem ? 1.6 : 1.25,
        emissive: t.glow || 0x000000,
      }));
      const cg = new T.OctahedronGeometry(1, 0);
      TIERS.forEach((t, i) => {
        for (let k = 0; k < 4; k++) {
          const side = k % 2 ? 1 : -1;
          const z = FIELD_START - i * BAND - 3 - rng() * (BAND - 6);
          for (let j = 0; j < 3; j++) {
            const m = new T.Mesh(cg, this.tierMats[i]);
            m.position.set(side * (11.9 + rng() * 0.4), 0.3 + rng() * 0.8, z + j * 0.5);
            m.scale.set(0.35 + rng() * 0.2, 0.7 + rng() * 0.6, 0.35 + rng() * 0.2);
            m.rotation.set(0, rng() * 3, side * (0.3 + rng() * 0.5));
            m.castShadow = true; this.scene.add(m);
          }
        }
      });
    }

    buildOre() {
      const rng = mulberry32(1234);
      const SP = 0.62;
      const list = [];
      const add = (x, y, z, s, tier) => list.push({ x, y, z, s, tier });
      for (let z = FIELD_START - 0.35; z > FIELD_END + 0.3; z -= SP) {
        for (let x = -HALF_W + 0.35; x < HALF_W - 0.3; x += SP) {
          const px = x + (rng() - 0.5) * 0.3, pz = z + (rng() - 0.5) * 0.3;
          const edge = Math.sin(px * 0.55 + 1.3) * 1.6 + Math.sin(px * 1.7) * 0.6;
          const tier = Math.max(0, Math.min(TIERS.length - 1, Math.floor((FIELD_START - pz + edge) / BAND)));
          const s = 0.3 + rng() * 0.12;
          add(px, s * 0.6, pz, s, tier);
          const heap = Math.sin(px * 0.42 + tier) * Math.cos(pz * 0.37);
          if (heap > 0.05 && rng() < 0.85) add(px + (rng() - 0.5) * 0.25, s * 0.6 + 0.4 + rng() * 0.1, pz + (rng() - 0.5) * 0.25, s * 0.9, tier);
        }
      }
      const N = (this.N = list.length);
      this.cx = new Float32Array(N); this.cy = new Float32Array(N); this.cz = new Float32Array(N);
      this.cs = new Float32Array(N); this.ct = new Uint8Array(N); this.alive = new Uint8Array(N);
      this.cq = new Float32Array(N * 4); this.ci = new Uint16Array(N);
      this.minedAt = new Float32Array(N);
      const counts = TIERS.map(() => 0);
      const e = new T.Euler();
      list.forEach((c, i) => {
        this.cx[i] = c.x; this.cy[i] = c.y; this.cz[i] = c.z; this.cs[i] = c.s; this.ct[i] = c.tier; this.alive[i] = 1;
        this.ci[i] = counts[c.tier]++;
        this.q.setFromEuler(e.set(rng() * 6, rng() * 6, rng() * 6)); this.q.toArray(this.cq, i * 4);
      });
      const nugget = new T.IcosahedronGeometry(1, 1);
      const gem = new T.OctahedronGeometry(1, 0);
      this.oreMeshes = TIERS.map((t, k) => {
        const m = new T.InstancedMesh(t.gem ? gem : nugget, this.tierMats[k], counts[k]);
        m.castShadow = !this.mobile; m.receiveShadow = true;
        this.scene.add(m);
        return m;
      });
      for (let i = 0; i < N; i++) this.setChunk(i, 1);
      this.oreMeshes.forEach((m) => { m.computeBoundingSphere(); m.instanceMatrix.needsUpdate = true; });
      // spatial grid for fast lookups
      this.GX0 = -12; this.GZ0 = 8; this.GW = 24; this.GH = Math.ceil(this.GZ0 - FIELD_END) + 2;
      this.cells = Array.from({ length: this.GW * this.GH }, () => []);
      for (let i = 0; i < N; i++) this.cells[this.cell(this.cx[i], this.cz[i])].push(i);
      this.regrowQ = []; this.growing = [];
    }
    cell(x, z) {
      const gx = Math.max(0, Math.min(this.GW - 1, Math.floor(x - this.GX0)));
      const gz = Math.max(0, Math.min(this.GH - 1, Math.floor(this.GZ0 - z)));
      return gx + gz * this.GW;
    }
    query(x, z, r, fn) {
      const gx0 = Math.max(0, Math.floor(x - r - this.GX0)), gx1 = Math.min(this.GW - 1, Math.floor(x + r - this.GX0));
      const gz0 = Math.max(0, Math.floor(this.GZ0 - z - r)), gz1 = Math.min(this.GH - 1, Math.floor(this.GZ0 - z + r));
      for (let gz = gz0; gz <= gz1; gz++) for (let gx = gx0; gx <= gx1; gx++) {
        const c = this.cells[gx + gz * this.GW];
        for (let k = 0; k < c.length; k++) if (fn(c[k]) === false) return;
      }
    }
    setChunk(i, scale) {
      const s = this.cs[i] * scale, gem = TIERS[this.ct[i]].gem;
      this.q.fromArray(this.cq, i * 4);
      if (gem) this.tmp2.set(s * 0.8, s * 1.25, s * 0.8); else this.tmp2.set(s, s * 0.78, s * 0.92);
      this.m4.compose(this.tmp.set(this.cx[i], this.cy[i], this.cz[i]), this.q, this.tmp2);
      const mesh = this.oreMeshes[this.ct[i]];
      mesh.setMatrixAt(this.ci[i], this.m4);
      mesh.instanceMatrix.needsUpdate = true;
    }

    buildVehicle() {
      const v = (this.vehicle = new T.Group());
      const yellow = std(0xffb400, { roughness: 0.45 });
      const dark = std(OL, { roughness: 0.6 });
      const pink = std(0xff4f7b, { roughness: 0.4 });
      this.body = new T.Group(); v.add(this.body);
      const b = this.body;
      box(dark, 1.8, 0.22, 2.2, 0, 0.42, 0, b);
      box(yellow, 1.7, 0.45, 2.1, 0, 0.72, 0, b);
      box(yellow, 1.45, 0.35, 0.8, 0, 1.1, -0.6, b);
      box(dark, 1.2, 0.08, 0.5, 0, 1.3, -0.62, b);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(dark, 0.1, 0.85, 0.1, sx * 0.62, 1.35, 0.25 + sz * 0.45, b);
      box(pink, 1.45, 0.12, 1.2, 0, 1.8, 0.25, b);
      box(dark, 0.9, 0.3, 0.55, 0, 1.05, 0.45, b);
      const ex = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.7, 8), dark); ex.position.set(0.58, 1.4, -0.8); b.add(ex);
      // Blob driver
      const blobMat = std(0x2fb4ff, { roughness: 0.3 });
      const blob = new T.Mesh(new T.SphereGeometry(0.4, 24, 16), blobMat); blob.scale.set(1, 0.92, 1); blob.position.set(0, 1.42, 0.2); blob.castShadow = true;
      const white = std(0xffffff, { roughness: 0.3 });
      for (const sx of [-1, 1]) {
        const eye = new T.Mesh(new T.SphereGeometry(0.11, 12, 8), white); eye.position.set(sx * 0.14, 0.06, -0.33); blob.add(eye);
        const pup = new T.Mesh(new T.SphereGeometry(0.06, 10, 8), dark); pup.position.set(sx * 0.14, 0.06, -0.42); blob.add(pup);
      }
      this.blob = blob; b.add(blob);
      // Wheels
      const wGeo = new T.CylinderGeometry(0.42, 0.42, 0.34, 20); wGeo.rotateZ(Math.PI / 2);
      const hubGeo = new T.CylinderGeometry(0.18, 0.18, 0.36, 12); hubGeo.rotateZ(Math.PI / 2);
      this.wheels = [];
      const wheel = (x, z, parent, r = 1) => {
        const w = new T.Group(); w.position.set(x, 0.42 * r, z); w.scale.setScalar(r);
        const t = new T.Mesh(wGeo, dark); t.castShadow = true; w.add(t);
        w.add(new T.Mesh(hubGeo, yellow));
        parent.add(w); this.wheels.push(w);
      };
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) wheel(sx * 0.95, sz * 0.72, v);
      // Drill
      const drill = (this.drill = new T.Group()); drill.position.set(0, 0.55, -1.55); v.add(drill);
      for (const sx of [-1, 1]) box(dark, 0.14, 0.14, 0.8, sx * 0.82, 0.12, 0.42, drill);
      this.drillSpin = new T.Group(); drill.add(this.drillSpin);
      this.drumMat = std(0xffffff, { metalness: 0.9, roughness: 0.25 });
      const drum = new T.Mesh(new T.CylinderGeometry(0.4, 0.4, 1.9, 18), this.drumMat); drum.rotation.z = Math.PI / 2; drum.castShadow = true;
      this.drillSpin.add(drum);
      this.spikeMat = std(0x8d5bff, { metalness: 0.5, roughness: 0.3 });
      const spikes = new T.InstancedMesh(new T.ConeGeometry(0.11, 0.34, 6), this.spikeMat, 40);
      let n = 0; const up = new T.Vector3(0, 1, 0);
      for (let i = 0; i < 5; i++) for (let j = 0; j < 8; j++) {
        const a = (j / 8) * Math.PI * 2 + i * 0.4;
        const dir = this.tmp.set(0, Math.cos(a), Math.sin(a));
        this.q.setFromUnitVectors(up, dir);
        this.m4.compose(this.tmp2.set(-0.76 + i * 0.38, dir.y * 0.5, dir.z * 0.5), this.q, new T.Vector3(1, 1, 1));
        spikes.setMatrixAt(n++, this.m4);
      }
      spikes.castShadow = true; this.drillSpin.add(spikes);
      // Cart
      const cart = (this.cart = new T.Group()); cart.position.set(0, 0, 2.3); v.add(cart);
      const wood = std(0xb5652a, { roughness: 0.75 });
      box(dark, 0.16, 0.14, 0.7, 0, 0.5, -1.05, cart);
      box(wood, 1.9, 0.14, 1.8, 0, 0.62, 0, cart);
      for (const sz of [-1, 1]) box(wood, 1.9, 0.55, 0.12, 0, 0.95, sz * 0.86, cart);
      for (const sx of [-1, 1]) box(wood, 0.12, 0.55, 1.8, sx * 0.9, 0.95, 0, cart);
      for (const sz of [-1, 1]) box(yellow, 2.0, 0.1, 0.16, 0, 1.25, sz * 0.86, cart);
      for (const sx of [-1, 1]) wheel(sx * 1.02, 0.1, cart, 0.85);
      this.cargoMesh = new T.InstancedMesh(new T.IcosahedronGeometry(0.21, 1), std(0xffffff, { metalness: 0.85, roughness: 0.22 }), 48);
      this.cargoMesh.frustumCulled = false; this.cargoMesh.castShadow = true; this.cargoMesh.count = 0;
      this.cargoMesh.setColorAt(0, new T.Color());
      const rng = mulberry32(99);
      this.slots = [];
      for (let l = 0; l < 3; l++) for (let k = 0; k < 4; k++) for (let i = 0; i < 4; i++)
        this.slots.push(new T.Vector3(-0.6 + i * 0.4 + (rng() - 0.5) * 0.1, 0.84 + l * 0.27, -0.6 + k * 0.4 + (rng() - 0.5) * 0.1));
      cart.add(this.cargoMesh);
      v.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      v.position.set(this.pos.x, 0, this.pos.y);
      this.scene.add(v);
    }

    buildGrinder() {
      const g = (this.grinder = new T.Group()); g.position.set(GRINDER.x, 0, GRINDER.z);
      const purple = std(0x8d5bff, { roughness: 0.45 });
      const dark = std(OL, { roughness: 0.6 });
      const steel = std(0xc9d0e0, { metalness: 0.85, roughness: 0.3, side: T.DoubleSide });
      const yellow = std(0xffc21c, { roughness: 0.45 });
      box(yellow, 4.4, 0.35, 3.4, 0, 0.17, 0, g);
      box(purple, 4.2, 2.2, 3.2, 0, 1.3, 0, g);
      box(dark, 4.4, 0.2, 3.4, 0, 2.45, 0, g);
      box(std(0xffffff, { roughness: 0.4 }), 2.4, 0.9, 0.06, 0, 1.4, 1.62, g);
      const hop = new T.Mesh(new T.CylinderGeometry(2.0, 1.05, 1.5, 4, 1, true), steel);
      hop.rotation.y = Math.PI / 4; hop.position.y = 3.25; hop.castShadow = true; g.add(hop);
      this.rollers = [];
      const rGeo = new T.CylinderGeometry(0.34, 0.34, 2.0, 10); rGeo.rotateZ(Math.PI / 2);
      for (const sz of [-1, 1]) {
        const r = new T.Mesh(rGeo, std(0x4a4f63, { metalness: 0.7, roughness: 0.35, flatShading: true }));
        r.position.set(0, 2.7, sz * 0.38); g.add(r); this.rollers.push(r);
      }
      const chute = box(steel, 2.0, 0.14, 1.1, 2.75, 1.2, 0, g); chute.rotation.z = -0.42;
      for (const sz of [-1, 1]) { const rail = box(dark, 2.0, 0.3, 0.08, 2.75, 1.32, sz * 0.55, g); rail.rotation.z = -0.42; }
      this.lamp = new T.Mesh(new T.SphereGeometry(0.22, 12, 8), std(0xff4f7b, { emissive: 0xff2050, emissiveIntensity: 0.2 }));
      this.lamp.position.set(1.8, 2.75, 1.3); g.add(this.lamp);
      this.hopperMesh = new T.InstancedMesh(new T.IcosahedronGeometry(0.22, 1), std(0xffffff, { metalness: 0.85, roughness: 0.22 }), 24);
      this.hopperMesh.count = 0; this.hopperMesh.frustumCulled = false; this.hopperMesh.setColorAt(0, new T.Color());
      const rng = mulberry32(5);
      this.hopSlots = Array.from({ length: 24 }, (_, i) => new T.Vector3((rng() - 0.5) * 1.6, 2.9 + (i / 24) * 0.6, (rng() - 0.5) * 1.3));
      g.add(this.hopperMesh);
      this.scene.add(g);
      // SELL pad
      const pad = new T.Mesh(new T.PlaneGeometry(3, 3), std(0xffffff, { map: padTexture('#ffc21c', 'sell'), roughness: 0.6 }));
      pad.rotation.x = -Math.PI / 2; pad.position.set(SELL.x, 0.03, SELL.z); pad.receiveShadow = true; this.scene.add(pad);
      this.chuteEnd = new T.Vector3(GRINDER.x + 3.6, 0.75, GRINDER.z);
      this.hopperTop = new T.Vector3(GRINDER.x, 3.4, GRINDER.z);
    }

    buildPile() {
      this.pileMesh = new T.InstancedMesh(this.coinGeo, this.coinMat, 220);
      this.pileMesh.count = 0; this.pileMesh.castShadow = true; this.pileMesh.receiveShadow = true;
      const rng = mulberry32(3);
      const spots = [];
      // fill a cone heap from the bottom up, shuffled within each layer
      for (let l = 0; l < 9; l++) {
        const R = 1.6 * (1 - l / 9), n = Math.round(60 * (1 - l / 9) ** 2) + 3;
        const layer = [];
        for (let i = 0; i < n; i++) {
          const a = rng() * Math.PI * 2, r = R * Math.sqrt(rng());
          layer.push([PILE.x + Math.cos(a) * r, 0.05 + l * 0.11, PILE.z + Math.sin(a) * r]);
        }
        spots.push(...layer);
      }
      const e = new T.Euler();
      spots.slice(0, 220).forEach(([x, y, z], i) => {
        this.m4.compose(this.tmp.set(x, y, z), this.q.setFromEuler(e.set((rng() - 0.5) * 0.7, rng() * 3, (rng() - 0.5) * 0.7)), this.tmp2.set(1, 1, 1));
        this.pileMesh.setMatrixAt(i, this.m4);
      });
      this.pileSpots = spots;
      this.pileCap = Math.min(220, spots.length);
      this.scene.add(this.pileMesh);
    }

    buildVault() {
      const g = (this.vault = new T.Group()); g.position.set(VAULT.x, 0, VAULT.z);
      const steel = std(0xa9b4cc, { metalness: 0.7, roughness: 0.3 });
      const dark = std(OL);
      const green = std(0x27c46b, { roughness: 0.4 });
      box(dark, 1.9, 0.2, 1.7, 0, 0.1, 0, g);
      box(steel, 1.7, 1.6, 1.5, 0, 1.0, 0, g);
      box(std(0x7d89a8, { metalness: 0.8, roughness: 0.3 }), 1.25, 1.15, 0.1, 0, 1.0, 0.78, g);
      const dial = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.12, 16), std(0xffc330, { metalness: 1, roughness: 0.25 }));
      dial.rotation.x = Math.PI / 2; dial.position.set(0, 1.0, 0.86); g.add(dial);
      // vacuum tube from the coin pile to the vault
      const curve = new T.CatmullRomCurve3([
        new T.Vector3(0, 1.8, 0), new T.Vector3(0, 3.2, -1.5), new T.Vector3(PILE.x - VAULT.x, 3.0, PILE.z - VAULT.z + 0.6), new T.Vector3(PILE.x - VAULT.x, 2.3, PILE.z - VAULT.z),
      ]);
      const tube = new T.Mesh(new T.TubeGeometry(curve, 24, 0.16, 8), green); tube.castShadow = true; g.add(tube);
      const nozzle = new T.Mesh(new T.ConeGeometry(0.4, 0.5, 12, 1, true), std(0x27c46b, { side: T.DoubleSide }));
      nozzle.position.set(PILE.x - VAULT.x, 2.1, PILE.z - VAULT.z); g.add(nozzle);
      g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      this.scene.add(g);
      this.vaultTop = new T.Vector3(VAULT.x, 2.0, VAULT.z);
      this.nozzle = new T.Vector3(PILE.x, 2.2, PILE.z);
    }

    buildPads() {
      const holoMat = new T.MeshBasicMaterial({ color: 0x5fd0ff, transparent: true, opacity: 0.22, side: T.DoubleSide, depthWrite: false });
      const edgeMat = new T.LineBasicMaterial({ color: 0xbff0ff, transparent: true, opacity: 0.9 });
      const plane = new T.PlaneGeometry(2.4, 1.6);
      const edges = new T.EdgesGeometry(plane);
      const baseMat = std(OL, { roughness: 0.6 });
      this.pads = UPG.map((u) => {
        const [x, z] = u.pos;
        box(baseMat, 2.8, 0.1, 2.8, x, 0.05, z, this.scene);
        const top = new T.Mesh(new T.PlaneGeometry(2.6, 2.6), std(0xffffff, { map: padTexture(u.color), roughness: 0.5 }));
        top.rotation.x = -Math.PI / 2; top.position.set(x, 0.11, z); top.receiveShadow = true; this.scene.add(top);
        const holo = new T.Group(); holo.position.set(x, 1.45, z - 1.25);
        holo.add(new T.Mesh(plane, holoMat), new T.LineSegments(edges, edgeMat));
        this.scene.add(holo);
        const L = this.label('', x, 1.45, z - 1.25, 'm-pad', 'center');
        L.el.style.setProperty('--c', u.color);
        return { u, x, z, L, holo, top };
      });
    }

    // ---------------- Upgrades ----------------
    applyUpgrades() {
      const u = this.d.up;
      const t = TIERS[u.pickaxe - 1];
      this.spikeMat.color.setHex(t.color); this.spikeMat.metalness = t.metal; this.spikeMat.roughness = t.rough;
      this.cart.scale.setScalar(1 + 0.035 * (u.cart - 1));
      this.vault.visible = u.collector > 0;
      this.pads.forEach((p) => this.renderPad(p));
      TIERS.forEach((t, i) => {
        const L = this['band' + i];
        const ok = i <= u.pickaxe - 1;
        L.el.className = 'm-label m-tag m-band' + (ok ? '' : ' locked');
        L.el.innerHTML = ok ? `${t.name} <small>$${t.value}</small>` : `🔒 ${t.name} <small>PICKAXE LV${i + 1}</small>`;
      });
      this.updateCargoVisual();
    }
    renderPad(p) {
      const { u } = p, lvl = this.d.up[u.id];
      const maxed = lvl >= u.max;
      const cost = maxed ? 0 : u.cost(lvl);
      const paid = this.d.paid[u.id] || 0;
      p.cost = cost; p.maxed = maxed;
      p.L.el.classList.toggle('max', maxed);
      p.L.el.innerHTML = `
        <div class="n">${u.icon} ${u.name} <small>${u.id === 'collector' && lvl === 0 ? 'NEW' : 'LV' + lvl}</small></div>
        ${maxed ? '<div class="c">MAX ★</div>' : `<div class="d">${u.next(lvl)}</div>
        <div class="c"><i class="coin"></i>${fmt(cost)}</div>
        <span class="progress"><i style="width:${(paid / cost) * 100}%"></i></span>`}`;
      p.bar = p.L.el.querySelector('.progress i');
    }

    // ---------------- Input ----------------
    bindInput() {
      const cv = this.el.canvas;
      const rect = () => this.stage.getBoundingClientRect();
      this.onDown = (e) => {
        if (this.joy.on) return;
        e.preventDefault();
        const r = rect();
        Object.assign(this.joy, { on: true, id: e.pointerId, ox: e.clientX, oy: e.clientY, x: 0, y: 0 });
        cv.setPointerCapture(e.pointerId);
        this.el.joy.style.left = e.clientX - r.left + 'px'; this.el.joy.style.top = e.clientY - r.top + 'px';
        this.el.joy.classList.add('on'); this.el.knob.style.transform = '';
      };
      this.onMove = (e) => {
        const j = this.joy; if (!j.on || e.pointerId !== j.id) return;
        let dx = e.clientX - j.ox, dy = e.clientY - j.oy;
        const len = Math.hypot(dx, dy), R = 55;
        if (len > R) { dx *= R / len; dy *= R / len; }
        j.x = dx / R; j.y = dy / R;
        this.el.knob.style.transform = `translate(${dx}px, ${dy}px)`;
      };
      this.onUp = (e) => {
        const j = this.joy; if (!j.on || e.pointerId !== j.id) return;
        j.on = false; j.x = j.y = 0; this.el.joy.classList.remove('on');
      };
      cv.addEventListener('pointerdown', this.onDown);
      cv.addEventListener('pointermove', this.onMove);
      cv.addEventListener('pointerup', this.onUp);
      cv.addEventListener('pointercancel', this.onUp);
      this.onKey = (e) => {
        const k = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
          if (e.type === 'keydown') this.keys.add(k); else this.keys.delete(k);
          e.preventDefault();
        }
      };
      this.onBlur = () => this.keys.clear();
      window.addEventListener('keydown', this.onKey);
      window.addEventListener('keyup', this.onKey);
      window.addEventListener('blur', this.onBlur);
    }
    input() {
      const k = this.keys;
      let x = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
      let z = (k.has('s') || k.has('arrowdown') ? 1 : 0) - (k.has('w') || k.has('arrowup') ? 1 : 0);
      if (x || z) { const l = Math.hypot(x, z); return { x: x / l, z: z / l, m: 1 }; }
      const j = this.joy, m = Math.hypot(j.x, j.y);
      if (m < 0.15) return { x: 0, z: 0, m: 0 };
      return { x: j.x / m, z: j.y / m, m: Math.min(1, m) };
    }

    // ---------------- Main loop ----------------
    loop(now) {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(this.loop);
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      if (!this.running) return;
      this.time += dt;
      this.adapt(dt);
      this.update(dt);
      this.renderer.render(this.scene, this.camera);
    }

    // If the device can't keep ~40fps, lower the render resolution, then ore shadows.
    adapt(dt) {
      if (this.quality === 0) return;
      this.qT = (this.qT || 0) + dt; this.qF = (this.qF || 0) + 1;
      if (this.qT < 2) return;
      const fps = this.qF / this.qT; this.qT = 0; this.qF = 0;
      if (fps > 40) return;
      this.quality = (this.quality ?? 2) - 1;
      if (this.quality === 1) this.renderer.setPixelRatio(1);
      if (this.quality === 0) this.oreMeshes.forEach((m) => (m.castShadow = false));
    }

    update(dt) {
      const S = this.S;
      this.drive(dt, S);
      this.mine(dt, S);
      this.unload(dt);
      this.grind(dt, S);
      this.collect(dt, S);
      this.payPads(dt);
      this.regrow(dt);
      this.oreFly.update(dt);
      this.coinFly.update(dt);
      this.animate(dt, S);
      this.updateCamera(dt);
      this.updateLabels(dt);
      this.updateHud();
      this.saveT = (this.saveT || 0) + dt;
      if (this.saveT > 3) { this.saveT = 0; this.api.save(); }
    }

    // Is the vehicle body overlapping ore at (x, z)?
    oreBlocks(x, z) {
      let hit = false;
      this.query(x, z, 1.5, (i) => {
        if (!this.alive[i]) return;
        const dx = this.cx[i] - x, dz = this.cz[i] - z, r = 0.92 + this.cs[i] * 0.8;
        if (dx * dx + dz * dz < r * r) { hit = true; return false; }
      });
      return hit;
    }
    staticBlocks(x, z) {
      const R = 1.05;
      const inBox = (cx, cz, hx, hz) => Math.abs(x - cx) < hx + R && Math.abs(z - cz) < hz + R;
      if (inBox(GRINDER.x, GRINDER.z, 2.2, 1.7)) return true;
      if (this.vault.visible && inBox(VAULT.x, VAULT.z, 0.95, 0.85)) return true;
      return false;
    }

    drive(dt, S) {
      const inp = this.input();
      this.moving = inp.m > 0;
      if (inp.m > 0) this.heading = angleTo(this.heading, Math.atan2(-inp.x, -inp.z), 9 * dt);
      const target = inp.m * S.speed;
      this.speed += (target - this.speed) * Math.min(1, dt * (target > this.speed ? 6 : 10));
      const fx = -Math.sin(this.heading), fz = -Math.cos(this.heading);
      const step = this.speed * dt;
      if (step > 0.0001) {
        const clampX = (v) => Math.max(-CLAMP_X, Math.min(CLAMP_X, v));
        const clampZ = (v) => Math.max(FIELD_END + 1.2, Math.min(BASE_S, v));
        const nx = clampX(this.pos.x + fx * step), nz = clampZ(this.pos.y + fz * step);
        const free = (x, z) => !this.oreBlocks(x, z) && !this.staticBlocks(x, z);
        this.pushing = this.oreBlocks(nx, nz);
        // move, or slide along whatever is in the way (ore face, grinder, vault)
        if (free(nx, nz)) this.pos.set(nx, nz);
        else if (free(nx, this.pos.y)) this.pos.x = nx;
        else if (free(this.pos.x, nz)) this.pos.y = nz;
        else this.speed *= 0.6;
      } else this.pushing = false;
      this.vehicle.position.set(this.pos.x, 0, this.pos.y);
      this.vehicle.rotation.y = this.heading;
    }

    mine(dt, S) {
      const fx = -Math.sin(this.heading), fz = -Math.cos(this.heading);
      const dx = this.pos.x + fx * 1.6, dz = this.pos.y + fz * 1.6;
      this.budget = Math.min(this.budget + S.drill * dt, Math.max(1, S.drill * 0.15));
      const cand = [];
      let hard = -1;
      this.query(dx, dz, 1.5, (i) => {
        if (!this.alive[i]) return;
        const ex = this.cx[i] - dx, ez = this.cz[i] - dz, dd = ex * ex + ez * ez;
        if (dd > 1.5 * 1.5) return;
        if (this.ct[i] > S.maxTier) { hard = Math.max(hard, this.ct[i]); return; }
        cand.push([dd, i]);
      });
      // also grind anything touching the front half of the body, so ore at the sides can't pin us in place
      this.query(this.pos.x, this.pos.y, 1.6, (i) => {
        if (!this.alive[i]) return;
        const rx = this.cx[i] - this.pos.x, rz = this.cz[i] - this.pos.y, r = 1.07 + this.cs[i] * 0.8;
        if (rx * fx + rz * fz < -0.4 || rx * rx + rz * rz > r * r) return;
        if (this.ct[i] > S.maxTier) { hard = Math.max(hard, this.ct[i]); return; }
        cand.push([-1, i]); // highest priority
      });
      this.mining = false;
      if (cand.length) {
        if (this.cargo.length >= S.cap) {
          this.full = true;
          if (this.moving && this.throttle('full', 2.2)) { this.float('CART FULL!', this.tmp.set(this.pos.x, 2.6, this.pos.y), 'warn'); this.api.blip(180, 0.15, 'square', 0.7, 0.6); }
        } else {
          cand.sort((a, b) => a[0] - b[0]);
          for (const [, i] of cand) {
            if (!this.alive[i]) continue; // can appear twice in the list
            if (this.budget < 1 || this.cargo.length >= S.cap) break;
            this.budget -= 1; this.mineChunk(i);
          }
          this.mining = true;
        }
      }
      if (hard >= 0 && this.moving) {
        this.lastHard = this.time; this.hardTier = hard;
        if (this.throttle('hard', 1.6)) {
          this.float(`PICKAXE LV${hard + 1} NEEDED!`, this.tmp.set(dx, 2.2, dz), 'warn');
          this.api.blip(150, 0.12, 'square', 0.8, 0.5);
        }
      }
      if (this.cargo.length < S.cap) this.full = false;
    }
    mineChunk(i) {
      this.alive[i] = 0; this.minedAt[i] = this.time;
      this.setChunk(i, 0);
      this.regrowQ.push(i);
      const tier = this.ct[i];
      this.cargo.push(tier);
      const slot = Math.min(47, Math.floor((this.cargo.length / this.S.cap) * 48));
      this.oreFly.add(this.tmp.set(this.cx[i], this.cy[i], this.cz[i]),
        (out) => this.cart.localToWorld(out.copy(this.slots[slot])), 0.32, 1.4, this.cs[i] * 1.5, TIERS[tier].color,
        () => this.updateCargoVisual());
      if (this.throttle('tick', 0.06)) this.api.blip(320 + tier * 90 + Math.random() * 60, 0.035, 'triangle', 1.6, 0.35);
    }
    updateCargoVisual() {
      const c = this.cargo, S = this.S;
      const vis = c.length ? Math.max(1, Math.ceil((48 * c.length) / S.cap)) : 0;
      const col = new T.Color();
      for (let i = 0; i < vis; i++) {
        this.m4.makeTranslation(this.slots[i].x, this.slots[i].y, this.slots[i].z);
        this.cargoMesh.setMatrixAt(i, this.m4);
        this.cargoMesh.setColorAt(i, col.setHex(TIERS[c[Math.floor((i * c.length) / vis)]].color));
      }
      this.cargoMesh.count = vis;
      this.cargoMesh.instanceMatrix.needsUpdate = true;
      if (this.cargoMesh.instanceColor) this.cargoMesh.instanceColor.needsUpdate = true;
    }

    unload(dt) {
      const dx = this.pos.x - SELL.x, dz = this.pos.y - SELL.z;
      this.onSell = dx * dx + dz * dz < 1.8 * 1.8;
      if (!this.onSell || !this.cargo.length) { this.unloadBudget = 0; return; }
      this.unloadBudget += dt * Math.max(25, this.cargo.length * 1.5);
      while (this.unloadBudget >= 1 && this.cargo.length) {
        this.unloadBudget -= 1;
        const tier = this.cargo.pop();
        const from = this.cart.localToWorld(this.tmp.copy(this.slots[Math.min(47, Math.floor(Math.random() * 12))]));
        const to = this.hopperTop.clone().add(this.tmp2.set((Math.random() - 0.5) * 1.4, 0, (Math.random() - 0.5) * 1.2));
        this.oreFly.add(from, to, 0.45, 2.2, 0.32, TIERS[tier].color, () => { this.hopper.push(tier); this.updateHopper(); });
        if (this.throttle('unload', 0.05)) this.api.blip(220 + tier * 40, 0.04, 'sawtooth', 0.7, 0.3);
      }
      this.updateCargoVisual();
    }
    updateHopper() {
      const n = Math.min(24, this.hopper.length), col = new T.Color();
      for (let i = 0; i < n; i++) {
        const s = this.hopSlots[i];
        this.m4.makeTranslation(s.x, s.y, s.z);
        this.hopperMesh.setMatrixAt(i, this.m4);
        this.hopperMesh.setColorAt(i, col.setHex(TIERS[this.hopper[i]].color));
      }
      this.hopperMesh.count = n;
      this.hopperMesh.instanceMatrix.needsUpdate = true;
      if (this.hopperMesh.instanceColor) this.hopperMesh.instanceColor.needsUpdate = true;
    }

    grind(dt, S) {
      this.grinding = this.hopper.length > 0;
      if (!this.grinding) { this.grindBudget = 0; return; }
      this.grindBudget += S.grind * dt;
      let changed = false;
      while (this.grindBudget >= 1 && this.hopper.length) {
        this.grindBudget -= 1; changed = true;
        const tier = this.hopper.shift();
        const value = TIERS[tier].value * S.mult;
        const spot = this.pileSpots[Math.floor(Math.random() * 60)];
        this.coinFly.add(this.chuteEnd, new T.Vector3(spot[0], 0.3, spot[2]), 0.5, 0.8, 1, 0, () => { this.pile += value; this.updatePile(); });
        if (this.throttle('grind', 0.08)) this.api.blip(90 + Math.random() * 40, 0.05, 'sawtooth', 1.4, 0.35);
      }
      if (changed) this.updateHopper();
    }
    updatePile() {
      const vis = this.pile > 0 ? Math.min(this.pileCap, Math.ceil(Math.sqrt(this.pile) * 2.2)) : 0;
      this.pileMesh.count = vis;
      this.pileMesh.computeBoundingSphere();
      this.pileLabel.el.innerHTML = this.pile > 0 ? `<i class="coin"></i>${fmt(this.pile)}` : '';
      this.pileLabel.show = this.pile > 0;
    }

    collect(dt, S) {
      if (this.pile <= 0) { this.autoT = 0; return; }
      const dx = this.pos.x - PILE.x, dz = this.pos.y - PILE.z;
      if (dx * dx + dz * dz < 3.1 * 3.1 && this.throttle('collect', 0.15)) {
        this.takePile((out) => out.set(this.pos.x, 1.4, this.pos.y), this.tmp.set(this.pos.x, 2.4, this.pos.y));
        return;
      }
      if (this.d.up.collector > 0) {
        this.autoT += dt;
        if (this.autoT >= S.autoEvery) { this.autoT = 0; this.takePile(this.vaultTop, this.tmp.set(VAULT.x, 2.6, VAULT.z), true); }
      }
    }
    takePile(to, floatAt, auto = false) {
      const amount = this.pile, vis = this.pileMesh.count;
      this.pile = 0;
      const n = Math.min(auto ? 8 : 16, vis);
      for (let i = 0; i < n; i++) {
        const s = this.pileSpots[Math.floor(Math.random() * vis)];
        const from = this.tmp2.set(s[0], s[1], s[2]);
        if (auto) this.coinFly.add(from, this.nozzle, 0.35, 0.6, 1, 0, () => {});
        else this.coinFly.add(from, to, 0.4 + Math.random() * 0.15, 1.5, 1, 0, null);
      }
      if (auto) for (let i = 0; i < 4; i++) this.coinFly.add(this.nozzle, to, 0.5 + i * 0.05, 0.8, 0.9, 0, null);
      this.updatePile();
      this.addMoney(amount, floatAt);
      this.api.blip(auto ? 1400 : 1250, 0.07, 'square', 1.25, auto ? 0.35 : 0.6);
      setTimeout(() => this.api.blip(1660, 0.08, 'square', 1.2, auto ? 0.3 : 0.5), 70);
    }
    addMoney(a, at) {
      const d = this.d;
      d.money += a; d.total += a;
      this.float('+' + fmt(a), at, 'money');
      while (d.ms < MILESTONES.length && d.total >= MILESTONES[d.ms]) {
        d.ms++;
        this.api.setProgress(d.ms);
        if (d.ms < MILESTONES.length) { this.banner(`MILESTONE ${d.ms}/10!`); this.fanfare(); }
      }
      if (d.ms >= MILESTONES.length && !d.won) { d.won = true; this.api.clear(); this.win(); }
      this.api.save();
    }
    win() {
      this.banner('$1,000,000!!!');
      this.fanfare(true);
      setTimeout(() => { if (!this.disposed) this.el.win.hidden = false; }, 900);
    }
    fanfare(big) {
      const notes = big ? [523, 659, 784, 1046, 1318] : [659, 784, 1046];
      notes.forEach((f, i) => setTimeout(() => this.api.blip(f, 0.12, 'square', 1.01, 0.6), i * 90));
    }

    payPads(dt) {
      this.payFx -= dt;
      for (const p of this.pads) {
        const dx = this.pos.x - p.x, dz = this.pos.y - p.z;
        const on = dx * dx + dz * dz < 1.4 * 1.4 && (!this.moving || this.speed < 1);
        p.L.el.classList.toggle('on', on && !p.maxed);
        p.L.el.classList.toggle('ready', !p.maxed && this.d.money + (this.d.paid[p.u.id] || 0) >= p.cost);
        if (!on || p.maxed) continue;
        const id = p.u.id, need = p.cost - this.d.paid[id];
        const rate = Math.max(p.cost / 1.4, 6);
        const amt = Math.min(need, rate * dt, this.d.money);
        if (amt <= 0) {
          if (need > 0 && this.throttle('broke' + id, 2.5)) {
            this.float(`NEED ${fmt(need)}`, this.tmp.set(p.x, 2.8, p.z - 1.2), 'warn');
            this.api.blip(160, 0.12, 'square', 0.8, 0.4);
          }
          continue;
        }
        this.d.money -= amt; this.d.paid[id] += amt;
        if (p.bar) p.bar.style.width = (this.d.paid[id] / p.cost) * 100 + '%';
        if (this.payFx <= 0) {
          this.payFx = 0.05;
          this.coinFly.add(this.tmp.set(this.pos.x, 1.6, this.pos.y), new T.Vector3(p.x, 0.3, p.z), 0.3, 1.2, 0.9, 0, null);
          this.api.blip(700 + (this.d.paid[id] / p.cost) * 700, 0.03, 'triangle', 1.1, 0.3);
        }
        if (this.d.paid[id] >= p.cost - 1e-6) this.levelUp(p);
      }
    }
    levelUp(p) {
      const id = p.u.id;
      this.d.paid[id] = 0; this.d.up[id]++; this.d.bought++;
      this.applyUpgrades();
      const lvl = this.d.up[id];
      this.banner(`${p.u.name} ${id === 'collector' && lvl === 1 ? 'UNLOCKED' : 'LV' + lvl}!`);
      this.fanfare();
      if (this.api.settings.shake) this.shake = 0.35;
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        this.coinFly.add(this.tmp.set(p.x, 0.4, p.z), new T.Vector3(p.x + Math.cos(a) * 2.2, 0.2, p.z + Math.sin(a) * 2.2), 0.6, 2.5, 1, 0, null);
      }
      this.updateCargoVisual();
      this.api.save();
    }

    regrow(dt) {
      this.regrowT = (this.regrowT || 0) + dt;
      if (this.regrowT > 0.25) {
        this.regrowT = 0;
        const Q = this.regrowQ;
        let checked = 0;
        while (Q.length && checked++ < 60) {
          const i = Q[0];
          if (this.time - this.minedAt[i] < REGROW_AFTER) break;
          Q.shift();
          const dx = this.cx[i] - this.pos.x, dz = this.cz[i] - this.pos.y;
          if (dx * dx + dz * dz < 6 * 6) { this.minedAt[i] = this.time - REGROW_AFTER + 3; Q.push(i); continue; }
          this.alive[i] = 1; this.growing.push([i, 0]);
        }
      }
      const G = this.growing;
      for (let k = G.length - 1; k >= 0; k--) {
        G[k][1] += dt / 0.4;
        const t = Math.min(1, G[k][1]);
        this.setChunk(G[k][0], easeOutBack(t));
        if (t >= 1) { G[k] = G[G.length - 1]; G.pop(); }
      }
    }

    animate(dt, S) {
      const spin = (this.mining ? 18 : 4 + Math.abs(this.speed) * 2) * dt;
      this.drillSpin.rotation.x -= spin;
      for (const w of this.wheels) w.rotation.x -= (this.speed * dt) / 0.42;
      this.body.position.y = this.mining ? (Math.random() - 0.5) * 0.05 : 0;
      this.blob.scale.set(1 + Math.sin(this.time * 8) * 0.03, 0.92 - Math.sin(this.time * 8) * 0.03, 1);
      const g = this.grinding;
      this.rollers[0].rotation.x += (g ? 14 : 1) * dt; this.rollers[1].rotation.x -= (g ? 14 : 1) * dt;
      this.lamp.material.emissiveIntensity = g ? 1.5 + Math.sin(this.time * 20) : 0.2;
      this.grinder.position.x = GRINDER.x + (g ? (Math.random() - 0.5) * 0.04 : 0);
      // arrow to the SELL pad
      const showArrow = this.cargo.length >= S.cap && !this.onSell;
      this.arrow.visible = showArrow;
      if (showArrow) {
        const a = Math.atan2(-(SELL.x - this.pos.x), -(SELL.z - this.pos.y));
        this.arrow.rotation.y = a;
        this.arrow.position.set(this.pos.x - Math.sin(a) * 2.6, 2.6 + Math.sin(this.time * 6) * 0.15, this.pos.y - Math.cos(a) * 2.6);
      }
      for (const p of this.pads) p.holo.children[0].material.opacity = 0.18 + Math.sin(this.time * 3 + p.x) * 0.05;
    }

    updateCamera(dt) {
      const lx = this.portrait ? this.pos.x : this.pos.x * 0.55;
      const want = this.tmp.set(lx + this.camOff.x, this.camOff.y, this.pos.y + this.camOff.z);
      this.camPos.lerp(want, 1 - Math.exp(-dt * 5));
      this.camera.position.copy(this.camPos);
      if (this.shake > 0) {
        this.shake -= dt;
        this.camera.position.x += (Math.random() - 0.5) * this.shake;
        this.camera.position.y += (Math.random() - 0.5) * this.shake;
      }
      this.camera.lookAt(this.camPos.x - this.camOff.x, 0, this.camPos.z - this.camOff.z - 3);
      this.sun.position.set(this.pos.x + 7, 18, this.pos.y + 6);
      this.sun.target.position.set(this.pos.x, 0, this.pos.y - 3);
    }

    project(L) {
      const v = this.tmp2.copy(L.pos).project(this.camera);
      if (v.z > 1 || v.x < -1.3 || v.x > 1.3 || v.y < -1.3 || v.y > 1.3) return null;
      return [(v.x * 0.5 + 0.5) * this.vw, (-v.y * 0.5 + 0.5) * this.vh];
    }
    updateLabels(dt) {
      for (const L of this.labels) {
        const p = L.show && this.project(L);
        if (!p) { L.el.style.display = 'none'; continue; }
        L.el.style.display = '';
        L.el.style.transform = `translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px) translate(-50%, ${L.anchor === 'center' ? '-50%' : '-100%'})`;
      }
      const F = this.floats;
      for (let i = F.length - 1; i >= 0; i--) {
        const f = F[i];
        f.t += dt; f.pos.y += dt * 1.6;
        const p = this.project(f);
        if (f.t > 1.2 || !p) { f.el.remove(); F.splice(i, 1); continue; }
        f.el.style.opacity = f.t > 0.8 ? (1.2 - f.t) / 0.4 : 1;
        f.el.style.transform = `translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px) translate(-50%, -100%) scale(${Math.min(1, 0.5 + f.t * 4)})`;
      }
    }

    updateHud(force) {
      const d = this.d, S = this.S;
      this.moneyShown += (d.money - this.moneyShown) * Math.min(1, (force ? 1 : 0.18));
      if (Math.abs(d.money - this.moneyShown) < 0.5) this.moneyShown = d.money;
      const ms = fmt(this.moneyShown);
      if (ms !== this._ms) { this.el.money.textContent = ms; this._ms = ms; }
      const ci = `${this.cargo.length}/${S.cap}`;
      if (ci !== this._ci) {
        this._ci = ci; this.el.cargoT.textContent = ci;
        this.el.cargoBar.style.width = (this.cargo.length / S.cap) * 100 + '%';
        this.el.cargo.classList.toggle('full', this.cargo.length >= S.cap);
      }
      const k = d.ms, prev = k ? MILESTONES[k - 1] : 0, next = MILESTONES[Math.min(k, MILESTONES.length - 1)];
      const gt = k >= MILESTONES.length ? 'CLEARED ★' : `MILESTONE ${k + 1}/10`;
      if (gt !== this._gt) { this._gt = gt; this.el.goalT.textContent = gt; this.el.goalV.textContent = fmt(next); }
      const pct = k >= MILESTONES.length ? 100 : Math.min(100, ((d.total - prev) / (next - prev)) * 100);
      this.el.goalBar.style.width = pct.toFixed(1) + '%';
      this.hintT = (this.hintT || 0) - 1;
      if (this.hintT <= 0 || force) {
        this.hintT = 15;
        const h = this.hint(S);
        if (h !== this._hint) { this._hint = h; this.el.hint.textContent = h; }
      }
    }
    hint(S) {
      const d = this.d;
      if (this.cargo.length >= S.cap) return 'Cart full! Drive to the SELL pad 🏭';
      if (d.total === 0 && !this.cargo.length && !this.hopper.length && this.pile <= 0) return 'Drag or use WASD to drive into the ore ⛏️';
      if (this.pile > 0 && d.total < 40) return 'Drive over the coins to grab them 💰';
      if (d.total === 0 && this.cargo.length) return 'Fill up, then unload at the SELL pad';
      if (!d.bought && this.pads.some((p) => !p.maxed && d.money >= p.cost)) return 'Park on an UPGRADE pad to buy it ⬆️';
      if (this.time - this.lastHard < 4) return `Upgrade your PICKAXE to mine ${TIERS[this.hardTier].name}!`;
      return '';
    }

    // Debug helper: run the simulation for `sec` seconds without rendering (input from `keys`).
    simulate(sec, keys = []) {
      const held = new Set(this.keys);
      this.keys = new Set(keys);
      for (let t = 0; t < sec; t += 1 / 30) { this.time += 1 / 30; this.update(1 / 30); }
      this.keys = held;
    }

    // ---------------- Lifecycle ----------------
    pause() { this.running = false; this.keys.clear(); this.onUp({ pointerId: this.joy.id }); }
    resume() { this.running = true; this.last = performance.now(); }
    destroy() {
      this.disposed = true;
      cancelAnimationFrame(this.raf);
      this.api.save();
      this.ro.disconnect();
      window.removeEventListener('keydown', this.onKey);
      window.removeEventListener('keyup', this.onKey);
      window.removeEventListener('blur', this.onBlur);
      this.scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map && m.map.dispose(); m.dispose(); });
      });
      this.scene.environment && this.scene.environment.dispose();
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.stage.classList.remove('mine-stage');
      this.stage.innerHTML = '';
    }
  }

  window.GAME_MODULES = window.GAME_MODULES || {};
  window.GAME_MODULES.mine = { create: (stage, api) => new OreRush(stage, api) };
})();
