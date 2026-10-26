import React, { useState } from 'react';
import { CreditCard, Check, ArrowRight, Zap } from 'lucide-react';
import { api } from '../services/api';

export default function Pricing({ currentTier, onTierUpdated }) {
  const [activePlan, setActivePlan] = useState(currentTier || 'pro');
  const [updating, setUpdating] = useState(false);

  const tiers = [
    {
      id: 'free',
      name: 'Free Starter',
      price: '₹0',
      period: 'forever',
      desc: 'For individuals exploring AI image captioning.',
      features: [
        '10 images / month',
        '3 caption variations per image',
        'Standard styles (Creative, Casual, Professional)',
        'Full caption history archive',
        'Direct copy & export tools'
      ],
      cta: 'Current Plan',
      highlight: false
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '₹499',
      period: '/ month',
      desc: 'For creators, social media managers, and digital marketers.',
      features: [
        '500 images / month',
        'Up to 10 caption variations per image',
        'All 8 caption styles & platform tones',
        'Contextual hashtag generator',
        'Quality score breakdown & validation',
        'Model visual attention heatmap viewer',
        'Priority GPU / MPS processing'
      ],
      cta: 'Select Pro Plan',
      highlight: true
    },
    {
      id: 'business',
      name: 'Business',
      price: '₹1,999',
      period: '/ month',
      desc: 'For agencies and brands needing high-volume caption generation.',
      features: [
        'Unlimited image processing',
        'Full REST API access & token management',
        'Multi-member workspace collaboration',
        'Brand voice fine-tuning profiles',
        'Dedicated SLA and priority support'
      ],
      cta: 'Select Business Plan',
      highlight: false
    }
  ];

  const handleSelectTier = async (tierId) => {
    if (tierId === activePlan) return;
    setUpdating(true);
    try {
      await api.upgradeTier(tierId);
      setActivePlan(tierId);
      if (onTierUpdated) onTierUpdated(tierId);
    } catch (e) {
      alert('Upgrade failed: ' + e.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
          <CreditCard className="w-3.5 h-3.5 text-zinc-900" />
          <span>Transparent Plans</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-950">
          Simple, Predictable Pricing
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Choose a plan that matches your monthly content production volume.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tiers.map((tier) => {
          const isCurrent = activePlan === tier.id;
          return (
            <div
              key={tier.id}
              className={`rounded-3xl p-7 flex flex-col justify-between transition-all bg-white relative ${
                tier.highlight
                  ? 'border-2 border-zinc-900 shadow-elevated md:-translate-y-1'
                  : 'border border-zinc-200 shadow-sm'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-wider font-mono shadow-sm">
                  Recommended
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-bold text-zinc-950">{tier.name}</h3>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300 font-mono">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mb-6">{tier.desc}</p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-zinc-100">
                  <span className="text-3xl font-black text-zinc-950 font-mono">{tier.price}</span>
                  <span className="text-xs text-zinc-400">{tier.period}</span>
                </div>

                <div className="space-y-3 mb-8">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Included Features:</span>
                  <ul className="space-y-2.5 text-xs text-zinc-700">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleSelectTier(tier.id)}
                disabled={updating || isCurrent}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-zinc-100 text-zinc-400 cursor-default border border-zinc-200 font-mono'
                    : tier.highlight
                    ? 'bg-zinc-900 hover:bg-black text-white shadow-sm'
                    : 'bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300'
                }`}
              >
                <span>{isCurrent ? 'Current Plan' : tier.cta}</span>
                {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
