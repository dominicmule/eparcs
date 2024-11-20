import { useState } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Map } from 'mapbox-gl';
import * as turf from '@turf/turf';

interface DrawControlProps {
  map: Map | null;
  onClose: () => void;
}

type DrawMode = 'point' | 'polygon' | null;
type IncidentType = 'snare' | 'carcass' | 'arrest' | 'poison' | 'ditchTrap';

const apiUrl = import.meta.env.VITE_API_URL;

export function DrawControl({ map, onClose }: DrawControlProps) {
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [incidentType, setIncidentType] = useState<IncidentType>('snare');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (feature: GeoJSON.Feature) => {
    try {
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const endpoint = drawMode === 'point' ? '/incidents' : '/zones';
      const data = drawMode === 'point'
        ? {
            type: incidentType,
            coordinates: feature.geometry.coordinates,
            description,
            timestamp: new Date().toISOString(),
          }
        : {
            name,
            geometry: feature.geometry,
            description,
            timestamp: new Date().toISOString(),
          };

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Success - close the modal
      onClose();
    } catch (err) {
      console.error('Failed to save:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleDraw = (mode: DrawMode) => {
    if (!map) return;

    setError(null);

    // Remove existing draw control if any
    const existingDraw = map.getControl('draw');
    if (existingDraw) {
      map.removeControl(existingDraw);
    }

    // Initialize new draw control
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: mode === 'point',
        polygon: mode === 'polygon',
        trash: true,
      },
    });

    map.addControl(draw, 'top-left');
    map.setControl('draw', draw);

    // Handle draw creation
    map.once('draw.create', (e) => {
      handleSubmit(e.features[0]);
      map.removeControl(draw);
    });

    setDrawMode(mode);
  };

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-96">
      <h3 className="text-lg font-semibold mb-4">Add to Map</h3>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleDraw('point')}
            className={`flex-1 py-2 px-4 rounded ${
              drawMode === 'point'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Add Incident
          </button>
          <button
            onClick={() => handleDraw('polygon')}
            className={`flex-1 py-2 px-4 rounded ${
              drawMode === 'polygon'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Draw Zone
          </button>
        </div>

        {drawMode === 'point' && (
          <div className="space-y-3">
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
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        )}

        {drawMode === 'polygon' && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Zone Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          {drawMode && (
            <button
              onClick={() => {
                if (map) {
                  const draw = map.getControl('draw');
                  if (draw) {
                    map.removeControl(draw);
                  }
                }
                setDrawMode(null);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}