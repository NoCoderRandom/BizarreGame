# The Laundromat Takes Your Name

[![Test web game](https://github.com/NoCoderRandom/BizarreGame/actions/workflows/test.yml/badge.svg)](https://github.com/NoCoderRandom/BizarreGame/actions/workflows/test.yml)

A short surreal point-and-click horror game for the browser.

Play it here: <https://nocoderrandom.github.io/BizarreGame/>

## Features

- Five explorable scenes with generated original WebP artwork.
- Four endings with persistent ending stamps and journal route hints.
- Point-and-click inventory puzzles with large buttons and image hotspots.
- Procedural Web Audio ambience, room Listen cues, static whispers, and ending stingers.
- Responsive layout, mobile modal coverage, keyboard shortcuts, and reduced-motion support.

## Play Locally

From this folder:

```powershell
python -m http.server 4174
```

Then open <http://localhost:4174>.

## GitHub Pages

This is a static site. The root `index.html` is the game entry point.

Two good publishing options:

- In GitHub repository settings, enable Pages from the `main` branch and `/` root.
- Or use the included GitHub Actions workflow in `.github/workflows/pages.yml`.

After GitHub Pages is enabled, the game will be available at:

```text
https://<your-github-username>.github.io/<repo-name>/
```

## Controls

Click objects in the scene, select pocket items, then click objects that might react to the selected item. Selecting a pocket item also inspects it in the message panel. The `listen` action plays a room-specific cue and caption.

Number keys trigger scene actions in order. The top-right controls toggle sound, reveal touch points, open the clue journal, and show a contextual hint.

The visible scene buttons below the image are the safest way to play. The image hotspots work too.

The game saves an in-browser checkpoint while a shift is in progress, including the sound preference. Reload the page and choose `Continue Shift` to resume.

## Test

```powershell
npm install
npx playwright install chromium
npm test
```

To verify the deployed GitHub Pages build:

```powershell
$env:BASE_URL="https://nocoderrandom.github.io/BizarreGame/"
npm test
Remove-Item Env:\BASE_URL
```

## Notes

The game uses generated original images and procedural browser audio, so it does not need downloaded asset packs or a build step. GitHub Actions runs the Playwright suite on pushes and pull requests.
