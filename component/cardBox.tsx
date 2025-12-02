"use client";

import { useState } from "react";

export default function CardBox() {
  const [currentPassengers, setCurrentPassengers] = useState(0);

  const status = () => {
    if (currentPassengers <= 13)
      return { text: "Low", color: "text-green-600" };
    else if (currentPassengers <= 26) {
      return { text: "Moderate", color: "text-yellow-600" };
    } else if (currentPassengers <= 40) {
      return { text: "High", color: "text-red-600" };
    } else {
      return { text: "Overloaded", color: "text-purple-600" };
    }
  };

  return (
    <div className="w-full max-w-md m-12 bg-white   backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden p-4">
      <button
        onClick={() => setCurrentPassengers(currentPassengers + 1)}
        className="text-black"
      >
        Click me{" "}
      </button>
      <button
        onClick={() => setCurrentPassengers(Math.max(0, currentPassengers - 1))}
        className="text-black"
      >
        Negative{" "}
      </button>
      <div className="bg-blue-700 p-4 flex items-center gap-3 rounded-md ">
        <div className="flex bg-red-600 h-12 w-16 rounded-md shadow-sm items-center justify-center font-bold">
          62C
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
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            {/* Progress Bar Fill (Green) 
       - style={{ width: "37.5%" }} sets the fill amount.
       - 15 divided by 40 is 0.375, so 37.5% 
    */}
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: "37.5%" }}
            ></div>
          </div>

          {/* Number Count */}
          <div className="mt-4 text-center">
            <span className="text-4xl font-bold text-gray-900">
              {` ${currentPassengers} / 40`}
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
            <div className="text-black">GWN 550 </div>
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
          <div className="flex-1 bg-white text-black h-14 rounded-lg shadow-inner items-center justify-center flex font-bold">
            Back
          </div>
        </div>
      </div>
    </div>
  );
}
