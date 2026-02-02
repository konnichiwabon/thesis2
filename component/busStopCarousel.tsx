"use client"

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Jeepney {
  jeepneyId: string;
  plateNumber: string;
  passengerCount: number;
  location?: {
    lat: number;
    lng: number;
  };
  distance?: number; // distance in meters
}

interface BusStopCarouselProps {
  busStopName: string;
  jeepneys: Jeepney[];
  onClose: () => void;
  onJeepneyClick: (jeep: Jeepney) => void;
}

export default function BusStopCarousel({ 
  busStopName, 
  jeepneys, 
  onClose, 
  onJeepneyClick 
}: BusStopCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth = 200; // approximate width of each card
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const getColorTheme = (load: number): 'green' | 'red' | 'orange' | 'purple' => {
    if (load <= 13) return "green";
    if (load <= 26) return "orange";
    if (load <= 40) return "red";
    return "purple";
  };

  const getStatus = (load: number): string => {
    if (load <= 13) return "Low";
    if (load <= 26) return "Moderate";
    if (load <= 40) return "High";
    return "Overloaded";
  };

  const formatDistance = (meters?: number): string => {
    if (!meters) return '';
    if (meters < 1000) return `${Math.round(meters)}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const colorClasses = {
    green: { bg: 'bg-green-600', text: 'text-green-600', bar: 'bg-green-500' },
    orange: { bg: 'bg-yellow-600', text: 'text-yellow-600', bar: 'bg-yellow-500' },
    red: { bg: 'bg-red-600', text: 'text-red-600', bar: 'bg-red-500' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600', bar: 'bg-purple-500' }
  };

  if (!jeepneys || jeepneys.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-20">
      <div className="flex items-center gap-3 w-full px-4">
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors flex-shrink-0 hidden md:block"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex flex-nowrap gap-4 overflow-x-auto scrollbar-hide scroll-smooth flex-1 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none'
          }}
        >
            {jeepneys.map((jeep) => {
              const colorTheme = getColorTheme(jeep.passengerCount);
              const status = getStatus(jeep.passengerCount);
              const loadPercentage = Math.min((jeep.passengerCount / 40) * 100, 100);
              const theme = colorClasses[colorTheme];

              return (
                <div
                  key={jeep.jeepneyId}
                  onClick={() => onJeepneyClick(jeep)}
                  className="bg-white rounded-lg shadow-md p-4 h-[180px] flex-shrink-0 border border-gray-200 flex flex-col justify-center items-center snap-center w-full md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className={`${theme.bg} text-white font-bold text-2xl px-4 py-2 rounded-lg`}>
                      {jeep.jeepneyId}
                    </div>
                    <span className="text-2xl font-semibold text-gray-900">{jeep.plateNumber}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full transition-all ${theme.bg}`}
                      style={{ width: `${loadPercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-lg w-full px-2">
                    <span className="text-gray-900 font-bold">Load: {jeep.passengerCount}/{jeep.passengerCount <= 40 ? '40' : jeep.passengerCount}</span>
                    <span className={`font-bold ${theme.text}`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors flex-shrink-0 hidden md:block"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}