# Real Fake Ad Games — Build Plan

Inspiration: *YEAH! YOU WANT "THOSE GAMES," RIGHT? SO HERE YOU GO! NOW, LET'S SEE YOU CLEAR THEM!*
(Steam), a collection that turns the misleading mobile-game ads into real, playable games.
Ours uses the same **concept** with five **original** games, names and art. We don't copy that
game's specific minigames, characters or look.

## Tech decisions (locked)
- **Plain HTML5 + CSS + JavaScript, Canvas 2D** for the games. No build step, runs by opening
  `index.html`, deploys free to GitHub Pages / itch.io, and can be wrapped for Steam later with
  Electron or Tauri.
- One shared **game module contract** so every game plugs into the menu the same way:
  ```js
  export default {
    id, init(stage, api), start(level), pause(), resume(), destroy()
  }
  // api = { onWin(stars), onLose(), save, settings, sfx, music, shake }
  ```
- Save data in `localStorage` (`rfag.save.v1`): cleared games, best level per game, settings.
- Fixed logical resolution (e.g. 720×1280 portrait, like a phone ad) scaled to fit the window,
  so physics/levels behave the same on every screen.

## Art direction (locked)
- **Look:** bright sky, halftone dots, rotating sunbursts, chunky "sticker" UI: every panel and button has a
  white rim + dark ink outline (`#2a1650`) + a solid drop shadow. Glossy, rounded buttons that squash when pressed.
- **Mascots:** the **Blobs**, round jelly characters with big eyes, one color per game
  (pink Tower, gold Draw, blue Merge, purple Doors, green Hole). They're our own characters,
  so we never use stick figures from the original game.
- **Fonts:** Lilita One (display) + Fredoka (body), with rounded system fallbacks.
- **Ad parody details:** "Ad ⓘ ✕" chips (the ✕ on the title dodges your click), clickbait stickers,
  screen wipe transitions, cheap little bleep/bloop UI sounds.
- **Art pipeline:** inline SVG (`js/art.js`) so everything scales sharply on every screen and needs no image files.

## The 5 games
| # | Name | The "ad" | Real gameplay | Core systems |
|---|------|----------|---------------|--------------|
| 1 | **Ore Rush** ✅ playable | "$0 → $1 BILLION!!" digger ploughing through piles of shiny ore | 3D arcade-idle: drive into ore, sell at the grinder, upgrade, prestige 5 times, reach the Prismite core. | three.js, instanced ore field, upgrade economy, prestige + perks |
| 2 | **Number Tower** ✅ playable | "Only 1% pass level 47!" hero with a number climbing towers of numbered enemies | 125 hand-checked number puzzles: climb, pick gates, beat enemies with a bigger number, reach the boss. | DOM board, rules engine + solver, level generator, stars, outfits |
| 3 | **Merge Mayhem** | "LVL 1 → LVL 999" army merging | Buy units, drag identical ones to merge, press FIGHT, auto-battle vs. boss army. | Drag & drop grid, merge rules, coins, simple auto-battler |
| 4 | **Door of Doom** | "Which one??" 3 doors: lava, shark, lion… | Quick-thinking logic: pick the safe door/item before the timer ends. Escalating trick questions. | Scene/choice data (JSON), timer, reaction animations |
| 5 | **Glutton Hole** | "SATISFYING!!!" hole swallowing a city | Move a hole; swallow objects smaller than you to grow; hit the % target before time runs out. | Top-down movement, size checks, falling-in animation, scoring |

Each game has **10 steps of progress** (levels, or ore depth for Ore Rush). Finishing the last one marks it
CLEARED (★) in the menu. Clearing all 5 unlocks a secret ending/credits.
(Spare ideas if we ever want more games: Draw to Save, a physics line-drawing puzzle.)

## Game 1: Ore Rush (built)
- **Loop:** drill into ore → cart fills → unload on **SELL** → grinder turns ore into a coin pile → drive
  over coins → park on an **upgrade pad** (money drains in) → dig deeper → **prestige** → repeat, richer.
- **18 ores**, one 14-unit band each (252 units of track): Copper, Iron, Silver, Gold, Amethyst, Emerald,
  Cobalt, Ruby, Rose Gold, Topaz, Mythril, Obsidian, Diamond, Uranium, Magma, Moonstone, Void, **Prismite**
  (rainbow core). Values go $1 → $3M (about x2.4 per ore).
- **Pickaxe:** each level unlocks the next ore. Every ore below your best breaks faster (x1.5, x2, x2.5…),
  and ore 3+ tiers below is ploughed aside instead of filling your cart ("SKIPPED" on its sign).
- **Regrowth:** mined ore grows back after 3 minutes. A full cart ploughs through ore it can mine, so you can
  never be trapped away from base.
- **Upgrades:** Pickaxe (18 lv, capped by rank), Engine (10), Cart (25 → 560 ore, 12), Grinder (x1 → x3.25, 10),
  Auto Collect (vault + vacuum tube, 5).
- **Prestige** (⭐ pad below the grinder), ranks 0 → 5:
  - Costs $750K, $10M, $120M, $1.5B, $18B. Resets money, upgrades and the mine.
  - Each rank: ore value x2 forever (AdVenture Capitalist angels), pickaxe cap +2 ores, so rank 0 reaches
    Ruby and only rank 5 reaches Prismite (Idle Miner style tiers).
  - Star Gems: 10 x √(earned this run ÷ cost), minimum 10 (Cookie Clicker heavenly chips). Spent on perks:
    Turbo Treads, Big Cart, Golden Touch, Lucky Strike (ore worth x10), Head Start (+1 Engine/Cart/Grinder each run).
- **Progress / clear:** menu progress = deepest ore reached (18 ores → 10 steps). Mining Prismite clears the game.
- **Pacing (bot playthrough, greedy strategy):** rank 0 ≈ 60 min, ranks 1–4 ≈ 12–28 min each,
  rank 5 to Prismite ≈ 25 min, about 2¾ hours total. A person should be faster than the bot.
- **Tech:** three.js r159 (vendored, so `index.html` still works offline / from file://), ~19.7k instanced
  ore chunks in 18 meshes (culled per band), spatial grid for collisions, adaptive quality.
- **Debug:** open `index.html?debug` → `ORE` in the console (`ORE.d.money = 1e9`, `ORE.simulate(5, ['w'])`).
- **Next for this game:** music + richer SFX, offline earnings ("you earned $X while away"), drill dust,
  balance pass from real playtests, real-phone performance test.

## Game 2: Number Tower (built)
- **Rules:** climb one floor per move, straight up or across a bridge (✕ = no bridge). Gates change your
  power (+ − × ÷). Combat is a straight comparison: beat an enemy if your number is bigger and keep the
  difference (300 vs 250 → 50 left). The boss waits on top. Every level has a fixed start power and layout;
  nothing carries over between levels.
- **125 levels, 5 worlds**, each world adds mechanics:
  Grasslands (gates, forks, optional enemies, treasure) → Frozen Kingdom (❄ frozen gates + 🔥 torches,
  🔑 keys + 🔒 locked rooms, sequencing) → Burning Lands (🛡 armored enemies cost double, 🎁 enemies that drop
  rewards, lava burns a %) → Cursed Realm (🦹 thieves halve you first, 💀 curses flip your next gate,
  🔄 switches flip rune gates) → Celestial Kingdom (everything combined). Each world ends with a boss tower.
- **Difficulty** ramps Easy → Normal → Medium → Hard → Expert inside each world through puzzle design:
  fewer winning routes, gimmicks that must be used, and from Medium up the "always take the biggest number"
  player loses. Expert levels usually have exactly one winning route.
- **Gimmicks** (every level has its own name): Fork in the Road, Multiplier Trap, Add Then Multiply,
  Optional Enemy, Hidden Treasure, No Room for Error, Locked Floor, Cold Snap, Sequence, Armored Knights,
  Spoils of War, Lava Floor, Power Thief, Operation Switch, Cursed Blade, The Gauntlet.
- **Stars:** ★ clear · ★ no deaths, restarts or hints · ★ a level-specific challenge (finish with X+ power,
  never use − or ÷, defeat N enemies, grab the treasure, or beat a time).
- **Coins** come only from new stars and only buy outfits (8 colors, 8 hats). Power is never for sale.
- **How the levels are made:** `js/games/tower/logic.js` is the rules engine and solver (shared by game and
  tools). `tools/gen-tower-levels.js` builds each level around its gimmick, sizes the numbers from the power
  a player could really have on each floor, plays every route, and picks the boss number so the right share
  of routes win. It writes `js/games/tower/levels.js` (deterministic; rerun with `node tools/gen-tower-levels.js`).
  Every level is checked: solvable, stored solution wins, third star possible, greedy fails from Medium up.
- **Look:** every world has its own painted, animated backdrop (`js/games/tower/scenes.js`): Grasslands
  (smiling sun, hills, castle, butterflies, pollen), Frozen Kingdom (aurora, snowy peaks, frozen lake, snowman,
  falling snow), Burning Lands (erupting volcano, lava river, embers), Cursed Realm (giant moon, bats, haunted
  castle, graves, fog, wisps), Celestial Kingdom (rainbow, floating temple islands, waterfalls, cloud sea,
  sparkles). Towers, roofs, flags and ground change per world too (snow caps and icicles, cracked obsidian
  with lava glow, cobwebbed stone, marble with gold trim).
- **Debug:** `index.html?debug` exposes `NT` (e.g. `NT.d.unlocked = 125; NT.openLevel(99)`).
- **Next for this game:** playtest and hand-tune favourite levels, a "daily tower", sound polish.

## Milestones
**M0 – Shell (DONE)**: animated title (logo, sunburst, hopping Blobs, "press any button"),
game select with a big featured card + 5 game tiles, coin & trophy counters, Wardrobe/Options/Credits,
game screen placeholder, pause overlay, screen wipe transitions, UI sounds, keyboard + mouse + touch,
save data, debug "clear it" button.

**M1 – Engine core** (shared by all games) — *game host + module contract done with Ore Rush:
games load on demand, get `{ data, save, settings, blip, setProgress, clear }`, and implement
`pause/resume/destroy`. Still to do: shared Win/Lose overlays + level select for the level-based games.*
1. `js/engine/`: game loop (fixed timestep), canvas scaler, input (pointer + keys unified),
   tween helper, simple particle system, screen shake.
2. Audio manager (Web Audio): music/SFX buses wired to the existing settings sliders.
3. Game host: replace the placeholder in `main.js` with loading the module from the registry,
   plus shared **Win / Lose / Level-select** overlays.
4. Level-select per game (1–10 + boss), progress saved per level.
✅ Done when: a dummy "click the box" game runs through win → next level → cleared.

**M2 – Games** (each one is its own branch / PR)
1. ✅ Ore Rush (3D arcade idle)
2. ✅ Number Tower (number puzzle, 125 levels)
3. Door of Doom (mostly data + UI, fastest win)
4. Glutton Hole (movement + collision; can reuse Ore Rush's 3D setup)
5. Merge Mayhem (drag/drop + auto-battle)

For each game, the same checklist:
- [ ] Prototype with boxes/circles (fun first, art later)
- [ ] Win + lose conditions hooked to `api.onWin/onLose`
- [ ] 10 levels + boss in a `levels.json`
- [ ] Tutorial hint on level 1 (the "ad" moment: show the fake ad's fail, then let them win)
- [ ] Art pass, SFX, juice (particles, shake, squash/stretch)
- [ ] Playtest: every level beatable, no soft-locks

**M3 – Presentation**
- Fake "ad intro" clip before each game (5s, deliberately cheesy, skippable).
- Real art (consistent cartoon style), music track for menu + one per game.
- Menu thumbnails become little animated loops.
- Coins earned per level (stars × 100) → **Wardrobe**: hats/outfits for your Blob, shown on the title screen.

**M4 – Polish & QA**
- Automated Playwright smoke test: title → menu → each game loads → pause → back, no console errors.
- Unit tests for pure logic (tower math, merge rules, door data validation).
- Performance check on a low-end phone (60 fps target), accessibility (reduced motion, colorblind-safe).

**M5 – Ship**
- GitHub Pages / itch.io web build.
- Optional: Electron/Tauri desktop wrapper for Steam (needs Steamworks account + $100 fee).

## Risks & how we handle them
- **Scope creep** → strict 10 levels per game; new ideas go in `IDEAS.md`, not the build.
- **Physics (Draw to Save)** is the hardest → built last, can use Matter.js from a CDN if custom physics fights us.
- **Too-close to the original / real games** → all names, characters and art are ours; review each game against this rule before art pass.
- **Losing work** → commit + push after every working step.
