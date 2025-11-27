export default function CardBox() {
  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden animate-pulse">

  {/* ================= MAIN HEADER DIV ================= */}
  <div className="bg-blue-700 p-4 flex items-center gap-3">
    {/* Route Number placeholder */}
    <div className="bg-red-600 h-9 w-16 rounded-md shadow-sm"></div>

    {/* Route Text placeholder (two lines) */}
    <div className="flex-1 space-y-2">
      <div className="h-5 bg-blue-400/50 rounded w-3/4"></div>
      <div className="h-5 bg-blue-400/50 rounded w-1/2"></div>
    </div>
  </div>

  {/* Main Body Content Wrapper */}
  <div className="p-5 space-y-6">

    {/* ================= STATUS DIV ================= */}
    <div className="flex justify-end">
      <div className="bg-gray-300 h-7 w-24 rounded-full shadow-sm"></div>
    </div>

    {/* ================= PASSENGER COUNT DIV ================= */}
    <div className="text-center space-y-2">
      <div className="h-8 bg-gray-200 rounded mx-auto w-2/3 mb-4"></div>

      <div className="flex justify-center items-end gap-4">
        {/* Icons area placeholder */}
        <div className="flex -space-x-3">
          <div className="h-20 w-12 bg-gray-300 rounded-t-full rounded-b-lg"></div>
          <div className="h-20 w-12 bg-gray-400 rounded-t-full rounded-b-lg z-10"></div>
        </div>

        {/* Big Number placeholder */}
        <div className="h-16 w-40 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* ================= VEHICLE INFO DIV ================= */}
    <div className="text-center">
      <div className="h-7 bg-gray-200 rounded mx-auto w-3/4"></div>
    </div>

    {/* ================= LEGEND DIV ================= */}
    <div className="bg-gray-200/80 rounded-xl p-4 flex justify-between items-end shadow-inner h-24">
      <div className="w-14 h-16 bg-gray-300/50 rounded"></div>
      <div className="w-14 h-16 bg-gray-300/50 rounded"></div>
      <div className="w-14 h-16 bg-gray-300/50 rounded"></div>
      <div className="w-14 h-16 bg-gray-300/50 rounded"></div>
    </div>

    {/* ================= ACTION BUTTONS DIV ================= */}
    <div className="flex gap-4 pt-2">
      <div className="flex-1 bg-blue-600 h-14 rounded-lg shadow-md"></div>
      <div className="flex-1 bg-blue-800/40 h-14 rounded-lg shadow-inner"></div>
    </div>

  </div>

  {/* ================= BOTTOM BAR DIV ================= */}
  <div className="h-3 bg-blue-700 w-full"></div>

</div>


)
}