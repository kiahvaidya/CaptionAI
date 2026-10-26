import React, { useState } from 'react';
import { FileText, Sparkles, Copy, Check, UploadCloud, Search, Eye, Tag, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function SeoStudio() {
  const [pageTopic, setPageTopic] = useState('Top 10 Coastal Travel Destinations in 2026');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setImageFile(f);
      const r = new FileReader();
      r.onload = (ev) => setPreview(ev.target.result);
      r.readAsDataURL(f);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (pageTopic) formData.append('page_topic', pageTopic);
      if (imageFile) formData.append('image', imageFile);

      const res = await api.generateSeo(formData);
      setResult(res.data);
    } catch (err) {
      alert('SEO generation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>SEO & Accessibility Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">SEO & Alt-Text Generator</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Enhance website accessibility (WCAG 2.1 compliance) and organic image search rankings with AI-grounded image alt text and keyword tags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <h2 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
            Image & Blog Context
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Article Topic / Webpage Context</label>
              <input
                type="text"
                value={pageTopic}
                onChange={(e) => setPageTopic(e.target.value)}
                placeholder="e.g. Sustainable Fashion Guide or Tech Setup 2026"
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold text-slate-300">Upload Image</label>
              <div className="border border-dashed border-slate-700 rounded-xl p-5 text-center bg-slate-900/50 hover:bg-slate-900 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="seo-img-upload"
                />
                <label htmlFor="seo-img-upload" className="cursor-pointer space-y-1 block">
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-32 mx-auto object-contain rounded-lg" />
                  ) : (
                    <div className="text-xs text-slate-400">
                      <UploadCloud className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                      <span>Upload image to extract visual context</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Analyzing Alt-Text...' : 'Generate SEO Alt-Text & Keywords'}</span>
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              {/* Alt Text */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Accessibility Alt-Text (&lt;img alt="..."&gt;)
                  </span>
                  <button
                    onClick={() => handleCopy(result.alt_text, 'alt')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                  >
                    {copiedKey === 'alt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'alt' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200">
                  alt="{result.alt_text}"
                </div>
              </div>

              {/* Human Caption */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">Human Editorial Caption</span>
                  <button
                    onClick={() => handleCopy(result.human_caption, 'cap')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                  >
                    {copiedKey === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cap' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">{result.human_caption}</p>
              </div>

              {/* SEO Description */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-400 uppercase tracking-wider">Search Engine Snippet & OpenGraph Meta</span>
                  <button
                    onClick={() => handleCopy(result.seo_description, 'seo')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                  >
                    {copiedKey === 'seo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'seo' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{result.seo_description}</p>
              </div>

              {/* Extracted SEO Keywords */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Extracted Keyword Entities
                  </span>
                  <button
                    onClick={() => handleCopy(result.keywords.join(', '), 'keys')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                  >
                    {copiedKey === 'keys' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'keys' ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 inline-block">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-white">No SEO Meta Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a blog or article photo to instantly generate accessibility-compliant Alt-Text and SEO-optimized image descriptions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
