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

  const buildExcelTexts = useCallback(() => {
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
    return texts;
  }, [excelData, ttsColumn, ttsMode, ttsSelectedRows]);

  const generateAllTTS = useCallback(async (overrides = null) => {
    if (excelData.length === 0) {
      alert('Please upload an Excel/CSV file first.');
      return;
    }

    // Prefer explicit studio selections (style/pace/voice) over legacy mood stack
    const settings = overrides && typeof overrides === 'object'
      ? {
          rate: overrides.rate,
          pitch: overrides.pitch ?? 1,
          volume: overrides.volume ?? 1,
        }
      : getFinalVoiceSettings();
    const speaker = overrides?.speaker || ttsSpeaker;
    const quality = overrides?.quality || voiceQualityMode;
    const texts = buildExcelTexts();

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
    const styleLabel = overrides?.styleId || overrides?.paceId
      ? `style=${overrides.styleId || '—'} pace=${overrides.paceId || '—'} accent=${overrides.accent || '—'}`
      : `Neural voice: ${speaker}`;
    setLogs(`Generating Basic TTS on server (${styleLabel})…`);

    try {
      const { jobId, totalItems } = await api.generateTTSOnServer({
        texts,
        speaker,
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume,
        quality,
        mode: ttsMode,
        ...(ttsMode === 'row'
          ? { rows: ttsSelectedRows.length > 0 ? ttsSelectedRows : excelData.map((_, i) => i) }
          : { column: ttsColumn }),
        studio: 'basic',
        styleId: overrides?.styleId,
        paceId: overrides?.paceId,
        accent: overrides?.accent,
      });

      setServerJobId(jobId);
      setServerProcessing(true);
      setServerProgress(0);
      setServerJobType('tts');
      setTtsGenerating(false);
      setLogs(`Basic TTS generating… (${totalItems || texts.length} items · ${speaker})`);
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
    buildExcelTexts,
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

  /** Advanced batch — MUST receive live Advanced selections (voice/style/pace/accent) */
  const generateAdvancedTTS = useCallback(
    async (advancedOpts = {}) => {
      if (excelData.length === 0) {
        alert('Please upload an Excel/CSV file first.');
        return;
      }
      if (!advancedOpts.voiceId && !advancedOpts.voiceName) {
        alert('Select an Advanced voice before generating.');
        return;
      }

      const texts = buildExcelTexts();
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
      setLogs(
        `Generating Advanced TTS (${advancedOpts.voiceName || advancedOpts.voiceId} · ${advancedOpts.emotion || 'style'} · ${advancedOpts.paceId || 'pace'} · ${advancedOpts.accent || 'accent'})…`
      );

      try {
        const { jobId, totalItems, voice, speaker } = await api.generateAdvancedTTSOnServer({
          texts,
          quality: 'clear',
          mode: ttsMode,
          ...(ttsMode === 'row'
            ? { rows: ttsSelectedRows.length > 0 ? ttsSelectedRows : excelData.map((_, i) => i) }
            : { column: ttsColumn }),
          voiceId: advancedOpts.voiceId,
          voiceName: advancedOpts.voiceName,
          voiceType: advancedOpts.voiceType,
          accent: advancedOpts.accent,
          emotion: advancedOpts.emotion,
          speed: advancedOpts.speed,
          pitch: advancedOpts.pitch,
          emotionAmt: advancedOpts.emotionAmt,
          stability: advancedOpts.stability,
          similarity: advancedOpts.similarity,
          cfgScale: advancedOpts.cfgScale,
          temperature: advancedOpts.temperature,
          language: advancedOpts.language,
          sampleRate: advancedOpts.sampleRate,
          precision: advancedOpts.precision || 'studio',
          paceId: advancedOpts.paceId || 'natural',
          cloneId: advancedOpts.cloneId,
          engine: advancedOpts.engine || 'piper_local',
          studio: 'advanced',
        });

        setServerJobId(jobId);
        setServerProcessing(true);
        setServerProgress(0);
        setServerJobType('tts');
        setTtsGenerating(false);
        setLogs(
          `Advanced TTS on server… (${totalItems || texts.length} · ${voice || advancedOpts.voiceName || speaker} · ${advancedOpts.accent || ''} · ${advancedOpts.emotion || ''} · ${advancedOpts.paceId || ''})`
        );
      } catch (e) {
        console.warn('Advanced TTS failed:', e?.message);
        setTtsGenerating(false);
        const msg = e?.message || String(e);
        setLogs(`Advanced TTS error: ${msg}`);
        alert(`Advanced TTS failed:\n${msg}\n\nMake sure the backend is running.`);
      }
    },
    [
      api,
      buildExcelTexts,
      excelData,
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
    ]
  );

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

  const downloadSingleAudio = useCallback(async (url, filename) => {
    const safeName = filename || 'audio.mp3';
    try {
      // Cross-origin URLs (backend on another port) make the `download` attribute
      // no-op and the browser navigates/plays instead. Fetch as a blob and save that.
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error('Error downloading audio:', error);
      setLogs?.('Error downloading audio.');
    }
  }, [setLogs]);

  const downloadAllTTSAudios = useCallback(async () => {
    if (generatedAudios.length === 0) return;

    if (generatedAudios[0]?.zipUrl) {
      setLogs('Downloading TTS ZIP from server...');
      try {
        const response = await fetch(generatedAudios[0].zipUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = 'tts_audios.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        setLogs('TTS ZIP downloaded!');
      } catch (error) {
        console.error('Error downloading ZIP:', error);
        setLogs('Error downloading ZIP.');
      }
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
    generateAdvancedTTS,
    addGeneratedAudioToVoiceLibrary,
    addAllGeneratedToVoiceLibrary,
    downloadSingleAudio,
    downloadAllTTSAudios,
  };
}

