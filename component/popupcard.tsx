// component/PopupCard.tsx
import React from 'react';

// Define the data this card needs
interface PopupCardProps {
  route: string;      // e.g. "62C"
  plateNumber: string; // e.g. "ABC 123"
  currentLoad: number;
  maxLoad: number;
  status: string;     // e.g. "Normal"
  colorTheme: 'green' | 'red' | 'orange'; // To handle different status colors
  onClose: () => void; // Important: A way to close the popup
}

export default function PopupCard({ 
  route, plateNumber, currentLoad, maxLoad, status, colorTheme, onClose 
}: PopupCardProps) {
  
  // Helper for colors based on theme
  const theme = {
    green: { bg: 'bg-emerald-600', text: 'text-emerald-600', bar: 'bg-emerald-600' },
    red: { bg: 'bg-red-600', text: 'text-red-600', bar: 'bg-red-600' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', bar: 'bg-orange-500' },
  }[colorTheme];

  const loadPercentage = (currentLoad / maxLoad) * 100;

  return (
    // The container is relative so we can put a close button inside
    <div className="relative bg-black/95 backdrop-blur-md shadow-2xl rounded-2xl p-4 w-[280px] border border-gray-100 animate-in fade-in zoom-in duration-200">
      
      
      

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
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div 
          className={`h-3 rounded-full ${theme.bar}`} 
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
    </div>
  );
}