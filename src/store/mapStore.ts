import { create } from 'zustand';

interface MapState {
  layers: {
    heatmap: boolean;
    incidents: boolean;
    patrolRoutes: boolean;
  };
  incidentTypes: {
    [key: string]: boolean;
  };
  setLayer: (layer: keyof MapState['layers'], value: boolean) => void;
  setIncidentType: (type: string, value: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  layers: {
    heatmap: true,
    incidents: true,
    patrolRoutes: true,
  },
  incidentTypes: {
    snares: true,
    carcasses: true,
    arrests: true,
    poison: true,
    ditchTraps: true,
  },
  setLayer: (layer, value) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: value,
      },
    })),
  setIncidentType: (type, value) =>
    set((state) => ({
      incidentTypes: {
        ...state.incidentTypes,
        [type]: value,
      },
    })),
}));