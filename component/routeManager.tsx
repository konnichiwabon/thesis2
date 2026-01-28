"use client"
import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import { Icon, LatLng, DivIcon } from 'leaflet';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getRouteFromOSRM, formatDistance, formatDuration } from '@/lib/osrm';

// Fix Leaflet default marker icon issue in Next.js
if (typeof window !== 'undefined') {
  delete (Icon.Default.prototype as any)._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface Waypoint {
  lat: number;
  lng: number;
}

interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Custom numbered marker component
function NumberedMarker({ position, number }: { position: [number, number]; number: number }) {
  const icon = new DivIcon({
    className: 'custom-numbered-marker',
    html: `
      <div style="
        background-color: #3b82f6;
        color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${number}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return <Marker position={position} icon={icon} />;
}

export default function RouteManagerPage() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeColor, setRouteColor] = useState('#3b82f6');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

  // Default map center (Manila, Philippines - adjust as needed)
  const [mapCenter] = useState<[number, number]>([14.5995, 120.9842]);

  // Google Maps API key from environment variable
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

  // Convex mutations and queries
  const createRoute = useMutation(api.routes.createRoute);
  const allRoutes = useQuery(api.routes.getAllRoutes);
  const busStops = useQuery(api.busStops.getAllBusStops);
  
  // Bus stop interaction state
  const [selectedBusStop, setSelectedBusStop] = useState<any>(null);
  const [routesPassingThrough, setRoutesPassingThrough] = useState<any[]>([]);

  // Fetch OSRM route when waypoints change
  useEffect(() => {
    const fetchRoute = async () => {
      if (waypoints.length < 2) {
        setRouteData(null);
        return;
      }

      setIsLoadingRoute(true);
      const result = await getRouteFromOSRM(waypoints);
      if (result) {
        setRouteData(result);
      }
      setIsLoadingRoute(false);
    };

    fetchRoute();
  }, [waypoints]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setWaypoints(prev => [...prev, { lat, lng }]);
  }, []);

  const handleRemoveLastPoint = () => {
    setWaypoints(prev => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setWaypoints([]);
    setRouteData(null);
    setSaveMessage('');
  };

  const handleSaveRoute = async () => {
    if (!routeName.trim()) {
      setSaveMessage('⚠️ Please enter a route name');
      return;
    }

    if (waypoints.length < 2) {
      setSaveMessage('⚠️ Need at least 2 waypoints');
      return;
    }

    if (!routeData) {
      setSaveMessage('⚠️ Waiting for route calculation...');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const geometry = routeData.coordinates.map(coord => ({
        lat: coord[0],
        lng: coord[1],
      }));

      await createRoute({
        name: routeName.trim(),
        color: routeColor,
        waypoints: waypoints,
        geometry: geometry,
        distance: routeData.distance,
        duration: routeData.duration,
      });

      setSaveMessage('✅ Route saved successfully!');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        handleClearAll();
        setRouteName('');
        setRouteColor('#3b82f6');
      }, 2000);
    } catch (error) {
      console.error('Error saving route:', error);
      setSaveMessage('❌ Error saving route');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if a route passes through a bus stop (within 50 meters)
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
    setSelectedBusStop(busStop);
    const passingRoutes = findRoutesPassingThroughBusStop(busStop.lat, busStop.lng);
    setRoutesPassingThrough(passingRoutes);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-96 bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Route Manager</h1>

          {/* Route Details */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Route Name
            </label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="e.g., Pasay - Alabang"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Route Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={routeColor}
                onChange={(e) => setRouteColor(e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={routeColor}
                onChange={(e) => setRouteColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Waypoints List */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">
                Waypoints ({waypoints.length})
              </h2>
              {isLoadingRoute && (
                <span className="text-sm text-blue-600">Calculating route...</span>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
              {waypoints.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Click on the map to add waypoints
                </p>
              ) : (
                <ul className="space-y-2">
                  {waypoints.map((wp, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-2">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700">
                        {wp.lat.toFixed(6)}, {wp.lng.toFixed(6)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Route Stats */}
          {routeData && (
            <div className="mb-6 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Route Details</h3>
              <div className="space-y-1 text-sm">
                <p className="text-blue-800">
                  <span className="font-medium">Distance:</span> {formatDistance(routeData.distance)}
                </p>
                <p className="text-blue-800">
                  <span className="font-medium">Duration:</span> {formatDuration(routeData.duration)}
                </p>
                <p className="text-blue-800">
                  <span className="font-medium">Points:</span> {routeData.coordinates.length}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleRemoveLastPoint}
              disabled={waypoints.length === 0}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Remove Last Point
            </button>
            
            <button
              onClick={handleClearAll}
              disabled={waypoints.length === 0}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Clear All
            </button>
            
            <button
              onClick={handleSaveRoute}
              disabled={waypoints.length < 2 || !routeName.trim() || isSaving}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Route'}
            </button>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              saveMessage.includes('✅') ? 'bg-green-100 text-green-800' :
              saveMessage.includes('❌') ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Saved Routes List */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Saved Routes</h2>
            <div className="space-y-2">
              {allRoutes && allRoutes.length > 0 ? (
                allRoutes.map((route) => (
                  <div
                    key={route._id}
                    className="bg-gray-50 rounded-lg p-3 border-l-4"
                    style={{ borderLeftColor: route.color }}
                  >
                    <div className="font-medium text-gray-900">{route.name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {formatDistance(route.distance)} • {formatDuration(route.duration)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No saved routes yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          {googleMapsKey ? (
            <TileLayer
              attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
              url={`https://mt1.google.com/vt/lyrs=${mapType === 'roadmap' ? 'm' : mapType === 'satellite' ? 's' : mapType === 'hybrid' ? 'y' : 'p'}&x={x}&y={y}&z={z}&key=${googleMapsKey}`}
              maxZoom={20}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {/* Map click handler */}
          <MapClickHandler onMapClick={handleMapClick} />
          
          {/* Render waypoint markers */}
          {waypoints.map((wp, idx) => (
            <NumberedMarker
              key={idx}
              position={[wp.lat, wp.lng]}
              number={idx + 1}
            />
          ))}
          
          {/* Render OSRM route polyline */}
          {routeData && (
            <Polyline
              positions={routeData.coordinates}
              color={routeColor}
              weight={5}
              opacity={0.7}
            />
          )}

          {/* Render bus stops */}
          {busStops && busStops.map((stop) => (
            <Marker
              key={stop._id}
              position={[stop.lat, stop.lng]}
              eventHandlers={{
                click: () => handleBusStopClick(stop),
              }}
              icon={new Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })}
            />
          ))}

          {/* Render all saved routes on map */}
          {allRoutes && allRoutes.map((route) => (
            <Polyline
              key={route._id}
              positions={route.geometry.map(p => [p.lat, p.lng])}
              color={route.color}
              weight={3}
              opacity={0.5}
            />
          ))}
        </MapContainer>

        {/* Instructions overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-1000">

          {googleMapsKey && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-gray-700 mb-2 text-sm">Map Type:</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMapType('roadmap')}
                  className={`px-2 py-1 text-xs rounded ${
                    mapType === 'roadmap'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Roadmap
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className={`px-2 py-1 text-xs rounded ${
                    mapType === 'satellite'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setMapType('hybrid')}
                  className={`px-2 py-1 text-xs rounded ${
                    mapType === 'hybrid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Hybrid
                </button>
                <button
                  onClick={() => setMapType('terrain')}
                  className={`px-2 py-1 text-xs rounded ${
                    mapType === 'terrain'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Terrain
                </button>
              </div>
            </div>
          )}
          <h3 className="font-semibold text-gray-900 mb-2">How to use:</h3>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Click on the map to add waypoints</li>
            <li>Route automatically snaps to roads</li>
            <li>Enter route name and color</li>
            <li>Click "Save Route" when done</li>
            <li>Click red markers (bus stops) to see passing routes</li>
          </ol>
        </div>

        {/* Bus Stop Info Panel */}
        {selectedBusStop && (
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-1000">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{selectedBusStop.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedBusStop.lat.toFixed(6)}, {selectedBusStop.lng.toFixed(6)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedBusStop(null);
                  setRoutesPassingThrough([]);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium text-gray-700 mb-2">
                Routes Passing Through ({routesPassingThrough.length})
              </h4>
              {routesPassingThrough.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {routesPassingThrough.map((route) => (
                    <div
                      key={route._id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded border-l-4"
                      style={{ borderLeftColor: route.color }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{route.name}</div>
                        <div className="text-xs text-gray-600">
                          {formatDistance(route.distance)} • {formatDuration(route.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No routes pass through this stop</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
