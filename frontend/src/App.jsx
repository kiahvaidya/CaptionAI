import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import History from './pages/History';
import Favorites from './pages/Favorites';
import Analytics from './pages/Analytics';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import { api } from './services/api';
import { Sparkles, ArrowRight, Lock, UserCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [mlStatus, setMlStatus] = useState(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // Central Notification State
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Deep Learning Engine Active',
      message: 'ResNet50-LSTM vision model ready for high-precision caption generation.',
      time: '10m ago',
      read: false
    },
    {
      id: 2,
      title: 'Workspace Initialized',
      message: 'Connected to personal database and social analytics pipeline.',
      time: '1h ago',
      read: true
    }
  ]);

  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    try {
      const [uRes, aRes, hRes, mRes] = await Promise.all([
        api.getCurrentUser().catch(() => null),
        api.getAnalyticsOverview().catch(() => null),
        api.getHistory().catch(() => ({ history: [] })),
        api.getMlStatus().catch(() => null)
      ]);

      if (uRes?.user) setUser(uRes.user);
      if (aRes) setAnalytics(aRes);
      if (hRes?.history) setHistory(hRes.history);
      if (mRes) setMlStatus(mRes);
    } catch (err) {
      console.error('Error loading initial app data:', err);
    }
  };

  const addNotification = (notif) => {
    setNotifications((prev) => [
      {
        id: notif.id || Date.now(),
        title: notif.title || 'Notification',
        message: notif.message || '',
        time: notif.time || 'Just now',
        read: false
      },
      ...prev
    ]);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleTierUpdated = (newTier) => {
    if (user) {
      setUser({ ...user, tier: newTier });
    }
  };

  const handleSignOut = async () => {
    try {
      await api.logout().catch(() => null);
    } finally {
      setIsLoggedOut(true);
      addNotification({
        id: Date.now(),
        title: 'Signed Out',
        message: 'You have been signed out of your CaptionAI workspace.',
        time: 'Just now',
        read: false
      });
    }
  };

  const handleSignIn = async (email = 'alex@acmestudio.com') => {
    try {
      const res = await api.login(email, 'password123');
      if (res?.user) {
        setUser(res.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggedOut(false);
      refreshAllData();
      addNotification({
        id: Date.now(),
        title: 'Welcome Back',
        message: `Signed in as ${user?.name || 'Alex Morgan'} (${user?.brand_name || 'Acme Studio'}).`,
        time: 'Just now',
        read: false
      });
    }
  };

  // If user explicitly signed out, show sleek minimal Login Screen
  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 shadow-elevated space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-base font-black tracking-tight text-zinc-950">
              Caption<span className="text-zinc-500">AI</span>
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-950">Sign In to Workspace</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Access your personal dashboard, image caption archive, and social analytics.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Account Email</label>
              <input
                type="email"
                defaultValue="alex@acmestudio.com"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700">Password</label>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-center">
            <button
              onClick={() => handleSignIn('alex@acmestudio.com')}
              className="text-xs text-zinc-600 hover:text-zinc-950 font-semibold flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-zinc-900" />
              <span>Quick Sign In as Alex Morgan (Acme Studio)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 overflow-hidden font-sans">
      {/* Fixed Clean Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-zinc-50">
        {/* Top Navbar */}
        <Navbar
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onClearNotifications={handleClearNotifications}
          onSignOut={handleSignOut}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'studio' && (
              <Studio
                onGenerationComplete={refreshAllData}
                onNotify={addNotification}
              />
            )}
            {activeTab === 'dashboard' && (
              <Dashboard
                analytics={analytics}
                history={history}
                user={user}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === 'history' && (
              <History onFavoriteUpdated={refreshAllData} />
            )}
            {activeTab === 'favorites' && <Favorites />}
            {activeTab === 'analytics' && (
              <Analytics
                user={user}
                onUserUpdated={setUser}
                onNotify={addNotification}
              />
            )}
            {activeTab === 'pricing' && (
              <Pricing
                currentTier={user?.tier || 'pro'}
                onTierUpdated={handleTierUpdated}
              />
            )}
            {activeTab === 'settings' && (
              <Settings
                user={user}
                onUserUpdated={setUser}
                onSignOut={handleSignOut}
                onNotify={addNotification}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
