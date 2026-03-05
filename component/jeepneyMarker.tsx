import React, { useRef, useEffect, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import PopupCard from './popupcard';
import { getJeepneyColor } from '@/lib/jeepneyColors';
import { deriveDisplayRoute } from '@/lib/loadStatus';
import { useAnimateMarker } from '@/lib/useAnimatedPosition';

interface JeepneyMarkerProps {
  jeep: {
    id: string;
    plateNumber: string;
    passengerCount: number;
    maxLoad?: number;
    position: [number, number]; // [lat, lng] — comes from Convex via page.tsx
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

  // Capture the position at mount time and NEVER change it.
  // Passing a stable value to <Marker position> means react-leaflet will never
  // call marker.setLatLng() on subsequent renders — the animation hook owns all movement.
  const mountPositionRef = useRef<[number, number]>(jeep.position);

  // Drive ALL position updates through the smooth animation hook.
  // Jumps >= 1 km snap instantly; smaller moves interpolate over 2 s.
  useAnimateMarker(markerRef, jeep.position);

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
  
  // Use jeepney's stored color, or derive a unique deterministic one from its ID.
  // getStatusColor() is kept as fallback for status-based coloring via the load bar instead.
  const markerColor = getJeepneyColor(jeep.id, jeep.color);

  // Use custom route number if provided, otherwise extract from ID
  const displayRouteNumber = deriveDisplayRoute(jeep.id, jeep.routeNumber);
  
  // Font size scales down for longer route numbers to always fit inside the pin
  const routeFontSize = displayRouteNumber.length <= 3 ? 14 : displayRouteNumber.length <= 5 ? 12 : 10;

  // Memoize the icon so it is only recreated when appearance-related props change,
  // NOT on position/passenger updates — recreating the icon causes react-leaflet to
  // rebuild the DOM element and close any open popups.
  const customIcon = useMemo(() => new L.DivIcon({
    className: 'custom-jeepney-marker',
    html: `
      <div style="position:relative;width:54px;height:82px;display:flex;align-items:center;justify-content:center;">
        ${isNearbyBusStop ? `
          <div style="
            position:absolute;
            left:-13px;
            top:-10px;
            width:80px;height:80px;
            background:${markerColor}40;
            border-radius:50%;
            border: 2px solid ${markerColor}99;
            animation:pulse 2s infinite;
            pointer-events:none;
          "></div>
        ` : ''}

        <svg width="54" height="82" viewBox="0 0 54 82" xmlns="http://www.w3.org/2000/svg"
             style="filter:drop-shadow(0 4px 10px rgba(0,0,0,0.28));cursor:pointer;transition:transform 0.2s;"
             onmouseover="this.style.transform='scale(1.1)'"
             onmouseout="this.style.transform='scale(1)'">

          <!-- Rounded rectangle body -->
          <rect x="2" y="2" width="50" height="58" rx="13" ry="13"
                fill="${markerColor}"
                stroke="white" stroke-width="2.5"/>

          <!-- Triangle pointer -->
          <path d="M 14 58 L 27 80 L 40 58 Z"
                fill="${markerColor}"
                stroke="white" stroke-width="2" stroke-linejoin="round"/>
          <!-- Cover rect-triangle seam -->
          <rect x="14" y="55" width="26" height="5"
                fill="${markerColor}"/>

          <!-- White circle for emoji -->
          <circle cx="27" cy="23" r="16" fill="white" opacity="0.93"/>
          <!-- Jeepney emoji -->
          <text x="27" y="23" font-size="18" text-anchor="middle" dominant-baseline="middle">🚍</text>

          ${showRouteNumber ? `
            <!-- Route number: large white bold text on colored background -->
            <text x="27" y="46"
                  font-size="${routeFontSize}"
                  font-weight="900"
                  font-family="'Arial Black', Arial, sans-serif"
                  text-anchor="middle"
                  fill="white"
                  dominant-baseline="middle">${displayRouteNumber}</text>
          ` : ''}
        </svg>
      </div>
    `,
    iconSize: [54, 82],
    iconAnchor: [27, 82],
  }), [jeep.id, markerColor, isNearbyBusStop, displayRouteNumber, showRouteNumber, routeFontSize]);
  
  return (
    <Marker 
      ref={markerRef}
      position={mountPositionRef.current}
      icon={customIcon}
    >
      <Popup autoPan={true} keepInView={true}>
        <PopupCard 
          route={displayRouteNumber}
          plateNumber={jeep.plateNumber}
          currentLoad={jeep.passengerCount}
          maxLoad={jeep.maxLoad ?? 40}
          status={jeep.status}
          colorTheme={jeep.colorTheme}
          markerColor={markerColor}
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
