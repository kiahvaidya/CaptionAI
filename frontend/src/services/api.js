// Connect directly to backend port 8000 when running locally
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:8000/api`;
    }
  }
  return '/api';
};

const BASE_URL = getBaseUrl();

export const api = {
  // Auth & Profile
  async getCurrentUser() {
    const res = await fetch(`${BASE_URL}/auth/me`);
    if (!res.ok) throw new Error('Failed to load user profile');
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async logout() {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST'
    });
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async toggleSocial(platform, connected, meta = {}) {
    const res = await fetch(`${BASE_URL}/auth/social/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, connected, ...meta })
    });
    if (!res.ok) throw new Error('Failed to toggle social connection');
    return res.json();
  },

  async upgradeTier(tier) {
    const res = await fetch(`${BASE_URL}/auth/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    });
    return res.json();
  },

  // Core Caption Generation
  async generateCaptions(formData) {
    const res = await fetch(`${BASE_URL}/captions/generate`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Caption generation request failed' }));
      throw new Error(err.detail || 'Caption generation failed');
    }
    return res.json();
  },

  // History & Favorites
  async getHistory({ search = '', platform = '', style = '', favorite_only = false } = {}) {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (platform && platform !== 'all') query.append('platform', platform);
    if (style && style !== 'all') query.append('style', style);
    if (favorite_only) query.append('favorite_only', 'true');

    const res = await fetch(`${BASE_URL}/history?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load history');
    return res.json();
  },

  async toggleFavorite(generationId) {
    const res = await fetch(`${BASE_URL}/history/${generationId}/favorite`, {
      method: 'POST'
    });
    return res.json();
  },

  async deleteHistory(generationId) {
    const res = await fetch(`${BASE_URL}/history/${generationId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async deleteCaption(captionId) {
    const res = await fetch(`${BASE_URL}/captions/${captionId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Business Intelligence & Analytics
  async getAnalyticsOverview() {
    const res = await fetch(`${BASE_URL}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  },

  // Model Status Check
  async getMlStatus() {
    const res = await fetch(`${BASE_URL}/ml/status`);
    if (!res.ok) throw new Error('Failed to load ML status');
    return res.json();
  }
};
