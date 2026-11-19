// The 5 games. Each entry drives a menu card. Later each game gets its own
// module implementing { init(stage, api), start(), pause(), resume(), destroy() }.
window.GAMES = [
  {
    id: 'tower',
    name: 'TOWER OF POWER',
    tagline: 'Eat weaker foes. Get stronger. Climb!',
    adHook: '99% FAIL LEVEL 3!',
    emoji: '🗼',
    color: '#ff3b6b',
    genre: 'Number-power puzzle',
  },
  {
    id: 'draw',
    name: 'DRAW TO SAVE',
    tagline: 'One line. Angry hornets. Protect the blob!',
    adHook: 'ONLY GENIUS CAN SAVE HIM',
    emoji: '✏️',
    color: '#ffb300',
    genre: 'Physics drawing',
  },
  {
    id: 'merge',
    name: 'MERGE MAYHEM',
    tagline: 'Merge troops. Crush the boss army.',
    adHook: 'LVL 1 → LVL 999!!',
    emoji: '⚔️',
    color: '#29b6f6',
    genre: 'Merge + auto-battle',
  },
  {
    id: 'doors',
    name: 'DOOR OF DOOM',
    tagline: 'Pick the right door… or else.',
    adHook: 'WHICH ONE?? 🤔',
    emoji: '🚪',
    color: '#7c4dff',
    genre: 'Split-second choice puzzle',
  },
  {
    id: 'hole',
    name: 'GLUTTON HOLE',
    tagline: 'Swallow the whole city. Grow huge.',
    adHook: 'SATISFYING!!! 😱',
    emoji: '🕳️',
    color: '#00c853',
    genre: 'Timed swallow arcade',
  },
];
