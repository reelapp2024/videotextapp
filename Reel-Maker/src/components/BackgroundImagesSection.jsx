import React from 'react';
import { Upload, Trash2 } from 'lucide-react';

export default function BackgroundImagesSection({ config, setConfig, updateGlobalConfig }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-gray-500 block">Background Images</label>
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        id="bg-img-upload"
        onChange={(e) => {
          const files = [...(e.target.files || [])];
          if (!files.length) return;
          setConfig((prev) => ({
            ...prev,
            background: {
              ...prev.background,
              images: [
                ...(prev.background?.images || []),
                ...files.map((f, i) => ({ id: Date.now() + i, url: URL.createObjectURL(f), name: f.name })),
              ],
            },
          }));
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => document.getElementById('bg-img-upload')?.click()}
        className="w-full py-1.5 px-2 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] flex items-center justify-center gap-1"
      >
        <Upload className="w-3 h-3" /> Add Images
      </button>
      <div className="flex justify-between items-center">
        <span className="text-[9px] text-gray-500">Use:</span>
        <select
          className="bg-gray-700 rounded text-[10px] p-0.5"
          value={config.background?.imageVideoMode || 'first'}
          onChange={(e) => updateGlobalConfig('background', 'imageVideoMode', e.target.value)}
        >
          <option value="first">First</option>
          <option value="sequence">Sequence per video</option>
          <option value="shuffle">Shuffle</option>
        </select>
      </div>
      <div className="max-h-20 overflow-y-auto space-y-0.5">
        {(config.background?.images || []).map((img, i) => (
          <div key={img.id} className="flex items-center gap-1 bg-gray-800/50 p-1 rounded text-[9px]">
            <span className="truncate flex-1">{img.name}</span>
            <button
              type="button"
              onClick={() => {
                setConfig((prev) => ({
                  ...prev,
                  background: {
                    ...prev.background,
                    images: prev.background?.images?.filter((_, idx) => idx !== i) || [],
                  },
                }));
              }}
              className="text-red-400 hover:text-red-300 p-0.5"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
