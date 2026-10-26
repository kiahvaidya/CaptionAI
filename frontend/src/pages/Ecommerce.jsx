import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Copy, Check, UploadCloud, ArrowRight, Tag, Loader2, Package } from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export default function Ecommerce() {
  const [productName, setProductName] = useState('Verona Minimalist Leather Handbag');
  const [category, setCategory] = useState('Luxury Handbags & Accessories');
  const [targetCustomer, setTargetCustomer] = useState('Modern working professionals and style purists');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setImageFile(f);
      const r = new FileReader();
      r.onload = (ev) => setImagePreview(ev.target.result);
      r.readAsDataURL(f);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('product_name', productName);
      formData.append('category', category);
      formData.append('target_customer', targetCustomer);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.generateEcommerce(formData);
      setResult(res.data);
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch (err) {}
    } catch (err) {
      alert('Generation failed: ' + err.message);
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          <span>E-Commerce Product Copy Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Product Studio</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Transform raw e-commerce catalog photos into complete multi-channel sales copy, short descriptions, SEO tags, and social captions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <h2 className="text-sm font-bold text-white pb-2 border-b border-slate-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span>Product Details</span>
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Product Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Target Customer Persona</label>
              <input
                type="text"
                value={targetCustomer}
                onChange={(e) => setTargetCustomer(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-slate-300">Product Image (Optional)</label>
              <div className="border border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-900/50 hover:bg-slate-900 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-img-upload"
                />
                <label htmlFor="product-img-upload" className="cursor-pointer space-y-1 block">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-28 mx-auto object-contain rounded-lg" />
                  ) : (
                    <div className="text-xs text-slate-400">
                      <UploadCloud className="w-5 h-5 mx-auto text-amber-400 mb-1" />
                      <span>Upload clean product shot</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Generating Product Assets...' : 'Generate E-Commerce Suite'}</span>
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              {/* Product Headline */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 uppercase tracking-wider">Product Caption</span>
                  <button
                    onClick={() => handleCopy(result.product_caption, 'cap')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                  >
                    {copiedKey === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cap' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">{result.product_caption}</p>
              </div>

              {/* Social Caption */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-pink-400 uppercase tracking-wider">Social Media Caption</span>
                  <button
                    onClick={() => handleCopy(result.social_caption, 'soc')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                  >
                    {copiedKey === 'soc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'soc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{result.social_caption}</p>
              </div>

              {/* Short Description */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider">Catalog Short Description</span>
                  <button
                    onClick={() => handleCopy(result.short_description, 'short')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                  >
                    {copiedKey === 'short' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'short' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{result.short_description}</p>
              </div>

              {/* Marketing Copy */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-400 uppercase tracking-wider">Full Marketing Copy</span>
                  <button
                    onClick={() => handleCopy(result.marketing_copy, 'mkt')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                  >
                    {copiedKey === 'mkt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'mkt' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{result.marketing_copy}</p>
              </div>

              {/* SEO Image Description & Tags */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider">SEO Image Description</span>
                  <button
                    onClick={() => handleCopy(result.seo_description, 'seo')}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                  >
                    {copiedKey === 'seo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'seo' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400">{result.seo_description}</p>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {result.suggested_hashtags.map((t, i) => (
                    <span key={i} className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
              <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 inline-block">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-white">No E-Commerce Copy Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fill out the product information on the left and click generate to receive a complete e-commerce marketing suite.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
