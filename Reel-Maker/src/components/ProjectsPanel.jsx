import React from 'react';
import { Layers, Zap } from 'lucide-react';

export default function ProjectsPanel({
  activeTab,
  api,
  config,
  excelData,
  setExcelData,
  setPreviewRowIndex,
  setConfig,
  setLogs,
  projects,
  setProjects,
  projectName,
  setProjectName,
  videos,
  voiceFiles,
  musicFiles,
}) {
  if (activeTab !== 'backend') return null;

  return (
    <div className="animate-fadeIn space-y-3">
      {/* SERVER STATUS */}
      <div className="bg-[#111730]/40 border border-indigo-500/[0.08] p-2.5 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Server Status</span>
          <button
            onClick={async () => {
              try {
                const r = await fetch((import.meta.env.VITE_API_URL || '') + '/healthz');
                const d = await r.json();
                setLogs(`Server: ${d.status}, MongoDB: ${d.mongodb?.status || 'unknown'}`);
              } catch (e) {
                setLogs('Server offline - browser fallback active');
              }
            }}
            className="text-[10px] text-indigo-400 hover:underline"
          >
            Check
          </button>
        </div>
      </div>

      {/* SAVE / LOAD PROJECT */}
      <div className="glass-card p-3 rounded-xl">
        <h3 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-1.5">
          <Layers className="w-4 h-4" /> Projects
        </h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full bg-[#080b16] border border-indigo-500/[0.1] rounded-lg p-2 text-xs text-gray-200 placeholder-gray-500"
          />
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const name = projectName || 'Untitled';
                try {
                  await api.saveProject(name, { config, excelData: excelData, overlays: config?.overlays }, null);
                  setLogs('Project "' + name + '" saved!');
                  try {
                    const list = await api.getProjects();
                    setProjects(Array.isArray(list) ? list : []);
                  } catch (_) {}
                } catch (e) {
                  setLogs('Save error: ' + (e?.message || e));
                }
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-xs font-bold transition"
            >
              Save
            </button>
            <button
              onClick={async () => {
                try {
                  const list = await api.getProjects();
                  const arr = Array.isArray(list) ? list : [];
                  setProjects(arr);
                  setLogs(arr.length + ' projects loaded');
                } catch (e) {
                  setLogs('Load error: ' + (e?.message || e));
                }
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded text-xs font-bold transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {projects.length > 0 && (
          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
            {projects.map((p) => (
              <div key={p._id} className="flex justify-between items-center text-xs bg-gray-900/50 p-1.5 rounded hover:bg-gray-800/50 transition gap-2">
                <span className="truncate flex-1 text-gray-300">{p.name}</span>
                <span className="text-[9px] text-gray-500 flex-shrink-0">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ''}</span>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={async () => {
                      try {
                        const proj = await api.getProject(p._id);
                        if (proj?.config) {
                          const c = proj.config;
                          if (c.config) setConfig((prev) => ({ ...prev, ...c.config }));
                          if (c.excelData && Array.isArray(c.excelData)) {
                            setExcelData(c.excelData);
                            const countCellsWithText = (row) => (row || []).filter((cell) => cell != null && cell !== undefined && String(cell).trim() !== '').length;
                            const idx = c.excelData.reduce(
                              (best, row, i) => (countCellsWithText(row) > countCellsWithText(c.excelData[best] || []) ? i : best),
                              0
                            );
                            setPreviewRowIndex(idx);
                          }
                          if (c.overlays && Array.isArray(c.overlays)) setConfig((prev) => ({ ...prev, overlays: c.overlays }));
                        }
                        setProjectName(proj?.name || p.name);
                        setLogs('Project "' + p.name + '" loaded!');
                      } catch (e) {
                        setLogs('Load error: ' + (e?.message || e));
                      }
                    }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 px-1.5 py-0.5 bg-indigo-600/20 rounded transition"
                  >
                    Load
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Delete "' + p.name + '"?')) return;
                      try {
                        await api.deleteProject(p._id);
                        setProjects((prev) => prev.filter((x) => x._id !== p._id));
                        setLogs('Deleted "' + p.name + '"');
                      } catch (e) {
                        setLogs('Delete error: ' + (e?.message || e));
                      }
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-0.5 bg-red-600/20 rounded transition"
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {projects.length === 0 && (
          <p className="text-[10px] text-gray-500 text-center mt-2">No projects yet. Save current config to start.</p>
        )}
      </div>

      {/* SERVER PROCESSING INFO */}
      <div className="glass-card p-3 rounded-xl">
        <h3 className="text-xs font-bold text-green-300 mb-1.5 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Server Processing
        </h3>
        <div className="space-y-1">
          <p className="text-[10px] text-gray-400">Every button (Start Video, Generate Images, TTS, Merge, Extract Audio, Thumbnails) automatically processes on the server.</p>
          <p className="text-[10px] text-gray-400">If the server is down, it falls back to browser processing.</p>
          <div className="grid grid-cols-2 gap-1 mt-2">
            <div className="bg-gray-900/50 p-1.5 rounded text-center">
              <p className="text-[9px] text-gray-500">Videos</p>
              <p className="text-xs font-bold text-indigo-400">{videos.length}</p>
            </div>
            <div className="bg-gray-900/50 p-1.5 rounded text-center">
              <p className="text-[9px] text-gray-500">Voice Files</p>
              <p className="text-xs font-bold text-purple-400">{voiceFiles.length}</p>
            </div>
            <div className="bg-gray-900/50 p-1.5 rounded text-center">
              <p className="text-[9px] text-gray-500">Music Files</p>
              <p className="text-xs font-bold text-pink-400">{musicFiles.length}</p>
            </div>
            <div className="bg-gray-900/50 p-1.5 rounded text-center">
              <p className="text-[9px] text-gray-500">Excel Rows</p>
              <p className="text-xs font-bold text-amber-400">{excelData.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

