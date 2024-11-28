interface Coordinates {
  lat: number;
  lng: number;
}

interface GridFeature {
  type: 'Feature';
  properties: {
    id: string;
    type: 'block' | 'section';
    patrolStatus?: 'low' | 'medium' | 'high';
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export function generateGrid(
  bounds: typeof import('../constants/mapConfig').PARK_BOUNDS,
  size: number,
  type: 'block' | 'section'
): GridFeature[] {
  const features: GridFeature[] = [];
  
  for (let lat = bounds.south; lat < bounds.north; lat += size) {
    for (let lng = bounds.west; lng < bounds.east; lng += size) {
      const coordinates = [
        [lng, lat],
        [lng + size, lat],
        [lng + size, lat + size],
        [lng, lat + size],
        [lng, lat], // Close the polygon
      ];

      features.push({
        type: 'Feature',
        properties: {
          id: `${type}-${lat.toFixed(4)}-${lng.toFixed(4)}`,
          type,
          patrolStatus: 'low',
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      });
    }
  }

  return features;
}