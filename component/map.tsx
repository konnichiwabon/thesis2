"use client"

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PopupCard from './popupcard';
import BusStopPopup from './busStopPopup';

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
  onBusStopClick?: (busStop: BusStop) => void;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  routesPassingThrough?: any[];
  nearbyJeepneys?: any[];
  selectedBusStop?: BusStop | null;
  onJeepneyClickFromBusStop?: (jeep: any) => void;
  onCloseBusStop?: () => void;
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

function BusStopsLayer({ busStops, onBusStopClick, selectedBusStop, routesPassingThrough, nearbyJeepneys, onJeepneyClickFromBusStop, onCloseBusStop }: { 
  busStops: BusStop[]; 
  onBusStopClick?: (busStop: BusStop) => void;
  selectedBusStop?: BusStop | null;
  routesPassingThrough?: any[];
  nearbyJeepneys?: any[];
  onJeepneyClickFromBusStop?: (jeep: any) => void;
  onCloseBusStop?: () => void;
}) {
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
          eventHandlers={{
            click: () => {
              if (onBusStopClick) {
                onBusStopClick(stop);
              }
            }
          }}
        >
          <Popup autoPan={true} keepInView={true} maxWidth={350}>
            {selectedBusStop && selectedBusStop._id === stop._id ? (
              <BusStopPopup
                busStop={stop}
                routes={routesPassingThrough || []}
                jeepneys={nearbyJeepneys || []}
                onClose={() => {
                  if (onCloseBusStop) {
                    onCloseBusStop();
                  }
                }}
                onJeepneyClick={(jeep) => {
                  if (onJeepneyClickFromBusStop) {
                    onJeepneyClickFromBusStop(jeep);
                  }
                }}
              />
            ) : (
              <div onClick={(e) => e.stopPropagation()}>
                <div className="font-bold text-lg mb-1">{stop.name}</div>
                <div className="text-xs text-gray-500 mb-2">Bus Stop</div>
                <div className="text-xs text-gray-500">
                  {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                </div>
              </div>
            )}
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  jeepLocations, 
  busStops = [], 
  selectedLocation, 
  onViewMoreDetails, 
  onBusStopClick, 
  mapType = 'roadmap',
  routesPassingThrough = [],
  nearbyJeepneys = [],
  selectedBusStop = null,
  onJeepneyClickFromBusStop,
  onCloseBusStop
}) => {
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
  
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

  // Map type conversion for Google Maps
  const getGoogleMapsLayerType = () => {
    switch(mapType) {
      case 'satellite': return 's';
      case 'hybrid': return 'y';
      case 'terrain': return 'p';
      default: return 'm'; // roadmap
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <MapContainer 
        center={centerPosition} 
        zoom={15} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapController selectedLocation={selectedLocation} />
        
        {/* Google Maps or OpenStreetMap Layer */}
        {googleMapsKey ? (
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url={`https://mt1.google.com/vt/lyrs=${getGoogleMapsLayerType()}&x={x}&y={y}&z={z}&key=${googleMapsKey}`}
            maxZoom={20}
          />
        ) : (
          <TileLayer
            attribution='&copy; Google Maps'
            url={`https://mt1.google.com/vt/lyrs=${getGoogleMapsLayerType()}&x={x}&y={y}&z={z}`}
            maxZoom={20}
          />
        )}
        
        {/* Bus Stops as Circles - only visible when zoomed in */}
        <BusStopsLayer 
          busStops={busStops} 
          onBusStopClick={onBusStopClick}
          selectedBusStop={selectedBusStop}
          routesPassingThrough={routesPassingThrough}
          nearbyJeepneys={nearbyJeepneys}
          onJeepneyClickFromBusStop={onJeepneyClickFromBusStop}
          onCloseBusStop={onCloseBusStop}
        />
        
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