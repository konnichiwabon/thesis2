"use client"

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { DivIcon } from 'leaflet';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import BusStopPopup from './jeepStopPopup';
import JeepneyMarker from './jeepneyMarker';
import JeepneyMarkerPopup from './jeepneyMarkerPopup';

// Helpers to compute color theme and status from passenger count
function getColorTheme(load: number, maxLoad: number = 40): 'green' | 'red' | 'orange' | 'purple' {
  const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
  if (pct <= 33) return 'green';
  if (pct <= 66) return 'orange';
  if (pct < 100) return 'red';
  return 'purple';
}

function getStatus(load: number, maxLoad: number = 40): string {
  const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
  if (pct <= 33) return 'Low';
  if (pct <= 66) return 'Moderate';
  if (pct < 100) return 'High';
  return 'Overloaded';
}

interface BusStop {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

interface MapComponentProps {
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
    if (map && selectedLocation) {
      map.flyTo([selectedLocation[0], selectedLocation[1]], 17, { duration: 1.5 });
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

  // Calculate size based on zoom level
  const getSize = () => {
    if (zoom >= 18) return 24;
    if (zoom >= 16) return 28;
    if (zoom >= 15) return 32;
    return 36;
  };

  const size = getSize();

  return (
    <>
      {busStops.map((stop) => {
        const markerSize = size + 8;
        const stopIcon = new DivIcon({
          className: 'custom-jeepney-stop-marker',
          html: `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
              transition: transform 0.2s;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            "
            onmouseover="this.style.transform='scale(1.15)'"
            onmouseout="this.style.transform='scale(1)'"
            >
              <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <!-- Background rounded square -->
                <rect x="2" y="2" width="44" height="44" rx="10" ry="10" fill="${stop.color}" stroke="white" stroke-width="2.5"/>
                <!-- Bus body -->
                <rect x="10" y="12" width="28" height="24" rx="4" ry="4" fill="white" opacity="0.95"/>
                <!-- Windshield -->
                <rect x="13" y="14" width="22" height="10" rx="2.5" ry="2.5" fill="${stop.color}" opacity="0.35"/>
                <!-- Windshield divider -->
                <line x1="24" y1="14" x2="24" y2="24" stroke="white" stroke-width="1.5" opacity="0.7"/>
                <!-- Headlights -->
                <circle cx="15" cy="30" r="2.2" fill="${stop.color}" opacity="0.8"/>
                <circle cx="33" cy="30" r="2.2" fill="${stop.color}" opacity="0.8"/>
                <!-- Grille lines -->
                <line x1="20" y1="29" x2="28" y2="29" stroke="${stop.color}" stroke-width="1" opacity="0.4"/>
                <line x1="20" y1="31" x2="28" y2="31" stroke="${stop.color}" stroke-width="1" opacity="0.4"/>
                <!-- Bumper -->
                <rect x="12" y="34" width="24" height="2" rx="1" fill="${stop.color}" opacity="0.3"/>
              </svg>
            </div>
          `,
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2],
        });

        return (
          <Marker
            key={stop._id}
            position={[stop.lat, stop.lng]}
            icon={stopIcon}
            eventHandlers={{
              click: () => {
                if (onBusStopClick) {
                  onBusStopClick(stop);
                }
              }
            }}
          />
        );
      })}
    </>
  );
}

const MapComponent: React.FC<MapComponentProps> = ({ 
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

  // Directly query Convex for real-time jeepney GPS data
  const jeepneysData = useQuery(api.gps.getJeepneysWithLocations);

  // Build marker positions from live Convex data
  const jeepLocations = jeepneysData
    ?.filter((jeep) => jeep.location != null)
    .map((jeep) => ({
      id: jeep.jeepneyId,
      name: jeep.name,
      plateNumber: jeep.plateNumber,
      passengerCount: jeep.passengerCount,
      maxLoad: jeep.maxLoad,
      position: [jeep.location!.lat, jeep.location!.lng] as [number, number],
      location: jeep.location,
      colorTheme: getColorTheme(jeep.passengerCount, jeep.maxLoad),
      status: getStatus(jeep.passengerCount, jeep.maxLoad),
      routeNumber: jeep.routeNumber,
      color: jeep.color,
      operator: jeep.operator,
      driverName: jeep.driverName,
    })) ?? [];

  useEffect(() => {
    // Fix for default markers
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
    
    // Add pulse animation to head
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.5;
          transform: scale(1.2);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
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
        
        {/* Jeepney Markers with Route Numbers */}
        {jeepLocations.map((jeep) => (
          <JeepneyMarker
            key={jeep.id}
            jeep={jeep}
            nearbyJeepneys={nearbyJeepneys}
            onClick={onViewMoreDetails}
            showRouteNumber={true}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;