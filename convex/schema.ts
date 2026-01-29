import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  jeepneys: defineTable({
    jeepneyId: v.string(),       // Internal ID (e.g., "Jeep-01")
    plateNumber: v.string(),     // Legal Plate (e.g., "GWH-123")
    routeNumber: v.optional(v.string()), // Display route number (e.g., "04C", "62D")
    color: v.optional(v.string()), // Custom color for the jeepney marker
    operator: v.optional(v.string()), // Operator/Company name
    passengerCount: v.number(),
    lastUpdated: v.number(),
  }).index("by_jeepneyId", ["jeepneyId"]),

  locations: defineTable({
    // ... (rest of your location fields stay the same)
    jeepneyId: v.string(),
    lat: v.number(),
    lng: v.number(),
    passengersIn: v.number(),
    passengersOut: v.number(),
    totalPassengers: v.number(),
    timestamp: v.number(),
  }).index("by_jeepneyId", ["jeepneyId"]),

  busStops: defineTable({
    name: v.string(),
    lat: v.number(),
    lng: v.number(),
    color: v.string(), // e.g., "#FF5733"
  }),

  routes: defineTable({
    name: v.string(),              // Route name (e.g., "Pasay - Alabang")
    color: v.string(),             // Display color for the route
    waypoints: v.array(            // Original clicked waypoints
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    geometry: v.array(             // OSRM-generated road-following coordinates
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    distance: v.number(),          // Total distance in meters
    duration: v.number(),          // Estimated duration in seconds
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),
});