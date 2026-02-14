# PharmaNear - Testing Guide

## ✅ FIXED: Google Maps Error - Now Using FREE Leaflet + OpenStreetMap!

All Google Maps API references have been removed. The app now uses **Leaflet.js + OpenStreetMap** which is completely **FREE** with **NO API KEY REQUIRED**.

---

## 🧪 How to Test the App

### Step 1: Open the Application
- Open `index.html` in your web browser (Chrome, Firefox, Edge, Safari)
- You should see the PharmaNear header with:
  - Emergency Mode toggle (checkbox)
  - Pharmacy Login link
  - Medicine Search section
  - Location Finder section

### Step 2: Test Medicine Search
1. In the "Search Medicine" section, type one of these medicine names:
   - `Paracetamol` (pain/fever relief)
   - `Amoxicillin` (antibiotic)
   - `Adrenaline` (emergency medicine)
2. Click "Search" button
3. You should see the medicine details (Uses, Category, Side Effects)
4. A "Locate Medicine" button will appear

### Step 3: Test Location & Map (THE MAIN FIX!)
1. Click "Locate Medicine" button to scroll to location section
2. The form shows: District, Place, Pincode fields
3. Click **"Use GPS"** button to:
   - Auto-detect your location (will ask permission)
   - OR use Bangalore as default if GPS denied
4. **The OpenStreetMap (Leaflet) should now display:**
   - Blue circle = Your location
   - Green circles = Open pharmacies
   - Red circles = Closed pharmacies
   - Click any marker to see pharmacy details

### Step 4: Test Pharmacy Portal
1. Click "Pharmacy Login" link in header
2. Enter any email and password (demo accepts anything)
3. Click Login to see the stock update form
4. Enter medicine name and stock count
5. Click "Update Stock" - should show success message

### Step 5: Test Emergency Mode
1. Go back to index.html
2. Check the "Emergency Mode" checkbox
3. Now search for medicine - only emergency medicines appear (Paracetamol, Adrenaline)

---

## 📍 Sample Pharmacies (Bangalore Area)

The app includes 5 sample pharmacies:

| Name | Status | Distance (approx) |
|------|--------|----------|
| Green Pharmacy | OPEN | 0 km (main location) |
| HealthPlus | OPEN | 0.5 km |
| MediCare | CLOSED | 3 km |
| Apollo Pharmacy | OPEN | 4 km |
| Care Pharmacy | OPEN | 5 km |

---

## 📝 What Changed (Google Maps → Leaflet)

### ❌ REMOVED:
- `script src="https://maps.googleapis.com/maps/api/js?key=..."`
- Google Places API code
- All Firebase integration (optional)
- API key requirements

### ✅ ADDED:
- Leaflet CSS: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css`
- Leaflet JS: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js`
- OpenStreetMap tiles (completely free)
- Client-side pharmacy database filtering
- Distance calculation: `distance = sqrt((lat2-lat1)² + (lng2-lng1)²) * 111`

---

## 🚀 Files Overview

| File | Purpose | Status |
|------|---------|--------|
| index.html | Main user page | ✅ Updated with Leaflet |
| pharmacy.html | Pharmacy login page | ✅ Updated with Leaflet |
| app.js | All interactive logic | ✅ Completely rewritten for Leaflet |
| style.css | Responsive styling | ✅ Complete |
| firebase.js | Firebase config (optional) | Code present, not required |
| app_new.js | Old intermediate file | ⚠️ Can be deleted |

---

## 🔧 Troubleshooting

### Map Not Showing?
1. **Check Browser Console** (F12 → Console tab)
2. **Verify Leaflet loaded**: Check if `L` object is available
3. **Allow location access** when browser asks for GPS
4. **Try different location**: If GPS fails, app uses Bangalore as default

### Medicines Not Found?
- Available medicines: Paracetamol, Amoxicillin, Adrenaline (case-insensitive)
- In Emergency Mode, only Paracetamol and Adrenaline appear

### Pharmacies Not Showing?
- Default search radius is 5 km
- The 5 sample pharmacies are in Bangalore area (latitude 12.97°, longitude 77.59°)
- To add more pharmacies, edit the `pharmacyDatabase` array in app.js

---

## 📦 Adding More Pharmacies

Edit `app.js` and add to the `pharmacyDatabase` array:

```javascript
const pharmacyDatabase = [
    // ... existing entries ...
    {
        name: "Your Pharmacy Name",
        lat: 12.9700,      // latitude
        lng: 77.5900,      // longitude
        address: "Your Address",
        isOpen: true,      // true = OPEN, false = CLOSED
        phone: "9876543210"
    }
];
```

Get coordinates from: https://www.google.com/maps (right-click on location → coordinates appear)

---

## 🎯 Features

✅ Medicine Search with Details
✅ GPS-based Location Detection (Geolocation API)
✅ OpenStreetMap Integration (Leaflet.js)
✅ Nearby Pharmacy Finder (5 km radius)
✅ Status Indicators (Open/Closed)
✅ Emergency Mode Toggle
✅ Responsive Design (Mobile & Desktop)
✅ Notify Me Form (for unavailable medicines)
✅ Pharmacy Portal (Demo)
✅ NO API KEYS NEEDED!

---

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Maps**: Leaflet.js v1.9.4 (free, no API key)
- **Tiles**: OpenStreetMap (free)
- **Location**: HTML5 Geolocation API
- **Optional**: Firebase (for auth/database)

---

## 📞 Need Help?

1. Check browser console for errors (F12 → Console)
2. Verify all files (index.html, app.js, style.css) are in same folder
3. Ensure you're opening `index.html` in a browser, not an IDE
4. Check if Leaflet library loads: Open DevTools → Network tab → look for leaflet files

---

**Status: ✅ WORKING - No Google Maps API errors!**
