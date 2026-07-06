/** Resolve which uploaded video/image to show in preview (matches export row pairing). */

export function resolvePreviewVideoIndex({
  videos = [],
  previewRowIndex = 0,
  previewVideoIndex = 0,
  excelData = [],
  videoMode = 'sequence',
}) {
  if (!videos.length) return 0;
  if (videos.length === 1) return 0;
  if (excelData.length > 0 && videoMode === 'sequence') {
    return previewRowIndex % videos.length;
  }
  return Math.max(0, Math.min(previewVideoIndex, videos.length - 1));
}

export function resolvePreviewImageIndex({
  imageFiles = [],
  previewRowIndex = 0,
  previewImageIndex = 0,
  excelData = [],
  imageMode = 'sequence',
}) {
  if (!imageFiles.length) return 0;
  if (imageFiles.length === 1) return 0;
  if (excelData.length > 0 && imageMode === 'sequence') {
    return previewRowIndex % imageFiles.length;
  }
  return Math.max(0, Math.min(previewImageIndex, imageFiles.length - 1));
}

export function getPreviewVideoNavState({
  videos = [],
  excelData = [],
  videoMode = 'sequence',
  previewRowIndex = 0,
  previewVideoIndex = 0,
}) {
  if (videos.length <= 1) return null;

  if (excelData.length > 0 && videoMode === 'sequence') {
    const current = Math.min(previewRowIndex, excelData.length - 1);
    return {
      current,
      total: excelData.length,
      label: 'Preview',
      usesRowIndex: true,
    };
  }

  const current = Math.min(previewVideoIndex, videos.length - 1);
  return {
    current,
    total: videos.length,
    label: 'Video',
    usesRowIndex: false,
  };
}

export function getPreviewImageNavState({
  imageFiles = [],
  excelData = [],
  imageMode = 'sequence',
  previewRowIndex = 0,
  previewImageIndex = 0,
}) {
  if (imageFiles.length <= 1) return null;

  if (excelData.length > 0 && imageMode === 'sequence') {
    const current = Math.min(previewRowIndex, excelData.length - 1);
    return {
      current,
      total: excelData.length,
      label: 'Preview',
      usesRowIndex: true,
    };
  }

  const current = Math.min(previewImageIndex, imageFiles.length - 1);
  return {
    current,
    total: imageFiles.length,
    label: 'Image',
    usesRowIndex: false,
  };
}
