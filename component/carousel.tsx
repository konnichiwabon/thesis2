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
      const cardWidth = scrollContainerRef.current.scrollWidth / items.length;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
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
    green: { bg: 'bg-green-600', text: 'text-green-600', badge: 'bg-green-600' },
    orange: { bg: 'bg-orange-600', text: 'text-orange-600', badge: 'bg-orange-600' },
    red: { bg: 'bg-red-600', text: 'text-red-600', badge: 'bg-red-600' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600', badge: 'bg-purple-600x' }
  };

  return (
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
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className="bg-white rounded-lg shadow-md p-4 h-[180px] flex-shrink-0 border border-gray-200 flex flex-col justify-center items-center snap-center w-full md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className={`${colorClasses[item.colorTheme].badge} text-white font-bold text-2xl px-4 py-2 rounded-lg`}>
                {item.route}
              </div>
              <span className="text-2xl font-semibold text-gray-900">{item.plateNumber}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full transition-all ${colorClasses[item.colorTheme].bg}`}
                style={{ width: `${getLoadPercentage(item)}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-lg w-full px-2">
              <span className="text-gray-900 font-bold">Load: {item.currentLoad}/{item.maxLoad}</span>
              <span className={`font-bold ${colorClasses[item.colorTheme].text}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors flex-shrink-0 hidden md:block"
        aria-label="Scroll right"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default Carousel;
