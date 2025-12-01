export default function HotspotCard({ hotspot }) {
  const statusColors = {
    pending: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
    verified: 'text-green-400 bg-green-500/20 border-green-500/50',
    duplicate: 'text-gray-400 bg-gray-500/20 border-gray-500/50',
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-4 hover:border-purple-500/50 transition-all duration-300">
      {hotspot.imageUrl && (
        <img
          src={hotspot.imageUrl}
          alt={`Hotspot ${hotspot._id}`}
          className="w-full h-40 object-cover rounded-lg mb-3"
        />
      )}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white">{hotspot.detectionResult?.pollutantType || 'Unknown'}</h3>
          <span className={`px-2 py-1 rounded text-xs border ${statusColors[hotspot.status] || statusColors.pending}`}>
            {hotspot.status}
          </span>
        </div>
        {hotspot.detectionResult?.confidence && (
          <p className="text-sm text-gray-400">
            Confidence: {(hotspot.detectionResult.confidence * 100).toFixed(1)}%
          </p>
        )}
        <p className="text-xs text-gray-500">
          📍 {hotspot.latitude?.toFixed(4)}, {hotspot.longitude?.toFixed(4)}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(hotspot.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
