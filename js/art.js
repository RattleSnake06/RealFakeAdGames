// Hand-built SVG illustrations for each game card (viewBox 320x200).
// They avoid ids so they can be repeated on the page safely.
(() => {
  const OL = '#2a1650';
  const blob = (x, y, s, c) => `<use href="#blob" x="${x}" y="${y}" width="${s}" height="${s}" style="color:${c}"/>`;
  const badge = (x, y, n, fill, w = 46) => `
    <g transform="translate(${x} ${y})">
      <rect x="${-w / 2}" y="-15" width="${w}" height="30" rx="15" fill="${fill}" stroke="${OL}" stroke-width="4"/>
      <text y="8" text-anchor="middle" font-size="21" fill="#fff" stroke="${OL}" stroke-width="5" paint-order="stroke"
            stroke-linejoin="round" font-family="'Lilita One', sans-serif">${n}</text>
    </g>`;
  const sparkle = (x, y, s = 1, c = '#fff') =>
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12Z" fill="${c}" stroke="${OL}" stroke-width="2.5"/>`;
  const hornet = (x, y, r = 0) => `
    <g transform="translate(${x} ${y}) rotate(${r})">
      <path d="M-26 -4 H-38 M-26 4 H-42" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
      <ellipse cx="-3" cy="-14" rx="9" ry="6" fill="#e9f8ff" stroke="${OL}" stroke-width="3" transform="rotate(-25 -3 -14)"/>
      <ellipse cx="7" cy="-13" rx="8" ry="5" fill="#e9f8ff" stroke="${OL}" stroke-width="3" transform="rotate(25 7 -13)"/>
      <path d="M-20 0 L-27 0" stroke="${OL}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="0" cy="0" rx="18" ry="12" fill="#ffd21c" stroke="${OL}" stroke-width="3.5"/>
      <path d="M-6 -11 V11 M3 -12 V12" stroke="${OL}" stroke-width="5"/>
      <circle cx="11" cy="-3" r="3.2" fill="${OL}"/>
      <path d="M8 -9 L14 -6" stroke="${OL}" stroke-width="3" stroke-linecap="round"/>
    </g>`;
  const ground = `<ellipse cx="160" cy="196" rx="190" ry="22" fill="#000" opacity=".12"/>`;

  window.ART = {
    tower: `
      <svg viewBox="0 0 320 200" aria-hidden="true">${ground}
        <path d="M160 26 L235 -8 L310 26 Z" fill="#ff4f7b" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
        <rect x="168" y="22" width="134" height="166" rx="10" fill="#fff4e6" stroke="${OL}" stroke-width="5"/>
        <path d="M168 77 H302 M168 132 H302" stroke="${OL}" stroke-width="5"/>
        <rect x="176" y="28" width="118" height="10" rx="5" fill="#ffd9c2"/>
        ${blob(208, 30, 44, '#8d5bff')}${badge(276, 52, 50, '#e8304f', 40)}
        ${blob(208, 86, 44, '#7bd94a')}${badge(276, 107, 8, '#27c46b', 34)}
        ${blob(208, 140, 44, '#ff9a3d')}${badge(276, 162, 15, '#ff7a3d', 40)}
        <path d="M120 150 Q160 176 198 164" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="2 10" stroke-linecap="round"/>
        <g transform="rotate(-35 128 100)">
          <rect x="122" y="58" width="12" height="50" rx="3" fill="#e6f3ff" stroke="${OL}" stroke-width="4"/>
          <rect x="112" y="104" width="32" height="9" rx="4" fill="#ffd21c" stroke="${OL}" stroke-width="4"/>
          <rect x="123" y="112" width="10" height="18" rx="3" fill="#9a5b2e" stroke="${OL}" stroke-width="4"/>
        </g>
        ${blob(28, 96, 96, '#2fb4ff')}
        ${badge(76, 88, 12, '#ffb81c', 46)}
        ${sparkle(30, 40, 1.1)}${sparkle(140, 22, .8, '#ffd21c')}
      </svg>`,

    draw: `
      <svg viewBox="0 0 320 200" aria-hidden="true">${ground}
        ${blob(122, 118, 76, '#ff7ab8')}
        <path d="M70 182 C70 90 250 70 262 176" fill="none" stroke="${OL}" stroke-width="13" stroke-linecap="round"/>
        <path d="M70 182 C70 90 250 70 262 176" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 14" opacity=".8"/>
        <g transform="translate(262 176) rotate(-140)">
          <rect x="0" y="-9" width="56" height="18" rx="3" fill="#ffd21c" stroke="${OL}" stroke-width="4"/>
          <rect x="44" y="-9" width="14" height="18" rx="3" fill="#ff7ab8" stroke="${OL}" stroke-width="4"/>
          <path d="M0 -9 L-16 0 L0 9 Z" fill="#ffe0b8" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
          <path d="M-10 -3.5 L-16 0 L-10 3.5Z" fill="${OL}"/>
        </g>
        ${hornet(62, 52, 10)}${hornet(160, 30, 0)}${hornet(262, 58, -15)}${hornet(30, 120, 25)}
        ${sparkle(110, 78, .7, '#ffd21c')}
      </svg>`,

    merge: `
      <svg viewBox="0 0 320 200" aria-hidden="true">${ground}
        ${blob(8, 120, 56, '#9be15d')}${badge(36, 112, 1, '#27c46b', 32)}
        <text x="78" y="160" font-size="40" text-anchor="middle" fill="#fff" stroke="${OL}" stroke-width="7" paint-order="stroke" font-family="'Lilita One', sans-serif">+</text>
        ${blob(94, 120, 56, '#9be15d')}${badge(122, 112, 1, '#27c46b', 32)}
        <path d="M160 140 H182 V126 L208 150 L182 174 V160 H160 Z" fill="#fff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
        ${blob(204, 70, 116, '#ffb81c')}
        <path d="M232 84 L238 48 L252 66 L262 40 L272 66 L286 48 L292 84 Z" fill="#ffe14d" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="262" cy="64" r="5" fill="#ff4f7b" stroke="${OL}" stroke-width="3"/>
        ${badge(208, 52, 'LV999', '#e8304f', 74)}
        ${sparkle(306, 110, .9)}${sparkle(196, 112, .6, '#ffd21c')}${sparkle(150, 60, .8)}
      </svg>`,

    doors: `
      <svg viewBox="0 0 320 200" aria-hidden="true">${ground}
        <g stroke="${OL}" stroke-width="5" stroke-linejoin="round">
          <path d="M24 186 V84 A38 38 0 0 1 100 84 V186 Z" fill="#ff6a3d"/>
          <path d="M122 186 V84 A38 38 0 0 1 198 84 V186 Z" fill="#3db8ff"/>
          <path d="M220 186 V84 A38 38 0 0 1 296 84 V186 Z" fill="#ffd21c"/>
          <circle cx="88" cy="140" r="5" fill="#fff"/><circle cx="186" cy="140" r="5" fill="#fff"/><circle cx="284" cy="140" r="5" fill="#fff"/>
        </g>
        <path d="M62 132 C42 118 52 96 62 82 C64 96 74 96 72 86 C86 100 84 126 62 132Z" fill="#ffd21c" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M62 128 C54 120 58 110 62 104 C64 112 70 112 68 108 C72 116 70 126 62 128Z" fill="#fff"/>
        <path d="M134 128 Q148 122 160 128 T186 128" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        <path d="M146 124 L160 88 L174 124 Z" fill="#5a6b8c" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
        <text x="258" y="134" font-size="54" text-anchor="middle" fill="#fff" stroke="${OL}" stroke-width="7" paint-order="stroke" font-family="'Lilita One', sans-serif">?</text>
        ${blob(134, 140, 54, '#f2f2ff')}
        <text x="210" y="52" font-size="30" fill="#fff" stroke="${OL}" stroke-width="6" paint-order="stroke" font-family="'Lilita One', sans-serif" transform="rotate(12 210 52)">?</text>
        <text x="102" y="44" font-size="22" fill="#fff" stroke="${OL}" stroke-width="5" paint-order="stroke" font-family="'Lilita One', sans-serif" transform="rotate(-14 102 44)">?</text>
      </svg>`,

    hole: `
      <svg viewBox="0 0 320 200" aria-hidden="true">
        <rect x="-10" y="150" width="340" height="34" fill="#5c5f7a" stroke="${OL}" stroke-width="5"/>
        <path d="M10 167 H40 M70 167 H100 M250 167 H280 M300 167 H330" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="160" cy="138" rx="104" ry="40" fill="#1b0f33" stroke="${OL}" stroke-width="6"/>
        <ellipse cx="160" cy="138" rx="92" ry="32" fill="none" stroke="#3d2b6b" stroke-width="5"/>
        <g transform="rotate(-28 128 112)">
          <rect x="94" y="94" width="68" height="28" rx="9" fill="#ff4f7b" stroke="${OL}" stroke-width="4"/>
          <path d="M106 94 L114 80 H142 L150 94Z" fill="#bfeaff" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
          <circle cx="110" cy="124" r="9" fill="${OL}"/><circle cx="146" cy="124" r="9" fill="${OL}"/>
          <circle cx="110" cy="124" r="3.5" fill="#ccc"/><circle cx="146" cy="124" r="3.5" fill="#ccc"/>
        </g>
        <g transform="rotate(22 212 100)">
          <rect x="206" y="96" width="12" height="34" fill="#9a5b2e" stroke="${OL}" stroke-width="4"/>
          <circle cx="212" cy="84" r="24" fill="#2fae58" stroke="${OL}" stroke-width="4"/>
          <circle cx="204" cy="76" r="7" fill="#fff" opacity=".3"/>
        </g>
        <g transform="rotate(-8 52 70)">
          <rect x="28" y="62" width="48" height="40" fill="#fff4e6" stroke="${OL}" stroke-width="4"/>
          <path d="M20 66 L52 36 L84 66Z" fill="#8d5bff" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
          <rect x="45" y="80" width="14" height="22" fill="#3db8ff" stroke="${OL}" stroke-width="3"/>
        </g>
        <path d="M150 60 V40 M170 64 V30 M190 60 V44" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
        ${sparkle(272, 52, 1, '#ffd21c')}${sparkle(110, 34, .7)}
      </svg>`,
  };
})();
