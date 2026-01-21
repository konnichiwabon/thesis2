"use client"
import CardBox from "@/component/cardBox";
import Carousel from "@/component/carousel";
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

  // Sample carousel items - you can replace this with actual data
  const carouselItems = [
    {
      id: 1,
      route: "62C",
      plateNumber: "ABC 123",
      currentLoad: 35,
      maxLoad: 40,
      status: getStatus(35),
      colorTheme: getColorTheme(35)
    },
    {
      id: 2,
      route: "04L",
      plateNumber: "XYZ 456",
      currentLoad: 10,
      maxLoad: 40,
      status: getStatus(10),
      colorTheme: getColorTheme(10)
    },
    {
      id: 3,
      route: "13C",
      plateNumber: "DEF 789",
      currentLoad: 28,
      maxLoad: 40,
      status: getStatus(28),
      colorTheme: getColorTheme(28)
    }
  ];

  return (
    <div>
      <MapComponent 
        coords={[10.335682729765237, 123.9112697095374]} 
        onViewMoreDetails={() => setShowCardBox(true)}
        busData={busData}
      />
      
      {/* Carousel positioned on top of the map */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <Carousel 
          items={carouselItems}
        />
      </div>
      
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