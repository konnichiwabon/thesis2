"use client";

import { useState } from "react";

interface CardBoxProps {
  onClose?: () => void;
  route?: string;
  plateNumber?: string;
  currentLoad?: number;
  maxLoad?: number;
  onLoadChange?: (load: number) => void;
}

export default function CardBox({ onClose, route = "62C", plateNumber = "ABC 123", currentLoad = 0, maxLoad = 40, onLoadChange }: CardBoxProps = {}) {
  const loadPercentage = (currentLoad / maxLoad) * 100;

  const handleIncrement = () => {
    if (onLoadChange) {
      onLoadChange(currentLoad + 1);
    }
  };

  const handleDecrement = () => {
    if (onLoadChange) {
      onLoadChange(Math.max(0, currentLoad - 1));
    }
  };

  const status = () => {
    if (currentLoad <= 13)
      return { text: "Low", color: "text-green-600", barColor: "bg-green-500" };
    else if (currentLoad <= 26) {
      return { text: "Moderate", color: "text-yellow-600", barColor: "bg-yellow-500" };
    } else if (currentLoad <= 40) {
      return { text: "High", color: "text-red-600", barColor: "bg-red-500" };
    } else {
      return { text: "Overloaded", color: "text-purple-600", barColor: "bg-purple-500" };
    }
  };

  return (
    <div className="relative w-full max-w-md m-12 bg-white   backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        onClick={handleIncrement}
        className="text-black"
      >
        Click me{" "}
      </button>
      <button
        onClick={handleDecrement}
        className="text-black"
      >
        Negative{" "}
      </button>
      <div className="bg-blue-700 p-4 flex items-center gap-3 rounded-md ">
        <div className="flex bg-red-600 h-12 w-16 rounded-md shadow-sm items-center justify-center font-bold">
          {route}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex h-5 rounded font-bold items-center justify-center">
            PITOS TALAMABAN CARBON Via Echavez
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

          {/* Progress Bar Track (Gray Background) */}
          <div className="w-full h-3 bg-gray-300/30 rounded-full overflow-hidden border border-gray-300">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${status().barColor}`}
              style={{ width: `${loadPercentage}%` }}
            ></div>
          </div>

          {/* Number Count */}
          <div className="mt-4 text-center">
            <span className="text-4xl font-bold text-gray-900">
              {` ${currentLoad} / ${maxLoad}`}
            </span>
          </div>

          {/* Status Text */}
          <p className="text-gray-500 font-medium mt-1 text-sm">
            Status:{" "}
            <span className={`${status().color} font-bold`}>
              {status().text}
            </span>
          </p>

          <div className="h-0.5 w-[90%] bg-gray-200 ml-0 rounded mt-3 "> </div>
          <div className="pt-6 items-center justify-center flex flex-col gap-">
            <div className="text-black font-bold">Vehicle Plate </div>
            <div className="text-black">{plateNumber}</div>
            <div className="text-black ">(PITAMCO) </div>
            <div className="text-black">Vehicle Plate </div>
            <div className="text-black">Vehicle Plate </div>
          </div>

          {/* Vehicle Plate */}
        </div>

        <div className="text-center"></div>

        <div className="flex gap-4 pt-2">
          <div className="flex-1 bg-blue-600 h-14 rounded-lg shadow-md items-center justify-center flex font-bold">
            Follow Vehicle
          </div>
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
