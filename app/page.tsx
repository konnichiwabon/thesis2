"use client"
import CardBox from "@/component/cardBox";
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import('@/component/map'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});

export default function Home() {
  const [showCardBox, setShowCardBox] = useState(false);
  const [currentLoad, setCurrentLoad] = useState(35);
  
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
  
  // Bus data that will be shared between popup and CardBox
  const busData = {
    route: "62C",
    plateNumber: "ABC 123",
    currentLoad: currentLoad,
    maxLoad: 40,
    status: getStatus(currentLoad),
    colorTheme: getColorTheme(currentLoad)
  };

  return (
    <div>
      <MapComponent 
        coords={[10.335682729765237, 123.9112697095374]} 
        onViewMoreDetails={() => setShowCardBox(true)}
        busData={busData}
      />
      
      {showCardBox && (
        <div className="absolute top-0 left-0 p-4 z-10">
          <div className="relative">
            <CardBox 
              onClose={() => setShowCardBox(false)} 
              route={busData.route}
              plateNumber={busData.plateNumber}
              currentLoad={busData.currentLoad}
              maxLoad={busData.maxLoad}
              onLoadChange={setCurrentLoad}
            />
          </div>
        </div>
      )}
      
    </div>
  );
}