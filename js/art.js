// Hand-built SVG illustrations for each game card (viewBox 320x200).
// They avoid ids so they can be repeated on the page safely.
(() => {
  const OL = '#2a1650';
  const ST = window.STICK;
  const fig = (o) => ST.figure(o);
  const beast = (kind, x, y, s, o = {}) => `<g transform="translate(${x} ${y}) scale(${s})">${ST.creature(kind, o)}</g>`;
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
    mine: `
      <svg viewBox="0 0 320 200" aria-hidden="true">${ground}
        ${[[250,178,15,'#ffc330'],[278,180,14,'#e4e9f2'],[306,176,15,'#ffc330'],[236,160,13,'#e07a3c'],[264,158,15,'#e4e9f2'],
           [292,156,14,'#1fd67a'],[316,154,12,'#e07a3c'],[250,138,13,'#ffc330'],[278,134,14,'#ff2d5c'],[304,132,13,'#e4e9f2'],
           [266,114,12,'#c6f6ff'],[292,110,12,'#ffc330']]
          .map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${OL}" stroke-width="4"/><ellipse cx="${x - r * 0.35}" cy="${y - r * 0.4}" rx="${r * 0.32}" ry="${r * 0.2}" fill="#fff" opacity=".7"/>`).join('')}
        <path d="M76 140 H94" stroke="${OL}" stroke-width="6" stroke-linecap="round"/>
        <rect x="12" y="112" width="66" height="40" rx="6" fill="#c77b3c" stroke="${OL}" stroke-width="5"/>
        <rect x="8" y="106" width="74" height="10" rx="4" fill="#ffc21c" stroke="${OL}" stroke-width="4"/>
        <circle cx="26" cy="100" r="9" fill="#ffc330" stroke="${OL}" stroke-width="3.5"/>
        <circle cx="44" cy="96" r="10" fill="#e4e9f2" stroke="${OL}" stroke-width="3.5"/>
        <circle cx="62" cy="100" r="9" fill="#e07a3c" stroke="${OL}" stroke-width="3.5"/>
        <circle cx="36" cy="86" r="7" fill="#1fd67a" stroke="${OL}" stroke-width="3.5"/>
        <circle cx="45" cy="158" r="12" fill="${OL}"/><circle cx="45" cy="158" r="4.5" fill="#ffc21c"/>
        <rect x="100" y="62" width="7" height="54" fill="${OL}"/><rect x="142" y="62" width="7" height="54" fill="${OL}"/>
        ${fig({ x: 124, y: 124, s: 0.46, pose: 'wave', mood: 'happy', hat: 'hardhat', scarf: '#2fb4ff' })}
        <rect x="90" y="54" width="68" height="13" rx="5" fill="#ff4f7b" stroke="${OL}" stroke-width="4"/>
        <rect x="88" y="110" width="102" height="42" rx="10" fill="#ffc21c" stroke="${OL}" stroke-width="5"/>
        <rect x="150" y="94" width="38" height="20" rx="5" fill="#ffc21c" stroke="${OL}" stroke-width="4.5"/>
        <rect x="170" y="74" width="7" height="22" rx="3" fill="${OL}"/>
        <rect x="96" y="116" width="86" height="7" rx="3.5" fill="#fff" opacity=".45"/>
        <circle cx="110" cy="156" r="17" fill="${OL}"/><circle cx="110" cy="156" r="6" fill="#ffc21c"/>
        <circle cx="170" cy="156" r="17" fill="${OL}"/><circle cx="170" cy="156" r="6" fill="#ffc21c"/>
        <path d="M188 128 H208" stroke="${OL}" stroke-width="7" stroke-linecap="round"/>
        <path d="M236 104 L250 110 L236 116 Z M236 120 L250 126 L236 132 Z M236 136 L250 142 L236 148 Z M236 152 L250 158 L236 162 Z" fill="#8d5bff" stroke="${OL}" stroke-width="3.5" stroke-linejoin="round"/>
        <rect x="204" y="98" width="34" height="68" rx="13" fill="#d7dcea" stroke="${OL}" stroke-width="5"/>
        <path d="M212 104 V160 M222 102 V162 M230 104 V160" stroke="${OL}" stroke-width="2.5" opacity=".5"/>
        <path d="M206 92 Q170 30 52 76" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>
        <circle cx="150" cy="44" r="7" fill="#ffc330" stroke="${OL}" stroke-width="3"/>
        <circle cx="104" cy="52" r="6" fill="#e4e9f2" stroke="${OL}" stroke-width="3"/>
        <g font-family="'Lilita One', sans-serif" text-anchor="middle">
          <circle cx="262" cy="64" r="15" fill="#ffc330" stroke="${OL}" stroke-width="4"/><text x="262" y="72" font-size="20" fill="${OL}">$</text>
          <circle cx="296" cy="86" r="11" fill="#ffc330" stroke="${OL}" stroke-width="3.5"/><text x="296" y="92" font-size="15" fill="${OL}">$</text>
        </g>
        ${badge(212, 34, '$1B', '#27c46b', 64)}
        ${sparkle(306, 40, .9, '#fff')}${sparkle(236, 92, .6, '#ffd21c')}
      </svg>`,

    tower: `
      <svg viewBox="0 0 320 200" aria-hidden="true">${ground}
        <rect x="14" y="128" width="62" height="58" rx="5" fill="#b7b0d9" stroke="${OL}" stroke-width="5"/>
        <path d="M8 130 L45 98 L82 130 Z" fill="#6a8cff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
        <rect x="22" y="136" width="46" height="44" rx="4" fill="#6fb2ff" stroke="${OL}" stroke-width="4"/>
        ${ST.hero({ color: '#ff4f7b' }, 40, 180, 0.33)}
        <text x="45" y="134" font-size="17" text-anchor="middle" fill="#9df3ff" stroke="${OL}" stroke-width="5" paint-order="stroke" font-family="'Lilita One', sans-serif">22</text>
        <rect x="150" y="10" width="112" height="178" rx="6" fill="#b7b0d9" stroke="${OL}" stroke-width="5"/>
        <path d="M150 10 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h14 v10 h14 v-10 h0" fill="#b7b0d9" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>
        ${[0, 1, 2].map((k) => `<rect x="160" y="${18 + k * 56}" width="92" height="50" rx="4" fill="#6fb2ff" stroke="${OL}" stroke-width="4"/>`).join('')}
        <text x="206" y="38" font-size="18" text-anchor="middle" fill="#9df3ff" stroke="${OL}" stroke-width="5" paint-order="stroke" font-family="'Lilita One', sans-serif">×12</text>
        <g transform="translate(220 40) rotate(-35)"><rect x="-4" y="-22" width="8" height="30" rx="2" fill="#e6f3ff" stroke="${OL}" stroke-width="3"/><rect x="-11" y="6" width="22" height="6" rx="3" fill="#ffc21c" stroke="${OL}" stroke-width="3"/></g>
        <text x="206" y="94" font-size="18" text-anchor="middle" fill="#ff6b7a" stroke="${OL}" stroke-width="5" paint-order="stroke" font-family="'Lilita One', sans-serif">238</text>
        ${beast('goblin', 186, 88, 0.38, { color: '#7bd34a' })}
        <text x="206" y="150" font-size="18" text-anchor="middle" fill="#ff6b7a" stroke="${OL}" stroke-width="5" paint-order="stroke" font-family="'Lilita One', sans-serif">÷3</text>
        <g transform="translate(222 154) rotate(35)"><rect x="-4" y="-22" width="8" height="30" rx="2" fill="#c2453e" stroke="${OL}" stroke-width="3"/><rect x="-11" y="6" width="22" height="6" rx="3" fill="#5d2fd1" stroke="${OL}" stroke-width="3"/></g>
        <path d="M90 150 Q120 110 156 96" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round"/>
        <text x="122" y="70" font-size="34" text-anchor="middle" fill="#fff" stroke="${OL}" stroke-width="6" paint-order="stroke" font-family="'Lilita One', sans-serif" transform="rotate(-10 122 70)">?</text>
        ${badge(282, 40, '★★★', '#ffb81c', 62)}
        ${sparkle(296, 120, 0.9)}${sparkle(110, 30, 0.7, '#ffd21c')}
      </svg>`,

    merge: `
      <svg viewBox="0 0 320 200" aria-hidden="true">${ground}
        ${fig({ x: 34, y: 180, s: 0.5, pose: 'cheer', mood: 'happy', hat: 'viking', scarf: '#9be15d' })}${badge(36, 96, 1, '#27c46b', 32)}
        <text x="78" y="160" font-size="40" text-anchor="middle" fill="#fff" stroke="${OL}" stroke-width="7" paint-order="stroke" font-family="'Lilita One', sans-serif">+</text>
        ${fig({ x: 120, y: 180, s: 0.5, pose: 'cheer', mood: 'happy', hat: 'viking', scarf: '#9be15d' })}${badge(122, 96, 1, '#27c46b', 32)}
        <path d="M160 140 H182 V126 L208 150 L182 174 V160 H160 Z" fill="#fff" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>
        ${fig({ x: 250, y: 192, s: 0.98, pose: 'hero', mood: 'hero', hat: 'crown', cape: '#ffb81c', coat: '#b9c3d6', sword: true })}
        ${badge(196, 50, 'LV999', '#e8304f', 74)}
        ${sparkle(306, 110, .9)}${sparkle(196, 112, .6, '#ffd21c')}${sparkle(150, 60, .8)}
      </svg>`,

    pick: `
      <svg viewBox="0 0 320 200" aria-hidden="true">
        <g stroke="#fff" stroke-width="3" opacity=".55" stroke-linecap="round">${[[40, 20], [90, 50], [150, 14], [210, 40], [270, 18], [60, 90], [250, 80], [120, 96]].map(([x, y]) => `<path d="M${x} ${y} l-6 18"/>`).join('')}</g>
        ${ST.bo('cold', 116, 136, 0.78)}${ST.pip('cold', 196, 136, 0.74)}
        <path d="M90 52 L82 56 M90 66 L82 68 M222 54 L230 58 M222 68 L230 70" stroke="${OL}" stroke-width="3.5" stroke-linecap="round"/>
        <rect x="70" y="128" width="180" height="62" rx="12" fill="#fff" stroke="${OL}" stroke-width="5"/>
        <rect x="82" y="136" width="70" height="46" rx="9" fill="#ffc21c" stroke="${OL}" stroke-width="4"/>
        <rect x="168" y="136" width="70" height="46" rx="9" fill="#ffc21c" stroke="${OL}" stroke-width="4"/>
        <path d="M94 160 Q117 134 140 160 Q134 156 128 160 Q122 156 117 160 Q112 156 106 160 Q100 156 94 160Z" fill="#b84ae8" stroke="${OL}" stroke-width="3"/><path d="M117 160 V174 Q117 178 112 176" fill="none" stroke="${OL}" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M203 142 L224 176 H182Z" fill="#ff8a3d" stroke="${OL}" stroke-width="3.5" stroke-linejoin="round"/><path d="M203 176 L199 162 L203 154 L207 162Z" fill="${OL}"/>
        <path d="M214 196 l-6 -26 q-2 -8 6 -8 q6 0 6 8 v6 q8 -4 12 2 q8 -2 10 4 q8 0 8 8 v10Z" fill="#fff" stroke="${OL}" stroke-width="3.5" stroke-linejoin="round"/>
        <text x="280" y="70" font-size="40" text-anchor="middle" fill="#fff" stroke="${OL}" stroke-width="7" paint-order="stroke" font-family="'Lilita One', sans-serif" transform="rotate(12 280 70)">?</text>
        ${sparkle(30, 150, .8, '#ffe14d')}
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
