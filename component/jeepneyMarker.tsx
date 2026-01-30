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
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${isNearbyBusStop ? `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
        
        <div style="
          position: relative;
          width: 48px;
          height: 48px;
          background: ${isNearbyBusStop ? '#3b82f6' : markerColor};
          border-radius: 12px;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        "
        onmouseover="this.style.transform='scale(1.1)'"
        onmouseout="this.style.transform='scale(1)'"
        >
          <div style="
            font-size: 18px;
            line-height: 1;
            margin-bottom: 2px;
          ">🚍</div>
          ${showRouteNumber ? `
            <div style="
              font-size: 10px;
              font-weight: bold;
              color: white;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
              line-height: 1;
            ">${displayRouteNumber}</div>
          ` : ''}
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
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
