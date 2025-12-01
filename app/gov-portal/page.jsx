'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import GoogleMap from '../components/GoogleMap';

export default function GovPortal() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [section, setSection] = useState('hotspots');
  const [hotspots, setHotspots] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'government') {
        router.push('/dashboard');
      }
      setUser(parsedUser);
    }
  }, [router]);

  useEffect(() => {
    if (user) fetchHotspots();
  }, [user, filter]);

  const fetchHotspots = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const url = `/api/hotspots/list?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      setHotspots(data.hotspots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (hotspotId) => {
    setVerifying(hotspotId);
    try {
      const res = await fetch('/api/hotspots/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotspotId })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Verified! Detected: ${data.detections?.map(d => d.label).join(', ') || 'Unknown'}`);
        fetchHotspots();
      } else {
        alert(data.error || 'Verification failed');
      }
    } catch (err) {
      alert('Error verifying hotspot');
    } finally {
      setVerifying(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen bg-black"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div></div>;

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Government Portal</h1>
            <p className="text-sm text-gray-400">City: {user.city}</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 bg-gray-900/50 rounded-lg shadow-lg p-2 backdrop-blur-sm border border-gray-800">
          {['hotspots', 'map', 'stats'].map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                section === s ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg shadow-green-500/50' : 'text-gray-400 hover:text-white'
              }`}
            >
              {s === 'hotspots' ? 'Hotspots' : s === 'map' ? 'Map View' : 'Statistics'}
            </button>
          ))}
        </div>

        {section === 'hotspots' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex gap-2 mb-4">
              {['all', 'pending', 'verified', 'rejected', 'cleaned'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    filter === status
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500 mx-auto"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {hotspots.map((hotspot) => (
                  <div key={hotspot._id} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl p-6 hover:border-green-500/50 transition-all duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        {hotspot.imageUrl ? (
                          <img 
                            src={hotspot.imageUrl} 
                            alt="Hotspot" 
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              console.error('Image load error:', hotspot.imageUrl);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center text-4xl" style={{ display: hotspot.imageUrl ? 'none' : 'flex' }}>🏭</div>
                      </div>
                      <div className="md:col-span-2">
                        <h3 className="font-bold text-lg mb-2 text-white">Hotspot #{hotspot._id.slice(-6)}</h3>
                        <p className="text-sm text-gray-400">📍 {hotspot.latitude?.toFixed(4)}, {hotspot.longitude?.toFixed(4)}</p>
                        <p className="text-sm text-gray-400">📅 {new Date(hotspot.createdAt).toLocaleString()}</p>
                        {hotspot.detectionResult?.pollutantType && (
                          <p className="text-sm text-gray-400">🔍 {hotspot.detectionResult.pollutantType} - {hotspot.detectionResult.severity}</p>
                        )}
                      </div>
                      <div className="flex flex-col justify-between">
                        <p className="text-sm text-gray-400">Status: <span className={`font-bold ${hotspot.status === 'pending' ? 'text-yellow-400' : hotspot.status === 'verified' ? 'text-green-400' : hotspot.status === 'rejected' ? 'text-red-400' : 'text-blue-400'}`}>{hotspot.status}</span></p>
                        {hotspot.rejectionReason && (
                          <p className="text-sm text-red-400">❌ {hotspot.rejectionReason}</p>
                        )}
                        {hotspot.status === 'pending' && (
                          <button
                            onClick={() => handleVerify(hotspot._id)}
                            disabled={verifying === hotspot._id}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded hover:from-green-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50"
                          >
                            {verifying === hotspot._id ? 'Verifying...' : 'Verify with YOLO'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === 'map' && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-4">Hotspot Map</h2>
            <GoogleMap hotspots={hotspots} />
          </div>
        )}

        {section === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
            {[
              { label: 'Total', value: hotspots.length, gradient: 'from-blue-600 to-purple-600', icon: '📊' },
              { label: 'Pending', value: hotspots.filter(h => h.status === 'pending').length, gradient: 'from-yellow-600 to-orange-600', icon: '⏳' },
              { label: 'Verified', value: hotspots.filter(h => h.status === 'verified').length, gradient: 'from-green-600 to-teal-600', icon: '✅' },
              { label: 'Cleaned', value: hotspots.filter(h => h.status === 'cleaned').length, gradient: 'from-purple-600 to-pink-600', icon: '✨' }
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
        )}
      </div>
    </div>
  );
}
