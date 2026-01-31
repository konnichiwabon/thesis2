import { mutation, query } from "./_generated/server";
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

// Helper function to generate random plate number
function generatePlateNumber(): string {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ"; // Excluding I, O, Q
  const numbers = "0123456789";
  
  let plate = "";
  for (let i = 0; i < 3; i++) {
    plate += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  plate += "-";
  for (let i = 0; i < 3; i++) {
    plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return plate;
}

// Mutation to add sample test data with multiple random jeepneys
export const addSampleJeepneyData = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all bus stops from database
    const allBusStops = await ctx.db.query("busStops").collect();
    
    if (allBusStops.length === 0) {
      return "❌ No bus stops found! Please add bus stops first.";
    }
    
    // Create 5-10 random jeepneys
    const numberOfJeepneys = Math.floor(Math.random() * 6) + 8; // 8 to 13 jeepneys
    const createdJeepneys = [];
    
    for (let i = 0; i < numberOfJeepneys; i++) {
      const jeepneyId = `Jeep-${String(i + 1).padStart(2, '0')}`;
      const plateNumber = generatePlateNumber();
      const passengerCount = Math.floor(Math.random() * 40); // 0 to 40 passengers
      
      // Randomly select 1-3 bus stops this jeep will pass through
      const numStopsToPass = Math.floor(Math.random() * 3) + 1;
      const shuffledStops = [...allBusStops].sort(() => Math.random() - 0.5);
      const selectedStops = shuffledStops.slice(0, numStopsToPass);
      
      // Create location history
      const locations = [];
      const baseTime = Date.now() - 3600000; // Start 1 hour ago
      
      selectedStops.forEach((stop, stopIndex) => {
        const timeOffset = stopIndex * 1200000; // 20 minutes between stops
        
        // Approaching the stop (200-500m away)
        const approachDistance = (Math.random() * 0.003) + 0.002; // 200-500m
        const approachAngle = Math.random() * Math.PI * 2;
        locations.push({
          lat: stop.lat + Math.cos(approachAngle) * approachDistance,
          lng: stop.lng + Math.sin(approachAngle) * approachDistance,
          passengers: passengerCount,
          time: baseTime + timeOffset,
        });
        
        // Near the stop (50-100m away)
        const nearDistance = (Math.random() * 0.0005) + 0.0005;
        locations.push({
          lat: stop.lat + Math.cos(approachAngle) * nearDistance,
          lng: stop.lng + Math.sin(approachAngle) * nearDistance,
          passengers: passengerCount,
          time: baseTime + timeOffset + 300000, // 5 min later
        });
        
        // At the stop (within 50m) - passengers get on/off
        const passengersChange = Math.floor(Math.random() * 10) - 5; // -5 to +5
        const newPassengerCount = Math.max(0, Math.min(40, passengerCount + passengersChange));
        
        locations.push({
          lat: stop.lat + (Math.random() * 0.0004 - 0.0002),
          lng: stop.lng + (Math.random() * 0.0004 - 0.0002),
          passengers: newPassengerCount,
          time: baseTime + timeOffset + 600000, // 10 min later
        });
        
        // Leaving the stop
        const leaveDistance = (Math.random() * 0.003) + 0.002;
        const leaveAngle = Math.random() * Math.PI * 2;
        locations.push({
          lat: stop.lat + Math.cos(leaveAngle) * leaveDistance,
          lng: stop.lng + Math.sin(leaveAngle) * leaveDistance,
          passengers: newPassengerCount,
          time: baseTime + timeOffset + 900000, // 15 min later
        });
      });
      
      // Current location - randomly within 300-900m of one of the stops it passed
      const randomStop = selectedStops[Math.floor(Math.random() * selectedStops.length)];
      const currentDistance = (Math.random() * 0.006) + 0.003; // 300-900m
      const currentAngle = Math.random() * Math.PI * 2;
      locations.push({
        lat: randomStop.lat + Math.cos(currentAngle) * currentDistance,
        lng: randomStop.lng + Math.sin(currentAngle) * currentDistance,
        passengers: passengerCount,
        time: Date.now(),
      });
      
      // Insert or update jeepney
      const existingJeep = await ctx.db
        .query("jeepneys")
        .filter((q) => q.eq(q.field("jeepneyId"), jeepneyId))
        .first();
      
      if (!existingJeep) {
        await ctx.db.insert("jeepneys", {
          jeepneyId,
          plateNumber,
          routeNumber: `${String(i + 1).padStart(2, '0')}${String.fromCharCode(65 + (i % 26))}`, // e.g., "01A", "02B"
          color: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'][i % 5],
          operator: ['PITAMCO', 'CITRASCO', 'Metro Transport', 'City Express', 'Urban Transit'][i % 5],
          passengerCount: locations[locations.length - 1].passengers,
          lastUpdated: Date.now(),
        });
      } else {
        await ctx.db.patch(existingJeep._id, {
          plateNumber,
          routeNumber: `${String(i + 1).padStart(2, '0')}${String.fromCharCode(65 + (i % 26))}`,
          color: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'][i % 5],
          operator: ['PITAMCO', 'CITRASCO', 'Metro Transport', 'City Express', 'Urban Transit'][i % 5],
          passengerCount: locations[locations.length - 1].passengers,
          lastUpdated: Date.now(),
        });
      }
      
      // Insert location history
      for (const loc of locations) {
        await ctx.db.insert("locations", {
          jeepneyId,
          lat: loc.lat,
          lng: loc.lng,
          passengersIn: 0,
          passengersOut: 0,
          totalPassengers: loc.passengers,
          timestamp: loc.time,
        });
      }
      
      createdJeepneys.push({
        id: jeepneyId,
        plate: plateNumber,
        stops: selectedStops.map(s => s.name).join(", "),
      });
    }
    
    return `✅ Created ${numberOfJeepneys} jeepneys with random routes passing through your bus stops!`;
  },
});

// Mutation to clear all sample jeepney data
export const clearAllJeepneys = mutation({
  args: {},
  handler: async (ctx) => {
    const jeepneys = await ctx.db.query("jeepneys").collect();
    const locations = await ctx.db.query("locations").collect();
    
    for (const jeep of jeepneys) {
      await ctx.db.delete(jeep._id);
    }
    
    for (const loc of locations) {
      await ctx.db.delete(loc._id);
    }
    
    return `✅ Cleared ${jeepneys.length} jeepneys and ${locations.length} location records`;
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
    
    const jeepneysWithLocations = await Promise.all(
      jeepneys.map(async (jeep) => {
        // Get the most recent location for this jeep
        const latestLocation = await ctx.db
          .query("locations")
          .filter((q) => q.eq(q.field("jeepneyId"), jeep.jeepneyId))
          .order("desc")
          .first();
        
        return {
          ...jeep,
          location: latestLocation ? {
            lat: latestLocation.lat,
            lng: latestLocation.lng,
          } : null,
        };
      })
    );
    
    return jeepneysWithLocations.filter((jeep) => jeep.location !== null);
  },
});