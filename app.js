// Enhanced Daladala Guide App
const map = L.map('map').setView([-6.782, 39.214], 12); // center on Dar
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// DOM elements
const routeSelect = document.getElementById('routeSelect');
const stopList = document.getElementById('stopList');
const routeTitle = document.getElementById('routeTitle');
const plotBtn = document.getElementById('plotBtn');
const clearBtn = document.getElementById('clearBtn');
const suggestBtn = document.getElementById('suggestBtn');
const startInput = document.getElementById('startInput');
const endInput = document.getElementById('endInput');
const logBox = document.getElementById('log');
const favoriteBtn = document.getElementById('favoriteBtn');
const shareBtn = document.getElementById('shareBtn');
const contributeBtn = document.getElementById('contributeBtn');
const contributeModal = document.getElementById('contributeModal');
const closeModal = document.getElementById('closeModal');
const favoritesList = document.getElementById('favoritesList');
const routeStats = document.getElementById('routeStats');
const newRouteForm = document.getElementById('newRouteForm');
const newStopForm = document.getElementById('newStopForm');
const newStopRoute = document.getElementById('newStopRoute');

// App state
let routeData = []; // rows from CSV
let routesById = {}; // route_id -> {name, color, stops: [{order, name}]}
let activeLayerGroup = L.layerGroup().addTo(map);
let currentRoute = null;
let favorites = JSON.parse(localStorage.getItem('daladala-favorites') || '[]');

// Utility functions
function log(msg) {
  logBox.textContent += msg + "\n";
  logBox.scrollTop = logBox.scrollHeight;
}

function sleep(ms) { 
  return new Promise(res => setTimeout(res, ms)); 
}

// Load CSVs
async function loadCSVs() {
  try {
    const [routesCsv, metaCsv] = await Promise.all([
      fetch('data/routes.csv').then(r => r.text()),
      fetch('data/routes_meta.csv').then(r => r.text())
    ]);

    const routes = Papa.parse(routesCsv, { header: true }).data
      .filter(r => r.route_id && r.stop_name);

    const meta = Papa.parse(metaCsv, { header: true }).data
      .filter(r => r.route_id);

    // Build routes map
    const metaById = {};
    meta.forEach(m => {
      metaById[m.route_id] = m;
    });

    const tmp = {};
    routes.forEach(r => {
      const id = r.route_id;
      if (!tmp[id]) tmp[id] = { route_id: id, name: r.route_name || id, stops: [] };
      tmp[id].stops.push({
        order: Number(r.stop_order),
        name: r.stop_name
      });
    });
    
    // sort stops
    Object.values(tmp).forEach(rt => rt.stops.sort((a,b) => a.order - b.order));

    // attach meta
    Object.values(tmp).forEach(rt => {
      const m = metaById[rt.route_id] || {};
      rt.color = m.color || '#2563eb';
      rt.notes = m.notes || '';
    });

    routesById = tmp;
    populateRouteSelect(routesById);
    populateFavorites();
    updateNewStopRouteSelect();
    log('Routes loaded successfully!');
  } catch (error) {
    log(`Error loading routes: ${error.message}`);
  }
}

function populateRouteSelect(routes) {
  routeSelect.innerHTML = '<option value="">Choose a route...</option>';
  Object.values(routes).forEach(rt => {
    const opt = document.createElement('option');
    opt.value = rt.route_id;
    opt.textContent = `${rt.route_id} - ${rt.name}`;
    routeSelect.appendChild(opt);
  });
}

function updateNewStopRouteSelect() {
  newStopRoute.innerHTML = '<option value="">Select a route...</option>';
  Object.values(routesById).forEach(rt => {
    const opt = document.createElement('option');
    opt.value = rt.route_id;
    opt.textContent = `${rt.route_id} - ${rt.name}`;
    newStopRoute.appendChild(opt);
  });
}

function populateFavorites() {
  favoritesList.innerHTML = '';
  favorites.forEach(fav => {
    const item = document.createElement('div');
    item.className = 'favorite-item';
    item.innerHTML = `
      <span>${fav.route_id} - ${fav.name}</span>
      <button class="remove-fav" data-route="${fav.route_id}">&times;</button>
    `;
    item.addEventListener('click', (e) => {
      if (!e.target.classList.contains('remove-fav')) {
        routeSelect.value = fav.route_id;
        plotSelectedRoute();
      }
    });
    favoritesList.appendChild(item);
  });

  // Add remove event listeners
  favoritesList.querySelectorAll('.remove-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const routeId = btn.dataset.route;
      removeFavorite(routeId);
    });
  });
}

function addFavorite(routeId) {
  const route = routesById[routeId];
  if (!route) return;
  
  if (!favorites.find(f => f.route_id === routeId)) {
    favorites.push({
      route_id: routeId,
      name: route.name
    });
    localStorage.setItem('daladala-favorites', JSON.stringify(favorites));
    populateFavorites();
    updateFavoriteButton();
  }
}

function removeFavorite(routeId) {
  favorites = favorites.filter(f => f.route_id !== routeId);
  localStorage.setItem('daladala-favorites', JSON.stringify(favorites));
  populateFavorites();
  updateFavoriteButton();
}

function updateFavoriteButton() {
  if (!currentRoute) return;
  
  const isFavorite = favorites.find(f => f.route_id === currentRoute.route_id);
  const icon = favoriteBtn.querySelector('i');
  
  if (isFavorite) {
    icon.className = 'fas fa-heart';
    favoriteBtn.style.color = '#ef4444';
    favoriteBtn.title = 'Remove from favorites';
  } else {
    icon.className = 'far fa-heart';
    favoriteBtn.style.color = '#6b7280';
    favoriteBtn.title = 'Add to favorites';
  }
}

function clearMapAndList() {
  activeLayerGroup.clearLayers();
  stopList.innerHTML = '';
  routeTitle.textContent = 'No route selected';
  routeStats.innerHTML = '';
  logBox.textContent = '';
  currentRoute = null;
  updateFavoriteButton();
}

async function plotSelectedRoute() {
  const id = routeSelect.value;
  if (!id) return;
  await plotRoute(id);
}

async function plotRoute(routeId) {
  clearMapAndList();
  const rt = routesById[routeId];
  if (!rt) return;

  currentRoute = rt;
  routeTitle.textContent = `${rt.route_id} - ${rt.name}`;
  
  // Update route stats
  routeStats.innerHTML = `
    <div><strong>Total Stops:</strong> ${rt.stops.length}</div>
    <div><strong>Route Color:</strong> <span style="color: ${rt.color}">${rt.color}</span></div>
    ${rt.notes ? `<div><strong>Notes:</strong> ${rt.notes}</div>` : ''}
  `;

  // Populate stops list
  rt.stops.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s.name;
    stopList.appendChild(li);
  });

  // Geocode and plot
  const coords = [];
  log(`Plotting route ${rt.route_id} with ${rt.stops.length} stops...`);
  
  for (const s of rt.stops) {
    const c = await geocodeWithCache(`${s.name}, Dar es Salaam, Tanzania`);
    if (c) {
      coords.push([c.lat, c.lon]);
      const marker = L.marker([c.lat, c.lon])
        .bindPopup(`<b>${s.order}. ${s.name}</b><br>Route: ${rt.route_id}`)
        .addTo(activeLayerGroup);
      await sleep(300); // polite spacing for Nominatim
    } else {
      log(`Could not geocode: ${s.name}`);
    }
  }

  if (coords.length > 1) {
    const line = L.polyline(coords, { 
      weight: 4,
      color: rt.color,
      opacity: 0.8
    }).addTo(activeLayerGroup);
    
    map.fitBounds(line.getBounds(), { padding: [30, 30] });
    log(`Route plotted successfully! ${coords.length} stops mapped.`);
  } else if (coords.length === 1) {
    map.setView(coords[0], 14);
  }

  updateFavoriteButton();
}

// Enhanced route suggestion with better matching
function suggestRoutes() {
  const start = startInput.value.trim().toLowerCase();
  const end = endInput.value.trim().toLowerCase();
  
  if (!start || !end) {
    alert('Please enter both starting and destination stops');
    return;
  }

  const matches = [];
  Object.values(routesById).forEach(rt => {
    const stopNames = rt.stops.map(s => s.name.toLowerCase());
    const hasStart = stopNames.some(n => n.includes(start));
    const hasEnd = stopNames.some(n => n.includes(end));
    
    if (hasStart && hasEnd) {
      // Calculate route quality score
      const startIndex = rt.stops.findIndex(s => s.name.toLowerCase().includes(start));
      const endIndex = rt.stops.findIndex(s => s.name.toLowerCase().includes(end));
      const distance = Math.abs(endIndex - startIndex);
      
      matches.push({
        route: rt,
        score: distance, // Lower distance = better route
        startStop: rt.stops[startIndex]?.name,
        endStop: rt.stops[endIndex]?.name
      });
    }
  });

  if (matches.length === 0) {
    alert('No routes found connecting these stops. Try different stop names.');
  } else {
    // Sort by score (best first)
    matches.sort((a, b) => a.score - b.score);
    
    const bestRoute = matches[0];
    routeSelect.value = bestRoute.route.route_id;
    
    // Show suggestion info
    log(`Found ${matches.length} route(s):`);
    matches.forEach((match, i) => {
      log(`${i + 1}. ${match.route.route_id} (${match.startStop} → ${match.endStop})`);
    });
    
    plotSelectedRoute();
  }
}

// Enhanced geocoding with better error handling
async function geocodeWithCache(query) {
  const key = `geocode:${query}`;
  const hit = localStorage.getItem(key);
  
  if (hit) {
    try {
      const obj = JSON.parse(hit);
      return obj;
    } catch {}
  }
  
  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', 1);
    url.searchParams.set('q', query);
    url.searchParams.set('email', 'demo@example.com');
    
    const res = await fetch(url.toString(), { 
      headers: { 'Accept-Language': 'en' } 
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      const obj = { 
        lat: parseFloat(first.lat), 
        lon: parseFloat(first.lon) 
      };
      localStorage.setItem(key, JSON.stringify(obj));
      return obj;
    }
  } catch (e) {
    log(`Geocoding error for "${query}": ${e.message}`);
  }
  return null;
}

// Modal functionality
function showModal() {
  contributeModal.style.display = 'block';
}

function hideModal() {
  contributeModal.style.display = 'none';
  newRouteForm.reset();
  newStopForm.reset();
}

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');
  });
});

// Form submissions
newRouteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(newRouteForm);
  
  // Here you would typically send this to a server
  // For now, we'll just log it
  log('New route submitted:');
  log(`Route ID: ${formData.get('newRouteId')}`);
  log(`Route Name: ${formData.get('newRouteName')}`);
  log(`Color: ${formData.get('newRouteColor')}`);
  log(`Notes: ${formData.get('newRouteNotes')}`);
  
  hideModal();
  alert('Route submitted! (This is a demo - data would be sent to server)');
});

newStopForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(newStopForm);
  
  log('New stop submitted:');
  log(`Route: ${formData.get('newStopRoute')}`);
  log(`Stop Name: ${formData.get('newStopName')}`);
  log(`Order: ${formData.get('newStopOrder')}`);
  
  hideModal();
  alert('Stop submitted! (This is a demo - data would be sent to server)');
});

// Event listeners
plotBtn.addEventListener('click', plotSelectedRoute);
clearBtn.addEventListener('click', clearMapAndList);
suggestBtn.addEventListener('click', suggestRoutes);
contributeBtn.addEventListener('click', showModal);
closeModal.addEventListener('click', hideModal);
favoriteBtn.addEventListener('click', () => {
  if (!currentRoute) return;
  
  const isFavorite = favorites.find(f => f.route_id === currentRoute.route_id);
  if (isFavorite) {
    removeFavorite(currentRoute.route_id);
  } else {
    addFavorite(currentRoute.route_id);
  }
});

shareBtn.addEventListener('click', () => {
  if (!currentRoute) return;
  
  const url = `${window.location.origin}${window.location.pathname}?route=${currentRoute.route_id}`;
  if (navigator.share) {
    navigator.share({
      title: `Daladala Route ${currentRoute.route_id}`,
      text: `Check out this daladala route: ${currentRoute.name}`,
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert('Route URL copied to clipboard!');
  }
});

// Export/Import functionality
document.getElementById('exportData').addEventListener('click', () => {
  const data = {
    routes: routesById,
    favorites: favorites,
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'daladala-data.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === contributeModal) {
    hideModal();
  }
});

// Initialize app
loadCSVs().then(() => {
  if (routeSelect.options.length > 1) {
    // Auto-select first route
    routeSelect.selectedIndex = 1;
    plotSelectedRoute();
  }
});

// Handle URL parameters for direct route access
const urlParams = new URLSearchParams(window.location.search);
const routeParam = urlParams.get('route');
if (routeParam && routesById[routeParam]) {
  routeSelect.value = routeParam;
  plotSelectedRoute();
}
