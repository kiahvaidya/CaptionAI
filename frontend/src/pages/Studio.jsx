import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Send,
  Loader2,
  Image as ImageIcon,
  Copy,
  Check,
  Share2,
  RotateCw,
  Hash,
  Activity,
  Layers,
  AlertTriangle,
  Plus
} from 'lucide-react';
import ImageUploader from '../components/upload/ImageUploader';
import CaptionCard from '../components/captions/CaptionCard';
import { api } from '../services/api';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'X / Twitter' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'blog', label: 'Blog' },
  { id: 'advertisement', label: 'Advertisement' },
  { id: 'general', label: 'General' }
];

const STYLES = [
  { id: 'creative', label: 'Creative', desc: 'Evocative & aesthetic' },
  { id: 'professional', label: 'Professional', desc: 'Strategic & polished' },
  { id: 'casual', label: 'Casual', desc: 'Friendly & authentic' },
  { id: 'funny', label: 'Funny', desc: 'Relatable & witty' },
  { id: 'inspirational', label: 'Inspirational', desc: 'Motivational & uplifting' },
  { id: 'promotional', label: 'Promotional', desc: 'Action-driven & clear' },
  { id: 'minimal', label: 'Minimal', desc: 'Short & refined' },
  { id: 'storytelling', label: 'Storytelling', desc: 'Narrative & descriptive' }
];

const LENGTHS = [
  { id: 'short', label: 'Short', desc: '< 10 words' },
  { id: 'medium', label: 'Medium', desc: '15-30 words' },
  { id: 'long', label: 'Long', desc: '40-80 words' }
];

const AUDIENCES = [
  'General',
  'Young adults',
  'Professionals',
  'Customers',
  'Travelers',
  'Food audience',
  'Fashion audience',
  'Custom'
];

export default function Studio({ onGenerationComplete, onNotify }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [platform, setPlatform] = useState('instagram');
  const [style, setStyle] = useState('creative');
  const [length, setLength] = useState('medium');
  const [audience, setAudience] = useState('General');
  const [customAudience, setCustomAudience] = useState('');
  const [numCaptions, setNumCaptions] = useState(5);
  const [customBrief, setCustomBrief] = useState('');

  // Generation State
  const [loading, setLoading] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedGlobalTags, setCopiedGlobalTags] = useState(false);
  const [showAttention, setShowAttention] = useState(false);

  const handleGenerate = async () => {
    if (!selectedImage) {
      alert('Please upload or select an image first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (selectedImage.file) {
        formData.append('image', selectedImage.file);
        if (selectedImage.file.name) {
          formData.append('filename', selectedImage.file.name);
        }
      } else if (selectedImage.dataUrl) {
        formData.append('image_b64', selectedImage.dataUrl);
        if (selectedImage.title || selectedImage.name) {
          formData.append('filename', selectedImage.title || selectedImage.name);
        }
      }
      formData.append('platform', platform);
      formData.append('style', style);
      formData.append('length', length);
      formData.append('audience', audience === 'Custom' ? customAudience : audience);
      formData.append('num_captions', numCaptions.toString());
      if (customBrief) formData.append('custom_brief', customBrief);

      const result = await api.generateCaptions(formData);
      setGenerationResult(result);
      if (onGenerationComplete) onGenerationComplete();

      if (onNotify) {
        onNotify({
          id: Date.now(),
          title: 'Captions Generated',
          message: `Generated ${result.captions?.length || numCaptions} captions for ${platform} (${style}).`,
          time: 'Just now',
          read: false
        });
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Generation failed. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCaption = async (captionId) => {
    setGenerationResult(prev => {
      if (!prev) return null;
      const updated = prev.captions.filter(c => c.id !== captionId);
      return { ...prev, captions: updated };
    });
    try {
      await api.deleteCaption(captionId);
    } catch (e) {
      console.error('Failed to delete caption from backend:', e);
    }
    if (onNotify) {
      onNotify({
        id: Date.now(),
        title: 'Caption Deleted',
        message: 'Removed caption from current workspace.',
        time: 'Just now',
        read: false
      });
    }
  };

  const handleFavoriteToggle = async (captionId, isFav) => {
    if (generationResult?.generation_id) {
      try {
        await api.toggleFavorite(generationResult.generation_id);
        if (onGenerationComplete) onGenerationComplete();
        if (onNotify && isFav) {
          onNotify({
            id: Date.now(),
            title: 'Caption Saved',
            message: 'Saved caption to your library.',
            time: 'Just now',
            read: false
          });
        }
      } catch (err) {
        console.error('Error toggling favorite:', err);
      }
    }
  };

  const copyAllGlobalTags = () => {
    if (generationResult?.suggested_hashtags) {
      navigator.clipboard.writeText(generationResult.suggested_hashtags.join(' '));
      setCopiedGlobalTags(true);
      setTimeout(() => setCopiedGlobalTags(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Studio Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Intelligent Image Captioning</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
          Generate Captions
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Upload any visual asset to analyze scene content and generate tailored social copy.
        </p>
      </div>

      {/* Main Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Upload & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between font-mono">
              <span>Step 1: Upload Visual</span>
              <span className="text-[11px] text-zinc-400 font-normal">JPG, PNG, WEBP</span>
            </h2>

            <ImageUploader
              selectedImage={selectedImage}
              onImageSelected={(img) => {
                setSelectedImage(img);
                setGenerationResult(null);
                setError(null);
              }}
              onClear={() => {
                setSelectedImage(null);
                setGenerationResult(null);
                setError(null);
              }}
            />
          </div>

          {/* Optional Brief */}
          <div className="bg-white p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-2">
            <label className="text-xs font-bold text-zinc-800 flex items-center justify-between">
              <span>Brand Context (Optional)</span>
              <span className="text-[10px] text-zinc-400 font-normal">Tone direction</span>
            </label>
            <input
              type="text"
              value={customBrief}
              onChange={(e) => setCustomBrief(e.target.value)}
              placeholder="e.g. Summer product launch, clean aesthetic"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Right Column: Parameters & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 pb-2 border-b border-zinc-100 flex items-center justify-between font-mono">
              <span>Step 2: Caption Parameters</span>
              <span className="text-zinc-800 font-semibold flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Options
              </span>
            </h2>

            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-800">Platform</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PLATFORMS.map((p) => {
                  const active = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Style Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-800">Style & Tone</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STYLES.map((s) => {
                  const active = style === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className={`text-[10px] truncate mt-0.5 ${active ? 'text-indigo-100' : 'text-zinc-400'}`}>{s.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Length & Number Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Length */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800">Caption Length</label>
                <div className="grid grid-cols-3 gap-2">
                  {LENGTHS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLength(l.id)}
                      className={`py-2 px-2 rounded-xl border text-center transition ${
                        length === l.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{l.label}</div>
                      <div className={`text-[10px] ${length === l.id ? 'text-indigo-100' : 'text-zinc-400'}`}>{l.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Captions */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-800">Variations</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNumCaptions(num)}
                      className={`py-2 px-2 rounded-xl border text-center transition ${
                        numCaptions === num
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{num}</div>
                      <div className={`text-[10px] ${numCaptions === num ? 'text-indigo-100' : 'text-zinc-400'}`}>Options</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-800">Target Audience</label>
              <div className="flex flex-wrap gap-2">
                {AUDIENCES.map((aud) => (
                  <button
                    key={aud}
                    onClick={() => setAudience(aud)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                      audience === aud
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
              {audience === 'Custom' && (
                <input
                  type="text"
                  value={customAudience}
                  onChange={(e) => setCustomAudience(e.target.value)}
                  placeholder="Enter custom audience (e.g. Modern minimal interior designers)"
                  className="w-full mt-2 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                />
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedImage}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-sm ${
                loading || !selectedImage
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 hover:scale-[1.005]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing image and generating captions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {numCaptions} Captions</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-zinc-800" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Results Section */}
      {generationResult && (
        <div className="space-y-6 pt-6 border-t border-zinc-200 animate-fade-in">
          {/* Deep Learning Vision Output Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/40 via-white to-violet-50/30 border border-indigo-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
                Visual Scene Prediction
              </div>
              <div className="text-sm font-semibold text-zinc-900">
                "{generationResult.raw_model_caption}"
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Model processed in <strong className="text-indigo-600">{generationResult.generation_latency_seconds}s</strong>
              </div>
            </div>

            {generationResult.attention_heatmap && (
              <button
                onClick={() => setShowAttention(!showAttention)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                  showAttention
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{showAttention ? 'Hide Focus Map' : 'View Visual Focus'}</span>
              </button>
            )}
          </div>

          {/* Attention Heatmap Visualization */}
          {showAttention && generationResult.attention_heatmap && (
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider font-mono">
                Visual Attention Region
              </h4>
              <div className="rounded-xl overflow-hidden border border-zinc-200 max-h-72 flex items-center justify-center bg-zinc-950">
                <img
                  src={generationResult.attention_heatmap.blended_heatmap_url}
                  alt="Visual Attention"
                  className="max-h-72 w-auto object-contain"
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                {generationResult.attention_heatmap.description}
              </p>
            </div>
          )}

          {/* Suggested Hashtags */}
          {generationResult.suggested_hashtags && (
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="font-bold text-zinc-800 flex items-center gap-1 font-mono">
                  <Hash className="w-3.5 h-3.5 text-indigo-600" /> Hashtags:
                </span>
                {generationResult.suggested_hashtags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-indigo-50/70 text-indigo-800 border border-indigo-200/80 text-[11px] font-medium font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <button
                onClick={copyAllGlobalTags}
                className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-semibold flex items-center gap-1 transition"
              >
                {copiedGlobalTags ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{copiedGlobalTags ? 'Copied' : 'Copy Hashtags'}</span>
              </button>
            </div>
          )}

          {/* Generated Captions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generationResult.captions.map((cap, idx) => (
              <CaptionCard
                key={cap.id}
                captionData={cap}
                isFirst={idx === 0}
                onRegenerate={() => handleGenerate()}
                onGenerateAnother={() => handleGenerate()}
                onFavoriteToggle={handleFavoriteToggle}
                onDelete={handleDeleteCaption}
              />
            ))}
          </div>

          {/* Bottom Generate Another Caption Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-sm shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Another Caption</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
