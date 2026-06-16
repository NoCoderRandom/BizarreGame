# The Laundromat Takes Your Name

A short surreal point-and-click horror game for the browser.

Play it here: <https://nocoderrandom.github.io/BizarreGame/>

## Play Locally

From this folder:

```powershell
python -m http.server 4173
```

Then open <http://localhost:4173>.

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

Click objects in the scene, select pocket items, then click objects that might react to the selected item. The circle button in the top-right reveals touch points.

The visible scene buttons below the image are the safest way to play. The image hotspots work too.

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

The game uses generated original images and procedural browser audio, so it does not need downloaded asset packs or a build step.
