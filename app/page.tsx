"use client"
import CardBox from "@/component/cardBox";
import Carousel from "@/component/carousel";
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useConvexConnectionState, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import('@/component/map'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});

export default function Home() {
  const [showCardBox, setShowCardBox] = useState(false);
  const [showCarousel, setShowCarousel] = useState(true);
  const [selectedJeep, setSelectedJeep] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const connectionState = useConvexConnectionState();
  
  // Fetch jeepneys data from Convex
  const jeepneysData = useQuery(api.gps.getJeepneysWithLocations);
  
  // Fetch bus stops data from Convex
  const busStopsData = useQuery(api.busStops.getAllBusStops);
  
  // Mutation to save location updates
  const saveLocation = useMutation(api.gps.saveLocation);
  
  // Keep selectedJeep in sync with Convex data (but not during manual updates)
  useEffect(() => {
    if (selectedJeep && jeepneysData && !isUpdating) {
      const updatedJeep = jeepneysData.find(j => j.jeepneyId === selectedJeep.jeepneyId);
      if (updatedJeep && updatedJeep.passengerCount !== selectedJeep.passengerCount) {
        setSelectedJeep(updatedJeep);
      }
    }
  }, [jeepneysData, isUpdating]);
  
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
  const busData = selectedJeep ? {
    route: selectedJeep.jeepneyId,
    plateNumber: selectedJeep.plateNumber,
    currentLoad: selectedJeep.passengerCount,
    maxLoad: 40,
    status: getStatus(selectedJeep.passengerCount),
    colorTheme: getColorTheme(selectedJeep.passengerCount)
  } : {
    route: "62C",
    plateNumber: "ABC 123",
    currentLoad: 0,
    maxLoad: 40,
    status: "Low",
    colorTheme: "green" as const
  };

  // Convert Convex data to carousel items
  const carouselItems = jeepneysData?.map((jeep, index) => ({
    id: index + 1,
    route: jeep.jeepneyId,
    plateNumber: jeep.plateNumber,
    currentLoad: jeep.passengerCount,
    maxLoad: 40,
    status: getStatus(jeep.passengerCount),
    colorTheme: getColorTheme(jeep.passengerCount)
  })) || [];

  // Get jeepney locations for map markers
  const jeepLocations = jeepneysData?.map(jeep => ({
    id: jeep.jeepneyId,
    plateNumber: jeep.plateNumber,
    passengerCount: jeep.passengerCount,
    position: [jeep.location!.lat, jeep.location!.lng] as [number, number],
    colorTheme: getColorTheme(jeep.passengerCount),
    status: getStatus(jeep.passengerCount)
  })) || [];

  return (
    <div>
      <MapComponent 
        jeepLocations={jeepLocations}
        busStops={busStopsData || []}
        selectedLocation={mapCenter}
        onViewMoreDetails={(jeep) => {
          setSelectedJeep(jeep);
          setShowCardBox(true);
          setShowCarousel(false);
        }}
      />
      
      {/* Settings Button to Admin Page */}
      <a 
        href="/admin"
        className="absolute top-5 right-5 z-50 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all hover:scale-110 backdrop-blur-sm border border-gray-200"
        title="Admin Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </a>
      
      {/* Connection Status Indicator */}
      <div className="absolute bottom-5 left-5 z-50 bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-bold backdrop-blur-sm border border-gray-200">
        Status:{" "}
        <span className={connectionState?.isWebSocketConnected ? "text-green-600" : "text-red-600"}>
          {connectionState?.isWebSocketConnected ? "Connected to Convex" : "Disconnected"}
        </span>
      </div>

      {/* Carousel positioned on top of the map */}
      {showCarousel && (
        <div className="absolute top-4 left-4 right-4 z-20">
          <Carousel 
            items={carouselItems}
            onItemClick={(item) => {
              const jeep = jeepneysData?.find(j => j.jeepneyId === item.route);
              if (jeep && jeep.location) {
                setSelectedJeep(jeep);
                setMapCenter([jeep.location.lat, jeep.location.lng]);
                setShowCardBox(true);
                setShowCarousel(false);
              }
            }}
          />
        </div>
      )}
      
      {showCardBox && selectedJeep && (
        <div className="absolute top-0 left-0 p-4 z-30 h-full pointer-events-none">
          <div className="relative pointer-events-auto">
            <CardBox 
              onClose={() => {
                setShowCardBox(false);
                setSelectedJeep(null);
                setShowCarousel(true);
                setMapCenter(null);
              }} 
              route={busData.route}
              plateNumber={busData.plateNumber}
              currentLoad={busData.currentLoad}
              maxLoad={busData.maxLoad}
              onLoadChange={async (newLoad) => {
                // Optimistically update UI immediately
                setSelectedJeep({...selectedJeep, passengerCount: newLoad});
                setIsUpdating(true);
                
                // Calculate passengers in/out
                const diff = newLoad - busData.currentLoad;
                const passengersIn = diff > 0 ? diff : 0;
                const passengersOut = diff < 0 ? Math.abs(diff) : 0;
                
                // Update Convex database
                if (selectedJeep && selectedJeep.location) {
                  try {
                    await saveLocation({
                      jeepneyId: selectedJeep.jeepneyId,
                      plateNumber: selectedJeep.plateNumber,
                      latitude: selectedJeep.location.lat,
                      longitude: selectedJeep.location.lng,
                      passengersIn: passengersIn,
                      passengersOut: passengersOut,
                    });
                  } catch (error) {
                    console.error("Failed to update passenger count:", error);
                  } finally {
                    setIsUpdating(false);
                  }
                }
              }}
            />
          </div>
        </div>
      )}
      
    </div>
  );
}