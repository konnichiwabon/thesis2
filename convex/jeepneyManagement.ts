import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a new jeepney
export const addJeepney = mutation({
  args: {
    jeepneyId: v.string(),
    plateNumber: v.string(),
    routeNumber: v.string(),
    color: v.string(),
    operator: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if jeepney already exists
    const existing = await ctx.db
      .query("jeepneys")
      .filter((q) => q.eq(q.field("jeepneyId"), args.jeepneyId))
      .first();
    
    if (existing) {
      throw new Error("Jeepney with this ID already exists");
    }

    const jeepneyId = await ctx.db.insert("jeepneys", {
      jeepneyId: args.jeepneyId,
      plateNumber: args.plateNumber,
      routeNumber: args.routeNumber,
      color: args.color,
      operator: args.operator,
      passengerCount: 0,
      lastUpdated: Date.now(),
    });
    
    return jeepneyId;
  },
});

// Update an existing jeepney
export const updateJeepney = mutation({
  args: {
    id: v.id("jeepneys"),
    plateNumber: v.optional(v.string()),
    routeNumber: v.optional(v.string()),
    color: v.optional(v.string()),
    operator: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      lastUpdated: Date.now(),
    });
    
    return id;
  },
});

// Delete a jeepney
export const deleteJeepney = mutation({
  args: {
    id: v.id("jeepneys"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get all jeepneys with their configurations
export const getAllJeepneys = query({
  handler: async (ctx) => {
    const jeepneys = await ctx.db.query("jeepneys").collect();
    return jeepneys;
  },
});
