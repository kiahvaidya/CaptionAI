import React from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Clock,
  TrendingUp,
  Share2,
  CheckCircle,
  ChevronRight,
  Zap,
  ArrowUpRight,
  Bookmark
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard({ analytics, history = [], user, onNavigate }) {
  const personal = analytics?.personal;
  const totalImages = personal?.total_images ?? user?.images_processed ?? history.length ?? 0;
  const totalCaptions = personal?.total_captions ?? user?.captions_generated ?? 0;
  const totalSaved = personal?.total_saved ?? history.filter(h => h.is_favorite).length ?? 0;
  const hoursSaved = personal?.hours_saved ?? (Math.round((totalImages * 14.5) / 60 * 10) / 10);
  const costSavedInr = personal?.cost_saved_inr ?? `₹${Math.round(hoursSaved * 850).toLocaleString()}`;
  const avgLatency = personal?.avg_latency ?? 2.4;

  const timelineData = analytics?.trends?.generation_timeline || [
    { date: 'Mon', captions: Math.max(1, Math.round(totalCaptions * 0.1)) },
    { date: 'Tue', captions: Math.max(2, Math.round(totalCaptions * 0.2)) },
    { date: 'Wed', captions: Math.max(1, Math.round(totalCaptions * 0.15)) },
    { date: 'Thu', captions: Math.max(3, Math.round(totalCaptions * 0.25)) },
    { date: 'Fri', captions: Math.max(2, Math.round(totalCaptions * 0.18)) },
    { date: 'Sat', captions: Math.max(1, Math.round(totalCaptions * 0.08)) },
    { date: 'Today', captions: Math.max(totalCaptions, 1) }
  ];

  const platformData = personal?.platform_breakdown && personal.platform_breakdown.length > 0
    ? personal.platform_breakdown
    : [
        { name: 'Instagram', value: 50, count: 1, color: '#E1306C' },
        { name: 'LinkedIn', value: 30, count: 1, color: '#0A66C2' },
        { name: 'X / Twitter', value: 20, count: 1, color: '#0284C7' }
      ];

  const recentItems = history?.slice(0, 4) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Workspace Overview</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
            Welcome back, {user?.name || 'Alex Morgan'}.
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Brand Workspace: <strong className="text-zinc-900 font-medium">{user?.brand_name || 'Acme Studio'}</strong>. You have processed <strong className="text-indigo-600 font-mono">{totalImages}</strong> visual assets and generated <strong className="text-indigo-600 font-mono">{totalCaptions}</strong> captions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('studio')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 flex items-center gap-2 transition"
        >
          <ImageIcon className="w-4 h-4" />
          <span>New Caption</span>
        </button>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 hover:border-indigo-300 hover:shadow-xs transition space-y-1">
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider font-mono">Images</span>
          <div className="text-2xl font-black text-indigo-950 font-mono">{totalImages.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500 font-medium">
            Active Assets
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-violet-100 hover:border-violet-300 hover:shadow-xs transition space-y-1">
          <span className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider font-mono">Captions</span>
          <div className="text-2xl font-black text-violet-950 font-mono">{totalCaptions.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500 font-medium">
            Total Copies
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-xs transition space-y-1">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider font-mono">Saved</span>
          <div className="text-2xl font-black text-amber-950 font-mono">{totalSaved.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500 font-medium">
            In Library
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-100 hover:border-sky-300 hover:shadow-xs transition space-y-1">
          <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider font-mono">Avg Latency</span>
          <div className="text-2xl font-black text-sky-950 font-mono">{avgLatency}s</div>
          <div className="text-[11px] text-zinc-400 font-mono">Model Speed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 hover:border-rose-300 hover:shadow-xs transition space-y-1">
          <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider font-mono">Top Channel</span>
          <div className="text-xl font-bold text-rose-950 truncate">
            {platformData[0]?.name || 'Instagram'}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            {platformData[0]?.value ? `${platformData[0].value}% share` : 'Primary'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 hover:border-emerald-300 hover:shadow-xs transition space-y-1">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider font-mono">Hours Saved</span>
          <div className="text-2xl font-black text-emerald-950 font-mono">{hoursSaved}h</div>
          <div className="text-[11px] text-emerald-700 font-medium font-mono">{costSavedInr} Value</div>
        </div>
      </div>

      {/* Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Content Production Volume</h3>
              <p className="text-xs text-zinc-400">Weekly caption generations</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="captionsGradColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="captions" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#captionsGradColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Share */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 mb-0.5">Platform Distribution</h3>
            <p className="text-xs text-zinc-400 mb-3">Generation breakdown by channel</p>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-zinc-100">
            {platformData.slice(0, 4).map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#6366F1' }} />
                <span className="text-zinc-600 truncate">{p.name}: <strong className="text-zinc-900 font-mono">{p.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-900">Recent Generated Captions</h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-zinc-700 hover:text-black font-semibold flex items-center gap-1"
          >
            View history ({history?.length || 0}) <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentItems.length > 0 ? (
            recentItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-zinc-900 flex items-center justify-between gap-4 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image_data_url}
                    alt={item.image_name}
                    className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 border border-zinc-200"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-semibold uppercase font-mono">
                        {item.platform}
                      </span>
                      <span className="text-xs text-zinc-400 truncate">{item.image_name}</span>
                    </div>
                    <p className="text-xs text-zinc-800 truncate max-w-md font-medium">
                      {item.best_caption}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('history')}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-xs font-semibold text-zinc-800 border border-zinc-300 transition"
                >
                  View
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="p-3 rounded-full bg-zinc-100 w-12 h-12 mx-auto flex items-center justify-center text-zinc-700">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-800">No captions generated yet</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Upload any photo or visual asset in Studio to start.</p>
              </div>
              <button
                onClick={() => onNavigate('studio')}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition"
              >
                Open Studio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
