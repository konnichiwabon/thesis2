"use client"

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ETABadge from './etaBadge';
import RouteBadge from './routeBadge';
import LoadBar from './loadBar';

interface CarouselItem {
  id: number;
  route: string;
  jeepneyId?: string;
  routeNumber?: string;
  color?: string;
  plateNumber: string;
  currentLoad: number;
  maxLoad: number;
  status: string;
  colorTheme: 'green' | 'red' | 'orange' | 'purple';
  distance?: number;
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

  const colorClasses = {
    green:  { text: 'text-green-600' },
    orange: { text: 'text-orange-600' },
    red:    { text: 'text-red-600' },
    purple: { text: 'text-purple-600' },
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
            className="bg-white rounded-lg shadow-md p-4 h-[210px] flex-shrink-0 border border-gray-200 flex flex-col justify-center items-center snap-center w-full md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <RouteBadge label={item.route} jeepneyId={item.jeepneyId || ''} color={item.color} size="lg" />
              <span className="text-2xl font-semibold text-gray-900">{item.plateNumber}</span>
            </div>
            
            <LoadBar currentLoad={item.currentLoad} maxLoad={item.maxLoad} className="mb-4" />
            
            <div className="flex justify-between items-center text-lg w-full px-2">
              <span className="text-gray-900 font-bold">Load: {item.currentLoad}/{item.maxLoad}</span>
              <span className={`font-bold ${colorClasses[item.colorTheme].text}`}>
                {item.status}
              </span>
            </div>
            {item.distance != null && (
              <div className="mt-2">
                <ETABadge distanceMeters={item.distance} size="lg" showDistance />
              </div>
            )}
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
