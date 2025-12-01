export default function CardBox() {
  return (
    <div className="w-full max-w-md m-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden p-4">
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
            <span className="text-4xl font-bold text-gray-900">15 / 40</span>
          </div>

          {/* Status Text */}
          <p className="text-gray-500 font-medium mt-1 text-sm">
            Status: <span className="text-green-600 font-bold">Low</span>
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="h-8 bg-gray-200 rounded mx-auto w-2/3 mb-4 text-black font-bold text-3xl">
            Passenger Load:
          </div>
          <div className="flex justify-center items-end gap-4">
            <div className="h-16 w-40 bg-gray-200 rounded text-black font-bold text-4xl">
              15/40
            </div>
          </div>
          {/* Status Indicator */}
          <div className="text-black">Status: Low</div>
        </div>
        <div className="text-center">
          <div className="h-7 bg-gray-200 rounded mx-auto w-3/4 text-black">
            Plate: GWN 550 (PITAMCO)
          </div>
        </div>
        <div className="bg-gray-200/80 rounded-xl p-4 flex justify-between items-end shadow-inner h-24">
          <div className="w-14 h-16 bg-gray-300/50 rounded"></div>
          <div className="w-14 h-16 bg-gray-300/50 rounded"></div>
          <div className="w-14 h-16 bg-gray-300/50 rounded"></div>
          <div className="w-14 h-16 bg-gray-300/50 rounded"></div>
        </div>
        <div className="flex gap-4 pt-2">
          <div className="flex-1 bg-blue-600 h-14 rounded-lg shadow-md items-center justify-center flex font-bold">
            Follow Vehicle
          </div>
          <div className="flex-1 bg-blue-600 h-14 rounded-lg shadow-inner items-center justify-center flex font-bold">
            Back
          </div>
        </div>
      </div>
      <div className="h-3 bg-blue-700 w-full"></div>
    </div>
  );
}
