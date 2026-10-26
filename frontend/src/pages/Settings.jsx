import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Check, Bell, Share2, LogOut, Shield, Globe, Sliders } from 'lucide-react';
import { api } from '../services/api';

export default function Settings({ user, onUserUpdated, onSignOut, onNotify }) {
  const [name, setName] = useState(user?.name || 'Kiah Vaidya');
  const [email, setEmail] = useState(user?.email || 'demo@captionai.com');
  const [brandName, setBrandName] = useState(user?.brand_name || 'Studio One');
  const [instagramHandle, setInstagramHandle] = useState(user?.instagram_handle || '@studioone');
  const [instagramCategory, setInstagramCategory] = useState(user?.instagram_category || 'Brand / Business');
  const [instagramPageId, setInstagramPageId] = useState(user?.instagram_page_id || 'FB-PAGE-98421');
  const [defaultPlatform, setDefaultPlatform] = useState(user?.default_platform || 'instagram');
  const [defaultStyle, setDefaultStyle] = useState(user?.default_style || 'creative');
  const [notifyOnGeneration, setNotifyOnGeneration] = useState(
    user?.notify_on_generation !== undefined ? Boolean(user.notify_on_generation) : true
  );

  const [socialConnected, setSocialConnected] = useState({
    instagram: Boolean(user?.instagram_connected ?? true),
    linkedin: Boolean(user?.linkedin_connected ?? false),
    twitter: Boolean(user?.twitter_connected ?? false)
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.brand_name) setBrandName(user.brand_name);
      if (user.instagram_handle) setInstagramHandle(user.instagram_handle);
      if (user.instagram_category) setInstagramCategory(user.instagram_category);
      if (user.instagram_page_id) setInstagramPageId(user.instagram_page_id);
      if (user.default_platform) setDefaultPlatform(user.default_platform);
      if (user.default_style) setDefaultStyle(user.default_style);
      if (user.instagram_connected !== undefined) {
        setSocialConnected(prev => ({
          ...prev,
          instagram: Boolean(user.instagram_connected),
          linkedin: Boolean(user.linkedin_connected),
          twitter: Boolean(user.twitter_connected)
        }));
      }
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updateData = {
        name,
        brand_name: brandName,
        default_platform: defaultPlatform,
        default_style: defaultStyle,
        notify_on_generation: notifyOnGeneration ? 1 : 0,
        instagram_handle: instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`,
        instagram_category: instagramCategory,
        instagram_page_id: instagramPageId
      };

      const res = await api.updateProfile(updateData);
      if (onUserUpdated && res?.user) {
        onUserUpdated(res.user);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      if (onNotify) {
        onNotify({
          id: Date.now(),
          title: 'Settings Saved',
          message: 'Your profile and brand preferences have been updated.',
          time: 'Just now',
          read: false
        });
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSocial = async (platform) => {
    const nextVal = !socialConnected[platform];
    setSocialConnected(prev => ({ ...prev, [platform]: nextVal }));
    try {
      await api.toggleSocial(platform, nextVal);
      if (onNotify) {
        onNotify({
          id: Date.now(),
          title: `${platform.toUpperCase()} Updated`,
          message: `${platform.toUpperCase()} ${nextVal ? 'connected' : 'disconnected'}.`,
          time: 'Just now',
          read: false
        });
      }
    } catch (err) {
      console.error('Failed to toggle social platform:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-3xl">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-2">
          <SettingsIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>Account & Brand Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Manage your personal profile, brand defaults, connected accounts, and session.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal & Brand Profile */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Profile & Brand Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-zinc-700 font-semibold">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-700 font-semibold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-zinc-700 font-semibold">Brand / Business Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Acme Studio, Urban Retail"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-indigo-600"
              />
              <p className="text-[11px] text-zinc-400">Used as your default brand persona across generated captions.</p>
            </div>
          </div>
        </div>

        {/* Default Generation Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Default Caption Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-zinc-700 font-semibold">Default Platform</label>
              <select
                value={defaultPlatform}
                onChange={(e) => setDefaultPlatform(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-indigo-600 cursor-pointer capitalize"
              >
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">X / Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="blog">Blog</option>
                <option value="advertisement">Advertisement</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-700 font-semibold">Default Tone / Style</label>
              <select
                value={defaultStyle}
                onChange={(e) => setDefaultStyle(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:outline-none focus:border-indigo-600 cursor-pointer capitalize"
              >
                <option value="creative">Creative</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="inspirational">Inspirational</option>
                <option value="promotional">Promotional</option>
                <option value="minimal">Minimal</option>
                <option value="storytelling">Storytelling</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Notification Preferences</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyOnGeneration}
                onChange={(e) => setNotifyOnGeneration(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="text-zinc-700 font-medium">
                Notify immediately inside the app when captions finish generating
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked={true}
                className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="text-zinc-700 font-medium">
                Notify when captions are saved to your personal library
              </span>
            </label>
          </div>
        </div>

        {/* Connected Social Accounts */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 pb-3 border-b border-zinc-100">
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Connected Social Media Accounts (Optional)</span>
          </h3>

          <div className="space-y-3">
            {[
              { id: 'instagram', label: 'Instagram', desc: 'Sync posts, engagement metrics, and ad ROAS' },
              { id: 'linkedin', label: 'LinkedIn', desc: 'View professional post reach and audience shares' },
              { id: 'twitter', label: 'X / Twitter', desc: 'Monitor tweet impressions and link click counts' }
            ].map((channel) => (
              <div
                key={channel.id}
                className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-zinc-900 capitalize flex items-center gap-2">
                      <span>{channel.label}</span>
                      {channel.id === 'instagram' && socialConnected.instagram && (
                        <span className="text-[10px] px-2 py-0.2 bg-rose-50 text-rose-700 rounded-full font-mono font-medium border border-rose-200">
                          {instagramHandle}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">{channel.desc}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSocial(channel.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition shrink-0 ${
                      socialConnected[channel.id]
                        ? channel.id === 'instagram'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 font-semibold'
                          : channel.id === 'linkedin'
                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                          : 'bg-sky-50 text-sky-700 border-sky-300 font-semibold'
                        : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                    }`}
                  >
                    {socialConnected[channel.id] ? 'Connected' : 'Connect'}
                  </button>
                </div>

                {channel.id === 'instagram' && socialConnected.instagram && (
                  <div className="mt-1 pt-2.5 border-t border-zinc-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-600">Instagram Business Handle</label>
                      <input
                        type="text"
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-900 font-mono text-xs focus:outline-none focus:border-indigo-600"
                        placeholder="@yourhandle"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-600">Account Category</label>
                      <select
                        value={instagramCategory}
                        onChange={(e) => setInstagramCategory(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-900 text-xs focus:outline-none focus:border-indigo-600 cursor-pointer"
                      >
                        <option value="Brand / Business">Brand / Business</option>
                        <option value="Digital Marketing Agency">Digital Marketing Agency</option>
                        <option value="Creator / Influencer">Creator / Influencer</option>
                        <option value="E-Commerce / Retail">E-Commerce / Retail</option>
                        <option value="Technology / SaaS">Technology / SaaS</option>
                        <option value="Personal Brand">Personal Brand</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm shadow-indigo-500/20 flex items-center gap-2"
          >
            {saving ? <span>Saving...</span> : <span>Save Profile Changes</span>}
          </button>

          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 font-mono">
              <Check className="w-4 h-4 text-emerald-600" /> Profile saved successfully
            </span>
          )}
        </div>
      </form>

      {/* Account Session & Sign Out */}
      <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Account Session</h3>
            <p className="text-xs text-zinc-400">Signed in as {email}</p>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono font-semibold">
            {user?.tier || 'Pro'} Tier Active
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-zinc-500">
            Sign out of this browser session to switch accounts or lock access.
          </p>

          <button
            type="button"
            onClick={() => {
              if (onSignOut) onSignOut();
            }}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold border border-zinc-300 flex items-center gap-2 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-700" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
