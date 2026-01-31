"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import StopManager from "./stopManager";
import dynamic from "next/dynamic";

// Dynamically import RouteManager with SSR disabled (Leaflet requires client-side rendering)
const RouteManager = dynamic(() => import("./routeManager"), {
  ssr: false,
});

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
  const [activeTab, setActiveTab] = useState<'jeepneys' | 'stopmanager' | 'routes'>('stopmanager');
  const [isDarkMode, setIsDarkMode] = useState(true);

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full border border-gray-700">
          <div className="text-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-blue-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-gray-300 mt-2 font-semibold">Please enter the password to continue</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="Enter password"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-400 text-sm mt-2">{passwordError}</p>
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
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Bus Stop Admin Panel</h1>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-3 py-2 sm:px-4 rounded-md font-medium transition-all ${
                isDarkMode
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                  : 'bg-gray-800 hover:bg-gray-900 text-white border border-gray-600'
              }`}
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <a 
              href="/" 
              className={`px-3 py-2 sm:px-4 rounded-md transition-colors border whitespace-nowrap ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600'
                  : 'bg-white text-gray-900 hover:bg-gray-100 border-gray-300'
              }`}
            >
              ← Back to Map
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => setActiveTab('jeepneys')}
            className={`flex-1 py-3 px-4 sm:px-6 rounded-lg font-medium transition-all text-center ${
              activeTab === 'jeepneys'
                ? 'bg-blue-600 text-white'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            🚍 Jeepneys
          </button>
          <button
            onClick={() => setActiveTab('stopmanager')}
            className={`flex-1 py-3 px-4 sm:px-6 rounded-lg font-medium transition-all text-center ${
              activeTab === 'stopmanager'
                ? 'bg-blue-600 text-white'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            📍 Stop Manager
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex-1 py-3 px-4 sm:px-6 rounded-lg font-medium transition-all text-center ${
              activeTab === 'routes'
                ? 'bg-blue-600 text-white'
                : isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            🗺️ Routes
          </button>
        </div>
        
        {/* Add Sample Jeepney Data */}
        <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-green-700">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-white">🚍 Test Jeepney Data</h2>
          <p className="text-gray-300 mb-3 sm:mb-4 text-sm">
            Add sample jeepney with location history that passes through your bus stops. This helps you test the 1km scanning feature.
          </p>
          <button
            onClick={handleAddSampleData}
            disabled={isSampleLoading}
            className="w-full bg-green-600 text-white py-2.5 sm:py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isSampleLoading ? "Adding Sample Data..." : "➕ Add Sample Jeepney"}
          </button>
          {sampleMessage && (
            <div className={`mt-3 sm:mt-4 p-3 rounded-md text-sm ${
              sampleMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {sampleMessage}
            </div>
          )}
        </div>
        
        {/* Conditional Content Based on Active Tab */}
        {activeTab === 'routes' && (
          <RouteManager isDarkMode={isDarkMode} />
        )}
        
        {activeTab === 'stopmanager' && (
          <StopManager isDarkMode={isDarkMode} />
        )}
        
        {activeTab === 'jeepneys' && (
          <>
            {/* Add/Edit Jeepney Form */}
            <div className={`rounded-lg shadow-lg p-6 mb-8 border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-300'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {editingJeepney ? "Edit Jeepney" : "Add New Jeepney"}
              </h2>
              <form onSubmit={handleJeepneySubmit} className="space-y-4">
                <div>
                  <label htmlFor="jeepneyId" className={`block text-sm font-bold mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Jeepney ID
                  </label>
                  <input
                    type="text"
                    id="jeepneyId"
                    value={jeepneyId}
                    onChange={(e) => setJeepneyId(e.target.value)}
                    disabled={!!editingJeepney}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 disabled:bg-gray-800'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 disabled:bg-gray-100'
                    }`}
                    placeholder="e.g., Jeep-01"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="plateNumber" className={`block text-sm font-bold mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Plate Number
                    </label>
                    <input
                      type="text"
                      id="plateNumber"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="e.g., ABC-123"
                    />
                  </div>

                  <div>
                    <label htmlFor="routeNumber" className={`block text-sm font-bold mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Route Number
                    </label>
                    <input
                      type="text"
                      id="routeNumber"
                      value={routeNumber}
                      onChange={(e) => setRouteNumber(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="e.g., 04C, 62D"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="operator" className={`block text-sm font-bold mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Operator/Company
                  </label>
                  <input
                    type="text"
                    id="operator"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., ABC Transport Cooperative"
                  />
                </div>

                <div>
                  <label htmlFor="jeepneyColor" className={`block text-sm font-bold mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Marker Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="jeepneyColor"
                      value={jeepneyColor}
                      onChange={(e) => setJeepneyColor(e.target.value)}
                      className={`h-10 w-20 border rounded cursor-pointer ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                    <span className={`font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{jeepneyColor}</span>
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
                      className={`px-4 py-2 rounded-md transition-colors font-medium ${
                        isDarkMode
                          ? 'bg-gray-500 text-white hover:bg-gray-600'
                          : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
                      }`}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List of Jeepneys */}
            <div className={`rounded-lg shadow-lg p-6 border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-300'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Registered Jeepneys</h2>
              
              {!allJeepneys ? (
                <p className={`font-bold ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Loading...</p>
              ) : allJeepneys.length === 0 ? (
                <p className={`font-bold ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>No jeepneys added yet.</p>
              ) : (
                <div className="space-y-3">
                  {allJeepneys.map((jeep) => (
                    <div
                      key={jeep._id}
                      className={`flex items-center justify-between p-4 border rounded-md transition-colors ${
                        isDarkMode
                          ? 'border-gray-700 hover:bg-gray-700 bg-gray-750'
                          : 'border-gray-300 hover:bg-gray-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: jeep.color || "#10b981" }}
                        >
                          {jeep.routeNumber || "?"}
                        </div>
                        <div>
                          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {jeep.routeNumber} - {jeep.plateNumber}
                          </h3>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
      </div>
    </div>
  );
};

export default AdminPage;
