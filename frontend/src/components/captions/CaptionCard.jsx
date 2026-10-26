import React, { useState } from 'react';
import { Copy, Check, Bookmark, Edit3, RotateCw, Hash, Share2, CheckCheck, Plus, Trash2 } from 'lucide-react';

export default function CaptionCard({
  captionData,
  isFirst = false,
  onRegenerate,
  onGenerateAnother,
  onFavoriteToggle,
  onDelete
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(captionData.caption);
  const [copiedType, setCopiedType] = useState(null); // 'caption', 'tags', 'all'
  const [isFavorite, setIsFavorite] = useState(captionData.is_favorite || false);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const toggleFav = () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    if (onFavoriteToggle) onFavoriteToggle(captionData.id, nextState, editedText);
  };

  const hashtagsStr = captionData.hashtags ? captionData.hashtags.join(' ') : '';
  const everythingStr = `${editedText}\n\n${hashtagsStr}`;

  const getPlatformBadge = (plat) => {
    const p = (plat || '').toLowerCase();
    if (p.includes('instagram')) return 'bg-rose-50 text-rose-700 border-rose-200/90';
    if (p.includes('linkedin')) return 'bg-blue-50 text-blue-700 border-blue-200/90';
    if (p.includes('twitter') || p.includes('x')) return 'bg-sky-50 text-sky-700 border-sky-200/90';
    if (p.includes('facebook')) return 'bg-indigo-50 text-indigo-700 border-indigo-200/90';
    return 'bg-zinc-100 text-zinc-800 border-zinc-200';
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-indigo-500/5 flex flex-col justify-between group relative">
      <div>
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-1.5">
            {isFirst && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-mono font-bold uppercase tracking-wider shadow-xs">
                Primary Pick
              </span>
            )}
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${getPlatformBadge(captionData.platform)}`}>
              {captionData.platform}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium capitalize border border-zinc-200">
              {captionData.style}
            </span>
            <span className="text-[11px] text-zinc-400 capitalize font-mono">
              {captionData.length}
            </span>
          </div>

          {/* Top Right Actions: Delete Caption */}
          {onDelete && (
            <button
              onClick={() => onDelete(captionData.id)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
              title="Delete this caption"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Caption Text Body */}
        {isEditing ? (
          <div className="space-y-2 mb-4">
            <textarea
              rows={4}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs focus:outline-none focus:border-zinc-900 leading-relaxed"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setEditedText(captionData.caption); setIsEditing(false); }}
                className="px-3 py-1 rounded-lg text-xs text-zinc-500 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-zinc-800 text-xs sm:text-sm leading-relaxed mb-4 whitespace-pre-line font-normal">
            {editedText}
          </p>
        )}

        {/* Suggested Hashtags */}
        {captionData.hashtags && captionData.hashtags.length > 0 && (
          <div className="mb-4 pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-1.5 font-medium font-mono">
              <Hash className="w-3.5 h-3.5 text-zinc-700" />
              <span>Hashtags:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {captionData.hashtags.slice(0, 6).map((tag, i) => (
                <span
                  key={i}
                  onClick={() => handleCopy(tag, `tag_${i}`)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 hover:bg-zinc-200 cursor-pointer transition border border-zinc-200"
                  title="Click to copy hashtag"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="space-y-3 pt-3 border-t border-zinc-100">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Left Actions */}
          <div className="flex items-center gap-1.5">
            {/* Prominent Save Caption Button */}
            <button
              onClick={toggleFav}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                isFavorite
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'text-zinc-700 hover:text-zinc-950 bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
              }`}
              title={isFavorite ? 'Saved in your library' : 'Save caption to library'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 transition"
              title="Edit caption"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {onRegenerate && (
              <button
                onClick={() => onRegenerate(captionData.id)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 transition"
                title="Regenerate this specific caption"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(captionData.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 transition"
                title="Delete this caption"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Copy Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCopy(editedText, 'caption')}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center gap-1 font-medium text-xs transition"
            >
              {copiedType === 'caption' ? <Check className="w-3.5 h-3.5 text-zinc-900" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copiedType === 'caption' ? 'Copied' : 'Copy'}</span>
            </button>

            {captionData.hashtags && captionData.hashtags.length > 0 && (
              <button
                onClick={() => handleCopy(everythingStr, 'all')}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white font-semibold flex items-center gap-1 text-xs shadow-sm transition"
                title="Copy caption and hashtags"
              >
                {copiedType === 'all' ? <CheckCheck className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedType === 'all' ? 'Copied All' : 'Copy All'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Generate Another Caption Button (at the end of first card) */}
        {isFirst && onGenerateAnother && (
          <div className="pt-2 border-t border-zinc-100">
            <button
              onClick={onGenerateAnother}
              className="w-full py-2 px-3 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-950 text-xs font-bold border border-indigo-200/90 flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-700" />
              <span>Generate Another Caption</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
