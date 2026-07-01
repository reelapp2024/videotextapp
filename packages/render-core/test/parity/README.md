# Visual parity harness

## Automated (CI / local)

```bash
cd packages/render-core
npm install
npm test
```

Tests in `visualRegression.test.js`:
- **Golden hash** — row-based static text scene pixel hash vs `test/fixtures/rowBased-static.golden.hash`
- **Self-parity** — two identical draws must have zero pixel diff

Regenerate golden after intentional visual changes:

```bash
GENERATE_GOLDEN=1 npm test
```

Requires `@napi-rs/canvas` (devDependency).

## Manual (Preview vs Render-Core)

1. Set `VITE_RENDER_CORE_TEXT=1` in `Reel-Maker/.env`
2. Capture preview frame with flag on and off
3. Pixel-diff in an image tool
4. Document intentional differences

Future: browser Playwright capture comparing legacy vs render-core paths.
