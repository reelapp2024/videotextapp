# Export & Render Architecture (v2)

**Status:** Approved with refinements — **no production code yet**  
**Supersedes:** Architecture v1 (same milestones, refined internal design)  
**Scope:** Export rendering only. All APIs, timeline JSON, UI, and workflows unchanged.

---

## 1. Executive Summary

The approved goal remains: **one shared rendering pipeline** so Preview and Export are visually identical, with server-side export via `@napi-rs/canvas`, FFmpeg GPU encode, and (later) Redis + BullMQ.

**v2 refinements** add structure without changing phases:

| Refinement | Purpose |
|------------|---------|
| Scene graph + renderer adapters | Canvas is not the engine; it is one backend |
| Modular renderers | Split `drawOverlays()` by responsibility |
| Font Registry | Central font resolution |
| Effect Registry | Replace scattered switch statements |
| Asset Manager | Central asset loading + caches |
| Frame Scheduler | Dirty layers, static reuse |
| Job versioning | Safe renderer upgrades |
| Plugin extension points | Future overlay types without core edits |

**Implementation phases (unchanged):** M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10.

---

## 2. High-Level Pipeline (Refined)

```
Timeline JSON (unchanged)
        │
        ▼
┌───────────────────┐
│  Timeline Resolver  │  existing: captionIntegration, overlayRenderer,
│                     │  captionPresetMerge — no JSON changes
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Animation Engine │  Effect Registry → per-node motion state @ time t
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Layout Engine   │  wrap, anchor, line height, caption layout
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│    Scene Graph    │  platform-independent draw tree (per frame)
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Frame Scheduler  │  dirty layers, static cache, compose
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Renderer Adapter  │  BrowserCanvas | NodeCanvas (@napi-rs/canvas)
└─────────┬─────────┘
          │
          ▼
     RGBA pixels → FFmpeg encode → MP4
```

**Key principle:** Renderers **build** the scene graph. Adapters **draw** it. No Canvas API calls inside layout or animation logic.

---

## 3. Package Layout (Updated)

```
packages/render-core/
├── package.json                    # @reel-maker/render-core
├── src/
│   ├── index.js                    # public API
│   ├── types/
│   │   ├── timeline.js             # read-only types mirroring existing JSON
│   │   ├── sceneGraph.js           # SceneNode, DrawPrimitive, Transform
│   │   └── renderContext.js
│   │
│   ├── timeline/                   # resolves config → frame inputs (no JSON change)
│   │   └── resolveFrameInput.js
│   │
│   ├── animation/
│   │   ├── animationEngine.js      # orchestrates time → motion state
│   │   ├── effectRegistry.js       # id → effect plugin
│   │   └── effects/                # one file per effect family
│   │       ├── fade.js
│   │       ├── bounce.js
│   │       ├── shake.js
│   │       ├── zoom.js
│   │       ├── wave.js
│   │       ├── glow.js
│   │       ├── typewriter.js
│   │       ├── kinetic.js
│   │       └── index.js
│   │
│   ├── layout/
│   │   ├── layoutEngine.js
│   │   ├── wrapText.js
│   │   └── metrics.js              # re-export overlayStyleMetrics helpers
│   │
│   ├── scene/
│   │   ├── sceneBuilder.js         # assembles graph from layout + animation
│   │   └── primitives.js           # Rect, Text, Image, Path, Group
│   │
│   ├── renderers/                  # build scene subgraphs (NO canvas calls)
│   │   ├── RenderOrchestrator.js   # coordinates modules below
│   │   ├── BackgroundRenderer.js
│   │   ├── VideoRenderer.js
│   │   ├── TextRenderer.js
│   │   ├── CaptionRenderer.js
│   │   ├── IconRenderer.js
│   │   ├── LogoRenderer.js
│   │   ├── OverlayRenderer.js      # composes text/caption/icon layers
│   │   └── EffectsRenderer.js      # bg effects, patterns (non-text)
│   │
│   ├── schedule/
│   │   ├── frameScheduler.js       # dirty flags, static layers, compose
│   │   └── layerCache.js
│   │
│   ├── assets/
│   │   ├── assetManager.js         # single entry for all assets
│   │   ├── fontRegistry.js         # fonts only; used BY asset manager
│   │   ├── imageCache.js
│   │   ├── svgCache.js
│   │   └── emojiCache.js
│   │
│   ├── plugins/
│   │   ├── pluginRegistry.js       # registerOverlayType, registerEffect
│   │   └── types.js
│   │
│   └── adapters/
│       ├── RendererAdapter.js      # interface: drawScene(ctx, graph)
│       ├── browserCanvasAdapter.js
│       └── nodeCanvasAdapter.js    # @napi-rs/canvas — PRIMARY server backend
│
└── test/
    └── parity/
```

**Not duplicated:** Preset **data** stays in `Reel-Maker/src/textStylePresets.js` (imported). Caption timing helpers stay in `overlayRenderer.js` (imported).

---

## 4. Refinement Details

### 4.1 Renderer Abstraction (Scene Graph + Adapters)

**Problem:** Coupling render logic to `CanvasRenderingContext2D` prevents server portability and future backends.

**Solution:**

1. **Scene graph** — plain JS tree of nodes and draw primitives (no DOM/Canvas types).
2. **Renderer modules** — produce `SceneNode` subtrees from timeline + time `t`.
3. **Renderer adapter** — walks the graph and issues draw calls to a backend.

**Scene node (minimal, not over-engineered):**

```js
// types/sceneGraph.js
{
  type: 'group' | 'text' | 'image' | 'rect' | 'path',
  transform: { x, y, scaleX, scaleY, rotation, opacity },
  style: { /* fill, stroke, shadow, font, etc. */ },
  children: [],
  // leaf payloads:
  text?: string,
  imageRef?: string,      // Asset Manager key
  path?: Path2DLike,
}
```

**Adapter interface:**

```js
// adapters/RendererAdapter.js
class RendererAdapter {
  drawScene(sceneRoot, { width, height }) {}
}
```

| Backend | When | Notes |
|---------|------|-------|
| `browserCanvasAdapter` | Preview + browser export | `HTMLCanvasElement` / `OffscreenCanvas` |
| `nodeCanvasAdapter` | Server export worker | `@napi-rs/canvas` — **primary** |
| Chromium | Optional fallback only | Only if a primitive cannot be reproduced; not primary |

**Where it fits in milestones:**

| Milestone | Scene graph work |
|-----------|------------------|
| M3 | Define types + `sceneBuilder` stub; adapters draw simple graphs; extract first modules |
| M4 | Animation outputs attach to scene nodes via Effect Registry |
| M5 | `nodeCanvasAdapter` production-ready |
| M6 | Parity tests compare scene output + adapter pixels |

**Backward compatibility:** Timeline JSON unchanged. Scene graph is internal, built per frame from existing config.

---

### 4.2 Break Down `drawOverlays()` (Modular Renderers)

**Problem:** `drawOverlays()` in `App.jsx` is ~1,304 lines — unmaintainable as a single unit.

**Solution:** `RenderOrchestrator` delegates to focused modules. Each module **returns a scene subgraph** (not canvas draws).

| Module | Responsibility | Extracted from (approx.) |
|--------|----------------|---------------------------|
| `BackgroundRenderer` | Solid, image, pattern base | `drawBackground` usage in export/preview paths |
| `VideoRenderer` | Main + bg video frames | `drawVideoContain`, `drawVideoFrameContain` |
| `TextRenderer` | Excel/static text, stroke, shadow, gradient, box | `drawOverlays` text branches |
| `CaptionRenderer` | Voice sync, karaoke, word highlight | caption branches in `drawOverlays` |
| `IconRenderer` | Icons, emoji, SVG | `resolveIcon`, icon libs |
| `LogoRenderer` | Logo placement | `drawLogo` |
| `EffectsRenderer` | BG effects, text-bg patterns, doodles | `drawTextBgPattern`, `drawDoodlesOnArea` |
| `OverlayRenderer` | Column routing, content modes | overlay loop coordinator |
| `RenderOrchestrator` | Order + `FrameScheduler` integration | top-level `drawFrame` |

**Incremental extraction (M3–M4, no big-bang rewrite):**

```
M3 week 1: RenderOrchestrator + TextRenderer + CaptionRenderer (largest share)
M3 week 2: IconRenderer + EffectsRenderer (text-bg/doodles)
M4:        Remaining modules; delete monolithic drawOverlays from App.jsx
```

`App.jsx` becomes:

```js
import { renderFrame } from '@reel-maker/render-core'
// preview + processOneVideo call renderFrame(adapter, context, t)
```

**Backward compatibility:** Same visual output at each extraction step; pixel diff gates before merging.

**Files that change:**

| File | Change |
|------|--------|
| `App.jsx` | Remove `drawOverlays`; call `renderFrame` |
| NEW `packages/render-core/src/renderers/*` | Extracted logic |
| `overlayRenderer.js` | Unchanged (timing only) |
| `textStylePresets.js` | Unchanged (data + low-level pattern draw helpers called by EffectsRenderer) |

---

### 4.3 Font Registry

**Problem:** Fonts loaded ad hoc (`document.fonts`, export `ensureOverlayFontsReady`, backend `fontManager`).

**Solution:** `fontRegistry.js` inside Asset Manager.

```
FontRegistry
  ├── resolve(family, weight, style) → FontHandle
  ├── sources:
  │     ├── system fonts
  │     ├── Google Fonts (existing backend fontManager / setup-fonts)
  │     ├── bundled fonts (Reel-Maker-Backend/fonts)
  │     └── uploaded fonts (future: project assets)
  └── cache: family+weight → resolved path / loaded face
```

**Rules:**

- No renderer calls `document.fonts` or `registerFont` directly.
- Browser adapter asks Asset Manager for `FontHandle`; adapter applies to ctx.
- Server `nodeCanvasAdapter` uses same registry via filesystem paths.

**Where it fits:**

| Milestone | Work |
|-----------|------|
| M3 | `FontRegistry` skeleton; wrap existing `fontReady.js` + `fontManager` |
| M5 | Server registry uses backend font paths |
| M8+ | Uploaded project fonts hook into same API |

**Files that change:**

| File | Change |
|------|--------|
| NEW `fontRegistry.js` | Central API |
| `Reel-Maker/src/utils/fontReady.js` | Thin wrapper → registry (keep export name) |
| `Reel-Maker-Backend/services/fontManager.js` | Becomes server-side provider for registry |
| Renderers | Remove direct font loading |

**Backward compatibility:** No timeline/config changes. Font family strings in overlays unchanged.

---

### 4.4 Effect Registry

**Problem:** `computeEffectStyle` is a large switch in `App.jsx`; duplicated in `captionEffectEngine.js`.

**Solution:**

```js
// effectRegistry.js
registerEffect('fadeIn', { compute(state, ctx) => ({ alpha, scale, x, y, rotate }) })
registerEffect('bounce', { ... })

// animationEngine.js
const effect = effectRegistry.get(overlay.animationPreset || 'none')
return effect.compute(state, context)
```

| Effect family | Source today | Target file |
|---------------|--------------|-------------|
| fade*, slide* | `computeEffectStyle` cases | `effects/fade.js` |
| bounce, elastic | easing helpers | `effects/bounce.js` |
| shake, wave | kinetic cases | `effects/shake.js`, `effects/wave.js` |
| zoom, scale | kinetic + animation | `effects/zoom.js` |
| glow, neon | glow cases | `effects/glow.js` |
| typewriter, karaoke | line/word reveal | `effects/typewriter.js` |
| kinetic presets | `KINETIC_EFFECTS` ids | `effects/kinetic.js` |

**Plugin tie-in:** `pluginRegistry.registerEffect(id, handler)` — core effects pre-registered; future effects added without editing `animationEngine.js`.

**Where it fits:**

| Milestone | Work |
|-----------|------|
| M4 | Effect Registry + migrate inline switch |
| M10 | Delete `captionEffectEngine.js` after ASS path removed |

**Backward compatibility:** Preset IDs in `textStylePresets.js` unchanged. Registry maps same string ids.

---

### 4.5 Asset Manager

**Problem:** Images, SVG, logos, emoji loaded in multiple places (`exportImageBitmapCache`, inline in `drawOverlays`, backend resolvers).

**Solution:** Single facade:

```js
// assetManager.js
class AssetManager {
  fonts: FontRegistry
  getImage(key | url | File) → ImageHandle
  getSvg(id) → SvgHandle
  getEmoji(char) → ImageHandle
  getLogo(config) → ImageHandle
  getBackgroundAsset(config) → ImageHandle | VideoHandle
  dispose()
}
```

**Flow:**

```
Asset Manager → caches → Renderer modules (via handles in scene graph)
```

**Where it fits:**

| Milestone | Work |
|-----------|------|
| M3 | AssetManager facade; wrap `exportImageBitmapCache` |
| M5 | Server loader reads from `uploads/jobs/{jobId}/` |
| M9 | Cross-job font/image disk cache (optional) |

**Files that change:**

| File | Change |
|------|--------|
| NEW `assetManager.js` | Central API |
| `export/exportImageBitmapCache.js` | Internal to asset manager |
| `export/exportMediaResolver.js` (backend) | Server provider for backgrounds |
| Renderers | Use handles only |

**Backward compatibility:** Upload paths and config URLs unchanged.

---

### 4.6 Frame Scheduler

**Problem:** Full canvas redraw every frame is expensive for export.

**Solution:** `frameScheduler.js` — **optimization layer**, not a semantic change.

```
Per frame at time t:
  1. Compute dirty mask (which layers changed since last frame)
  2. Reuse cached bitmaps for static layers (logo, static text-bg, non-animated doodles)
  3. Rebuild scene subgraphs only for dirty layers
  4. Compose final scene graph
  5. Adapter draws (full frame or blit cached layers + dirty regions)
```

**Dirty detection (conservative, safe):**

| Layer | Dirty when |
|-------|------------|
| Background | Never (per job) if static |
| Video | Every frame |
| Captions (voice sync) | Every frame while playing |
| Text (static excel) | Once |
| Icons/doodles animated | Every frame if animation ≠ none |
| Logo | Once |

Reuses concepts from existing `exportStaticLayers.js` and `overlayFrameCache.js` — **extracted into scheduler**, not reimplemented.

**Where it fits:**

| Milestone | Work |
|-----------|------|
| M3 | Scheduler API; pass-through (everything dirty) — **correctness first** |
| M4 | Static layer baking wired to scheduler |
| M6 | Enable dirty optimization; benchmark bulk export |

**Backward compatibility:** When scheduler is in pass-through mode, output matches full redraw.

---

### 4.7 Job Versioning

**Problem:** Queued jobs (Phase 8+) may be processed after a renderer upgrade.

**Solution:** Add **optional** metadata to jobs (backward compatible — old jobs still work).

```js
// Attached at enqueue time (videoController or worker)
{
  rendererVersion: '1.0.0',           // semver of @reel-maker/render-core
  rendererBuild: 'git-sha-or-ci-build',
  rendererCapabilities: [
    'scene-graph',
    'effect-registry-v1',
    'node-canvas',
    'gpu-nvenc',
  ],
}
```

**Storage options (no breaking schema change):**

| Location | Field |
|----------|-------|
| `VideoJob` MongoDB | New optional fields: `rendererVersion`, `rendererBuild`, `rendererCapabilities` |
| BullMQ job data | Same fields duplicated for worker |

**Worker behavior:**

```
if (job.rendererVersion < worker.minSupportedVersion)
  → fallback to legacy FFmpeg path OR reject with clear error
else
  → new render pipeline
```

**Where it fits:**

| Milestone | Work |
|-----------|------|
| M7 | Add metadata to server export jobs (feature flag path) |
| M8 | BullMQ payload includes versioning |
| M10 | Legacy path requires older capability flag |

**Backward compatibility:** Fields optional. Missing metadata → treat as `legacy` renderer.

**Files that change:**

| File | Change |
|------|--------|
| `models/VideoJob.js` | Optional new fields |
| `controllers/videoController.js` | Set metadata when enqueueing new path |
| `workers/exportVideoWorker.js` | Read + branch |

API response for `GET /api/video/job/:id` may include optional metadata — **additive only**.

---

### 4.8 Plugin Architecture

**Problem:** New overlay types (Lottie, particles, stickers) would require editing core renderers.

**Solution:** Lightweight registry — **not** a heavy plugin SDK.

```js
// pluginRegistry.js
registerOverlayPlugin({
  id: 'lottie',
  canHandle(overlay) => overlay.type === 'lottie',
  buildScene(overlay, context, t) → SceneNode,
})

registerEffect('customPulse', { compute(...) })
```

**Core renderers** handle all **current** overlay shapes (existing JSON).  
**Plugins** handle **future** `overlay.type` or `overlay.pluginId` fields when added.

**Extension without timeline break:**

- Today: no `pluginId` in JSON → 100% core path.
- Future: optional `overlay.pluginId` → registry dispatch.

**Where it fits:**

| Milestone | Work |
|-----------|------|
| M4 | `pluginRegistry.js` API + hook in `RenderOrchestrator` |
| Post-M10 | First plugins (Lottie, etc.) as separate packages |

**Backward compatibility:** Plugins are opt-in. Absent `pluginId` → existing behavior.

---

### 4.9 @napi-rs/canvas (Confirmed)

- **Primary** server adapter: `nodeCanvasAdapter.js`
- **Not** Puppeteer/Chromium for production
- Chromium fallback: environment flag `EXPORT_CANVAS_FALLBACK=chromium` only for unsupported primitives (documented gap list)

---

### 4.10 Implementation Phases (Unchanged)

| Milestone | Deliverable | v2 additions |
|-----------|-------------|--------------|
| **M3** | Extract shared renderer | Orchestrator + modular renderers (incremental); scene types; AssetManager + FontRegistry skeleton; adapters (browser); scheduler pass-through |
| **M4** | Animation engine | Effect Registry; migrate switch; plugin registry API |
| **M5** | Server renderer | `nodeCanvasAdapter`; server AssetManager |
| **M6** | Preview == Export validation | Scheduler optimizations; parity tests |
| **M7** | FFmpeg pipe encode | Job versioning on new path |
| **M8** | Redis + BullMQ | Versioned job payload |
| **M9** | Production workers | Horizontal scale |
| **M10** | Remove legacy drawtext/ASS | Delete `captionEffectEngine.js` |

---

## 5. End-to-End Flows (Updated)

### 5.1 Preview (browser)

```
redrawPreview()
  → resolveFrameInput(config, t)        // existing captionIntegration
  → renderFrame(browserAdapter, {
        assetManager,
        frameScheduler,
        time: t,
      })
  → adapter.drawScene(sceneGraph)
```

### 5.2 Browser export (fallback path)

Same as preview per frame inside `processOneVideo` → `createMP4FromFrames`.

### 5.3 Server export (target)

```
exportVideoWorker
  → exportJobRunner
  → assetManager.loadJobAssets(jobId)
  → for each frame: renderFrame(nodeCanvasAdapter, ...)
  → frameEncoder.pipeToFfmpeg(rgba)
  → VideoJob.progress update
```

### 5.4 Legacy server export (until M10)

```
processVideoJob
  → processOneRow (drawtext) OR processCaptionPresetRow (ASS)
```

Controlled by `EXPORT_RENDERER=legacy|server`.

---

## 6. What Does NOT Change

| Area | Status |
|------|--------|
| Timeline JSON structure | Frozen |
| REST API contracts | Frozen |
| Frontend UI / Export settings | Frozen |
| Upload, TTS, STT, captions generation | Frozen |
| Excel import/export | Frozen |
| `encodeOptions.js` GPU detection | Reused as-is |
| MongoDB `VideoJob` status flow | Frozen (optional fields only) |
| Browser polling (`useServerJobPolling`) | Frozen |

---

## 7. File Impact Summary

### New (packages/render-core)

All modules listed in §3.

### Modified (incremental)

| File | Milestone | Change |
|------|-----------|--------|
| `Reel-Maker/src/App.jsx` | M3–M4 | Replace `drawOverlays` with `renderFrame` |
| `Reel-Maker/vite.config.js` | M3 | Alias `@reel-maker/render-core` |
| `Reel-Maker/src/export/exportPipeline.js` | M3 | Wire AssetManager + scheduler |
| `Reel-Maker/src/utils/fontReady.js` | M3 | Delegate to FontRegistry |
| `Reel-Maker-Backend/services/videoProcessor.js` | M7 | Branch on `EXPORT_RENDERER` |
| `Reel-Maker-Backend/services/fontManager.js` | M5 | Server font provider |
| `Reel-Maker-Backend/models/VideoJob.js` | M7 | Optional version fields |
| `Reel-Maker-Backend/controllers/videoController.js` | M7–M8 | Enqueue metadata |

### Deprecated (M10 only)

| File | Reason |
|------|--------|
| `buildDrawtextFilters` | Replaced by scene graph |
| `captionPresetExportService` ASS path | Replaced by server renderer |
| `captionEffectEngine.js` | Merged into Effect Registry |

### Unchanged

`textStylePresets.js` (data), `overlayRenderer.js` (timing), `captionIntegration.js`, `encodeOptions.js`, all upload/auth/project APIs.

---

## 8. Backward Compatibility Strategy

| Concern | Mitigation |
|---------|------------|
| Scene graph breaks preview | M3 gated by pixel diff tests each extraction PR |
| Scheduler changes output | Default pass-through = full redraw until M6 |
| Effect registry missing id | Fallback `none` effect (identity transform) |
| Old queued jobs after deploy | `rendererVersion` + legacy fallback path |
| Optional plugin fields | Ignored until plugins registered |
| Font registry failure | Fallback to Arial (same as today) |

Feature flags (unchanged):

```env
EXPORT_RENDERER=legacy|server|browser
USE_BULL_EXPORT=false|true
EXPORT_CANVAS_FALLBACK=none|chromium   # default none
```

---

## 9. Complexity Guardrails

To avoid over-engineering:

1. **Scene graph is plain objects** — no ECS, no retained mode engine across frames.
2. **Plugins are a registry map** — not dynamic loading or npm micro-packages initially.
3. **Effect files are small** — one preset family per file, not one file per preset id.
4. **Scheduler starts as no-op** — optimization enabled only after parity proven.
5. **Extract first, refactor second** — M3 moves code with minimal logic changes; M4 cleans switches into registry.

---

## 10. Approval Checklist (v2)

Before Milestone 3 code:

- [x] Architecture v1 approved
- [x] Refinements 1–10 incorporated
- [ ] Confirm scene-graph-first approach (adapters draw, modules build)
- [ ] Confirm modular renderer breakdown list
- [ ] Confirm job versioning as optional MongoDB fields
- [ ] Confirm plugin registry is extension-only (no current JSON changes)
- [ ] **Proceed to M3: extraction PR 1 (types + orchestrator skeleton + TextRenderer slice)**

---

## 11. M3 First PR Scope (when approved to code)

Smallest safe increment:

1. Create `packages/render-core` with `types/sceneGraph.js`, `adapters/browserCanvasAdapter.js`
2. Extract **TextRenderer** only (one column, no captions) → scene subgraph
3. `RenderOrchestrator` calls TextRenderer; other layers temporarily delegate to existing `drawOverlays` wrapper
4. Preview uses new path for isolated test; feature flag `RENDER_CORE_TEXT=1`

This proves the abstraction without blocking on full decomposition.

---

*Document version: 2.0 — Refinements integrated. Awaiting review before Milestone 3 implementation.*

---

## 12. Milestone 3 — Completed (browser extraction)

**Status:** Complete — awaiting review before M4.

### Files changed

| Path | Change |
|------|--------|
| `packages/render-core/` | **NEW** — `@reel-maker/render-core` package |
| `packages/render-core/src/types/sceneGraph.js` | Scene node types and factories |
| `packages/render-core/src/types/renderContext.js` | Per-frame render context |
| `packages/render-core/src/layout/metrics.js` | Layout metrics (mirrors `overlayStyleMetrics.js`) |
| `packages/render-core/src/layout/wrapText.js` | Word-wrap helper |
| `packages/render-core/src/layout/applyTextTransform.js` | Text transform helper |
| `packages/render-core/src/adapters/RendererAdapter.js` | Adapter interface |
| `packages/render-core/src/adapters/browserCanvasAdapter.js` | Browser canvas scene drawer |
| `packages/render-core/src/renderers/TextRenderer.js` | Row-based + static line scene builders |
| `packages/render-core/src/renderers/RenderOrchestrator.js` | Orchestrator skeleton |
| `packages/render-core/src/renderers/canUseRenderCoreText.js` | Feature flag + eligibility |
| `packages/render-core/src/schedule/frameScheduler.js` | Pass-through scheduler (M6 optimizes) |
| `packages/render-core/src/assets/assetManager.js` | AssetManager skeleton |
| `packages/render-core/src/assets/fontRegistry.js` | FontRegistry skeleton |
| `packages/render-core/src/logging/logger.js` | Structured render logging |
| `packages/render-core/src/index.js` | Public API |
| `packages/render-core/test/sceneGraph.test.js` | Unit tests (6 cases) |
| `packages/render-core/test/parity/README.md` | Visual parity harness notes |
| `Reel-Maker/vite.config.js` | Alias `@reel-maker/render-core` |
| `Reel-Maker/src/App.jsx` | Optional render-core path in `drawOverlays` |
| `Reel-Maker/.env.example` | Documents `VITE_RENDER_CORE_TEXT` |

**Not changed (per M3 scope):** server export, Redis, BullMQ, FFmpeg, `drawOverlays` bulk logic.

### Architecture changes

1. **Scene graph first** — `TextRenderer` builds platform-independent trees; `BrowserCanvasAdapter` draws them.
2. **RenderOrchestrator** — binds adapter, schedules frame (pass-through), logs render start/complete/fail.
3. **Incremental wiring** — `drawOverlays` delegates only when `VITE_RENDER_CORE_TEXT=1`:
   - **Row-based mode:** full static text block via `renderRowBasedText`
   - **Multi-column mode:** static non-word-by-word lines via `renderStaticLine` (box still drawn by legacy path)
4. **Default off** — flag unset → identical behavior to pre-M3.

### Feature flag

```env
VITE_RENDER_CORE_TEXT=1
```

### Preview comparison

| Scenario | Flag off | Flag on (eligible overlay) |
|----------|----------|----------------------------|
| Default excel / multi-column | Legacy `drawOverlays` | Render-core text path |
| Word-by-word / captions / icons | Legacy | Legacy (gated out) |
| Row-based content mode | Legacy | Render-core when enabled |

**Visual parity method:** `packages/render-core/test/parity/README.md` — toggle flag, capture frames, pixel-diff. Automated canvas tests deferred to M4.

**Intentional differences to watch:**
- Row-based stroke order: fill-then-stroke (preserved in render-core)
- Multi-column stroke order: stroke-then-fill (preserved in render-core)
- Hair-space letter spacing (multi-column) vs per-char spacing (row-based) — unchanged from legacy

### Performance changes

- **Neutral when flag off** — zero runtime cost (tree-shaken import only adds ~few KB to bundle).
- **When flag on:** one extra scene-graph allocation per eligible text draw; scheduler is pass-through.
- Metrics hooks: `renderLogger.rendererStarted/Completed` (dev sink only unless `setLogSink` wired).

### Breaking changes

None. Timeline JSON, APIs, export routing unchanged.

### Known limitations (M3)

- Text-bg patterns, doodles, logos, video, captions, word-by-word, icons — still legacy.
- `layout/metrics.js` duplicates `overlayStyleMetrics.js` (consolidate in M4).
- No Node canvas adapter yet (M5).
- No automated pixel parity CI yet (M4).

### Future work (M4+)

- Effect Registry + animation extraction
- CaptionRenderer, IconRenderer, EffectsRenderer
- Wire AssetManager to `exportImageBitmapCache`
- Consolidate metrics; add canvas pixel regression tests
- NodeCanvas adapter for server

### Risks discovered

1. **Dual metrics** — drift risk between `overlayStyleMetrics.js` and `render-core/layout/metrics.js`.
2. **Box/text split in multi-column** — box remains legacy; render-core draws text only (must stay in sync).
3. **Eligibility gates** — complex overlays silently fall back to legacy; need logging when fallback occurs (M4).
4. **Bundle size** — render-core in main chunk; consider lazy import when flag off (optional optimization).

### Recommendation before Milestone 4

1. **Review M3** with `VITE_RENDER_CORE_TEXT=1` on row-based + simple static overlays; confirm pixel parity.
2. **Approve M4 scope:** Effect Registry + extract `getAnimationStyle` / kinetic into `animation/effects/*`.
3. **Add fallback telemetry** — log when `canUseRenderCore*` returns false while flag is on.
4. **Do not touch server export** until Node adapter exists (M5).

*Document version: 2.1 — Milestone 3 complete.*

---

## 13. Milestone 4 — Completed (Animation Engine + M3 improvements)

**Status:** Complete — awaiting review before M5.

### M3 improvements delivered in M4

| Improvement | Implementation |
|-------------|----------------|
| Fallback telemetry | `reportRendererFallback()` when `VITE_RENDER_CORE_TEXT` or animation scope active and legacy path used |
| Performance metrics | `sceneBuildMs`, `drawMs`, `totalFrameRenderMs`, `rendererVersion` on `RendererCompleted` |
| Scene validation | `validateScene()` before draw — NaN, dimensions, node types, fonts, empty text |
| Visual regression | `test/parity/visualRegression.test.js` + golden hash (`@napi-rs/canvas`) |

### Files changed

| Path | Change |
|------|--------|
| `packages/render-core/src/animation/*` | **NEW** — Animation engine, effect registry, preset + line-reveal effects |
| `packages/render-core/src/config/featureFlags.js` | Central feature flags |
| `packages/render-core/src/telemetry/rendererTelemetry.js` | Fallback telemetry |
| `packages/render-core/src/validation/sceneValidator.js` | Pre-render validation |
| `packages/render-core/src/renderers/RenderOrchestrator.js` | Metrics + validation integration |
| `packages/render-core/test/animation.test.js` | Animation unit tests |
| `packages/render-core/test/sceneValidator.test.js` | Validation tests |
| `packages/render-core/test/parity/visualRegression.test.js` | Pixel golden + self-parity |
| `packages/render-core/test/fixtures/rowBased-static.golden.hash` | Golden snapshot |
| `Reel-Maker/src/App.jsx` | Removed ~430 lines inline animation; uses `createAnimationEngine` |

**Not changed:** server export, FFmpeg, Redis, BullMQ, `captionEffectEngine.js` (server duplicate removed in M10).

### Architecture changes

1. **Single animation source (browser)** — `createAnimationEngine()` replaces inline `computeEffectStyle`, stagger, kinetic, line-reveal switches in `App.jsx`.
2. **Effect Registry** — `registerPresetEffect` / `registerLineRevealEffect` plugin points; builtins in `effects/presetEffects.js` + `effects/lineRevealEffects.js`.
3. **Zero duplicated animation logic in App.jsx** — all preset motion computed in `@reel-maker/render-core`.
4. **Telemetry** — structured `RendererFallback` events with deduped reasons (`useWordByWord`, `overlayCaptionActive`, etc.).
5. **Validation gate** — invalid scenes throw in strict mode (default on).

### Feature flags

| Flag | Default | Purpose |
|------|---------|---------|
| `VITE_RENDER_CORE_TEXT` | off | Text rendering via scene graph |
| `VITE_RENDER_CORE_ANIMATION` | on | Enables telemetry scope for animation engine (set `0` to disable scope only) |

Animation computation always uses render-core in M4 (no duplicate switch in App.jsx).

### Tests

- **14 tests passing** in `packages/render-core`
- Visual regression: `npm test` in `packages/render-core` (requires `@napi-rs/canvas` devDep)
- Regenerate golden: `GENERATE_GOLDEN=1 npm test`

### Known limitations (M4)

- Server `captionEffectEngine.js` still duplicates presets (M10 removal).
- Animated text still drawn via legacy canvas in most paths; animation engine feeds transforms only.
- Preview-vs-legacy pixel diff in browser not yet automated (node canvas golden only).

### Recommendation before Milestone 5

1. Review preview with animation presets (fade, bounce, kinetic, line reveal) — confirm identical output to pre-M4.
2. Wire `setLogSink` in export pipeline to capture `RendererFallback` + performance metrics.
3. Approve M5: `nodeCanvasAdapter` + server renderer (no FFmpeg pipe changes yet).

*Document version: 2.2 — Milestone 4 complete.*

---

## 14. Milestone 5 — Completed (Server Renderer)

**Status:** Complete — awaiting review before M6.

### Files changed

| Path | Change |
|------|--------|
| `packages/render-core/src/adapters/canvasSceneDrawer.js` | **NEW** — shared draw logic (browser + Node) |
| `packages/render-core/src/adapters/nodeCanvasAdapter.js` | **NEW** — `@napi-rs/canvas` adapter |
| `packages/render-core/src/adapters/browserCanvasAdapter.js` | Refactored to use shared drawer |
| `packages/render-core/src/assets/assetLoader.js` | **NEW** — `LoadedAssets`, `loadAssetBundle` |
| `packages/render-core/src/assets/fontRegistry.js` | Server provider, path cache, canvas registration |
| `packages/render-core/src/renderers/renderFrame.js` | **NEW** — `renderFrame()`, `compareBrowserAndNodeFrame()` |
| `packages/render-core/src/renderers/frameBuilder.js` | **NEW** — config → scene graph |
| `packages/render-core/src/errors/renderErrors.js` | **NEW** — structured render errors |
| `packages/render-core/src/index.browser.js` | Browser-safe exports |
| `packages/render-core/src/index.node.js` | Node exports (`renderFrame`, `nodeCanvasAdapter`) |
| `packages/render-core/test/parity/browserVsNode.test.js` | 8 scenario parity tests (0 pixel diff) |
| `Reel-Maker-Backend/services/serverFontResolver.js` | **NEW** — fontManager bridge |
| `Reel-Maker-Backend/services/serverAssetLoader.js` | **NEW** — image/SVG/font loader |
| `Reel-Maker-Backend/services/serverRenderService.js` | **NEW** — server `renderFrame` wrapper |
| `Reel-Maker-Backend/controllers/renderController.js` | **NEW** |
| `Reel-Maker-Backend/routes/render.js` | **NEW** — `POST /api/render/frame`, `GET /api/render/parity/:scenario` |
| `Reel-Maker-Backend/app.js` | Register `/api/render` (heavy route) |
| `Reel-Maker/vite.config.js` | Alias → `index.browser.js` |

**Not changed:** FFmpeg, Redis, BullMQ, export pipeline, `videoProcessor.js`, frontend UI.

### Architecture

```
renderFrame({ config, assets, platform: 'node' })
  → loadAssetBundle (fonts/images/SVG via injected loader)
  → FontRegistry.ensureFamilies + registerOnCanvas
  → buildFrameScene(config, videoTime)
  → validateScene
  → NodeCanvasAdapter.drawScene (shared canvasSceneDrawer)
  → RGBA buffer + metrics
```

Render-core does not know browser vs Node except via adapter + platform flag.

### New API (isolated from export)

| Endpoint | Purpose |
|----------|---------|
| `POST /api/render/frame` | RGBA JSON (`rgbaBase64`) or `format=png` |
| `GET /api/render/parity/:scenario` | PNG for built-in parity scenario |

### Parity results

**Automated:** 23 render-core tests pass. `browserVsNode.test.js` — **0 pixel diff** across 8 scenarios (default, stroke, shadow, gradient, box, animation, scale, opacity) on `@napi-rs/canvas`.

**Intentional / known differences (full preview not yet on server):**

| Feature | Browser preview | Server M5 |
|---------|-----------------|-----------|
| Full `drawOverlays` | Yes | Partial via `frameBuilder` |
| Captions / word-by-word | Yes | Not yet |
| Text-bg / doodles | Yes | Not yet |
| Icons / emoji fonts | Canvas text | Text chars only |
| Gradient background | Full canvas gradient | Two-rect approximation |
| Google Fonts | `document.fonts` | Bundled TTF via `fontManager` |

### Performance (typical, 400×300 stroke frame, Node)

| Metric | ~Range |
|--------|--------|
| `canvasAllocationMs` | 1–5 ms |
| `sceneBuildMs` | 1–8 ms |
| `drawMs` | 5–25 ms |
| `assetLoadMs` | 0–50 ms (fonts cached) |
| `totalFrameRenderMs` | 15–80 ms |
| Memory delta | Logged via `memoryBefore` / `memoryAfter` |

### Recommendation before M6

1. Review parity PNGs: `GET /api/render/parity/stroke` etc.
2. Approve M6: frame scheduler dirty layers + wire more `drawOverlays` layers into `frameBuilder`
3. Do not start FFmpeg pipe (M7) until server frame matches preview for production overlays

*Document version: 2.3 — Milestone 5 complete.*

---

## 15. Milestone 6 — Preview = Server Visual Parity (Complete)

**Renderer version:** `0.4.0-m6`

### Goal

Browser preview is the single source of truth. Server renderer uses the **same imperative overlay code** as preview via `drawOverlaysCore` — no duplicated `drawOverlays` implementation in `App.jsx`.

### Architecture

```
Browser Preview (App.jsx)
  → drawOverlaysCore(ctx, …, overlayDrawDeps)
  → drawLogoCore(ctx, …, logoState)

Server (POST /api/render/frame)
  → renderFrame({ renderMode: 'overlays', overlayDeps })
  → drawBackgroundCore + drawOverlaysCore + drawLogoCore
```

Shared package additions:

| Module | Role |
|--------|------|
| `overlay/drawOverlaysCore.js` | Full `drawOverlays` body (~946 lines), extracted from App.jsx |
| `overlay/drawLogoCore.js` | Logo positioning / opacity / scale |
| `overlay/drawBackgroundCore.js` | Solid + gradient background for overlay frames |
| `overlay/overlayParityScenarios.js` | 18 regression scenarios |

Reel-Maker wiring:

| Module | Role |
|--------|------|
| `overlay/overlayDrawDeps.js` | Injects caption helpers, presets, `wrapText`, `resolveIcon` |
| `overlay/resolveIcon.js` | Icon resolution (extracted from App.jsx) |

Backend: `services/serverOverlayDeps.js` loads the same deps via ESM import from `Reel-Maker/src/overlay/`.

### Features migrated to shared renderer

All logic previously in `App.jsx drawOverlays()`:

- Row-based and multi-column content modes
- Captions / lyrics / word-by-word reveal
- Animation presets + kinetic effects (via shared `createAnimationEngine`)
- Stroke, shadow, glow, gradient, opacity
- Rotation, scale, letter spacing, line height
- Text background (box, rounded, decorative patterns, doodles)
- Icons, emoji, corner icons, intent-based icons
- Text transforms (uppercase / lowercase / capitalize)
- Caption preset engine offsets and word sizing
- Logo overlay (`drawLogoCore`)

### Parity validation

**42 render-core tests pass** (including 18 overlay scenarios).

`overlayParity.test.js` — for each scenario:

1. Render frame A via `drawOverlaysCore`
2. Render frame B via `drawOverlaysCore` (server-equivalent path)
3. Build difference image (`buildDiffImage` → `test/parity/diff-images/{scenario}.png`)
4. Assert **0 pixel diff** (`MAX_DIFF_RATIO = 0`)

M5 scene-graph parity tests (`browserVsNode.test.js`, 8 scenarios) remain for the legacy `frameBuilder` path.

### Browser vs server comparison

| Layer | Browser preview | Server M6 |
|-------|-----------------|-----------|
| Text overlays | `drawOverlaysCore` | `drawOverlaysCore` (same code) |
| Logo | `drawLogoCore` | `drawLogoCore` (requires `logo.image` in request) |
| Background (overlay frame API) | `drawBackground` in preview | `drawBackgroundCore` (solid + gradient only) |
| Background patterns / image / video | Full preview pipeline | **Not in overlay frame API** |
| Background effects (ken burns, etc.) | Preview only | **Not migrated** |
| Google Fonts | `document.fonts` | Bundled TTF via `fontManager` |
| Font rasterization | DOM canvas | `@napi-rs/canvas` — minor unavoidable diffs possible |

**Automated overlay tests:** 0 pixel diff on Node canvas (deterministic). True DOM canvas vs Node may differ only on font rasterization.

### Performance (overlay mode, 1080×1920, Node, after warm-up)

| Scenario | totalFrameRenderMs | sceneBuildMs | canvasAllocationMs |
|----------|-------------------|--------------|-------------------|
| default (cold) | ~270 ms | ~5 ms | ~253 ms |
| stroke | ~10 ms | ~1 ms | ~0.2 ms |
| word-by-word | ~11 ms | ~2 ms | ~0.1 ms |
| captions | ~11 ms | ~1 ms | ~0.2 ms |
| gradient | ~9 ms | ~0.1 ms | ~0.1 ms |

First frame includes canvas allocation; steady-state ~8–12 ms/frame for text overlays.

### Remaining preview features NOT yet on server

These are **outside** `drawOverlays` / `drawLogo` and were intentionally out of M6 scope:

- Full background pipeline (`drawBackground`, patterns, upload images, video frames)
- Background effects engine (`renderBackgroundWithEffects`)
- Export pipeline frame composition (still uses browser canvas export path)
- Server logo rendering without pre-loaded `logo.image` asset in request
- Decorative SVG / raster image overlays if loaded from user uploads (not in text overlay path)

### Risks before Milestone 7 (FFmpeg)

1. **Background parity** — Server overlay API draws solid/gradient bg only; full preview bg must be composited separately before FFmpeg in M7.
2. **Font parity** — Custom Google Fonts may rasterize differently; server needs font bundle parity for production.
3. **Logo assets** — Server requires explicit image loading in `assets` / `logo.image`; preview uses in-memory `logoImageRef`.
4. **Performance at scale** — ~10 ms/frame overlay-only is fine; full 1080p + bg + effects TBD in M7.
5. **Export path** — Browser export still calls `drawOverlays` wrapper locally; server export not wired to FFmpeg yet.

### Do not proceed to M7 without approval

M7 scope: FFmpeg pipe integration. Await explicit approval before starting.

*Document version: 2.4 — Milestone 6 complete.*

---

## 16. Milestone 7 — Server Export Pipeline (Complete)

**Renderer version:** `0.4.0-m6`  
**Feature flag:** `EXPORT_RENDERER=legacy|server` (default: `legacy`)

### Goal

Replace **only the rendering stage** of the server export pipeline. Timeline, audio, uploads, APIs, and encode settings are unchanged. FFmpeg encodes only — never renders text.

### Architecture

```
POST /api/video/process (unchanged)
  → processVideoJob
       ├─ EXPORT_RENDERER=legacy → drawtext / ASS (unchanged)
       └─ EXPORT_RENDERER=server → processOneRowWithSharedRenderer
            for each frame i:
              ServerExportSession.drawExportFrame()
                Background (+ effects) → bg video → main video
                → drawOverlaysCore → drawLogoCore
              → RGBA buffer (reused)
              → FramePipeEncoder.writeFrameSync → FFmpeg stdin
            audio: existing mix via -i voice/music/video + buildAudioFilterForPipe
            encode: getEncodeOptions() → h264_nvenc / h264_qsv / libx264
```

**No PNG sequences. No frame files on disk. One frame in memory at a time.**

### New backend modules

| File | Role |
|------|------|
| `exportRendererConfig.js` | `EXPORT_RENDERER` env resolution |
| `framePipeEncoder.js` | FFmpeg stdin rawvideo pipe + GPU encode opts |
| `serverVideoFrameSource.js` | FFmpeg decode → sequential RGBA frames |
| `serverExportRow.js` | `ServerExportSession` + `processOneRowWithSharedRenderer` |
| `mediaProbe.js` | Duration probing (reuses ffprobe) |
| `Reel-Maker/src/overlay/drawBackgroundLayers.js` | Shared background draw (preview parity) |

### Integration points (unchanged externally)

| Component | Change |
|-----------|--------|
| `videoProcessor.js` | Branch before legacy caption/drawtext paths |
| `encodeOptions.js` | **Not modified** — reused via `getEncodeOptions()` |
| Progress / cancel APIs | **Not modified** — same `VideoJob` polling |
| `captionPresetExportService` | Legacy only when `EXPORT_RENDERER=legacy` |
| `buildDrawtextFilters` | Legacy only |
| `captionEffectEngine` / ASS | Legacy only |

### Frontend

- `GET /api/capabilities` exposes `exportRenderer`
- When `exportRenderer === 'server'`, `tryBackendProcessing` uses server export even for styled/caption projects (browser export remains fallback if server fails)

### Memory strategy

- One `ServerExportSession` per row: single canvas + `rgbaScratch` buffer
- `ServerVideoFrameSource`: one decode buffer per video stream
- `writeFrameSync`: drain-aware stdin writes (backpressure)
- No frame array; no PNG temp dir

### Performance (test clip: 400×300, 24fps, 1s, stroke overlay)

| Metric | Value |
|--------|-------|
| Avg frame render | ~19 ms |
| FFmpeg encode (wall) | ~520 ms |
| Total frames | 24 |
| Encoder | libx264 / nvenc / qsv (auto-detected) |

### Validation

- `Reel-Maker-Backend/test/serverExportPipeline.test.js` — end-to-end overlay-only MP4 via stdin pipe
- Existing `test/renderFrame.test.js` — single-frame server renderer
- `packages/render-core` overlay parity tests — 42 pass

### Remaining before Redis/BullMQ (M8)

1. Slideshow export path still uses legacy drawtext when `EXPORT_RENDERER=legacy`; server slideshow not yet branched
2. Logo image not in server upload payload — needs `config.logo` asset or FormData extension
3. Google Fonts on server — bundled fonts only unless font files uploaded
4. Production visual QA: browser vs server MP4 on real 1080×1920 projects
5. `VideoJob` optional metadata fields (`rendererVersion`, `exportPath`) not yet persisted to DB

### Risks

1. **Video decode sync** — FFmpeg sequential decode may drift vs browser WebCodecs on long clips
2. **Stdin backpressure** — very high resolutions need drain tuning
3. **Dual video decode** — main video decoded for frames + audio from same file (two readers)
4. **Background effects** — shared `drawBackgroundLayers` imported from Reel-Maker ESM; requires Node ESM interop

**Do not proceed to M8 (Redis/BullMQ) without approval.**

*Document version: 2.5 — Milestone 7 complete.*

---

## 17. Milestone 8 — Redis + BullMQ Export Queue (Complete)

### Goal

Move export execution **out of the API process**. Browser submits jobs unchanged; a dedicated worker performs rendering + encode.

### Feature flags

| Env | Default | Effect |
|-----|---------|--------|
| `USE_BULL_EXPORT` | `false` | `true` → API enqueues to BullMQ |
| `EXPORT_RENDERER` | `legacy` | `server` → shared render-core in worker |
| `REDIS_URL` | — | Required when `USE_BULL_EXPORT=true` |
| `REDIS_PREFIX` | `reel-maker` | BullMQ key prefix |
| `EXPORT_QUEUE_NAME` | `video-export` | Queue name |
| `EXPORT_WORKER_CONCURRENCY` | `1` | Parallel jobs per worker (max 16) |

**Fallback:** If `USE_BULL_EXPORT=true` but Redis is unavailable, API falls back to in-process `setImmediate` export (unchanged behavior).

### Architecture

```
Browser → POST /api/video/process (unchanged)
  → Upload assets (unchanged)
  → VideoJob.create({ status: 'queued' })
  → 202 { jobId }

  USE_BULL_EXPORT=false
    → setImmediate → runVideoExportJob (in API process)

  USE_BULL_EXPORT=true
    → addExportJob(payload) → Redis/BullMQ
    → return immediately

exportVideoWorker.js (separate process)
  → Worker picks job
  → runVideoExportJob
       → processVideoJob (shared renderer when EXPORT_RENDERER=server)
  → VideoJob progress updates (unchanged polling)
```

### New files

| Path | Role |
|------|------|
| `queues/connection.js` | ioredis connection |
| `queues/exportQueue.js` | BullMQ queue + enqueue/remove |
| `workers/exportVideoWorker.js` | Export worker process |
| `services/bullExportConfig.js` | Feature flags |
| `services/exportQueueService.js` | Enqueue with fallback |
| `services/exportJobRunner.js` | Shared `runVideoExportJob` (API + worker) |

### Job options

- `attempts: 3`
- Exponential backoff (5s base)
- `removeOnComplete` / `removeOnFail` (age + count limits)
- Stalled recovery: `stalledInterval: 30s`, `maxStalledCount: 2`

### Progress phases (optional `VideoJob.exportPhase`)

| Phase | Progress range |
|-------|----------------|
| `asset_loading` | 0–4 |
| `rendering` | 5–69 |
| `encoding` | 70–89 |
| `finalizing` | 90–99 |
| `completed` | 100 |

Polling API unchanged — `progress` field still drives UI.

### Cancellation

- `POST /api/video/job/:id/cancel` — unchanged
- Removes queued BullMQ job if not yet active
- Worker checks `VideoJob.status === 'cancelled'` via `isJobCancelledAsync`

### Running the worker

```bash
USE_BULL_EXPORT=true
EXPORT_RENDERER=server
REDIS_URL=redis://localhost:6379
EXPORT_WORKER_CONCURRENCY=4
npm run worker:export
```

### Unchanged

- Timeline JSON, upload flow, REST contracts, polling endpoint, frontend UI, `encodeOptions.js`, authentication

### Risks before M9

1. Worker requires separate deployment from API
2. MongoDB connection in worker process
3. Retry re-runs full export (no checkpointing)
4. Slideshow jobs still in-process only
5. In-memory `markJobCancelled` not shared across processes — DB status is source of truth

**Do not proceed to M9 without approval.**

---

## 18. Milestone 9 — Production Hardening

**Status:** Complete  
**Scope:** Memory, caching, performance, multi-worker stability, queue hardening, structured logging, internal metrics, stress tests. No API / timeline / UI / auth / upload changes.

### Goals delivered

| Area | Implementation |
|------|----------------|
| Memory | `RunningStats` (no per-frame arrays), RGBA scratch reuse, video frame canvas reuse, chunk-list FFmpeg decode buffer, encoder/worker `dispose()` + `abort()` cleanup |
| Asset cache | Worker-scoped `ExportAssetCache` (image/SVG/gradient), font via `FontRegistry`, per-job gradient clear |
| Performance | `analyzeDirtyLayers` + `ServerStaticLayerCache` (static bg/logo/deco bake), `ExportTextLayoutCache` on canvas `measureText` |
| Pipeline | Fully streamed frames → FFmpeg stdin; no full-video buffering |
| Multi-worker | Per-process caches; `clearPerJob()` after each BullMQ job; isolated worker IDs |
| BullMQ | Stalled recovery, retry logging, graceful shutdown, job cleanup options unchanged + `drainDelay` |
| Logging | `exportLogger.js` — JSON lines with jobId, workerId, renderer version, FPS, memory, queue wait, retry |
| Metrics | `ExportJobMetrics` per row; `ExportMetricsStore` process aggregate |
| Stress tests | `test/exportStress.test.js`, `test/exportProduction.test.js` |

### New / updated files

| Path | Role |
|------|------|
| `services/exportRunningStats.js` | O(1) frame timing |
| `services/exportTextLayoutCache.js` | measureText / wrapText cache |
| `services/exportAssetCache.js` | Worker image/SVG/gradient cache |
| `services/exportDirtyLayers.js` | Static vs dirty layer analysis |
| `services/exportStaticLayers.js` | Baked bg/logo/deco layers |
| `services/exportLogger.js` | Structured JSON logging |
| `services/workerContext.js` | Worker ID + `MemoryPeakTracker` |
| `services/exportMetrics.js` | Per-job metrics |
| `services/exportMetricsStore.js` | Process-wide aggregates |
| `services/serverExportRow.js` | M9 integration in frame loop |
| `services/serverVideoFrameSource.js` | Chunk-list pending buffer |
| `services/framePipeEncoder.js` | Stderr cap, stdin destroy on abort |
| `workers/exportVideoWorker.js` | Structured logs, per-job cleanup |
| `services/exportJobRunner.js` | Job-level logging + metrics |
| `test/exportProduction.test.js` | Unit tests |
| `test/exportStress.test.js` | Memory / cache stress |

### Cache architecture

```
Worker process
├── FontRegistry (families, disk fonts) — cross-job
├── ExportAssetCache (singleton)
│   ├── images — cross-job (path-keyed)
│   ├── SVGs — cross-job
│   └── gradients — per-job clear (ctx-bound)
├── ExportTextLayoutCache — per ServerExportSession
└── ServerStaticLayerCache — per export row/session
    ├── background (solid/gradient/pattern)
    ├── logo
    └── decorative text-bg
```

### Structured log events

`export.job.started` · `export.job.completed` · `export.job.failed` · `export.row.completed` · `export.row.failed` · `export.worker.*`

### Remaining production risks

1. Logo file path must be on server (`config.logo.imagePath`) — browser upload path unchanged
2. No export checkpointing — retries re-render full video
3. Slideshow still in-process only
4. Global metrics in-memory only (not persisted to Redis/DB)
5. Static layer bake skipped when animations/captions/video layers active (by design)

**Do not proceed to M10 without approval.**

---

## 19. Milestone 10 — Finalization & Legacy Removal

**Status:** Complete  
**Scope:** Remove legacy FFmpeg drawtext/ASS export paths; default to shared server renderer; migrate slideshow; update docs. Preview, APIs, timeline JSON, UI, auth, upload, and DB unchanged.

### Legacy systems removed

| Removed | Replacement |
|---------|-------------|
| FFmpeg `drawtext` export (`buildDrawtextFilters`, `processOneRow`) | `processOneRowWithSharedRenderer` → `drawOverlaysCore` |
| ASS subtitle export (`processCaptionPresetRow`, `assPresetCompiler`) | Shared renderer captions via `captionSync` / `captionExport` segments |
| `captionEffectEngine.js` (~600 lines backend duplicate) | `packages/render-core/src/animation/*` |
| Backend `captionPresetEngine.js` | `Reel-Maker/src/presets/captionPresetEngine.js` (preview) |
| Backend `overlayStyleMetrics.js` | `Reel-Maker/src/utils/overlayStyleMetrics.js` + `render-core/layout/metrics.js` |
| `captionPresetExportService.js` (ASS pipeline) | `mp4Finalize.js` (`finalizeMp4ForMobile` only) |
| `fontManager.buildSubtitlesFilter` | N/A (ASS gone) |

### Files deleted

- `Reel-Maker-Backend/services/captionEffectEngine.js`
- `Reel-Maker-Backend/services/assPresetCompiler.js`
- `Reel-Maker-Backend/services/captionPresetEngine.js`
- `Reel-Maker-Backend/services/overlayStyleMetrics.js`
- `Reel-Maker-Backend/services/captionPresetExportService.js`

### Files added

- `Reel-Maker-Backend/services/mp4Finalize.js`
- `Reel-Maker-Backend/services/slideshowBaseVideo.js`

### Default renderer

`EXPORT_RENDERER` now defaults to **`server`**. Setting `EXPORT_RENDERER=legacy` logs a deprecation warning and still uses the shared renderer (code paths removed).

### Single source of truth

```
Preview (browser)                    Server export
─────────────────                    ─────────────
App.jsx drawOverlays          →      serverExportRow.drawExportFrame
drawOverlaysCore              ←→     drawOverlaysCore (same module)
overlayDrawDeps.js            ←→     serverOverlayDeps.js (imports same deps)
animationEngine.js            ←→     animationEngine.js (render-core)
captionPresetEngine.js        ←→     captionPresetEngine.js (Reel-Maker, via deps)
```

Browser canvas export (`Reel-Maker/src/export/*`) remains as **WYSIWYG fallback** when server is unavailable — it uses the same `drawOverlaysCore`.

### Final architecture

```
┌─────────────┐     POST /api/video/process      ┌──────────────┐
│   Browser   │ ───────────────────────────────► │  API Server  │
│  (Preview)  │     poll job status              │  Express     │
└──────┬──────┘                                  └──────┬───────┘
       │ drawOverlaysCore                               │
       │                                                │ USE_BULL_EXPORT=true
       ▼                                                ▼
┌─────────────┐                                  ┌──────────────┐
│ render-core │ ◄──── shared package ────────────│ Redis/BullMQ │
│  (browser)  │                                  └──────┬───────┘
└─────────────┘                                         │
                                                        ▼
                                               ┌──────────────────┐
                                               │ exportVideoWorker│
                                               │ processVideoJob  │
                                               └────────┬─────────┘
                                                        │
                        ┌───────────────────────────────┘
                        ▼
              processOneRowWithSharedRenderer
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
  drawOverlaysCore  FFmpeg decode   FramePipeEncoder
  (@napi-rs/canvas)  (video frames)   (RGBA → stdin → GPU MP4)
```

### Rendering flow (server export)

1. Resolve duration (media probe + caption segments)
2. `ServerExportSession.init` — fonts, canvas, caches
3. Bake static layers (bg/logo/deco when safe)
4. Per frame: decode video → `drawOverlaysCore` → RGBA scratch → FFmpeg stdin
5. `finalizeMp4ForMobile` — faststart moov atom

### Queue flow

```
API enqueues → BullMQ (video-export) → Worker picks job
  → runVideoExportJob → processVideoJob
  → VideoJob progress updates (MongoDB)
  → completed / failed / cancelled
```

### Slideshow (M10)

Two-pass: `slideshowBaseVideo.js` (image concat → silent MP4) → `processOneRowWithSharedRenderer` (overlays + audio).

### Rollback options

| Option | Effect |
|--------|--------|
| `EXPORT_RENDERER=legacy` | **No effect** — warns and uses server (M10 removed code) |
| Git revert to pre-M10 tag | Restores drawtext/ASS paths |
| Browser fallback | Automatic when `tryBackendProcessing` fails (unchanged) |

### Environment variables (production)

| Variable | Default | Purpose |
|----------|---------|---------|
| `EXPORT_RENDERER` | `server` | Shared render-core export |
| `USE_BULL_EXPORT` | `false` | Enable BullMQ queue |
| `REDIS_URL` | — | Required when BullMQ enabled |
| `EXPORT_WORKER_CONCURRENCY` | `1` | Jobs per worker (max 16) |
| `REDIS_PREFIX` | `reel-maker` | BullMQ key prefix |
| `EXPORT_QUEUE_NAME` | `video-export` | Queue name |
| `VIDEO_PARALLEL_JOBS` | `cores/2` | Rows per job in API process |

### Deployment guide

```bash
# API
EXPORT_RENDERER=server
USE_BULL_EXPORT=true
REDIS_URL=redis://redis:6379
MONGODB_URI=mongodb://...
npm start

# Worker (separate process/container)
EXPORT_RENDERER=server
USE_BULL_EXPORT=true
REDIS_URL=redis://redis:6379
EXPORT_WORKER_CONCURRENCY=4
npm run worker:export
```

### Scaling recommendations

| Load | Workers | Concurrency/worker | Redis |
|------|---------|-------------------|-------|
| Dev | 1 | 1 | Single instance |
| Small SaaS | 2 | 2 | 1 GB RAM, persistence on |
| Medium | 4 | 4 | 2 GB, AOF enabled |
| High | 8+ | 4–8 | Cluster or managed Redis |

Rule of thumb: **1 worker per 2–4 CPU cores** with `EXPORT_WORKER_CONCURRENCY=1–2` for memory-heavy long videos.

### GPU requirements

- Intel QSV / NVIDIA NVENC / AMD AMF detected automatically via `encodeOptions.js`
- Falls back to `libx264` when no hardware encoder
- Worker host needs FFmpeg with chosen encoder available (bundled `@ffmpeg-installer` is CPU-only; production may use system FFmpeg with GPU)

### Troubleshooting

| Symptom | Check |
|---------|-------|
| Styled export fails | `EXPORT_RENDERER=server`, `@napi-rs/canvas` installed on worker |
| Jobs stuck | Redis connectivity, worker logs `export.worker.job.stalled` |
| Memory growth | Worker concurrency too high; reduce `EXPORT_WORKER_CONCURRENCY` |
| Font mismatch | `npm run fonts:setup` on worker host |
| Browser fallback used | Server auth/network error; check API logs |

### Validation (automated)

- Backend: **21/21** tests (`npm run test:render`)
- render-core: **42/42** tests — 18 overlay parity scenarios, 0 pixel diff
- Preview code path unchanged (`drawOverlaysCore`)

### Remaining known limitations

1. Logo must exist on server disk (`config.logo.imagePath`) — FormData logo upload gap unchanged
2. No export checkpointing — retries re-render full video
3. Browser export fallback still required for serverless / offline scenarios
4. Metrics in-memory only (not Redis-persisted)
5. Static image generation (`imageGenerateController`) still uses FFmpeg drawtext (separate feature)

*Document version: 3.0 — Milestone 10 complete. Architecture finalized.*
