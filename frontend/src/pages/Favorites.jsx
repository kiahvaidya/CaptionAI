import React, { useState, useEffect } from 'react';
import { Bookmark, Heart, Copy, Check, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory({ favorite_only: true });
      if (res?.history) setFavorites(res.history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfavorite = async (id) => {
    try {
      await api.toggleFavorite(id);
      setFavorites(favs => favs.filter(f => f.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    setFavorites(favs => favs.filter(f => f.id !== id));
    try {
      await api.deleteHistory(id);
    } catch (e) {
      console.error('Failed to delete item:', e);
      loadFavorites();
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-2">
          <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
          <span>Curated Captions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">Saved Captions</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Your bookmarked high-performing captions, ready to copy and post.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-zinc-400">Loading saved captions...</div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-300 hover:shadow-xs transition">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono border ${
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
                  <button
                    onClick={() => handleUnfavorite(item.id)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition"
                    title="Remove from saved"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  </button>
                </div>

                <div className="flex items-center gap-3 my-3">
                  <img
                    src={item.image_data_url}
                    alt={item.image_name}
                    className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-900 truncate">{item.image_name}</div>
                    <div className="text-[11px] text-zinc-400 truncate capitalize">{item.style} · {item.length}</div>
                  </div>
                </div>

                <p className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/80 text-xs text-zinc-800 leading-relaxed font-normal">
                  {item.best_caption}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete caption"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleCopy(item.best_caption, item.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-16 rounded-3xl border border-zinc-200 text-center space-y-2 shadow-sm">
          <Bookmark className="w-8 h-8 text-zinc-300 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900">No Saved Captions</h3>
          <p className="text-xs text-zinc-400">
            Click the Save button on any caption card in Studio to bookmark it here.
          </p>
        </div>
      )}
    </div>
  );
}
