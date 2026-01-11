
//This coomponent is for defining the popup card that appears when a bus marker is clicked on the /component/map.


// component/PopupCard.tsx
import React, { useState } from 'react';
import CardBox from './cardBox';
import { useMap } from 'react-leaflet';

// Define the data this card needs
interface PopupCardProps {
  route: string;      // e.g. "62C"
  plateNumber: string; // e.g. "ABC 123"
  currentLoad: number;
  maxLoad: number;
  status: string;     // e.g. "Normal"
  colorTheme: 'green' | 'red' | 'orange' | 'purple'; // To handle different status colors
  onClose: () => void; // Important: A way to x the popup
  onViewMoreDetails?: () => void;
}

export default function PopupCard({ 
  route, plateNumber, currentLoad, maxLoad, status, colorTheme, onClose, onViewMoreDetails
}: PopupCardProps) {
  const map = useMap();
  
  // Helper for colors based on theme
  const theme = {
    green: { bg: 'bg-green-600', text: 'text-green-600', bar: 'bg-green-500' },
    red: { bg: 'bg-red-600', text: 'text-red-600', bar: 'bg-red-500' },
    orange: { bg: 'bg-yellow-600', text: 'text-yellow-600', bar: 'bg-yellow-500' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600', bar: 'bg-purple-500' },
  }[colorTheme];

  const handleViewMore = () => {
    if (onViewMoreDetails) {
      onViewMoreDetails();
    }
    map.closePopup();
  };

  const loadPercentage = Math.min((currentLoad / maxLoad) * 100, 100);

  return (
    <div>
      {/* Header: Route and Plate */}
      <div className="flex items-center gap-3 mb-3">
        <span className={`px-3 py-1 rounded-lg text-white font-bold text-lg ${theme.bg}`}>
          {route}
        </span>
        <span className="text-gray-800 font-bold text-xl">
          {plateNumber}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-300/30 rounded-full h-3 mb-3 border border-gray-300 overflow-hidden">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ease-out ${theme.bar}`} 
          style={{ width: `${loadPercentage}%` }}
        ></div>
      </div>

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