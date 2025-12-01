'use client';

import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      {[
        { label: 'Reward Points', value: user?.rewardPoints || 0, gradient: 'from-purple-600 to-blue-600', icon: '🏆' },
        { label: 'Hotspots Reported', value: 0, gradient: 'from-green-600 to-teal-600', icon: '📍' },
        { label: 'Impact', value: 0, gradient: 'from-pink-600 to-purple-600', icon: '✨' }
      ].map((item, i) => (
        <div key={i} className={`bg-gradient-to-br ${item.gradient} rounded-lg p-6 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/10`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">{item.label}</h3>
            <span className="text-3xl">{item.icon}</span>
          </div>
          <p className="text-5xl font-bold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
