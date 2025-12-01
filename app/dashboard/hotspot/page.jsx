'use client';

import { useState, useEffect } from 'react';
import UploadForm from './components/UploadForm';
import HotspotCard from '@/app/components/HotspotCard';

export default function HotspotsPage() {
  const [hotspots, setHotspots] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotspots();
  }, [filter]);

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? '/api/hotspots/list'
        : `/api/hotspots/list?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setHotspots(data.hotspots || []);
    } catch (error) {
      console.error('Error fetching hotspots:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Upload Form */}
      <div className="lg:col-span-2">
            <UploadForm onSubmitSuccess={fetchHotspots} />

        {/* Info Box */}
        <div className="mt-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="font-bold text-white mb-2">💡 How it works</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Upload or capture a pollution image</li>
            <li>• AI detects pollutants automatically</li>
            <li>• Earn 100 points for new hotspots</li>
            <li>• Redeem points for eco-friendly products</li>
          </ul>
        </div>
      </div>

      {/* Recent Hotspots Feed */}
      <div>
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Reports</h2>

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'pending', 'verified', 'duplicate'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                  filter === status
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Hotspots List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500 mx-auto"></div>
              </div>
            ) : hotspots.length > 0 ? (
              hotspots.map((hotspot) => (
                <HotspotCard key={hotspot._id} hotspot={hotspot} />
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No hotspots found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
