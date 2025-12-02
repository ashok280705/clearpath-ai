'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function RewardsPage() {
  const { data: session, update } = useSession();
  const [rewards, setRewards] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchRewards();
    }
  }, [session]);

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/rewards/list');
      const data = await res.json();
      console.log('Fetched rewards:', data);
      setRewards(data.rewards || []);
    } catch (err) {
      console.error('Error fetching rewards:', err);
    }
  };

  const handleRedeem = async (rewardId, pointsRequired) => {
    if (!session?.user?.email) return;
    
    if (session.user.rewardPoints < pointsRequired) {
      setMessage('Insufficient points!');
      return;
    }

    if (!confirm('Redeem this reward?')) return;

    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, rewardId })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage('Reward redeemed successfully!');
        await update();
        fetchRewards();
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage('Error redeeming reward');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2">My Reward Points</h2>
        <p className="text-4xl font-bold text-white">{session?.user?.rewardPoints || 0} Points</p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.includes('success') ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'}`}>
          {message}
        </div>
      )}

      <h3 className="text-2xl font-bold text-white mb-6">Available Rewards</h3>
      {rewards.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-lg">
          <p className="text-gray-400 text-lg">No rewards available yet. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
          <div key={reward._id} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300">
            <h4 className="text-xl font-bold text-white mb-2">{reward.name}</h4>
            <p className="text-gray-400 text-sm mb-4">{reward.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-yellow-400 font-bold text-lg">{reward.pointsRequired} Points</span>
              <span className="text-gray-500 text-sm">Stock: {reward.stock}</span>
            </div>
            <button
              onClick={() => handleRedeem(reward._id, reward.pointsRequired)}
              disabled={session?.user?.rewardPoints < reward.pointsRequired || reward.stock < 1}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reward.stock < 1 ? 'Out of Stock' : session?.user?.rewardPoints < reward.pointsRequired ? 'Insufficient Points' : 'Redeem'}
            </button>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
