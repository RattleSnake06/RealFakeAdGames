/* =====================================================================
   PICK ONE! — art library: backgrounds, the stick-figure duo (Bo & Pip) with moods,
   threats, and the item icons. All inline SVG in our chunky outlined style.
   ===================================================================== */
(() => {
  'use strict';
  const OL = '#2a1650';
  const S = (w) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  // ---------------------------------------------------------------- backgrounds (300 x 400, portrait)
  const pine = (x, y, s, c) => `<path d="M${x} ${y - 70 * s} L${x + 26 * s} ${y - 20 * s} L${x + 14 * s} ${y - 20 * s} L${x + 32 * s} ${y} L${x - 32 * s} ${y} L${x - 14 * s} ${y - 20 * s} L${x - 26 * s} ${y - 20 * s} Z" fill="${c}"/>`;
  const cloud = (x, y, s, c = '#fff') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><circle cx="-22" cy="4" r="16"/><circle cx="0" cy="-6" r="22"/><circle cx="24" cy="4" r="16"/><rect x="-38" y="4" width="78" height="16" rx="8"/></g>`;
  const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const BG = {
    forest: () => `<defs>${grad('pkfo', '#2f8f8a', '#a6e3cf')}</defs><rect width="300" height="400" fill="url(#pkfo)"/>
      <path d="M0 210 L60 140 L110 190 L170 120 L230 185 L300 130 V260 H0Z" fill="#3a9c8c"/>
      ${pine(30, 250, 1.1, '#26706a')}${pine(270, 250, 1.2, '#26706a')}${pine(80, 245, 0.7, '#2f8278')}${pine(225, 240, 0.8, '#2f8278')}
      <path d="M0 255 Q150 225 300 255 V400 H0Z" fill="#3fae6a" ${S(4)}/>
      <path d="M-10 400 Q-20 330 40 330 Q50 300 90 320 Q110 300 130 340 Q120 380 140 400Z M310 400 Q320 320 260 330 Q240 300 205 325 Q180 320 175 360 Q170 390 190 400Z" fill="#2f9a5a" ${S(4)}/>`,
    ocean: () => `<defs>${grad('pkoc', '#7fd4ff', '#e2f7ff')}${grad('pkos', '#3ab0e8', '#1a6fb8')}</defs><rect width="300" height="400" fill="url(#pkoc)"/>
      <circle cx="40" cy="60" r="34" fill="#fff3a6"/>${cloud(220, 70, 1)}${cloud(120, 110, 0.6)}
      <path d="M0 190 L50 170 L90 185 L140 168 L180 186 V200 H0Z" fill="#8fb8d6"/>
      <rect y="195" width="300" height="205" fill="url(#pkos)"/>
      <path d="M0 230 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 M0 300 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#bfeaff" stroke-width="4" fill="none" opacity=".7"/>`,
    beach: () => `<defs>${grad('pkbe', '#6fd0ff', '#dff6ff')}</defs><rect width="300" height="400" fill="url(#pkbe)"/>
      <circle cx="250" cy="60" r="30" fill="#fff3a6"/>${cloud(90, 70, 0.8)}
      <rect y="190" width="300" height="70" fill="#2ea6e0"/><path d="M0 200 q25 -6 50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#bfeaff" stroke-width="4" fill="none"/>
      <path d="M0 250 Q150 232 300 250 V400 H0Z" fill="#ffe0a3" ${S(4)}/>
      <path d="M44 330 Q30 260 52 200" fill="none" stroke="#9a5b2e" stroke-width="12" stroke-linecap="round"/>
      <path d="M52 200 Q20 190 4 214 Q30 200 52 204 Q40 176 70 168 Q62 190 56 204 Q90 184 104 206 Q76 200 56 206Z" fill="#3fb85a" ${S(3.5)}/>`,
    desert: () => `<defs>${grad('pkde', '#ff9a5a', '#ffe0a0')}</defs><rect width="300" height="400" fill="url(#pkde)"/>
      <circle cx="150" cy="90" r="46" fill="#fff0a0" opacity=".9"/>
      <path d="M0 220 Q80 180 160 215 T300 205 V260 H0Z" fill="#f2b56b"/>
      <path d="M0 255 Q150 230 300 252 V400 H0Z" fill="#ffd38a" ${S(4)}/>
      <g fill="#4cb860" ${S(4)}><rect x="236" y="190" width="18" height="70" rx="9"/><path d="M236 225 H222 V205" fill="none" stroke-width="12"/><path d="M236 225 H222 V205" fill="none" stroke="#4cb860" stroke-width="5"/></g>`,
    snow: () => `<defs>${grad('pksn', '#8fc4f0', '#eef8ff')}</defs><rect width="300" height="400" fill="url(#pksn)"/>
      <path d="M0 230 L70 120 L120 200 L190 100 L260 210 L300 160 V260 H0Z" fill="#c7dcf3"/>
      <path d="M50 152 L70 120 L88 150 Q78 144 70 152 Q62 144 50 152Z M170 132 L190 100 L210 132 Q200 124 190 134 Q180 124 170 132Z" fill="#fff"/>
      ${pine(32, 262, 1, '#2f7d8f')}${pine(268, 262, 1.1, '#2f7d8f')}
      <path d="M0 258 Q150 232 300 258 V400 H0Z" fill="#f6fbff" ${S(4)}/>`,
    city: () => `<defs>${grad('pkci', '#5d6fd6', '#ffb8c8')}</defs><rect width="300" height="400" fill="url(#pkci)"/>
      <g fill="#3a3a78">${[[0, 120, 50], [46, 90, 46], [88, 140, 40], [126, 70, 54], [178, 110, 44], [220, 80, 50], [266, 130, 40]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${300 - y}"/>`).join('')}</g>
      <g fill="#ffe14d" opacity=".85">${[...Array(24)].map((_, i) => `<rect x="${8 + (i * 37) % 280}" y="${130 + (i * 53) % 120}" width="8" height="10"/>`).join('')}</g>
      <rect y="262" width="300" height="138" fill="#5a5f78" ${S(4)}/><path d="M0 330 H300" stroke="#fff" stroke-width="5" stroke-dasharray="22 16"/>`,
    house: () => `<rect width="300" height="400" fill="#ffe8c2"/><g fill="#ffd79a">${[...Array(8)].map((_, i) => `<rect x="${i * 40}" width="18" height="280"/>`).join('')}</g>
      <rect x="180" y="60" width="90" height="100" rx="6" fill="#9fdcff" ${S(5)}/><path d="M225 60 V160 M180 110 H270" ${S(5)}/>
      <rect x="40" y="80" width="60" height="46" rx="4" fill="#ff9fc4" ${S(4)}/><circle cx="70" cy="103" r="10" fill="#ffe14d"/>
      <rect y="270" width="300" height="130" fill="#c68a52" ${S(4)}/><path d="M0 310 H300 M0 350 H300 M60 270 V310 M150 310 V350 M220 270 V310 M100 350 V400" stroke="#9a5b2e" stroke-width="3"/>`,
    cave: () => `<rect width="300" height="400" fill="#4a3a52"/><path d="M0 0 H300 V60 L270 90 L250 50 L220 110 L200 60 L170 95 L140 50 L110 100 L80 55 L50 90 L20 50 L0 80Z" fill="#2e2338"/>
      <path d="M0 140 Q40 120 30 200 Q20 240 0 250Z M300 120 Q250 150 270 210 Q290 250 300 250Z" fill="#3a2d46"/>
      <path d="M0 262 Q150 240 300 262 V400 H0Z" fill="#6b5a6e" ${S(4)}/>`,
    jungle: () => `<defs>${grad('pkju', '#5fcf7a', '#c6f5b8')}</defs><rect width="300" height="400" fill="url(#pkju)"/>
      <path d="M0 0 Q30 80 10 160 M60 0 Q70 60 50 120 M250 0 Q240 90 270 170" stroke="#2f8a4a" stroke-width="6" fill="none"/>
      <path d="M-20 120 Q60 90 70 160 Q20 150 -20 170Z M320 100 Q230 90 230 160 Q280 140 320 160Z" fill="#2fae58" ${S(4)}/>
      <path d="M0 258 Q150 232 300 258 V400 H0Z" fill="#4c9a3a" ${S(4)}/>
      <path d="M0 400 Q20 320 70 330 Q60 360 90 400Z M300 400 Q290 320 240 336 Q260 360 220 400Z" fill="#2f8a4a" ${S(4)}/>`,
    space: () => `<rect width="300" height="400" fill="#160a36"/>${[...Array(40)].map((_, i) => `<circle cx="${(i * 71) % 300}" cy="${(i * 37) % 250}" r="${1 + (i % 3)}" fill="#fff"/>`).join('')}
      <circle cx="230" cy="80" r="40" fill="#ff9fda" ${S(4)}/><path d="M188 90 Q230 70 272 74" stroke="#fff" stroke-width="5" fill="none" opacity=".6"/>
      <path d="M0 262 Q150 238 300 262 V400 H0Z" fill="#9a93b8" ${S(4)}/><ellipse cx="70" cy="320" rx="26" ry="8" fill="#7d76a0"/><ellipse cx="230" cy="350" rx="34" ry="10" fill="#7d76a0"/>`,
    volcano: () => `<defs>${grad('pkvo', '#8a1f2b', '#ffb06b')}</defs><rect width="300" height="400" fill="url(#pkvo)"/>
      <path d="M40 260 L120 110 Q150 100 180 110 L260 260Z" fill="#4a1e24" ${S(5)}/><path d="M122 112 Q150 104 178 112 L170 130 Q150 120 130 130Z" fill="#ff6a24"/>
      <path d="M140 118 Q132 170 112 220 M160 118 Q168 170 190 210" stroke="#ff6a24" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M0 258 Q150 238 300 258 V400 H0Z" fill="#3a2026" ${S(4)}/>`,
    sky: () => `<defs>${grad('pksk', '#5fb8ff', '#e6f6ff')}</defs><rect width="300" height="400" fill="url(#pksk)"/>
      ${cloud(60, 80, 1)}${cloud(240, 150, 1.2)}${cloud(90, 320, 1.4)}${cloud(250, 360, 0.9)}${cloud(160, 230, 0.6)}`,
  };

  // ---------------------------------------------------------------- Bo & Pip, the stick-figure duo
  const duo = (mood) => `<svg class="pk-duo-svg" viewBox="0 -150 172 156" overflow="visible" aria-hidden="true">${window.STICK.bo(mood, 44, 0, 1)}${window.STICK.pip(mood, 126, 2, 0.94)}</svg>`;

  // ---------------------------------------------------------------- threats (100 x 100)
  const eyes = (x1, x2, y, r = 7) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="#fff" ${S(3.5)}/><circle cx="${x2}" cy="${y}" r="${r}" fill="#fff" ${S(3.5)}/><circle cx="${x1 - 1}" cy="${y + 1}" r="${r * 0.45}" fill="${OL}"/><circle cx="${x2 - 1}" cy="${y + 1}" r="${r * 0.45}" fill="${OL}"/>`;
  const THREATS = {
    shark: { name: 'shark', svg: window.STICK.creature('shark') },
    bear: { name: 'bear', svg: window.STICK.creature('bear') },
    bees: { name: 'bees', svg: [[30, 34, 1], [68, 26, 0.85], [56, 68, 1.1]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="-4" cy="-12" rx="8" ry="5" fill="#e9f8ff" ${S(2.5)}/><ellipse cx="6" cy="-12" rx="7" ry="4" fill="#e9f8ff" ${S(2.5)}/><ellipse rx="16" ry="11" fill="#ffd21c" ${S(3.5)}/><path d="M-5 -10 V10 M3 -11 V11" stroke="${OL}" stroke-width="4.5"/><circle cx="10" cy="-3" r="2.6" fill="${OL}"/><path d="M-16 0 L-22 0" ${S(3.5)}/></g>`).join('') },
    snake: { name: 'snake', svg: `<path d="M10 86 Q10 70 40 72 Q80 74 80 60 Q80 44 54 46 Q36 48 40 36" fill="none" stroke="${OL}" stroke-width="20" stroke-linecap="round"/><path d="M10 86 Q10 70 40 72 Q80 74 80 60 Q80 44 54 46 Q36 48 40 36" fill="none" stroke="#5fcf5a" stroke-width="12" stroke-linecap="round"/><ellipse cx="42" cy="26" rx="18" ry="14" fill="#5fcf5a" ${S(5)}/>${eyes(36, 50, 22, 5)}<path d="M40 38 L40 48 L36 52 M40 48 L44 52" stroke="#ff4f7b" stroke-width="3" fill="none"/>` },
    ghost: { name: 'ghost', svg: `<path d="M16 92 L16 46 Q16 10 50 10 Q84 10 84 46 L84 92 L72 84 L62 92 L50 84 L38 92 L28 84Z" fill="#f4f2ff" ${S(5)}/><ellipse cx="38" cy="44" rx="6" ry="9" fill="${OL}"/><ellipse cx="62" cy="44" rx="6" ry="9" fill="${OL}"/><ellipse cx="50" cy="66" rx="8" ry="11" fill="${OL}"/>` },
    vampire: { name: 'vampire', svg: window.STICK.creature('vampire') },
    yeti: { name: 'yeti', svg: window.STICK.creature('yeti') },
    croc: { name: 'crocodile', svg: window.STICK.creature('croc') },
    monkey: { name: 'monkey', svg: window.STICK.creature('monkey') },
    ufo: { name: 'aliens', svg: `<path d="M30 64 L10 98 H90 L70 64Z" fill="#b9ffdc" opacity=".55"/><path d="M34 40 Q50 6 66 40Z" fill="#bfeaff" ${S(4)}/><path d="M44 26 L38 14 M56 26 L62 14" ${S(2.5)}/><circle cx="38" cy="13" r="3" fill="#ff4f7b" ${S(2)}/><circle cx="62" cy="13" r="3" fill="#ff4f7b" ${S(2)}/><path d="M42 42 Q40 30 50 22 Q60 30 58 42Z" fill="#7be07a" ${S(3)}/><ellipse cx="45" cy="31" rx="3" ry="4.5" fill="${OL}" transform="rotate(-20 45 31)"/><ellipse cx="55" cy="31" rx="3" ry="4.5" fill="${OL}" transform="rotate(20 55 31)"/><ellipse cx="50" cy="48" rx="42" ry="14" fill="#9aa6c0" ${S(5)}/><circle cx="26" cy="50" r="4" fill="#ffe14d"/><circle cx="50" cy="54" r="4" fill="#ff4f7b"/><circle cx="74" cy="50" r="4" fill="#7be07a"/>` },
    mouse: { name: 'mouse', svg: window.STICK.creature('mouse') },
    spider: { name: 'spider', svg: `<path d="M50 0 V24" ${S(2.5)}/>${[-1, 1].map((d) => `<path d="M${50 + 14 * d} 44 L${50 + 34 * d} 28 L${50 + 44 * d} 40 M${50 + 16 * d} 52 L${50 + 40 * d} 48 L${50 + 48 * d} 62 M${50 + 14 * d} 60 L${50 + 34 * d} 70 L${50 + 40 * d} 86 M${50 + 10 * d} 66 L${50 + 22 * d} 84 L${50 + 24 * d} 96" fill="none" ${S(4)}/>`).join('')}<circle cx="50" cy="52" r="20" fill="#3b3552" ${S(4)}/>${eyes(43, 57, 50, 5)}` },
    dog: { name: 'dog', svg: window.STICK.creature('dog') },
  };

  // ---------------------------------------------------------------- items (100 x 100)
  const I = (name, svg) => ({ name, svg });
  const ITEMS = {
    umbrella: I('umbrella', `<path d="M10 50 Q50 0 90 50 Q80 42 70 50 Q60 42 50 50 Q40 42 30 50 Q20 42 10 50Z" fill="#b84ae8" ${S(5)}/><path d="M50 50 V84 Q50 94 40 90" fill="none" ${S(6)}/><path d="M50 12 V50" stroke="#fff" stroke-width="2" opacity=".5"/>`),
    tent: I('tent', `<path d="M50 14 L90 86 H10Z" fill="#ff8a3d" ${S(5)}/><path d="M50 14 L64 86 H36Z" fill="#ffb26b" ${S(4)}/><path d="M50 14 V6" ${S(4)}/><path d="M50 86 L44 60 L50 46 L56 60Z" fill="${OL}"/>`),
    campfire: I('campfire', `<path d="M16 84 L84 70 M16 70 L84 84" stroke="#9a5b2e" stroke-width="12" stroke-linecap="round"/><path d="M16 84 L84 70 M16 70 L84 84" ${S(3)}/><path d="M50 74 C28 70 32 46 46 26 C46 40 54 40 54 32 C70 46 72 68 50 74Z" fill="#ff6a24" ${S(4)}/><path d="M50 70 C42 68 44 56 50 48 C52 56 58 58 50 70Z" fill="#ffe14d"/>`),
    blanket: I('blanket', `<path d="M14 24 H86 V78 Q70 86 50 78 Q30 70 14 78Z" fill="#ff7ab8" ${S(5)}/><path d="M14 40 H86 M14 58 H86 M38 24 V80 M62 24 V82" stroke="#fff" stroke-width="5" opacity=".7"/>`),
    cocoa: I('hot cocoa', `<path d="M24 36 H72 V78 Q72 90 60 90 H36 Q24 90 24 78Z" fill="#ff4f7b" ${S(5)}/><path d="M72 46 Q90 46 88 62 Q86 74 72 72" fill="none" ${S(5)}/><ellipse cx="48" cy="36" rx="24" ry="6" fill="#8a4a2a" ${S(4)}/><path d="M40 26 Q36 18 42 10 M56 26 Q52 18 58 10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`),
    fan: I('fan', `<path d="M50 60 V88 M34 90 H66" ${S(6)}/><circle cx="50" cy="42" r="30" fill="#bfeaff" ${S(5)}/>${[0, 120, 240].map((a) => `<ellipse cx="50" cy="28" rx="7" ry="13" fill="#5fc8ff" ${S(3)} transform="rotate(${a} 50 42)"/>`).join('')}<circle cx="50" cy="42" r="5" fill="${OL}"/>`),
    icecream: I('ice cream', `<path d="M32 50 L50 94 L68 50Z" fill="#e0a060" ${S(5)}/><path d="M38 60 L60 76 M44 54 L64 66 M36 70 L52 82" stroke="#b57a3a" stroke-width="3"/><circle cx="50" cy="40" r="20" fill="#ffb3d0" ${S(5)}/><circle cx="50" cy="20" r="7" fill="#ff4f7b" ${S(4)}/>`),
    water: I('water', `<rect x="36" y="8" width="28" height="12" rx="3" fill="#2f7de0" ${S(4)}/><path d="M34 20 H66 Q74 30 72 44 V86 Q72 94 64 94 H36 Q28 94 28 86 V44 Q26 30 34 20Z" fill="#bfeaff" ${S(5)}/><path d="M28 54 H72 V86 Q72 94 64 94 H36 Q28 94 28 86Z" fill="#5fc8ff"/><path d="M38 40 V80" stroke="#fff" stroke-width="5" opacity=".7" stroke-linecap="round"/>`),
    parasol: I('beach umbrella', `<path d="M8 46 Q50 -4 92 46Z" fill="#ffe14d" ${S(5)}/><path d="M50 4 Q40 20 36 46 M50 4 Q60 20 64 46" stroke="#ff4f7b" stroke-width="10" fill="none"/><path d="M8 46 Q50 -4 92 46Z" fill="none" ${S(5)}/><path d="M50 46 V96" ${S(6)}/>`),
    bucket: I('bucket of water', `<path d="M20 34 L28 90 H72 L80 34Z" fill="#9aa6c0" ${S(5)}/><ellipse cx="50" cy="34" rx="30" ry="9" fill="#5fc8ff" ${S(4)}/><path d="M20 34 Q50 -6 80 34" fill="none" ${S(4)}/>`),
    extinguisher: I('fire extinguisher', `<rect x="30" y="30" width="36" height="62" rx="12" fill="#e8304f" ${S(5)}/><rect x="40" y="16" width="16" height="16" fill="#3b3552" ${S(4)}/><path d="M56 22 H80 L88 32" fill="none" ${S(5)}/><rect x="36" y="52" width="24" height="16" rx="3" fill="#fff" ${S(3)}/>`),
    ladder: I('ladder', `<path d="M30 6 L24 94 M70 6 L76 94" stroke="#c77b3c" stroke-width="10" stroke-linecap="round"/><path d="M28 22 H71 M27 40 H73 M26 58 H74 M25 76 H75" stroke="#c77b3c" stroke-width="7"/><path d="M30 6 L24 94 M70 6 L76 94" ${S(3)}/>`),
    rope: I('rope', `<circle cx="46" cy="52" r="30" fill="none" stroke="#d9a86c" stroke-width="12"/><circle cx="46" cy="52" r="18" fill="none" stroke="#c18c4c" stroke-width="10"/><circle cx="46" cy="52" r="30" fill="none" ${S(2.5)}/><path d="M74 60 Q90 70 84 90" fill="none" stroke="#d9a86c" stroke-width="10" stroke-linecap="round"/>`),
    parachute: I('parachute', `<path d="M10 44 Q50 -6 90 44 Q70 36 50 44 Q30 36 10 44Z" fill="#ff4f7b" ${S(5)}/><path d="M50 4 Q44 20 50 44" stroke="#fff" stroke-width="8" fill="none"/><path d="M12 44 L44 82 M50 44 V82 M88 44 L56 82" ${S(2.5)}/><rect x="40" y="78" width="20" height="16" rx="4" fill="#9a5b2e" ${S(4)}/>`),
    balloon: I('balloons', `<path d="M38 56 L50 94 M62 54 L50 94 M50 50 V94" ${S(2.5)}/><ellipse cx="34" cy="34" rx="18" ry="22" fill="#ff4f7b" ${S(4)}/><ellipse cx="66" cy="32" rx="18" ry="22" fill="#5fc8ff" ${S(4)}/><ellipse cx="50" cy="44" rx="16" ry="20" fill="#ffe14d" ${S(4)}/>`),
    boat: I('boat', `<path d="M8 58 H92 L78 86 H22Z" fill="#c77b3c" ${S(5)}/><path d="M50 58 V10" ${S(5)}/><path d="M50 12 L84 50 H50Z" fill="#fff" ${S(4)}/><path d="M50 18 L24 50 H50Z" fill="#ffe14d" ${S(4)}/>`),
    lifebuoy: I('life ring', `<circle cx="50" cy="50" r="38" fill="#fff" ${S(5)}/><circle cx="50" cy="50" r="18" fill="#bfeaff" ${S(5)}/>${[45, 135, 225, 315].map((a) => `<path d="M50 12 A38 38 0 0 1 77 23 L63 37 A18 18 0 0 0 50 32Z" fill="#e8304f" transform="rotate(${a - 22} 50 50)"/>`).join('')}<circle cx="50" cy="50" r="38" fill="none" ${S(5)}/>`),
    bomb: I('bomb', `<circle cx="46" cy="58" r="32" fill="#3b3552" ${S(5)}/><rect x="56" y="22" width="16" height="14" rx="3" fill="#9aa6c0" ${S(4)} transform="rotate(35 64 29)"/><path d="M70 22 Q78 8 90 12" fill="none" ${S(4)}/><path d="M90 12 l6 -6 m-4 10 l8 0 m-12 -12 l0 -8" stroke="#ff6a24" stroke-width="4" stroke-linecap="round"/><circle cx="34" cy="46" r="7" fill="#fff" opacity=".35"/>`),
    watergun: I('water gun', `<path d="M14 40 H74 Q86 40 86 52 V56 H14Z" fill="#5fc8ff" ${S(5)}/><path d="M40 56 L34 86 H54 L58 56" fill="#ffe14d" ${S(5)}/><rect x="56" y="24" width="18" height="16" rx="4" fill="#ff7ab8" ${S(4)}/><path d="M86 48 H96" ${S(4)}/>`),
    slingshot: I('slingshot', `<path d="M50 94 V54 L28 18 M50 54 L72 18" fill="none" stroke="#9a5b2e" stroke-width="12" stroke-linecap="round"/><path d="M50 94 V54 L28 18 M50 54 L72 18" fill="none" ${S(3)}/><path d="M28 22 Q50 46 72 22" fill="none" stroke="#e8304f" stroke-width="4"/>`),
    honey: I('honey', `<path d="M26 34 H74 L78 46 Q84 86 50 90 Q16 86 22 46Z" fill="#ffb21c" ${S(5)}/><rect x="24" y="22" width="52" height="14" rx="5" fill="#ff9a3d" ${S(4)}/><rect x="36" y="52" width="28" height="18" rx="4" fill="#fff4d6" ${S(3)}/><path d="M74 36 Q80 50 72 54" fill="none" stroke="#ffb21c" stroke-width="6"/>`),
    banana: I('banana', `<path d="M20 30 Q24 80 80 76 Q90 74 86 66 Q40 70 34 28Z" fill="#ffe14d" ${S(5)}/><path d="M20 30 L26 18 L34 28" fill="#9a5b2e" ${S(3.5)}/>`),
    bone: I('bone', `<path d="M30 40 L70 60" stroke="${OL}" stroke-width="22" stroke-linecap="round"/><path d="M30 40 L70 60" stroke="#fff4e6" stroke-width="14" stroke-linecap="round"/>${[[24, 30], [20, 46], [76, 54], [80, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#fff4e6" ${S(4.5)}/>`).join('')}`),
    cheese: I('cheese', `<path d="M12 74 L88 74 L88 46 L12 34Z" fill="#ffd21c" ${S(5)}/><path d="M12 34 L56 20 L88 46" fill="#ffe680" ${S(5)}/><circle cx="34" cy="56" r="6" fill="#f0b400"/><circle cx="64" cy="62" r="5" fill="#f0b400"/><circle cx="74" cy="52" r="3" fill="#f0b400"/>`),
    fish: I('fish', `<path d="M14 50 Q40 20 70 50 Q40 80 14 50Z" fill="#5fc8ff" ${S(5)}/><path d="M70 50 L92 32 V68Z" fill="#5fc8ff" ${S(5)}/><circle cx="30" cy="46" r="4" fill="${OL}"/><path d="M44 36 Q50 50 44 64" fill="none" stroke="#fff" stroke-width="3"/>`),
    flashlight: I('flashlight', `<path d="M60 22 L84 46 L54 76 L30 52Z" fill="#ffe14d" ${S(5)}/><rect x="14" y="56" width="22" height="38" rx="6" fill="#3b3552" ${S(5)} transform="rotate(45 25 75)"/><path d="M84 46 L96 10 L60 22" fill="#fff8b0" opacity=".9"/>`),
    magnet: I('magnet', `<path d="M24 16 V54 Q24 84 50 84 Q76 84 76 54 V16 H58 V54 Q58 66 50 66 Q42 66 42 54 V16Z" fill="#e8304f" ${S(5)}/><path d="M24 16 H42 V30 H24Z M58 16 H76 V30 H58Z" fill="#dfe6f0" ${S(4)}/>`),
    map: I('map', `<path d="M10 22 L36 14 L64 22 L90 14 V78 L64 86 L36 78 L10 86Z" fill="#fff4d6" ${S(5)}/><path d="M36 14 V78 M64 22 V86" ${S(3)}/><path d="M20 66 Q40 40 56 54 T80 32" fill="none" stroke="#e8304f" stroke-width="4" stroke-dasharray="6 6"/><path d="M76 26 L84 34 M84 26 L76 34" stroke="#e8304f" stroke-width="4"/>`),
    key: I('key', `<circle cx="30" cy="50" r="18" fill="#ffc21c" ${S(5)}/><circle cx="30" cy="50" r="6" fill="#fff" ${S(3)}/><path d="M48 50 H90 V64 M76 50 V60" fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M48 50 H90 V64 M76 50 V60" fill="none" stroke="#ffc21c" stroke-width="5" stroke-linecap="round"/>`),
    shovel: I('shovel', `<path d="M50 6 V56" stroke="#9a5b2e" stroke-width="10" stroke-linecap="round"/><path d="M50 6 V56" ${S(3)}/><path d="M34 6 H66" ${S(8)}/><path d="M30 56 H70 V74 Q70 94 50 96 Q30 94 30 74Z" fill="#9aa6c0" ${S(5)}/>`),
    hammer: I('hammer', `<path d="M56 40 L30 92" stroke="#c77b3c" stroke-width="12" stroke-linecap="round"/><path d="M56 40 L30 92" ${S(3)}/><rect x="34" y="14" width="52" height="26" rx="5" fill="#9aa6c0" ${S(5)} transform="rotate(25 60 27)"/>`),
    net: I('net', `<path d="M60 56 L88 92" stroke="#c77b3c" stroke-width="10" stroke-linecap="round"/><ellipse cx="42" cy="36" rx="30" ry="26" fill="#fff" fill-opacity=".4" ${S(5)}/><path d="M18 26 L66 46 M14 40 L60 60 M30 14 L22 58 M48 10 L40 60 M64 18 L58 58" stroke="${OL}" stroke-width="2"/>`),
    mirror: I('mirror', `<ellipse cx="50" cy="40" rx="28" ry="32" fill="#ffc21c" ${S(5)}/><ellipse cx="50" cy="40" rx="20" ry="24" fill="#bfeaff" ${S(3)}/><path d="M40 28 L52 22 M38 40 L58 28" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M50 72 V94" stroke="#ffc21c" stroke-width="10" stroke-linecap="round"/><path d="M50 72 V94" ${S(3)}/>`),
    garlic: I('garlic', `<path d="M50 14 C30 30 14 50 20 72 C26 92 74 92 80 72 C86 50 70 30 50 14Z" fill="#fff8ee" ${S(5)}/><path d="M50 18 C40 40 40 70 50 90 M50 18 C60 40 60 70 50 90 M34 36 C28 56 32 78 40 88 M66 36 C72 56 68 78 60 88" fill="none" stroke="#d9c8a8" stroke-width="3"/><path d="M50 14 Q48 4 54 2" fill="none" ${S(4)}/>`),
    flute: I('flute', `<rect x="8" y="42" width="84" height="16" rx="8" fill="#ffc21c" ${S(5)} transform="rotate(-20 50 50)"/>${[30, 44, 58, 72].map((x) => `<circle cx="${x}" cy="${57 - (x - 50) * 0.36}" r="3" fill="${OL}"/>`).join('')}<path d="M80 22 q6 -6 12 0 M84 12 q6 -6 12 0" fill="none" ${S(3)}/>`),
    phone: I('phone', `<rect x="28" y="8" width="44" height="84" rx="9" fill="#3b3552" ${S(5)}/><rect x="34" y="18" width="32" height="56" rx="3" fill="#7fd4ff"/><circle cx="50" cy="83" r="4" fill="#fff"/><path d="M42 40 Q50 30 58 40 M38 34 Q50 18 62 34" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`),
    rocket: I('rocket', `<path d="M50 4 C70 20 72 50 66 72 H34 C28 50 30 20 50 4Z" fill="#f4f2ff" ${S(5)}/><circle cx="50" cy="36" r="9" fill="#5fc8ff" ${S(4)}/><path d="M34 56 L18 78 L34 74Z M66 56 L82 78 L66 74Z" fill="#e8304f" ${S(4)}/><path d="M40 72 Q50 100 60 72Z" fill="#ff9a3d" ${S(3.5)}/>`),
    trampoline: I('trampoline', `<ellipse cx="50" cy="46" rx="42" ry="14" fill="#3b3552" ${S(5)}/><ellipse cx="50" cy="44" rx="32" ry="8" fill="#5fc8ff"/><path d="M14 50 L18 86 M86 50 L82 86 M40 58 L40 90 M60 58 L60 90" ${S(5)}/>`),
    pillow: I('pillow', `<path d="M10 30 Q50 18 90 30 Q96 50 90 70 Q50 82 10 70 Q4 50 10 30Z" fill="#fff" ${S(5)}/><path d="M24 34 Q50 28 76 34" fill="none" stroke="#c9c2e6" stroke-width="4"/>`),
    vacuum: I('vacuum', `<rect x="14" y="54" width="44" height="34" rx="12" fill="#ff4f7b" ${S(5)}/><circle cx="24" cy="90" r="6" fill="${OL}"/><circle cx="50" cy="90" r="6" fill="${OL}"/><path d="M50 58 Q76 50 74 26 L86 14" fill="none" ${S(8)}/><path d="M50 58 Q76 50 74 26 L86 14" fill="none" stroke="#9aa6c0" stroke-width="4"/><path d="M80 8 L94 22" ${S(8)}/>`),
    pizza: I('pizza', `<path d="M50 92 L14 20 Q50 4 86 20Z" fill="#ffd27a" ${S(5)}/><path d="M14 20 Q50 4 86 20 L82 28 Q50 14 18 28Z" fill="#e0a060" ${S(3)}/>${[[40, 38], [60, 40], [50, 60], [44, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#e8304f" ${S(2.5)}/>`).join('')}`),
    scarf: I('scarf', `<path d="M14 30 Q50 50 86 30 L86 46 Q50 66 14 46Z" fill="#e8304f" ${S(5)}/><path d="M66 46 L70 90 L86 86 L80 44" fill="#e8304f" ${S(5)}/><path d="M30 40 V54 M50 46 V60 M70 92 V98 M76 90 V96" stroke="#fff" stroke-width="5"/>`),
    helmet: I('helmet', `<path d="M10 66 Q10 16 50 16 Q90 16 90 66Z" fill="#ffc21c" ${S(5)}/><rect x="6" y="62" width="88" height="14" rx="5" fill="#ffc21c" ${S(5)}/><path d="M50 16 V62" stroke="#fff" stroke-width="5" opacity=".6"/>`),
    axe: I('axe', `<path d="M40 14 L64 94" stroke="#c77b3c" stroke-width="11" stroke-linecap="round"/><path d="M40 14 L64 94" ${S(3)}/><path d="M38 16 Q14 18 16 46 Q30 36 48 42Z" fill="#9aa6c0" ${S(5)}/>`),
    duck: I('rubber duck', `<path d="M14 62 Q14 90 50 90 Q86 90 86 62 Q70 54 60 56 Z" fill="#ffe14d" ${S(5)}/><circle cx="36" cy="40" r="20" fill="#ffe14d" ${S(5)}/><path d="M16 40 L4 46 L16 50Z" fill="#ff9a3d" ${S(3.5)}/><circle cx="32" cy="36" r="3.5" fill="${OL}"/>`),
    sock: I('sock', `<path d="M36 6 H66 V58 L84 72 Q92 90 70 92 L40 78 Q30 70 36 56Z" fill="#fff" ${S(5)}/><path d="M36 18 H66 M36 30 H66" stroke="#e8304f" stroke-width="6"/><circle cx="62" cy="76" r="5" fill="#c9c2e6"/>`),
    cake: I('cake', `<path d="M14 48 H86 V86 H14Z" fill="#ffb3d0" ${S(5)}/><path d="M14 48 Q24 62 32 48 Q42 62 50 48 Q58 62 68 48 Q76 62 86 48" fill="#fff" ${S(3.5)}/><rect x="46" y="22" width="8" height="24" fill="#5fc8ff" ${S(3)}/><path d="M50 8 Q44 16 50 20 Q56 16 50 8Z" fill="#ff9a3d" ${S(2.5)}/>`),
    guitar: I('guitar', `<path d="M64 40 L90 12" stroke="#9a5b2e" stroke-width="9" stroke-linecap="round"/><path d="M64 40 L90 12" ${S(3)}/><path d="M40 30 C58 26 68 42 60 54 C70 66 60 92 38 88 C14 86 8 62 22 52 C14 38 24 32 40 30Z" fill="#ff9a3d" ${S(5)}/><circle cx="40" cy="60" r="7" fill="${OL}"/>`),
  };

  window.PICK_ART = { BG, THREATS, ITEMS, duo };
})();
