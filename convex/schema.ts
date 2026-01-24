import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  jeepneys: defineTable({
    jeepneyId: v.string(),       // Internal ID (e.g., "Jeep-01")
    plateNumber: v.string(),     // NEW: Legal Plate (e.g., "GWH-123")
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
});