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
| 1 | **Ore Rush** ✅ playable | "$0 → $1,000,000!!" digger ploughing through piles of shiny ore | 3D arcade-idle: drive into ore, unload at the grinder, grab the coins, park on upgrade pads. Earn $1M. | three.js, instanced ore field, upgrade economy, milestones |
| 2 | **Draw to Save** | "Only genius can save him", bees attack a blob | Draw ONE line with limited ink; it becomes a physics wall; survive 10s of hornets. | Line drawing → physics body (Matter.js or small custom), swarm AI, timer |
| 3 | **Merge Mayhem** | "LVL 1 → LVL 999" army merging | Buy units, drag identical ones to merge, press FIGHT, auto-battle vs. boss army. | Drag & drop grid, merge rules, coins, simple auto-battler |
| 4 | **Door of Doom** | "Which one??" 3 doors: lava, shark, lion… | Quick-thinking logic: pick the safe door/item before the timer ends. Escalating trick questions. | Scene/choice data (JSON), timer, reaction animations |
| 5 | **Glutton Hole** | "SATISFYING!!!" hole swallowing a city | Move a hole; swallow objects smaller than you to grow; hit the % target before time runs out. | Top-down movement, size checks, falling-in animation, scoring |

Each game has **10 steps of progress** (levels, or milestones for Ore Rush). Finishing the last one marks it
CLEARED (★) in the menu. Clearing all 5 unlocks a secret ending/credits.
(Tower of Power was swapped out for Ore Rush; it's a spare idea if we ever want a 6th game.)

## Game 1: Ore Rush (built)
- **Loop:** drill into ore → cart fills → unload on **SELL** → grinder turns ore into a coin pile → drive
  over coins → park on an **upgrade pad** (money drains in) → dig deeper.
- **Ore bands** (16 units deep each): Copper $1 → Silver $3 → Gold $8 → Emerald $25 → Ruby $70 → Diamond $200.
  Each needs the matching pickaxe level; mined ore regrows after 40s.
- **Upgrades:** Pickaxe (tier + drill speed, 6 lv), Engine (speed, 8 lv), Cart (20 → 400 ore, 10 lv),
  Grinder (x1 → x3.25 value + speed, 10 lv), Auto Collect (vault + vacuum tube, 5 lv).
- **Milestones** (total earned): $100, $500, $2K, $6K, $20K, $60K, $150K, $350K, $650K, **$1M = cleared**.
- **Tech:** three.js r159 (vendored, so `index.html` still works offline / from file://), ~7.4k instanced
  ore chunks, spatial grid for collisions, adaptive quality (drops resolution, then ore shadows, under 40fps).
- **Debug:** open `index.html?debug` → `ORE` in the console (`ORE.d.money = 1e6`, `ORE.simulate(5, ['w'])`).
- **Next for this game:** music + richer SFX, offline earnings ("you earned $X while away"), particle dust
  on the drill, a prestige/"new mine" mode after clearing, balance pass from real playtests, real-phone perf test.

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
2. Door of Doom (mostly data + UI, fastest win)
3. Glutton Hole (movement + collision; can reuse Ore Rush's 3D setup)
4. Merge Mayhem (drag/drop + auto-battle)
5. Draw to Save (physics — hardest, last)

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
