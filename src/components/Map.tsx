import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapControls } from './MapControls';
import { useMapStore } from '../store/mapStore';
import { PARK_CENTER, MAP_CONFIG } from '../constants/mapConfig';

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

if (!mapboxToken) {
  throw new Error('Please set your Mapbox token in the .env file');
}

mapboxgl.accessToken = mapboxToken;

function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { layers, incidentTypes } = useMapStore();
  const controls = useRef<mapboxgl.IControl[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: PARK_CENTER,
        zoom: MAP_CONFIG.initialZoom,
        minZoom: MAP_CONFIG.minZoom,
        maxZoom: MAP_CONFIG.maxZoom,
        attributionControl: true,
      });

      const mapInstance = map.current;

      // Add navigation controls
      const nav = new mapboxgl.NavigationControl();
      const fullscreen = new mapboxgl.FullscreenControl();
      const scale = new mapboxgl.ScaleControl();

      mapInstance.addControl(nav, 'top-right');
      mapInstance.addControl(fullscreen);
      mapInstance.addControl(scale);

      controls.current = [nav, fullscreen, scale];

      // Wait for map to load before adding sources and layers
      mapInstance.on('load', () => {
        // Load GeoJSON data
        fetch('/boundaries.geojson')
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to load boundary data');
            }
            return response.json();
          })
          .then(data => {
            if (!mapInstance.getSource('boundaries')) {
              // Add source for boundaries
              mapInstance.addSource('boundaries', {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: data.features.map(feature => ({
                    ...feature,
                    properties: {
                      ...feature.properties,
                      patrolFrequency: feature.properties.patrolFrequency || Math.random()
                    }
                  }))
                }
              });

              // Add base boundaries layer (always visible)
              mapInstance.addLayer({
                'id': 'boundaries-base',
                'type': 'line',
                'source': 'boundaries',
                'paint': {
                  'line-color': '#000',
                  'line-width': 1
                }
              });

              // Add heatmap fill layer (toggleable)
              mapInstance.addLayer({
                'id': 'boundaries-heatmap',
                'type': 'fill',
                'source': 'boundaries',
                'paint': {
                  'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'patrolFrequency'],
                    0, 'hsl(0, 75%, 45%)',
                    0.5, 'hsl(60, 75%, 45%)',
                    1, 'hsl(120, 75%, 45%)'
                  ],
                  'fill-opacity': 0.3
                },
                'layout': {
                  'visibility': layers.heatmap ? 'visible' : 'none'
                }
              });

              // Add hover and click handlers
              mapInstance.on('mouseenter', 'boundaries-base', () => {
                mapInstance.getCanvas().style.cursor = 'pointer';
              });

              mapInstance.on('mouseleave', 'boundaries-base', () => {
                mapInstance.getCanvas().style.cursor = '';
              });

              mapInstance.on('click', 'boundaries-base', (e) => {
                if (e.features && e.features[0]) {
                  const properties = e.features[0].properties;
                  new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                      <div class="p-2">
                        <h3 class="font-bold">${properties.name || 'Block'}</h3>
                        <p>Patrol Frequency: ${(properties.patrolFrequency * 100).toFixed(0)}%</p>
                      </div>
                    `)
                    .addTo(mapInstance);
                }
              });

              // Fit bounds to the GeoJSON data
              const bounds = new mapboxgl.LngLatBounds();
              data.features.forEach(feature => {
                if (feature.geometry.coordinates && feature.geometry.coordinates[0]) {
                  feature.geometry.coordinates[0].forEach((coord: number[]) => {
                    bounds.extend(coord as [number, number]);
                  });
                }
              });

              mapInstance.fitBounds(bounds, {
                padding: MAP_CONFIG.padding,
                maxZoom: MAP_CONFIG.maxZoom
              });
            }
          })
          .catch(err => {
            console.error('Error loading GeoJSON:', err);
            setError('Failed to load boundary data');
          });
      });

      // Handle map errors
      mapInstance.on('error', (e) => {
        console.error('Mapbox error:', e);
        if (e.error?.status === 401) {
          setError('Invalid Mapbox access token');
        } else {
          setError('Error loading map resources');
        }
      });

      return () => {
        if (mapInstance && mapInstance.getCanvas()) {
          // Remove event listeners
          mapInstance.off('mouseenter', 'boundaries-base');
          mapInstance.off('mouseleave', 'boundaries-base');
          mapInstance.off('click', 'boundaries-base');
          mapInstance.off('error');
          mapInstance.off('load');

          // Remove controls before removing map
          controls.current.forEach(control => {
            if (mapInstance.hasControl(control)) {
              mapInstance.removeControl(control);
            }
          });

          // Remove the map instance
          mapInstance.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize the map');
    }
  }, []);

  // Update layer visibility based on store state
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const mapInstance = map.current;

    try {
      // Update heatmap visibility
      if (mapInstance.getLayer('boundaries-heatmap')) {
        mapInstance.setLayoutProperty(
          'boundaries-heatmap',
          'visibility',
          layers.heatmap ? 'visible' : 'none'
        );
      }

      // Update patrol routes visibility
      if (mapInstance.getLayer('patrol-routes')) {
        mapInstance.setLayoutProperty(
          'patrol-routes',
          'visibility',
          layers.patrolRoutes ? 'visible' : 'none'
        );
      }

      // Update incidents visibility and filter
      if (mapInstance.getLayer('incidents')) {
        mapInstance.setLayoutProperty(
          'incidents',
          'visibility',
          layers.incidents ? 'visible' : 'none'
        );

        if (layers.incidents) {
          mapInstance.setFilter('incidents', ['in', 'type', 
            ...Object.entries(incidentTypes)
              .filter(([_, enabled]) => enabled)
              .map(([type]) => type)
          ]);
        }
      }
    } catch (err) {
      console.error('Error updating layer visibility:', err);
      setError('Failed to update map layers');
    }
  }, [layers, incidentTypes]);

  return (
    <div className="relative w-full h-full">
      {error && (
        <div className="absolute top-4 left-4 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
      <MapControls map={map.current} />
    </div>
  );
}

export default Map;