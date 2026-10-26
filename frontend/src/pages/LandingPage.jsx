import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Share2,
  Briefcase,
  ShoppingBag,
  FileText,
  Clock,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const useCases = [
    {
      title: 'Social Media Managers',
      desc: 'Generate high-engagement Instagram, LinkedIn, and X captions in seconds with relevant hashtags.',
      icon: Share2
    },
    {
      title: 'Marketing Agencies',
      desc: 'Deliver scalable multi-channel copy for client campaigns with brand voice consistency.',
      icon: Briefcase
    },
    {
      title: 'E-Commerce Brands',
      desc: 'Transform product catalog imagery into persuasive product descriptions and launch copy.',
      icon: ShoppingBag
    },
    {
      title: 'Publishers & Creators',
      desc: 'Generate editorial captions and descriptive copy for web publishing and social channels.',
      icon: FileText
    }
  ];

  const steps = [
    { step: '01', title: 'Upload Image', desc: 'Drag and drop any photograph or product render in JPG, PNG, or WEBP.' },
    { step: '02', title: 'Visual Analysis', desc: 'Deep convolutional features extract scene context and prominent visual entities.' },
    { step: '03', title: 'Sequence Generation', desc: 'Recurrent language decoder synthesizes captions word-by-word with tone adaptation.' },
    { step: '04', title: 'Publish & Share', desc: 'Review quality match scores, edit in-place, copy hashtags, and publish.' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F9] text-slate-800 pb-20">
      {/* Hero Section */}
      <div className="relative pt-12 pb-16 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>Intelligent Image Captioning</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 mb-6 max-w-3xl mx-auto leading-tight">
          Turn images into <span className="text-brand-600">publish-ready</span> content.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          From pixels to polished copy. CaptionAI analyzes your visual assets to generate multi-platform captions, contextual hashtags, and quality estimates in seconds.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onGetStarted('studio')}
            className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition"
          >
            <span>Generate Captions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGetStarted('dashboard')}
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-surface-50 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm transition"
          >
            <span>View Dashboard</span>
          </button>
        </div>
      </div>

      {/* 4-Step Process */}
      <div className="py-12 px-6 max-w-5xl mx-auto border-t border-rose-100">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">How CaptionAI Works</h2>
          <p className="text-xs sm:text-sm text-slate-500">From visual pixels to publish-ready captions in four steps.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((item) => (
            <div key={item.step} className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-2">
              <span className="text-xs font-bold text-brand-600 font-mono">{item.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Target Personas */}
      <div className="py-12 px-6 max-w-5xl mx-auto border-t border-rose-100">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Built for Content Teams</h2>
          <p className="text-xs sm:text-sm text-slate-500">Optimized for creators, marketing agencies, and brands.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bg-white border border-rose-100 shadow-sm space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{uc.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{uc.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
