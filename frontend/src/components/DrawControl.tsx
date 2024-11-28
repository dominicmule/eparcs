import { useEffect, useState, useRef } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import type { Map } from 'mapbox-gl';

interface DrawControlProps {
  map: Map | null;
  mode: 'point' | 'polygon';
  onClose: () => void;
}

type IncidentType = 'snare' | 'carcass' | 'arrest' | 'poison' | 'ditchTrap';

export function DrawControl({ map, mode, onClose }: DrawControlProps) {
  const [description, setDescription] = useState('');
  const [incidentType, setIncidentType] = useState<IncidentType>('snare');
  const [zoneName, setZoneName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [drawnFeature, setDrawnFeature] = useState<GeoJSON.Feature | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create new draw instance
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: mode === 'point',
        polygon: mode === 'polygon',
        trash: true
      },
      userProperties: true
    });

    // Store reference
    drawRef.current = draw;
    
    // Add to map
    map.addControl(draw);

    // Start drawing mode
    setTimeout(() => {
      draw.changeMode(mode === 'point' ? 'draw_point' : 'draw_polygon');
    }, 100);

    // Handle feature creation
    const handleCreate = (e: { features: GeoJSON.Feature[] }) => {
      if (e.features && e.features.length > 0) {
        setDrawnFeature(e.features[0]);
      }
    };

    map.on('draw.create', handleCreate);
    map.on('draw.modechange', (e) => console.log('Mode changed:', e));

    // Cleanup
    return () => {
      if (map) {
        map.off('draw.create', handleCreate);
        if (draw) {
          map.removeControl(draw);
        }
      }
    };
  }, [map, mode]);

  const handleSubmit = async () => {
    if (!drawnFeature || !map || !drawRef.current) return;

    try {
      const endpoint = mode === 'point' ? '/incidents' : '/zones';
      const data = mode === 'point' ? {
        type: 'Feature',
        geometry: drawnFeature.geometry,
        properties: {
          type: incidentType,
          description,
          timestamp: new Date().toISOString()
        }
      } : {
        type: 'Feature',
        geometry: drawnFeature.geometry,
        properties: {
          name: zoneName,
          description,
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to save');

      drawRef.current.deleteAll();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <>
      {!drawnFeature && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded px-4 py-2 shadow-lg z-50">
          {mode === 'point' ? 'Click on the map to place an incident' : 'Click points to draw a zone. Double-click to finish.'}
        </div>
      )}

      {drawnFeature && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-96 z-50">
          <h3 className="text-lg font-semibold mb-4">
            {mode === 'point' ? 'Add Incident' : 'Add Zone'}
          </h3>

          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {mode === 'point' ? (
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                className="w-full p-2 border rounded"
              >
                <option value="snare">Snare</option>
                <option value="carcass">Carcass</option>
                <option value="arrest">Point of Arrest</option>
                <option value="poison">Poison</option>
                <option value="ditchTrap">Ditch Trap</option>
              </select>
            ) : (
              <input
                type="text"
                placeholder="Zone Name"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            )}

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}