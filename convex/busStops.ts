import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addBusStop = mutation({
  args: {
    name: v.string(),
    lat: v.number(),
    lng: v.number(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const busStopId = await ctx.db.insert("busStops", {
      name: args.name,
      lat: args.lat,
      lng: args.lng,
      color: args.color,
    });
    return busStopId;
  },
});

export const getAllBusStops = query({
  handler: async (ctx) => {
    const busStops = await ctx.db.query("busStops").collect();
    return busStops;
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
