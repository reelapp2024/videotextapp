import React, { useEffect, useRef, useState } from 'react';
import { Mic, Waves } from 'lucide-react';
import TTSBasicTab from './TTSBasicTab';
import TTSAdvancedTab from './TTSAdvancedTab';
import { computeBasicRatePitch } from './ttsBasicConfig';

/**
 * Studio shell — Basic (Edge) vs Advanced (Piper).
 * Exposes studioApiRef so Excel "Generate All" uses the ACTIVE tab selections.
 */
export default function TTSLayout({
  activeTab,
  voices,
  ttsSpeaker,
  setTtsSpeaker,
  setTtsRate,
  setTtsPitch,
  setTtsMood,
  setTtsEffect,
  setTtsSpeakerGender,
  ttsPreviewText,
  setTtsPreviewText,
  previewTTS,
  ttsSampleLoading,
  setVoiceQualityMode,
  excelData,
  ttsColumn,
  ttsMode,
  ttsSelectedRows,
  onAdvancedGenerate,
  onBasicGenerate,
  advancedGenerating,
  studioApiRef,
}) {
  const [studioTab, setStudioTab] = useState('basic');
  const [voiceType, setVoiceType] = useState('female');
  const [accent, setAccent] = useState('american');
  const [styleId, setStyleId] = useState('natural');
  const [paceId, setPaceId] = useState('natural');

  const advancedGetPayloadRef = useRef(null);

  useEffect(() => {
    if (!studioApiRef) return undefined;
    studioApiRef.current = {
      getMode: () => studioTab,
      /** Called by Excel "Generate All Audio" — routes to Basic or Advanced with live selections */
      generate: async () => {
        if (studioTab === 'advanced') {
          const payload = advancedGetPayloadRef.current?.() || null;
          if (!payload?.voiceId) {
            alert('Select an Advanced voice (style, pace, accent) before generating.');
            return;
          }
          await onAdvancedGenerate?.(payload);
          return;
        }
        const { rate, pitch } = computeBasicRatePitch(styleId, paceId);
        await onBasicGenerate?.({
          speaker: ttsSpeaker,
          rate,
          pitch,
          volume: 1,
          quality: 'clear',
          styleId,
          paceId,
          accent,
          voiceType,
        });
      },
    };
    return () => {
      if (studioApiRef) studioApiRef.current = null;
    };
  }, [
    studioApiRef,
    studioTab,
    styleId,
    paceId,
    accent,
    voiceType,
    ttsSpeaker,
    onAdvancedGenerate,
    onBasicGenerate,
  ]);

  if (activeTab !== 'tts') return null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-violet-500/15 animate-fadeIn">
      <div className="px-4 py-3 border-b border-violet-500/10 bg-gradient-to-r from-violet-600/15 via-transparent to-indigo-600/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/20 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-violet-300" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white tracking-tight">AI Voice Studio</h2>
            <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
              <Waves className="w-3 h-3 text-violet-400/70" />
              {studioTab === 'basic'
                ? 'Basic · Edge Neural — Generate uses these selections'
                : 'Advanced · Piper — Generate uses these selections'}
            </p>
          </div>
        </div>

        <div className="flex p-0.5 rounded-xl bg-black/40 border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setStudioTab('basic')}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition ${
              studioTab === 'basic'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Basic
          </button>
          <button
            type="button"
            onClick={() => setStudioTab('advanced')}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition ${
              studioTab === 'advanced'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 max-h-[min(78vh,900px)] overflow-y-auto custom-scrollbar">
        {studioTab === 'basic' ? (
          <TTSBasicTab
            voices={voices}
            ttsSpeaker={ttsSpeaker}
            setTtsSpeaker={setTtsSpeaker}
            setTtsRate={setTtsRate}
            setTtsPitch={setTtsPitch}
            setTtsMood={setTtsMood}
            setTtsEffect={setTtsEffect}
            setTtsSpeakerGender={setTtsSpeakerGender}
            ttsPreviewText={ttsPreviewText}
            setTtsPreviewText={setTtsPreviewText}
            previewTTS={previewTTS}
            ttsSampleLoading={ttsSampleLoading}
            setVoiceQualityMode={setVoiceQualityMode}
            excelData={excelData}
            ttsColumn={ttsColumn}
            voiceType={voiceType}
            setVoiceType={setVoiceType}
            accent={accent}
            setAccent={setAccent}
            styleId={styleId}
            setStyleId={setStyleId}
            paceId={paceId}
            setPaceId={setPaceId}
          />
        ) : (
          <TTSAdvancedTab
            excelData={excelData}
            ttsMode={ttsMode}
            ttsColumn={ttsColumn}
            ttsSelectedRows={ttsSelectedRows}
            onAdvancedGenerate={onAdvancedGenerate}
            advancedGenerating={advancedGenerating}
            registerGetPayload={(fn) => {
              advancedGetPayloadRef.current = fn;
            }}
          />
        )}
      </div>
    </div>
  );
}
