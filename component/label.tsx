"use client"
import { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function LabelPage() {
  const [activeTab, setActiveTab] = useState<'busStops' | 'jeepneys'>('busStops');
  
  // Fetch data
  const busStops = useQuery(api.busStops.getAllBusStops);
  const jeepneys = useQuery(api.gps.getJeepneysWithLocations);
  
  // Mutations (you'll need to create these in Convex)
  // const updateBusStop = useMutation(api.busStops.updateBusStop);
  // const updateJeepney = useMutation(api.gps.updateJeepney);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Data Labeling Interface</h1>
        
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('busStops')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'busStops'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Bus Stops
          </button>
          <button
            onClick={() => setActiveTab('jeepneys')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'jeepneys'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Jeepneys
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === 'busStops' && (
            <BusStopsLabeling busStops={busStops} />
          )}
          
          {activeTab === 'jeepneys' && (
            <JeepneysLabeling jeepneys={jeepneys} />
          )}
        </div>
      </div>
    </div>
  );
}

// Bus Stops Labeling Component
function BusStopsLabeling({ busStops }: { busStops: any[] | undefined }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', lat: 0, lng: 0, color: '' });

  const handleEdit = (stop: any) => {
    setEditingId(stop._id);
    setEditForm({
      name: stop.name,
      lat: stop.lat,
      lng: stop.lng,
      color: stop.color,
    });
  };

  const handleSave = async () => {
    // TODO: Implement mutation to update bus stop
    // await updateBusStop({ id: editingId as Id<"busStops">, ...editForm });
    console.log('Saving:', editingId, editForm);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  if (!busStops) return <div>Loading bus stops...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Label Bus Stops</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latitude
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Longitude
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {busStops.map((stop) => (
              <tr key={stop._id}>
                {editingId === stop._id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.000001"
                        value={editForm.lat}
                        onChange={(e) => setEditForm({ ...editForm, lat: parseFloat(e.target.value) })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.000001"
                        value={editForm.lng}
                        onChange={(e) => setEditForm({ ...editForm, lng: parseFloat(e.target.value) })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.color}
                        onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">{stop.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stop.lat.toFixed(6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{stop.lng.toFixed(6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: stop.color }}
                        />
                        {stop.color}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(stop)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Jeepneys Labeling Component
function JeepneysLabeling({ jeepneys }: { jeepneys: any[] | undefined }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ jeepneyId: '', plateNumber: '', passengerCount: 0 });

  const handleEdit = (jeep: any) => {
    setEditingId(jeep._id);
    setEditForm({
      jeepneyId: jeep.jeepneyId,
      plateNumber: jeep.plateNumber,
      passengerCount: jeep.passengerCount,
    });
  };

  const handleSave = async () => {
    // TODO: Implement mutation to update jeepney
    // await updateJeepney({ id: editingId as Id<"jeepneys">, ...editForm });
    console.log('Saving:', editingId, editForm);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  if (!jeepneys) return <div>Loading jeepneys...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Label Jeepneys</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jeepney ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plate Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Passenger Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jeepneys.map((jeep) => (
              <tr key={jeep._id}>
                {editingId === jeep._id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.jeepneyId}
                        onChange={(e) => setEditForm({ ...editForm, jeepneyId: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.plateNumber}
                        onChange={(e) => setEditForm({ ...editForm, plateNumber: e.target.value })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editForm.passengerCount}
                        onChange={(e) => setEditForm({ ...editForm, passengerCount: parseInt(e.target.value) })}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={handleSave}
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">{jeep.jeepneyId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{jeep.plateNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{jeep.passengerCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(jeep)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
