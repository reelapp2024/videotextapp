import React from 'react';
import {
  Video,
  Upload,
  FolderInput,
  Trash2,
  ListOrdered,
  Shuffle,
  Image,
  Mic,
  Music,
  FileSpreadsheet,
} from 'lucide-react';

export default function UploadTab({
  activeTab,

  // Videos
  videos,
  handleVideoUpload,
  handleVideoFolderUpload,
  videoFolderInputRef,
  clearVideos,
  removeVideo,
  videoMode,
  setVideoMode,
  videoBatchSize,
  setVideoBatchSize,

  // Images
  imageFiles,
  handleImageUpload,
  handleImageFolderUpload,
  imageFolderInputRef,
  clearImages,
  removeImageFile,
  imageMode,
  setImageMode,
  imageBatchSize,
  setImageBatchSize,
  imageCombineMode,
  setImageCombineMode,
  imageSlideDurationSec,
  setImageSlideDurationSec,

  // Voice
  voiceFiles,
  handleVoiceUpload,
  handleVoiceFolderUpload,
  voiceFolderInputRef,
  clearVoiceFiles,
  removeVoiceFile,
  audioMode,
  setAudioMode,
  voiceBatchSize,
  setVoiceBatchSize,
  onStartVoiceCaptions,
  captionsUploading,

  // Music
  musicFiles,
  handleMusicUpload,
  handleMusicFolderUpload,
  musicFolderInputRef,
  clearMusicFiles,
  removeMusicFile,
  musicBatchSize,
  setMusicBatchSize,

  // Excel
  excelData,
  handleExcelUpload,
  previewRowIndex,
  setPreviewRowIndex,
}) {
  if (activeTab !== 'upload') return null;

  return (
    <div className="space-y-3">
      {/* VIDEOS */}
      <div className="bg-[#0c1022]/70 rounded-xl border border-indigo-500/[0.07] overflow-hidden">
        <div className="p-2 flex justify-between items-center border-b border-indigo-500/[0.07] bg-indigo-500/[0.04]">
          <span className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" /> Videos ({videos.length})
          </span>
          <div className="flex gap-1 flex-wrap justify-end">
            <label className="cursor-pointer text-[10px] bg-indigo-600 hover:bg-indigo-700 px-2 py-0.5 rounded text-white transition flex items-center gap-1">
              <Upload className="w-3 h-3" /> Add
              <input type="file" multiple accept="video/*" onChange={handleVideoUpload} className="hidden" />
            </label>
            <label className="cursor-pointer text-[10px] bg-indigo-600/80 hover:bg-indigo-700 px-2 py-0.5 rounded text-white transition flex items-center gap-1" title="Add videos from folder">
              <FolderInput className="w-3 h-3" /> Folder
              <input
                ref={(el) => {
                  videoFolderInputRef.current = el;
                  if (el) el.setAttribute('webkitdirectory', '');
                }}
                type="file"
                multiple
                onChange={handleVideoFolderUpload}
                className="hidden"
              />
            </label>
            {videos.length > 0 && (
              <button onClick={clearVideos} className="text-[10px] bg-red-600/70 hover:bg-red-600 px-2 py-0.5 rounded text-red-200 transition">
                Clear
              </button>
            )}
          </div>
        </div>
        {videos.length > 0 && (
          <div className="px-2 py-1 flex flex-col gap-1.5 border-b border-indigo-500/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Order:</span>
              <div className="flex rounded overflow-hidden">
                <button
                  onClick={() => setVideoMode('sequence')}
                  className={`px-2 py-0.5 text-[10px] flex items-center gap-1 transition ${
                    videoMode === 'sequence' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                  }`}
                >
                  <ListOrdered className="w-3 h-3" /> Sequence
                </button>
                <button
                  onClick={() => setVideoMode('shuffle')}
                  className={`px-2 py-0.5 text-[10px] flex items-center gap-1 transition ${
                    videoMode === 'shuffle' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                  }`}
                >
                  <Shuffle className="w-3 h-3" /> Shuffle
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Batch (videos per 1 output):</span>
              <input
                type="number"
                min="0"
                placeholder="All"
                value={videoBatchSize}
                onChange={(e) => setVideoBatchSize(e.target.value)}
                className="w-16 bg-[#080b16] border border-indigo-500/[0.1] rounded text-[10px] px-1.5 py-0.5 placeholder-gray-600"
              />
            </div>
          </div>
        )}
        <div className="max-h-[100px] overflow-y-auto p-1.5 space-y-1">
          {videos.length === 0 && <p className="text-[10px] text-gray-500 py-2 text-center">Click Add / Folder to add videos</p>}
          {videos.map((file, i) => (
            <div key={i} className="flex justify-between items-center gap-2 bg-indigo-500/[0.03] p-1.5 rounded-lg hover:bg-indigo-500/[0.06] transition">
              <span className="text-[10px] text-gray-500 w-4 flex-shrink-0">{i + 1}</span>
              <span className="text-[10px] text-gray-300 truncate flex-1">{file.name}</span>
              <button onClick={() => removeVideo(i)} className="text-red-400 hover:text-red-300 p-0.5" title="Remove">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* IMAGES */}
      <div className="bg-[#0c1022]/70 rounded-xl border border-indigo-500/[0.07] overflow-hidden">
        <div className="p-2 flex justify-between items-center border-b border-rose-500/[0.07] bg-rose-500/[0.04]">
          <span className="text-xs font-medium text-pink-300 flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5" /> Images ({imageFiles.length})
          </span>
          <div className="flex gap-1 flex-wrap justify-end">
            <label className="cursor-pointer text-[10px] bg-pink-600 hover:bg-pink-700 px-2 py-0.5 rounded text-white transition flex items-center gap-1">
              <Upload className="w-3 h-3" /> Add
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <label className="cursor-pointer text-[10px] bg-pink-600/80 hover:bg-pink-700 px-2 py-0.5 rounded text-white transition flex items-center gap-1" title="Add all images from folder">
              <FolderInput className="w-3 h-3" /> Folder
              <input
                ref={(el) => {
                  imageFolderInputRef.current = el;
                  if (el) el.setAttribute('webkitdirectory', '');
                }}
                type="file"
                multiple
                onChange={handleImageFolderUpload}
                className="hidden"
              />
            </label>
            {imageFiles.length > 0 && (
              <button onClick={clearImages} className="text-[10px] bg-red-600/70 hover:bg-red-600 px-2 py-0.5 rounded text-red-200 transition">
                Clear
              </button>
            )}
          </div>
        </div>
        {imageFiles.length > 0 && (
          <div className="px-2 py-1 flex flex-col gap-1.5 border-b border-indigo-500/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Order:</span>
              <div className="flex rounded overflow-hidden">
                <button
                  onClick={() => setImageMode('sequence')}
                  className={`px-2 py-0.5 text-[10px] flex items-center gap-1 transition ${
                    imageMode === 'sequence' ? 'bg-pink-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                  }`}
                >
                  <ListOrdered className="w-3 h-3" /> Sequence
                </button>
                <button
                  onClick={() => setImageMode('shuffle')}
                  className={`px-2 py-0.5 text-[10px] flex items-center gap-1 transition ${
                    imageMode === 'shuffle' ? 'bg-pink-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                  }`}
                >
                  <Shuffle className="w-3 h-3" /> Shuffle
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Batch (images per 1 video):</span>
              <input
                type="number"
                min="0"
                placeholder="All"
                value={imageBatchSize}
                onChange={(e) => setImageBatchSize(e.target.value)}
                className="w-16 bg-[#080b16] border border-indigo-500/[0.1] rounded text-[10px] px-1.5 py-0.5 placeholder-gray-600"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={imageCombineMode} onChange={(e) => setImageCombineMode(e.target.checked)} className="rounded" />
                <span className="text-[10px] text-pink-300">1 folder = 1 video (all images combined into one video)</span>
              </label>
              {imageCombineMode && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">Har image:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={imageSlideDurationSec}
                    onChange={(e) => setImageSlideDurationSec(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[10px] text-pink-300 w-8">{imageSlideDurationSec}s</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="max-h-[100px] overflow-y-auto p-1.5 space-y-1">
          {imageFiles.length === 0 && (
            <p className="text-[10px] text-gray-500 py-2 text-center">Images optional — Click Add/Folder to add. Sorted in numerical order.</p>
          )}
          {imageFiles.map((file, i) => (
            <div key={i} className="flex justify-between items-center gap-2 bg-indigo-500/[0.03] p-1.5 rounded-lg hover:bg-indigo-500/[0.06] transition">
              <span className="text-[10px] text-gray-500 w-4 flex-shrink-0">{i + 1}</span>
              <span className="text-[10px] text-gray-300 truncate flex-1">{file.name}</span>
              <button onClick={() => removeImageFile(i)} className="text-red-400 hover:text-red-300 p-0.5" title="Remove">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* VOICE */}
      <div className="bg-[#0c1022]/70 rounded-xl border border-indigo-500/[0.07] overflow-hidden">
        <div className="p-2 flex justify-between items-center border-b border-indigo-500/[0.08] bg-amber-900/20">
          <span className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" /> Voice ({voiceFiles.length})
          </span>
          <div className="flex gap-1 flex-wrap justify-end">
            <label className="cursor-pointer text-[10px] bg-amber-600 hover:bg-amber-700 px-2 py-0.5 rounded text-white transition flex items-center gap-1">
              <Upload className="w-3 h-3" /> Add
              <input type="file" multiple accept="audio/*" onChange={handleVoiceUpload} className="hidden" />
            </label>
            <label className="cursor-pointer text-[10px] bg-amber-600/80 hover:bg-amber-700 px-2 py-0.5 rounded text-white transition flex items-center gap-1" title="Add voices from folder">
              <FolderInput className="w-3 h-3" /> Folder
              <input
                ref={(el) => {
                  voiceFolderInputRef.current = el;
                  if (el) el.setAttribute('webkitdirectory', '');
                }}
                type="file"
                multiple
                onChange={handleVoiceFolderUpload}
                className="hidden"
              />
            </label>
            {voiceFiles.length > 0 && (
              <button onClick={clearVoiceFiles} className="text-[10px] bg-red-600/70 hover:bg-red-600 px-2 py-0.5 rounded text-red-200 transition">
                Clear
              </button>
            )}
          </div>
        </div>
        {voiceFiles.length > 0 && onStartVoiceCaptions && (
          <div className="px-2 py-1.5 border-b border-cyan-500/10">
            <button
              type="button"
              disabled={captionsUploading}
              onClick={onStartVoiceCaptions}
              className="w-full text-[10px] py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 text-white font-medium disabled:opacity-50"
            >
              {captionsUploading ? 'Captions generating…' : 'Generate captions (Hindi / English / Punjabi)'}
            </button>
          </div>
        )}
        {voiceFiles.length > 0 && (
          <div className="px-2 py-1 flex flex-col gap-1.5 border-b border-indigo-500/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Order:</span>
              <div className="flex rounded overflow-hidden">
                <button
                  onClick={() => setAudioMode('sequence')}
                  className={`px-2 py-0.5 text-[10px] flex items-center gap-1 transition ${
                    audioMode === 'sequence' ? 'bg-amber-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                  }`}
                >
                  <ListOrdered className="w-3 h-3" /> Sequence
                </button>
                <button
                  onClick={() => setAudioMode('shuffle')}
                  className={`px-2 py-0.5 text-[10px] flex items-center gap-1 transition ${
                    audioMode === 'shuffle' ? 'bg-amber-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                  }`}
                >
                  <Shuffle className="w-3 h-3" /> Shuffle
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Batch (voices per 1 video):</span>
              <input
                type="number"
                min="0"
                placeholder="1"
                value={voiceBatchSize}
                onChange={(e) => setVoiceBatchSize(e.target.value)}
                className="w-16 bg-[#080b16] border border-indigo-500/[0.1] rounded text-[10px] px-1.5 py-0.5 placeholder-gray-600"
              />
            </div>
          </div>
        )}
        <div className="max-h-[100px] overflow-y-auto p-1.5 space-y-1">
          {voiceFiles.length === 0 && <p className="text-[10px] text-gray-500 py-2 text-center">Click Add / Folder to add voice files</p>}
          {voiceFiles.map((file, i) => (
            <div key={i} className="flex justify-between items-center gap-2 bg-indigo-500/[0.03] p-1.5 rounded-lg hover:bg-indigo-500/[0.06] transition">
              <span className="text-[10px] text-gray-500 w-4 flex-shrink-0">{i + 1}</span>
              <span className="text-[10px] text-gray-300 truncate flex-1">{file.name}</span>
              <button onClick={() => removeVoiceFile(i)} className="text-red-400 hover:text-red-300 p-0.5" title="Remove">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MUSIC */}
      <div className="bg-[#0c1022]/70 rounded-xl border border-indigo-500/[0.07] overflow-hidden">
        <div className="p-2 flex justify-between items-center border-b border-indigo-500/[0.08] bg-purple-900/20">
          <span className="text-xs font-medium text-purple-300 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" /> Music ({musicFiles.length})
          </span>
          <div className="flex gap-1 flex-wrap justify-end">
            <label className="cursor-pointer text-[10px] bg-purple-600 hover:bg-purple-700 px-2 py-0.5 rounded text-white transition flex items-center gap-1">
              <Upload className="w-3 h-3" /> Add
              <input type="file" multiple accept="audio/*" onChange={handleMusicUpload} className="hidden" />
            </label>
            <label className="cursor-pointer text-[10px] bg-purple-600/80 hover:bg-purple-700 px-2 py-0.5 rounded text-white transition flex items-center gap-1" title="Add music from folder">
              <FolderInput className="w-3 h-3" /> Folder
              <input
                ref={(el) => {
                  musicFolderInputRef.current = el;
                  if (el) el.setAttribute('webkitdirectory', '');
                }}
                type="file"
                multiple
                onChange={handleMusicFolderUpload}
                className="hidden"
              />
            </label>
            {musicFiles.length > 0 && (
              <button onClick={clearMusicFiles} className="text-[10px] bg-red-600/70 hover:bg-red-600 px-2 py-0.5 rounded text-red-200 transition">
                Clear
              </button>
            )}
          </div>
        </div>
        {musicFiles.length > 0 && (
          <div className="px-2 py-1 flex flex-col gap-1.5 border-b border-indigo-500/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Order:</span>
              <div className="flex rounded overflow-hidden">
                <button
                  onClick={() => setAudioMode('sequence')}
                  className={`px-2 py-0.5 text-[10px] flex items-center gap-1 transition ${
                    audioMode === 'sequence' ? 'bg-purple-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                  }`}
                >
                  <ListOrdered className="w-3 h-3" /> Sequence
                </button>
                <button
                  onClick={() => setAudioMode('shuffle')}
                  className={`px-2 py-0.5 text-[10px] flex items-center gap-1 transition ${
                    audioMode === 'shuffle' ? 'bg-purple-600 text-white' : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                  }`}
                >
                  <Shuffle className="w-3 h-3" /> Shuffle
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Batch (music per 1 video):</span>
              <input
                type="number"
                min="0"
                placeholder="1"
                value={musicBatchSize}
                onChange={(e) => setMusicBatchSize(e.target.value)}
                className="w-16 bg-[#080b16] border border-indigo-500/[0.1] rounded text-[10px] px-1.5 py-0.5 placeholder-gray-600"
              />
            </div>
          </div>
        )}
        <div className="max-h-[100px] overflow-y-auto p-1.5 space-y-1">
          {musicFiles.length === 0 && <p className="text-[10px] text-gray-500 py-2 text-center">Click Add / Folder to add music files</p>}
          {musicFiles.map((file, i) => (
            <div key={i} className="flex justify-between items-center gap-2 bg-indigo-500/[0.03] p-1.5 rounded-lg hover:bg-indigo-500/[0.06] transition">
              <span className="text-[10px] text-gray-500 w-4 flex-shrink-0">{i + 1}</span>
              <span className="text-[10px] text-gray-300 truncate flex-1">{file.name}</span>
              <button onClick={() => removeMusicFile(i)} className="text-red-400 hover:text-red-300 p-0.5" title="Remove">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* EXCEL */}
      <div className="bg-[#0c1022]/70 rounded-xl border border-indigo-500/[0.07] overflow-hidden">
        <div className="p-2 flex justify-between items-center border-b border-indigo-500/[0.08] bg-green-900/20">
          <span className="text-xs font-medium text-green-300 flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel ({excelData.length} rows)
          </span>
          <label className="cursor-pointer text-[10px] bg-green-600 hover:bg-green-700 px-2 py-0.5 rounded text-white transition flex items-center gap-1">
            <Upload className="w-3 h-3" /> Upload
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} className="hidden" />
          </label>
        </div>
        {excelData.length > 0 && (
          <div className="p-2 space-y-1.5">
            <p className="text-[10px] text-gray-400">{excelData.length} rows, {excelData[0]?.length || 0} columns loaded</p>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-400 shrink-0">Preview me kis row ka content dikhe:</label>
              <select
                value={Math.min(previewRowIndex, excelData.length - 1)}
                onChange={(e) => setPreviewRowIndex(parseInt(e.target.value, 10))}
                className="bg-[#080b16] border border-indigo-500/30 rounded text-[10px] text-gray-300 px-2 py-1 focus:border-indigo-500/50 focus:outline-none"
              >
                {excelData.map((row, ri) => (
                  <option key={ri} value={ri}>Row {ri + 1}{row?.length ? ` (${row.length} cols)` : ''}</option>
                ))}
              </select>
            </div>
            <p className="text-[9px] text-gray-500">Default: sabse zyada columns wali row. Neeche preview me bhi ye selector hai.</p>
          </div>
        )}
      </div>
    </div>
  );
}

