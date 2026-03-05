"use client";
import { getJeepneyColor } from '@/lib/jeepneyColors';
import { getColorTheme, getStatus } from '@/lib/loadStatus';
import LoadBar from './loadBar';

interface CardBoxProps {
  onClose?: () => void;
  route?: string;
  name?: string;
  routeNumber?: string;
  jeepneyId?: string;
  color?: string;
  plateNumber?: string;
  operator?: string;
  driverName?: string;
  currentLoad?: number;
  maxLoad?: number;
  onShowRoute?: () => void;
}

export default function CardBox({ onClose, route = "62C", name, routeNumber, jeepneyId, color, plateNumber = "ABC 123", operator, driverName, currentLoad = 0, maxLoad = 0, onShowRoute }: CardBoxProps = {}) {
  const loadPercentage = maxLoad > 0 ? (currentLoad / maxLoad) * 100 : 0;
  const markerColor = jeepneyId ? getJeepneyColor(jeepneyId, color) : '#1d4ed8';
  const statusText = getStatus(currentLoad, maxLoad);
  const TEXT_COLORS: Record<string, string> = { green: 'text-green-600', orange: 'text-orange-600', red: 'text-red-600', purple: 'text-purple-600' };

  return (
    <div className="relative w-80 mt-4 bg-white backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="p-4 flex items-center gap-3 rounded-md" style={{ backgroundColor: markerColor }}>
        <div className="flex h-12 w-16 rounded-md shadow-sm items-center justify-center font-bold text-white" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
          {routeNumber || route}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex h-5 rounded font-bold items-center justify-center text-white">
            {name || routeNumber || route}
          </div>
        </div>
      </div>
      <div className="p-5 space-y-6">
        {/* Progress Bar */}
        <div className="p-6 flex flex-col items-center w-full bg-white">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Passenger Load
          </h3>

          <LoadBar currentLoad={currentLoad} maxLoad={maxLoad} className="mb-0" />

          {/* Number Count */}
          <div className="mt-4 text-center">
            <span className="text-4xl font-bold text-gray-900">
              {` ${currentLoad} / ${maxLoad}`}
            </span>
          </div>

          <p className="text-gray-500 font-medium mt-1 text-sm">
            Status:{" "}
            <span className={`${TEXT_COLORS[getColorTheme(currentLoad, maxLoad)]} font-bold`}>
              {statusText}
            </span>
          </p>

          <div className="h-0.5 w-[90%] bg-gray-200 ml-0 rounded mt-3 "> </div>
          <div className="pt-4 w-full flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Vehicle Plate</span>
              <span className="text-black font-semibold">{plateNumber}</span>
            </div>
            {operator && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Operator</span>
                <span className="text-black font-semibold">{operator}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Driver</span>
              <span className="text-black font-semibold">{driverName || "—"}</span>
            </div>
          </div>

          {/* Vehicle Plate */}
        </div>

        <div className="text-center"></div>

        <div className="flex gap-4 pt-2">
          <button
            onClick={onShowRoute}
            className="flex-1 h-14 rounded-lg shadow-md items-center justify-center flex font-bold transition-all cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
          >
            🗺️ Show Route
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-white text-black h-14 rounded-lg shadow-inner items-center justify-center flex font-bold hover:bg-gray-100 cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
