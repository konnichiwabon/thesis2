import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveLocation = mutation({
  args: {
    jeepneyId: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    passengersIn: v.optional(v.number()), 
    passengersOut: v.optional(v.number()),
    // plateNumber is optional — admin panel controls it, Pi doesn't need to send it
    plateNumber: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const pIn = args.passengersIn ?? 0;
    const pOut = args.passengersOut ?? 0;

    const currentJeepStatus = await ctx.db
      .query("jeepneys")
      .filter((q) => q.eq(q.field("jeepneyId"), args.jeepneyId))
      .first();

    const currentCount = currentJeepStatus?.passengerCount ?? 0;
    const maxLoad = currentJeepStatus?.maxLoad ?? 40;
    let newTotal = currentCount + pIn - pOut;
    if (newTotal < 0) newTotal = 0;
    if (newTotal > maxLoad) newTotal = maxLoad;

    if (currentJeepStatus) {
      // Update passenger count, timestamp, and latest GPS position
      await ctx.db.patch(currentJeepStatus._id, {
        passengerCount: newTotal,
        lastUpdated: Date.now(),
        lat: args.latitude,
        lng: args.longitude,
      });
    } else {
      // First time seeing this jeep — create with minimal data
      await ctx.db.insert("jeepneys", {
        jeepneyId: args.jeepneyId,
        plateNumber: args.plateNumber ?? "UNREGISTERED",
        passengerCount: newTotal,
        lastUpdated: Date.now(),
        lat: args.latitude,
        lng: args.longitude,
      });
    }

    await ctx.db.insert("locations", {
      jeepneyId: args.jeepneyId,
      lat: args.latitude,
      lng: args.longitude,
      passengersIn: pIn,
      passengersOut: pOut,
      totalPassengers: newTotal,
      timestamp: Date.now(),
    });

    return "Jeep status updated!";
  },
});

// Reset passenger count to 0 for a specific jeepney
export const resetPassengerCount = mutation({
  args: {
    jeepneyId: v.string(),
  },
  handler: async (ctx, args) => {
    const jeep = await ctx.db
      .query("jeepneys")
      .filter((q) => q.eq(q.field("jeepneyId"), args.jeepneyId))
      .first();

    if (!jeep) throw new Error(`Jeepney ${args.jeepneyId} not found`);

    await ctx.db.patch(jeep._id, {
      passengerCount: 0,
      lastUpdated: Date.now(),
    });

    return "Passenger count reset to 0";
  },
});

// NEW: This function fetches the latest status of all jeepneys
export const getJeepneys = query({
  args: {},
  handler: async (ctx) => {
    // This grabs every row in the 'jeepneys' table
    return await ctx.db.query("jeepneys").collect();
  },
});

// Get jeepneys with their latest location
export const getJeepneysWithLocations = query({
  args: {},
  handler: async (ctx) => {
    const jeepneys = await ctx.db.query("jeepneys").collect();

    return jeepneys
      .filter((jeep) => jeep.lat != null && jeep.lng != null)
      .map((jeep) => ({
        ...jeep,
        location: { lat: jeep.lat!, lng: jeep.lng! },
      }));
  },
});