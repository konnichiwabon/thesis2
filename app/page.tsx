"use client"
import CardBox from "@/component/cardBox";
import Carousel from "@/component/carousel";
import BusStopCarousel from "@/component/busStopCarousel";
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useConvexConnectionState, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getLoadStatus } from "@/types/jeepney";
import type { JeepneyMapMarker, JeepneyCarouselItem } from "@/types/jeepney";

// Interface for jeepney data from Convex
interface JeepneyData {
  jeepneyId: string;
  name?: string;
  plateNumber: string;
  passengerCount: number;
  maxLoad?: number;
  routeNumber?: string;
  color?: string;
  operator?: string;
  driverName?: string;
  location: {
    lat: number;
    lng: number;
  } | null;
}

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
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [selectedBusStop, setSelectedBusStop] = useState<any>(null);
  const [routesPassingThrough, setRoutesPassingThrough] = useState<any[]>([]);
  const [nearbyJeepneys, setNearbyJeepneys] = useState<any[]>([]);
  const [busStopCoords, setBusStopCoords] = useState<{lat: number, lng: number} | null>(null);
  const connectionState = useConvexConnectionState();
  
  // Fetch jeepneys data from Convex
  const jeepneysData = useQuery(api.gps.getJeepneysWithLocations);
  
  // Fetch bus stops data from Convex
  const busStopsData = useQuery(api.busStops.getAllBusStops);
  
  // Fetch all routes from Convex
  const allRoutes = useQuery(api.routes.getAllRoutes);
  
  // Fetch nearby jeepneys for selected bus stop (with 1km radius)
  const nearbyJeepneysData = useQuery(
    api.busStops.getNearbyJeepneysAtBusStop,
    busStopCoords ? {
      busStopLat: busStopCoords.lat,
      busStopLng: busStopCoords.lng,
      radiusMeters: 1000, // 1km radius
    } : "skip"
  );
  
  // Update nearby jeepneys when query results change
  useEffect(() => {
    if (nearbyJeepneysData) {
      console.log("🚍 Nearby jeepneys found:", nearbyJeepneysData.length);
      nearbyJeepneysData.forEach(jeep => {
        console.log(`  - ${jeep.plateNumber} (${jeep.jeepneyId}) - ${jeep.distanceFromBusStop}m away`);
      });
      setNearbyJeepneys(nearbyJeepneysData);
    }
  }, [nearbyJeepneysData]);
  
  // Keep selectedJeep in sync with Convex live data
  useEffect(() => {
    if (selectedJeep && jeepneysData) {
      const updatedJeep = jeepneysData.find((j: JeepneyData) => j.jeepneyId === selectedJeep.jeepneyId);
      if (updatedJeep) {
        setSelectedJeep(updatedJeep);
      }
    }
  }, [jeepneysData]);
  
  const getColorTheme = (load: number, maxLoad: number = 40): 'green' | 'red' | 'orange' | 'purple' => {
    const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
    if (pct <= 33) return "green";
    if (pct <= 66) return "orange";
    if (pct < 100) return "red";
    return "purple";
  };

  const getStatus = (load: number, maxLoad: number = 40): string => {
    const pct = maxLoad > 0 ? (load / maxLoad) * 100 : 0;
    if (pct <= 33) return "Low";
    if (pct <= 66) return "Moderate";
    if (pct < 100) return "High";
    return "Overloaded";
  };
  
  // Bus data that will be shared between popup and CardBox
  const busData = selectedJeep ? {
    route: selectedJeep.jeepneyId,
    name: selectedJeep.name,
    routeNumber: selectedJeep.routeNumber,
    plateNumber: selectedJeep.plateNumber,
    operator: selectedJeep.operator,
    driverName: selectedJeep.driverName,
    currentLoad: selectedJeep.passengerCount,
    maxLoad: selectedJeep.maxLoad ?? 0,
    status: getStatus(selectedJeep.passengerCount, selectedJeep.maxLoad ?? 0),
    colorTheme: getColorTheme(selectedJeep.passengerCount, selectedJeep.maxLoad ?? 0)
  } : {
    route: "62C",
    plateNumber: "ABC 123",
    currentLoad: 0,
    maxLoad: 0,
    status: "Low",
    colorTheme: "green" as const
  };

  // Convert Convex data to carousel items
  const carouselItems = jeepneysData?.map((jeep: JeepneyData, index: number) => ({
    id: index + 1,
    route: jeep.jeepneyId,
    plateNumber: jeep.plateNumber,
    currentLoad: jeep.passengerCount,
    maxLoad: jeep.maxLoad ?? 0,
    status: getStatus(jeep.passengerCount, jeep.maxLoad ?? 0),
    colorTheme: getColorTheme(jeep.passengerCount, jeep.maxLoad ?? 0)
  })) || [];

  // Find routes passing through a bus stop (within 50 meters)
  const findRoutesPassingThroughBusStop = (busStopLat: number, busStopLng: number) => {
    if (!allRoutes) return [];
    
    const threshold = 0.0005; // Approximately 50 meters in degrees
    
    return allRoutes.filter(route => {
      return route.geometry.some(point => {
        const distance = Math.sqrt(
          Math.pow(point.lat - busStopLat, 2) + Math.pow(point.lng - busStopLng, 2)
        );
        return distance <= threshold;
      });
    });
  };

  const handleBusStopClick = (busStop: any) => {
    console.log("🚏 Bus Stop Clicked:", busStop.name);
    setSelectedBusStop(busStop);
    
    // Set coordinates to trigger the query for nearby jeepneys
    setBusStopCoords({ lat: busStop.lat, lng: busStop.lng });
    
    // Find routes passing through this bus stop
    const passingRoutes = findRoutesPassingThroughBusStop(busStop.lat, busStop.lng);
    console.log("📍 Routes passing through:", passingRoutes.length, passingRoutes.map(r => r.name));
    setRoutesPassingThrough(passingRoutes);
    
    setShowCarousel(false);
    setShowCardBox(false);
    setSelectedJeep(null);
    
    // Set map center with a slight delay to ensure state updates properly
    setTimeout(() => {
      setMapCenter([busStop.lat, busStop.lng]);
    }, 100);
  };

  return (
    <div>
      <MapComponent 
        busStops={busStopsData || []}
        selectedLocation={mapCenter}
        onViewMoreDetails={(jeep) => {
          // Enrich the marker object with full DB data
          const fullJeep = jeepneysData?.find((j: JeepneyData) => j.jeepneyId === jeep.id) ?? jeep;
          setSelectedJeep(fullJeep);
          setShowCardBox(true);
          setShowCarousel(false);
        }}
        onBusStopClick={handleBusStopClick}
        mapType={mapType}
        routesPassingThrough={routesPassingThrough}
        nearbyJeepneys={nearbyJeepneys}
        selectedBusStop={selectedBusStop}
        onJeepneyClickFromBusStop={(jeep) => {
          setSelectedJeep(jeep);
          setShowCardBox(true);
          setSelectedBusStop(null);
          setRoutesPassingThrough([]);
          setNearbyJeepneys([]);
          if (jeep.location) {
            setMapCenter([jeep.location.lat, jeep.location.lng]);
          }
        }}
        onCloseBusStop={() => {
          setSelectedBusStop(null);
          setRoutesPassingThrough([]);
          setNearbyJeepneys([]);
          setBusStopCoords(null); // Clear coordinates to stop the query
          setShowCarousel(true);
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

      {/* Map Type Switcher */}
      <div className="absolute top-5 right-20 z-50 bg-white/90 rounded-lg shadow-lg backdrop-blur-sm border border-gray-200 overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              mapType === 'roadmap'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Roadmap"
          >
            🗺️
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              mapType === 'satellite'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Satellite"
          >
            🛰️
          </button>
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              mapType === 'hybrid'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Hybrid"
          >
            🌍
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              mapType === 'terrain'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            title="Terrain"
          >
            ⛰️
          </button>
        </div>
      </div>
      
      {/* Connection Status Indicator */}
      <div className="absolute bottom-5 left-5 z-50 bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-bold backdrop-blur-sm border border-gray-200">
        Status:{" "}
        <span className={connectionState?.isWebSocketConnected ? "text-green-600" : "text-red-600"}>
          {connectionState?.isWebSocketConnected ? "Connected to Convex" : "Disconnected"}
        </span>
        {" "}· v3.0
      </div>

      {/* Carousel positioned on top of the map */}
      {showCarousel && (
        <div className="absolute top-4 left-4 right-4 z-20">
          <Carousel 
            items={carouselItems}
            onItemClick={(item) => {
              const jeep = jeepneysData?.find((j: JeepneyData) => j.jeepneyId === item.route);
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

      {/* Bus Stop Carousel - always visible when a bus stop is selected */}
      {selectedBusStop && (
        <BusStopCarousel
          busStopName={selectedBusStop.name}
          isLoading={nearbyJeepneysData === undefined && busStopCoords !== null}
          jeepneys={nearbyJeepneys.map((jeep: any) => ({
            jeepneyId: jeep.jeepneyId,
            plateNumber: jeep.plateNumber,
            passengerCount: jeep.passengerCount,
            maxLoad: jeep.maxLoad,
            location: jeep.location,
            distance: jeep.distanceFromBusStop,
            color: jeep.color,
            routeNumber: jeep.routeNumber,
          }))}
          onClose={() => {
            setSelectedBusStop(null);
            setRoutesPassingThrough([]);
            setNearbyJeepneys([]);
            setBusStopCoords(null);
            setShowCarousel(true);
          }}
          onJeepneyClick={(jeep) => {
            setSelectedJeep(jeep);
            setShowCardBox(true);
            setShowCarousel(false);
            setSelectedBusStop(null);
            setRoutesPassingThrough([]);
            setNearbyJeepneys([]);
            setBusStopCoords(null);
            if (jeep.location) {
              setMapCenter([jeep.location.lat, jeep.location.lng]);
            }
          }}
        />
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
              name={(busData as any).name}
              routeNumber={busData.routeNumber}
              plateNumber={busData.plateNumber}
              operator={busData.operator}
              driverName={busData.driverName}
              currentLoad={busData.currentLoad}
              maxLoad={busData.maxLoad}
            />
          </div>
        </div>
      )}
      
    </div>
  );
}
