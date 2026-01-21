"use client"

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  id: number;
  route: string;
  plateNumber: string;
  currentLoad: number;
  maxLoad: number;
  status: string;
  colorTheme: 'green' | 'red' | 'orange' | 'purple';
}

interface CarouselProps {
  items: CarouselItem[];
  onItemClick?: (item: CarouselItem) => void;
}

const Carousel: React.FC<CarouselProps> = ({ items, onItemClick }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 220; // Width of one card plus gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  const getLoadPercentage = (item: CarouselItem) => {
    return Math.round((item.currentLoad / item.maxLoad) * 100);
  };

  const colorClasses = {
    green: { bg: 'bg-green-500', text: 'text-green-600', badge: 'bg-green-500' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', badge: 'bg-orange-500' },
    red: { bg: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-500' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', badge: 'bg-purple-500' }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <button
        onClick={() => scroll('left')}
        className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors flex-shrink-0"
        aria-label="Scroll left"
      >
        <ChevronLeft size={24} />
      </button>

      <div 
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-3 min-w-[200px] border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`${colorClasses[item.colorTheme].badge} text-white font-bold text-sm px-3 py-1 rounded-full`}>
                {item.route}
              </div>
              <span className="text-sm font-medium text-gray-700">{item.plateNumber}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all ${colorClasses[item.colorTheme].bg}`}
                style={{ width: `${getLoadPercentage(item)}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Load: {item.currentLoad}/{item.maxLoad}</span>
              <span className={`font-semibold ${colorClasses[item.colorTheme].text}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors flex-shrink-0"
        aria-label="Scroll right"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default Carousel;
