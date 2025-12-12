"use client"

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Fix for default Leaflet marker icons in React ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import PopupCard from './popupcard';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
// -----------------------------------------------------

const MapComponent = ({ coords }) => {
  // Default to Cebu City if no coords are provided
  const centerPosition = coords || [10.3157, 123.8854];

  return (
    <div style={{ height: '100vh', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <MapContainer 
        center={centerPosition} 
        zoom={15} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={centerPosition}>
          <Popup>
            <PopupCard 
              route="62C"
              plateNumber="ABC 123"
              currentLoad={35}
              maxLoad={40}
              status="Moderate"
              colorTheme="orange" 
              onClose={() => {}}
            />
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;