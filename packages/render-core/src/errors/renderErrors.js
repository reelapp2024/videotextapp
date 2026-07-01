export class RenderError extends Error {
  /** @param {string} code @param {string} message @param {Record<string, unknown>} [details] */
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'RenderError';
    this.code = code;
    this.details = details;
  }
}

export class FontLoadError extends RenderError {
  constructor(family, details = {}) {
    super('FONT_LOAD_FAILED', `Failed to load font: ${family}`, { family, ...details });
    this.name = 'FontLoadError';
  }
}

export class ImageLoadError extends RenderError {
  constructor(ref, details = {}) {
    super('IMAGE_LOAD_FAILED', `Failed to load image: ${ref}`, { ref, ...details });
    this.name = 'ImageLoadError';
  }
}

export class SvgLoadError extends RenderError {
  constructor(ref, details = {}) {
    super('SVG_LOAD_FAILED', `Failed to load SVG: ${ref}`, { ref, ...details });
    this.name = 'SvgLoadError';
  }
}

export class CanvasAllocationError extends RenderError {
  constructor(details = {}) {
    super('CANVAS_ALLOCATION_FAILED', 'Failed to allocate canvas', details);
    this.name = 'CanvasAllocationError';
  }
}

export class SceneValidationRenderError extends RenderError {
  /** @param {string[]} errors */
  constructor(errors) {
    super('SCENE_VALIDATION_FAILED', `Scene validation failed: ${errors.join('; ')}`, { errors });
    this.name = 'SceneValidationRenderError';
  }
}
