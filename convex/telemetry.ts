import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Required by Convex client (v1.31+) for internal telemetry
export const send = mutation({
  args: {
    payload: v.any(),
  },
  handler: async (_ctx, _args) => {
    // No-op: telemetry data is intentionally not stored
    return null;
  },
});
    