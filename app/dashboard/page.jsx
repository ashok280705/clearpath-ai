'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ hotspots: 0, requests: 0, verified: 0, cleaned: 0 });

  useEffect(() => {
    if (session?.user?.email) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/user/stats?email=${session.user.email}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const wasteEstimate = (stats.verified + stats.cleaned) * 5;
  const co2Saved = (stats.verified + stats.cleaned) * 2.3;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-4">🌍 Our Mission</h2>
        <p className="text-white/90 text-lg mb-4">Empower citizens to report pollution hotspots, earn rewards, and contribute to a cleaner, healthier environment for all.</p>
        <h2 className="text-3xl font-bold text-white mb-4 mt-6">👁️ Our Vision</h2>
        <p className="text-white/90 text-lg">A pollution-free world where technology and community action work together to create sustainable, clean cities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Reward Points', value: session?.user?.rewardPoints || 0, gradient: 'from-purple-600 to-blue-600', icon: '🏆' },
          { label: 'Hotspots Reported', value: stats.hotspots, gradient: 'from-green-600 to-teal-600', icon: '📍' },
          { label: 'Verified Hotspots', value: stats.verified, gradient: 'from-yellow-600 to-orange-600', icon: '✅' },
          { label: 'Cleaned Areas', value: stats.cleaned, gradient: 'from-pink-600 to-purple-600', icon: '✨' }
        ].map((item, i) => (
          <div key={i} className={`bg-gradient-to-br ${item.gradient} rounded-lg p-6 shadow-2xl transform hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">{item.label}</h3>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <p className="text-4xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">🌱 Your Environmental Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-400 mb-2">Waste Cleaned</h3>
            <p className="text-4xl font-bold text-white">{wasteEstimate} kg</p>
            <p className="text-sm text-gray-400 mt-2">Estimated waste removed</p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-2">CO₂ Reduced</h3>
            <p className="text-4xl font-bold text-white">{co2Saved.toFixed(1)} kg</p>
            <p className="text-sm text-gray-400 mt-2">Carbon emissions prevented</p>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-purple-400 mb-2">Collection Requests</h3>
            <p className="text-4xl font-bold text-white">{stats.requests}</p>
            <p className="text-sm text-gray-400 mt-2">Garbage pickups requested</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">📊 Feature Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '📍', title: 'Report Hotspots', desc: 'Upload pollution images and earn 100 points per verified hotspot' },
            { icon: '🗑️', title: 'Request Collection', desc: 'Schedule garbage pickup for events and earn 30 points' },
            { icon: '🔔', title: 'Daily Updates', desc: 'Get real-time weather and air quality alerts for your location' },
            { icon: '🎁', title: 'Redeem Rewards', desc: 'Exchange points for eco-friendly products and vouchers' }
          ].map((feature, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-all">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{feature.icon}</span>
                <div>
                  <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
