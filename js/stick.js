/* =====================================================================
   Shared character art: stick figures with accessories, and creatures.
   window.STICK.figure(opts)  -> SVG <g> (feet at 0,0; about 135 units tall)
   window.STICK.bo / pip / hero helpers
   window.STICK.creature(kind, opts) -> SVG content for a 100x100 box
   ===================================================================== */
(() => {
  'use strict';
  const OL = '#2a1650';
  const S = (w) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const limb = (d, w = 6) => `<path d="${d}" fill="none" ${S(w)}/>`;

  // ---------------------------------------------------------------- poses (arms from the shoulder 0,-78; legs from the hip 0,-40)
  const LEGS = {
    stand: ['M0 -40 L-10 -20 L-13 0', 'M0 -40 L10 -20 L13 0'],
    wide: ['M0 -40 L-15 -20 L-21 0', 'M0 -40 L15 -20 L21 0'],
    knock: ['M0 -40 L-4 -20 L-10 0', 'M0 -40 L4 -20 L10 0'],
    lunge: ['M0 -40 L-14 -20 L-24 0', 'M0 -40 L13 -22 L18 0'],
    run: ['M0 -40 L12 -22 L24 -14', 'M0 -40 L-6 -20 L-18 -4'],
    sit: ['M0 -40 L14 -38 L16 -14', 'M0 -40 L-14 -38 L-16 -14'],
  };
  const POSES = {
    stand: { arms: ['M0 -78 L-13 -60 L-17 -44', 'M0 -78 L13 -60 L17 -44'], legs: 'stand' },
    cheer: { arms: ['M0 -78 L-15 -94 L-22 -112', 'M0 -78 L15 -94 L22 -112'], legs: 'stand' },
    scared: { arms: ['M0 -78 L-21 -84 L-25 -103', 'M0 -78 L21 -84 L25 -103'], legs: 'wide' },
    cold: { arms: ['M0 -78 L-13 -66 L9 -63', 'M0 -78 L13 -67 L-9 -58'], legs: 'knock' },
    hot: { arms: ['M0 -78 L-12 -60 L-16 -44', 'M0 -78 L17 -88 L19 -105'], legs: 'stand' },
    hungry: { arms: ['M0 -78 L-15 -62 L-3 -54', 'M0 -78 L15 -62 L3 -54'], legs: 'stand' },
    sad: { arms: ['M0 -78 L-6 -60 L-8 -42', 'M0 -78 L6 -60 L8 -42'], legs: 'knock', tilt: 8 },
    hero: { arms: ['M0 -78 L-14 -64 L-22 -54', 'M0 -78 L15 -70 L28 -76'], legs: 'lunge', hand: [28, -76] },
    wave: { arms: ['M0 -78 L-13 -60 L-17 -44', 'M0 -78 L17 -92 L25 -109'], legs: 'stand' },
    run: { arms: ['M0 -78 L14 -70 L24 -80', 'M0 -78 L-12 -66 L-22 -58'], legs: 'run' },
    menace: { arms: ['M0 -78 L-20 -76 L-30 -88', 'M0 -78 L20 -76 L30 -88'], legs: 'wide' },
    sit: { arms: ['M0 -78 L-14 -62 L-18 -48', 'M0 -78 L14 -62 L18 -48'], legs: 'sit' },
  };
  const MOOD_POSE = { happy: 'cheer', scared: 'scared', cold: 'cold', hot: 'hot', hungry: 'hungry', thirsty: 'hot', sad: 'sad', burnt: 'scared', dizzy: 'stand', hero: 'hero', angry: 'menace' };

  // ---------------------------------------------------------------- faces (head centre 0,-100, radius 14)
  function face(mood) {
    const dots = (y = -101, r = 2.3) => `<circle cx="-5" cy="${y}" r="${r}" fill="${OL}"/><circle cx="5" cy="${y}" r="${r}" fill="${OL}"/>`;
    const brows = (worried) => worried ? limb('M-10 -108 L-3 -111 M10 -108 L3 -111', 2.5) : limb('M-10 -111 L-3 -108 M10 -111 L3 -108', 2.5);
    switch (mood) {
      case 'happy': return `${limb('M-8 -101 Q-5 -105 -2 -101 M2 -101 Q5 -105 8 -101', 2.5)}<path d="M-6 -95 Q0 -88 6 -95Z" fill="#ff5c7a" ${S(2.2)}/><circle cx="-9" cy="-96" r="2.6" fill="#ff8ab0" opacity=".7"/><circle cx="9" cy="-96" r="2.6" fill="#ff8ab0" opacity=".7"/>`;
      case 'scared': return `<circle cx="-5" cy="-101" r="3.6" fill="#fff" ${S(1.6)}/><circle cx="5" cy="-101" r="3.6" fill="#fff" ${S(1.6)}/>${dots(-101, 1.3)}${brows(true)}<ellipse cx="0" cy="-92" rx="3.2" ry="4" fill="${OL}"/>`;
      case 'cold': return `${dots()}${brows(true)}${limb('M-6 -93 l2 -2 l2 2 l2 -2 l2 2 l2 -2 l2 2', 1.8)}`;
      case 'hot': case 'thirsty': return `${limb('M-8 -101 H-2 M2 -101 H8', 2.5)}${limb('M-5 -94 Q0 -91 5 -94', 2)}<path d="M-2 -93 Q0 -86 3 -93Z" fill="#ff5c7a" ${S(1.5)}/><path d="M14 -112 Q17 -106 14 -104 Q11 -106 14 -112Z" fill="#9fe6ff" ${S(1.5)}/>`;
      case 'hungry': return `${dots()}${brows(true)}${limb('M-5 -93 Q0 -96 5 -93', 2)}<path d="M4 -93 Q5 -87 3 -85" fill="none" stroke="#9fe6ff" stroke-width="2.4" stroke-linecap="round"/>`;
      case 'sad': return `${dots()}${brows(true)}${limb('M-5 -92 Q0 -96 5 -92', 2)}<path d="M-8 -97 Q-7 -92 -9 -91 Q-11 -93 -8 -97Z" fill="#9fe6ff"/>`;
      case 'burnt': return `<circle cx="-5" cy="-101" r="2.6" fill="#fff"/><circle cx="5" cy="-101" r="2.6" fill="#fff"/>${limb('M-5 -93 H5', 2)}<path d="M-4 -118 Q-10 -124 -4 -130 Q2 -136 -4 -142 M6 -118 Q2 -126 8 -132" fill="none" stroke="#9a93b8" stroke-width="3" stroke-linecap="round"/>`;
      case 'dizzy': return `${limb('M-8 -104 L-2 -98 M-2 -104 L-8 -98 M2 -104 L8 -98 M8 -104 L2 -98', 2)}${limb('M-6 -93 q3 -3 6 0 t6 0', 2)}`;
      case 'hero': return `${dots()}${limb('M-10 -108 L-3 -106 M10 -108 L3 -106', 2.5)}${limb('M-5 -94 Q0 -90 5 -94', 2)}`;
      case 'angry': return `${dots(-100, 2)}${brows(false)}<path d="M-6 -92 Q0 -96 6 -92" fill="none" ${S(2)}/><path d="M-3 -93 L-2 -89 L-1 -93 M1 -93 L2 -89 L3 -93" fill="#fff" ${S(1)}/>`;
      default: return `${dots()}${limb('M-5 -94 Q0 -91 5 -94', 2)}`;
    }
  }

  // ---------------------------------------------------------------- accessories
  function hat(id, color = '#2f7de0') {
    switch (id) {
      case 'cap': return `<path d="M-14 -106 Q-12 -122 2 -121 Q14 -120 14 -106Z" fill="${color}" ${S(3)}/><path d="M10 -107 L26 -104" ${S(5)}/><path d="M10 -107 L25 -104" stroke="${color}" stroke-width="2"/>`;
      case 'hardhat': return `<path d="M-15 -107 Q-14 -126 0 -126 Q14 -126 15 -107Z" fill="#ffc21c" ${S(3)}/><rect x="-19" y="-109" width="38" height="5" rx="2" fill="#ffc21c" ${S(2.5)}/>`;
      case 'party': return `<path d="M-9 -110 L1 -140 L10 -110Z" fill="#ffe14d" ${S(3)}/><path d="M-5 -120 L7 -124 M-7 -114 L9 -118" stroke="#ff4f7b" stroke-width="3"/><circle cx="1" cy="-141" r="4" fill="#2fb4ff" ${S(2.5)}/>`;
      case 'tophat': return `<rect x="-17" y="-114" width="34" height="6" rx="2" fill="${OL}"/><rect x="-10" y="-138" width="20" height="25" rx="2" fill="#3b3552" ${S(3)}/><rect x="-10" y="-121" width="20" height="5" fill="#ff4f7b"/>`;
      case 'wizard': return `<path d="M-19 -108 Q0 -114 19 -108 L5 -146Z" fill="#8d5bff" ${S(3)}/><circle cx="-2" cy="-122" r="2.5" fill="#ffe14d"/><circle cx="5" cy="-132" r="2" fill="#ffe14d"/>`;
      case 'viking': return `<path d="M-15 -106 Q0 -128 15 -106Z" fill="#b9c3d6" ${S(3)}/><path d="M-14 -110 Q-28 -114 -26 -132 Q-20 -120 -11 -116Z M14 -110 Q28 -114 26 -132 Q20 -120 11 -116Z" fill="#fff4e6" ${S(2.5)}/>`;
      case 'crown': return `<path d="M-12 -110 L-13 -130 L-6 -120 L0 -134 L6 -120 L13 -130 L12 -110Z" fill="#ffe14d" ${S(3)}/><circle cx="0" cy="-116" r="2.6" fill="#ff4f7b"/>`;
      case 'halo': return `<ellipse cx="0" cy="-126" rx="14" ry="4.5" fill="none" stroke="#ffe14d" stroke-width="4"/>`;
      case 'beanie': return `<path d="M-14 -104 Q-15 -124 0 -124 Q15 -124 14 -104Z" fill="${color}" ${S(3)}/><circle cx="0" cy="-127" r="5" fill="#fff" ${S(2.5)}/>`;
      default: return '';
    }
  }
  function hair(kind, color) {
    switch (kind) {
      case 'ponytail': return { back: `<path d="M10 -110 Q30 -104 26 -82 Q22 -70 28 -62 Q12 -66 14 -86 Q14 -98 8 -104Z" fill="${color}" ${S(3)}/>`,
        front: `<path d="M-14 -102 Q-16 -118 0 -118 Q16 -118 14 -102 Q4 -110 -6 -106 Q-10 -104 -14 -102Z" fill="${color}" ${S(3)}/>` };
      case 'slick': return { back: '', front: `<path d="M-15 -100 Q-16 -119 0 -117 Q16 -119 15 -100 L8 -108 L0 -102 L-8 -108Z" fill="${color}" ${S(3)}/>` };
      case 'spiky': return { back: '', front: `<path d="M-14 -104 L-16 -116 L-8 -112 L-6 -124 L0 -114 L6 -124 L8 -112 L16 -116 L14 -104 Q0 -112 -14 -104Z" fill="${color}" ${S(3)}/>` };
      default: return { back: '', front: '' };
    }
  }

  // ---------------------------------------------------------------- the figure
  function figure(o = {}) {
    const pose = POSES[o.pose || MOOD_POSE[o.mood] || 'stand'];
    const legs = LEGS[pose.legs];
    const tilt = pose.tilt || 0;
    const headFill = o.mood === 'burnt' ? OL : o.mood === 'cold' ? '#d9f1ff' : o.mood === 'hot' ? '#ffd9cc' : o.head || '#fff';
    const lineCol = o.mood === 'burnt' ? '#3b3552' : OL;
    const L = (d) => `<path d="${d}" fill="none" stroke="${lineCol}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    const h = hair(o.hair, o.hairColor || '#c2452e');
    let back = '';
    if (o.cape) back += `<path d="M-8 -84 L8 -84 L${o.pose === 'run' ? '-30 -30 L-14 -26' : '22 -30 L-22 -30'}Z" fill="${o.cape}" ${S(3)}/>`;
    if (o.pack) back += `<rect x="-22" y="-82" width="16" height="30" rx="5" fill="${o.pack}" ${S(3)}/><path d="M-6 -80 L4 -60" ${S(2.5)}/>`;
    let front = '';
    if (o.dress) front += `<path d="M-7 -82 L7 -82 L19 -38 L-19 -38Z" fill="${o.dress}" ${S(3)}/>`;
    if (o.coat) front += `<path d="M-8 -84 L8 -84 L14 -42 L-14 -42Z" fill="${o.coat}" ${S(3)}/><path d="M0 -84 V-42" stroke="${OL}" stroke-width="2"/>`;
    const scarf = o.scarf ? `<path d="M-9 -88 Q0 -82 9 -88 L9 -83 Q0 -77 -9 -83Z" fill="${o.scarf}" ${S(2.5)}/><path d="M4 -82 L8 -66 L13 -68 L9 -83" fill="${o.scarf}" ${S(2.5)}/>` : '';
    let item = '';
    if (o.sword && pose.hand) {
      const [x, y] = pose.hand;
      item = `<path d="M${x} ${y} L${x + 18} ${y - 34}" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M${x + 2} ${y - 4} L${x + 18} ${y - 34}" stroke="#e6f3ff" stroke-width="3.5" stroke-linecap="round"/><path d="M${x - 6} ${y - 2} L${x + 6} ${y + 4}" stroke="${OL}" stroke-width="6" stroke-linecap="round"/><path d="M${x - 5} ${y - 2} L${x + 5} ${y + 3}" stroke="#ffc21c" stroke-width="3" stroke-linecap="round"/>`;
    }
    const head = `<g transform="rotate(${tilt} 0 -86)">${h.back}<circle cx="0" cy="-100" r="14" fill="${headFill}" ${S(5)}/>${h.front}${face(o.mood || 'happy')}${hat(o.hat, o.hatColor)}${o.bow ? `<path d="M10 -114 L20 -120 L20 -108Z M10 -114 L0 -120 L1 -108Z" fill="${o.bow}" ${S(2.5)}/><circle cx="10" cy="-114" r="3" fill="${o.bow}" ${S(2)}/>` : ''}</g>`;
    const g = `${back}${legs.map(L).join('')}${L('M0 -86 L0 -40')}${front}${pose.arms.map(L).join('')}${scarf}${head}${item}`;
    const tf = `translate(${o.x || 0} ${o.y || 0}) scale(${(o.flip ? -1 : 1) * (o.s || 1)} ${o.s || 1})`;
    return `<g transform="${tf}">${g}</g>`;
  }
  // our two adventurers and the tower hero
  const bo = (mood, x = 0, y = 0, s = 1) => figure({ mood, x, y, s, hat: 'cap', hatColor: '#2f7de0', pack: '#ff9a3d', scarf: mood === 'cold' ? '#e8304f' : null });
  const pip = (mood, x = 0, y = 0, s = 1) => figure({ mood, x, y, s, hair: 'ponytail', hairColor: '#c2452e', dress: '#3ccf6e', bow: '#ffe14d', flip: true });
  const hero = (outfit = {}, x = 0, y = 0, s = 1) => figure({ pose: 'hero', mood: 'hero', x, y, s, cape: outfit.color || '#2fb4ff', hat: outfit.hat && outfit.hat !== 'none' ? outfit.hat : null, hatColor: outfit.color, sword: true });

  // ---------------------------------------------------------------- creatures (100 x 100 box, feet near the bottom)
  const eye = (x, y, r = 4, look = -1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${S(2.5)}/><circle cx="${x + look}" cy="${y + 0.5}" r="${r * 0.5}" fill="${OL}"/>`;
  const angry = (x1, x2, y, r = 4) => `${eye(x1, y, r)}${eye(x2, y, r)}${limb(`M${x1 - r - 2} ${y - r - 4} L${x1 + r} ${y - r} M${x2 + r + 2} ${y - r - 4} L${x2 - r} ${y - r}`, 3)}`;
  const C = {};
  C.goblin = (o) => {
    const b = o.color || '#7bd34a';
    return `<path d="M42 74 L36 94 M58 74 L64 94" fill="none" ${S(7)}/><ellipse cx="34" cy="95" rx="7" ry="3.5" fill="${OL}"/><ellipse cx="66" cy="95" rx="7" ry="3.5" fill="${OL}"/>
      <path d="M35 52 Q30 80 50 81 Q70 80 65 52Z" fill="${b}" ${S(4)}/><path d="M36 70 H64 L60 84 L50 77 L40 84Z" fill="#9a5b2e" ${S(3)}/>
      ${limb('M36 56 L24 68 L20 78', 6)}${limb('M64 56 L78 58 L84 46', 6)}
      <path d="M84 52 L94 12" stroke="#9a5b2e" stroke-width="9" stroke-linecap="round"/><path d="M84 52 L94 12" fill="none" ${S(2.5)}/><ellipse cx="94" cy="14" rx="7" ry="9" fill="#b5703a" ${S(3)}/>
      <path d="M31 30 L8 18 L29 44Z M69 30 L92 18 L71 44Z" fill="${b}" ${S(3.5)}/>
      <path d="M50 12 C66 12 72 24 70 36 C68 50 60 54 50 54 C40 54 32 50 30 36 C28 24 34 12 50 12Z" fill="${b}" ${S(4)}/>
      ${angry(42, 58, 30, 4)}<path d="M50 34 Q60 40 51 45" fill="${b}" ${S(3)}/><path d="M41 47 Q50 52 59 47" fill="none" ${S(3)}/><path d="M43 47 L44 43 L46 48 M54 48 L56 43 L57 47" fill="#fff" ${S(1.5)}/>`;
  };
  C.yeti = (o) => {
    const fur = o.color || '#f4f9ff';
    return `<path d="M36 78 L32 94 M64 78 L68 94" fill="none" stroke="${fur}" stroke-width="16" stroke-linecap="round"/><path d="M36 78 L32 94 M64 78 L68 94" fill="none" ${S(2.5)}/>
      <ellipse cx="30" cy="95" rx="10" ry="4" fill="#8fc4f0" ${S(2.5)}/><ellipse cx="70" cy="95" rx="10" ry="4" fill="#8fc4f0" ${S(2.5)}/>
      <path d="M28 42 L22 50 L14 58 L10 76 L16 80 L22 70 L20 84 L28 78 M72 42 L78 50 L86 58 L90 76 L84 80 L78 70 L80 84 L72 78" fill="${fur}" ${S(3.5)}/>
      <path d="M50 8 L56 14 L62 8 L66 16 L74 14 L74 26 C82 34 82 52 78 66 C76 80 66 86 50 86 C34 86 24 80 22 66 C18 52 18 34 26 26 L26 14 L34 16 L38 8 L44 14Z" fill="${fur}" ${S(4)}/>
      <path d="M36 26 Q50 20 64 26 Q68 44 50 50 Q32 44 36 26Z" fill="#8fc4f0" ${S(3)}/>${angry(43, 57, 32, 3.5)}
      <path d="M42 43 Q50 48 58 43" fill="#fff" ${S(2.5)}/><path d="M38 62 Q50 70 62 62" fill="none" stroke="#dbe9f7" stroke-width="3"/>`;
  };
  C.imp = (o) => {
    const b = o.color || '#ff4060';
    return `<path d="M30 46 Q4 30 6 6 Q18 22 26 24 Q22 34 32 40Z M70 46 Q96 30 94 6 Q82 22 74 24 Q78 34 68 40Z" fill="#7a1f2b" ${S(3.5)}/>
      <path d="M58 76 Q86 84 84 64 L90 60 L80 58 L82 64 Q82 76 60 72" fill="${b}" ${S(3)}/>
      ${limb('M44 74 L40 94 M56 74 L60 94', 6)}<path d="M40 52 Q36 78 50 78 Q64 78 60 52Z" fill="${b}" ${S(4)}/>
      ${limb('M40 56 L28 66 L24 76', 5)}${limb('M60 56 L72 52 L76 42', 5)}<path d="M76 70 L78 10 M70 16 L72 6 M78 10 L78 2 M86 16 L84 6" fill="none" ${S(4)}/><path d="M70 16 Q78 22 86 16" fill="none" ${S(4)}/>
      <path d="M36 26 L30 8 L42 20Z M64 26 L70 8 L58 20Z" fill="#ffd27a" ${S(3)}/>
      <path d="M50 16 C64 16 68 26 66 36 C64 48 58 52 50 52 C42 52 36 48 34 36 C32 26 36 16 50 16Z" fill="${b}" ${S(4)}/>
      ${angry(43, 57, 32, 4)}<path d="M42 44 Q50 50 58 44" fill="none" ${S(3)}/><path d="M44 45 L46 49 L48 46 M52 46 L54 49 L56 45" fill="#fff" ${S(1.5)}/>`;
  };
  C.skeleton = () => `<path d="M14 92 L22 50" stroke="#9aa6c0" stroke-width="5" stroke-linecap="round"/><path d="M14 92 L22 50" fill="none" ${S(2)}/><path d="M18 58 L28 60" ${S(4)}/>
      ${['M44 74 L40 94', 'M56 74 L60 94', 'M42 52 L30 62 L22 56', 'M58 52 L70 60 L74 70'].map((d) => `<path d="${d}" fill="none" stroke="#f6f2e6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" ${S(2)}/>`).join('')}
      <path d="M50 46 V74" stroke="#f6f2e6" stroke-width="6"/><path d="M50 46 V74" ${S(2)}/>
      ${[52, 58, 64].map((y) => `<path d="M40 ${y} Q50 ${y + 4} 60 ${y}" fill="none" stroke="#f6f2e6" stroke-width="4"/><path d="M40 ${y} Q50 ${y + 4} 60 ${y}" fill="none" ${S(1.5)}/>`).join('')}
      <path d="M42 72 Q50 80 58 72Z" fill="#f6f2e6" ${S(2.5)}/>
      <path d="M50 10 C64 10 70 20 68 32 C66 40 62 44 60 46 L40 46 C38 44 34 40 32 32 C30 20 36 10 50 10Z" fill="#f6f2e6" ${S(4)}/>
      <ellipse cx="42" cy="28" rx="5.5" ry="6.5" fill="${OL}"/><ellipse cx="58" cy="28" rx="5.5" ry="6.5" fill="${OL}"/><circle cx="42" cy="28" r="2" fill="#a6ffcf"/><circle cx="58" cy="28" r="2" fill="#a6ffcf"/>
      <path d="M48 36 L50 32 L52 36Z" fill="${OL}"/><path d="M42 42 V46 M46 42 V46 M50 42 V46 M54 42 V46 M58 42 V46" ${S(1.5)}/>`;
  C.knight = (o) => {
    const a = o.color || '#fff6e2';
    return `<path d="M34 40 Q4 28 4 8 Q16 22 26 20 Q14 30 24 36 Q14 40 30 46Z M66 40 Q96 28 96 8 Q84 22 74 20 Q86 30 76 36 Q86 40 70 46Z" fill="#fff" ${S(3)}/>
      ${limb('M44 74 L40 94 M56 74 L60 94', 7)}<path d="M36 46 L64 46 L60 78 L40 78Z" fill="${a}" ${S(4)}/><path d="M40 60 H60" stroke="#ffc21c" stroke-width="4"/>
      ${limb('M38 50 L28 62 L26 74', 6)}${limb('M62 50 L74 56 L80 48', 6)}
      <path d="M80 92 L82 8" ${S(4)}/><path d="M82 8 L76 20 L88 20Z" fill="#9aa6c0" ${S(3)}/>
      <path d="M50 8 C64 8 66 20 66 30 L64 44 L36 44 L34 30 C34 20 36 8 50 8Z" fill="${a}" ${S(4)}/><path d="M38 26 H62 V32 H38Z" fill="${OL}"/>
      <circle cx="45" cy="29" r="2" fill="#7fe3ff"/><circle cx="55" cy="29" r="2" fill="#7fe3ff"/><path d="M50 8 Q56 0 66 2 Q58 6 56 12" fill="#ff4f7b" ${S(2.5)}/>`;
  };
  C.dragon = (o) => {
    const b = o.color || '#e8304f', belly = o.belly || '#ffd27a';
    return `<path d="M60 40 Q74 2 98 8 Q86 14 90 24 Q78 22 80 34 Q70 30 70 44Z" fill="${o.wing || '#7a1f2b'}" ${S(3.5)}/>
      <path d="M70 70 Q96 74 94 54 Q100 56 98 44 Q90 50 88 56 Q86 66 72 62" fill="${b}" ${S(3.5)}/>
      ${limb('M44 76 L40 94 M64 76 L68 94', 8)}${limb('M44 76 L40 94 M64 76 L68 94', 2)}
      <ellipse cx="56" cy="64" rx="22" ry="17" fill="${b}" ${S(4)}/><path d="M42 72 Q56 82 70 72" fill="none" stroke="${belly}" stroke-width="6"/>
      <path d="M40 58 Q30 44 30 30" fill="none" stroke="${b}" stroke-width="14" stroke-linecap="round"/><path d="M40 58 Q30 44 30 30" fill="none" ${S(2.5)}/>
      <path d="M34 22 L42 8 L40 22 Z M26 22 L26 6 L32 20Z" fill="#fff4e6" ${S(2.5)}/>
      <path d="M38 24 C40 36 32 42 18 42 L6 40 Q4 34 8 32 L18 30 C20 22 30 18 38 24Z" fill="${b}" ${S(4)}/>
      ${eye(28, 28, 3.5)}${limb('M24 22 L33 25', 2.5)}<path d="M6 40 L10 36 L13 40 L16 36 L19 40" fill="#fff" ${S(1.5)}/><circle cx="10" cy="33" r="1.5" fill="${OL}"/>
      ${limb('M50 68 L46 80 M60 70 L58 82', 5)}`;
  };
  C.bear = (o) => `<path d="M30 70 L28 92 M44 74 L44 92 M68 74 L68 92 M82 68 L84 92" fill="none" stroke="#9a5b2e" stroke-width="12" stroke-linecap="round"/><path d="M30 70 L28 92 M44 74 L44 92 M68 74 L68 92 M82 68 L84 92" fill="none" ${S(2.5)}/>
      <path d="M22 72 Q20 42 52 40 Q90 38 92 64 Q92 80 70 80 L36 80 Q22 80 22 72Z" fill="#b5703a" ${S(4)}/>
      <circle cx="20" cy="30" r="8" fill="#b5703a" ${S(3.5)}/><circle cx="42" cy="26" r="8" fill="#b5703a" ${S(3.5)}/>
      <path d="M32 26 C46 26 48 40 44 50 C40 60 28 60 18 58 L6 56 Q2 50 6 46 L14 44 C14 34 22 26 32 26Z" fill="#b5703a" ${S(4)}/>
      <ellipse cx="10" cy="50" rx="8" ry="6" fill="#f2c38f" ${S(2.5)}/><circle cx="4" cy="48" r="3" fill="${OL}"/>${eye(26, 38, 3.5)}${limb('M21 32 L30 35', 2.5)}
      <path d="M6 56 L10 52 L13 56 L16 52 L19 56" fill="#fff" ${S(1.5)}/>${limb('M26 92 l-4 0 M42 92 l-4 0', 2)}`;
  C.dog = () => `<path d="M30 66 L28 92 M42 68 L42 92 M66 68 L68 92 M78 64 L80 92" fill="none" stroke="#c68a52" stroke-width="9" stroke-linecap="round"/><path d="M30 66 L28 92 M42 68 L42 92 M66 68 L68 92 M78 64 L80 92" fill="none" ${S(2.2)}/>
      <path d="M80 50 Q96 36 92 22" fill="none" stroke="#c68a52" stroke-width="8" stroke-linecap="round"/><path d="M80 50 Q96 36 92 22" fill="none" ${S(2)}/>
      <path d="M24 60 Q26 44 50 44 Q82 42 84 58 Q84 72 66 72 L36 72 Q24 72 24 60Z" fill="#c68a52" ${S(4)}/>
      <path d="M28 46 Q32 30 24 22 Q12 20 8 30 L2 34 Q0 42 8 44 L18 46 Q22 50 28 46Z" fill="#c68a52" ${S(4)}/>
      <path d="M24 22 Q34 22 34 38 Q28 36 24 22Z" fill="#7a4a2a" ${S(3)}/><circle cx="3" cy="35" r="3" fill="${OL}"/>${eye(16, 30, 3.5)}${limb('M11 25 L20 27', 2.5)}
      <path d="M4 42 L8 39 L11 43 L14 40 L17 44" fill="#fff" ${S(1.5)}/><path d="M26 44 Q30 52 34 46" fill="none" stroke="#e8304f" stroke-width="5"/>`;
  C.mouse = () => `<path d="M80 72 Q98 70 94 50 Q92 40 98 34" fill="none" stroke="#ff9fc4" stroke-width="4" stroke-linecap="round"/><path d="M80 72 Q98 70 94 50 Q92 40 98 34" fill="none" ${S(1.5)}/>
      ${limb('M42 78 L40 90 M64 78 L66 90', 4)}<path d="M26 74 Q24 52 52 50 Q82 50 84 70 Q84 82 66 82 L36 82 Q26 82 26 74Z" fill="#b0a8d0" ${S(4)}/>
      <path d="M30 60 Q18 56 8 66 L4 70 Q10 74 26 74Z" fill="#b0a8d0" ${S(3.5)}/><circle cx="4" cy="69" r="3" fill="#ff7ab8" ${S(1.5)}/>
      <circle cx="30" cy="44" r="13" fill="#c9c2e6" ${S(3.5)}/><circle cx="30" cy="44" r="7" fill="#ffb3c8"/>${eye(18, 62, 3)}
      ${limb('M6 66 L-4 62 M6 70 L-4 72', 1.5)}`;
  C.monkey = () => `<path d="M60 0 V14 Q60 22 56 24" fill="none" stroke="#9a5b2e" stroke-width="6" stroke-linecap="round"/><path d="M0 2 H100" stroke="#5a8a3a" stroke-width="8"/>
      ${limb('M56 40 L64 22 L60 10', 5)}${limb('M44 42 L30 54 L34 66', 5)}${limb('M46 70 L40 88 M58 70 L64 88', 5)}
      <path d="M58 70 Q78 80 80 62 Q82 52 74 50" fill="none" stroke="#9a5b2e" stroke-width="5" stroke-linecap="round"/>
      <path d="M40 46 Q38 74 50 74 Q62 74 60 46Z" fill="#9a5b2e" ${S(4)}/><path d="M44 54 Q50 70 56 54Z" fill="#f2c38f"/>
      <circle cx="34" cy="34" r="7" fill="#e8b98a" ${S(3)}/><circle cx="66" cy="34" r="7" fill="#e8b98a" ${S(3)}/>
      <circle cx="50" cy="34" r="15" fill="#9a5b2e" ${S(4)}/><path d="M39 36 Q40 26 50 28 Q60 26 61 36 Q62 46 50 47 Q38 46 39 36Z" fill="#f2c38f" ${S(2.5)}/>${eye(45, 34, 3)}${eye(55, 34, 3)}${limb('M45 42 Q50 45 55 42', 2)}
      <rect x="22" y="62" width="24" height="18" rx="2" fill="#fff4d6" ${S(2.5)} transform="rotate(-12 34 71)"/><path d="M26 70 L40 66" stroke="#e8304f" stroke-width="2.5"/>`;
  C.croc = () => `<path d="M58 72 Q90 76 98 62 Q90 80 60 82" fill="#5fae4a" ${S(3)}/>${limb('M40 76 L36 90 M56 78 L58 90 M70 76 L74 88', 6)}
      <path d="M24 64 Q30 52 54 54 Q76 54 76 70 Q74 80 54 80 L30 80 Q22 78 24 64Z" fill="#5fae4a" ${S(4)}/><path d="M34 58 L38 54 L42 58 L46 54 L50 58 L54 54 L58 58 L62 54 L66 58" fill="none" ${S(2.5)}/>
      <path d="M28 64 L2 56 Q0 60 4 62 L26 70Z" fill="#5fae4a" ${S(3.5)}/><path d="M28 68 L4 72 Q2 76 6 76 L30 74Z" fill="#5fae4a" ${S(3.5)}/>
      <path d="M8 60 L10 64 L13 60 L16 64 L19 61 M9 72 L11 69 L14 72 L17 69" fill="#fff" ${S(1.3)}/><circle cx="26" cy="54" r="7" fill="#5fae4a" ${S(3)}/>${eye(26, 54, 3.5)}`;
  C.shark = () => `<path d="M84 52 L98 32 L96 58 L98 76 L84 62Z" fill="#7d93b8" ${S(3.5)}/><path d="M46 38 L58 14 L66 40Z" fill="#7d93b8" ${S(3.5)}/>
      <path d="M4 56 Q22 34 56 36 Q82 38 88 56 Q80 72 50 72 Q18 72 4 56Z" fill="#8fa8d0" ${S(4)}/><path d="M10 60 Q40 74 80 64 Q60 76 30 72Z" fill="#fff"/>
      <path d="M46 62 L58 78 L62 62Z" fill="#7d93b8" ${S(3)}/><path d="M6 58 Q16 66 30 62" fill="#fff" ${S(2.5)}/><path d="M10 59 L13 63 L16 60 L19 64 L22 61 L25 64" fill="#fff" ${S(1.3)}/>
      ${eye(22, 48, 3.5)}${limb('M18 43 L27 45', 2.5)}<path d="M34 46 V54 M38 46 V54 M42 47 V54" ${S(1.5)}/>`;
  C.vampire = () => `<path d="M50 36 L14 92 L86 92Z" fill="#e8304f" ${S(3)}/>` + figure({ x: 50, y: 98, s: 0.78, pose: 'menace', mood: 'angry', head: '#e6ddff', hair: 'slick', hairColor: OL, cape: '#3b2a5c' });

  function creature(kind, o = {}) {
    return (C[kind] || C.goblin)(o);
  }
  // skull and crossbones (centred on x,y; about 24 units wide)
  const skull = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-11 3 L11 11 M-11 11 L11 3" stroke="${OL}" stroke-width="6.5" stroke-linecap="round"/><path d="M-11 3 L11 11 M-11 11 L11 3" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <path d="M0 -12 C7 -12 10 -7 10 -2 C10 2 8 4 6 5 V9 H-6 V5 C-8 4 -10 2 -10 -2 C-10 -7 -7 -12 0 -12Z" fill="#fff" ${S(2.5)}/>
      <ellipse cx="-4" cy="-2" rx="2.6" ry="3" fill="${OL}"/><ellipse cx="4" cy="-2" rx="2.6" ry="3" fill="${OL}"/><path d="M0 2 L-1.6 5 H1.6Z" fill="${OL}"/>
      <path d="M-2.5 6 V9 M2.5 6 V9" stroke="${OL}" stroke-width="1.5"/></g>`;
  // abilities shown as gear: armor = helmet + shield, thief = mask + dagger, curse = aura + skull
  function gear(ab) {
    if (ab === 'armor') return `<path d="M34 24 Q50 -2 66 24 L66 30 L34 30Z" fill="#b9c3d6" ${S(3.5)}/><path d="M50 4 V30" ${S(2.5)}/><path d="M6 62 Q6 52 20 50 Q34 52 34 62 Q34 82 20 92 Q6 82 6 62Z" fill="#9aa6c0" ${S(3.5)}/><path d="M20 56 V86 M10 66 H30" stroke="#ffe14d" stroke-width="3.5"/>`;
    if (ab === 'thief') return `<rect x="32" y="22" width="36" height="10" rx="5" fill="${OL}"/><circle cx="43" cy="27" r="2" fill="#fff"/><circle cx="57" cy="27" r="2" fill="#fff"/><path d="M14 72 L28 58" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M15 71 L27 59" stroke="#e6f3ff" stroke-width="3" stroke-linecap="round"/>`;
    if (ab === 'curse') return `<circle cx="50" cy="52" r="46" fill="#b23cff" opacity=".2"/>${skull(50, 66, 0.75)}`;
    return '';
  }

  window.STICK = { figure, bo, pip, hero, creature, gear, hat, skull };
})();
