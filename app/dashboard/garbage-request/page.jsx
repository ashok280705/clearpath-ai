'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function GarbageRequestPage() {
  const { data: session } = useSession();
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLon(pos.coords.longitude.toFixed(6));
      });
    }
  }, []);

  const getLocationDetails = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      const location = { state: '', district: '', city: '', address: '' };
      
      if (data.results && data.results[0]) {
        location.address = data.results[0].formatted_address;
        const components = data.results[0].address_components;
        
        components.forEach(comp => {
          if (comp.types.includes('administrative_area_level_1')) location.state = comp.long_name;
          if (comp.types.includes('administrative_area_level_2')) location.district = comp.long_name;
          if (comp.types.includes('locality')) location.city = comp.long_name;
        });
      }
      return location;
    } catch (error) {
      return { state: '', district: '', city: '', address: '' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      setMessage('Please sign in');
      return;
    }

    setLoading(true);
    setMessage('Getting location...');

    try {
      const location = await getLocationDetails(parseFloat(lat), parseFloat(lon));

      const response = await fetch('/api/garbage-requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id || session.user.email,
          eventType,
          description,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          address: location.address,
          city: location.city,
          state: location.state,
          district: location.district
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Request submitted! +30 points');
        setEventType('');
        setDescription('');
      } else {
        setMessage(data.error || 'Failed');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Request Garbage Collection
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select event type</option>
              <option value="Wedding">Wedding</option>
              <option value="Party">Party</option>
              <option value="Festival">Festival</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your garbage collection needs..."
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude"
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="number"
              step="any"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="Longitude"
              className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/50 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request (+30 points)'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('Error') || message.includes('Failed')
              ? 'bg-red-500/20 border border-red-500/50 text-red-400'
              : 'bg-green-500/20 border border-green-500/50 text-green-400'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
