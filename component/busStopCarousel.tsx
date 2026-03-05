"use client"

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ETABadge from './etaBadge';
import { getJeepneyColor } from '@/lib/jeepneyColors';
import { getColorTheme, getStatus, deriveDisplayRoute } from '@/lib/loadStatus';
import LoadBar from './loadBar';

interface Jeepney {
  jeepneyId: string;
  plateNumber: string;
  passengerCount: number;
  maxLoad?: number;
  color?: string;
  routeNumber?: string;
  location?: {
    lat: number;
    lng: number;
  };
  distance?: number;
}

interface BusStopCarouselProps {
  busStopName: string;
  jeepneys: Jeepney[];
  onClose: () => void;
  onJeepneyClick: (jeep: Jeepney) => void;
  isLoading?: boolean;
}

export default function BusStopCarousel({
  busStopName,
  jeepneys,
  onClose,
  onJeepneyClick,
  isLoading = false,
}: BusStopCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -192 : 192,
        behavior: 'smooth',
      });
    }
  };

  const PILL_CLASSES: Record<string, string> = {
    green:  'bg-emerald-100 text-emerald-700',
    orange: 'bg-amber-100 text-amber-700',
    red:    'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-20">
      {/* Header: bus stop name + count/status */}
      <div className="mb-2 px-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md text-sm font-bold text-gray-800 border border-gray-200">
          🚌 {busStopName}
        </span>
        {isLoading ? (
          <span className="text-xs text-white font-semibold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full animate-pulse">
            Scanning…
          </span>
        ) : (
          <span className="text-xs text-white font-semibold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {jeepneys.length} jeepney{jeepneys.length !== 1 ? 's' : ''} within 1 km
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 w-full px-4">
        {/* Left scroll */}
        <button
          onClick={() => scroll('left')}
          className="p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors shrink-0 hidden md:flex items-center justify-center"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Card row */}
        <div
          ref={scrollContainerRef}
          className="flex flex-nowrap gap-3 overflow-x-auto scroll-smooth flex-1 snap-x snap-mandatory pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            /* Skeleton loading cards */
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/90 rounded-xl shadow-md shrink-0 snap-center w-46 animate-pulse overflow-hidden"
              >
                <div className="h-11 bg-gray-200 w-full" />
                <div className="p-3 space-y-2.5">
                  <div className="h-2 bg-gray-200 rounded-full w-full" />
                  <div className="flex justify-between">
                    <div className="h-3.5 bg-gray-200 rounded w-16" />
                    <div className="h-3.5 bg-gray-200 rounded w-12" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-28 mx-auto" />
                </div>
              </div>
            ))
          ) : jeepneys.length === 0 ? (
            /* Empty state */
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-5 py-3.5 shrink-0 snap-center flex items-center gap-3">
              <span className="text-3xl">🚍</span>
              <div>
                <p className="text-sm font-bold text-gray-700">No jeepneys within 1 km</p>
                <p className="text-xs text-gray-400 mt-0.5">Check back in a few minutes</p>
              </div>
            </div>
          ) : (
            /* Jeepney cards */
            jeepneys.map((jeep) => {
              const jeepColor = getJeepneyColor(jeep.jeepneyId, jeep.color);
              const colorTheme = getColorTheme(jeep.passengerCount, jeep.maxLoad ?? 40);
              const statusLabel = getStatus(jeep.passengerCount, jeep.maxLoad ?? 40);
              const displayRoute = deriveDisplayRoute(jeep.jeepneyId, jeep.routeNumber);

              return (
                <div
                  key={jeep.jeepneyId}
                  onClick={() => onJeepneyClick(jeep)}
                  className="bg-white rounded-xl shadow-md shrink-0 snap-center w-46 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden border border-gray-100"
                >
                  {/* Colored identity strip with route number */}
                  <div
                    className="px-3 py-2.5 flex items-center justify-between gap-2"
                    style={{ backgroundColor: jeepColor }}
                  >
                    <span className="text-white font-black text-lg leading-none tracking-wide drop-shadow-sm">
                      {displayRoute}
                    </span>
                    <span className="text-white/80 text-xs font-semibold bg-black/25 px-2 py-0.5 rounded-full shrink-0 truncate max-w-22.5">
                      {jeep.plateNumber}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-3">
                    <LoadBar
                      currentLoad={jeep.passengerCount}
                      maxLoad={jeep.maxLoad ?? 40}
                      size="sm"
                      className="mb-2"
                    />

                    {/* Load stats */}
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-xs text-gray-500 font-medium">
                        {jeep.passengerCount}/{jeep.maxLoad ?? 40} pax
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${PILL_CLASSES[colorTheme]}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* ETA badge */}
                    {jeep.distance != null && (
                      <ETABadge distanceMeters={jeep.distance} size="sm" showDistance />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right scroll */}
        <button
          onClick={() => scroll('right')}
          className="p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors shrink-0 hidden md:flex items-center justify-center"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
