"use client"

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PopupCard from './popupcard';

interface JeepLocation {
  id: string;
  plateNumber: string;
  passengerCount: number;
  position: [number, number];
  colorTheme: 'green' | 'red' | 'orange' | 'purple';
  status: string;
}

interface MapComponentProps {
  jeepLocations: JeepLocation[];
  selectedLocation?: [number, number] | null;
  onViewMoreDetails: (jeep: any) => void;
}

function MapController({ selectedLocation }: { selectedLocation?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(selectedLocation, 17, { duration: 1.5 });
    }
  }, [selectedLocation, map]);
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ jeepLocations, selectedLocation, onViewMoreDetails }) => {
  useEffect(() => {
    // Fix for default markers
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);
  
  const centerPosition: [number, number] = jeepLocations.length > 0 
    ? jeepLocations[0].position 
    : [10.3157, 123.8854];

  return (
    <div style={{ height: '100vh', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <MapContainer 
        center={centerPosition} 
        zoom={15} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapController selectedLocation={selectedLocation} />
        
        {/* --- GOOGLE MAPS LAYER (FIXED HTTPS) --- */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        {/* --------------------------------------- */}
        
        {jeepLocations.map((jeep) => (
          <Marker key={jeep.id} position={jeep.position}>
            <Popup autoPan={true} keepInView={true}>
              <PopupCard 
                route={jeep.id}
                plateNumber={jeep.plateNumber}
                currentLoad={jeep.passengerCount}
                maxLoad={40}
                status={jeep.status}
                colorTheme={jeep.colorTheme}
                onClose={() => {}}
                onViewMoreDetails={() => onViewMoreDetails(jeep)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;