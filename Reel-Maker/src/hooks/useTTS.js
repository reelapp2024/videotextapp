import { useCallback } from 'react';

export function useTTS(params) {
  const {
    api,
    excelData,
    ttsMode,
    ttsSelectedRows,
    ttsColumn,
    ttsSpeaker,
    getFinalVoiceSettings,
    generatedAudios,

    setTtsGenerating,
    setTtsProgress,
    setGeneratedAudios,
    setLogs,
    setServerJobId,
    setServerProcessing,
    setServerProgress,
    setServerJobType,
    setVoiceFiles,
    voiceQualityMode,
  } = params;

  const generateAllTTS = useCallback(async () => {
    if (excelData.length === 0) {
      alert('Please upload an Excel/CSV file first.');
      return;
    }

    const settings = getFinalVoiceSettings();

    let texts = [];
    if (ttsMode === 'row') {
      const rowIdxs = ttsSelectedRows.length > 0 ? ttsSelectedRows : excelData.map((_, i) => i);
      texts = rowIdxs.map((ri) => {
        const row = excelData[ri];
        if (!Array.isArray(row)) return '';
        return row
          .filter((c) => c != null && String(c).trim() !== '')
          .map(String)
          .join(' ');
      });
    } else {
      const maxCol = Math.max(0, ...excelData.map((r) => (Array.isArray(r) ? r.length : 0))) - 1;
      const col = Math.min(ttsColumn, maxCol);
      texts = excelData.map((row) => (Array.isArray(row) ? String(row[col] ?? '') : ''));
    }

    const nonEmptyCount = texts.filter((t) => String(t ?? '').trim().length > 0).length;
    if (nonEmptyCount === 0) {
      alert(
        ttsMode === 'column'
          ? 'Selected column has no text in any row. Please select a column that contains text.'
          : 'No text found in selected rows. Please select rows that have content.'
      );
      return;
    }

    setTtsGenerating(true);
    setTtsProgress(0);
    setGeneratedAudios([]);
    setLogs('Generating TTS on server (Neural voices)...');

    try {
      const { jobId, totalItems } = await api.generateTTSOnServer({
        texts,
        speaker: ttsSpeaker,
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume,
        quality: voiceQualityMode,
        mode: ttsMode,
        ...(ttsMode === 'row'
          ? { rows: ttsSelectedRows.length > 0 ? ttsSelectedRows : excelData.map((_, i) => i) }
          : { column: ttsColumn }),
      });

      setServerJobId(jobId);
      setServerProcessing(true);
      setServerProgress(0);
      setServerJobType('tts');
      setTtsGenerating(false);
      setLogs(`TTS generating on server... (${totalItems || texts.length} items, Neural voice: ${ttsSpeaker})`);
    } catch (e) {
      console.warn('Backend TTS failed:', e?.message);
      setTtsGenerating(false);
      const msg = e?.message || String(e);
      const isUnavailable = msg.includes('503') || /unavailable|dedicated|serverless|not available/i.test(msg);
      setLogs(
        isUnavailable
          ? 'TTS needs a Node server (not Vercel/serverless). Run backend locally (npm run dev in video-text-app-backend) or deploy backend on Railway/Render.'
          : `TTS error: ${msg}`
      );
      if (isUnavailable) {
        alert(
          'TTS is not available on this server. Run the backend locally (video-text-app-backend) or deploy it on a Node server (Railway, Render).'
        );
      }
    }
  }, [
    api,
    excelData,
    getFinalVoiceSettings,
    setGeneratedAudios,
    setLogs,
    setServerJobId,
    setServerJobType,
    setServerProcessing,
    setServerProgress,
    setTtsGenerating,
    setTtsProgress,
    ttsColumn,
    ttsMode,
    ttsSelectedRows,
    ttsSpeaker,
    voiceQualityMode,
  ]);

  const addGeneratedAudioToVoiceLibrary = useCallback(
    async (audioUrl, filename) => {
      try {
        const res = await fetch(audioUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: blob.type || 'audio/mpeg' });
        setVoiceFiles((prev) => [...prev, file]);
        setLogs(`"${filename}" added to Voice library.`);
      } catch (e) {
        console.error('Add to voice failed:', e);
        setLogs('Error adding to Voice library.');
      }
    },
    [setLogs, setVoiceFiles]
  );

  const addAllGeneratedToVoiceLibrary = useCallback(async () => {
    for (const audio of generatedAudios) {
      await addGeneratedAudioToVoiceLibrary(audio.url, audio.name);
    }
    setLogs(`${generatedAudios.length} audio(s) added to Voice library.`);
  }, [addGeneratedAudioToVoiceLibrary, generatedAudios, setLogs]);

  const downloadSingleAudio = useCallback((url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadAllTTSAudios = useCallback(async () => {
    if (generatedAudios.length === 0) return;

    if (generatedAudios[0]?.zipUrl) {
      const a = document.createElement('a');
      a.href = generatedAudios[0].zipUrl;
      a.download = 'tts_audios.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setLogs('Downloading TTS ZIP from server...');
      return;
    }

    setLogs('Creating audio ZIP...');
    try {
      const zip = new window.JSZip();
      const audioFolder = zip.folder('tts_audios');

      for (let i = 0; i < generatedAudios.length; i++) {
        const audio = generatedAudios[i];
        const response = await fetch(audio.url);
        const blob = await response.blob();
        audioFolder.file(audio.name, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      window.saveAs(content, 'tts_audios.zip');
      setLogs('Audio ZIP downloaded!');
    } catch (error) {
      console.error('Error creating audio ZIP:', error);
      setLogs('Error creating ZIP.');
    }
  }, [generatedAudios, setLogs]);

  return {
    generateAllTTS,
    addGeneratedAudioToVoiceLibrary,
    addAllGeneratedToVoiceLibrary,
    downloadSingleAudio,
    downloadAllTTSAudios,
  };
}

