// app.js - PharmaNear with Leaflet (OpenStreetMap - FREE, NO API KEY NEEDED!)

// --- Predefined medicine database ---
const medicines = [
    {
        name: "Paracetamol",
        uses: "Fever, mild pain relief",
        category: "Analgesic",
        sideEffects: "Nausea, rash, liver issues",
        emergency: true
    },
    {
        name: "Amoxicillin",
        uses: "Bacterial infections",
        category: "Antibiotic",
        sideEffects: "Diarrhea, allergic reactions",
        emergency: false
    },
    {
        name: "Adrenaline",
        uses: "Anaphylaxis, cardiac arrest",
        category: "Life-saving",
        sideEffects: "Palpitations, anxiety",
        emergency: true
    }
];

// --- Pharmacy Database (Add your own pharmacies here!) ---
const pharmacyDatabase = [
    {name: "Green Pharmacy", lat: 12.9716, lng: 77.5946, address: "Main Street, Bangalore", isOpen: true, phone: "9876543210"},
    {name: "HealthPlus", lat: 12.9700, lng: 77.5900, address: "Park Avenue, Bangalore", isOpen: true, phone: "9123456780"},
    {name: "MediCare", lat: 12.9750, lng: 77.5980, address: "Health Plaza, Bangalore", isOpen: false, phone: "9988776655"},
    {name: "Apollo Pharmacy", lat: 12.9680, lng: 77.5850, address: "Tech Park, Bangalore", isOpen: true, phone: "9876123456"},
    {name: "Care Pharmacy", lat: 12.9800, lng: 77.6000, address: "Medical Hub, Bangalore", isOpen: true, phone: "9654321098"}
];

// --- Utility functions ---
function showError(id, message) {
    const el = document.getElementById(id);
    if (el) el.textContent = message;
}
function hideSection(id) {
    document.getElementById(id).classList.add('hidden');
}
function showSection(id) {
    document.getElementById(id).classList.remove('hidden');
}

// --- Emergency Mode ---
let emergencyMode = false;
const emergencyToggle = document.getElementById('emergencyMode');
if (emergencyToggle) {
    emergencyToggle.addEventListener('change', () => {
        emergencyMode = emergencyToggle.checked;
    });
}

// --- Medicine Search ---
const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const query = document.getElementById('searchInput').value.trim().toLowerCase();
        const med = medicines.find(m => m.name.toLowerCase() === query && (!emergencyMode || m.emergency));
        const resultDiv = document.getElementById('medicineResult');
        if (!query) {
            showError('searchError', "Please enter a medicine name.");
            resultDiv.classList.add('hidden');
            return;
        }
        if (med) {
            resultDiv.innerHTML = `
                <div>
                    <h3>${med.name}</h3>
                    <p><strong>Uses:</strong> ${med.uses}</p>
                    <p><strong>Category:</strong> ${med.category}</p>
                    <p><strong>Common Side Effects:</strong> ${med.sideEffects}</p>
                    <button id="locateBtn">Locate Medicine</button>
                </div>
            `;
            resultDiv.classList.remove('hidden');
            showError('searchError', "");
            document.getElementById('locateBtn').onclick = () => {
                document.querySelector('.location-section').scrollIntoView({behavior: "smooth"});
            };
        } else {
            showError('searchError', "Medicine not found or not prioritized in Emergency Mode.");
            resultDiv.classList.add('hidden');
        }
    });
}

// --- Location & Map ---
let userLat = 12.9716, userLng = 77.5946; // Default: Bangalore
let map = null;

function autoDetectLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                document.getElementById('district').value = "GPS Detected";
                document.getElementById('place').value = "Auto";
                document.getElementById('pincode').value = "Auto";
                showError('searchError', 'Location detected! Search for medicine and click "Locate Medicine".');
            },
            () => {
                showError('searchError', 'Using Bangalore as default. Enable GPS for accurate results.');
            }
        );
    }
}

const gpsBtn = document.getElementById('gpsBtn');
if (gpsBtn) {
    gpsBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                searchNearbyPharmacies(userLat, userLng, 5);
            }, () => {
                showError('searchError', "GPS failed. Using Bangalore as default.");
                searchNearbyPharmacies(userLat, userLng, 5);
            });
        }
    });
}

// --- Search Nearby Pharmacies using Leaflet (OpenStreetMap) ---
function searchNearbyPharmacies(lat, lng, radiusKm = 5) {
    const mapDiv = document.getElementById('map');
    if (!window.L) {
        showError('searchError', 'Map library not loaded.');
        return;
    }
    
    // Remove old map
    if (map) {
        map.remove();
    }
    
    // Create OpenStreetMap using Leaflet (FREE - No API key needed!)
    map = L.map('map').setView([lat, lng], 14);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    }).addTo(map);
    
    // Add user location (blue circle)
    L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: '#0066ff',
        color: '#003399',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.8
    }).addTo(map).bindPopup('📍 Your Location');
    
    // Find pharmacies within radius
    const nearbyPharmacies = pharmacyDatabase.filter(pharm => {
        const distance = Math.sqrt(
            Math.pow(pharm.lat - lat, 2) + Math.pow(pharm.lng - lng, 2)
        ) * 111; // Rough km conversion
        pharm.distance = distance.toFixed(1); // Add distance property
        return distance <= radiusKm;
    });
    
    if (nearbyPharmacies.length === 0) {
        showError('searchError', 'No pharmacies found within ' + radiusKm + ' km. Try expanding search area.');
        showSection('askMeSection');
        return;
    }
    
    // Display pharmacies
    nearbyPharmacies.forEach(pharm => {
        // Green marker if open, red if closed
        const color = pharm.isOpen ? '#27ae60' : '#e74c3c';
        const icon = L.circleMarker([pharm.lat, pharm.lng], {\n            radius: 10,\n            fillColor: color,\n            color: color,\n            weight: 2,\n            opacity: 0.9,\n            fillOpacity: 0.8\n        }).addTo(map);\n        \n        icon.bindPopup(`\n            <div style=\"font-size: 12px;\">\n                <strong>${pharm.name}</strong><br>\n                ${pharm.address}<br>\n                Distance: ${pharm.distance} km<br>\n                Status: <span style=\"color: ${pharm.isOpen ? 'green' : 'red'};\">${pharm.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}</span><br>\n                Phone: ${pharm.phone}\n            </div>\n        `);\n    });\n    \n    // Display pharmacy list\n    const listDiv = document.getElementById('pharmacyList');\n    listDiv.innerHTML = nearbyPharmacies.map(pharm => `\n        <div class=\"pharmacy-card\" style=\"border-left: 5px solid ${pharm.isOpen ? '#27ae60' : '#e74c3c'}; padding: 12px; margin: 10px 0;\">\n            <strong>${pharm.name}</strong> (${pharm.distance} km)<br>\n            <small>${pharm.address}</small><br>\n            <div style=\"margin-top: 8px; font-size: 12px;\">\n                Status: <span style=\"color: ${pharm.isOpen ? 'green' : 'red'};\">${pharm.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}</span><br>\n                Phone: <strong>${pharm.phone}</strong>\n            </div>\n        </div>\n    `).join('');\n    \n    hideSection('askMeSection');\n    showError('searchError', 'Found ' + nearbyPharmacies.length + ' pharmacies nearby!');\n}\n\n// --- Location Form Submission ---\ndocument.getElementById('locationForm').addEventListener('submit', e => {\n    e.preventDefault();\n    searchNearbyPharmacies(userLat, userLng, 5);\n});\n\n// --- Notify Me (Ask Me to notify) ---\nconst askMeForm = document.getElementById('askMeForm');\nif (askMeForm) {\n    askMeForm.addEventListener('submit', e => {\n        e.preventDefault();\n        const email = document.getElementById('notifyEmail').value;\n        const phone = document.getElementById('notifyPhone').value;\n        if (!email) {\n            showError('askMeError', \"Email required.\");\n            return;\n        }\n        // In a real app, save to Firebase or backend\n        showError('askMeError', "");\n        document.getElementById('askMeSuccess').textContent = \"We'll notify you when available!\";\n        setTimeout(() => askMeForm.reset(), 2000);\n    });\n}\n\n// --- Pharmacy Login ---\nconst pharmacyLoginForm = document.getElementById('pharmacyLoginForm');\nif (pharmacyLoginForm) {\n    pharmacyLoginForm.addEventListener('submit', e => {\n        e.preventDefault();\n        const email = document.getElementById('pharmacyEmail').value;\n        hideSection('pharmacyLoginForm');\n        showSection('pharmacyDashboard');\n    });\n}\n\nconst pharmacyLogoutBtn = document.getElementById('pharmacyLogoutBtn');\nif (pharmacyLogoutBtn) {\n    pharmacyLogoutBtn.addEventListener('click', () => {\n        showSection('pharmacyLoginForm');\n        hideSection('pharmacyDashboard');\n        window.location.href = 'index.html';\n    });\n}\n\nconst stockForm = document.getElementById('stockForm');\nif (stockForm) {\n    stockForm.addEventListener('submit', e => {\n        e.preventDefault();\n        const med = document.getElementById('pharmacyMedicine').value;\n        const stock = document.getElementById('pharmacyStock').value;\n        document.getElementById('stockSuccess').textContent = med + ' stock updated!';\n        stockForm.reset();\n    });\n}\n\n// --- Initialize on page load ---\nwindow.addEventListener('load', () => {\n    autoDetectLocation();\n    // Initialize empty map\n    if (document.getElementById('map')) {\n        const mapDiv = document.getElementById('map');\n        mapDiv.innerHTML = '<div style=\"display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 14px;\">🗺️ Search for medicine and click \"Locate Medicine\" to see nearby pharmacies</div>';\n    }\n});
