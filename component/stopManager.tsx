"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";

// Fix Leaflet default marker icon issue in Next.js
if (typeof window !== 'undefined') {
  delete (Icon.Default.prototype as any)._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Dynamically import map components with SSR disabled
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

interface BusStop {
  _id: Id<"busStops">;
  _creationTime: number;
  name: string;
  lat: number;
  lng: number;
  color: string;
  passingRoutes?: string[];
}

interface Route {
  _id: Id<"routes">;
  _creationTime: number;
  name: string;
  color: string;
  waypoints: Array<{ lat: number; lng: number }>;
  geometry: Array<{ lat: number; lng: number }>;
  distance: number;
  duration: number;
  createdAt: number;
  updatedAt: number;
}

// Map click handler component
function MapClickHandler({ onMapClick, enabled }: { onMapClick: (lat: number, lng: number) => void; enabled: boolean }) {
  useMapEvents({
    click: (e) => {
      if (enabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

const StopManager = ({ isDarkMode }: { isDarkMode: boolean }) => {
  // Queries
  const busStops = useQuery(api.busStops.getAllBusStops);
  const routes = useQuery(api.routes.getAllRoutes);

  // Mutations
  const addBusStop = useMutation(api.busStops.addBusStop);
  const updateBusStop = useMutation(api.busStops.updateBusStop);
  const deleteBusStop = useMutation(api.busStops.deleteBusStop);

  // Form states
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [color, setColor] = useState("#FF5733");
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapClickMode, setMapClickMode] = useState(false);
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showSelectedMarker, setShowSelectedMarker] = useState(true);

  // Default map center (Cebu City, Philippines)
  const [mapCenter] = useState<[number, number]>([10.3157, 123.8854]);
  
  // Google Maps API key from environment variable
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

  // Ensure component is mounted before rendering map
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset form
  const resetForm = () => {
    setSelectedStop(null);
    setName("");
    setLat("");
    setLng("");
    setColor("#FF5733");
    setSelectedRoutes([]);
    setIsCreating(false);
    setTempMarker(null);
  };

  // Handle map click
  const handleMapClick = (latitude: number, longitude: number) => {
    // If there's already a temp marker, replace it with the new position
    setLat(latitude.toFixed(6));
    setLng(longitude.toFixed(6));
    setTempMarker({ lat: latitude, lng: longitude });
    // If editing an existing stop, we can update its location
    if (!isCreating && !selectedStop) {
      setIsCreating(true);
    }
  };

  // Load stop data when selected
  useEffect(() => {
    if (selectedStop) {
      setName(selectedStop.name);
      setLat(selectedStop.lat.toString());
      setLng(selectedStop.lng.toString());
      setColor(selectedStop.color);
      setSelectedRoutes(selectedStop.passingRoutes || []);
      setIsCreating(false);
      setTempMarker(null);
      setShowSelectedMarker(true);
    }
  }, [selectedStop]);

  // Handle route checkbox toggle
  const handleRouteToggle = (routeName: string) => {
    setSelectedRoutes((prev) =>
      prev.includes(routeName)
        ? prev.filter((r) => r !== routeName)
        : [...prev, routeName]
    );
  };

  // Handle form submit (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !lat || !lng) {
      alert("Please fill in all required fields");
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      alert("Please enter valid numbers for latitude and longitude");
      return;
    }

    try {
      if (isCreating || !selectedStop) {
        // Create new stop
        await addBusStop({
          name,
          lat: latitude,
          lng: longitude,
          color,
          passingRoutes: selectedRoutes.length > 0 ? selectedRoutes : undefined,
        });
        alert("Bus stop created successfully!");
      } else {
        // Update existing stop
        await updateBusStop({
          id: selectedStop._id,
          name,
          lat: latitude,
          lng: longitude,
          color,
          passingRoutes: selectedRoutes.length > 0 ? selectedRoutes : undefined,
        });
        alert("Bus stop updated successfully!");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving bus stop:", error);
      alert("Failed to save bus stop");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedStop) return;

    if (confirm(`Are you sure you want to delete "${selectedStop.name}"?`)) {
      try {
        await deleteBusStop({ id: selectedStop._id });
        alert("Bus stop deleted successfully!");
        resetForm();
      } catch (error) {
        console.error("Error deleting bus stop:", error);
        alert("Failed to delete bus stop");
      }
    }
  };

  // Filter stops by search query
  const filteredStops = busStops?.filter((stop) =>
    stop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`rounded-lg p-6 border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-300'
    }`}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Stop Manager
        </h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Manage bus stops and their passing routes
        </p>
      </div>

      {/* Split View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE: Stops List */}
          <div className={`rounded-lg p-6 border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-gray-100 border-gray-300'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-blue-400">
                Bus Stops
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setIsCreating(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg font-medium"
              >
                + New Stop
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search stops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Stops List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredStops?.map((stop) => (
                <div
                  key={stop._id}
                  onClick={() => setSelectedStop(stop)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border ${
                    selectedStop?._id === stop._id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-400 shadow-lg text-white"
                      : isDarkMode
                      ? "bg-gray-700 border-gray-600 hover:bg-gray-650 hover:border-gray-500 text-white"
                      : "bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{stop.name}</h3>
                      <div className={`text-sm mt-1 ${
                        selectedStop?._id === stop._id
                          ? 'text-gray-200'
                          : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <span>
                          📍 {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
                        </span>
                      </div>
                      {stop.passingRoutes && stop.passingRoutes.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {stop.passingRoutes.map((route) => (
                            <span
                              key={route}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                selectedStop?._id === stop._id
                                  ? 'bg-blue-800 text-blue-100'
                                  : isDarkMode
                                  ? 'bg-gray-800 text-blue-300'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {route}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex-shrink-0"
                      style={{ backgroundColor: stop.color }}
                    ></div>
                  </div>
                </div>
              ))}

              {(!filteredStops || filteredStops.length === 0) && (
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {searchQuery
                    ? "No stops found matching your search"
                    : "No bus stops yet. Create one to get started!"}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Edit Form */}
          <div className={`rounded-lg p-6 border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600'
              : 'bg-gray-100 border-gray-300'
          }`}>
            <h2 className="text-2xl font-semibold text-purple-400 mb-4">
              {isCreating
                ? "Create New Stop"
                : selectedStop
                ? "Edit Stop"
                : "Select a Stop"}
            </h2>

            {(isCreating || selectedStop) ? (
              <>
                {/* Map Click Mode Toggle */}
                <div className={`mb-4 rounded-lg p-3 border ${
                  isDarkMode
                    ? 'bg-gray-600 border-gray-500'
                    : 'bg-gray-200 border-gray-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Input Mode:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMapClickMode(!mapClickMode)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          mapClickMode
                            ? 'bg-purple-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {mapClickMode ? 'Click Map' : 'Manual Input'}
                      </button>
                      {tempMarker && (
                        <button
                          type="button"
                          onClick={() => setTempMarker(null)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                          title="Clear marker"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {mapClickMode
                      ? 'Click on the map below to set coordinates'
                      : 'Enter coordinates manually in the fields'}
                  </p>
                </div>

                {/* Map View */}
                {mapClickMode && isMounted && (
                  <div className={`mb-4 rounded-lg border overflow-hidden ${
                    isDarkMode
                      ? 'bg-gray-600 border-gray-500'
                      : 'bg-gray-200 border-gray-300'
                  }`} style={{ height: '500px' }}>
                    <MapContainer
                      center={tempMarker ? [tempMarker.lat, tempMarker.lng] : (selectedStop ? [selectedStop.lat, selectedStop.lng] : mapCenter)}
                      zoom={15}
                      minZoom={10}
                      maxZoom={20}
                      style={{ height: '100%', width: '100%' }}
                    >
                      {/* Google Maps Layer */}
                      {googleMapsKey ? (
                        <TileLayer
                          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                          url={`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleMapsKey}`}
                          maxZoom={20}
                        />
                      ) : (
                        <TileLayer
                          attribution='&copy; Google Maps'
                          url={`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`}
                          maxZoom={20}
                        />
                      )}
                      <MapClickHandler onMapClick={handleMapClick} enabled={mapClickMode} />
                      {tempMarker && (
                        <Marker 
                          position={[tempMarker.lat, tempMarker.lng]}
                          icon={new Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                            iconSize: [35, 57],
                            iconAnchor: [17, 57],
                            popupAnchor: [1, -45],
                            shadowSize: [57, 57]
                          })}
                          eventHandlers={{
                            click: () => {
                              setTempMarker(null);
                              setLat("");
                              setLng("");
                            }
                          }}
                        />
                      )}
                      {selectedStop && !isCreating && showSelectedMarker && (
                        <Marker 
                          key={selectedStop._id} 
                          position={[selectedStop.lat, selectedStop.lng]}
                          icon={new Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                            iconSize: [35, 57],
                            iconAnchor: [17, 57],
                            popupAnchor: [1, -45],
                            shadowSize: [57, 57]
                          })}
                          eventHandlers={{
                            click: () => {
                              setShowSelectedMarker(false);
                            }
                          }}
                        />
                      )}
                    </MapContainer>
                  </div>
                )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className={`rounded-lg p-4 border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Stop Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkMode
                        ? 'bg-gray-600 border border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., SM Fairview Terminal"
                    required
                  />
                </div>

                {/* Latitude Field */}
                <div className={`rounded-lg p-4 border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className={`w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkMode
                        ? 'bg-gray-600 border border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., 14.7150"
                    required
                  />
                </div>

                {/* Longitude Field */}
                <div className={`rounded-lg p-4 border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className={`w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDarkMode
                        ? 'bg-gray-600 border border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., 121.0940"
                    required
                  />
                </div>

                {/* Color Picker */}
                <div className={`rounded-lg p-4 border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Marker Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className={`h-10 w-20 rounded cursor-pointer border ${
                        isDarkMode
                          ? 'bg-gray-600 border-gray-500'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className={`flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        isDarkMode
                          ? 'bg-gray-600 border border-gray-500 text-white'
                          : 'bg-white border border-gray-300 text-gray-900'
                      }`}
                      placeholder="#FF5733"
                    />
                  </div>
                </div>

                {/* Passing Routes - Multi-Select Checkbox Group */}
                <div className={`rounded-lg p-4 border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                }`}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Passing Routes
                  </label>
                  <div className={`border rounded-lg p-4 max-h-64 overflow-y-auto custom-scrollbar ${
                    isDarkMode
                      ? 'bg-gray-600 border-gray-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}>
                    {routes && routes.length > 0 ? (
                      <div className="space-y-2">
                        {routes.map((route) => (
                          <label
                            key={route._id}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                              isDarkMode
                                ? 'hover:bg-gray-700'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedRoutes.includes(route.name)}
                              onChange={() => handleRouteToggle(route.name)}
                              className={`w-5 h-5 rounded text-purple-500 focus:ring-2 focus:ring-purple-500 cursor-pointer ${
                                isDarkMode
                                  ? 'bg-gray-600 border-gray-500'
                                  : 'bg-white border-gray-300'
                              }`}
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div
                                className="w-4 h-4 rounded-full border border-white"
                                style={{ backgroundColor: route.color }}
                              ></div>
                              <span className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {route.name}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-center py-4 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No routes available. Create routes first.
                      </p>
                    )}
                  </div>
                  {selectedRoutes.length > 0 && (
                    <div className={`mt-2 text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Selected: {selectedRoutes.length} route(s)
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg font-semibold"
                  >
                    {isCreating ? "Create Stop" : "Update Stop"}
                  </button>

                  {!isCreating && selectedStop && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg font-semibold"
                    >
                      Delete
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-6 py-3 rounded-lg transition-all font-semibold ${
                      isDarkMode
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
              </>
            ) : (
              <div className={`text-center py-16 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-24 h-24 mx-auto mb-4 opacity-50"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <p className="text-lg">
                  Select a stop from the list or create a new one
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${isDarkMode ? '#374151' : '#e5e7eb'};
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? '#6b7280' : '#9ca3af'};
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          }
        `}</style>
      </div>
  );
};

export default StopManager;
