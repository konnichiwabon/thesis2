import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import PopupCard from './popupcard';

interface JeepneyMarkerPopupProps {
  jeep: {
    id: string;
    plateNumber: string;
    passengerCount: number;
    position: [number, number];
    colorTheme: 'green' | 'red' | 'orange' | 'purple';
    status: string;
  };
  isHighlighted?: boolean;
  nearbyJeepneys?: any[];
  onViewMoreDetails: (jeep: any) => void;
}

export default function JeepneyMarkerPopup({ 
  jeep, 
  isHighlighted = false, 
  nearbyJeepneys = [],
  onViewMoreDetails 
}: JeepneyMarkerPopupProps) {
  // Check if this jeep is in the nearby jeepneys list
  const isNearbyBusStop = nearbyJeepneys?.some(nj => nj.jeepneyId === jeep.id);
  
  // Create custom icon based on whether jeep is near selected bus stop
  const customIcon = new L.DivIcon({
    className: 'custom-jeep-marker',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
      ">
        ${isNearbyBusStop ? `
          <div style="
            position: absolute;
            top: -5px;
            left: -5px;
            width: 42px;
            height: 42px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        ` : ''}
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 32px;
          height: 32px;
          background: ${isNearbyBusStop ? '#3b82f6' : '#6b7280'};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        ">
          🚍
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
  
  return (
    <Marker 
      position={jeep.position}
      icon={customIcon}
      eventHandlers={{
        click: () => onViewMoreDetails(jeep)
      }}
    >
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
  );
}
