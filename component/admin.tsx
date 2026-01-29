"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [color, setColor] = useState("#FF5733");

  const addBusStop = useMutation(api.busStops.addBusStop);
  const busStops = useQuery(api.busStops.getAllBusStops);
  const deleteBusStop = useMutation(api.busStops.deleteBusStop);
  const addSampleData = useMutation(api.gps.addSampleJeepneyData);
  const clearAllJeepneys = useMutation(api.gps.clearAllJeepneys);
  
  // Jeepney management
  const addJeepney = useMutation(api.jeepneyManagement.addJeepney);
  const updateJeepney = useMutation(api.jeepneyManagement.updateJeepney);
  const deleteJeepney = useMutation(api.jeepneyManagement.deleteJeepney);
  const allJeepneys = useQuery(api.jeepneyManagement.getAllJeepneys);
  
  // Jeepney form states
  const [jeepneyId, setJeepneyId] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [routeNumber, setRouteNumber] = useState("");
  const [jeepneyColor, setJeepneyColor] = useState("#10b981");
  const [operator, setOperator] = useState("");
  const [editingJeepney, setEditingJeepney] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'busstops' | 'jeepneys'>('busstops');

  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [sampleMessage, setSampleMessage] = useState("");

  // Password check
  const ADMIN_PASSWORD = "admin123"; // Change this to your desired password

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
      setPasswordInput("");
    }
  };

  // Show password prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-700 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Admin Access</h1>
            <p className="text-gray-600 mt-2">Please enter the password to continue</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:text-blue-700 text-sm">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !latitude || !longitude) {
      alert("Please fill in all fields");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid numbers for latitude and longitude");
      return;
    }

    try {
      await addBusStop({
        name,
        lat,
        lng,
        color,
      });
      
      // Reset form
      setName("");
      setLatitude("");
      setLongitude("");
      setColor("#FF5733");
      
      alert("Bus stop added successfully!");
    } catch (error) {
      console.error("Error adding bus stop:", error);
      alert("Failed to add bus stop");
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to delete this bus stop?")) {
      try {
        await deleteBusStop({ id });
      } catch (error) {
        console.error("Error deleting bus stop:", error);
        alert("Failed to delete bus stop");
      }
    }
  };

  const handleAddSampleData = async () => {
    setIsSampleLoading(true);
    setSampleMessage("");
    try {
      const result = await addSampleData();
      setSampleMessage(`✅ ${result}`);
      setTimeout(() => setSampleMessage(""), 5000);
    } catch (error) {
      console.error("Error adding sample data:", error);
      setSampleMessage("❌ Failed to add sample data");
    } finally {
      setIsSampleLoading(false);
    }
  };

  const handleClearAllJeepneys = async () => {
    if (confirm("⚠️ Are you sure you want to delete ALL jeepneys and their location history?")) {
      setIsSampleLoading(true);
      setSampleMessage("");
      try {
        const result = await clearAllJeepneys();
        setSampleMessage(`✅ ${result}`);
        setTimeout(() => setSampleMessage(""), 5000);
      } catch (error) {
        console.error("Error clearing data:", error);
        setSampleMessage("❌ Failed to clear data");
      } finally {
        setIsSampleLoading(false);
      }
    }
  };

  const handleJeepneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jeepneyId || !plateNumber || !routeNumber || !operator) {
      alert("Please fill in all fields");
      return;
    }

    try {
      if (editingJeepney) {
        await updateJeepney({
          id: editingJeepney._id,
          plateNumber,
          routeNumber,
          color: jeepneyColor,
          operator,
        });
        alert("Jeepney updated successfully!");
        setEditingJeepney(null);
      } else {
        await addJeepney({
          jeepneyId,
          plateNumber,
          routeNumber,
          color: jeepneyColor,
          operator,
        });
        alert("Jeepney added successfully!");
      }
      
      // Reset form
      setJeepneyId("");
      setPlateNumber("");
      setRouteNumber("");
      setJeepneyColor("#10b981");
      setOperator("");
    } catch (error: any) {
      console.error("Error saving jeepney:", error);
      alert(error.message || "Failed to save jeepney");
    }
  };

  const handleEditJeepney = (jeep: any) => {
    setEditingJeepney(jeep);
    setJeepneyId(jeep.jeepneyId);
    setPlateNumber(jeep.plateNumber);
    setRouteNumber(jeep.routeNumber || "");
    setJeepneyColor(jeep.color || "#10b981");
    setOperator(jeep.operator || "");
    setActiveTab('jeepneys');
  };

  const handleDeleteJeepney = async (id: any) => {
    if (confirm("Are you sure you want to delete this jeepney?")) {
      try {
        await deleteJeepney({ id });
      } catch (error) {
        console.error("Error deleting jeepney:", error);
        alert("Failed to delete jeepney");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bus Stop Admin Panel</h1>
          <a 
            href="/" 
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            ← Back to Map
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('busstops')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'busstops'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🚏 Bus Stops
          </button>
          <button
            onClick={() => setActiveTab('jeepneys')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'jeepneys'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🚍 Jeepneys
          </button>
        </div>
        
        {/* Add Sample Jeepney Data */}
        <div className="bg-linear-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 mb-8 border-2 border-green-200">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">🚍 Test Jeepney Data</h2>
          <p className="text-gray-600 mb-4 text-sm">
            Add sample jeepney with location history that passes through your bus stops. This helps you test the 1km scanning feature.
          </p>
          <button
            onClick={handleAddSampleData}
            disabled={isSampleLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSampleLoading ? "Adding Sample Data..." : "➕ Add Sample Jeepney"}
          </button>
          {sampleMessage && (
            <div className={`mt-4 p-3 rounded-md ${
              sampleMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {sampleMessage}
            </div>
          )}
        </div>
        
        {/* Conditional Content Based on Active Tab */}
        {activeTab === 'jeepneys' && (
          <>
            {/* Add/Edit Jeepney Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {editingJeepney ? "Edit Jeepney" : "Add New Jeepney"}
              </h2>
              <form onSubmit={handleJeepneySubmit} className="space-y-4">
                <div>
                  <label htmlFor="jeepneyId" className="block text-sm font-medium text-gray-700 mb-1">
                    Jeepney ID
                  </label>
                  <input
                    type="text"
                    id="jeepneyId"
                    value={jeepneyId}
                    onChange={(e) => setJeepneyId(e.target.value)}
                    disabled={!!editingJeepney}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="e.g., Jeep-01"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="plateNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Plate Number
                    </label>
                    <input
                      type="text"
                      id="plateNumber"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., ABC-123"
                    />
                  </div>

                  <div>
                    <label htmlFor="routeNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Route Number
                    </label>
                    <input
                      type="text"
                      id="routeNumber"
                      value={routeNumber}
                      onChange={(e) => setRouteNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 04C, 62D"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="operator" className="block text-sm font-medium text-gray-700 mb-1">
                    Operator/Company
                  </label>
                  <input
                    type="text"
                    id="operator"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., ABC Transport Cooperative"
                  />
                </div>

                <div>
                  <label htmlFor="jeepneyColor" className="block text-sm font-medium text-gray-700 mb-1">
                    Marker Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="jeepneyColor"
                      value={jeepneyColor}
                      onChange={(e) => setJeepneyColor(e.target.value)}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-gray-600">{jeepneyColor}</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setJeepneyColor("#10b981")} className="px-3 py-1 bg-green-500 rounded text-white text-sm">Green</button>
                      <button type="button" onClick={() => setJeepneyColor("#f59e0b")} className="px-3 py-1 bg-yellow-500 rounded text-white text-sm">Yellow</button>
                      <button type="button" onClick={() => setJeepneyColor("#ef4444")} className="px-3 py-1 bg-red-500 rounded text-white text-sm">Red</button>
                      <button type="button" onClick={() => setJeepneyColor("#3b82f6")} className="px-3 py-1 bg-blue-500 rounded text-white text-sm">Blue</button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingJeepney ? "Update Jeepney" : "Add Jeepney"}
                  </button>
                  {editingJeepney && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingJeepney(null);
                        setJeepneyId("");
                        setPlateNumber("");
                        setRouteNumber("");
                        setJeepneyColor("#10b981");
                        setOperator("");
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List of Jeepneys */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Registered Jeepneys</h2>
              
              {!allJeepneys ? (
                <p className="text-gray-500">Loading...</p>
              ) : allJeepneys.length === 0 ? (
                <p className="text-gray-500">No jeepneys added yet.</p>
              ) : (
                <div className="space-y-3">
                  {allJeepneys.map((jeep) => (
                    <div
                      key={jeep._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: jeep.color || "#10b981" }}
                        >
                          {jeep.routeNumber || "?"}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {jeep.routeNumber} - {jeep.plateNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ID: {jeep.jeepneyId} | Operator: {jeep.operator || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditJeepney(jeep)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteJeepney(jeep._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'busstops' && (
          <>
        {/* Add Bus Stop Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Bus Stop</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Bus Stop Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., SM City Bus Stop"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  id="latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10.3157"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  id="longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 123.8854"
                />
              </div>
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Circle Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-gray-600">{color}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Add Bus Stop
            </button>
          </form>
        </div>

        {/* List of Bus Stops */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Bus Stops</h2>
          
          {!busStops ? (
            <p className="text-gray-500">Loading...</p>
          ) : busStops.length === 0 ? (
            <p className="text-gray-500">No bus stops added yet.</p>
          ) : (
            <div className="space-y-3">
              {busStops.map((stop) => (
                <div
                  key={stop._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-8 h-8 rounded-full border-2"
                      style={{ backgroundColor: stop.color, borderColor: stop.color }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">{stop.name}</h3>
                      <p className="text-sm text-gray-500">
                        Lat: {stop.lat.toFixed(4)}, Lng: {stop.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(stop._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
