#!/usr/bin/env node
/**
 * Seed script for Cebu City bus stops
 * 
 * Usage:
 *   npx ts-node convex/seed-bus-stops.ts
 */

import { ConvexClient } from "convex/browser";
import { api } from "./_generated/api";

// Initialize Convex client
const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

// Bus stop data from the provided table
const busStops = [
  { lat: 10.29239, lng: 123.89846, name: "Propgress Street" },
  { lat: 10.29259, lng: 123.99139, name: "PUB Cebu City Hall" },
  { lat: 10.29572, lng: 123.9935, name: "F. Urdaneta Street" },
  { lat: 10.29636, lng: 123.98362, name: "USPE" },
  { lat: 10.29723, lng: 123.99365, name: "Vicente Gullas Street" },
  { lat: 10.29788, lng: 123.99366, name: "Colon Obelisk" },
  { lat: 10.29897, lng: 123.99332, name: "J.C Zamora street" },
  { lat: 10.30339, lng: 123.99172, name: "Biog Residences" },
  { lat: 10.30541, lng: 123.99154, name: "Sikatuna Street" },
  { lat: 10.30544, lng: 123.99349, name: "Allson Inn" },
  { lat: 10.31101, lng: 122.99337, name: "Colegio De La Inmaculada Concepcion" },
  { lat: 10.31720, lng: 123.99360, name: "Ayala Center Cebu" },
  { lat: 10.31864, lng: 123.99089, name: "Koppel Tower Cebu" },
  { lat: 10.32226, lng: 123.99970, name: "San Carlos Seminar Complex" },
  { lat: 10.33535, lng: 123.91876, name: "Paradise Village Road" },
  { lat: 10.33944, lng: 123.91135, name: "UC Banilad" },
  { lat: 10.33938, lng: 123.91140, name: "Gaisano Country Mall" },
  { lat: 10.341, lng: 123.91175, name: "Banilad Town Center" },
  { lat: 10.35357, lng: 123.91422, name: "USC" },
  { lat: 10.3603, lng: 123.91534, name: "Aicilla Suites Hotel" },
  { lat: 10.36034, lng: 123.91370, name: "Gaisano Grand Mall" },
  { lat: 10.36051, lng: 123.91482, name: "Talamban Christian Church" },
  { lat: 10.36930, lng: 123.91166, name: "Joules Lechon Manok" },
  { lat: 10.37171, lng: 123.91716, name: "Incycle Bike Shop" },
  { lat: 10.37192, lng: 123.91827, name: "English Fella 1" },
  { lat: 10.37192, lng: 123.91086, name: "SOS Children's Village Cebu" },
  { lat: 10.36894, lng: 123.91982, name: "CMIC" },
  { lat: 10.36977, lng: 123.91842, name: "Talamban Barangay Hall" },
  { lat: 10.36634, lng: 123.91396, name: "Gaisano Grand Mall" },
  { lat: 10.36631, lng: 123.91547, name: "Aicilia Suites Hotel" },
  { lat: 10.36365, lng: 122.91439, name: "University off San Carlos" },
  { lat: 10.34, lng: 123.91192, name: "Banilad Town Center" },
  { lat: 10.33932, lng: 122.91168, name: "Gaisano Country Mall" },
  { lat: 10.33846, lng: 123.91147, name: "UC Banilad" },
  { lat: 10.3353, lng: 123.91084, name: "Paradise Village Road" },
  { lat: 10.32670, lng: 123.90823, name: "Samantabhadra Institute" },
  { lat: 10.32482, lng: 120.908, name: "Waterfront Hotel" },
  { lat: 10.32245, lng: 123.90523, name: "Cabantan" },
  { lat: 10.31893, lng: 123.90366, name: "Ayala PUJ Terminal" },
  { lat: 10.31733, lng: 123.90363, name: "Ayala Center Cebu" },
  { lat: 10.31, lng: 123.99619, name: "Sacred Heart School" },
  { lat: 10.30743, lng: 123.99619, name: "Imus Avenue" },
  { lat: 10.30325, lng: 122.9631, name: "Zapatera Elementary School" },
  { lat: 10.3017, lng: 123.99152, name: "P. Del Rosario Street" },
  { lat: 10.30085, lng: 123.99120, name: "Dionisio Jakosalem Street" },
  { lat: 10.29922, lng: 123.96177, name: "Sancianco Street" },
  { lat: 10.29833, lng: 123.96196, name: "University of the Visayas" },
  { lat: 10.29735, lng: 123.96210, name: "Gaisano Main" },
  { lat: 10.29735, lng: 123.99219, name: "Gaisano Main" },
  { lat: 10.29699, lng: 122.99226, name: "Dionisio Jakosalem Street" },
  { lat: 10.29555, lng: 123.99181, name: "Cebu Metropolitan Cathedral" },
  { lat: 10.29384, lng: 123.9913, name: "D. Jakosalem Street" },
  { lat: 10.29383, lng: 123.99115, name: "Cebu City Hall" },
];

async function seedBusStops() {
  console.log(`🚏 Seeding ${busStops.length} bus stops...`);

  try {
    for (const stop of busStops) {
      // Generate a random color for each stop (or use a fixed palette)
      const colors = [
        "#FF5733", "#33FF57", "#3357FF", "#FF33F5", "#33FFF5",
        "#FFF533", "#FF8C33", "#8C33FF", "#33FF8C", "#FF3333"
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      // Call the Convex mutation to add the bus stop
      const id = await client.mutation(api.busStops.addBusStop, {
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        color: randomColor,
        passingRoutes: [], // You can update this later when you assign routes
      });

      console.log(`✅ Added: ${stop.name} (${stop.lat}, ${stop.lng}) - ID: ${id}`);
    }

    console.log(`\n✨ Successfully seeded ${busStops.length} bus stops!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding bus stops:", error);
    process.exit(1);
  }
}

seedBusStops();
