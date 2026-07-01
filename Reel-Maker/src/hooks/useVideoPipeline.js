import { useCallback } from 'react';
import { startProcessingImpl } from '../pipeline/startProcessingImpl';

export function useVideoPipeline(params) {
  const {
    libsLoaded,
    excelData,
    videos,
    voiceFiles,
    musicFiles,
    imageFiles,
    config,
    voiceCaptionMap,
    detectedSourceFps,
    imageCombineMode,
    imageSlideDurationSec,
    api,
    tryBackendProcessing,
    setLogs,
  } = params;

  const startProcessing = useCallback(async () => {
    await startProcessingImpl({
      libsLoaded,
      excelData,
      videos,
      voiceFiles,
      musicFiles,
      imageFiles,
      config,
      voiceCaptionMap,
      detectedSourceFps,
      imageCombineMode,
      imageSlideDurationSec,
      tryBackendProcessing,
      setLogs,
    });
  }, [
    libsLoaded,
    excelData,
    videos,
    voiceFiles,
    musicFiles,
    imageFiles,
    config,
    voiceCaptionMap,
    detectedSourceFps,
    imageCombineMode,
    imageSlideDurationSec,
    tryBackendProcessing,
    setLogs,
  ]);

  const startImageProcessing = useCallback(async () => {
    const hasExcel = excelData.length > 0;
    const hasImages = imageFiles.length > 0;
    if (!libsLoaded) {
      alert('Libraries are loading. Please wait a moment.');
      return;
    }
    if (!hasExcel && !hasImages) {
      alert('Please add Excel data or Images.');
      return;
    }
    const ok = await tryBackendProcessing('image', () => {
      const fd = new FormData();
      if (hasImages) imageFiles.forEach((f) => fd.append('images', f instanceof File ? f : (f.file || f)));
      fd.append('config', JSON.stringify(config));
      fd.append('excelData', JSON.stringify(excelData));
      return fd;
    });
    if (!ok) {
      setLogs('Server image export failed. Ensure backend is running and you are logged in.');
    }
  }, [libsLoaded, excelData, imageFiles, config, tryBackendProcessing, setLogs]);

  const handleStopProcessing = useCallback(() => {}, []);
  const handlePauseProcessing = useCallback(() => {}, []);

  return {
    startProcessing,
    startImageProcessing,
    handleStopProcessing,
    handlePauseProcessing,
  };
}
