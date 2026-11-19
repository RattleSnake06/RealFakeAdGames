// The 5 games. Each entry drives a menu card (art lives in js/art.js under the same id).
// A game with `scripts` is playable: those files load on demand and register
// window.GAME_MODULES[id] = { create(stage, api) } returning { pause(), resume(), destroy() }.
// Games without `scripts` show an "under construction" placeholder.
window.GAMES = [
  { id: 'mine', name: 'ORE RUSH', tagline: '18 ores, 5 prestiges, one rainbow core at the bottom.',
    adHook: '$0 → $1 BILLION!!', color: '#ff4f7b', dark: '#c4224f', genre: 'Arcade idle mining', levels: 10,
    scripts: ['js/vendor/three.min.js', 'js/games/mine/mine.js'] },
  { id: 'draw', name: 'DRAW TO SAVE', tagline: 'One line. Angry hornets. Protect the blob!',
    adHook: 'ONLY GENIUS CAN SAVE HIM', color: '#ffb81c', dark: '#d9860b', genre: 'Physics drawing', levels: 10 },
  { id: 'merge', name: 'MERGE MAYHEM', tagline: 'Merge your troops. Crush the boss army.',
    adHook: 'LVL 1 → LVL 999!!', color: '#2fb4ff', dark: '#1479c4', genre: 'Merge + auto-battle', levels: 10 },
  { id: 'doors', name: 'DOOR OF DOOM', tagline: 'Pick the right door… before time runs out.',
    adHook: 'WHICH ONE?? 🤔', color: '#8d5bff', dark: '#5d2fd1', genre: 'Split-second choice puzzle', levels: 10 },
  { id: 'hole', name: 'GLUTTON HOLE', tagline: 'Swallow the whole city. Grow HUGE.',
    adHook: 'SO SATISFYING!!! 😱', color: '#27c46b', dark: '#13894a', genre: 'Timed swallow arcade', levels: 10 },
];
