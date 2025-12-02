'use client';

import { useState, useEffect } from 'react';

export default function NotificationsPage() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        try {
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const geoData = await geoRes.json();
          
          let city = 'Unknown';
          let state = 'Unknown';
          
          if (geoData.results && geoData.results[0]) {
            const components = geoData.results[0].address_components;
            components.forEach(comp => {
              if (comp.types.includes('locality')) city = comp.long_name;
              if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
            });
          }
          
          setLocation({ lat, lon, city, state });
          await fetchWeather(lat, lon);
        } catch (err) {
          setError('Failed to get location details');
          setLoading(false);
        }
      },
      (err) => {
        setError('Please enable location access to view weather data');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setWeatherData(data);
      }
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mb-4"></div>
        <p className="text-gray-400">Detecting your location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-8 text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={detectLocation}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const aqiColor = weatherData?.aqi?.level >= 4 ? 'red' : weatherData?.aqi?.level >= 3 ? 'orange' : weatherData?.aqi?.level >= 2 ? 'yellow' : 'green';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/80 text-sm mb-1">Your Location</p>
            <h3 className="text-2xl font-bold text-white">📍 {location?.city}, {location?.state}</h3>
            <p className="text-white/60 text-xs mt-1">Lat: {location?.lat?.toFixed(4)}, Lon: {location?.lon?.toFixed(4)}</p>
          </div>
          <button
            onClick={detectLocation}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-300 text-sm backdrop-blur-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Daily Weather & Air Quality Update
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={`bg-gradient-to-br from-${aqiColor}-600 to-${aqiColor}-800 rounded-lg p-6`}>
            <h3 className="text-xl font-bold text-white mb-2">Air Quality Index</h3>
            <p className="text-5xl font-bold text-white mb-2">{weatherData?.aqi?.label}</p>
            <p className="text-sm text-white/80">US AQI: {weatherData?.aqi?.usAqi}</p>
            <p className="text-sm text-white/80">EU AQI: {weatherData?.aqi?.euAqi}</p>
            <p className="text-sm text-white/80">PM2.5: {weatherData?.aqi?.pm25} µg/m³</p>
            <p className="text-sm text-white/80">PM10: {weatherData?.aqi?.pm10} µg/m³</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">Temperature</h3>
            <p className="text-5xl font-bold text-white mb-2">{weatherData?.weather?.temp}°C</p>
            <p className="text-sm text-white/80">Feels like: {weatherData?.weather?.feelsLike}°C</p>
            <p className="text-sm text-white/80">Max: {weatherData?.weather?.maxTemp}°C | Min: {weatherData?.weather?.minTemp}°C</p>
            <p className="text-sm text-white/80 capitalize">{weatherData?.weather?.description}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">Conditions</h3>
            <p className="text-sm text-white/80">Humidity: {weatherData?.weather?.humidity}%</p>
            <p className="text-sm text-white/80">Pressure: {weatherData?.weather?.pressure} hPa</p>
            <p className="text-sm text-white/80">Wind: {weatherData?.weather?.windSpeed} km/h</p>
            <p className="text-sm text-white/80">UV Index: {weatherData?.weather?.uvIndex}</p>
            <p className="text-sm text-white/80">Precipitation: {weatherData?.weather?.precipitation} mm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h4 className="font-bold text-white mb-2">🌅 Sun Times</h4>
            <p className="text-sm text-gray-300">Sunrise: {weatherData?.weather?.sunrise ? new Date(weatherData.weather.sunrise).toLocaleTimeString() : 'N/A'}</p>
            <p className="text-sm text-gray-300">Sunset: {weatherData?.weather?.sunset ? new Date(weatherData.weather.sunset).toLocaleTimeString() : 'N/A'}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h4 className="font-bold text-white mb-2">🧪 Pollutants</h4>
            <p className="text-sm text-gray-300">CO: {weatherData?.aqi?.co} µg/m³</p>
            <p className="text-sm text-gray-300">NO₂: {weatherData?.aqi?.no2} µg/m³</p>
            <p className="text-sm text-gray-300">SO₂: {weatherData?.aqi?.so2} µg/m³</p>
            <p className="text-sm text-gray-300">O₃: {weatherData?.aqi?.o3} µg/m³</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <h4 className="font-bold text-green-400 mb-2">✅ Do's</h4>
            <ul className="space-y-1">
              {weatherData?.recommendations?.dos?.map((item, i) => (
                <li key={i} className="text-sm text-gray-300">• {item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <h4 className="font-bold text-red-400 mb-2">❌ Don'ts</h4>
            <ul className="space-y-1">
              {weatherData?.recommendations?.donts?.map((item, i) => (
                <li key={i} className="text-sm text-gray-300">• {item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <h4 className="font-bold text-yellow-400 mb-2">⚠️ Precautions</h4>
            <ul className="space-y-1">
              {weatherData?.recommendations?.precautions?.map((item, i) => (
                <li key={i} className="text-sm text-gray-300">• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Last updated: {new Date(weatherData?.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
