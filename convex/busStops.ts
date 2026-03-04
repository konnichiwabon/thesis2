import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addBusStop = mutation({
  args: {
    name: v.string(),
    lat: v.number(),
    lng: v.number(),
    color: v.string(),
    passingRoutes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const busStopId = await ctx.db.insert("busStops", {
      name: args.name,
      lat: args.lat,
      lng: args.lng,
      color: args.color,
      passingRoutes: args.passingRoutes,
    });
    return busStopId;
  },
});

export const batchAddBusStops = mutation({
  args: {
    busStops: v.array(
      v.object({
        name: v.string(),
        lat: v.number(),
        lng: v.number(),
        color: v.optional(v.string()),
        passingRoutes: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    const colors = [
      "#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#33FFF5",
      "#FFF533", "#FF8C33", "#8C33FF", "#33FF8C", "#FF3333"
    ];

    for (let i = 0; i < args.busStops.length; i++) {
      const stop = args.busStops[i];
      const color = stop.color || colors[i % colors.length];
      
      const id = await ctx.db.insert("busStops", {
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        color,
        passingRoutes: stop.passingRoutes || [],
      });
      ids.push(id);
    }

    return { inserted: ids.length, ids };
  },
});

export const getAllBusStops = query({
  handler: async (ctx) => {
    const busStops = await ctx.db.query("busStops").collect();
    return busStops;
  },
});

export const updateBusStop = mutation({
  args: {
    id: v.id("busStops"),
    name: v.string(),
    lat: v.number(),
    lng: v.number(),
    color: v.string(),
    passingRoutes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      lat: args.lat,
      lng: args.lng,
      color: args.color,
      passingRoutes: args.passingRoutes,
    });
    return args.id;
  },
});

export const deleteBusStop = mutation({
  args: {
    id: v.id("busStops"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Calculate distance between two coordinates in meters using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Query to find jeepneys within 1km of a bus stop
export const getNearbyJeepneysAtBusStop = query({
  args: {
    busStopLat: v.number(),
    busStopLng: v.number(),
    radiusMeters: v.optional(v.number()), // Default to 1000m (1km)
  },
  handler: async (ctx, args) => {
    const radius = args.radiusMeters || 1000; // 1km default
    
    // Get all jeepneys
    const allJeepneys = await ctx.db.query("jeepneys").collect();
    
    // For each jeepney, check if their current location is within radius
    const nearbyJeepneys = allJeepneys.map((jeep) => {
      // Use lat/lng stored directly on the jeepney record (updated on every GPS ping)
      if (jeep.lat == null || jeep.lng == null) return null;

      const currentDistance = calculateDistance(
        args.busStopLat,
        args.busStopLng,
        jeep.lat,
        jeep.lng
      );

      if (currentDistance <= radius) {
        return {
          ...jeep,
          location: { lat: jeep.lat, lng: jeep.lng },
          distanceFromBusStop: Math.round(currentDistance),
        };
      }

      return null;
    });
    
    // Filter out null values and sort by distance
    return nearbyJeepneys
      .filter((jeep): jeep is NonNullable<typeof jeep> => jeep !== null)
      .sort((a, b) => a.distanceFromBusStop - b.distanceFromBusStop);
  },
});
