import React, { useState } from 'react';
import { Eye, Layers, Sparkles, Activity, Crosshair } from 'lucide-react';

export default function AttentionViewer({ originalImage, heatmapData, rawCaption }) {
  const [viewMode, setViewMode] = useState('overlay'); // 'overlay', 'side-by-side', 'original', 'heatmap'

  if (!heatmapData) return null;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-slate-900/60 shadow-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Deep Learning Model Explainability
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                ResNet50 Conv5_x Heatmap
              </span>
            </h4>
            <p className="text-xs text-slate-400">Spatial feature activation map showing neural focus areas</p>
          </div>
        </div>

        {/* View mode toggle tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1 rounded-lg transition font-medium ${viewMode === 'overlay' ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Overlay Blend
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1 rounded-lg transition font-medium ${viewMode === 'side-by-side' ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1 rounded-lg transition font-medium ${viewMode === 'heatmap' ? 'bg-brand-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Raw Activation
          </button>
        </div>
      </div>

      {/* Visual Display */}
      {viewMode === 'overlay' && (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-80 flex items-center justify-center bg-black">
          <img
            src={heatmapData.blended_heatmap_url}
            alt="Attention Heatmap Overlay"
            className="w-full h-auto max-h-80 object-contain"
          />
          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-2 text-xs text-slate-200">
            <Crosshair className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>{heatmapData.description}</span>
          </div>
        </div>
      )}

      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-400" /> Original Input
            </span>
            <div className="rounded-xl overflow-hidden border border-slate-700 max-h-64 flex items-center justify-center bg-black">
              <img src={originalImage} alt="Original" className="w-full h-auto max-h-64 object-contain" />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" /> Spatial Feature Map (7×7 ResNet)
            </span>
            <div className="rounded-xl overflow-hidden border border-slate-700 max-h-64 flex items-center justify-center bg-black">
              <img src={heatmapData.blended_heatmap_url} alt="Heatmap" className="w-full h-auto max-h-64 object-contain" />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'heatmap' && (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-80 flex items-center justify-center bg-black">
          <img
            src={heatmapData.raw_heatmap_url}
            alt="Raw Activation Map"
            className="w-full h-auto max-h-80 object-contain"
          />
          <div className="absolute top-3 right-3 bg-black/80 px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 border border-emerald-500/30">
            Activation: [0.0 → 1.0]
          </div>
        </div>
      )}

      {/* Caption Context */}
      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-start gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Visual Grounding: </span>
          <span className="text-slate-300">
            The neural feature maps highlight pixels corresponding to key entities ({rawCaption}), directing the LSTM token decoder to prioritize visually grounded vocabulary during beam decoding.
          </span>
        </div>
      </div>
    </div>
  );
}
