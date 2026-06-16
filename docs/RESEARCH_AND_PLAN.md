# The Laundromat Takes Your Name - Research And Production Plan

## Research Notes

The project target is a short, polished browser point-and-click horror game that is easy to finish in one sitting and memorable for adults. I avoided depending on random asset packs because licensing and style matching can cost more time than making original assets. The final art direction uses generated original scene art, procedural CSS/canvas overlays, and Web Audio synthesis.

Research takeaways:

- The MDA framework is useful here: simple mechanics should produce discovery, tension, and sensory pleasure instead of mechanical complexity. Source: <https://users.cs.northwestern.edu/~hunicke/MDA.pdf>
- Modern point-and-click design should avoid pixel hunting. The game uses large hotspot zones and an optional reveal button so the mystery comes from interpreting the room, not fighting the cursor. Source: <https://www.gamedeveloper.com/design/how-to-design-brillo-point-and-click-adventure-game-puzzles>
- Horror audio should build dread through contrast, low drones, uncertainty, and escalating feedback. The game uses room-specific ambience, note clues, wet clicks, machine thuds, and optional speech synthesis. Source: <https://gamemusic.net/sound-design-in-horror-games/>
- Web Audio is strong enough for no-download procedural sound design in a static page. Source: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API>
- `requestAnimationFrame` is the correct browser loop for the animated dust/static overlay. Source: <https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame>
- GitHub Pages can publish a static root with `index.html`, or deploy using a GitHub Actions workflow. Source: <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>

## Concept

Title: **The Laundromat Takes Your Name**

Pitch: You are trapped in an after-midnight laundromat that launders names out of people. To leave, you recover the pieces of your identity as stains: soot, rust, voice, and a damp name tag. It is weird, unsettling, darkly funny, and non-graphic.

Audience: Adults who enjoy surreal horror, escape rooms, odd fiction, and short indie browser games. Content stays psychological rather than graphic, so it is approachable.

Core loop:

1. Explore a scene.
2. Click readable hotspots.
3. Collect strange items/stains.
4. Use the selected item on the right object.
5. Enter the lost-and-found office and recover the missing vowels from a claim safe.
6. Solve one sound-memory puzzle and one final ordering puzzle.
7. Escape through the rain alley with a slight ending variation.

## 5-10 Hour Scope

Planned production slice:

1. Research and concept lock: 15-30 minutes.
2. Static web project scaffold: 30 minutes.
3. Scene art generation and integration: 45-90 minutes.
4. Point-and-click state machine, inventory, and hotspots: 90-150 minutes.
5. Procedural audio engine and room ambience: 60-120 minutes.
6. Puzzle implementation and endings: 60-120 minutes.
7. Responsive styling and visual polish: 60-120 minutes.
8. Browser testing, bug fixes, README, and GitHub Pages setup: 45-90 minutes.

## Feature Checklist

- Three original 16:9 scene backgrounds.
- Fourth original 16:9 lost-and-found office background.
- Original close-up art for the safe and name basin puzzle modals.
- Optimized WebP art assets for faster GitHub Pages loading.
- Large, accessible hotspot buttons.
- Keyboard shortcuts for hint, journal, reveal, and mute controls.
- Inventory with selectable strange items.
- Inventory inspection text that doubles as diegetic hinting.
- Optional hotspot reveal mode.
- Objective text that updates with the current puzzle goal.
- Contextual hint button and clue journal for puzzle recall.
- Optional lore hotspots that add journal clues about static, rinsing, and endings.
- In-browser checkpoint saving with a continue option.
- Static pressure affects visuals and procedural ambience.
- Optional cloudy sink rinse gives players one static-pressure recovery.
- Whisper/static apparition captions for atmosphere and sound-off readability.
- Procedural phone/rain cues for ending choices.
- Procedural ambient audio and one sound clue puzzle.
- Three puzzle gates: claim safe, tone panel, and name basin.
- Multiple endings based on route/static level.
- Persistent ending stamps with 1/3 replay progress tracking.
- Local ending records can be cleared from the start screen.
- Static GitHub Pages-ready deployment.

## Asset Strategy

Images: AI-generated original backgrounds copied into `assets/images`.

Audio: Procedural Web Audio synthesis. No downloaded sound files are required.

Code: Plain HTML, CSS, and JavaScript, with no build step.
