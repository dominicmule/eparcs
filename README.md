# Ranger Monitoring System - Frontend

This is the frontend application for the Ranger Monitoring System, built with React, TypeScript, and Mapbox GL JS.

## Features

- Interactive map with custom tileset integration
- Layer controls for heatmap, patrol routes, and incidents
- Incident reporting with point markers
- Zone creation with polygon drawing
- Real-time updates for patrol activities

## Backend Integration Guide

### API Endpoints Required

1. **Incidents API**
   ```
   POST /incidents
   {
     "type": string,          // "snare" | "carcass" | "arrest" | "poison" | "ditchTrap"
     "coordinates": number[], // [longitude, latitude]
     "description": string,
     "timestamp": string     // ISO date string
   }
   ```

2. **Zones API**
   ```
   POST /zones
   {
     "name": string,
     "geometry": {
       "type": "Polygon",
       "coordinates": number[][][]
     },
     "description": string,
     "timestamp": string
   }
   ```

3. **Patrols API**
   ```
   GET /patrols
   Returns: GeoJSON FeatureCollection of patrol routes
   ```

4. **Incidents List API**
   ```
   GET /incidents
   Returns: GeoJSON FeatureCollection of incidents
   ```

### Data Structures

1. **Patrol Route**
   ```typescript
   interface PatrolRoute {
     type: 'Feature';
     geometry: {
       type: 'LineString';
       coordinates: number[][];
     };
     properties: {
       rangerId: string;
       startTime: string;
       endTime: string;
     };
   }
   ```

2. **Incident**
   ```typescript
   interface Incident {
     type: 'Feature';
     geometry: {
       type: 'Point';
       coordinates: number[];
     };
     properties: {
       type: 'snare' | 'carcass' | 'arrest' | 'poison' | 'ditchTrap';
       description: string;
       timestamp: string;
     };
   }
   ```

3. **Zone**
   ```typescript
   interface Zone {
     type: 'Feature';
     geometry: {
       type: 'Polygon';
       coordinates: number[][][];
     };
     properties: {
       name: string;
       description: string;
       patrolFrequency: number;
     };
   }
   ```

### Environment Variables

The backend needs to provide these environment variables:

```env
VITE_API_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_MAPBOX_TILESET_ID=your_tileset_id
```

### Authentication

The frontend expects JWT-based authentication. Implement these endpoints:

```
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

### Real-time Updates

Consider implementing WebSocket connections for:
- Ranger position updates
- New incident reports
- Patrol route updates

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with required variables

3. Start development server:
   ```bash
   npm run dev
   ```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.