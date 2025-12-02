'use client';

import { useEffect, useRef, useState } from 'react';

export default function GoogleMap({ hotspots = [], requests = [] }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (window.google?.maps) {
      initMap();
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkGoogle = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkGoogle);
          initMap();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (map) {
      updateMarkers();
    }
  }, [map, hotspots, requests]);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 28.7041, lng: 77.1025 },
      zoom: 10,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#212121' }] },
        { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
        {
          featureType: 'administrative',
          elementType: 'geometry',
          stylers: [{ color: '#757575' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#757575' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry.fill',
          stylers: [{ color: '#2c2c2c' }],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#8a8a8a' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#000000' }],
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#3d3d3d' }],
        },
      ],
    });

    setMap(newMap);
  };

  const updateMarkers = () => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const allMarkers = [];

    // Create hotspot markers
    hotspots.forEach((hotspot) => {
      const markerColor = 
        hotspot.status === 'pending' ? '#EAB308' :
        hotspot.status === 'verified' ? '#10B981' :
        '#6B7280';

      const marker = new window.google.maps.Marker({
        position: { lat: hotspot.latitude, lng: hotspot.longitude },
        map: map,
        title: `Hotspot #${hotspot._id.slice(-6)}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 10px;">
            <strong>Hotspot #${hotspot._id.slice(-6)}</strong><br/>
            <span style="color: ${markerColor};">Status: ${hotspot.status}</span><br/>
            ${hotspot.detectionResult?.pollutantType ? `Type: ${hotspot.detectionResult.pollutantType}<br/>` : ''}
            ${hotspot.detectionResult?.severity ? `Severity: ${hotspot.detectionResult.severity}<br/>` : ''}
            Location: ${hotspot.latitude.toFixed(4)}, ${hotspot.longitude.toFixed(4)}<br/>
            ${hotspot.imageUrl ? `<img src="${hotspot.imageUrl}" style="width: 150px; height: 100px; object-fit: cover; margin-top: 8px; border-radius: 4px;" />` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      allMarkers.push(marker);
    });

    // Create request markers
    requests.forEach((req) => {
      const marker = new window.google.maps.Marker({
        position: { lat: req.latitude, lng: req.longitude },
        map: map,
        title: `${req.eventType} Request`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: req.status === 'pending' ? '#EAB308' : req.status === 'approved' ? '#10B981' : '#3B82F6',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: black; padding: 10px;">
            <strong>${req.eventType}</strong><br/>
            <span style="color: ${req.status === 'pending' ? '#EAB308' : req.status === 'approved' ? '#10B981' : '#3B82F6'};">Status: ${req.status}</span><br/>
            ${req.description}<br/>
            Location: ${req.latitude.toFixed(4)}, ${req.longitude.toFixed(4)}<br/>
            ${req.address ? `Address: ${req.address}` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      allMarkers.push(marker);
    });

    setMarkers(allMarkers);

    // Fit bounds to show all markers
    if (allMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      hotspots.forEach(hotspot => {
        bounds.extend({ lat: hotspot.latitude, lng: hotspot.longitude });
      });
      requests.forEach(req => {
        bounds.extend({ lat: req.latitude, lng: req.longitude });
      });
      map.fitBounds(bounds);
    }
  };

  return (
    <div 
      ref={mapRef} 
      className="h-[600px] w-full rounded-lg"
      style={{ minHeight: '600px' }}
    />
  );
}
