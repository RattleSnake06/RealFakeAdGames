/* =====================================================================
   NUMBER TOWER — world backdrops. One hand-built SVG scene per world, plus
   a layer of drifting particles (pollen, snow, embers, wisps, sparkles).
   Scenes are anchored to the bottom and cropped at the sides, so the key
   pieces sit near the middle where phones can see them.
   ===================================================================== */
(() => {
  'use strict';
  const OL = '#2a1650';
  const rng = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // ---------------------------------------------------------------- small reusable shapes
  const cloud = (x, y, s, fill = '#fff', shade = '#d6f0ff') => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-90 30 Q-100 -6 -64 -10 Q-56 -48 -14 -40 Q6 -70 44 -46 Q86 -50 84 -10 Q112 0 98 30 Z" fill="${fill}"/>
      <path d="M-90 30 Q-40 18 0 24 Q50 16 98 30 Z" fill="${shade}"/>
    </g>`;
  const tree = (x, y, s, leaf = '#3fb85a', dark = '#2a9a46') => `
    <g transform="translate(${x} ${y}) scale(${s})" stroke="${OL}" stroke-width="5" stroke-linejoin="round">
      <rect x="-8" y="-10" width="16" height="44" rx="3" fill="#9a5b2e"/>
      <circle cx="-22" cy="-26" r="26" fill="${dark}"/><circle cx="20" cy="-30" r="28" fill="${dark}"/><circle cx="0" cy="-52" r="32" fill="${leaf}"/>
      <circle cx="-12" cy="-62" r="9" fill="#fff" opacity=".3" stroke="none"/>
    </g>`;
  const flower = (x, y, c) => `
    <g transform="translate(${x} ${y})"><path d="M0 0 V18" stroke="#2a9a46" stroke-width="4"/>
      ${[0, 72, 144, 216, 288].map((a) => `<circle cx="${Math.cos((a * Math.PI) / 180) * 7}" cy="${Math.sin((a * Math.PI) / 180) * 7}" r="6" fill="${c}" stroke="${OL}" stroke-width="2.5"/>`).join('')}
      <circle r="5" fill="#ffe14d" stroke="${OL}" stroke-width="2.5"/></g>`;
  const pine = (x, y, s, snow) => `
    <g transform="translate(${x} ${y}) scale(${s})" stroke="${OL}" stroke-width="5" stroke-linejoin="round">
      <rect x="-7" y="0" width="14" height="26" fill="#7a4a2a"/>
      <path d="M-46 4 L0 -44 L46 4 Z" fill="#2f7d8f"/><path d="M-38 -26 L0 -76 L38 -26 Z" fill="#358fa3"/><path d="M-28 -56 L0 -104 L28 -56 Z" fill="#3ea3b8"/>
      ${snow ? '<path d="M-14 -76 L0 -104 L14 -76 Q7 -70 0 -78 Q-7 -70 -14 -76Z M-22 -46 Q-10 -40 0 -48 Q10 -40 22 -46 L12 -60 L-12 -60Z" fill="#fff" stroke-width="3"/>' : ''}
    </g>`;
  const stone = (x, y, s, cross) => `
    <g transform="translate(${x} ${y}) scale(${s}) rotate(${cross ? -6 : 4})" stroke="${OL}" stroke-width="5" stroke-linejoin="round">
      ${cross ? '<path d="M-6 -60 H6 V-40 H22 V-28 H6 V20 H-6 V-28 H-22 V-40 H-6Z" fill="#7d6ca8"/>'
        : '<path d="M-26 20 V-26 Q-26 -54 0 -54 Q26 -54 26 -26 V20 Z" fill="#7d6ca8"/><path d="M-12 -24 H12 M-8 -10 H8" stroke="#4a3d6e" stroke-width="4"/>'}
    </g>`;
  const deadTree = (x, y, s) => `
    <g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="#1d0e33" stroke-linecap="round" stroke-linejoin="round">
      <path d="M0 40 Q-4 -10 6 -60 Q12 -100 -10 -140" stroke-width="18"/>
      <path d="M4 -50 Q40 -70 58 -110 M58 -110 Q70 -120 84 -116 M58 -110 Q54 -130 64 -146 M-2 -20 Q-40 -30 -60 -70 M-60 -70 Q-80 -74 -88 -96 M-8 -110 Q-40 -120 -50 -150" stroke-width="9"/>
    </g>`;
  const island = (x, y, s, cls) => `
    <g class="${cls}"><g transform="translate(${x} ${y}) scale(${s})" stroke="${OL}" stroke-width="5" stroke-linejoin="round">
      <path d="M-110 0 Q-60 110 0 150 Q40 100 110 0 Z" fill="#d9a86c"/><path d="M-60 40 Q-20 80 10 120 M30 20 Q40 60 50 70" stroke="#b07a44" stroke-width="5" fill="none"/>
      <rect x="64" y="-2" width="20" height="150" fill="#bfefff" stroke-width="4" opacity=".9"/><path d="M70 20 V140 M78 40 V146" stroke="#fff" stroke-width="3"/>
      <path d="M-118 4 Q-110 -26 -60 -24 Q0 -34 60 -24 Q112 -26 118 4 Q0 18 -118 4Z" fill="#8ff07a"/>
      <g transform="translate(-20 -26)"><rect x="-38" y="-8" width="76" height="10" fill="#fff4e0"/>
        ${[-30, -12, 6, 24].map((px) => `<rect x="${px}" y="-56" width="10" height="48" fill="#fffaf0" stroke-width="3.5"/>`).join('')}
        <path d="M-44 -56 L0 -84 L44 -56 Z" fill="#ffc21c"/></g>
    </g></g>`;
  const butterfly = (i, c, x, y) => `
    <g transform="translate(${x} ${y})"><g class="sc-fly f${i}"><g class="sc-flap">
      <path d="M0 0 Q-16 -18 -20 -4 Q-18 8 0 2 Z M0 0 Q16 -18 20 -4 Q18 8 0 2 Z" fill="${c}" stroke="${OL}" stroke-width="2.5"/>
      <path d="M0 -6 V8" stroke="${OL}" stroke-width="3" stroke-linecap="round"/></g></g></g>`;
  const bat = (i, y, s) => `
    <g transform="translate(0 ${y}) scale(${s})"><g class="sc-bat b${i}"><g class="sc-flap">
      <path d="M0 0 Q-12 -14 -34 -8 Q-26 -2 -28 6 Q-18 0 -12 8 Q-6 2 0 6 Q6 2 12 8 Q18 0 28 6 Q26 -2 34 -8 Q12 -14 0 0Z" fill="#1d0e33"/>
      <circle cx="-3" cy="-2" r="1.6" fill="#ffe14d"/><circle cx="3" cy="-2" r="1.6" fill="#ffe14d"/></g></g></g>`;

  // ---------------------------------------------------------------- the five worlds
  function grass() {
    const r = rng(11);
    const flowers = [...Array(26)].map((_, i) => flower(30 + i * 61 + r() * 30, 812 + r() * 50, ['#ff7ab8', '#fff', '#ffe14d', '#b98aff'][i % 4])).join('');
    const tufts = [...Array(30)].map(() => { const x = r() * 1600, y = 800 + r() * 90; return `<path d="M${x} ${y} l-6 -16 M${x} ${y} l0 -20 M${x} ${y} l6 -16" stroke="#2a9a46" stroke-width="4" stroke-linecap="round"/>`; }).join('');
    return `
      <defs><linearGradient id="sc0s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb8ff"/><stop offset=".62" stop-color="#b8ecff"/><stop offset="1" stop-color="#e9fbff"/></linearGradient>
        <radialGradient id="sc0sun"><stop offset="0" stop-color="#fff8c4"/><stop offset=".7" stop-color="#ffe14d"/><stop offset="1" stop-color="#ffc21c"/></radialGradient></defs>
      <rect width="1600" height="900" fill="url(#sc0s)"/>
      <g transform="translate(1040 160)"><g class="sc-spin">${[...Array(12)].map((_, i) => `<path d="M-14 0 L0 -230 L14 0 Z" fill="#fff" opacity=".22" transform="rotate(${i * 30})"/>`).join('')}</g>
        ${[...Array(10)].map((_, i) => `<path d="M-11 -84 L0 -112 L11 -84 Z" fill="#ffc21c" stroke="${OL}" stroke-width="5" stroke-linejoin="round" transform="rotate(${i * 36 + 18})"/>`).join('')}
        <circle r="74" fill="url(#sc0sun)" stroke="${OL}" stroke-width="6"/>
        <circle cx="-26" cy="-28" r="22" fill="#fff" opacity=".45"/><circle cx="-44" cy="-4" r="7" fill="#fff" opacity=".45"/></g>
      <g class="sc-drift a">${cloud(220, 150, 1.3)}${cloud(1380, 250, 1.0)}</g>
      <g class="sc-drift b">${cloud(660, 90, 0.8)}${cloud(1250, 90, 0.7)}</g>
      <path d="M0 610 Q220 520 440 590 T880 560 T1320 585 T1600 555 V900 H0Z" fill="#b5ec98"/>
      <g fill="#93d679" transform="translate(1230 548)">
        <rect x="-60" y="-50" width="120" height="50"/><rect x="-80" y="-90" width="34" height="90"/><rect x="46" y="-90" width="34" height="90"/><rect x="-16" y="-120" width="32" height="70"/>
        <path d="M-84 -90 L-63 -122 L-42 -90Z M42 -90 L63 -122 L84 -90Z M-20 -120 L0 -150 L20 -120Z"/>
        <path d="M0 -150 V-176" stroke="#93d679" stroke-width="4"/><path d="M0 -176 L22 -168 L0 -160Z" fill="#ff8ab0"/></g>
      <path d="M0 700 Q300 610 640 680 T1280 650 T1600 668 V900 H0Z" fill="#7fdc63" stroke="${OL}" stroke-width="6"/>
      ${tree(130, 650, 1.1)}${tree(300, 640, 0.8, '#5cc75a', '#3fae52')}${tree(1340, 636, 1.0)}${tree(1500, 650, 1.2, '#5cc75a', '#3fae52')}
      <g stroke="${OL}" stroke-width="5" fill="#c77b3c">${[0, 1, 2, 3, 4].map((i) => `<rect x="${30 + i * 62}" y="738" width="14" height="58" rx="3"/>`).join('')}<rect x="20" y="752" width="290" height="12" rx="4"/><rect x="20" y="776" width="290" height="12" rx="4"/></g>
      <path d="M0 792 Q400 742 800 782 T1600 772 V900 H0Z" fill="#4cc75b" stroke="${OL}" stroke-width="6"/>
      ${tufts}${flowers}
      ${butterfly(1, '#ff7ab8', 420, 700)}${butterfly(2, '#ffe14d', 1180, 690)}${butterfly(3, '#b98aff', 760, 600)}`;
  }
  function frozen() {
    const r = rng(21);
    const stars = [...Array(40)].map(() => `<circle class="sc-tw" style="animation-delay:${(r() * 3).toFixed(2)}s" cx="${r() * 1600}" cy="${r() * 260}" r="${1 + r() * 2.2}" fill="#fff"/>`).join('');
    const peaks = (pts, fill, stroke) => `<path d="M0 900 ${pts.map(([x, y]) => `L${x} ${y}`).join(' ')} L1600 900Z" fill="${fill}" ${stroke ? `stroke="${OL}" stroke-width="5" stroke-linejoin="round"` : ''}/>`;
    const caps = (pts, stroke) => pts.filter((_, i) => i % 2 === 1).map(([x, y]) => `<path d="M${x - 46} ${y + 50} L${x} ${y} L${x + 46} ${y + 50} Q${x + 24} ${y + 38} ${x + 10} ${y + 52} Q${x} ${y + 40} ${x - 14} ${y + 54} Q${x - 30} ${y + 40} ${x - 46} ${y + 50}Z" fill="#fff" ${stroke ? `stroke="${OL}" stroke-width="4" stroke-linejoin="round"` : ''}/>`).join('');
    const far = [[0, 600], [180, 400], [330, 560], [480, 360], [650, 590], [820, 420], [990, 600], [1180, 380], [1370, 580], [1520, 440], [1600, 520]];
    const mid = [[0, 700], [210, 520], [390, 670], [580, 500], [780, 700], [980, 540], [1160, 690], [1360, 520], [1600, 690]];
    return `
      <defs><linearGradient id="sc1s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f63b8"/><stop offset=".45" stop-color="#8fbfee"/><stop offset="1" stop-color="#e9f7ff"/></linearGradient>
        <linearGradient id="sc1a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5dffb4" stop-opacity="0"/><stop offset=".3" stop-color="#5dffb4"/><stop offset=".6" stop-color="#4fd8ff"/><stop offset=".85" stop-color="#c58aff"/><stop offset="1" stop-color="#c58aff" stop-opacity="0"/></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#sc1s)"/>
      ${stars}
      <g class="sc-aurora"><path d="M-40 250 C300 110 600 330 900 190 S1400 110 1700 220 L1700 270 C1400 170 1150 270 900 250 S300 180 -40 310Z" fill="url(#sc1a)" opacity=".55"/></g>
      <g class="sc-aurora two"><path d="M-40 330 C260 220 640 380 960 280 S1420 230 1700 320 L1700 350 C1380 280 1200 360 960 330 S300 290 -40 370Z" fill="url(#sc1a)" opacity=".35"/></g>
      <g transform="translate(1040 150)"><circle r="56" fill="#f4f8ff" stroke="${OL}" stroke-width="5"/><circle r="56" fill="none" stroke="#fff" stroke-width="26" opacity=".18"/><circle cx="-16" cy="-10" r="10" fill="#dbe6ff"/><circle cx="18" cy="14" r="7" fill="#dbe6ff"/></g>
      ${peaks(far, '#c7dcf3')}${caps(far)}
      ${peaks(mid, '#a4c6ea', true)}${caps(mid, true)}
      ${pine(90, 760, 1.1, true)}${pine(210, 770, 0.8, true)}${pine(1420, 760, 1.15, true)}${pine(1540, 772, 0.85, true)}${pine(330, 776, 0.65, true)}
      <path d="M0 780 Q400 728 800 768 T1600 758 V900 H0Z" fill="#f4fbff" stroke="${OL}" stroke-width="6"/>
      <path d="M0 830 Q300 812 600 830 T1200 826 T1600 832" stroke="#cfe6fb" stroke-width="10" fill="none"/>
      <ellipse cx="800" cy="860" rx="480" ry="46" fill="#bfe9ff" stroke="${OL}" stroke-width="5"/>
      <path d="M520 852 L600 846 M700 866 L820 858 M940 850 L1010 846" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <g transform="translate(1250 770)" stroke="${OL}" stroke-width="5">
        <circle cy="0" r="38" fill="#fff"/><circle cy="-56" r="28" fill="#fff"/><circle cy="-98" r="20" fill="#fff"/>
        <path d="M-2 -98 L22 -92 L-2 -88Z" fill="#ff9a3d" stroke-width="3"/><circle cx="-8" cy="-104" r="3" fill="${OL}"/><circle cx="6" cy="-104" r="3" fill="${OL}"/>
        <path d="M-26 -78 Q0 -66 26 -78 L28 -70 Q0 -56 -28 -70Z M14 -72 L24 -40 L12 -40Z" fill="#ff4f7b" stroke-width="4"/>
        <path d="M-26 -56 L-62 -78 M26 -56 L60 -84" stroke="#7a4a2a" stroke-width="5" stroke-linecap="round"/>
        <rect x="-20" y="-132" width="40" height="18" rx="3" fill="#3b3552"/><rect x="-28" y="-118" width="56" height="7" rx="3" fill="#3b3552"/></g>`;
  }
  function burning() {
    const r = rng(31);
    const cracks = [...Array(14)].map(() => { const x = r() * 1600, y = 820 + r() * 60; return `<path d="M${x} ${y} l${16 + r() * 20} ${-6 + r() * 12} l${10 + r() * 16} ${-8 + r() * 16}" stroke="#ff8a3d" stroke-width="4" fill="none" stroke-linecap="round" class="sc-glow"/>`; }).join('');
    return `
      <defs><linearGradient id="sc2s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a0f24"/><stop offset=".35" stop-color="#b8302e"/><stop offset=".7" stop-color="#ff7a3d"/><stop offset="1" stop-color="#ffc56b"/></linearGradient>
        <radialGradient id="sc2g"><stop offset="0" stop-color="#ffe14d" stop-opacity=".9"/><stop offset=".4" stop-color="#ff7a3d" stop-opacity=".55"/><stop offset="1" stop-color="#ff3d24" stop-opacity="0"/></radialGradient></defs>
      <rect width="1600" height="900" fill="url(#sc2s)"/>
      <path d="M0 640 L110 540 L190 600 L320 470 L450 610 L580 500 L700 620 L1250 610 L1360 480 L1470 580 L1600 500 V900 H0Z" fill="#7a2626"/>
      <circle class="sc-pulse" cx="1050" cy="380" r="260" fill="url(#sc2g)"/>
      <g class="sc-smoke">${[0, 1, 2, 3, 4].map((i) => `<circle class="sc-puff p${i}" cx="${1030 + (i % 2) * 40}" cy="${330 - i * 6}" r="${46 + i * 10}" fill="#5a3a3a" opacity=".75"/>`).join('')}</g>
      <path d="M720 780 L930 400 Q1050 370 1170 400 L1400 780Z" fill="#4a1e24" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M930 400 Q1050 370 1170 400 Q1050 430 930 400Z" fill="#ffb23d" stroke="${OL}" stroke-width="5"/>
      <path d="M990 412 Q980 520 930 600 Q910 660 860 700 L900 702 Q960 640 990 570 Q1020 480 1030 418Z" fill="#ff6a24" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M1090 416 Q1110 520 1170 610 Q1210 680 1260 720 L1220 724 Q1160 660 1120 590 Q1080 500 1070 420Z" fill="#ff6a24" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M1000 430 Q992 520 950 600 M1084 430 Q1100 520 1150 610" stroke="#ffe14d" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g fill="#2a1418">${[[200, 720], [320, 740], [1480, 726]].map(([x, y]) => `<path d="M${x} ${y + 60} V${y} M${x} ${y + 20} L${x - 30} ${y - 20} M${x} ${y + 30} L${x + 34} ${y - 4}" stroke="#2a1418" stroke-width="12" stroke-linecap="round"/>`).join('')}</g>
      <path d="M0 790 Q380 740 800 780 T1600 770 V900 H0Z" fill="#2e1a20" stroke="${OL}" stroke-width="6"/>
      ${cracks}
      <path class="sc-glow" d="M-20 858 C200 820 360 880 560 846 S920 820 1100 856 S1460 830 1620 852 L1620 900 L-20 900Z" fill="#ff6a24" stroke="${OL}" stroke-width="5"/>
      <path d="M40 872 C220 846 380 884 560 862 S900 846 1080 870 S1420 852 1580 868" stroke="#ffe14d" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  }
  function cursed() {
    const r = rng(41);
    const stars = [...Array(70)].map(() => `<circle class="sc-tw" style="animation-delay:${(r() * 4).toFixed(2)}s" cx="${r() * 1600}" cy="${r() * 520}" r="${0.8 + r() * 2.4}" fill="#fff"/>`).join('');
    return `
      <defs><linearGradient id="sc3s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e0420"/><stop offset=".45" stop-color="#2e1252"/><stop offset="1" stop-color="#6a3aa0"/></linearGradient>
        <radialGradient id="sc3m"><stop offset="0" stop-color="#f6f9d2"/><stop offset="1" stop-color="#dfe8a8"/></radialGradient></defs>
      <rect width="1600" height="900" fill="url(#sc3s)"/>
      ${stars}
      <g transform="translate(1030 190)"><circle r="170" fill="#e9ffb0" opacity=".08"/><circle r="120" fill="#e9ffb0" opacity=".1"/>
        <circle r="92" fill="url(#sc3m)" stroke="${OL}" stroke-width="6"/>
        <circle cx="-30" cy="-22" r="16" fill="#cbd68e"/><circle cx="26" cy="18" r="22" fill="#cbd68e"/><circle cx="-18" cy="42" r="10" fill="#cbd68e"/></g>
      ${bat(1, 260, 1.2)}${bat(2, 360, 0.9)}${bat(3, 180, 0.7)}
      <g fill="#1e0c38">
        <path d="M0 640 L40 560 Q120 520 200 540 L260 470 L330 480 L360 560 L420 620 L480 640 V900 H0Z"/>
        <rect x="130" y="380" width="60" height="170"/><rect x="250" y="330" width="50" height="160"/><rect x="190" y="440" width="80" height="110"/>
        <path d="M124 380 L160 320 L196 380Z M244 330 L275 270 L306 330Z"/>
        <path d="M160 320 V292 M275 270 V244" stroke="#1e0c38" stroke-width="4"/></g>
      <g fill="#ffe14d" class="sc-glow">${[[148, 420], [168, 470], [262, 370], [278, 420], [210, 480], [240, 500]].map(([x, y]) => `<rect x="${x}" y="${y}" width="10" height="16" rx="2"/>`).join('')}</g>
      <path d="M0 720 Q300 640 620 700 T1260 670 T1600 690 V900 H0Z" fill="#3a2160" stroke="${OL}" stroke-width="6"/>
      ${deadTree(1420, 700, 1.0)}${deadTree(560, 712, 0.7)}
      ${stone(360, 760, 0.9)}${stone(470, 772, 0.7, true)}${stone(1180, 752, 0.95, true)}${stone(1290, 768, 0.75)}
      <g transform="translate(1530 790)" stroke="${OL}" stroke-width="5"><ellipse rx="38" ry="30" fill="#ff8a1c"/><path d="M-12 -30 Q-10 -46 4 -48" stroke="#3a8a3a" stroke-width="6" fill="none"/>
        <path d="M-20 -8 L-10 -16 L-4 -6Z M20 -8 L10 -16 L4 -6Z M-18 8 Q0 22 18 8 L10 12 L6 6 L0 12 L-6 6 L-10 12Z" fill="#ffe14d" stroke-width="2.5" class="sc-glow"/></g>
      <path d="M0 800 Q400 760 800 790 T1600 784 V900 H0Z" fill="#2a1846" stroke="${OL}" stroke-width="6"/>
      <g class="sc-fog a"><path d="M-200 780 Q100 740 400 780 T1000 770 T1600 790 T2000 770 V840 H-200Z" fill="#d9c8ff" opacity=".16"/></g>
      <g class="sc-fog b"><path d="M-300 830 Q0 800 300 830 T900 820 T1500 834 T2100 820 V900 H-300Z" fill="#d9c8ff" opacity=".2"/></g>`;
  }
  function celestial() {
    const r = rng(51);
    const rb = ['#ff6b7a', '#ffa64d', '#ffe14d', '#7be07a', '#5fc8ff', '#a77bff'];
    return `
      <defs><linearGradient id="sc4s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9fda"/><stop offset=".5" stop-color="#ffd3c4"/><stop offset="1" stop-color="#fff5d8"/></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#sc4s)"/>
      <g transform="translate(800 -80)"><g class="sc-spin slow">${[...Array(10)].map((_, i) => `<path d="M-40 0 L0 1100 L40 0Z" fill="#fff" opacity=".16" transform="rotate(${-60 + i * 13})"/>`).join('')}</g></g>
      <g opacity=".6" fill="none">${rb.map((c, i) => `<path d="M${130 + i * 26} 900 A${670 - i * 26} ${670 - i * 26} 0 0 1 ${1470 - i * 26} 900" stroke="${c}" stroke-width="26"/>`).join('')}</g>
      <g transform="translate(1060 150)"><circle r="110" fill="#fff" opacity=".35"/><circle r="64" fill="#fffbe6" stroke="${OL}" stroke-width="5"/></g>
      ${island(240, 430, 0.95, 'sc-bob a')}${island(1360, 360, 0.8, 'sc-bob b')}${island(560, 250, 0.42, 'sc-bob c')}
      <g class="sc-drift a">${cloud(300, 640, 1.6, '#fff', '#f3dcff')}${cloud(1300, 620, 1.4, '#fff', '#f3dcff')}</g>
      <path d="M0 760 Q80 700 170 740 Q240 690 330 730 Q420 680 520 726 Q610 690 700 730 Q800 680 900 728 Q990 690 1080 730 Q1180 684 1270 726 Q1370 690 1450 734 Q1530 700 1600 730 V900 H0Z" fill="#fff" stroke="${OL}" stroke-width="5"/>
      <path d="M0 820 Q120 790 240 812 Q380 780 520 810 Q660 784 800 812 Q960 780 1100 808 Q1260 786 1400 812 Q1500 794 1600 806 V900 H0Z" fill="#f3e6ff"/>
      ${[...Array(10)].map(() => `<path class="sc-tw" style="animation-delay:${(r() * 3).toFixed(2)}s" transform="translate(${r() * 1600} ${120 + r() * 520}) scale(${0.6 + r()})" d="M0 -14 Q2 -2 14 0 Q2 2 0 14 Q-2 2 -14 0 Q-2 -2 0 -14Z" fill="#fff"/>`).join('')}`;
  }
  const BUILD = [grass, frozen, burning, cursed, celestial];
  const PARTS = ['pollen', 'snow', 'ember', 'wisp', 'spark'];
  const cache = {};

  function html(world) {
    if (cache[world]) return cache[world];
    const r = rng(99 + world);
    const kind = PARTS[world], n = kind === 'snow' ? 46 : 26;
    const parts = [...Array(n)].map(() => {
      const size = (kind === 'snow' ? 3 : 4) + r() * (kind === 'snow' ? 7 : 6);
      const top = kind === 'snow' ? 0 : kind === 'ember' ? 100 : 15 + r() * 80;
      const sz = kind === 'spark' ? size * 2 : size;
      return `<i class="sc-p ${kind}" style="left:${(r() * 100).toFixed(1)}%;top:${top.toFixed(1)}%;width:${sz.toFixed(1)}px;height:${sz.toFixed(1)}px;animation-duration:${(6 + r() * 8).toFixed(1)}s;animation-delay:-${(r() * 12).toFixed(1)}s"></i>`;
    }).join('');
    cache[world] = `<svg class="sc-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${BUILD[world]()}</svg><div class="sc-parts">${parts}</div>`;
    return cache[world];
  }

  window.TOWER_SCENES = { html };
})();
