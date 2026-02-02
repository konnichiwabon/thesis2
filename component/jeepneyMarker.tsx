import React, { useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import PopupCard from './popupcard';

interface JeepneyMarkerProps {
  jeep: {
    id: string;
    plateNumber: string;
    passengerCount: number;
    position: [number, number];
    colorTheme: 'green' | 'red' | 'orange' | 'purple';
    status: string;
    routeNumber?: string;
    color?: string;
  };
  nearbyJeepneys?: any[];
  onClick?: (jeep: any) => void;
  showRouteNumber?: boolean;
}

export default function JeepneyMarker({ 
  jeep, 
  nearbyJeepneys = [],
  onClick,
  showRouteNumber = true
}: JeepneyMarkerProps) {
  const markerRef = useRef<any>(null);
  const isNearbyBusStop = nearbyJeepneys?.some(nj => nj.jeepneyId === jeep.id);
  
  // Get color based on load status
  const getStatusColor = () => {
    switch(jeep.colorTheme) {
      case 'green': return '#10b981';
      case 'orange': return '#f59e0b';
      case 'red': return '#ef4444';
      case 'purple': return '#a855f7';
      default: return '#6b7280';
    }
  };
  
  // Use custom color if provided, otherwise use status-based color
  const markerColor = jeep.color || getStatusColor();

  // Use custom route number if provided, otherwise extract from ID
  const displayRouteNumber = jeep.routeNumber || jeep.id.replace(/[^0-9]/g, '') || jeep.id.slice(-2);
  
  const customIcon = new L.DivIcon({
    className: 'custom-jeepney-marker',
    html: `
      <div style="
        position: relative;
        width: 50px;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isNearbyBusStop ? `
          <div style="
            position: absolute;
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
            width: 70px;
            height: 70px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
        
        <svg width="50" height="70" viewBox="0 0 50 70" style="
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
          cursor: pointer;
          transition: transform 0.2s;
        "
        onmouseover="this.style.transform='scale(1.1)'"
        onmouseout="this.style.transform='scale(1)'"
        >
          <!-- Pin shape -->
          <defs>
            <clipPath id="pin-clip-${jeep.id}">
              <circle cx="25" cy="25" r="23"/>
            </clipPath>
          </defs>
          
          <!-- Pin body (teardrop shape) -->
          <path d="M 25 1 
                   C 11.7 1, 1 11.7, 1 25 
                   C 1 38.3, 11.7 49, 25 49 
                   C 38.3 49, 49 38.3, 49 25 
                   C 49 11.7, 38.3 1, 25 1 Z" 
                fill="${isNearbyBusStop ? '#3b82f6' : markerColor}" 
                stroke="white" 
                stroke-width="3"/>
          
          <!-- Pin point -->
          <path d="M 25 49 L 17 62 L 25 69 L 33 62 Z" 
                fill="${isNearbyBusStop ? '#3b82f6' : markerColor}" 
                stroke="white" 
                stroke-width="2"/>
          
          <!-- Inner circle (white background for content) -->
          <circle cx="25" cy="25" r="18" fill="white" opacity="0.95"/>
          
          <!-- Jeepney emoji/icon -->
          <text x="25" y="23" 
                font-size="20" 
                text-anchor="middle" 
                dominant-baseline="middle">🚍</text>
          
          ${showRouteNumber ? `
            <!-- Route number -->
            <text x="25" y="35" 
                  font-size="9" 
                  font-weight="bold" 
                  text-anchor="middle" 
                  fill="#374151" 
                  dominant-baseline="middle">${displayRouteNumber}</text>
          ` : ''}
        </svg>
      </div>
    `,
    iconSize: [50, 70],
    iconAnchor: [25, 70],
  });
  
  return (
    <Marker 
      ref={markerRef}
      position={jeep.position}
      icon={customIcon}
    >
      <Popup autoPan={true} keepInView={true}>
        <PopupCard 
          route={jeep.id}
          plateNumber={jeep.plateNumber}
          currentLoad={jeep.passengerCount}
          maxLoad={40}
          status={jeep.status}
          colorTheme={jeep.colorTheme}
          onClose={() => {
            markerRef.current?.closePopup();
          }}
          onViewMoreDetails={() => {
            markerRef.current?.closePopup();
            onClick?.(jeep);
          }}
        />
      </Popup>
    </Marker>
  );
}
