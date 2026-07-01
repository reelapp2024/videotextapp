import React from 'react';
import {
  Video,
  FileSpreadsheet,
  Check,
  Download,
  Shield,
  LogOut,
  Upload,
  Mic,
  Layers,
  Sliders,
  Sparkles,
  Subtitles,
  FolderArchive,
} from 'lucide-react';

export default function AppHeader({
  videosCount,
  excelRowsCount,
  processedCount,
  voiceFilesCount,
  musicFilesCount,
  processing,
  finished,
  libsLoaded,
  startProcessing,
  isAdmin,
  onOpenAdmin,
  userLabel,
  userInitial,
  onLogout,
  activeTab,
  setActiveTab,
}) {
  return (
    <>
      {/* Header */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-b border-indigo-500/[0.08] bg-[#06080f]/85 backdrop-blur-2xl sticky top-0 z-30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-white/10">
              <Video className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white drop-shadow" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent leading-tight">VideoText Pro</h1>
              <p className="text-[8px] sm:text-[10px] text-indigo-300/40 hidden sm:block tracking-wider uppercase">Enterprise Video Automation</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px]">
            {[
              { icon: <Video className="w-3 h-3" />, value: videosCount, color: 'text-indigo-400' },
              { icon: <FileSpreadsheet className="w-3 h-3" />, value: excelRowsCount, color: 'text-emerald-400' },
              { icon: <Check className="w-3 h-3" />, value: processedCount, color: 'text-violet-400' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-1 bg-indigo-500/[0.04] border border-indigo-500/[0.08] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg">
                <span className={s.color}>{s.icon}</span><span className="text-gray-300 font-medium tabular-nums">{s.value}</span>
              </div>
            ))}

            {excelRowsCount > 0 && (videosCount > 0 || voiceFilesCount > 0 || musicFilesCount > 0) && !processing && !finished && (
              <button
                onClick={startProcessing}
                disabled={!libsLoaded}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-1 ring-1 ring-white/10"
              >
                <Download className="w-3 h-3" /> Download
              </button>
            )}

            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="bg-amber-500/8 hover:bg-amber-500/15 text-amber-300 px-2 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition border border-amber-400/12"
              >
                <Shield className="w-3 h-3" /> Admin
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-indigo-500/[0.04] border border-indigo-500/[0.08] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-[8px] font-bold text-indigo-300">
                {userInitial}
              </div>
              <span className="text-gray-400 truncate max-w-[60px] sm:max-w-[90px] text-[10px]">{userLabel}</span>
              {isAdmin && <Shield className="w-2.5 h-2.5 text-amber-400" />}
              <button onClick={onLogout} className="text-gray-600 hover:text-rose-400 transition p-0.5">
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-2 sm:px-4 pt-2.5 sm:pt-3 overflow-x-auto hide-scrollbar">
        <div className="flex min-w-max gap-0.5 bg-[#0c1022]/80 border border-indigo-500/[0.07] rounded-xl p-1">
          {[
            { id: 'upload', icon: <Upload className="w-3.5 h-3.5" />, label: 'Upload', accent: 'indigo' },
            { id: 'tts', icon: <Mic className="w-3.5 h-3.5" />, label: 'TTS', accent: 'violet' },
            { id: 'captions', icon: <Subtitles className="w-3.5 h-3.5" />, label: 'Captions', accent: 'cyan' },
            { id: 'overlay', icon: <Layers className="w-3.5 h-3.5" />, label: 'Text', accent: 'amber' },
            { id: 'export', icon: <Download className="w-3.5 h-3.5" />, label: 'Export', accent: 'emerald' },
            { id: 'settings', icon: <Sliders className="w-3.5 h-3.5" />, label: 'Settings', accent: 'slate' },
            { id: 'moreFeatures', icon: <Sparkles className="w-3.5 h-3.5" />, label: 'More', accent: 'rose' },
            { id: 'backend', icon: <FolderArchive className="w-3.5 h-3.5" />, label: 'Projects', accent: 'emerald' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20 shadow-sm shadow-indigo-500/10'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-indigo-500/[0.04] border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

