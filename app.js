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

// --- Pharmacy Database (Enhanced with Opening Hours & Stock) ---
const pharmacyDatabase = [
    {
        name: "Green Pharmacy",
        lat: 12.9716,
        lng: 77.5946,
        address: "Main Street, Bangalore",
        isOpen: true,
        phone: "9876543210",
        openTime: "9:00 AM",
        closeTime: "10:00 PM",
        rating: 4.5,
        stock: {"Paracetamol": 25, "Amoxicillin": 10, "Adrenaline": 5}
    },
    {
        name: "HealthPlus",
        lat: 12.9700,
        lng: 77.5900,
        address: "Park Avenue, Bangalore",
        isOpen: true,
        phone: "9123456780",
        openTime: "8:00 AM",
        closeTime: "9:00 PM",
        rating: 4.2,
        stock: {"Paracetamol": 15, "Amoxicillin": 0, "Adrenaline": 8}
    },
    {
        name: "MediCare",
        lat: 12.9750,
        lng: 77.5980,
        address: "Health Plaza, Bangalore",
        isOpen: false,
        phone: "9988776655",
        openTime: "10:00 AM",
        closeTime: "8:00 PM",
        rating: 3.9,
        stock: {"Paracetamol": 10, "Amoxicillin": 5, "Adrenaline": 0}
    },
    {
        name: "Apollo Pharmacy",
        lat: 12.9680,
        lng: 77.5850,
        address: "Tech Park, Bangalore",
        isOpen: true,
        phone: "9876123456",
        openTime: "8:30 AM",
        closeTime: "10:30 PM",
        rating: 4.7,
        stock: {"Paracetamol": 30, "Amoxicillin": 12, "Adrenaline": 7}
    },
    {
        name: "Care Pharmacy",
        lat: 12.9800,
        lng: 77.6000,
        address: "Medical Hub, Bangalore",
        isOpen: true,
        phone: "9654321098",
        openTime: "9:30 AM",
        closeTime: "9:30 PM",
        rating: 4.3,
        stock: {"Paracetamol": 20, "Amoxicillin": 6, "Adrenaline": 3}
    }
];

// --- Global variable to track selected medicine ---
let selectedMedicineForOrder = null;

// --- Utility functions ---
function showError(id, message) {
    const el = document.getElementById(id);
    if (el) el.textContent = message;
}
function showSuccess(id, message) {
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
            selectedMedicineForOrder = med.name;
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
let userLat = 12.9716, userLng = 77.5946;
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
// --- Search Nearby Pharmacies using Google Maps ---
function searchNearbyPharmacies(lat, lng, radiusKm = 5) {
    const mapDiv = document.getElementById('map');
    if (!window.google || !window.google.maps) {
        showError('searchError', 'Google Maps library not loaded.');
        return;
    }
    
    // Create Google Map with better styling for pharmacy search
    map = new google.maps.Map(mapDiv, {
        zoom: 14,
        center: { lat: lat, lng: lng },
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#f5f5f5' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#d9d9d9' }]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#e0f2f7' }]
            }
        ]
    });
    
    // Add user location marker (blue)
    const userMarker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: 'Your Location',
        zIndex: 1000,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#0066ff',
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 3
        }
    });
    
    // Add search radius circle overlay
    new google.maps.Circle({
        map: map,
        center: { lat: lat, lng: lng },
        radius: radiusKm * 1000, // Convert km to meters
        fillColor: '#1abc9c',
        fillOpacity: 0.08,
        strokeColor: '#1abc9c',
        strokeWeight: 2,
        strokeOpacity: 0.4,
        zIndex: 100
    });
    
    // Find pharmacies within radius
    const nearbyPharmacies = pharmacyDatabase.filter(pharm => {
        const distance = Math.sqrt(
            Math.pow(pharm.lat - lat, 2) + Math.pow(pharm.lng - lng, 2)
        ) * 111;
        pharm.distance = distance.toFixed(1);
        return distance <= radiusKm;
    });
    
    if (nearbyPharmacies.length === 0) {
        showError('searchError', 'No pharmacies found within ' + radiusKm + ' km. Try expanding search area.');
        showSection('askMeSection');
        return;
    }
    
    // Display pharmacies on map with medicine symbol markers
    nearbyPharmacies.forEach((pharm, index) => {
        const isOpen = pharm.isOpen;
        const color = isOpen ? '#27ae60' : '#e74c3c';
        
        // Create SVG medicine/pill icon for pharmacy marker
        const medicineIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="40" height="40">
                <!-- Pill shape background -->
                <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.5"/>
                    </filter>
                </defs>
                <!-- Main pill/medicine capsule -->
                <ellipse cx="50" cy="25" rx="18" ry="22" fill="${color}" filter="url(#shadow)"/>
                <ellipse cx="50" cy="75" rx="18" ry="22" fill="${color}" filter="url(#shadow)"/>
                <rect x="32" y="25" width="36" height="50" fill="${color}" filter="url(#shadow)"/>
                <!-- White stripe on pill -->
                <line x1="50" y1="15" x2="50" y2="85" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <!-- Number label -->
                <circle cx="50" cy="50" r="8" fill="white" opacity="0.9"/>
                <text x="50" y="54" font-size="14" font-weight="bold" text-anchor="middle" fill="${color}">${index + 1}</text>
            </svg>
        `;
        
        // Create marker with medicine icon
        const marker = new google.maps.Marker({
            position: { lat: pharm.lat, lng: pharm.lng },
            map: map,
            title: pharm.name,
            icon: {
                url: 'data:image/svg+xml;base64,' + btoa(medicineIcon),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20)
            }
        });
        
        // Enhanced popup with detailed information
        const medicineStatus = selectedMedicineForOrder ? 
            `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
                <strong>💊 ${selectedMedicineForOrder}:</strong> 
                ${pharm.stock[selectedMedicineForOrder] > 0 ? 
                    `<span style="color: #27ae60;">✓ Available (${pharm.stock[selectedMedicineForOrder]} units)</span>` : 
                    `<span style="color: #e74c3c;">✗ Out of Stock</span>`
                }
            </div>` : '';
        
        const bgColor = isOpen ? '#d4edda' : '#f8d7da';
        
        const infoWindowContent = `
            <div style="font-family: Arial, sans-serif; width: 300px;">
                <strong style="font-size: 16px; color: #222;">💊 ${pharm.name}</strong>
                <div style="color: #666; font-size: 13px; margin-top: 6px;">⭐ Rating: ${pharm.rating}</div>
                <div style="color: #666; font-size: 13px;">📍 ${pharm.address}</div>
                <div style="color: #666; font-size: 13px;">📏 ${pharm.distance} km away</div>
                
                <div style="margin: 10px 0; padding: 10px; background: ${bgColor}; border-radius: 6px; border-left: 3px solid ${color};">
                    <div style="font-weight: bold; color: ${color};">${isOpen ? '✓ OPEN NOW' : '✗ CLOSED'}</div>
                    <div style="font-size: 12px; color: #555; margin-top: 4px;">🕐 ${pharm.openTime} - ${pharm.closeTime}</div>
                </div>
                
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
                    <div><strong>📞 Phone:</strong></div>
                    <a href="tel:${pharm.phone}" style="color: #1abc9c; text-decoration: none; font-weight: bold;">${pharm.phone}</a>
                </div>
                ${medicineStatus}
            </div>
        `;
        
        const infoWindow = new google.maps.InfoWindow({
            content: infoWindowContent
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
    
    // Auto-fit all pharmacies in the map view (with user location)
    if (nearbyPharmacies.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: lat, lng: lng }); // Add user location
        
        nearbyPharmacies.forEach(pharm => {
            bounds.extend({ lat: pharm.lat, lng: pharm.lng });
        });
        
        map.fitBounds(bounds, { padding: 100 }); // Add 100px padding for better view
        
        // Set maximum zoom to 16 so it doesn't zoom in too much
        const listener = map.addListener('bounds_changed', () => {
            if (map.getZoom() > 16) {
                map.setZoom(16);
            }
            google.maps.event.removeListener(listener);
        });
    }
    
    // Display pharmacy list with medicine availability
    const listDiv = document.getElementById('pharmacyList');
    
    // Create stock availability summary after map
    let stockSummaryHTML = '';
    if (selectedMedicineForOrder) {
        const totalPharmacies = nearbyPharmacies.length;
        const availablePharmacies = nearbyPharmacies.filter(p => p.stock[selectedMedicineForOrder] > 0).length;
        const openAvailablePharmacies = nearbyPharmacies.filter(p => p.isOpen && p.stock[selectedMedicineForOrder] > 0).length;
        const totalStock = nearbyPharmacies.reduce((sum, p) => sum + (p.stock[selectedMedicineForOrder] || 0), 0);
        
        let summaryColor = '#e74c3c';
        let summaryStatus = '✗ NOT AVAILABLE';
        let summaryIcon = '⚠️';
        if (openAvailablePharmacies > 0) {
            summaryColor = '#27ae60';
            summaryStatus = '✓ AVAILABLE';
            summaryIcon = '✓';
        } else if (availablePharmacies > 0) {
            summaryColor = '#f39c12';
            summaryStatus = '⏰ AVAILABLE (STORES CLOSED)';
            summaryIcon = '⏰';
        }
        
        stockSummaryHTML = `
            <div style="background: linear-gradient(135deg, ${summaryColor}15 0%, ${summaryColor}05 100%); border: 2px solid ${summaryColor}; border-radius: 10px; padding: 25px; margin: 20px 0; color: #333;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="font-size: 24px; font-weight: bold; color: ${summaryColor};">${summaryIcon} ${selectedMedicineForOrder}</div>
                    <div style="background: ${summaryColor}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 13px;">${summaryStatus}</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px;">
                    <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <div style="font-size: 32px; font-weight: bold; color: ${summaryColor};">${openAvailablePharmacies}</div>
                        <div style="font-size: 12px; color: #666; margin-top: 8px;">Available & Open</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <div style="font-size: 32px; font-weight: bold; color: ${summaryColor};">${totalStock}</div>
                        <div style="font-size: 12px; color: #666; margin-top: 8px;">Total Units</div>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <div style="font-size: 32px; font-weight: bold; color: ${summaryColor};">${availablePharmacies}/${totalPharmacies}</div>
                        <div style="font-size: 12px; color: #666; margin-top: 8px;">Pharmacies with Stock</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 25px; margin-bottom: 15px; font-size: 14px; font-weight: bold; color: #333; text-transform: uppercase; letter-spacing: 0.5px;">📍 NEARBY PHARMACIES</div>
        `;
    } else {
        stockSummaryHTML = '<div style="margin-top: 15px; margin-bottom: 15px; font-size: 14px; font-weight: bold; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">📍 NEARBY PHARMACIES</div>';
    }
    
    listDiv.innerHTML = stockSummaryHTML + nearbyPharmacies.map(pharm => {
        const medicineAvailable = selectedMedicineForOrder && pharm.stock[selectedMedicineForOrder] > 0;
        const canOrder = medicineAvailable && pharm.isOpen;
        const stockCount = selectedMedicineForOrder ? pharm.stock[selectedMedicineForOrder] : null;
        
        // Get stock status badge
        let stockBadge = '<span style="background: #999; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">SEARCH MEDICINE</span>';
        if (selectedMedicineForOrder) {
            if (stockCount > 0) {
                stockBadge = `<span style="background: #27ae60; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">✓ AVAILABLE (${stockCount})</span>`;
            } else {
                stockBadge = '<span style="background: #e74c3c; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">✗ OUT OF STOCK</span>';
            }
        }
        
        const storeStatusBadge = pharm.isOpen ? 
            '<span class="badge badge-open">✓ Open Now</span>' :
            '<span class="badge badge-closed">✗ Closed</span>';
        
        const ratingStars = '⭐'.repeat(Math.floor(pharm.rating)) + (pharm.rating % 1 !== 0 ? '✨' : '');
        
        return `
            <div class="pharmacy-card ${pharm.isOpen ? 'card-open' : 'card-closed'}">
                <div class="card-header">
                    <div class="card-title-section">
                        <h3 class="pharmacy-name">${pharm.name}</h3>
                        <div class="card-meta">
                            <span class="distance-badge">📍 ${pharm.distance} km</span>
                            <span class="rating-badge">${ratingStars} ${pharm.rating}</span>
                        </div>
                    </div>
                    <div class="card-status-section">
                        ${storeStatusBadge}
                    </div>
                </div>
                
                <p class="pharmacy-address">${pharm.address}</p>
                
                <div class="card-info-grid">
                    <div class="info-item">
                        <span class="info-label">💊 Medicine Status</span>
                        ${stockBadge}
                    </div>
                    <div class="info-item">
                        <span class="info-label">🕐 Store Hours</span>
                        <span class="store-hours">${pharm.openTime} - ${pharm.closeTime}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">📞 Contact</span>
                        <a href="tel:${pharm.phone}" class="phone-link">${pharm.phone}</a>
                    </div>
                </div>
                
                <div class="card-actions">
                    ${canOrder ? `<button class="btn-order" onclick="openOrderForm('${pharm.name}', '${pharm.phone}', '${selectedMedicineForOrder}')">🛒 Order from this Pharmacy</button>` : '<button class="btn-order btn-disabled" disabled>Not Available</button>'}
                </div>
            </div>
        `;
    }).join('');
    
    hideSection('askMeSection');
    showError('searchError', 'Found ' + nearbyPharmacies.length + ' pharmacies nearby!');
}
// --- Location Form Submission ---
document.getElementById('locationForm').addEventListener('submit', e => {
    e.preventDefault();
    searchNearbyPharmacies(userLat, userLng, 5);
});

// --- Notify Me ---
const askMeForm = document.getElementById('askMeForm');
if (askMeForm) {
    askMeForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('notifyEmail').value;
        if (!email) {
            showError('askMeError', "Email required.");
            return;
        }
        showError('askMeError', "");
        document.getElementById('askMeSuccess').textContent = "We'll notify you when available!";
        setTimeout(() => askMeForm.reset(), 2000);
    });
}

// --- Pharmacy Login ---
const pharmacyLoginForm = document.getElementById('pharmacyLoginForm');
if (pharmacyLoginForm) {
    pharmacyLoginForm.addEventListener('submit', e => {
        e.preventDefault();
        hideSection('pharmacyLoginForm');
        showSection('pharmacyDashboard');
    });
}

const pharmacyLogoutBtn = document.getElementById('pharmacyLogoutBtn');
if (pharmacyLogoutBtn) {
    pharmacyLogoutBtn.addEventListener('click', () => {
        showSection('pharmacyLoginForm');
        hideSection('pharmacyDashboard');
        window.location.href = 'index.html';
    });
}

const stockForm = document.getElementById('stockForm');
if (stockForm) {
    stockForm.addEventListener('submit', e => {
        e.preventDefault();
        const med = document.getElementById('pharmacyMedicine').value;
        document.getElementById('stockSuccess').textContent = med + ' stock updated!';
        stockForm.reset();
    });
}

// --- Order Form Functions ---
function openOrderForm(pharmacyName, pharmacyPhone, medicineName) {
    const modal = document.getElementById('orderModal');
    if (!modal) return;
    
    document.getElementById('orderPharmacyName').textContent = pharmacyName;
    document.getElementById('orderPharmacyPhone').textContent = pharmacyPhone;
    document.getElementById('orderMedicineName').textContent = medicineName;
    document.getElementById('orderQuantity').value = '1';
    document.getElementById('orderCustomerName').value = '';
    document.getElementById('orderCustomerPhone').value = '';
    document.getElementById('orderCustomerAddress').value = '';
    document.getElementById('orderSuccess').textContent = '';
    
    // Store order details
    document.getElementById('orderForm').dataset.pharmacy = pharmacyName;
    document.getElementById('orderForm').dataset.medicine = medicineName;
    document.getElementById('orderForm').dataset.phone = pharmacyPhone;
    
    modal.style.display = 'flex';
}

function closeOrderForm() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.style.display = 'none';
}

// Handle order form submission
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', e => {
        e.preventDefault();
        const pharmacy = orderForm.dataset.pharmacy;
        const medicine = orderForm.dataset.medicine;
        const quantity = document.getElementById('orderQuantity').value;
        const customerName = document.getElementById('orderCustomerName').value;
        const customerPhone = document.getElementById('orderCustomerPhone').value;
        
        if (!customerName || !customerPhone) {
            alert('Please fill in all customer details');
            return;
        }
        
        // Show success message
        document.getElementById('orderSuccess').innerHTML = `
            <div style="background: #d4edda; color: #155724; padding: 12px; border-radius: 4px; margin-bottom: 10px;">
                <strong>✓ Order Placed Successfully!</strong><br>
                <small style="display: block; margin-top: 8px;">
                    <strong>${medicine} (Qty: ${quantity})</strong> ordered from ${pharmacy}<br>
                    Confirmation call will be made to ${customerPhone}<br>
                    Thank you for using PharmaNear!
                </small>
            </div>
        `;
        
        setTimeout(closeOrderForm, 3000);
    });
}

// Close modal when clicking outside
window.addEventListener('click', e => {
    const modal = document.getElementById('orderModal');
    if (modal && e.target === modal) {
        closeOrderForm();
    }
});

// --- Initialize on page load ---
window.addEventListener('load', () => {
    autoDetectLocation();
    if (document.getElementById('map')) {
        const mapDiv = document.getElementById('map');
        mapDiv.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 14px;">Search for medicine and click "Locate Medicine" to see pharmacies</div>';
    }
});
