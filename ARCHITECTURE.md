# Jeepney Tracking System - Architecture Documentation

## 📊 Data Flow Architecture

### 1. Data Structure (Schema)

#### TypeScript Interfaces (`types/jeepney.ts`)

```typescript
// STATIC DATA (Updates infrequently)
interface JeepneyStaticData {
  routeNumber: string;    // "04C", "62D"
  plateNumber: string;    // "ABC-123"
  maxLoad: number;        // 40
  operator?: string;      // "PITAMCO"
  color?: string;         // "#10b981"
}

// DYNAMIC DATA (Updates every ~5 seconds)
interface JeepneyDynamicData {
  passengerCount: number; // Current passengers
  latitude: number;       // GPS coordinate
  longitude: number;      // GPS coordinate
  lastUpdated: number;    // Timestamp
}
```

#### Convex Database Schema (`convex/schema.ts`)

```typescript
jeepneys: defineTable({
  jeepneyId: v.string(),
  plateNumber: v.string(),
  routeNumber: v.optional(v.string()),
  color: v.optional(v.string()),
  operator: v.optional(v.string()),
  passengerCount: v.number(),
  lastUpdated: v.number(),
})

locations: defineTable({
  jeepneyId: v.string(),
  lat: v.number(),
  lng: v.number(),
  passengersIn: v.number(),
  passengersOut: v.number(),
  totalPassengers: v.number(),
  timestamp: v.number(),
})
```

---

## 🔄 Real-Time Data Synchronization

### Convex Query Hook (Auto-updates every ~5 seconds)

```typescript
// app/page.tsx
const jeepneysData = useQuery(api.gps.getJeepneysWithLocations);
```

This hook:
- ✅ Fetches all jeepneys with their latest location
- ✅ Automatically re-queries when data changes
- ✅ Provides real-time updates without manual refresh
- ✅ Prevents flickering with React state management

---

## 🗺️ Map & Marker System

### Component Hierarchy

```
app/page.tsx
  ↓
MapComponent (component/map.tsx)
  ↓
JeepneyMarker (component/jeepneyMarker.tsx)
  ↓
JeepMarkerPopup (Leaflet Popup)
  ↓
PopupCard (component/popupcard.tsx)
```

### Implementation (`component/jeepneyMarker.tsx`)

```typescript
export default function JeepneyMarker({ jeep, onClick }) {
  return (
    <Marker position={jeep.position} icon={customIcon}>
      <Popup>
        <PopupCard
          route={jeep.id}
          plateNumber={jeep.plateNumber}
          currentLoad={jeep.passengerCount}
          status={jeep.status}
          colorTheme={jeep.colorTheme}
          onViewMoreDetails={() => onClick(jeep)}
        />
      </Popup>
    </Marker>
  );
}
```

### Marker Features

1. **Custom Icon**: Shows route number (e.g., "01A", "02B")
2. **Color-Coded**: Green/Orange/Red/Purple based on passenger load
3. **Click Interaction**: Opens popup with jeep details
4. **Blue Pulse Animation**: Highlights jeepneys near selected bus stop

---

## 🎠 Carousel Synchronization

### Carousel Component (`component/carousel.tsx`)

```typescript
<Carousel
  items={carouselItems}
  onItemClick={(item) => {
    // Find jeep from Convex data
    const jeep = jeepneysData?.find(j => j.jeepneyId === item.route);
    if (jeep && jeep.location) {
      // Sync with map
      setMapCenter([jeep.location.lat, jeep.location.lng]);
      setSelectedJeep(jeep);
      setShowCardBox(true);
    }
  }}
/>
```

### Data Transformation

```typescript
// Convert Convex data → Carousel format
const carouselItems = jeepneysData?.map((jeep, index) => ({
  id: index + 1,
  route: jeep.jeepneyId,
  plateNumber: jeep.plateNumber,
  currentLoad: jeep.passengerCount,
  maxLoad: 40,
  status: getStatus(jeep.passengerCount),
  colorTheme: getColorTheme(jeep.passengerCount)
})) || [];

// Convert Convex data → Map markers
const jeepLocations = jeepneysData?.filter(jeep => jeep.location).map(jeep => ({
  id: jeep.jeepneyId,
  plateNumber: jeep.plateNumber,
  routeNumber: jeep.routeNumber,
  passengerCount: jeep.passengerCount,
  position: [jeep.location.lat, jeep.location.lng],
  colorTheme: getColorTheme(jeep.passengerCount),
  status: getStatus(jeep.passengerCount),
  color: jeep.color,
})) || [];
```

---

## 🔗 Connection Flow

### 1. Carousel → Map → Popup → CardBox

```
USER ACTION: Click carousel card
  ↓
HANDLER: onItemClick
  ↓
ACTION: Find jeep in jeepneysData
  ↓
ACTION: setMapCenter([lat, lng])
  ↓
ACTION: setSelectedJeep(jeep)
  ↓
ACTION: setShowCardBox(true)
  ↓
RESULT: CardBox opens with jeep details
```

### 2. Map Marker → Popup → CardBox

```
USER ACTION: Click map marker
  ↓
ACTION: Leaflet opens popup automatically
  ↓
DISPLAY: PopupCard component renders
  ↓
USER ACTION: Click "View more details" button
  ↓
HANDLER: onViewMoreDetails
  ↓
ACTION: markerRef.current.closePopup()
  ↓
ACTION: onClick(jeep)
  ↓
ACTION: setShowCardBox(true)
  ↓
RESULT: Popup closes, CardBox opens
```

### 3. Bus Stop → Scan → Show Nearby Jeepneys

```
USER ACTION: Click bus stop marker
  ↓
HANDLER: handleBusStopClick
  ↓
ACTION: setBusStopCoords({ lat, lng })
  ↓
TRIGGER: nearbyJeepneysData query (1km radius)
  ↓
FILTER: Only jeeps that passed within 50m
  ↓
DISPLAY: Blue banner with jeep count
  ↓
VISUAL: Jeep markers turn blue with pulse animation
  ↓
USER ACTION: Click jeep from banner
  ↓
RESULT: CardBox opens with jeep details
```

---

## ⚡ Real-Time Update Handling

### Smooth UI Updates (No Flickering)

```typescript
// Keep selectedJeep in sync with Convex data
useEffect(() => {
  if (selectedJeep && jeepneysData && !isUpdating) {
    const updatedJeep = jeepneysData.find(j => j.jeepneyId === selectedJeep.jeepneyId);
    if (updatedJeep && updatedJeep.passengerCount !== selectedJeep.passengerCount) {
      setSelectedJeep(updatedJeep);
    }
  }
}, [jeepneysData, isUpdating]);

// Update nearby jeepneys when query results change
useEffect(() => {
  if (nearbyJeepneysData) {
    setNearbyJeepneys(nearbyJeepneysData);
  }
}, [nearbyJeepneysData]);
```

---

## 📦 Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `app/page.tsx` | Main logic, state management, Convex queries |
| `component/map.tsx` | Map container, renders markers |
| `component/jeepneyMarker.tsx` | Individual jeep marker with popup |
| `component/carousel.tsx` | Horizontal scrollable jeep cards |
| `component/cardBox.tsx` | Detailed jeep info with passenger controls |
| `component/popupcard.tsx` | Quick info popup on marker click |
| `component/busStopPopup.tsx` | Bus stop details with nearby jeeps |

---

## 🎯 Key Features Implemented

✅ **Real-time updates** via Convex useQuery (~5 second refresh)  
✅ **Synchronized data** between Map, Carousel, and CardBox  
✅ **No flickering** - smooth UI transitions  
✅ **Color-coded markers** - based on passenger load  
✅ **Custom route numbers** - displayed on markers  
✅ **Click interactions** - Carousel → Map, Map → Popup → CardBox  
✅ **Bus stop scanning** - Find jeepneys within 1km radius  
✅ **Location history tracking** - Detect jeeps that passed through stops  
✅ **Editable jeep config** - Admin panel to add/edit jeepneys  

---

## 🚀 Usage Flow

1. **View All Jeepneys**: Carousel shows all active jeepneys
2. **Click Carousel Card**: Map zooms to jeep, opens CardBox
3. **Click Map Marker**: Popup shows quick info
4. **Click "View Details"**: Popup closes, CardBox opens
5. **Click Bus Stop**: Scans 1km, shows nearby jeepneys
6. **Real-time Updates**: All components update automatically

---

## 📝 Data Update Flow

```
ESP32/GPS Device (Hardware)
  ↓ HTTP POST
Convex Mutation (api.gps.saveLocation)
  ↓ Updates Database
Convex Query (auto-refresh)
  ↓ React useQuery Hook
State Update (jeepneysData)
  ↓ React Re-render
UI Components Update (Map + Carousel)
```

---

This architecture ensures:
- ✅ Single source of truth (Convex database)
- ✅ Automatic synchronization across all components
- ✅ Scalable to handle many jeepneys simultaneously
- ✅ Real-time updates without manual refresh
- ✅ Clean separation of concerns
