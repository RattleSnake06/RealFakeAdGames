/* =====================================================================
   PICK ONE! — Game 3. Bo and Pip are in trouble; pick the item that saves
   them. 50 levels x 3 scenes. Wrong picks cost a heart (3 per level).
   Levels 1-10: 2 items · 11-25: 3 items · 26-50: 4 items. Timer from level 21.
   ===================================================================== */
(() => {
  'use strict';
  const { BG, THREATS, ITEMS, duo } = window.PICK_ART;
  const LEVELS = window.PICK_LEVELS;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // how each correct item gets used
  const FX = {
    umbrella: 'shield', parasol: 'shield', helmet: 'shield',
    tent: 'place', campfire: 'place', fan: 'place', ladder: 'place', trampoline: 'place', pillow: 'place',
    cocoa: 'give', icecream: 'give', water: 'give', pizza: 'give', cake: 'give', scarf: 'give', blanket: 'give', fish: 'give',
    boat: 'ride', balloon: 'ride', parachute: 'ride', rocket: 'ride', lifebuoy: 'ride',
  }; // everything else is aimed at the threat or the problem ("throw")
  const HAZARD_FAIL = {
    rain: 'Still soaking wet!', snow: 'Still freezing!', cold: 'Still freezing!', heat: 'Still way too hot!', wind: 'The wind is still howling!',
    fire: 'The fire keeps burning!', flood: 'The water keeps rising!', dark: 'Still can’t see a thing!', rocks: 'BONK! Still getting hit!',
    lava: 'The lava is getting closer!', quicksand: 'Still sinking!', fall: 'Still falling!', sinking: 'Still sinking!', ice: 'Still frozen solid!',
    web: 'Still stuck!', buried: 'Still buried!',
  };
  const MOOD_FAIL = { hungry: 'Still starving!', thirsty: 'Still thirsty!', sad: 'That didn’t help at all.', cold: 'Still freezing!', hot: 'Still way too hot!', happy: 'Hmm, not that one.' };
  const timerFor = (i) => (i < 20 ? 0 : i < 30 ? 10 : i < 40 ? 8 : 6);
  const itemsFor = (i) => (i < 10 ? 2 : i < 25 ? 3 : 4);
  const shuffle = (arr, seed) => { const a = arr.slice(); let x = seed; for (let k = a.length - 1; k > 0; k--) { x = (x * 9301 + 49297) % 233280; const j = Math.floor((x / 233280) * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };

  class PickOne {
    constructor(stage, api) {
      this.stage = stage; this.api = api;
      const d = (this.d = api.data);
      d.stars ??= {}; d.unlocked ??= 1;
      this.running = true;
      stage.classList.add('pk-stage');
      stage.innerHTML = `
        <div class="pk-view pk-select">
          <div class="pk-sel-top"><h2 class="pk-logo">PICK <span>ONE!</span></h2>
            <div class="pk-pills"><span class="pill"><i class="pk-star-i">★</i><b class="pk-total">0</b></span><span class="pill"><i class="coin"></i><b class="pk-coins">0</b></span></div></div>
          <p class="pk-sel-sub">Bo &amp; Pip keep getting into trouble. Pick the right item to save them!</p>
          <div class="pk-grid"></div>
        </div>
        <div class="pk-view pk-play" hidden>
          <div class="pk-hud"><div class="pk-title"><b class="pk-lv"></b><span class="pk-dots"></span></div><div class="pk-hearts"></div></div>
          <div class="pk-wrap"><div class="pk-card">
            <div class="pk-layer pk-bg"></div>
            <div class="pk-layer pk-hzb"></div>
            <div class="pk-threat"></div>
            <div class="pk-duo"></div>
            <div class="pk-layer pk-hzf"></div>
            <div class="pk-prompt"></div>
            <div class="pk-timer" hidden><i></i></div>
            <div class="pk-layer pk-fx"></div>
            <div class="pk-caption"></div>
            <div class="pk-stamp"></div>
            <div class="pk-tray"></div>
          </div></div>
        </div>
        <div class="pk-modal" hidden><div class="panel pk-panel"></div></div>`;
      const q = (s) => stage.querySelector(s);
      this.el = {
        select: q('.pk-select'), play: q('.pk-play'), grid: q('.pk-grid'), total: q('.pk-total'), coins: q('.pk-coins'),
        lv: q('.pk-lv'), dots: q('.pk-dots'), hearts: q('.pk-hearts'), wrap: q('.pk-wrap'), card: q('.pk-card'),
        bg: q('.pk-bg'), hzb: q('.pk-hzb'), hzf: q('.pk-hzf'), threat: q('.pk-threat'), duo: q('.pk-duo'), prompt: q('.pk-prompt'),
        timer: q('.pk-timer'), timerBar: q('.pk-timer i'), fx: q('.pk-fx'), caption: q('.pk-caption'), stamp: q('.pk-stamp'), tray: q('.pk-tray'),
        modal: q('.pk-modal'), panel: q('.pk-panel'),
      };
      this.onClick = (e) => this.click(e);
      stage.addEventListener('click', this.onClick);
      this.ro = new ResizeObserver(() => this.fit()); this.ro.observe(this.el.wrap);
      this.showSelect();
      if (/[?&]debug\b/.test(location.search)) window.PK = this;
    }

    starsOf(i) { return this.d.stars[i] || 0; }
    sfx(k) {
      const b = this.api.blip;
      ({
        tap: () => b(520, 0.05, 'triangle', 1.4, 0.5), whoosh: () => b(300, 0.18, 'sawtooth', 2.5, 0.35),
        good: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => b(f, 0.1, 'square', 1.02, 0.55), i * 80)),
        bad: () => [330, 262].forEach((f, i) => setTimeout(() => b(f, 0.18, 'sawtooth', 0.85, 0.5), i * 140)),
        boom: () => { b(90, 0.5, 'sawtooth', 0.3, 0.8); b(60, 0.6, 'square', 0.5, 0.6); },
        tick: () => b(1200, 0.03, 'square', 1, 0.25), clear: () => [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => b(f, 0.12, 'square', 1.01, 0.6), i * 90)),
      })[k]?.();
    }

    // ================================================================ level select
    showSelect() {
      this.view = 'select'; this.stopTimer();
      this.el.play.hidden = true; this.el.select.hidden = false; this.el.modal.hidden = true;
      const total = LEVELS.reduce((a, _, i) => a + this.starsOf(i), 0);
      this.el.total.textContent = `${total}/${LEVELS.length * 3}`;
      this.el.coins.textContent = this.api.coins.toLocaleString();
      const chapter = (i) => (i < 10 ? 0 : i < 25 ? 1 : 2);
      const head = ['2 ITEMS', '3 ITEMS', '4 ITEMS · SOME TIMED'];
      let html = '';
      LEVELS.forEach(([title], i) => {
        if (i === 0 || chapter(i) !== chapter(i - 1)) html += `<p class="pk-chap">${['EASY', 'TRICKY', 'TOUGH'][chapter(i)]} <span>${head[chapter(i)]}</span></p>`;
        const open = i < this.d.unlocked, st = this.starsOf(i), cur = i === this.d.unlocked - 1;
        html += `<button class="pk-lvbtn c${chapter(i)} ${open ? '' : 'locked'} ${cur ? 'cur' : ''}" data-pk="level" data-i="${i}" title="${title}">
          <b>${open ? i + 1 : '🔒'}</b><span class="st">${[0, 1, 2].map((s) => `<i class="${s < st ? 'on' : ''}">★</i>`).join('')}</span></button>`;
      });
      this.el.grid.innerHTML = html;
      this.el.grid.querySelector('.cur')?.scrollIntoView({ block: 'nearest' });
    }

    // ================================================================ play
    openLevel(i) {
      this.i = i; this.view = 'play'; this.sc = 0; this.hearts = 3; this.mistakes = 0;
      this.el.select.hidden = true; this.el.play.hidden = false; this.el.modal.hidden = true;
      this.el.lv.textContent = `LEVEL ${i + 1} · ${LEVELS[i][0]}`;
      this.renderHearts();
      this.loadScene(true);
      requestAnimationFrame(() => this.fit());
    }
    scene() { return LEVELS[this.i][1][this.sc]; }
    loadScene(first) {
      const [bg, hz, th, mood, prompt, ok, wrongs] = this.scene();
      const [bgName, night] = bg.split(':');
      this.busy = false; this.tried = new Set();
      this.el.card.className = `pk-card bg-${bgName} ${night ? 'night' : ''} hz-${hz || 'none'} ${th ? 'th-' + th : ''}`;
      this.el.bg.innerHTML = `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">${BG[bgName]()}</svg>`;
      this.el.threat.innerHTML = th ? `<svg viewBox="0 0 100 100" overflow="visible">${THREATS[th].svg}</svg>` : '';
      this.el.threat.className = 'pk-threat';
      this.setMood(mood);
      this.el.duo.className = 'pk-duo';
      this.renderHazard(hz);
      this.el.prompt.textContent = prompt;
      this.el.prompt.classList.remove('pop'); void this.el.prompt.offsetWidth; this.el.prompt.classList.add('pop');
      this.el.fx.innerHTML = ''; this.el.caption.className = 'pk-caption'; this.el.stamp.className = 'pk-stamp';
      this.el.dots.innerHTML = [0, 1, 2].map((k) => `<i class="${k < this.sc ? 'done' : k === this.sc ? 'now' : ''}"></i>`).join('');
      const n = itemsFor(this.i);
      const opts = shuffle([ok, ...wrongs.slice(0, n - 1)], this.i * 7 + this.sc * 3 + 1);
      this.el.tray.className = `pk-tray n${n}`;
      this.el.tray.innerHTML = opts.map((id) => `<button class="pk-item" data-pk="item" data-id="${id}" aria-label="${ITEMS[id].name}">
        <span class="ic"><svg viewBox="0 0 100 100" overflow="visible">${ITEMS[id].svg}</svg></span><span class="nm">${ITEMS[id].name}</span></button>`).join('');
      if (!first) { this.el.card.classList.add('slide-in'); setTimeout(() => this.el.card.classList.remove('slide-in'), 450); }
      this.startTimer();
    }
    setMood(m) { this.el.duo.innerHTML = duo(m); }
    renderHazard(hz) {
      const back = {};
      const front = {
        flood: '<div class="hz-water"></div>', lava: '<div class="hz-lava"></div>',
        rain: '<div class="hz-rain"></div>', snow: '<div class="hz-snow"></div>', wind: '<div class="hz-wind"></div>',
        heat: '<div class="hz-heat"></div>', cold: '<div class="hz-frost"></div>', dark: '<div class="hz-dark"></div>',
        fire: '<div class="hz-fire">' + '<i></i>'.repeat(7) + '</div>',
        rocks: '<div class="hz-rocks">' + '<i></i>'.repeat(5) + '</div>',
        sinking: '<div class="hz-sea"></div>', quicksand: '<div class="hz-sand"></div>', buried: '<div class="hz-pile"></div>',
        ice: '<div class="hz-ice"></div>', web: '<div class="hz-web"></div>', fall: '<div class="hz-fall"></div>',
      };
      this.el.hzb.innerHTML = back[hz] || '';
      this.el.hzf.innerHTML = front[hz] || '';
      this.el.hzf.className = 'pk-layer pk-hzf'; this.el.hzb.className = 'pk-layer pk-hzb';
    }
    renderHearts() { this.el.hearts.innerHTML = [0, 1, 2].map((k) => `<i class="${k < this.hearts ? '' : 'lost'}">❤</i>`).join(''); }
    fit() {
      if (this.view !== 'play') return;
      const w = this.el.wrap.clientWidth, h = this.el.wrap.clientHeight;
      const cw = Math.min(w - 36, (h - 40) * 0.75); // leave room for the card's chunky rim
      this.el.card.style.width = cw + 'px'; this.el.card.style.height = cw / 0.75 + 'px';
      this.el.card.style.fontSize = cw / 30 + 'px';
    }

    // ---------------------------------------------------------------- timer
    startTimer() {
      this.stopTimer();
      const secs = timerFor(this.i);
      this.el.timer.hidden = !secs;
      if (!secs) return;
      this.tLeft = secs; this.tMax = secs;
      this.el.timerBar.style.width = '100%';
      this._timer = setInterval(() => {
        if (!this.running || this.busy || !this.el.modal.hidden) return;
        this.tLeft -= 0.1;
        this.el.timerBar.style.width = Math.max(0, (this.tLeft / this.tMax) * 100) + '%';
        this.el.timer.classList.toggle('low', this.tLeft < 3);
        if (this.tLeft < 3 && Math.abs(this.tLeft - Math.round(this.tLeft)) < 0.05) this.sfx('tick');
        if (this.tLeft <= 0) { this.stopTimer(); this.fail(null, 'Too slow!'); }
      }, 100);
    }
    stopTimer() { clearInterval(this._timer); }

    // ---------------------------------------------------------------- input
    click(e) {
      const a = e.target.closest('[data-pk]');
      if (!a) return;
      const act = a.dataset.pk;
      if (act !== 'item') this.sfx('tap');
      if (act === 'level') { const i = +a.dataset.i; if (i < this.d.unlocked) this.openLevel(i); }
      if (act === 'item') this.pick(a.dataset.id, a);
      if (act === 'retry') this.openLevel(this.i);
      if (act === 'next') { if (this.i + 1 < LEVELS.length) this.openLevel(this.i + 1); else this.showSelect(); }
      if (act === 'levels') this.showSelect();
    }

    // ---------------------------------------------------------------- picking
    async pick(id, btn) {
      if (this.busy || this.tried.has(id)) return;
      this.busy = true; this.stopTimer();
      const [, hz, th, , , ok] = this.scene();
      const good = id === ok;
      btn.classList.add('chosen');
      this.sfx('whoosh');
      const fx = good ? (FX[id] || 'throw') : id === 'bomb' ? 'boom' : 'flop';
      const fly = await this.flyItem(id, btn, fx, th);
      if (this.disposed) return;
      if (good) await this.succeed(id, fx, fly, hz, th);
      else await this.fail(id, null, fly, btn);
    }
    // the item flies from its tile to where it gets used; returns the flying element
    async flyItem(id, btn, fx, th) {
      const card = this.el.card.getBoundingClientRect(), b = btn.querySelector('.ic').getBoundingClientRect();
      const el = document.createElement('div');
      el.className = 'pk-fly';
      el.innerHTML = `<svg viewBox="0 0 100 100" overflow="visible">${ITEMS[id].svg}</svg>`;
      const W = card.width, H = card.height;
      Object.assign(el.style, { left: b.left - card.left + 'px', top: b.top - card.top + 'px', width: b.width + 'px', height: b.height + 'px' });
      this.el.fx.appendChild(el);
      void el.offsetWidth;
      const tgt = this.targetFor(fx, th, id);
      Object.assign(el.style, { left: tgt.x * W - (tgt.s * W) / 2 + 'px', top: tgt.y * H - (tgt.s * W) / 2 + 'px', width: tgt.s * W + 'px', height: tgt.s * W + 'px' });
      el.classList.add('flying');
      await wait(520);
      return el;
    }
    targetFor(fx, th, id) {
      const hasThreat = !!th, high = ['ufo', 'bees', 'ghost', 'spider', 'monkey'].includes(th);
      switch (fx) {
        case 'shield': return { x: 0.4, y: 0.38, s: 0.42 };
        case 'place': return id === 'ladder' ? { x: 0.75, y: 0.52, s: 0.36 } : { x: 0.77, y: 0.62, s: 0.3 };
        case 'give': return { x: 0.4, y: 0.57, s: 0.18 };
        case 'ride': return id === 'boat' || id === 'lifebuoy' ? { x: 0.4, y: 0.68, s: 0.55 } : { x: 0.4, y: 0.3, s: 0.36 };
        default: return hasThreat ? { x: 0.78, y: high ? 0.27 : 0.55, s: 0.2 } : { x: 0.5, y: 0.42, s: 0.24 };
      }
    }
    async succeed(id, fx, fly, hz, th) {
      const [, , , , , , , okText] = this.scene();
      this.sfx('good');
      this.el.hzf.classList.add('calm'); this.el.hzb.classList.add('calm');
      if (fx === 'give') fly.classList.add('gulp');
      if (fx === 'throw' && th) { this.el.threat.classList.add('flee'); fly.classList.add('poof'); }
      if (fx === 'throw' && !th) fly.classList.add('use');
      if (fx === 'ride') { this.el.duo.classList.add('ride', 'ride-' + id); fly.classList.add('ride', 'ride-' + id); }
      if (fx === 'shield') fly.classList.add('shield');
      this.setMood('happy');
      this.el.duo.classList.add('cheer');
      this.caption(okText, 'good');
      this.stamp('NICE!', 'good');
      this.confetti();
      await wait(1900);
      if (this.disposed) return;
      this.sc++;
      if (this.sc >= 3) return this.levelDone();
      this.loadScene(false);
    }
    async fail(id, overrideText, fly, btn) {
      const [, hz, th, mood, , , , , fails = {}] = this.scene();
      this.busy = true;
      const text = overrideText || fails[id] || (id === 'bomb' ? 'BOOM! That made things worse.'
        : th ? `The ${THREATS[th].name} doesn’t care about the ${ITEMS[id].name}!` : HAZARD_FAIL[hz] || MOOD_FAIL[mood] || 'That didn’t help!');
      if (id === 'bomb') {
        this.sfx('boom');
        fly && fly.classList.add('boom');
        this.boom();
        this.setMood('burnt');
        this.el.card.classList.add('shake');
      } else {
        this.sfx('bad');
        fly && fly.classList.add('flop');
        if (th) this.el.threat.classList.add('lunge');
        else { this.el.hzf.classList.add('worse'); this.el.card.classList.add('shake'); }
        this.setMood(th ? 'scared' : mood === 'happy' ? 'sad' : mood === 'scared' ? 'dizzy' : mood);
        this.el.duo.classList.add('wobble');
      }
      this.caption(text, 'bad');
      this.stamp('OOPS!', 'bad');
      this.mistakes++; this.hearts--;
      this.renderHearts();
      this.el.hearts.querySelectorAll('i')[this.hearts]?.classList.add('break');
      if (id) { this.tried.add(id); btn && btn.classList.add('wrong'); }
      await wait(1900);
      if (this.disposed) return;
      this.el.card.classList.remove('shake');
      if (this.hearts <= 0) return this.levelFailed();
      // reset the scene, keep the crossed-out items
      const [, , , m] = this.scene();
      this.setMood(m);
      this.el.duo.className = 'pk-duo'; this.el.threat.className = 'pk-threat';
      this.el.hzf.className = 'pk-layer pk-hzf'; this.el.fx.innerHTML = ''; this.el.caption.className = 'pk-caption'; this.el.stamp.className = 'pk-stamp';
      this.el.tray.querySelectorAll('.pk-item').forEach((x) => x.classList.remove('chosen'));
      this.busy = false;
      this.startTimer();
    }
    caption(text, cls) { const c = this.el.caption; c.textContent = text; c.className = 'pk-caption show ' + cls; }
    stamp(text, cls) { const s = this.el.stamp; s.textContent = text; s.className = 'pk-stamp ' + cls; void s.offsetWidth; s.classList.add('show'); }
    boom() {
      const b = document.createElement('div'); b.className = 'pk-boom';
      b.innerHTML = '<svg viewBox="0 0 100 100"><path d="M50 2 L60 30 L90 14 L74 42 L98 54 L68 62 L82 92 L54 74 L44 98 L36 70 L8 84 L24 58 L2 44 L30 36 L16 10 L42 26Z" fill="#ffb21c" stroke="#2a1650" stroke-width="4" stroke-linejoin="round"/><path d="M50 22 L56 38 L74 32 L64 48 L78 58 L60 60 L64 78 L50 66 L40 80 L40 62 L22 64 L34 52 L22 38 L40 40Z" fill="#fff36b"/><text x="50" y="57" text-anchor="middle" font-size="14" font-family="Lilita One, sans-serif" fill="#e8304f" stroke="#2a1650" stroke-width="1">BOOM!</text></svg>';
      this.el.fx.appendChild(b);
    }
    confetti() {
      const colors = ['#ff4f7b', '#ffe14d', '#2fb4ff', '#27c46b', '#8d5bff'];
      for (let k = 0; k < 22; k++) {
        const c = document.createElement('i'); c.className = 'pk-conf';
        c.style.left = 10 + Math.random() * 80 + '%'; c.style.background = colors[k % 5];
        c.style.animationDelay = Math.random() * 0.3 + 's'; c.style.setProperty('--dx', (Math.random() - 0.5) * 120 + 'px');
        this.el.fx.appendChild(c);
      }
    }

    // ---------------------------------------------------------------- results
    levelDone() {
      this.busy = true; this.stopTimer();
      const stars = this.mistakes === 0 ? 3 : this.mistakes === 1 ? 2 : 1;
      const before = this.starsOf(this.i);
      const coins = Math.max(0, stars - before) * 5;
      if (stars > before) this.d.stars[this.i] = stars;
      if (coins) this.api.addCoins(coins);
      if (this.i + 1 >= this.d.unlocked) this.d.unlocked = Math.min(LEVELS.length, this.i + 2);
      const cleared = LEVELS.reduce((a, _, i) => a + (this.d.stars[i] ? 1 : 0), 0);
      this.api.setProgress(Math.floor((cleared / LEVELS.length) * 10));
      if (cleared === LEVELS.length) this.api.clear();
      this.api.save();
      this.sfx('clear');
      this.modal(`<div class="panel-head b-green">SAVED!</div><div class="panel-body">
        <p class="pk-m-title">${LEVELS[this.i][0]}</p>
        <div class="pk-bigstars">${[0, 1, 2].map((k) => `<i class="${k < stars ? 'on' : ''}" style="animation-delay:${0.15 + k * 0.2}s">★</i>`).join('')}</div>
        <p>${this.mistakes === 0 ? 'Perfect! No wrong picks.' : `${this.mistakes} wrong pick${this.mistakes > 1 ? 's' : ''}.`}</p>
        ${coins ? `<p class="pk-m-coins"><i class="coin"></i> +${coins} coins</p>` : ''}
        ${this.i + 1 < LEVELS.length ? '<button class="btn b-green" data-pk="next">NEXT LEVEL ▶</button>' : '<p class="pk-m-title">YOU SAVED THEM EVERY TIME! 🎉</p>'}
        <button class="btn btn-sm b-orange" data-pk="retry">↻ REPLAY</button>
        <button class="btn btn-sm b-white" data-pk="levels">☰ LEVELS</button></div>`);
    }
    levelFailed() {
      this.stopTimer();
      this.modal(`<div class="panel-head b-red">OUT OF HEARTS!</div><div class="panel-body">
        <p class="pk-m-title">${LEVELS[this.i][0]}</p><p>Three wrong picks. Bo and Pip believe in you. Try again!</p>
        <button class="btn b-green" data-pk="retry">↻ TRY AGAIN</button>
        <button class="btn btn-sm b-white" data-pk="levels">☰ LEVELS</button></div>`);
    }
    modal(html) { this.el.panel.innerHTML = html; this.el.modal.hidden = false; }

    pause() { this.running = false; }
    resume() { this.running = true; }
    destroy() {
      this.disposed = true; this.stopTimer();
      this.api.save();
      this.ro.disconnect();
      this.stage.removeEventListener('click', this.onClick);
      this.stage.classList.remove('pk-stage');
      this.stage.innerHTML = '';
    }
  }

  window.GAME_MODULES = window.GAME_MODULES || {};
  window.GAME_MODULES.pick = { create: (stage, api) => new PickOne(stage, api) };
})();
