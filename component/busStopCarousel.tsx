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

  const getColorTheme = (load: number, maxLoad: number = 40): 'green' | 'red' | 'orange' | 'purple' => {
    const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
    if (pct <= 33) return "green";
    if (pct <= 66) return "orange";
    if (pct < 100) return "red";
    return "purple";
  };

  const getStatus = (load: number, maxLoad: number = 40): string => {
    const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
    if (pct <= 33) return "Low";
    if (pct <= 66) return "Moderate";
    if (pct < 100) return "High";
    return "Overloaded";
  };

  const formatDistance = (meters?: number): string => {
    if (!meters) return '';
    if (meters < 1000) return `${Math.round(meters)}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const colorClasses = {
    green: { bg: 'bg-green-600', text: 'text-green-600', bar: 'bg-green-500' },
    orange: { bg: 'bg-orange-600', text: 'text-orange-600', bar: 'bg-orange-500' },
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
              const colorTheme = getColorTheme(jeep.passengerCount, jeep.maxLoad);
              const status = getStatus(jeep.passengerCount, jeep.maxLoad);
              const loadPercentage = jeep.maxLoad && jeep.maxLoad > 0
                ? Math.min((jeep.passengerCount / jeep.maxLoad) * 100, 100)
                : 0;
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