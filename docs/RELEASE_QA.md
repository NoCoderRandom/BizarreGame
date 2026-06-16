# Release QA

## Current Shipped Build

Live URL: <https://nocoderrandom.github.io/BizarreGame/>

The current build is a static GitHub Pages point-and-click horror game with:

- Five explorable scenes: lobby, lost office, back room, boiler closet, and rain alley.
- Nine optimized WebP artwork assets, including scene backgrounds and puzzle/ending close-ups.
- Procedural Web Audio ambience, room Listen cues, static whispers, and ending stingers.
- Three main puzzle gates: claim safe, tone panel, and name basin.
- Four endings: named rain, frayed rain, payphone, and shift clock.
- Persistent checkpoints, ending stamps, ending-route hints, and sound preference storage.
- Keyboard shortcuts, hotspot reveal, mobile-friendly modals, focus-managed dialogs, and reduced-motion support.

## Verification

The Playwright suite covers:

- Main route from new game to clean ending.
- Payphone, shift clock, and high-static frayed endings.
- Mobile layout and mobile tone modal reachability.
- Start-screen sound persistence, credits, ending completion state, and social metadata.
- Browser decoding for every preloaded artwork asset.
- Static artwork payload budget.
- Browser page errors and console errors.

Before each deployment slice, the local suite was run with:

```powershell
npm test
```

The deployed GitHub Pages build was repeatedly verified with:

```powershell
$env:BASE_URL="https://nocoderrandom.github.io/BizarreGame/"
npm test
Remove-Item Env:\BASE_URL
```

GitHub Actions also runs the Playwright suite on pushes and pull requests through `.github/workflows/test.yml`.
