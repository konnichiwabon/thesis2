import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new jeepney route with waypoints and geometry
 */
export const createRoute = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    waypoints: v.array(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    geometry: v.array(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    distance: v.number(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const routeId = await ctx.db.insert("routes", {
      name: args.name,
      color: args.color,
      waypoints: args.waypoints,
      geometry: args.geometry,
      distance: args.distance,
      duration: args.duration,
      createdAt: now,
      updatedAt: now,
    });

    return routeId;
  },
});

/**
 * Update an existing route
 */
export const updateRoute = mutation({
  args: {
    id: v.id("routes"),
    name: v.string(),
    color: v.string(),
    waypoints: v.array(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    geometry: v.array(
      v.object({
        lat: v.number(),
        lng: v.number(),
      })
    ),
    distance: v.number(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      color: args.color,
      waypoints: args.waypoints,
      geometry: args.geometry,
      distance: args.distance,
      duration: args.duration,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Delete a route
 */
export const deleteRoute = mutation({
  args: {
    id: v.id("routes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Get all routes
 */
export const getAllRoutes = query({
  args: {},
  handler: async (ctx) => {
    const routes = await ctx.db.query("routes").collect();
    return routes;
  },
});

/**
 * Get a single route by ID
 */
export const getRouteById = query({
  args: {
    id: v.id("routes"),
  },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.id);
    return route;
  },
});

/**
 * Get route by name
 */
export const getRouteByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const route = await ctx.db
      .query("routes")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    return route;
  },
});
