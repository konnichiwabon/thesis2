// component/jeepStopPopup.tsx
import React from 'react';
import { X, MapPin, Bus, Navigation } from 'lucide-react';
import ETABadge from './etaBadge';
import { getJeepneyColor } from '@/lib/jeepneyColors';

interface Route {
  _id: string;
  name: string;
  color: string;
  distance: number;
  duration: number;
}

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
  /** Pre-computed distance from this jeepney to the bus stop (metres). */
  distance?: number;
}

interface JeepStopPopupProps {
  jeepStop: {
    name: string;
    lat: number;
    lng: number;
  };
  routes: Route[];
  jeepneys: Jeepney[];
  onClose: () => void;
  onJeepneyClick: (jeep: Jeepney) => void;
  onShowRoute?: (routeName: string) => void;
}

export default function JeepStopPopup({ 
  jeepStop, 
  routes, 
  jeepneys, 
  onClose, 
  onJeepneyClick,
  onShowRoute 
}: JeepStopPopupProps) {
  
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

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{jeepStop.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {jeepStop.lat.toFixed(4)}, {jeepStop.lng.toFixed(4)}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Routes Section */}
      {routes.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Routes · {routes.length}
          </h3>
          <div className="space-y-2">
            {routes.map((route) => (
              <div
                key={route._id}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="px-2.5 py-1 rounded-lg text-white font-bold text-xs"
                    style={{ backgroundColor: route.color }}
                  >
                    {route.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>{(route.distance / 1000).toFixed(1)} km</span>
                    <span className="text-gray-300">·</span>
                    <span>{Math.round(route.duration / 60)} min</span>
                  </div>
                </div>
                {onShowRoute && (
                  <button
                    onClick={() => onShowRoute(route.name)}
                    className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    View
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {routes.length > 0 && jeepneys.length > 0 && (
        <div className="border-t border-gray-100 mb-5" />
      )}

      {/* Jeepneys Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bus className="w-3.5 h-3.5" />
          Nearby Jeepneys · {jeepneys.length}
        </h3>
        {jeepneys.length > 0 ? (
          <div className="space-y-2.5">
            {jeepneys.map((jeep) => {
              const colorTheme = getColorTheme(jeep.passengerCount, jeep.maxLoad);
              const status = getStatus(jeep.passengerCount, jeep.maxLoad);
              const loadPercentage = jeep.maxLoad && jeep.maxLoad > 0
                ? Math.min((jeep.passengerCount / jeep.maxLoad) * 100, 100)
                : 0;
              const jeepColor = getJeepneyColor(jeep.jeepneyId, jeep.color);
              const displayRoute = jeep.routeNumber || jeep.jeepneyId;
              
              const theme = {
                green: { text: 'text-green-600', bar: 'bg-green-400', light: 'bg-green-50' },
                red: { text: 'text-red-600', bar: 'bg-red-400', light: 'bg-red-50' },
                orange: { text: 'text-orange-600', bar: 'bg-orange-400', light: 'bg-orange-50' },
                purple: { text: 'text-purple-600', bar: 'bg-purple-400', light: 'bg-purple-50' },
              }[colorTheme];

              return (
                <div
                  key={jeep.jeepneyId}
                  className="group border border-gray-100 rounded-xl p-3.5 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer bg-white"
                  onClick={() => onJeepneyClick(jeep)}
                >
                  {/* Top row: unique color ID badge + plate + status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-2.5 py-1 rounded-lg text-white font-black text-sm tracking-wide"
                        style={{ backgroundColor: jeepColor }}
                      >
                        {displayRoute}
                      </span>
                      <span className="text-gray-700 font-semibold text-sm">
                        {jeep.plateNumber}
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${theme.text} ${theme.light} px-2 py-0.5 rounded-full`}>
                      {status}
                    </span>
                  </div>

                  {/* Load bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2.5 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ease-out ${theme.bar}`} 
                      style={{ width: `${loadPercentage}%` }}
                    />
                  </div>

                  {/* Bottom row: load count + ETA */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {jeep.passengerCount}/{jeep.maxLoad ?? "—"} passengers
                    </span>
                    {jeep.distance != null && (
                      <ETABadge distanceMeters={jeep.distance} size="sm" showDistance />
                    )}
                  </div>

                  {/* Tap hint */}
                  <div className="mt-2.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-blue-500 text-xs font-medium">
                      Tap for details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No jeepneys nearby</p>
            <p className="text-xs text-gray-300 mt-1">Within 1 km radius</p>
          </div>
        )}
      </div>
    </div>
  );
}
