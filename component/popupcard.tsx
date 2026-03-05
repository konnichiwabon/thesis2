
//This coomponent is for defining the popup card that appears when a bus marker is clicked on the /component/map.


// component/PopupCard.tsx
import React, { useState } from 'react';
import CardBox from './cardBox';
import { useMap } from 'react-leaflet';
import LoadBar from './loadBar';

// Define the data this card needs
interface PopupCardProps {
  route: string;      // e.g. "62C"
  plateNumber: string; // e.g. "ABC 123"
  currentLoad: number;
  maxLoad: number;
  status: string;     // e.g. "Normal"
  colorTheme: 'green' | 'red' | 'orange' | 'purple'; // To handle different status colors
  markerColor?: string; // Unique hex color for the route badge
  onClose: () => void; // Important: A way to x the popup
  onViewMoreDetails?: () => void;
}

export default function PopupCard({ 
  route, plateNumber, currentLoad, maxLoad, status, colorTheme, markerColor, onClose, onViewMoreDetails
}: PopupCardProps) {
  const map = useMap();
  
  // Helper for text color based on load status
  const theme = {
    green:  { text: 'text-green-600' },
    red:    { text: 'text-red-600' },
    orange: { text: 'text-orange-600' },
    purple: { text: 'text-purple-600' },
  }[colorTheme];

  const handleViewMore = () => {
    if (onViewMoreDetails) {
      onViewMoreDetails();
    }
    map.closePopup();
  };

  return (
    <div className="w-56 overflow-hidden">
      {/* Header: Route and Plate */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="px-3 py-1 rounded-lg text-white font-bold text-lg"
          style={markerColor ? { backgroundColor: markerColor } : undefined}
        >
          {route}
        </span>
        <span className="text-gray-800 font-bold text-xl">
          {plateNumber}
        </span>
      </div>

      <LoadBar currentLoad={currentLoad} maxLoad={maxLoad} className="mb-3" />

      {/* Footer: Stats */}
      <div className="flex justify-between items-center text-sm font-bold">
        <span className="text-gray-600">
          Load: {currentLoad}/{maxLoad}
        </span>
        <span className={`${theme.text}`}>
          {status}
        </span>
      </div>

      <div className="flex justify-center items-center mt-4">
        <button onClick={handleViewMore} className="text-blue-400 underline hover:underline cursor-pointer">
          View more details
        </button>
      </div>
    </div>
  );
}