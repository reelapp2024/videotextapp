export async function extractAudioFallback(videoFile, audioContext, audioExtractionQuality) {
  return new Promise(async (resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.muted = false; // Must be unmuted for captureStream to work
      video.volume = 0.001; // Near-silent - prevents audio from playing through speakers
      video.playsInline = true;

      const videoUrl = URL.createObjectURL(videoFile);
      video.src = videoUrl;

      await new Promise((res, rej) => {
        video.onloadedmetadata = res;
        video.onerror = rej;
      });

      let stream;
      if (video.captureStream) {
        stream = video.captureStream();
      } else if (video.mozCaptureStream) {
        stream = video.mozCaptureStream();
      }

      if (!stream) {
        throw new Error('captureStream not supported');
      }

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track in video');
      }

      const audioStream = new MediaStream(audioTracks);
      const chunks = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';

      const recorder = new MediaRecorder(audioStream, {
        mimeType,
        audioBitsPerSecond: audioExtractionQuality,
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recordingDone = new Promise((res) => {
        recorder.onstop = () => res();
      });

      recorder.start(100); // Collect data every 100ms
      video.currentTime = 0;
      await video.play();

      await new Promise((res) => {
        video.onended = res;
      });

      recorder.stop();
      await recordingDone;

      video.pause();
      URL.revokeObjectURL(videoUrl);

      const audioBlob = new Blob(chunks, { type: mimeType });
      const audioArrayBuffer = await audioBlob.arrayBuffer();

      try {
        const decodedBuffer = await audioContext.decodeAudioData(audioArrayBuffer);
        resolve(decodedBuffer);
      } catch {
        resolve(null);
      }
    } catch (error) {
      reject(error);
    }
  });
}

export function audioBufferToWav(audioBuffer, quality) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = quality >= 256000 ? 24 : 16;

  let interleaved;
  if (numChannels === 2) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    interleaved = new Float32Array(left.length + right.length);
    for (let i = 0, j = 0; i < left.length; i++, j += 2) {
      interleaved[j] = left[i];
      interleaved[j + 1] = right[i];
    }
  } else {
    interleaved = audioBuffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = interleaved.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const offset = 44;
  if (bitDepth === 16) {
    for (let i = 0; i < interleaved.length; i++) {
      const sample = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }
  } else {
    for (let i = 0; i < interleaved.length; i++) {
      const sample = Math.max(-1, Math.min(1, interleaved[i]));
      const intSample = sample < 0 ? sample * 0x800000 : sample * 0x7fffff;
      view.setUint8(offset + i * 3, intSample & 0xff);
      view.setUint8(offset + i * 3 + 1, (intSample >> 8) & 0xff);
      view.setUint8(offset + i * 3 + 2, (intSample >> 16) & 0xff);
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export async function extractAudioFromVideo(videoFile, audioExtractionQuality) {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await videoFile.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      let audioBuffer;
      try {
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      } catch (decodeError) {
        console.log('Direct decode failed, using fallback method...');
        audioBuffer = await extractAudioFallback(videoFile, audioContext, audioExtractionQuality);
      }

      if (!audioBuffer) {
        throw new Error('Could not decode audio');
      }

      const wavBlob = audioBufferToWav(audioBuffer, audioExtractionQuality);

      await audioContext.close();
      resolve(wavBlob);
    } catch (error) {
      console.error('Audio extraction error:', error);
      reject(error);
    }
  });
}

export async function handleBatchExtractAudioImpl(ctx) {
  const {
    videos,
    tryBackendProcessing,
    setBatchExtracting,
    setProgress,
    setExtractedAudios,
    setLogs,
    audioExtractionQuality,
  } = ctx;

  if (videos.length === 0) {
    alert('Please upload videos first.');
    return;
  }

  const ok = await tryBackendProcessing('audio_extract', () => {
    const fd = new FormData();
    videos.forEach((v) => fd.append('videos', v instanceof File ? v : (v.file || v)));
    fd.append('format', 'wav');
    return fd;
  });
  if (ok) return;

  setBatchExtracting(true);
  setProgress(0);
  setExtractedAudios([]); // Clear previous extractions
  const newExtractedAudios = [];

  try {
    for (let i = 0; i < videos.length; i++) {
      const file = videos[i];
      const audioName = file.name.replace(/\.[^/.]+$/, '') + '.wav';
      setLogs(`Extracting audio ${i + 1}/${videos.length}: ${file.name}`);

      try {
        const audioBlob = await extractAudioFromVideo(file, audioExtractionQuality);
        const audioUrl = URL.createObjectURL(audioBlob);

        const extractedAudio = {
          id: Date.now() + i,
          name: audioName,
          url: audioUrl,
          blob: audioBlob,
          size: (audioBlob.size / 1024 / 1024).toFixed(2), // MB
          originalVideo: file.name,
        };

        newExtractedAudios.push(extractedAudio);
        setExtractedAudios([...newExtractedAudios]);

        setLogs(`Extracted: ${audioName}`);
      } catch (error) {
        console.error(`Failed to extract audio from ${file.name}:`, error);
        setLogs(`Failed: ${file.name} - ${error.message}`);
      }

      setProgress(Math.round(((i + 1) / videos.length) * 100));
    }

    setLogs(`Extraction complete! ${newExtractedAudios.length}/${videos.length} audios extracted.`);
  } catch (error) {
    console.error('Batch extraction error:', error);
    setLogs(`Error: ${error.message}`);
  } finally {
    setBatchExtracting(false);
  }
}

export function downloadExtractedAudioImpl(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function downloadAllExtractedAudiosImpl(ctx) {
  const { extractedAudios, setLogs } = ctx;
  if (extractedAudios.length === 0) return;

  setLogs('Creating ZIP file...');
  try {
    const zip = new window.JSZip();
    const folder = zip.folder('extracted_audios');

    for (const audio of extractedAudios) {
      folder.file(audio.name, audio.blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    window.saveAs(content, 'extracted_audios.zip');
    setLogs('ZIP downloaded!');
  } catch (error) {
    console.error('ZIP creation error:', error);
    setLogs('Error creating ZIP.');
  }
}

export function clearExtractedAudiosImpl(ctx) {
  const { extractedAudios, setExtractedAudios, setLogs } = ctx;
  extractedAudios.forEach((audio) => URL.revokeObjectURL(audio.url));
  setExtractedAudios([]);
  setLogs('Extracted audios cleared.');
}

