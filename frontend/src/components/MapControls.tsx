import { useState } from 'react';
import { Layers, ZoomIn, ZoomOut, MapPin, Square } from 'lucide-react';
import type { Map } from 'mapbox-gl';
import { useMapStore } from '../store/mapStore';
import { DrawControl } from './DrawControl';

interface MapControlsProps {
  map: Map | null;
  onDrawModeChange: (mode: 'point' | 'polygon' | null) => void;
  draw?: MapboxDraw | null;  // Add draw prop
}

export function MapControls({ map, onDrawModeChange, draw }: MapControlsProps) {
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  const [activeDrawMode, setActiveDrawMode] = useState<'point' | 'polygon' | null>(null);
  const { layers, incidentTypes, setLayer, setIncidentType } = useMapStore();

  const handleZoomIn = () => {
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    if (map) map.zoomOut();
  };

  const handleDrawModeChange = (mode: 'point' | 'polygon') => {
    if (!draw) return;
    
    const newMode = activeDrawMode === mode ? null : mode;
    setActiveDrawMode(newMode);
    
    if (newMode === null) {
      draw.changeMode('simple_select');
    } else {
      draw.changeMode(newMode === 'point' ? 'draw_point' : 'draw_polygon');
    }
  };

  return (
    <>
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2">
        <div className="space-y-2">
          <button 
            onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Toggle Layers"
          >
            <Layers className="h-5 w-5" />
          </button>
          <button 
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button 
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDrawModeChange('point')}
            className={`p-2 rounded transition-colors ${
              activeDrawMode === 'point' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            title="Add Incident"
          >
            <MapPin className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDrawModeChange('polygon')}
            className={`p-2 rounded transition-colors ${
              activeDrawMode === 'polygon' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
            title="Add Zone"
          >
            <Square className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Layers Panel */}
      {isLayersPanelOpen && (
        <div className="absolute bottom-4 left-20 bg-white rounded-lg shadow-lg p-4 w-64">
          <h3 className="font-semibold mb-2">Map Layers</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layers.heatmap}
                  onChange={(e) => setLayer('heatmap', e.target.checked)}
                  className="form-checkbox"
                />
                <span>Coverage Heatmap</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layers.patrolRoutes}
                  onChange={(e) => setLayer('patrolRoutes', e.target.checked)}
                  className="form-checkbox"
                />
                <span>Patrol Routes</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={layers.incidents}
                  onChange={(e) => setLayer('incidents', e.target.checked)}
                  className="form-checkbox"
                />
                <span>Incidents</span>
              </label>
            </div>

            {layers.incidents && (
              <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                <h4 className="font-medium text-sm text-gray-600">Incident Types</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={incidentTypes.snares}
                    onChange={(e) => setIncidentType('snares', e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Snares</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={incidentTypes.carcasses}
                    onChange={(e) => setIncidentType('carcasses', e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Carcasses</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={incidentTypes.arrests}
                    onChange={(e) => setIncidentType('arrests', e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Points of Arrest</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={incidentTypes.poison}
                    onChange={(e) => setIncidentType('poison', e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Poison</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={incidentTypes.ditchTraps}
                    onChange={(e) => setIncidentType('ditchTraps', e.target.checked)}
                    className="form-checkbox"
                  />
                  <span>Ditch Traps</span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Draw Control */}
      {activeDrawMode && map && (
        <DrawControl
          map={map}
          mode={activeDrawMode}
          onClose={() => setActiveDrawMode(null)}
        />
      )}
    </>
  );
}