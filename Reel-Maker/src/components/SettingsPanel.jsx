import React from 'react';
import { Layers, Loader2, Plus, Check, Edit2, Trash2, Image, Upload, Shuffle, ListOrdered } from 'lucide-react';

export default function SettingsPanel({
  activeTab,
  isLoggedIn,

  userPresets,
  presetName,
  setPresetName,
  saveCurrentPreset,
  presetSaving,
  presetLoading,
  applyPresetSettings,
  setLogs,
  collectCurrentSettings,
  api,
  loadUserPresets,
  deleteUserPreset,

  // Logo
  logoFile,
  logoEnabled,
  setLogoEnabled,
  handleLogoUpload,
  logoPreview,
  removeLogo,
  logoPosition,
  setLogoPosition,
  logoSize,
  setLogoSize,
  logoOpacity,
  setLogoOpacity,
  logoPadding,
  setLogoPadding,

  // Selection mode summary
  videoMode,
  setVideoMode,
  audioMode,
  setAudioMode,
  imageMode,
  setImageMode,
}) {
  if (activeTab !== 'settings') return null;

  return (
    <>
      {/* MY PRESETS - Save/Load Settings */}
      {isLoggedIn && (
        <div className="glass-card p-3 sm:p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs sm:text-sm font-bold text-indigo-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-400" /> My Presets
            </h3>
            <span className="text-[9px] text-gray-500">{userPresets.length} saved</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveCurrentPreset()}
              placeholder="Enter preset name..."
              className="flex-1 bg-[#080b16] border border-indigo-500/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:border-indigo-500/30 focus:outline-none transition"
            />
            <button
              onClick={saveCurrentPreset}
              disabled={presetSaving || !presetName.trim()}
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-indigo-950/30 disabled:shadow-none"
            >
              {presetSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Save
            </button>
          </div>
          <p className="text-[9px] text-gray-600">
            Saves all current Text &amp; Settings tab customizations. A preset named &quot;Current&quot; is auto-saved when you change any option (stays after logout/refresh).
          </p>

          {presetLoading && (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
          )}

          {!presetLoading && userPresets.length > 0 && (
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {userPresets.map((p) => (
                <div key={p._id} className="flex items-center justify-between bg-[#080b16]/80 border border-indigo-500/[0.07] rounded-lg px-2.5 py-2 group hover:border-indigo-500/20 transition">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Layers className="w-3 h-3 text-violet-400/60 shrink-0" />
                    <span className="text-[11px] text-gray-300 truncate font-medium">{p.name}</span>
                    <span className="text-[8px] text-gray-600 shrink-0">{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => {
                        applyPresetSettings(p.settings);
                        setLogs(`Preset "${p.name}" applied.`);
                      }}
                      className="px-2 py-0.5 rounded bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/10 text-[9px] text-indigo-300 font-semibold transition flex items-center gap-1"
                      title="Apply this preset"
                    >
                      <Check className="w-2.5 h-2.5" /> Apply
                    </button>
                    <button
                      onClick={() => {
                        const settings = collectCurrentSettings();
                        api
                          .updateUserPreset(p._id, { settings })
                          .then(() => {
                            setLogs(`Preset "${p.name}" updated with current settings.`);
                            loadUserPresets();
                          })
                          .catch((e) => setLogs('Update error: ' + (e?.message || e)));
                      }}
                      className="p-1 rounded hover:bg-violet-600/20 text-gray-500 hover:text-violet-400 transition"
                      title="Overwrite with current settings"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => deleteUserPreset(p._id, p.name)}
                      className="p-1 rounded hover:bg-rose-600/20 text-gray-500 hover:text-rose-400 transition"
                      title="Delete preset"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!presetLoading && userPresets.length === 0 && (
            <p className="text-[10px] text-gray-600 text-center py-2">No saved presets yet. Customize your settings and save them above.</p>
          )}
        </div>
      )}

      {/* LOGO/WATERMARK SECTION - Show on settings tab */}
      <div className="glass-card p-3 sm:p-4 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-gray-300 flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5" /> Logo
          </h3>
          {logoFile && (
            <button
              onClick={() => setLogoEnabled(!logoEnabled)}
              className={`text-[10px] px-1.5 py-0.5 rounded ${logoEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              {logoEnabled ? 'ON' : 'OFF'}
            </button>
          )}
        </div>

        {/* Logo Upload */}
        {!logoFile ? (
          <label className="cursor-pointer flex items-center justify-center gap-2 bg-gray-700/50 p-3 rounded-lg border border-dashed border-gray-500 hover:border-gray-400 transition">
            <Upload className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Upload Logo (PNG/JPG)</span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        ) : (
          <div className="space-y-3">
            {/* Logo Preview */}
            <div className="flex items-center gap-3 bg-gray-700/50 p-2 rounded">
              <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain rounded bg-gray-800" />
              <div className="flex-1">
                <p className="text-xs text-gray-300 truncate">{logoFile.name}</p>
                <p className="text-[10px] text-gray-500">{(logoFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>

            {/* Remove Logo Button */}
            <button
              onClick={removeLogo}
              className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 px-3 py-2 rounded border border-red-600/30 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs font-medium">Remove Logo</span>
            </button>

            {/* Logo Position Grid */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Position</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  ['top-left', '↖'], ['top-center', '↑'], ['top-right', '↗'],
                  ['middle-left', '←'], ['middle-center', '●'], ['middle-right', '→'],
                  ['bottom-left', '↙'], ['bottom-center', '↓'], ['bottom-right', '↘'],
                ].map(([pos, icon]) => (
                  <button
                    key={pos}
                    onClick={() => setLogoPosition(pos)}
                    className={`p-1.5 rounded text-sm transition ${
                      logoPosition === pos
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Size */}
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Size</span>
                <span>{logoSize}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={logoSize}
                onChange={(e) => setLogoSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-600 rounded-lg"
              />
            </div>

            {/* Logo Opacity */}
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Opacity</span>
                <span>{Math.round(logoOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={logoOpacity}
                onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-600 rounded-lg"
              />
            </div>

            {/* Logo Padding */}
            <div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Padding</span>
                <span>{logoPadding}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={logoPadding}
                onChange={(e) => setLogoPadding(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-600 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* SELECTION MODE SUMMARY - Show on settings tab */}
      <div className="glass-card p-3 sm:p-4 rounded-xl">
        <h3 className="text-xs sm:text-sm font-bold text-gray-300 mb-2 flex items-center gap-1.5">
          <Shuffle className="w-3.5 h-3.5" />
          Media Selection Mode
        </h3>
        <div className="space-y-1.5">
          {[
            { label: 'Video', mode: videoMode, setMode: setVideoMode, color: 'indigo' },
            { label: 'Audio', mode: audioMode, setMode: setAudioMode, color: 'violet' },
            { label: 'Image', mode: imageMode, setMode: setImageMode, color: 'pink' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">{item.label}</span>
              <div className="flex rounded overflow-hidden">
                <button
                  onClick={() => item.setMode('sequence')}
                  className={`px-2 py-0.5 text-[9px] flex items-center gap-1 transition ${
                    item.mode === 'sequence' ? `bg-${item.color}-600 text-white` : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                  }`}
                >
                  <ListOrdered className="w-2.5 h-2.5" /> Seq
                </button>
                <button
                  onClick={() => item.setMode('shuffle')}
                  className={`px-2 py-0.5 text-[9px] flex items-center gap-1 transition ${
                    item.mode === 'shuffle' ? `bg-${item.color}-600 text-white` : 'bg-indigo-500/[0.05] text-gray-500 hover:bg-indigo-500/[0.08]'
                  }`}
                >
                  <Shuffle className="w-2.5 h-2.5" /> Shuf
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[8px] text-gray-500 mt-2 text-center">
          Controls also available in each Upload tab section
        </p>
      </div>
    </>
  );
}

