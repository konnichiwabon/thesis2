export default function CardBox() {
  return (
    // Main Div
    <div className="bg-red-500 w-full rounded-xl max-w-md m-10 overflow-hidden">
      {/* Header Div  */}
      <div className="bg-blue-700 p-4 flex items-center gap-3">
        <div className="flex bg-red-800 h-9 w-16 rounded-md shadow-sm items-center justify-center font-bold text-xl ">
          62C
        </div>
        <div className="bg-blue-500 w-lg h-10 rounded-2xl text-center p-2 font-bold ">
          TALAMBAN PITOS CARBON VIA ECHAVEZ
        </div>
      </div>
      {/* Body Div */}
      <div className="bg-amber-500 p-5 space-y-6 ">
        <div className="flex justify-end">
          <div className="flex bg-green-500 h-7 w-24 rounded-xl z-10 shadow-2xl items-center justify-center">
            Moderate
          </div>
        </div>
      </div>

      <div className="bg-green-500 w-1/2">hihi </div>
    </div>
  );
}
