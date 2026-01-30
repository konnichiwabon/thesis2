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

// Custom numbered marker component with double-click to remove
function NumberedMarker({ 
  position, 
  number, 
  onDoubleClick 
}: { 
  position: [number, number]; 
  number: number;
  onDoubleClick?: () => void;
}) {
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
        cursor: pointer;
      ">${number}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker 
      position={position} 
      icon={icon}
      eventHandlers={{
        click: (e) => {
          // Stop propagation to prevent map click from adding a waypoint
          e.originalEvent.stopPropagation();
        },
        dblclick: (e) => {
          e.originalEvent.stopPropagation();
          if (onDoubleClick) {
            onDoubleClick();
          }
        },
      }}
    />
  );
}

export default function RouteManagerPage({ isDarkMode = true }: { isDarkMode?: boolean }) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeColor, setRouteColor] = useState('#3b82f6');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [manualInputMode, setManualInputMode] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  // Default map center (Cebu City, Philippines)
  const [mapCenter] = useState<[number, number]>([10.3157, 123.8854]);

  // Google Maps API key from environment variable
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

  // Convex mutations and queries
  const createRoute = useMutation(api.routes.createRoute);
  const updateRoute = useMutation(api.routes.updateRoute);
  const deleteRoute = useMutation(api.routes.deleteRoute);
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
    setEditingRouteId(null);
    setRouteName('');
    setRouteColor('#3b82f6');
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

      if (editingRouteId) {
        // Update existing route
        await updateRoute({
          id: editingRouteId as any,
          name: routeName.trim(),
          color: routeColor,
          waypoints: waypoints,
          geometry: geometry,
          distance: routeData.distance,
          duration: routeData.duration,
        });
        setSaveMessage('✅ Route updated successfully!');
      } else {
        // Create new route
        await createRoute({
          name: routeName.trim(),
          color: routeColor,
          waypoints: waypoints,
          geometry: geometry,
          distance: routeData.distance,
          duration: routeData.duration,
        });
        setSaveMessage('✅ Route saved successfully!');
      }
      
      // Reset form after 2 seconds
      setTimeout(() => {
        handleClearAll();
      }, 2000);
    } catch (error) {
      console.error('Error saving route:', error);
      setSaveMessage('❌ Error saving route');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle editing a route
  const handleEditRoute = (route: any) => {
    setEditingRouteId(route._id);
    setRouteName(route.name);
    setRouteColor(route.color);
    setWaypoints(route.waypoints);
    setSaveMessage('📝 Editing route: ' + route.name);
    // Scroll to top of sidebar
    const sidebar = document.querySelector('.w-96');
    if (sidebar) {
      sidebar.scrollTop = 0;
    }
  };

  // Handle deleting a route
  const handleDeleteRoute = async (route: any) => {
    if (window.confirm(`Are you sure you want to delete the route "${route.name}"?`)) {
      try {
        await deleteRoute({ id: route._id });
        setSaveMessage('✅ Route deleted successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
        
        // If we were editing this route, clear the form
        if (editingRouteId === route._id) {
          handleClearAll();
        }
      } catch (error) {
        console.error('Error deleting route:', error);
        setSaveMessage('❌ Error deleting route');
      }
    }
  };

  // Handle removing a specific waypoint by index
  const handleRemoveWaypoint = (index: number) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index));
  };

  // Handle adding waypoint manually
  const handleAddManualWaypoint = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setSaveMessage('⚠️ Please enter valid latitude and longitude');
      return;
    }

    if (lat < -90 || lat > 90) {
      setSaveMessage('⚠️ Latitude must be between -90 and 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setSaveMessage('⚠️ Longitude must be between -180 and 180');
      return;
    }

    setWaypoints(prev => [...prev, { lat, lng }]);
    setManualLat('');
    setManualLng('');
    setSaveMessage('✅ Waypoint added');
    setTimeout(() => setSaveMessage(''), 2000);
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
    <div className={`flex h-screen ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Sidebar */}
      <div className={`w-96 shadow-lg overflow-y-auto ${
        isDarkMode ? 'bg-gray-800' : 'bg-white border-r border-gray-300'
      }`}>
        <div className="p-6">
          <h1 className={`text-2xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Route Manager</h1>

          {/* Input Mode Toggle */}
          <div className={`mb-6 rounded-lg p-3 border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-gray-100 border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>Input Mode:</span>
              <button
                onClick={() => setManualInputMode(!manualInputMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  manualInputMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {manualInputMode ? 'Manual' : 'Touch Map'}
              </button>
            </div>
            <p className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {manualInputMode
                ? 'Type coordinates below to add waypoints'
                : 'Tap or click on the map to add waypoints'}
            </p>
          </div>

          {/* Manual Coordinate Input */}
          {manualInputMode && (
            <div className="mb-6 bg-gray-700 rounded-lg p-4 border-2 border-purple-500">
              <h3 className="text-sm font-semibold text-purple-300 mb-3">Add Waypoint Manually</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    placeholder="e.g., 10.3157"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    placeholder="e.g., 123.8854"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-white placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={handleAddManualWaypoint}
                  disabled={!manualLat || !manualLng}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  ➕ Add Waypoint
                </button>
              </div>
            </div>
          )}

          {/* Route Details */}
          <div className={`mb-6 rounded-lg p-4 border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-white border-gray-300'
          }`}>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Route Name
            </label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="e.g., Pasay - Alabang"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          <div className={`mb-6 rounded-lg p-4 border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-white border-gray-300'
          }`}>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Route Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={routeColor}
                onChange={(e) => setRouteColor(e.target.value)}
                className={`h-10 w-20 border rounded cursor-pointer ${
                  isDarkMode
                    ? 'bg-gray-600 border-gray-500'
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                value={routeColor}
                onChange={(e) => setRouteColor(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Waypoints List */}
          <div className={`mb-6 rounded-lg p-4 border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-white border-gray-300'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h2 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Waypoints ({waypoints.length})
              </h2>
              {isLoadingRoute && (
                <span className="text-sm text-blue-400">Calculating route...</span>
              )}
            </div>
            
            <div className={`rounded-lg p-3 max-h-64 overflow-y-auto border ${
              isDarkMode
                ? 'bg-gray-600 border-gray-500'
                : 'bg-gray-50 border-gray-300'
            }`}>
              {waypoints.length === 0 ? (
                <p className={`text-sm text-center py-4 font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Click on the map to add waypoints
                </p>
              ) : (
                <ul className="space-y-2">
                  {waypoints.map((wp, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-2">
                        {idx + 1}
                      </span>
                      <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
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
            <div className={`mb-6 rounded-lg p-4 border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600'
                : 'bg-white border-gray-300'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-600'
              }`}>Route Details</h3>
              <div className="space-y-1 text-sm">
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <span className="font-medium">Distance:</span> {formatDistance(routeData.distance)}
                </p>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <span className="font-medium">Duration:</span> {formatDuration(routeData.duration)}
                </p>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <span className="font-medium">Points:</span> {routeData.coordinates.length}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`mb-6 rounded-lg p-4 border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-white border-gray-300'
          }`}>
            <div className="space-y-2">
              <button
                onClick={handleRemoveLastPoint}
                disabled={waypoints.length === 0}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Remove Last Point
              </button>
              
              <button
                onClick={handleClearAll}
                disabled={waypoints.length === 0}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                Clear All
              </button>
              
              <button
                onClick={handleSaveRoute}
                disabled={waypoints.length < 2 || !routeName.trim() || isSaving}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : editingRouteId ? 'Update Route' : 'Save Route'}
              </button>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              saveMessage.includes('✅') ? 'bg-green-700 text-white border border-green-600' :
              saveMessage.includes('❌') ? 'bg-red-700 text-white border border-red-600' :
              'bg-yellow-700 text-white border border-yellow-600'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Saved Routes List */}
          <div className={`rounded-lg p-4 border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-white border-gray-300'
          }`}>
            <h2 className={`text-lg font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Saved Routes</h2>
            <div className="space-y-2">
              {allRoutes && allRoutes.length > 0 ? (
                allRoutes.map((route) => (
                  <div
                    key={route._id}
                    className={`rounded-lg p-3 border-l-4 border ${
                      isDarkMode
                        ? 'bg-gray-600 border-gray-500'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                    style={{ borderLeftColor: route.color }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{route.name}</div>
                        <div className={`text-xs mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {formatDistance(route.distance)} • {formatDuration(route.duration)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditRoute(route)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                          title="Edit route"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoute(route)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                          title="Delete route"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`text-sm text-center py-4 font-medium ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
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
          {/* Google Maps Layer */}
          {googleMapsKey ? (
            <TileLayer
              attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
              url={`https://mt1.google.com/vt/lyrs=${mapType === 'roadmap' ? 'm' : mapType === 'satellite' ? 's' : mapType === 'hybrid' ? 'y' : 'p'}&x={x}&y={y}&z={z}&key=${googleMapsKey}`}
              maxZoom={20}
            />
          ) : (
            <TileLayer
              attribution='&copy; Google Maps'
              url={`https://mt1.google.com/vt/lyrs=${mapType === 'roadmap' ? 'm' : mapType === 'satellite' ? 's' : mapType === 'hybrid' ? 'y' : 'p'}&x={x}&y={y}&z={z}`}
              maxZoom={20}
            />
          )}

          {/* Map click handler - only active when not in manual mode */}
          {!manualInputMode && <MapClickHandler onMapClick={handleMapClick} />}
          
          {/* Render waypoint markers */}
          {waypoints.map((wp, idx) => (
            <NumberedMarker
              key={idx}
              position={[wp.lat, wp.lng]}
              number={idx + 1}
              onDoubleClick={() => handleRemoveWaypoint(idx)}
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

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-1000">
          {/* Info Icon Button */}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="bg-gray-700 rounded-lg shadow-lg p-3 hover:bg-gray-600 transition-colors border border-gray-600"
            title="Show instructions"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          </button>

          {/* Map Type Controls */}
          {googleMapsKey && (
            <div className="bg-gray-700 rounded-lg shadow-lg p-3">
              <h4 className="font-medium text-gray-300 mb-2 text-xs">Map Type:</h4>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setMapType('roadmap')}
                  className={`px-2 py-1 text-xs rounded ${
                    mapType === 'roadmap'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Roadmap
                </button>
                <button
                  onClick={() => setMapType('satellite')}
                  className={`px-2 py-1 text-xs rounded ${
                    mapType === 'satellite'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setMapType('hybrid')}
                  className={`px-2 py-1 text-xs rounded ${
                    mapType === 'hybrid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Hybrid
                </button>
                <button
                  onClick={() => setMapType('terrain')}
                  className={`px-2 py-1 text-xs rounded ${
                    mapType === 'terrain'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  Terrain
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Popup Modal */}
        {showInstructions && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-30 z-[1001]"
              onClick={() => setShowInstructions(false)}
            ></div>

            {/* Popup Content */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md z-[1002] border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-white text-lg">How to use Route Manager</h3>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-white text-2xl leading-none font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2 text-sm">Touch Map Mode:</h4>
                  <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside ml-2">
                    <li>Tap/click on the map to add waypoints</li>
                    <li>Double-tap/click markers to remove them</li>
                    <li>Route automatically follows roads</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-300 mb-2 text-sm">Manual Mode:</h4>
                  <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside ml-2">
                    <li>Enter latitude and longitude manually</li>
                    <li>Click "Add Waypoint" to add points</li>
                    <li>Route automatically snaps to roads</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-300 mb-2 text-sm">Saving Routes:</h4>
                  <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside ml-2">
                    <li>Enter route name and select color</li>
                    <li>Click "Save Route" when done</li>
                    <li>Edit or delete saved routes from the list</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setShowInstructions(false)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </>
        )}

        {/* Bus Stop Info Panel */}
        {selectedBusStop && (
          <div className="absolute bottom-4 right-4 bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm z-1000 border border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg whitespace-nowrap">{selectedBusStop.name}</h3>
                <p className="text-xs text-gray-400">
                  {selectedBusStop.lat.toFixed(6)}, {selectedBusStop.lng.toFixed(6)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedBusStop(null);
                  setRoutesPassingThrough([]);
                }}
                className="text-gray-400 hover:text-white text-xl leading-none font-bold"
              >
                ×
              </button>
            </div>

            <div className="border-t border-gray-700 pt-3">
              <h4 className="font-medium text-gray-300 mb-2">
                Routes Passing Through ({routesPassingThrough.length})
              </h4>
              {routesPassingThrough.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {routesPassingThrough.map((route) => (
                    <div
                      key={route._id}
                      className="flex items-center gap-2 p-2 bg-gray-600 rounded border-l-4 border border-gray-500"
                      style={{ borderLeftColor: route.color }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm text-white">{route.name}</div>
                        <div className="text-xs text-gray-400">
                          {formatDistance(route.distance)} • {formatDuration(route.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-700 italic font-medium">No routes pass through this stop</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
