import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapControls } from './MapControls';
import { DrawControl } from './DrawControl';
import { PARK_CENTER, MAP_CONFIG } from '../constants/mapConfig';
import { useMapStore } from '../store/mapStore';

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

if (!mapboxToken) {
  throw new Error('Please set your Mapbox token in the .env file');
}

mapboxgl.accessToken = mapboxToken;

function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const { layers, incidentTypes } = useMapStore();

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
      mapInstance.addControl(nav, 'top-right');

      // Wait for map to load before adding sources and layers
      mapInstance.on('load', async () => {
        try {
          // Load GeoJSON data
          const response = await fetch('/boundaries.geojson');
          if (!response.ok) {
            throw new Error('Failed to load boundary data');
          }
          const data = await response.json();

          // Add source for boundaries
          mapInstance.addSource('boundaries', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: data.features.map((feature: any) => ({
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
          data.features.forEach((feature: any) => {
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
        } catch (err) {
          console.error('Error setting up map layers:', err);
          setMapError('Failed to load map data');
        }
      });

      // Handle map errors
      mapInstance.on('error', (e) => {
        console.error('Mapbox error:', e);
        if (e.error?.status === 401) {
          setMapError('Invalid Mapbox access token');
        } else {
          setMapError('Error loading map resources');
        }
      });

      return () => {
        if (mapInstance) {
          mapInstance.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Map initialization error:', err);
      setMapError('Failed to initialize the map');
    }
  }, []);

  // Update layer visibility based on store state
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    try {
      const mapInstance = map.current;

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
      setMapError('Failed to update map layers');
    }
  }, [layers, incidentTypes]);

  return (
    <div className="relative w-full h-full">
      {mapError && (
        <div className="absolute top-4 left-4 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {mapError}
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
      <MapControls map={map.current} />
      <DrawControl map={map.current} />
    </div>
  );
}

export default Map;