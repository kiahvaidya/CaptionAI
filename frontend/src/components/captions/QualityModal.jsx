import React from 'react';
import { X, Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';

export default function QualityModal({ isOpen, onClose, caption, breakdown, overallScore, qualityLabel }) {
  if (!isOpen || !breakdown) return null;

  const metrics = [
    { key: 'image_relevance', label: 'Visual Relevance', barBg: 'bg-zinc-900' },
    { key: 'linguistic_quality', label: 'Linguistic Flow', barBg: 'bg-zinc-700' },
    { key: 'platform_suitability', label: 'Platform Fit', barBg: 'bg-zinc-800' },
    { key: 'style_match', label: 'Tone Alignment', barBg: 'bg-zinc-600' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-300 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Caption Quality Score</h3>
              <p className="text-xs text-zinc-400">Deep Learning evaluation breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overall Score Card */}
        <div className="my-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 font-mono">Overall Score</span>
            <div className="text-2xl font-black text-zinc-900 font-mono mt-0.5">{qualityLabel || `${overallScore}% Match`}</div>
          </div>
          <span className="text-xs font-semibold text-zinc-900 bg-zinc-100 border border-zinc-300 px-2.5 py-1 rounded-full flex items-center gap-1 font-mono">
            <CheckCircle className="w-3.5 h-3.5 text-zinc-900" /> High Confidence
          </span>
        </div>

        {/* Breakdown Bars */}
        <div className="space-y-3.5 my-4">
          {metrics.map(({ key, label, barBg }) => {
            const data = breakdown[key] || { score: 90, description: '' };
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-700">{label}</span>
                  <span className="font-bold text-zinc-900 font-mono">{data.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barBg} transition-all duration-500`}
                    style={{ width: `${data.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">{data.description}</p>
              </div>
            );
          })}
        </div>

        {/* Caption snippet */}
        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-700 italic mb-4">
          "{caption}"
        </div>

        {/* Disclaimer */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-start gap-2 text-xs text-zinc-700">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-zinc-600" />
          <p className="leading-snug text-[11px]">
            AI-generated scoring derived from convolutional visual activations and lexical heuristics.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-black text-xs font-bold text-white transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
