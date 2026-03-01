# Raspberry Pi 5 — Data Requirements

## Convex Endpoint

```
Method:  POST
URL:     https://good-bear-283.convex.cloud/api/mutation
Header:  Content-Type: application/json
```

---

## JSON Body to Send

```json
{
  "path": "gps:saveLocation",
  "args": {
    "jeepneyId":      "Jeep-01",
    "latitude":       10.3157,
    "longitude":      123.8854,
    "passengersIn":   2,
    "passengersOut":  1
  }
}
```

---

## Field Reference

### Required (send every update)

| Field | Type | Example | Source |
|-------|------|---------|--------|
| `jeepneyId` | string | `"Jeep-01"` | Hardcoded in Pi script — **must match Admin Panel** |
| `latitude` | number | `10.3157` | GPS module |
| `longitude` | number | `123.8854` | GPS module |

### Optional (only send when passengers board/exit)

| Field | Type | Example | Source |
|-------|------|---------|--------|
| `passengersIn` | number | `2` | Passenger sensor (how many boarded) |
| `passengersOut` | number | `1` | Passenger sensor (how many exited) |

### Controlled by Admin Panel (DO NOT send from Pi)

| Field | Set via |
|-------|---------|
| `plateNumber` | Admin Panel → Jeepneys tab |
| `routeNumber` | Admin Panel → Jeepneys tab |
| `operator` | Admin Panel → Jeepneys tab |
| `maxLoad` | Admin Panel → Jeepneys tab |
| `color` | Admin Panel → Jeepneys tab |

> If `passengersIn` and `passengersOut` are omitted, the passenger count stays the same and only the GPS location updates.

---

## How Passenger Count Works

```
current count + passengersIn - passengersOut = new total
```

| Pi sends | Effect |
|----------|--------|
| `passengersIn: 2` | Count goes **up** by 2 |
| `passengersOut: 1` | Count goes **down** by 1 |
| `passengersIn: 2, passengersOut: 1` | Count goes **up** by 1 |
| Neither field | Count **stays the same** |

> ⚠️ Send the number that boarded/exited **since the last update**, NOT the total.

---

## Map Color by Passenger Load

| Passengers | Color | Status |
|-----------|-------|--------|
| 0 – 13 | 🟢 Green | Low |
| 14 – 26 | 🟠 Orange | Moderate |
| 27 – 40 | 🔴 Red | High |
| 40+ | 🟣 Purple | Overloaded |

---

## What the Pi Needs

| Component | Purpose |
|-----------|---------|
| GPS module (e.g., NEO-6M) | Provides `latitude` and `longitude` |
| Internet connection (WiFi / hotspot / SIM) | Sends data to Convex |
| Passenger sensor *(optional)* | Provides `passengersIn` / `passengersOut` |
| Python 3 + `requests` library | Makes the HTTP POST request |

---

## Minimum Setup to Show on Map

1. GPS module is connected and outputting coordinates
2. Pi has internet access
3. Jeepney is registered in the Admin Panel at `/admin`
4. `jeepneyId` in the Pi script **exactly matches** the one registered in Admin Panel

---

## Quick Checklist Before Testing

- [ ] Jeepney registered in Admin Panel (`/admin` → 🚍 Jeepneys tab)
- [ ] `jeepneyId` in Pi script matches exactly (case-sensitive)
- [ ] Pi is connected to the internet
- [ ] GPS module is outputting valid coordinates
- [ ] Web app is running (`npm run dev`)
