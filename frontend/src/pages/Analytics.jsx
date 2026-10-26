import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Share2,
  Zap,
  CheckCircle,
  Calculator,
  ArrowUpRight,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  DollarSign,
  Radio,
  Check,
  X,
  ShieldCheck,
  Activity,
  Cpu,
  Sliders,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';

const InstagramIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const TwitterIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function Analytics({ user, onUserUpdated, onNotify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'social', 'roi'
  const [channelFilter, setChannelFilter] = useState('all');
  const [monthlyImages, setMonthlyImages] = useState(60);

  // Social account connection state
  const [socialConnected, setSocialConnected] = useState({
    instagram: Boolean(user?.instagram_connected ?? true),
    linkedin: Boolean(user?.linkedin_connected ?? false),
    twitter: Boolean(user?.twitter_connected ?? false)
  });

  // Modal state for Instagram connection
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [modalHandle, setModalHandle] = useState(
    user?.instagram_handle || `@${(user?.brand_name || 'studioone').toLowerCase().replace(/\s+/g, '')}`
  );
  const [modalBrandName, setModalBrandName] = useState(user?.brand_name || 'Studio One');
  const [modalCategory, setModalCategory] = useState(user?.instagram_category || 'Brand / Business');
  const [modalPageId, setModalPageId] = useState(user?.instagram_page_id || 'FB-PAGE-98421');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.instagram_connected !== undefined) {
        setSocialConnected(prev => ({ ...prev, instagram: Boolean(user.instagram_connected) }));
      }
      if (user.instagram_handle) setModalHandle(user.instagram_handle);
      if (user.brand_name) setModalBrandName(user.brand_name);
      if (user.instagram_category) setModalCategory(user.instagram_category);
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      const res = await api.getAnalyticsOverview();
      setData(res);
      if (res?.personal?.social_connected) {
        setSocialConnected(res.personal.social_connected);
      }
    } catch (e) {
      console.error('Failed to load analytics overview:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConnectModal = () => {
    setModalHandle(
      user?.instagram_handle || `@${(user?.brand_name || 'studioone').toLowerCase().replace(/\s+/g, '')}`
    );
    setModalBrandName(user?.brand_name || 'Studio One');
    setModalCategory(user?.instagram_category || 'Brand / Business');
    setModalPageId(user?.instagram_page_id || 'FB-PAGE-98421');
    setShowConnectModal(true);
  };

  const handleConfirmConnect = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      const formattedHandle = modalHandle.startsWith('@') ? modalHandle : `@${modalHandle}`;
      
      // Update social connection status
      await api.toggleSocial('instagram', true, {
        handle: formattedHandle,
        category: modalCategory,
        business_page: modalPageId
      });

      // Update user profile
      const updateRes = await api.updateProfile({
        brand_name: modalBrandName,
        instagram_handle: formattedHandle,
        instagram_category: modalCategory,
        instagram_page_id: modalPageId
      });

      if (onUserUpdated && updateRes?.user) {
        onUserUpdated(updateRes.user);
      }

      setSocialConnected(prev => ({ ...prev, instagram: true }));
      setShowConnectModal(false);

      if (onNotify) {
        onNotify({
          id: Date.now(),
          title: 'Instagram Business Connected',
          message: `Connected ${formattedHandle} (${modalBrandName}) successfully.`,
          time: 'Just now',
          read: false
        });
      }

      // Refresh analytics data
      loadAnalytics();
    } catch (err) {
      console.error('Failed to connect Instagram account:', err);
      alert('Failed to connect Instagram account. Please try again.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Do you want to disconnect your Instagram Business account? Post insights and ad analytics will be paused.')) {
      return;
    }
    try {
      await api.toggleSocial('instagram', false);
      setSocialConnected(prev => ({ ...prev, instagram: false }));
      setShowConnectModal(false);

      if (onNotify) {
        onNotify({
          id: Date.now(),
          title: 'Instagram Disconnected',
          message: 'Instagram Business account disconnected.',
          time: 'Just now',
          read: false
        });
      }
      loadAnalytics();
    } catch (err) {
      console.error('Failed to disconnect Instagram:', err);
    }
  };

  const handleToggleLinkedIn = async () => {
    const nextVal = !socialConnected.linkedin;
    setSocialConnected(prev => ({ ...prev, linkedin: nextVal }));
    try {
      await api.toggleSocial('linkedin', nextVal);
      if (onNotify) {
        onNotify({
          id: Date.now(),
          title: 'LinkedIn Sync Updated',
          message: `LinkedIn account ${nextVal ? 'connected' : 'disconnected'}.`,
          time: 'Just now',
          read: false
        });
      }
    } catch (err) {
      console.error('Failed to toggle LinkedIn:', err);
    }
  };

  const handleToggleTwitter = async () => {
    const nextVal = !socialConnected.twitter;
    setSocialConnected(prev => ({ ...prev, twitter: nextVal }));
    try {
      await api.toggleSocial('twitter', nextVal);
      if (onNotify) {
        onNotify({
          id: Date.now(),
          title: 'X / Twitter Sync Updated',
          message: `X / Twitter account ${nextVal ? 'connected' : 'disconnected'}.`,
          time: 'Just now',
          read: false
        });
      }
    } catch (err) {
      console.error('Failed to toggle Twitter:', err);
    }
  };

  const personal = data?.personal;
  const currentBrand = user?.brand_name || personal?.brand_name || 'Studio One';
  const currentIgHandle = user?.instagram_handle || personal?.instagram_handle || `@${currentBrand.toLowerCase().replace(/\s+/g, '')}`;

  const summary = {
    total_images: personal?.total_images ?? data?.summary?.total_images_processed ?? 1,
    total_captions: personal?.total_captions ?? data?.summary?.total_captions_generated ?? 5,
    total_saved: personal?.total_saved ?? 1,
    hours_saved: personal?.hours_saved ?? 0.2,
    cost_saved_inr: personal?.cost_saved_inr ?? '₹170',
    avg_latency: personal?.avg_latency ?? 2.1
  };

  const timeline = data?.trends?.generation_timeline || [
    { date: 'Mon', captions: 12 },
    { date: 'Tue', captions: 18 },
    { date: 'Wed', captions: 14 },
    { date: 'Thu', captions: 25 },
    { date: 'Fri', captions: 30 },
    { date: 'Sat', captions: 16 },
    { date: 'Sun', captions: 22 }
  ];

  const platforms = personal?.platform_breakdown || [
    { name: 'Instagram', value: 55, color: '#E1306C' },
    { name: 'LinkedIn', value: 25, color: '#0A66C2' },
    { name: 'X / Twitter', value: 20, color: '#0284C7' }
  ];

  const stylesDistribution = [
    { style: 'Creative', count: 42 },
    { style: 'Professional', count: 34 },
    { style: 'Minimal', count: 28 },
    { style: 'Casual', count: 20 },
    { style: 'Promotional', count: 18 }
  ];

  // Post metrics dynamically using user brand and handle
  const rawPostMetrics = personal?.connected_post_metrics || [
    {
      id: 'post_ig_1',
      platform: 'Instagram',
      handle: currentIgHandle,
      brand_name: currentBrand,
      caption_snippet: `Strategic focus at ${currentBrand}: disciplined execution and modern distinction across every customer touchpoint...`,
      posted_at: 'Yesterday at 18:30',
      impressions: '14,820',
      reach: '11,240',
      engagement_rate: '4.8%',
      likes: 642,
      comments: 48,
      shares: 89,
      saves: 112,
      ad_status: 'Organic',
      roas: 'N/A',
      ctr: 'N/A'
    },
    {
      id: 'post_ig_2',
      platform: 'Instagram',
      handle: currentIgHandle,
      brand_name: currentBrand,
      caption_snippet: `Elevating standards at ${currentBrand}. Crafted with architectural precision and high-impact visual clarity...`,
      posted_at: '3 days ago',
      impressions: '38,400',
      reach: '29,150',
      engagement_rate: '6.2%',
      likes: 1420,
      comments: 94,
      shares: 210,
      saves: 384,
      ad_status: 'Sponsored Ad',
      ctr: '2.84%',
      roas: '3.4x'
    },
    {
      id: 'post_li_1',
      platform: 'LinkedIn',
      handle: currentBrand,
      brand_name: currentBrand,
      caption_snippet: `Growth at ${currentBrand} is powered by disciplined execution, continuous talent development, and purposeful technology...`,
      posted_at: '4 days ago',
      impressions: '8,940',
      reach: '7,100',
      engagement_rate: '5.4%',
      likes: 312,
      comments: 61,
      shares: 34,
      saves: 78,
      ad_status: 'Organic',
      roas: 'N/A',
      ctr: 'N/A'
    }
  ];

  // Ensure active post metrics use the latest state handle
  const postMetrics = rawPostMetrics.map(p => {
    if (p.platform === 'Instagram') {
      return { ...p, handle: currentIgHandle, brand_name: currentBrand };
    }
    if (p.platform === 'LinkedIn') {
      return { ...p, handle: currentBrand, brand_name: currentBrand };
    }
    return p;
  });

  // Filtered post metrics based on channel filter and connected status
  const visiblePostMetrics = postMetrics.filter(p => {
    const platKey = p.platform.toLowerCase().replace(' / twitter', '');
    if (!socialConnected[platKey]) return false;
    if (channelFilter === 'all') return true;
    return p.platform.toLowerCase().includes(channelFilter);
  });

  // Dedicated Ad Campaigns Performance Data
  const adCampaigns = [
    {
      id: 'cmp_1',
      name: `${currentBrand} Q3 Acquisition Ad`,
      platform: 'Instagram Sponsored',
      objective: 'Website Conversions',
      spend: '₹14,200',
      impressions: '38,400',
      clicks: '1,090',
      ctr: '2.84%',
      cpc: '₹13.02',
      conversions: 84,
      roas: '3.4x',
      status: 'Active'
    },
    {
      id: 'cmp_2',
      name: `${currentBrand} Leadership Spotlight`,
      platform: 'LinkedIn Sponsored Content',
      objective: 'Brand Awareness & Inquiries',
      spend: '₹18,500',
      impressions: '22,100',
      clicks: '720',
      ctr: '3.25%',
      cpc: '₹25.69',
      conversions: 46,
      roas: '4.1x',
      status: 'Active'
    },
    {
      id: 'cmp_3',
      name: `${currentBrand} Summer Launch Retargeting`,
      platform: 'Instagram Carousel Ad',
      objective: 'Product Catalog Sales',
      spend: '₹9,800',
      impressions: '26,700',
      clicks: '815',
      ctr: '3.05%',
      cpc: '₹12.02',
      conversions: 62,
      roas: '3.8x',
      status: 'Completed'
    }
  ];

  // ROI Calculator Math
  const manualHours = Math.round((monthlyImages * 18) / 60);
  const captionAiHours = Math.round((monthlyImages * 0.5) / 60);
  const hoursSaved = Math.max(manualHours - captionAiHours, 0);
  const rupeesSaved = hoursSaved * 850;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Operational Analytics & Performance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">Analytics & Insights</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Production throughput, social media ad performance, and calculated financial ROI.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1 bg-zinc-100 rounded-2xl border border-zinc-200 text-xs font-semibold">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-1.5 rounded-xl transition ${
              activeView === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Production Overview
          </button>
          <button
            onClick={() => setActiveView('social')}
            className={`px-4 py-1.5 rounded-xl transition ${
              activeView === 'social'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Social & Ads Performance
          </button>
          <button
            onClick={() => setActiveView('roi')}
            className={`px-4 py-1.5 rounded-xl transition ${
              activeView === 'roi'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            ROI & Cost Model
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PRODUCTION OVERVIEW */}
      {/* ========================================================================= */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Pipeline Production KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-indigo-100 hover:border-indigo-300 hover:shadow-xs transition space-y-1">
              <span className="text-[11px] font-semibold text-indigo-600 uppercase font-mono">Processed</span>
              <div className="text-2xl font-black text-indigo-950 font-mono">{summary.total_images}</div>
              <span className="text-[11px] text-zinc-500">Visual assets</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-violet-100 hover:border-violet-300 hover:shadow-xs transition space-y-1">
              <span className="text-[11px] font-semibold text-violet-600 uppercase font-mono">Captions</span>
              <div className="text-2xl font-black text-violet-950 font-mono">{summary.total_captions}</div>
              <span className="text-[11px] text-zinc-500">AI variations</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-xs transition space-y-1">
              <span className="text-[11px] font-semibold text-amber-600 uppercase font-mono">Curated</span>
              <div className="text-2xl font-black text-amber-950 font-mono">{summary.total_saved}</div>
              <span className="text-[11px] text-zinc-500">In saved library</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-sky-100 hover:border-sky-300 hover:shadow-xs transition space-y-1">
              <span className="text-[11px] font-semibold text-sky-600 uppercase font-mono">Latency</span>
              <div className="text-2xl font-black text-sky-950 font-mono">{summary.avg_latency}s</div>
              <span className="text-[11px] text-zinc-400 font-mono">ResNet-50 Vision</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-xs transition space-y-1">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase font-mono">Hours Saved</span>
              <div className="text-2xl font-black text-emerald-950 font-mono">{summary.hours_saved}h</div>
              <span className="text-[11px] text-zinc-500">Editorial velocity</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-xs transition space-y-1">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase font-mono">Cost Equivalent</span>
              <div className="text-2xl font-black text-emerald-950 font-mono">{summary.cost_saved_inr}</div>
              <span className="text-[11px] text-emerald-700 font-mono font-medium">INR Saved</span>
            </div>
          </div>

          {/* Generation Volume & Platform Share */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 30-Day Activity AreaChart */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">Generation Volume & Production Output</h3>
                  <p className="text-xs text-zinc-400">Total caption batches generated over the last 30 days</p>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-semibold">
                  30-Day Velocity
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline}>
                    <defs>
                      <linearGradient id="areaCapColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="captions" name="Captions" stroke="#4F46E5" strokeWidth={2.5} fill="url(#areaCapColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Usage Donut Chart */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Channel Distribution</h3>
                <p className="text-xs text-zinc-400 mb-3">Share of content generated by target platform</p>
                <div className="h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={platforms} innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value">
                        {platforms.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-zinc-100">
                {platforms.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#6366F1' }} />
                    <span className="text-zinc-600 truncate">{p.name}: <strong className="text-zinc-900 font-mono">{p.value}%</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Tone & Style Breakdown + Model Health */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tone Distribution */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">Tonal Style Breakdown</h3>
                  <p className="text-xs text-zinc-400">Distribution across creative, professional, and promotional prompts</p>
                </div>
                <span className="text-xs text-zinc-400 font-mono">143 Total Samples</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stylesDistribution}>
                    <XAxis dataKey="style" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Pipeline Health & Model Architecture */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>Model Engine & Infrastructure Status</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Real-time deep learning inference metrics</p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-zinc-900">ResNet-50 Vision Extractor</div>
                    <div className="text-[11px] text-zinc-500 font-mono">PyTorch 2.x • 2048-d Feature Embedding</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                    Online
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-zinc-900">Platform Persona Decoder</div>
                    <div className="text-[11px] text-zinc-500 font-mono">Audience Targeting & Hashtag Engine</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                    Active
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-indigo-950">Cloud Inference Cost</div>
                    <div className="text-[11px] text-indigo-700 font-mono">Local execution / Zero 3rd party API fees</div>
                  </div>
                  <span className="font-bold text-indigo-950 font-mono text-sm">
                    $0.00 / mo
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Inference Uptime: <strong className="text-zinc-700">99.98%</strong></span>
                <span>Avg Processing: <strong className="text-zinc-700 font-mono">{summary.avg_latency}s</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SOCIAL & ADS PERFORMANCE */}
      {/* ========================================================================= */}
      {activeView === 'social' && (
        <div className="space-y-6">
          {/* Top Bar: Connected Accounts Status & Manage Modal Button */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-950">Connected Social Channels & Ad Accounts</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                    Meta Business API
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Connect your business accounts to monitor organic reach, engagement rates, and Return on Ad Spend (ROAS).
                </p>
              </div>

              {/* Instagram Connection Action Button */}
              <button
                onClick={handleOpenConnectModal}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs ${
                  socialConnected.instagram
                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <InstagramIcon className="w-4 h-4 text-white" />
                <span>{socialConnected.instagram ? 'Manage Instagram Business' : 'Connect Instagram Account'}</span>
              </button>
            </div>

            {/* Channels Pill Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Instagram Pill */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                socialConnected.instagram
                  ? 'bg-rose-50/50 border-rose-200'
                  : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-2 rounded-xl ${socialConnected.instagram ? 'bg-rose-100 text-rose-700' : 'bg-zinc-200 text-zinc-500'}`}>
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-900 truncate">Instagram Business</div>
                    <div className="text-[11px] text-zinc-500 font-mono truncate">
                      {socialConnected.instagram ? currentIgHandle : 'Not Connected'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleOpenConnectModal}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline shrink-0 ml-2"
                >
                  {socialConnected.instagram ? 'Configure' : 'Connect'}
                </button>
              </div>

              {/* LinkedIn Pill */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                socialConnected.linkedin
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-2 rounded-xl ${socialConnected.linkedin ? 'bg-blue-100 text-blue-700' : 'bg-zinc-200 text-zinc-500'}`}>
                    <LinkedinIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-900 truncate">LinkedIn Company</div>
                    <div className="text-[11px] text-zinc-500 font-mono truncate">
                      {socialConnected.linkedin ? currentBrand : 'Not Connected'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleToggleLinkedIn}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline shrink-0 ml-2"
                >
                  {socialConnected.linkedin ? 'Disconnect' : 'Connect'}
                </button>
              </div>

              {/* X / Twitter Pill */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                socialConnected.twitter
                  ? 'bg-sky-50/50 border-sky-200'
                  : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-2 rounded-xl ${socialConnected.twitter ? 'bg-sky-100 text-sky-700' : 'bg-zinc-200 text-zinc-500'}`}>
                    <TwitterIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-900 truncate">X / Twitter</div>
                    <div className="text-[11px] text-zinc-500 font-mono truncate">
                      {socialConnected.twitter ? `@${currentBrand.toLowerCase().replace(/\s+/g, '')}` : 'Not Connected'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleToggleTwitter}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline shrink-0 ml-2"
                >
                  {socialConnected.twitter ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>

          {/* Dedicated Paid Ads & Organic Marketing KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-rose-600 uppercase font-mono">Total Social Reach</span>
              <div className="text-2xl font-black text-rose-950 font-mono">47,490</div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +22.4% this month
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-indigo-600 uppercase font-mono">Blended Engagement</span>
              <div className="text-2xl font-black text-indigo-950 font-mono">5.5%</div>
              <div className="text-[11px] text-zinc-500">Benchmark: 2.1%</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase font-mono">Sponsored Ad ROAS</span>
              <div className="text-2xl font-black text-emerald-950 font-mono">3.4x</div>
              <div className="text-[11px] text-emerald-700 font-semibold">₹3.40 return / ₹1 spent</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-blue-600 uppercase font-mono">Avg Ad Click Rate (CTR)</span>
              <div className="text-2xl font-black text-blue-950 font-mono">2.84%</div>
              <div className="text-[11px] text-zinc-500">Industry avg: 1.2%</div>
            </div>
          </div>

          {/* Social Post Feed & Filter */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Published Post Engagement & Ad ROI</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Live metrics synced from connected accounts for brand <strong className="text-zinc-800">{currentBrand}</strong>
                </p>
              </div>

              {/* Channel Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-semibold">
                {['all', 'instagram', 'linkedin', 'twitter'].map((channel) => (
                  <button
                    key={channel}
                    onClick={() => setChannelFilter(channel)}
                    className={`px-3 py-1 rounded-lg capitalize transition ${
                      channelFilter === channel
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    {channel === 'all' ? 'All Channels' : channel === 'twitter' ? 'X' : channel}
                  </button>
                ))}
              </div>
            </div>

            {/* Post Cards Grid */}
            {visiblePostMetrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {visiblePostMetrics.map((post) => (
                  <div
                    key={post.id}
                    className="bg-zinc-50/70 rounded-2xl border border-zinc-200 p-5 space-y-4 hover:border-indigo-300 hover:shadow-xs transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Header Badge */}
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 font-mono">{post.handle}</span>
                          <span className={`text-[10px] font-mono font-semibold ${
                            post.platform === 'Instagram' ? 'text-rose-600' : post.platform === 'LinkedIn' ? 'text-blue-600' : 'text-sky-600'
                          }`}>
                            {post.platform}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono border ${
                            post.ad_status === 'Sponsored Ad'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-white text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {post.ad_status}
                        </span>
                      </div>

                      {/* Caption Snippet */}
                      <p className="text-xs text-zinc-700 italic my-3 leading-relaxed">
                        "{post.caption_snippet}"
                      </p>

                      {/* Impressions & Reach */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-xl border border-zinc-200 text-center font-mono">
                        <div>
                          <div className="text-[10px] text-zinc-400 font-sans">Impressions</div>
                          <div className="text-xs font-bold text-zinc-900 mt-0.5">{post.impressions}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-400 font-sans">Reach</div>
                          <div className="text-xs font-bold text-zinc-900 mt-0.5">{post.reach}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-zinc-400 font-sans">Engagement</div>
                          <div className="text-xs font-bold text-emerald-600 mt-0.5">{post.engagement_rate}</div>
                        </div>
                      </div>

                      {/* Engagement Counts */}
                      <div className="grid grid-cols-4 gap-2 pt-3 text-[11px] text-zinc-600 font-mono">
                        <div className="flex items-center gap-1 hover:text-rose-600 transition">
                          <Heart className="w-3 h-3 text-zinc-400" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-blue-600 transition">
                          <MessageCircle className="w-3 h-3 text-zinc-400" />
                          <span>{post.comments}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-indigo-600 transition">
                          <Share2 className="w-3 h-3 text-zinc-400" />
                          <span>{post.shares}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-amber-600 transition">
                          <Bookmark className="w-3 h-3 text-zinc-400" />
                          <span>{post.saves}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ad Performance Highlights if Sponsored */}
                    {post.ad_status === 'Sponsored Ad' && (
                      <div className="pt-3 border-t border-zinc-200 flex items-center justify-between text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-zinc-400 font-sans block">Ad CTR</span>
                          <span className="font-bold text-indigo-600">{post.ctr}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 font-sans block">ROAS</span>
                          <span className="font-bold text-emerald-600">{post.roas}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold font-sans">
                          Profitable Ad
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 space-y-3 bg-zinc-50 rounded-2xl border border-zinc-200">
                <div className="p-3 rounded-full bg-white border border-zinc-200 w-12 h-12 mx-auto flex items-center justify-center text-zinc-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div className="max-w-md mx-auto">
                  <p className="text-xs font-bold text-zinc-900">No Posts Synced for Selected Channels</p>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                    Connect your accounts or adjust your channel filter to view live reach and engagement metrics.
                  </p>
                </div>
                <button
                  onClick={handleOpenConnectModal}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Connect Instagram Business
                </button>
              </div>
            )}
          </div>

          {/* Dedicated Ad Campaigns Breakdown Table */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">Active Paid Ad Campaigns</h3>
                <p className="text-xs text-zinc-400">Direct comparison of paid media spend, CTR, and Return on Ad Spend (ROAS)</p>
              </div>
              <span className="text-xs font-mono text-zinc-500">3 Campaigns Tracked</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Campaign Name</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Spend</th>
                    <th className="py-2.5 px-3">Impressions</th>
                    <th className="py-2.5 px-3">Clicks (CTR)</th>
                    <th className="py-2.5 px-3">ROAS</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800">
                  {adCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-zinc-50/60 transition font-mono">
                      <td className="py-3 px-3 font-sans font-semibold text-zinc-900">{camp.name}</td>
                      <td className="py-3 px-3 font-sans text-zinc-600">{camp.platform}</td>
                      <td className="py-3 px-3 font-bold text-zinc-900">{camp.spend}</td>
                      <td className="py-3 px-3 text-zinc-600">{camp.impressions}</td>
                      <td className="py-3 px-3">
                        <span className="text-zinc-900 font-bold">{camp.clicks}</span>{' '}
                        <span className="text-indigo-600">({camp.ctr})</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 font-sans">
                          {camp.roas}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-sans border ${
                          camp.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}>
                          {camp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ROI & COST MODEL CALCULATOR */}
      {/* ========================================================================= */}
      {activeView === 'roi' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>Interactive ROI & Time Savings Model</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Calculate editorial hours, copywriter contractor fees, and organizational savings.
                </p>
              </div>
              <div className="text-xs font-mono text-zinc-500">
                Industry Benchmark: ₹850/hr senior social copywriter rate
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Slider Control (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-800">Monthly Image Volume:</span>
                    <span className="font-mono text-sm font-bold text-indigo-600">{monthlyImages} images / month</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={monthlyImages}
                    onChange={(e) => setMonthlyImages(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>10 posts</span>
                    <span>250 posts</span>
                    <span>500 posts</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  Crafting authentic, high-converting social captions manually takes 15 to 20 minutes per asset when factoring in visual analysis, brand tone adherence, hook formulation, and hashtag discovery. CaptionAI executes this pipeline in 2.1 seconds using local deep learning inference.
                </p>
              </div>

              {/* Calculations Breakdown (6 cols) */}
              <div className="lg:col-span-6 grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase font-mono">Manual Time</span>
                  <div className="text-xl font-bold text-zinc-800 font-mono">{manualHours} hrs</div>
                  <span className="text-[10px] text-zinc-400 block">~18m / image</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-center space-y-1">
                  <span className="text-[10px] text-indigo-600 font-semibold uppercase font-mono">With CaptionAI</span>
                  <div className="text-xl font-bold text-indigo-950 font-mono">{captionAiHours} hrs</div>
                  <span className="text-[10px] text-indigo-700 font-mono block">2.1s / image</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-center space-y-1 shadow-sm border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-100 font-semibold uppercase font-mono">Estimated Savings</span>
                  <div className="text-xl font-bold text-white font-mono">₹{rupeesSaved.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-100 font-mono block">{hoursSaved} hrs saved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Annual Projection Table */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-950">Scale Projections (Annual Impact)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Monthly Posts</th>
                    <th className="py-2.5 px-3">Annual Assets</th>
                    <th className="py-2.5 px-3">Manual Agency Cost</th>
                    <th className="py-2.5 px-3">CaptionAI Cost</th>
                    <th className="py-2.5 px-3 font-bold text-emerald-700">Net Annual Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-800 font-mono">
                  {[
                    { monthly: 50, annual: 600, manual: '₹1,53,000', captionAi: '₹0 (Included)', savings: '₹1,53,000' },
                    { monthly: 100, annual: 1200, manual: '₹3,06,000', captionAi: '₹0 (Included)', savings: '₹3,06,000' },
                    { monthly: 250, annual: 3000, manual: '₹7,65,000', captionAi: '₹0 (Included)', savings: '₹7,65,000' },
                    { monthly: 500, annual: 6000, manual: '₹15,30,000', captionAi: '₹0 (Included)', savings: '₹15,30,000' }
                  ].map((row) => (
                    <tr key={row.monthly} className="hover:bg-zinc-50/60 transition">
                      <td className="py-3 px-3 font-bold text-zinc-900">{row.monthly} / mo</td>
                      <td className="py-3 px-3 text-zinc-600">{row.annual} assets</td>
                      <td className="py-3 px-3 text-rose-700">{row.manual}</td>
                      <td className="py-3 px-3 font-sans text-indigo-600 font-semibold">{row.captionAi}</td>
                      <td className="py-3 px-3 font-bold text-emerald-600">{row.savings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSTAGRAM BUSINESS CONNECTION MODAL */}
      {/* ========================================================================= */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-zinc-200 shadow-2xl overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-zinc-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-950">
                    {socialConnected.instagram ? 'Manage Instagram Business Account' : 'Connect Instagram Business Account'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Link your professional Instagram account to sync post analytics and ad ROAS.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleConfirmConnect} className="p-6 space-y-4">
              {/* Question Banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 space-y-1">
                <span className="font-bold block">Account Connection Confirmation</span>
                <p className="text-zinc-600 leading-relaxed">
                  Do you want to connect your Instagram Business or Creator account? This allows CaptionAI to retrieve post impressions, reach, and calculate Return on Ad Spend (ROAS).
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <label className="text-zinc-700 font-semibold block">Instagram Handle</label>
                  <input
                    type="text"
                    required
                    value={modalHandle}
                    onChange={(e) => setModalHandle(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                  <p className="text-[11px] text-zinc-400">Your public Instagram handle (e.g. @studioone).</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-700 font-semibold block">Brand / Organization Name</label>
                  <input
                    type="text"
                    required
                    value={modalBrandName}
                    onChange={(e) => setModalBrandName(e.target.value)}
                    placeholder="e.g. Studio One"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-700 font-semibold block">Business Category</label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="Brand / Business">Brand / Business</option>
                    <option value="Digital Marketing Agency">Digital Marketing Agency</option>
                    <option value="Creator / Influencer">Creator / Influencer</option>
                    <option value="E-Commerce / Retail">E-Commerce / Retail</option>
                    <option value="Technology / SaaS">Technology / SaaS</option>
                    <option value="Personal Brand">Personal Brand</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-700 font-semibold block">Meta Page ID / Business Account</label>
                  <input
                    type="text"
                    value={modalPageId}
                    onChange={(e) => setModalPageId(e.target.value)}
                    placeholder="FB-PAGE-98421"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              {/* Permissions note */}
              <div className="flex items-start gap-2 pt-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  CaptionAI uses read-only access (instagram_basic, instagram_manage_insights). We never post or alter content without explicit approval.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                {socialConnected.instagram ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition"
                  >
                    Disconnect Instagram
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {modalSubmitting
                      ? 'Saving...'
                      : socialConnected.instagram
                      ? 'Update Account Details'
                      : 'Confirm & Connect'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
