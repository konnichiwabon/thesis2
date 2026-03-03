import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  jeepneys: defineTable({
    jeepneyId: v.string(),       // Internal ID (e.g., "Jeep-01")
    name: v.optional(v.string()),        // Display name (e.g., "Unit 1", "Dela Cruz")
    plateNumber: v.string(),     // Legal Plate (e.g., "GWH-123")
    routeNumber: v.optional(v.string()), // Display route number (e.g., "04C", "62D")
    color: v.optional(v.string()), // Custom color for the jeepney marker
    operator: v.optional(v.string()), // Operator/Company name
    driverName: v.optional(v.string()), // Driver's full name
    maxLoad: v.optional(v.number()),   // Max passenger capacity (default 40)
    passengerCount: v.number(),
    lastUpdated: v.number(),
    lat: v.optional(v.number()),  // Latest GPS latitude (editable in dashboard)
    lng: v.optional(v.number()),  // Latest GPS longitude (editable in dashboard)
  }).index("by_jeepneyId", ["jeepneyId"]),

  locations: defineTable({
    jeepneyId: v.string(),
    lat: v.number(),
    lng: v.number(),
    passengersIn: v.number(),
    passengersOut: v.number(),
    totalPassengers: v.number(),
    timestamp: v.number(),
  }).index("by_jeepneyId", ["jeepneyId"])
    .index("by_jeepneyId_timestamp", ["jeepneyId", "timestamp"]),

  busStops: defineTable({
    name: v.string(),
    lat: v.number(),
    lng: v.number(),
    color: v.string(), // e.g., "#FF5733"
    passingRoutes: v.optional(v.array(v.string())), // Array of route names (e.g., ["62B", "62C"])
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