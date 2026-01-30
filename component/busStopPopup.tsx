// component/busStopPopup.tsx
import React from 'react';

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
  location?: {
    lat: number;
    lng: number;
  };
}

interface BusStopPopupProps {
  busStop: {
    name: string;
    lat: number;
    lng: number;
  };
  routes: Route[];
  jeepneys: Jeepney[];
  onClose: () => void;
  onJeepneyClick: (jeep: Jeepney) => void;
}

export default function BusStopPopup({ 
  busStop, 
  routes, 
  jeepneys, 
  onClose, 
  onJeepneyClick 
}: BusStopPopupProps) {
  
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

  return (
    <div className="w-80 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{busStop.name}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Bus Stop
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none ml-2"
        >
          ×
        </button>
      </div>

      {/* Routes Section */}
      {routes.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
            Routes ({routes.length})
          </h3>
          <div className="space-y-2">
            {routes.map((route) => (
              <div key={route._id} className="flex items-center gap-3">
                <span 
                  className="px-3 py-1 rounded-lg text-white font-bold text-sm"
                  style={{ backgroundColor: route.color }}
                >
                  {route.name}
                </span>
                <div className="flex gap-3 text-xs text-gray-600">
                  <span>{(route.distance / 1000).toFixed(1)} km</span>
                  <span>•</span>
                  <span>{Math.round(route.duration / 60)} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jeepneys Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          Active Jeepneys ({jeepneys.length})
        </h3>
        {jeepneys.length > 0 ? (
          <div className="space-y-3">
            {jeepneys.map((jeep) => {
              const colorTheme = getColorTheme(jeep.passengerCount);
              const status = getStatus(jeep.passengerCount);
              const loadPercentage = Math.min((jeep.passengerCount / 40) * 100, 100);
              
              const theme = {
                green: { bg: 'bg-green-600', text: 'text-green-600', bar: 'bg-green-500' },
                red: { bg: 'bg-red-600', text: 'text-red-600', bar: 'bg-red-500' },
                orange: { bg: 'bg-yellow-600', text: 'text-yellow-600', bar: 'bg-yellow-500' },
                purple: { bg: 'bg-purple-600', text: 'text-purple-600', bar: 'bg-purple-500' },
              }[colorTheme];

              return (
                <div
                  key={jeep.jeepneyId}
                  className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer bg-white"
                  onClick={() => onJeepneyClick(jeep)}
                >
                  {/* Header: Route and Plate */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-lg text-white font-bold text-sm ${theme.bg}`}>
                      {jeep.jeepneyId}
                    </span>
                    <span className="text-gray-800 font-bold text-base">
                      {jeep.plateNumber}
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
                      Load: {jeep.passengerCount}/40
                    </span>
                    <span className={`${theme.text}`}>
                      {status}
                    </span>
                  </div>

                  <div className="flex justify-center items-center mt-3">
                    <span className="text-blue-500 text-sm hover:underline">
                      View more details
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-3">No jeepneys</p>
        )}
      </div>
    </div>
  );
}
