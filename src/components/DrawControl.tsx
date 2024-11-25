import { useState, useEffect } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import type { Map } from 'mapbox-gl';
import { X, AlertCircle, Loader } from 'lucide-react';

interface DrawControlProps {
  map: Map | null;
}

const INCIDENT_TYPES = [
  { value: 'snare', label: 'Snare' },
  { value: 'carcass', label: 'Carcass' },
  { value: 'arrest', label: 'Point of Arrest' },
  { value: 'poison', label: 'Poison' },
  { value: 'ditchTrap', label: 'Ditch Trap' }
] as const;

const ZONE_TYPES = [
  { value: 'poachingHotzone', label: 'Poaching Hotzone' },
  { value: 'arrestHotzone', label: 'Arrest Hotzone' },
  { value: 'snaresHotzone', label: 'Snares Hotzone' },
  { value: 'patrolZone', label: 'Patrol Zone' }
] as const;

type IncidentType = typeof INCIDENT_TYPES[number]['value'];
type ZoneType = typeof ZONE_TYPES[number]['value'];

interface FeatureModalProps {
  isPoint: boolean;
  onSave: (data: { type: string; name?: string; description: string }) => Promise<void>;
  onClose: () => void;
  error: string | null;
}

function FeatureModal({ isPoint, onSave, onClose, error }: FeatureModalProps) {
  const [type, setType] = useState(isPoint ? INCIDENT_TYPES[0].value : ZONE_TYPES[0].value);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSave = async () => {
    setValidationError(null);

    if (!description.trim()) {
      setValidationError('Description is required');
      return;
    }

    if (!isPoint && !name.trim()) {
      setValidationError('Zone name is required');
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave({ type, name: name.trim(), description: description.trim() });
    } catch (err) {
      // Error is handled by parent component
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isPoint ? 'Add Incident' : 'Add Zone'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {(error || validationError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{validationError || error}</p>
              {error && (
                <p className="text-sm mt-1">Please check your connection and try again.</p>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isPoint ? 'Incident Type' : 'Zone Type'}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSaving}
            >
              {(isPoint ? INCIDENT_TYPES : ZONE_TYPES).map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {!isPoint && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zone Name
              </label>
              <input
                type="text"
                placeholder="Enter zone name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSaving}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              disabled={isSaving}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
              disabled={isSaving}
            >
              {isSaving && <Loader className="h-4 w-4 animate-spin" />}
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DrawControl({ map }: DrawControlProps) {
  const [draw, setDraw] = useState<MapboxDraw | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<GeoJSON.Feature | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!map) return;

    const drawControl = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        polygon: true,
        trash: true
      }
    });

    map.addControl(drawControl);
    setDraw(drawControl);

    const createHandler = (e: { features: GeoJSON.Feature[] }) => {
      if (e.features?.[0]) {
        setCurrentFeature(e.features[0]);
        setShowModal(true);
        setError(null);
      }
    };

    map.on('draw.create', createHandler);

    return () => {
      map.off('draw.create', createHandler);
      if (drawControl) {
        map.removeControl(drawControl);
      }
    };
  }, [map]);

  const handleSave = async (data: { type: string; name?: string; description: string }) => {
    try {
      if (!currentFeature) {
        throw new Error('No feature selected');
      }

      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please check your environment variables.');
      }

      const isPoint = currentFeature.geometry.type === 'Point';
      const endpoint = isPoint ? '/incidents' : '/zones';
      
      const payload = isPoint
        ? {
            type: data.type,
            coordinates: currentFeature.geometry.coordinates,
            description: data.description,
            timestamp: new Date().toISOString()
          }
        : {
            name: data.name,
            type: data.type,
            geometry: currentFeature.geometry,
            description: data.description,
            timestamp: new Date().toISOString()
          };

      try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || 
            `Server error: ${response.status} ${response.statusText}`
          );
        }

        // Clear the drawing
        if (draw) {
          draw.deleteAll();
        }

        setShowModal(false);
        setCurrentFeature(null);
        setError(null);
      } catch (err) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          throw new Error('Unable to connect to the server. Please check your internet connection.');
        }
        throw err;
      }
    } catch (err) {
      console.error('Failed to save:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save feature';
      setError(errorMessage);
      throw err;
    }
  };

  const handleClose = () => {
    if (draw) {
      draw.deleteAll();
    }
    setShowModal(false);
    setCurrentFeature(null);
    setError(null);
  };

  return (
    <>
      {showModal && currentFeature && (
        <FeatureModal
          isPoint={currentFeature.geometry.type === 'Point'}
          onSave={handleSave}
          onClose={handleClose}
          error={error}
        />
      )}
    </>
  );
}