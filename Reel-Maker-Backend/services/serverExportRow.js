const path = require('path');
const { pathToFileURL } = require('url');
const { ServerVideoFrameSource } = require('./serverVideoFrameSource');
const { FramePipeEncoder, buildAudioFilterForPipe } = require('./framePipeEncoder');
const { resolveExportDuration } = require('./mediaProbe');
const { getVideoEncodeOptions, resolveAudioEncodeOptions } = require('./encodeOptions');
const { getServerOverlayDeps } = require('./serverOverlayDeps');
const { createServerFontProvider } = require('./serverFontResolver');
const { finalizeMp4ForMobile } = require('./mp4Finalize');
const { resolveExportFormat } = require('./exportFormat');
const { getWorkerAssetCache } = require('./exportAssetCache');
const { ExportTextLayoutCache } = require('./exportTextLayoutCache');
const { ServerStaticLayerCache } = require('./exportStaticLayers');
const { analyzeDirtyLayers } = require('./exportDirtyLayers');
const { RunningStats } = require('./exportRunningStats');
const { ExportJobMetrics } = require('./exportMetrics');
const { exportLog } = require('./exportLogger');
const { MemoryPeakTracker } = require('./workerContext');
const { ExportRenderProfiler } = require('./exportRenderProfiler');
const { ExportFramePipeline } = require('./exportFramePipeline');

let renderCoreModule = null;
let bgLayersModule = null;
let videoFrameDrawModule = null;
let bgEffectsCatalogModule = null;

async function getRenderCore() {
  if (!renderCoreModule) {
    const pkgPath = path.resolve(__dirname, '../../packages/render-core/src/index.node.js');
    renderCoreModule = await import(pathToFileURL(pkgPath).href);
  }
  return renderCoreModule;
}

async function getBgLayers() {
  if (!bgLayersModule) {
    const p = path.resolve(__dirname, '../../Reel-Maker/src/overlay/drawBackgroundLayers.js');
    bgLayersModule = await import(pathToFileURL(p).href);
  }
  return bgLayersModule;
}

async function getVideoFrameDraw() {
  if (!videoFrameDrawModule) {
    const p = path.resolve(__dirname, '../../Reel-Maker/src/overlay/videoFrameDraw.js');
    videoFrameDrawModule = await import(pathToFileURL(p).href);
  }
  return videoFrameDrawModule;
}

async function getBgEffectsCatalog() {
  if (!bgEffectsCatalogModule) {
    const p = path.resolve(__dirname, '../../Reel-Maker/src/effects/backgroundEffectsCatalog.js');
    bgEffectsCatalogModule = await import(pathToFileURL(p).href);
  }
  return bgEffectsCatalogModule;
}

/**
 * Reusable export session — canvas, buffers, caches (M9 hardened).
 */
class ServerExportSession {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.canvas = null;
    this.ctx = null;
    this.rgbaScratch = null;
    this.imageDataReuse = null;
    this.overlayDeps = null;
    this.fontRegistry = null;
    this.textLayoutCache = new ExportTextLayoutCache();
    this.staticLayers = new ServerStaticLayerCache();
    this.assetCache = getWorkerAssetCache();
    this._videoFrameCanvas = null;
    this._videoFrameCtx = null;
    this._videoFrameImageData = null;
    this._bgVideoFrameCanvas = null;
    this._bgVideoFrameCtx = null;
    this._bgVideoFrameImageData = null;
    this._restoreMeasureText = null;
    this._dirty = null;
    this._drawConfig = null;
    this._drawOverlaysCore = null;
    this._drawLogoCore = null;
    this._drawBackgroundLayer = null;
    this._drawVideoFrameContain = null;
    this._drawVideoFrameFullBleed = null;
    this._zoomScale = 1;
    this._mainVideoRect = null;
    this._useFullBleedVideo = true;
    this._mainBlitImageData = null;
    this._bgBlitImageData = null;
    this.profiler = null;
  }

  async init(config, opts = {}) {
    const renderCore = await getRenderCore();
    this.overlayDeps = await getServerOverlayDeps();
    this.fontRegistry = renderCore.getFontRegistry();
    this.fontRegistry.setProvider(createServerFontProvider());

    const families = [...new Set(
      (config?.overlays || []).map((o) => o?.fontFamily).filter(Boolean).concat(['Arial']),
    )];
    await this.fontRegistry.ensureFamilies(families);

    const { canvas, ctx } = await renderCore.createNodeCanvas(this.width, this.height);
    this.canvas = canvas;
    this.ctx = ctx;
    this.rgbaScratch = Buffer.allocUnsafe(this.width * this.height * 4);
    this.imageDataReuse = ctx.createImageData(this.width, this.height);
    await this.fontRegistry.registerOnCanvas(families);

    this._restoreMeasureText = this.textLayoutCache.installOnContext(ctx);
    this._drawConfig = { ...config, _textLayoutCache: this.textLayoutCache };

    this._drawOverlaysCore = renderCore.drawOverlaysCore;
    this._drawLogoCore = renderCore.drawLogoCore;
    const bgLayers = await getBgLayers();
    this._drawBackgroundLayer = bgLayers.drawBackgroundLayer;
    const videoFrameDraw = await getVideoFrameDraw();
    this._drawVideoFrameContain = videoFrameDraw.drawVideoFrameContain;
    this._drawVideoFrameFullBleed = videoFrameDraw.drawVideoFrameFullBleed;
    this._zoomScale = Math.max(0.5, Math.min(2, Number(config?.video?.zoomScale) || 1));
    this._mainVideoRect = videoFrameDraw.computeContainRect(
      this.width,
      this.height,
      this.width,
      this.height,
      this._zoomScale,
    );
    this._useFullBleedVideo = Math.abs(this._zoomScale - 1) < 0.001;

    this._dirty = analyzeDirtyLayers({
      config,
      hasBgVideo: Boolean(opts.bgVideoPath),
      hasMainVideo: Boolean(opts.videoPath),
      bgEffectsActive: opts.bgEffectsActive ?? false,
    });
  }

  async loadImage(filePath) {
    const { loadImage } = await import('@napi-rs/canvas');
    return this.assetCache.loadImage(filePath, (p) => loadImage(p));
  }

  async bakeStaticLayers({ config, bgImage, logoImage, logoState }) {
    const bgLayers = await getBgLayers();
    const { shouldApplyBackgroundEffects } = await getBgEffectsCatalog();
    const fx = config.backgroundEffects || { enabled: false, effectId: 'none' };
    const bg = config.background || { type: 'solid', solidColor: '#000000' };

    if (this._dirty.canBakeStaticBackground) {
      const { createCanvas } = require('@napi-rs/canvas');
      const bgCanvas = createCanvas(this.width, this.height);
      const bgCtx = bgCanvas.getContext('2d');
      bgLayers.drawBackgroundLayer(
        bgCtx,
        this.width,
        this.height,
        bg,
        { image: bgImage },
        0,
        1,
        fx,
        { fallbackUploadImage: !!bgImage },
      );
      this.staticLayers.setBackground(bgCanvas);
    }

    if (this._dirty.canBakeLogo && logoState?.enabled && logoImage) {
      this.staticLayers.bakeLogoLayer({
        canvas: this.canvas,
        width: this.width,
        height: this.height,
        logoImage,
        logoSize: logoState.sizePercent,
        logoPosition: logoState.position,
        logoPadding: logoState.paddingPercent,
        logoOpacity: logoState.opacity,
      });
    }

    if (this._dirty.canBakeDecorative) {
      const decoOv = (config.overlays || []).find((o) => o?.enabled);
      if (decoOv?.textBgEnabled) {
        try {
          const presets = await import(pathToFileURL(
            path.resolve(__dirname, '../../Reel-Maker/src/textStylePresets.js'),
          ).href);
          this.staticLayers.bakeDecorativeLayer(this.width, this.height, (dctx, w, h) => {
            const tbgCategory = decoOv.textBgCategory || 'gradient';
            const tbgPatternId = decoOv.textBgPatternId || '';
            let patternObj = null;
            const cats = presets.TEXT_BG_PATTERNS?.[tbgCategory];
            if (tbgPatternId && cats) {
              patternObj = cats.find((p) => p.id === tbgPatternId);
            }
            if (!patternObj && cats?.length > 0) patternObj = cats[0];
            if (patternObj) {
              dctx.save();
              dctx.globalAlpha = decoOv.textBgOpacity ?? 0.85;
              presets.drawTextBgPattern(dctx, 0, 0, w, h, patternObj, 0);
              dctx.restore();
            }
          });
        } catch {
          // decorative bake optional
        }
      }
    }

    this._syncStaticLayersConfig();
  }

  /** Tell drawOverlaysCore which decorative/static layers are baked (skip redundant redraw). */
  _syncStaticLayersConfig() {
    if (!this._drawConfig) return;
    this._drawConfig._staticLayers = {
      decorative: Boolean(this.staticLayers.decorative),
      logo: Boolean(this.staticLayers.logo),
      background: Boolean(this.staticLayers.background),
    };
  }

  /**
   * Blit export-sized RGBA directly to ctx (no intermediate canvas when zoom=1).
   */
  _blitFullRgba(ctx, rgbaBuffer, slot) {
    const key = slot === 'bg' ? '_bgBlitImageData' : '_mainBlitImageData';
    if (!this[key]) {
      this[key] = ctx.createImageData(this.width, this.height);
    }
    this[key].data.set(rgbaBuffer);
    ctx.putImageData(this[key], 0, 0);
  }

  /**
   * @param {object} params
   * @param {Buffer} [params.outputBuffer] — render target (pipeline ping-pong buffer)
   */
  drawExportFrame(params) {
    const {
      rowData,
      videoTime,
      duration,
      bgDrawExtras,
      mainVideoFrame,
      mainVideoOpacity,
      bgVideoFrame,
      logoState,
      profiler = null,
      outputBuffer = null,
    } = params;

    const config = this._drawConfig;
    const ctx = this.ctx;
    const { width, height } = this;

    let t0 = profiler?.mark();

    const usedStaticBg = this.staticLayers.compositeBase(ctx, width, height);
    if (!usedStaticBg) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const bg = config.background || { type: 'solid', solidColor: '#000000' };
      const fx = config.backgroundEffects || { enabled: false, effectId: 'none' };
      const extras = { ...bgDrawExtras };
      if (bgVideoFrame) {
        extras.videoFrame = this._rgbaToVideoCanvas(bgVideoFrame, 'bg');
      }

      this._drawBackgroundLayer(
        ctx,
        width,
        height,
        bg,
        extras,
        videoTime,
        duration,
        fx,
        { fallbackUploadImage: !!bgDrawExtras?.image },
      );
    } else if (bgVideoFrame) {
      const bgT0 = profiler?.mark();
      ctx.save();
      ctx.globalAlpha = 1;
      if (this._useFullBleedVideo) {
        this._blitFullRgba(ctx, bgVideoFrame, 'bg');
      } else {
        const canvas = this._rgbaToVideoCanvas(bgVideoFrame, 'bg');
        ctx.drawImage(canvas, 0, 0, width, height);
      }
      ctx.restore();
      profiler?.record('bgVideo', bgT0);
    }
    profiler?.record('background', t0);

    t0 = profiler?.mark();
    if (mainVideoFrame) {
      ctx.save();
      ctx.globalAlpha = mainVideoOpacity ?? 1;
      if (this._useFullBleedVideo) {
        this._blitFullRgba(ctx, mainVideoFrame, 'main');
      } else {
        const canvas = this._rgbaToVideoCanvas(mainVideoFrame, 'main');
        const r = this._mainVideoRect;
        ctx.drawImage(canvas, r.sx, r.sy, r.sw, r.sh);
      }
      ctx.restore();
    }
    profiler?.record('mainVideo', t0);

    t0 = profiler?.mark();
    this._drawOverlaysCore(ctx, width, height, rowData, videoTime, duration, config, this.overlayDeps);
    profiler?.record('overlays', t0);

    t0 = profiler?.mark();
    this.staticLayers.compositeDecorative(ctx);
    profiler?.record('decorative', t0);

    t0 = profiler?.mark();
    if (this.staticLayers.logo) {
      this.staticLayers.compositeLogo(ctx);
    } else if (logoState?.enabled && logoState?.image) {
      this._drawLogoCore(ctx, width, height, logoState);
    }
    profiler?.record('logo', t0);

    t0 = profiler?.mark();
    const raw = this.canvas.data();
    const target = outputBuffer || this.rgbaScratch;
    if (raw.length === target.length) {
      raw.copy(target);
    } else {
      target.set(raw);
    }
    profiler?.record('readback', t0);

    return target;
  }

  /**
   * @param {Buffer} rgbaBuffer
   * @param {'main'|'bg'} [slot]
   */
  _rgbaToVideoCanvas(rgbaBuffer, slot = 'main') {
    const key = slot === 'bg' ? '_bgVideoFrameCanvas' : '_videoFrameCanvas';
    const ctxKey = slot === 'bg' ? '_bgVideoFrameCtx' : '_videoFrameCtx';
    const imageDataKey = slot === 'bg' ? '_bgVideoFrameImageData' : '_videoFrameImageData';

    if (!this[key]) {
      const { createCanvas } = require('@napi-rs/canvas');
      this[key] = createCanvas(this.width, this.height);
      this[ctxKey] = this[key].getContext('2d');
      this[imageDataKey] = this[ctxKey].createImageData(this.width, this.height);
    }
    this[imageDataKey].data.set(rgbaBuffer);
    this[ctxKey].putImageData(this[imageDataKey], 0, 0);
    return this[key];
  }

  getRgbaBuffer(pixelData) {
    if (pixelData instanceof Buffer && pixelData === this.rgbaScratch) return pixelData;
    this.rgbaScratch.set(pixelData);
    return this.rgbaScratch;
  }

  getCacheStats() {
    const jobCache = this.assetCache.getJobCacheStats();
    return {
      asset: this.assetCache.stats,
      assetHitRatio: jobCache.hitRatio ?? this.assetCache.cacheHitRatio,
      assetJobCache: jobCache,
      textLayoutHitRatio: this.textLayoutCache.hitRatio,
    };
  }

  dispose() {
    if (this._restoreMeasureText) {
      this._restoreMeasureText();
      this._restoreMeasureText = null;
    }
    this.textLayoutCache.clear();
    this.assetCache.clearPerJob();
    this.staticLayers.dispose();

    const renderCore = renderCoreModule;
    if (renderCore && this.canvas) {
      renderCore.disposeNodeCanvas({ canvas: this.canvas });
    }
    for (const key of [
      '_videoFrameCanvas', '_bgVideoFrameCanvas',
    ]) {
      const canvas = this[key];
      if (canvas) {
        try {
          canvas.width = 0;
          canvas.height = 0;
        } catch {
          // ignore
        }
      }
      this[key] = null;
    }
    this._videoFrameCtx = null;
    this._bgVideoFrameCtx = null;
    this._videoFrameImageData = null;
    this._bgVideoFrameImageData = null;
    this.canvas = null;
    this.ctx = null;
    this.rgbaScratch = null;
    this.imageDataReuse = null;
  }
}

/**
 * Export one row via shared renderer → FFmpeg stdin (M7/M9).
 */
async function processOneRowWithSharedRenderer(params) {
  const {
    videoPath,
    imageBgPath,
    voicePath,
    musicPath,
    row,
    outputPath,
    videoVol,
    voiceVol,
    musicVol,
    w,
    h,
    fps,
    rowIndex,
    config,
    hasVideoAudio = false,
    segments = [],
    onFrameProgress,
    isCancelled,
    jobId = null,
    jobMetrics = null,
    queueWaitMs = 0,
    retryCount = 0,
  } = params;

  const memoryTracker = new MemoryPeakTracker();
  const renderCore = await getRenderCore();
  const metrics = jobMetrics || new ExportJobMetrics();
  metrics.setJobMeta({
    jobId,
    rendererVersion: renderCore.RENDERER_VERSION,
    queueWaitMs,
    retryCount,
    fps,
  });

  const duration = await resolveExportDuration({
    videoPath: videoPath || imageBgPath,
    voicePath,
    musicPath,
    segments,
    config,
  });

  const exportSpeed = Math.max(0.25, Math.min(4, Number(config?.video?.exportSpeed) || 1));
  const outputDuration = Math.max(duration / exportSpeed, 1 / fps);
  const totalFrames = Math.max(1, Math.ceil(outputDuration * fps));

  const bgVideoPath =
    config?.background?.type === 'video' && params.settingsBgVideo
      ? params.settingsBgVideo
      : null;

  const { shouldApplyBackgroundEffects } = await getBgEffectsCatalog();
  const bgEffectsActive = shouldApplyBackgroundEffects(
    config.background,
    config.backgroundEffects,
    {},
  );

  const session = new ServerExportSession(w, h);
  session.assetCache.startJobStats();
  const renderProfiler = new ExportRenderProfiler();
  session.profiler = renderProfiler;

  await session.init(config, {
    videoPath,
    bgVideoPath,
    bgEffectsActive,
  });

  const bgImage = imageBgPath ? await session.loadImage(imageBgPath) : null;
  const logoImage = config?.logo?.imagePath
    ? await session.loadImage(config.logo.imagePath)
    : null;

  const logoState = {
    enabled: config?.logoEnabled,
    image: logoImage,
    sizePercent: config?.logoSize ?? 15,
    position: config?.logoPosition || 'bottom-right',
    opacity: config?.logoOpacity ?? 1,
    paddingPercent: config?.logoPadding ?? 2,
  };

  await session.bakeStaticLayers({ config, bgImage, logoImage, logoState });

  let mainVideoSource = null;
  let bgVideoSource = null;

  if (videoPath) {
    mainVideoSource = new ServerVideoFrameSource({
      filePath: videoPath,
      width: w,
      height: h,
      fps,
      loop: duration > 0,
    });
    await mainVideoSource.start();
  }

  if (bgVideoPath) {
    bgVideoSource = new ServerVideoFrameSource({
      filePath: bgVideoPath,
      width: w,
      height: h,
      fps,
      loop: true,
    });
    await bgVideoSource.start();
  }

  const exportFmt = resolveExportFormat(config, outputPath);
  const formatId = config?.video?.format || 'mp4';
  const encodeConfig = {
    ...config,
    video: { ...(config?.video || {}), fps, format: formatId },
  };
  const videoEncodeOptions = getVideoEncodeOptions(encodeConfig, { fast: false, width: w, height: h, fps });
  const audioResolved = resolveAudioEncodeOptions(encodeConfig);
  const audioEncodeOptions = audioResolved.options;

  const hasVoice = !!voicePath;
  const hasMusic = !!musicPath;
  const audioInputs = [];
  if (hasVideoAudio && videoPath) audioInputs.push({ path: videoPath });
  if (hasVoice) audioInputs.push({ path: voicePath });
  if (hasMusic) audioInputs.push({ path: musicPath });

  const audioFilter = buildAudioFilterForPipe(
    hasVideoAudio && videoPath,
    hasVoice,
    hasMusic,
    videoVol,
    voiceVol,
    musicVol,
    exportSpeed,
    outputDuration,
    audioResolved.audioRate,
  );

  const encoder = new FramePipeEncoder({
    width: w,
    height: h,
    fps,
    outputPath,
    videoEncodeOptions,
    audioEncodeOptions,
    audioInputs,
    audioFilter,
    durationSec: outputDuration,
    container: exportFmt.container,
  });

  const t0 = Date.now();
  const renderPhaseStart = Date.now();
  let encoderStarted = false;
  let framePipeline = null;
  const frameBytes = w * h * 4;

  try {
    for (let i = 0; i < totalFrames; i++) {
      if (isCancelled && await isCancelled()) {
        encoder.abort();
        throw new Error('Job cancelled');
      }

      const wallTime = i / fps;
      const videoTime = Math.min(wallTime * exportSpeed, duration > 0 ? duration : wallTime * exportSpeed);
      const frameT0 = Date.now();
      renderProfiler.beginFrame();

      const videoT0 = renderProfiler.mark();
      const mainFrame = mainVideoSource ? await mainVideoSource.readFrame() : null;
      const bgVidFrame = bgVideoSource ? await bgVideoSource.readFrame() : null;
      renderProfiler.record('videoRead', videoT0);

      if (!encoderStarted) {
        exportLog('export.encoder.start', {
          jobId,
          rowIndex,
          width: w,
          height: h,
          fps,
          outputPath,
          videoCodec: videoEncodeOptions.includes('h264_nvenc')
            ? 'h264_nvenc'
            : videoEncodeOptions.includes('h264_qsv')
              ? 'h264_qsv'
              : 'libx264',
          audioInputs: audioInputs.map((a) => a.path),
        });
        encoder.start();
        framePipeline = new ExportFramePipeline(encoder, frameBytes);
        encoderStarted = true;
      }

      const renderBuf = framePipeline.nextRenderBuffer();
      session.drawExportFrame({
        rowData: row,
        videoTime,
        duration,
        bgDrawExtras: { image: bgImage },
        mainVideoFrame: mainFrame,
        mainVideoOpacity: config?.video?.opacity ?? 1,
        bgVideoFrame: bgVidFrame,
        logoState,
        profiler: renderProfiler,
        outputBuffer: renderBuf,
      });

      await framePipeline.submitFrame(renderBuf, renderProfiler);

      const frameMs = Date.now() - frameT0;
      metrics.recordFrameRender(frameMs);
      memoryTracker.sample();

      if (onFrameProgress) {
        onFrameProgress({
          frameIndex: i,
          totalFrames,
          progress: Math.round(((i + 1) / totalFrames) * 90),
        });
      }
    }

    if (framePipeline) {
      await framePipeline.flush();
    }

    const renderMs = Date.now() - renderPhaseStart;
    const encodeMetrics = await encoder.finish();
    const encodeMs = encodeMetrics.encodeEndMs - encodeMetrics.encodeStartMs;
    const totalMs = Date.now() - t0;
    const cacheStats = session.getCacheStats();
    const renderProfile = renderProfiler.summary();

    if (exportFmt.ext === 'mp4') {
      await finalizeMp4ForMobile(outputPath);
    }

    const peakMemory = memoryTracker.summary();
    const summary = metrics.finalize({
      encodeMs,
      totalMs,
      cacheHitRatio: cacheStats.assetHitRatio,
      peakMemory,
    });

    exportLog('export.row.completed', {
      jobId,
      rowIndex,
      totalFrames,
      renderMs,
      encodeMs,
      totalMs,
      avgFrameRenderMs: metrics.renderStats.avg,
      renderFps: metrics.renderFps,
      encodeFps: metrics.encodeFps,
      cacheHitRatio: cacheStats.assetHitRatio,
      assetJobCache: cacheStats.assetJobCache,
      textLayoutHitRatio: cacheStats.textLayoutHitRatio,
      renderProfile,
      videoDecode: {
        main: mainVideoSource?.getStats?.() ?? null,
        bg: bgVideoSource?.getStats?.() ?? null,
      },
      peakHeapUsed: peakMemory.peakHeapUsed,
      peakRss: peakMemory.peakRss,
      rendererVersion: renderCore.RENDERER_VERSION,
    });

    console.log('[export] render profile summary:', JSON.stringify({
      bottlenecks: renderProfile.bottlenecks,
      stages: Object.fromEntries(
        Object.entries(renderProfile.stages).map(([k, v]) => [k, { avgMs: v.avg, pct: v.pctOfRender }]),
      ),
      assetJobCache: cacheStats.assetJobCache,
      textLayoutHitRatio: cacheStats.textLayoutHitRatio,
    }));

    return {
      ...summary,
      avgFrameRenderMs: metrics.renderStats.avg,
      renderProfile,
      exportPath: 'server',
      width: w,
      height: h,
      fps,
      totalFrames,
      durationSec: outputDuration,
    };
  } catch (err) {
    encoder.abort();
    metrics.failureReason = err.message;
    exportLog('export.row.failed', {
      jobId,
      rowIndex,
      error: err.message,
      rendererVersion: renderCore.RENDERER_VERSION,
    });
    throw err;
  } finally {
    framePipeline?.dispose();
    mainVideoSource?.dispose();
    bgVideoSource?.dispose();
    session.dispose();
    memoryTracker.sample();
  }
}

module.exports = {
  ServerExportSession,
  processOneRowWithSharedRenderer,
};
