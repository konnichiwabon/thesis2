import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const saveLocation = mutation({
  args: {
    jeepneyId: v.string(),
    
    // 1. NEW ARGUMENT: Accept the plate number
    plateNumber: v.string(),
    
    latitude: v.number(),
    longitude: v.number(),
    passengersIn: v.optional(v.number()), 
    passengersOut: v.optional(v.number()),
  },

  handler: async (ctx, args) => {
    const pIn = args.passengersIn ?? 0;
    const pOut = args.passengersOut ?? 0;

    const currentJeepStatus = await ctx.db
      .query("jeepneys")
      .filter((q) => q.eq(q.field("jeepneyId"), args.jeepneyId))
      .first();

    const currentCount = currentJeepStatus?.passengerCount ?? 0;
    let newTotal = currentCount + pIn - pOut;
    if (newTotal < 0) newTotal = 0;

    if (currentJeepStatus) {
      // 2. UPDATE: Even if the jeep exists, we update the plate number
      // (Just in case it was entered wrong the first time)
      await ctx.db.patch(currentJeepStatus._id, {
        passengerCount: newTotal,
        plateNumber: args.plateNumber, // <--- Saving it here
        lastUpdated: Date.now(),
      });
    } else {
      // 3. CREATE: When we see a new jeep, we save its plate number
      await ctx.db.insert("jeepneys", {
        jeepneyId: args.jeepneyId,
        plateNumber: args.plateNumber, // <--- Saving it here
        passengerCount: newTotal,
        lastUpdated: Date.now(),
      });
    }

    // (The location history log doesn't strictly NEED the plate number, 
    // because we can always look it up using the jeepneyId later)
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


import { query } from "./_generated/server";

// ... your saveLocation mutation is above here ...

// NEW: This function fetches the latest status of all jeepneys
export const getJeepneys = query({
  args: {},
  handler: async (ctx) => {
    // This grabs every row in the 'jeepneys' table
    return await ctx.db.query("jeepneys").collect();
  },
});