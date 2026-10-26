import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sparkles, User, Zap, LogOut, Settings as SettingsIcon, CheckCheck, Trash2 } from 'lucide-react';

export default function Navbar({ user, onTabChange, notifications = [], onMarkAllRead, onClearNotifications, onSignOut }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search generated captions or keywords..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right side controls & user profile */}
      <div className="flex items-center gap-3">
        {/* Tier badge */}
        <button
          onClick={() => onTabChange('pricing')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/90 text-indigo-700 text-xs font-semibold hover:border-indigo-300 hover:shadow-xs transition"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          <span className="uppercase tracking-wider text-[11px] font-mono">{user?.tier || 'Pro'} Plan</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-xl border transition relative ${
              showNotifications
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white border border-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="p-3.5 px-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-900 text-white font-mono font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={onMarkAllRead}
                        className="text-[11px] text-zinc-500 hover:text-zinc-900 font-medium flex items-center gap-1 transition"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Read all</span>
                      </button>
                      <button
                        onClick={onClearNotifications}
                        className="text-[11px] text-zinc-400 hover:text-zinc-700 transition ml-1"
                        title="Clear list"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-400">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 px-4 transition ${
                        !notif.read ? 'bg-zinc-50/80 font-medium' : 'bg-white opacity-85'
                      } hover:bg-zinc-100/70`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-zinc-900">{notif.title}</div>
                        <span className="text-[10px] text-zinc-400 font-mono whitespace-nowrap">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile with dropdown */}
        <div className="relative" ref={userMenuRef}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 border-l border-zinc-200 cursor-pointer hover:opacity-80 transition select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center font-bold text-white text-xs shadow-xs">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AM'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-zinc-900 leading-tight">{user?.name || 'Alex Morgan'}</div>
              <div className="text-[10px] text-zinc-500 font-medium">{user?.brand_name || 'Acme Studio'}</div>
            </div>
          </div>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-zinc-100">
                <div className="text-xs font-bold text-zinc-900 truncate">{user?.name || 'Alex Morgan'}</div>
                <div className="text-[11px] text-zinc-500 truncate">{user?.email || 'alex@acmestudio.com'}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('dashboard');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 flex items-center gap-2 transition"
                >
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Personal Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('settings');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 flex items-center gap-2 transition"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Profile & Preferences</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onTabChange('pricing');
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 flex items-center gap-2 transition"
                >
                  <Zap className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Subscription ({user?.tier || 'Pro'})</span>
                </button>
              </div>

              <div className="border-t border-zinc-100 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onSignOut) onSignOut();
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-zinc-800 hover:text-zinc-950 hover:bg-zinc-100 flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
