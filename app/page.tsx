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
        selectedLocation={mapCenter}
        onViewMoreDetails={(jeep) => {
          setSelectedJeep(jeep);
          setShowCardBox(true);
          setShowCarousel(false);
        }}
      />
      
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