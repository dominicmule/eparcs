import React, { createContext, useContext, useState } from 'react';

interface MapContextType {
  selectedZone: string | null;
  setSelectedZone: (zone: string | null) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  return (
    <MapContext.Provider value={{ selectedZone, setSelectedZone }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}