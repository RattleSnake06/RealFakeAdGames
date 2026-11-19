# Real Fake Ad Games

Five games from mobile ads that never existed — now real. Open `index.html` in a browser to play
(no build step, works offline).

- **Controls:** mouse/touch, or arrow keys/WASD + Enter, Esc to go back/pause.
  In Ore Rush: drag anywhere (virtual joystick) or WASD/arrows to drive.
- **Status:** title screen, menus and overlays done. Playable: **Game 1 — Ore Rush** (3D arcade-idle mining)
  and **Game 2 — Number Tower** (125 number-puzzle towers). Games 3–5 are placeholders.
- **Debug:** `index.html?debug` exposes the running game as `ORE` (Ore Rush) or `NT` (Number Tower) in the console.
- **Number Tower levels** are generated and checked by `node tools/gen-tower-levels.js`.
- See [PLAN.md](PLAN.md) for the full build plan.

Third-party: [three.js](https://threejs.org) r159 (MIT), vendored in `js/vendor/`.
