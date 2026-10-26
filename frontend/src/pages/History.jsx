import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Heart,
  Copy,
  Check,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';

export default function History({ onFavoriteUpdated }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedVarIndex, setSelectedVarIndex] = useState({});
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    loadHistory();
  }, [platformFilter, styleFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory({
        search: search,
        platform: platformFilter,
        style: styleFilter,
        favorite_only: false
      });
      if (res?.history) setHistoryItems(res.history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadHistory();
  };

  const handleToggleFavorite = async (id) => {
    try {
      const res = await api.toggleFavorite(id);
      setHistoryItems(items =>
        items.map(item => item.id === id ? { ...item, is_favorite: res.is_favorite ? 1 : 0 } : item)
      );
      if (onFavoriteUpdated) onFavoriteUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    setHistoryItems(items => items.filter(item => item.id !== id));
    try {
      await api.deleteHistory(id);
      if (onFavoriteUpdated) onFavoriteUpdated();
    } catch (e) {
      console.error('Failed to delete item from history:', e);
      loadHistory();
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-2">
          <HistoryIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>Caption Archive</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">Generation History</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Search, filter, and inspect all generated caption variations across previous sessions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords, captions, or file names..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-600"
          />
        </form>

        {/* Platform Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Platform:</span>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-indigo-600 cursor-pointer capitalize"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">X / Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="blog">Blog</option>
            <option value="advertisement">Advertisement</option>
          </select>
        </div>

        {/* Style Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Style:</span>
          <select
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-indigo-600 cursor-pointer capitalize"
          >
            <option value="all">All Styles</option>
            <option value="creative">Creative</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="funny">Funny</option>
            <option value="promotional">Promotional</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-zinc-400">Loading history records...</div>
      ) : historyItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyItems.map((item) => {
            const captionsList = (item.captions && item.captions.length > 0)
              ? item.captions
              : [{ id: item.id, caption_text: item.best_caption, quality_score: 92.0 }];

            const activeIdx = selectedVarIndex[item.id] || 0;
            const currentCaption = captionsList[activeIdx] || captionsList[0];
            const isExpanded = expandedItems.has(item.id);

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-zinc-200 hover:border-indigo-300 transition-all shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Header: Platform, Style, Favorite */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase border ${
                        item.platform?.toLowerCase() === 'instagram'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.platform?.toLowerCase() === 'linkedin'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : item.platform?.toLowerCase() === 'twitter' || item.platform?.toLowerCase() === 'x'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {item.platform}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium capitalize border border-zinc-200">
                        {item.style}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(item.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        item.is_favorite
                          ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                          : 'text-zinc-400 hover:text-zinc-800 border-zinc-200 bg-white'
                      }`}
                      title={item.is_favorite ? 'Saved' : 'Save caption'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${item.is_favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Image and Metadata */}
                  <div className="flex items-center gap-3 my-3">
                    <img
                      src={item.image_data_url}
                      alt={item.image_name}
                      className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-zinc-900 truncate">{item.image_name}</div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" /> {item.created_at}
                      </div>
                    </div>
                  </div>

                  {/* Variation Selectors / All Variations View */}
                  {!isExpanded ? (
                    <div className="space-y-2">
                      {captionsList.length > 1 && (
                        <div className="flex items-center justify-between gap-1 pb-1">
                          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                            {captionsList.map((c, idx) => (
                              <button
                                key={c.id || idx}
                                onClick={() => setSelectedVarIndex(prev => ({ ...prev, [item.id]: idx }))}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                                  activeIdx === idx
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                }`}
                              >
                                Var {idx + 1}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold shrink-0 ml-1 flex items-center gap-0.5"
                          >
                            <span>All ({captionsList.length})</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/80 text-xs text-zinc-800 leading-relaxed relative">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-1.5 pb-1 border-b border-zinc-200/60">
                          <span className="font-semibold text-zinc-600">
                            Variation {activeIdx + 1} of {captionsList.length}
                          </span>
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200/50">
                            {Math.round(currentCaption.quality_score || 90)}% Quality
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{currentCaption.caption_text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[11px] font-bold text-zinc-800">
                          All {captionsList.length} Generated Variations
                        </span>
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
                        >
                          <span>Collapse</span>
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {captionsList.map((c, idx) => (
                          <div
                            key={c.id || idx}
                            className={`p-2.5 rounded-xl border text-xs leading-relaxed transition ${
                              activeIdx === idx
                                ? 'bg-indigo-50/40 border-indigo-200 text-zinc-900'
                                : 'bg-zinc-50/70 border-zinc-200 text-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mb-1.5 pb-1 border-b border-zinc-200/50">
                              <span className="font-bold text-zinc-700">Variation {idx + 1}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/50">
                                  {Math.round(c.quality_score || 90)}%
                                </span>
                                <button
                                  onClick={() => handleCopy(c.caption_text, `${item.id}_${idx}`)}
                                  className="px-2 py-0.5 rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-[10px] text-zinc-700 flex items-center gap-1 font-sans font-medium shadow-xs"
                                  title="Copy this caption variation"
                                >
                                  {copiedId === `${item.id}_${idx}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-zinc-500" />
                                  )}
                                  <span>{copiedId === `${item.id}_${idx}` ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>
                            <p className="whitespace-pre-wrap text-[11px] text-zinc-800">{c.caption_text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {captionsList.length > 1 && (
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Layers className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{isExpanded ? 'Collapse' : `All (${captionsList.length})`}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(currentCaption.caption_text, item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-16 rounded-3xl border border-zinc-200 text-center space-y-2 shadow-sm">
          <HistoryIcon className="w-8 h-8 text-zinc-300 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900">No History Records Found</h3>
          <p className="text-xs text-zinc-400">
            Generate captions in Studio to see previous items archived here.
          </p>
        </div>
      )}
    </div>
  );
}
