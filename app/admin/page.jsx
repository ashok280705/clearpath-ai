'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [govId, setGovId] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [taluka, setTaluka] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [govUsers, setGovUsers] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('admin');
    if (!userData) {
      router.push('/admin/login');
    } else {
      setUser(JSON.parse(userData));
      fetchGovUsers();
    }
  }, [router]);

  const fetchGovUsers = async () => {
    try {
      const res = await fetch('/api/admin/gov-users');
      const data = await res.json();
      if (data.users) setGovUsers(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/create-gov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ govId, name, state, district, city, taluka, password })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (data.success) {
        setGovId('');
        setName('');
        setState('');
        setDistrict('');
        setCity('');
        setTaluka('');
        setPassword('');
        fetchGovUsers();
      }
    } catch (err) {
      setMessage('Error creating government user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this government user?')) return;
    try {
      const res = await fetch('/api/admin/delete-gov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      setMessage(data.message);
      fetchGovUsers();
    } catch (err) {
      setMessage('Error deleting user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin/login');
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen bg-black"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-500"></div></div>;

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Admin Panel</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Create Government User</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Government ID</label>
                <input
                  type="text"
                  value={govId}
                  onChange={(e) => setGovId(e.target.value)}
                  placeholder="GOV-PUNE-001"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Pune Municipal Corporation"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Pune"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Pune"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Taluka</label>
                <input
                  type="text"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  placeholder="Haveli"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/50">
                Create Government User
              </button>
            </form>
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes('Error') || message.includes('exists') ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-green-500/20 border border-green-500/50 text-green-400'}`}>
                {message}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">Government Users</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {govUsers.map((gov) => (
                <div key={gov._id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white">{gov.name}</h3>
                      <p className="text-sm text-gray-400">ID: {gov.govId}</p>
                      <p className="text-sm text-gray-400">{gov.city}, {gov.district}, {gov.state}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(gov._id)}
                      className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded hover:bg-red-500/30 transition-all duration-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
