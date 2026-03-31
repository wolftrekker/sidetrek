// ── MAPBOX MAP ──
const MAPBOX_TOKEN = 'pk.eyJ1Ijoid29sZnRyZWtrZXIiLCJhIjoiY21uZXF6ajFsMDJqaDJxcHhsczh6OHpsZyJ9.X2fgaX86Ppzrz8a8i6RUmA';
const TILESET_NATION = 'wolftrekker.9w17zmgf';
const TILESET_SUBD = 'wolftrekker.cpkdh9t8';
const SOURCE_LAYER_NATION = 'nations_final_v6-61z1fb';
const SOURCE_LAYER_SUBD = 'subd_final_v5-66qr8b';
 
// Colours (matching site palette)
const COLOR_HAS_LOCS = '#c49a4a';
const COLOR_NO_LOCS = '#2a2420';
const COLOR_BORDER = '#6a5840';
const COLOR_HOVER = '#ddb96a';
const COLOR_HOVER_GREY = '#8a8078';
 
mapboxgl.accessToken = MAPBOX_TOKEN;
 
const map = new mapboxgl.Map({
  container: 'mapbox-map',
  style: 'mapbox://styles/wolftrekker/cmnet941i003801sfcnnx9zpy',
  center: [20, 20],
  zoom: 1.8,
  minZoom: 1,
  maxZoom: 8,
  projection: 'mercator'
});
 
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
 
let locData = null;
let activeView = 'nation';
 
// Load location data
fetch('loc_data.json')
  .then(res => res.json())
  .then(data => {
    locData = data;
    // Pre-calculate world total
    locData.worldTotal = Object.values(data.country_totals).reduce((a, b) => a + b, 0);
  })
  .catch(err => console.error('Failed to load loc_data.json:', err));
 
map.on('load', () => {
 
  // ── SOURCES ──
  map.addSource('nation', {
    type: 'vector',
    url: `mapbox://${TILESET_NATION}`
  });
 
  map.addSource('subd', {
    type: 'vector',
    url: `mapbox://${TILESET_SUBD}`
  });
 
  // ── NATION LAYERS ──
  map.addLayer({
    id: 'nation-fill',
    type: 'fill',
    source: 'nation',
    'source-layer': SOURCE_LAYER_NATION,
    paint: {
      'fill-color': [
        'case',
        ['>', ['get', 'loc_count'], 0],
        COLOR_HAS_LOCS,
        COLOR_NO_LOCS
      ],
      'fill-opacity': [
        'case',
        ['>', ['get', 'loc_count'], 0],
        0.35,
        0.2
      ]
    }
  });
 
  map.addLayer({
    id: 'nation-line',
    type: 'line',
    source: 'nation',
    'source-layer': SOURCE_LAYER_NATION,
    paint: {
      'line-color': COLOR_BORDER,
      'line-width': 0.5,
      'line-opacity': 0.6
    }
  });
 
  map.addLayer({
    id: 'nation-hover',
    type: 'fill',
    source: 'nation',
    'source-layer': SOURCE_LAYER_NATION,
    paint: {
      'fill-color': [
        'case',
        ['>', ['get', 'loc_count'], 0],
        COLOR_HOVER,
        COLOR_HOVER_GREY
      ],
      'fill-opacity': 0
    }
  });
 
  // ── SUBDIVISION LAYERS (hidden initially) ──
  map.addLayer({
    id: 'subd-fill',
    type: 'fill',
    source: 'subd',
    'source-layer': SOURCE_LAYER_SUBD,
    layout: { visibility: 'none' },
    paint: {
      'fill-color': [
        'case',
        ['>', ['get', 'loc_count'], 0],
        COLOR_HAS_LOCS,
        COLOR_NO_LOCS
      ],
      'fill-opacity': [
        'case',
        ['>', ['get', 'loc_count'], 0],
        0.35,
        0.2
      ]
    }
  });
 
  map.addLayer({
    id: 'subd-line',
    type: 'line',
    source: 'subd',
    'source-layer': SOURCE_LAYER_SUBD,
    layout: { visibility: 'none' },
    paint: {
      'line-color': COLOR_BORDER,
      'line-width': 0.3,
      'line-opacity': 0.5
    }
  });
 
  map.addLayer({
    id: 'subd-hover',
    type: 'fill',
    source: 'subd',
    'source-layer': SOURCE_LAYER_SUBD,
    layout: { visibility: 'none' },
    paint: {
      'fill-color': [
        'case',
        ['>', ['get', 'loc_count'], 0],
        COLOR_HOVER,
        COLOR_HOVER_GREY
      ],
      'fill-opacity': 0
    }
  });
 
  // ── HOVER ──
  const setupHover = (fillLayer, hoverLayer) => {
    map.on('mouseenter', fillLayer, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
 
    map.on('mouseleave', fillLayer, () => {
      map.getCanvas().style.cursor = '';
      map.setPaintProperty(hoverLayer, 'fill-opacity', 0);
    });
 
    map.on('mousemove', fillLayer, (e) => {
      if (e.features.length > 0) {
        map.setPaintProperty(hoverLayer, 'fill-opacity', [
          'case',
          ['==', ['get', 'unit_name'], e.features[0].properties.unit_name],
          0.2,
          0
        ]);
      }
    });
  };
 
  setupHover('nation-fill', 'nation-hover');
  setupHover('subd-fill', 'subd-hover');
 
  // ── POPUPS ──
  const popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true,
    maxWidth: '280px'
  });
 
  const fmt = (n) => n.toLocaleString();
  const pct = (n) => n.toFixed(2);
 
  const handleClick = (e, view) => {
    if (!e.features.length || !locData) return;
    const props = e.features[0].properties;
    const name = props.unit_name || 'Unknown';
    const iso = props.iso_a2 || '';
 
    // Look up count from JSON
    let locCount = 0;
    if (view === 'nation') {
      const entry = locData.nations[name];
      locCount = entry ? entry.loc_count : 0;
    } else {
      if (locData.subdivisions[iso] && locData.subdivisions[iso][name] !== undefined) {
        locCount = locData.subdivisions[iso][name];
      }
    }
 
    const worldPct = pct((locCount / locData.worldTotal) * 100);
 
    let statsHtml = `
      <strong>${fmt(locCount)}</strong> location${locCount !== 1 ? 's' : ''}<br>
      <strong>${worldPct}%</strong> of world
    `;
 
    // Subdivision: add % of country
    if (view === 'subd' && iso) {
      const countryTotal = locData.country_totals[iso] || 0;
      if (countryTotal > 0 && locCount > 0) {
        statsHtml += `<br><strong>${pct((locCount / countryTotal) * 100)}%</strong> of ${iso}`;
      }
    }
 
    popup.setLngLat(e.lngLat).setHTML(`
      <div class="popup-name">${name}</div>
      <div class="popup-stat">${statsHtml}</div>
    `).addTo(map);
  };
 
  map.on('click', 'nation-fill', (e) => handleClick(e, 'nation'));
  map.on('click', 'subd-fill', (e) => handleClick(e, 'subd'));
 
  // ── TOGGLE LOGIC ──
  const setView = (view) => {
    activeView = view;
    popup.remove();
 
    const nationVis = (view === 'nation') ? 'visible' : 'none';
    const subdVis = (view === 'subd') ? 'visible' : 'none';
 
    ['nation-fill', 'nation-line', 'nation-hover'].forEach(id =>
      map.setLayoutProperty(id, 'visibility', nationVis)
    );
    ['subd-fill', 'subd-line', 'subd-hover'].forEach(id =>
      map.setLayoutProperty(id, 'visibility', subdVis)
    );
  };
 
  // Wire toggle buttons
  const toggleBtns = document.querySelectorAll('.map-toggle');
  const viewMap = {
    'Continent': 'nation',
    'Country': 'nation',
    'Subdivision': 'subd'
  };
 
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setView(viewMap[btn.textContent.trim()] || 'nation');
    });
  });
});
 
 
// ── FORM SUBMISSION FEEDBACK ──
document.querySelectorAll('.form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn-form');
    const original = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
 
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
 
      if (res.ok) {
        btn.textContent = 'Sent ✓';
        form.reset();
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
        }, 3000);
      } else {
        throw new Error('Failed');
      }
    } catch {
      btn.textContent = 'Something went wrong';
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 3000);
    }
  });
});