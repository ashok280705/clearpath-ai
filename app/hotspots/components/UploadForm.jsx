'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toFormData, scaleBoxes, validateFile } from '@/lib/clientUtils';
import SignInButton from '@/app/components/SignInButton';

const STRINGS = {
  title: 'Report Pollution Hotspot',
  selectImage: 'Select Image',
  takePhoto: 'Take Photo',
  quickDetect: 'Quick Detect',
  submitHotspot: 'Submit Hotspot',
  detecting: 'Detecting...',
  submitting: 'Submitting...',
  locationDenied: 'Location access denied. Please enter manually:',
  signInRequired: 'Please sign in to submit hotspots',
  detectionResults: 'Detection Results',
  noDetections: 'No pollutants detected',
};

export default function UploadForm({ onSubmitSuccess }) {
  const { data: session } = useSession();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [locationDenied, setLocationDenied] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [detections, setDetections] = useState([]);
  const [mlResult, setMlResult] = useState(null);
  const [scaledBoxes, setScaledBoxes] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (imgRef.current && detections.length > 0 && mlResult) {
      const img = imgRef.current;
      const scaled = scaleBoxes(
        detections,
        img.naturalWidth,
        img.naturalHeight,
        img.clientWidth,
        img.clientHeight
      );
      setScaledBoxes(scaled);
    }
  }, [detections, mlResult]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(6));
          setLon(pos.coords.longitude.toFixed(6));
        },
        () => {
          setLocationDenied(true);
        }
      );
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setMessage(validation.error);
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setDetections([]);
    setMlResult(null);
    setScaledBoxes([]);
    setMessage('');
  };

  const handleDetect = async () => {
    if (!file) {
      setMessage('Please select an image first');
      return;
    }

    if (!lat || !lon) {
      setMessage('Location is required');
      return;
    }

    setStatus('detecting');
    setMessage('');

    try {
      const formData = toFormData(file, lat, lon);
      const response = await fetch(process.env.NEXT_PUBLIC_ML_PROXY || '/api/ml/proxy-detect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Detection failed');
      }

      const data = await response.json();
      setMlResult(data);
      setDetections(data.detections || []);
      setMessage(data.detections?.length > 0 ? `Found ${data.detections.length} detection(s)` : STRINGS.noDetections);
      setStatus('idle');
      setRetryCount(0);
    } catch (error) {
      if (retryCount < 1) {
        setRetryCount(retryCount + 1);
        setTimeout(() => handleDetect(), 2000);
        setMessage('Retrying detection...');
      } else {
        setMessage('ML service unavailable. Please try again later.');
        setStatus('idle');
        setRetryCount(0);
      }
    }
  };

  const getRegionFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const addressComponents = data.results[0].address_components;
        for (let component of addressComponents) {
          if (component.types.includes('administrative_area_level_1')) {
            return component.long_name;
          }
        }
      }
      return 'Unknown';
    } catch (error) {
      console.error('Geocoding error:', error);
      return 'Unknown';
    }
  };

  const handleSubmit = async () => {
    console.log('🔵 Submit clicked', { session, file, lat, lon });
    
    if (!session) {
      setMessage(STRINGS.signInRequired);
      return;
    }

    if (!file) {
      setMessage('Please select an image');
      return;
    }

    if (!lat || !lon) {
      setMessage('Location is required');
      return;
    }

    setStatus('submitting');
    setMessage('Detecting region...');

    try {
      const region = await getRegionFromCoords(parseFloat(lat), parseFloat(lon));
      console.log('🌍 Detected region:', region);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', session.user.id || session.user.email);
      formData.append('latitude', lat);
      formData.append('longitude', lon);
      formData.append('region', region);
      formData.append('address', `${lat}, ${lon}`);

      console.log('📤 Submitting to API...');

      const response = await fetch('/api/hotspots/create', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('✅ API response:', data);

      if (response.ok) {
        setMessage(`Hotspot submitted to ${region} government! Awaiting verification.`);
        setFile(null);
        setPreview(null);
        setDetections([]);
        setMlResult(null);
        setScaledBoxes([]);
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        setMessage(data.error || 'Submission failed');
      }
      setStatus('idle');
    } catch (error) {
      console.error('❌ Submit error:', error);
      setMessage('Error: ' + error.message);
      setStatus('idle');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          {STRINGS.title}
        </h2>
        <SignInButton />
      </div>

      <div className="space-y-4">
        {/* File Input */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Select image file"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            {STRINGS.selectImage}
          </button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            id="camera-input"
            aria-label="Take photo with camera"
          />
          <label
            htmlFor="camera-input"
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 text-center cursor-pointer"
          >
            {STRINGS.takePhoto}
          </label>
        </div>

        {/* Preview with Bounding Boxes */}
        {preview && (
          <div className="relative">
            <img
              ref={imgRef}
              src={preview}
              alt="Preview"
              className="w-full rounded-lg"
              onLoad={() => {
                if (detections.length > 0 && mlResult) {
                  const img = imgRef.current;
                  const scaled = scaleBoxes(
                    detections,
                    img.naturalWidth,
                    img.naturalHeight,
                    img.clientWidth,
                    img.clientHeight
                  );
                  setScaledBoxes(scaled);
                }
              }}
            />
            {scaledBoxes.map((box, i) => (
              <div
                key={i}
                className="absolute border-2 border-red-500"
                style={{
                  left: `${box.x1}px`,
                  top: `${box.y1}px`,
                  width: `${box.x2 - box.x1}px`,
                  height: `${box.y2 - box.y1}px`,
                }}
              >
                <span className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {box.label} {(box.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Location */}
        {locationDenied && (
          <p className="text-yellow-400 text-sm">{STRINGS.locationDenied}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Latitude"
          />
          <input
            type="number"
            step="any"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="Longitude"
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Longitude"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDetect}
            disabled={!file || status === 'detecting'}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 transition-all duration-300"
          >
            {status === 'detecting' ? STRINGS.detecting : STRINGS.quickDetect}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || status === 'submitting'}
            style={{ pointerEvents: 'auto' }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-300"
          >
            {status === 'submitting' ? STRINGS.submitting : STRINGS.submitHotspot}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('Error') || message.includes('failed') || message.includes('denied')
              ? 'bg-red-500/20 border border-red-500/50 text-red-400'
              : 'bg-green-500/20 border border-green-500/50 text-green-400'
          }`}>
            {message}
          </div>
        )}

        {/* Detection Results */}
        {detections.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="font-bold text-white mb-2">{STRINGS.detectionResults}</h3>
            <ul className="space-y-1">
              {detections.map((det, i) => (
                <li key={i} className="text-sm text-gray-300">
                  {det.label} - {(det.confidence * 100).toFixed(1)}% confidence
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
