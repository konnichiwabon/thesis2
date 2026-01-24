"use client"

import React, { useEffect, useRef } from 'react';
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

// Component to handle map panning
function MapController({ selectedLocation }: { selectedLocation?: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(selectedLocation, 17, {
        duration: 1.5
      });
    }
  }, [selectedLocation, map]);
  
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({ jeepLocations, selectedLocation, onViewMoreDetails }) => {
  // Fix for default Leaflet marker icons in React - only on client side
  useEffect(() => {
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);
  
  // Default center to Cebu City
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {jeepLocations.map((jeep) => (
          <Marker key={jeep.id} position={jeep.position}>
            <Popup>
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