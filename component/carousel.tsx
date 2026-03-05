"use client"

import React, { useRef, useEffect, useCallback } from 'react';
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
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / items.length;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (direction === 'right' && el.scrollLeft >= maxScroll - 4) {
      // Wrap back to start
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
    }
  }, [items.length]);

  // Auto-scroll every 5 seconds, pause on hover
  useEffect(() => {
    if (items.length <= 1) return;

    const start = () => {
      autoScrollRef.current = setInterval(() => scroll('right'), 5000);
    };
    const stop = () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };

    start();
    const el = scrollContainerRef.current;
    el?.addEventListener('mouseenter', stop);
    el?.addEventListener('mouseleave', start);
    el?.addEventListener('touchstart', stop);

    return () => {
      stop();
      el?.removeEventListener('mouseenter', stop);
      el?.removeEventListener('mouseleave', start);
      el?.removeEventListener('touchstart', stop);
    };
  }, [items.length, scroll]);

  if (!items || items.length === 0) return null;

  const colorClasses = {
    green:  { text: 'text-green-600' },
    orange: { text: 'text-orange-600' },
    red:    { text: 'text-red-600' },
    purple: { text: 'text-purple-600' },
  };

  const ChevronBtn = ({ direction }: { direction: 'left' | 'right' }) => (
    <button
      onClick={() => scroll(direction)}
      className="p-2 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors shrink-0 flex items-center justify-center text-gray-700 hover:text-gray-900"
      aria-label={`Scroll ${direction}`}
    >
      {direction === 'left' ? <ChevronLeft size={20} strokeWidth={2.5} /> : <ChevronRight size={20} strokeWidth={2.5} />}
    </button>
  );

  return (
    <div className="flex items-center gap-2 w-full px-4">
      <ChevronBtn direction="left" />

      <div 
        ref={scrollContainerRef}
        className="flex flex-nowrap gap-4 overflow-x-auto scroll-smooth flex-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className="bg-white rounded-lg shadow-md p-4 h-[210px] shrink-0 border border-gray-200 flex flex-col justify-center items-center snap-center w-full md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
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

      <ChevronBtn direction="right" />
    </div>
  );
};

export default Carousel;
