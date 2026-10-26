import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  ImagePlus,
  History,
  Bookmark,
  BarChart3,
  CreditCard,
  Settings,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, user }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studio', label: 'Generate Captions', icon: ImagePlus, highlight: true },
    { id: 'history', label: 'History', icon: History },
    { id: 'favorites', label: 'Saved Captions', icon: Bookmark },
    { id: 'analytics', label: 'Analytics & Social', icon: BarChart3 },
    { id: 'pricing', label: 'Pricing Plans', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const processedCount = user?.images_processed || 0;
  const tierLower = (user?.tier || 'business').toLowerCase();
  const limit = tierLower === 'business' ? 999999 : (tierLower === 'pro' ? 500 : 10);
  const usedInPeriod = processedCount % (limit === 999999 ? 1000 : limit);
  const percentUsed = limit === 999999 ? 12 : Math.min(Math.round((usedInPeriod / limit) * 100), 100);

  return (
    <aside className="w-60 bg-white border-r border-zinc-200 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Logo */}
        <div
          onClick={() => onTabChange('dashboard')}
          className="p-5 border-b border-zinc-200 cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-sm text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-zinc-950 flex items-center">
                Caption<span className="text-indigo-600">AI</span>
              </span>
              <span className="block text-[10px] text-zinc-400 font-medium leading-none mt-0.5">
                Intelligent Image Captioning
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                    : item.highlight
                    ? 'bg-zinc-50 hover:bg-indigo-50/60 text-zinc-900 hover:text-indigo-700 border border-zinc-200 hover:border-indigo-200/60'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : item.highlight ? 'text-zinc-800' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Realistic Personal Quota Widget */}
      <div className="p-4 m-3 rounded-2xl bg-zinc-50/80 border border-zinc-200">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-zinc-700">Monthly Usage</span>
          <span className="text-zinc-900 font-bold font-mono">
            {limit === 999999 ? `${usedInPeriod} / Unltd` : `${usedInPeriod} / ${limit}`}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-200 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span className="capitalize">{user?.tier || 'Pro'} Plan</span>
          <button
            onClick={() => onTabChange('pricing')}
            className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold"
          >
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
