import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  UploadCloud,
  Sparkles,
  Plus,
  Check,
  Copy,
  Layers,
  Loader2,
  Calendar,
  Users,
  Target,
  FileImage
} from 'lucide-react';
import { api } from '../services/api';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'new'

  // Form states
  const [name, setName] = useState('Summer Collection 2026');
  const [productService, setProductService] = useState('Premium Sunglasses & Coastal Apparel');
  const [targetAudience, setTargetAudience] = useState('Young professionals & travelers');
  const [objective, setObjective] = useState('Product Launch');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Premium + Energetic');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchResults, setBatchResults] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await api.getCampaigns();
      if (res?.campaigns) setCampaigns(res.campaigns);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please select at least 1 image for the campaign.');
      return;
    }

    setLoading(true);
    setBatchResults(null);

    try {
      const formData = new FormData();
      formData.append('campaign_name', name);
      formData.append('product_service', productService);
      formData.append('target_audience', targetAudience);
      formData.append('objective', objective);
      formData.append('platform', platform);
      formData.append('tone', tone);

      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const res = await api.generateCampaignBatch(formData);
      setBatchResults(res);
      loadCampaigns();
    } catch (err) {
      alert('Failed to generate campaign captions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-brand-400" />
            <span>Marketing Campaign Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Campaign Studio</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Batch-generate cohesive, cross-platform captions for entire marketing campaigns across multiple product images.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            All Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'new' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-400" />
            <span>Configure Campaign Parameters</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Campaign Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Product / Service</label>
                <input
                  type="text"
                  value={productService}
                  onChange={(e) => setProductService(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Campaign Objective</label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-brand-500/40"
                >
                  <option>Product Launch</option>
                  <option>Brand Awareness</option>
                  <option>Seasonal Sale</option>
                  <option>Lead Generation</option>
                  <option>Community Growth</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-brand-500/40"
                >
                  <option>Instagram</option>
                  <option>LinkedIn</option>
                  <option>Facebook</option>
                  <option>Twitter / X</option>
                  <option>Advertisement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Brand Tone</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-brand-500/40"
                />
              </div>
            </div>

            {/* Multiple Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Upload Campaign Images (Batch)</label>
              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center bg-slate-900/40 hover:bg-slate-900/70 transition">
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="campaign-files"
                />
                <label htmlFor="campaign-files" className="cursor-pointer space-y-2 block">
                  <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl inline-block">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-white">Click to select multiple images</div>
                  <div className="text-[11px] text-slate-400">
                    {files.length > 0 ? `${files.length} images selected` : 'Select 2 to 10 campaign assets'}
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Multi-Image Campaign Batch...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Campaign Captions</span>
                </>
              )}
            </button>
          </form>

          {/* Batch Results Display */}
          {batchResults && (
            <div className="space-y-6 pt-6 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                <span>Batch processing complete for <strong>{batchResults.processed_images_count}</strong> images.</span>
                <span className="font-mono font-bold text-white">Campaign: {batchResults.campaign_name}</span>
              </div>

              <div className="space-y-4">
                {batchResults.results.map((res, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="font-bold text-white flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-brand-400" /> Image {res.image_index}: {res.filename}
                      </span>
                      <span className="text-slate-400 italic">Vision: "{res.raw_vision}"</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {res.captions.map((c, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                          <p className="text-slate-200 leading-relaxed font-normal">{c.caption}</p>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] text-emerald-400 font-semibold">{c.quality_score}% Match</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(c.caption)}
                              className="text-[11px] text-brand-400 hover:text-white"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Campaigns List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((cmp) => (
            <div key={cmp.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 hover:border-slate-700 transition">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold uppercase">
                  {cmp.platform}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 capitalize">
                  {cmp.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1">{cmp.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{cmp.product_service}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Audience:</span>
                  <span className="font-medium text-slate-200">{cmp.target_audience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tone:</span>
                  <span className="font-medium text-slate-200">{cmp.tone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assets / Captions:</span>
                  <span className="font-mono text-brand-400">{cmp.images_count} images · {cmp.captions_count} captions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
