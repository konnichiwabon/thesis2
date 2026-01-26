"use client"

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, useMapEvents } from 'react-leaflet';
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

interface BusStop {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

interface MapComponentProps {
  jeepLocations: JeepLocation[];
  busStops?: BusStop[];
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

function BusStopsLayer({ busStops }: { busStops: BusStop[] }) {
  const [zoom, setZoom] = useState(15);
  
  useMapEvents({
    zoomend: (e) => {
      setZoom(e.target.getZoom());
    },
  });

  // Only show bus stops when zoomed in to level 14 or higher
  if (zoom < 14) {
    return null;
  }

  return (
    <>
      {busStops.map((stop) => (
        <CircleMarker
          key={stop._id}
          center={[stop.lat, stop.lng]}
          radius={8}
          pathOptions={{
            fillColor: stop.color,
            fillOpacity: 0.6,
            color: stop.color,
            weight: 1.5
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{stop.name}</h3>
              <p className="text-sm text-gray-600">Bus Stop</p>
              <p className="text-xs text-gray-500">
                {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

const MapComponent: React.FC<MapComponentProps> = ({ jeepLocations, busStops = [], selectedLocation, onViewMoreDetails }) => {
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
        
        {/* Bus Stops as Circles - only visible when zoomed in */}
        <BusStopsLayer busStops={busStops} />
        
        {/* Jeepney Markers */}
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