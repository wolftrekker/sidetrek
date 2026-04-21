// ── MAPBOX MAP ──
const MAPBOX_TOKEN = 'pk.eyJ1Ijoid29sZnRyZWtrZXIiLCJhIjoiY21uZXF6ajFsMDJqaDJxcHhsczh6OHpsZyJ9.X2fgaX86Ppzrz8a8i6RUmA';
const TILESET_NATION = 'wolftrekker.1pc0hsj5';
const TILESET_SUBD = 'wolftrekker.8myvi8rn';
const SOURCE_LAYER_NATION = 'nations_final_v9-14vmrh';
const SOURCE_LAYER_SUBD = 'subd_final_v8-3h801z';
 
// Colours (matching site palette)
const COLOR_HAS_LOCS = '#c49a4a';
const COLOR_NO_LOCS = '#1a1610';
const COLOR_BORDER = '#6a5840';
const COLOR_HOVER = '#b8892e';
const COLOR_HOVER_GREY = '#5a5248';
 
mapboxgl.accessToken = MAPBOX_TOKEN;
 
const map = new mapboxgl.Map({
  container: 'mapbox-map',
  style: 'mapbox://styles/wolftrekker/cmnet941i003801sfcnnx9zpy',
  center: [20, 20],
  zoom: 2.1,
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
    // Dynamically calculate country totals from subdivisions
    locData.country_totals = {};
    for (const iso in data.subdivisions) {
      locData.country_totals[iso] = Object.values(data.subdivisions[iso]).reduce((a, b) => a + b, 0);
    }
    // Dynamically calculate world total
    locData.worldTotal = Object.values(locData.country_totals).reduce((a, b) => a + b, 0);
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
    minzoom: 0,
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
    minzoom: 0,
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
    minzoom: 0,
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
 
  // ── SELECTED BORDER LAYERS ──
  map.addLayer({
    id: 'nation-selected',
    type: 'line',
    source: 'nation',
    'source-layer': SOURCE_LAYER_NATION,
    paint: {
      'line-color': '#1a1408',
      'line-width': 2.5,
      'line-opacity': 0
    }
  });

  map.addLayer({
    id: 'subd-selected',
    type: 'line',
    source: 'subd',
    'source-layer': SOURCE_LAYER_SUBD,
    layout: { visibility: 'none' },
    paint: {
      'line-color': '#1a1408',
      'line-width': 2,
      'line-opacity': 0
    }
  });

  // ── SUBDIVISION LAYERS (hidden initially) ──
  map.addLayer({
    id: 'subd-fill',
    type: 'fill',
    source: 'subd',
    'source-layer': SOURCE_LAYER_SUBD,
    minzoom: 0,
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
    minzoom: 0,
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
    minzoom: 0,
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
 
  // ── COUNTRY NAMES ──
const COUNTRY_NAMES = {
  AD: 'Andorra', AE: 'UAE', AF: 'Afghanistan', AG: 'Antigua & Barbuda',
  AL: 'Albania', AM: 'Armenia', AO: 'Angola', AR: 'Argentina',
  AT: 'Austria', AU: 'Australia', AZ: 'Azerbaijan', BA: 'Bosnia & Herzegovina',
  BD: 'Bangladesh', BE: 'Belgium', BF: 'Burkina Faso', BG: 'Bulgaria',
  BH: 'Bahrain', BI: 'Burundi', BJ: 'Benin', BN: 'Brunei',
  BO: 'Bolivia', BR: 'Brazil', BT: 'Bhutan', BW: 'Botswana',
  BY: 'Belarus', BZ: 'Belize', CA: 'Canada', CD: 'DR Congo',
  CF: 'Central African Republic', CG: 'Congo', CH: 'Switzerland',
  CI: "Côte d'Ivoire", CL: 'Chile', CM: 'Cameroon', CN: 'China',
  CO: 'Colombia', CR: 'Costa Rica', CU: 'Cuba', CV: 'Cape Verde',
  CY: 'Cyprus', CZ: 'Czechia', DE: 'Germany', DJ: 'Djibouti',
  DK: 'Denmark', DO: 'Dominican Republic', DZ: 'Algeria', EC: 'Ecuador',
  EE: 'Estonia', EG: 'Egypt', ER: 'Eritrea', ES: 'Spain',
  ET: 'Ethiopia', FI: 'Finland', FJ: 'Fiji', FR: 'France',
  GA: 'Gabon', GB: 'United Kingdom', GE: 'Georgia', GH: 'Ghana',
  GM: 'Gambia', GN: 'Guinea', GQ: 'Equatorial Guinea', GR: 'Greece',
  GT: 'Guatemala', GW: 'Guinea-Bissau', GY: 'Guyana', HN: 'Honduras',
  HR: 'Croatia', HT: 'Haiti', HU: 'Hungary', ID: 'Indonesia',
  IE: 'Ireland', IL: 'Israel', IN: 'India', IQ: 'Iraq',
  IR: 'Iran', IS: 'Iceland', IT: 'Italy', JM: 'Jamaica',
  JO: 'Jordan', JP: 'Japan', KE: 'Kenya', KG: 'Kyrgyzstan',
  KH: 'Cambodia', KP: 'North Korea', KR: 'South Korea', KW: 'Kuwait',
  KZ: 'Kazakhstan', LA: 'Laos', LB: 'Lebanon', LK: 'Sri Lanka',
  LR: 'Liberia', LS: 'Lesotho', LT: 'Lithuania', LU: 'Luxembourg',
  LV: 'Latvia', LY: 'Libya', MA: 'Morocco', MD: 'Moldova',
  ME: 'Montenegro', MG: 'Madagascar', MK: 'North Macedonia', ML: 'Mali',
  MM: 'Myanmar', MN: 'Mongolia', MR: 'Mauritania', MW: 'Malawi',
  MX: 'Mexico', MY: 'Malaysia', MZ: 'Mozambique', NA: 'Namibia',
  NE: 'Niger', NG: 'Nigeria', NI: 'Nicaragua', NL: 'Netherlands',
  NO: 'Norway', NP: 'Nepal', NZ: 'New Zealand', OM: 'Oman',
  PA: 'Panama', PE: 'Peru', PG: 'Papua New Guinea', PH: 'Philippines',
  PK: 'Pakistan', PL: 'Poland', PS: 'Palestine', PT: 'Portugal', PY: 'Paraguay',
  QA: 'Qatar', RO: 'Romania', RS: 'Serbia', RU: 'Russia',
  RW: 'Rwanda', SA: 'Saudi Arabia', SD: 'Sudan', SE: 'Sweden',
  SG: 'Singapore', SI: 'Slovenia', SK: 'Slovakia', SL: 'Sierra Leone',
  SN: 'Senegal', SO: 'Somalia', SR: 'Suriname', SS: 'South Sudan',
  SV: 'El Salvador', SY: 'Syria', SZ: 'Eswatini', TD: 'Chad',
  TG: 'Togo', TH: 'Thailand', TJ: 'Tajikistan', TL: 'Timor-Leste',
  TM: 'Turkmenistan', TN: 'Tunisia', TR: 'Turkey', TT: 'Trinidad & Tobago',
  TW: 'Taiwan', TZ: 'Tanzania', UA: 'Ukraine', UG: 'Uganda',
  US: 'United States', UY: 'Uruguay', UZ: 'Uzbekistan', VE: 'Venezuela',
  VN: 'Vietnam', YE: 'Yemen', ZA: 'South Africa', ZM: 'Zambia',
  ZW: 'Zimbabwe'
};

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

    popup.on('close', () => {
    map.setPaintProperty('nation-selected', 'line-opacity', 0);
    map.setPaintProperty('subd-selected', 'line-opacity', 0);
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
      // Use dynamically summed country total from subdivisions
      locCount = locData.country_totals[iso] || 0;
    } else {
      if (locData.subdivisions[iso] && locData.subdivisions[iso][name] !== undefined) {
        locCount = locData.subdivisions[iso][name];
      }
    }
 
        let statsHtml = '';
    if (locCount === 0) {
      statsHtml = 'No Street View coverage';
    } else {
      const worldPct = pct((locCount / locData.worldTotal) * 100);
      statsHtml = `<strong>${fmt(locCount)}</strong> location${locCount !== 1 ? 's' : ''}`;
      if (view === 'nation') {
        statsHtml += `<br><strong>${worldPct}%</strong> of world`;
      }
    }
 
    // Subdivision: add % of country (skip if 100%)
    if (locCount > 0 && view === 'subd' && iso) {
      const countryTotal = locData.country_totals[iso] || 0;
      if (countryTotal > 0 && locCount > 0) {
        const countryPct = (locCount / countryTotal) * 100;
        if (countryPct < 99.99) {
          const countryName = COUNTRY_NAMES[iso] || iso;
          statsHtml += `<br><strong>${pct(countryPct)}%</strong> of ${countryName}`;
        }
      }
    }
 
// Highlight selected region border
    const selectedLayer = view === 'nation' ? 'nation-selected' : 'subd-selected';
    map.setPaintProperty(selectedLayer, 'line-opacity', [
      'case',
      ['==', ['get', 'unit_name'], name],
      1,
      0
    ]);

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
    map.setPaintProperty('nation-selected', 'line-opacity', 0);
    map.setPaintProperty('subd-selected', 'line-opacity', 0);

    const nationVis = (view === 'nation') ? 'visible' : 'none';
    const subdVis = (view === 'subd') ? 'visible' : 'none';

    ['nation-fill', 'nation-line', 'nation-hover', 'nation-selected'].forEach(id =>
      map.setLayoutProperty(id, 'visibility', nationVis)
    );
    ['subd-fill', 'subd-line', 'subd-hover', 'subd-selected'].forEach(id =>
      map.setLayoutProperty(id, 'visibility', subdVis)
    );

    if (view === 'subd' && map.getZoom() < 4) {
      map.easeTo({ zoom: 4, duration: 800 });
    }
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

  // ── CONTRIBUTORS SORT ──
  const grid = document.querySelector('.contributors-grid');
  if (grid) {
    [...grid.querySelectorAll('.contributor')]
      .sort((a, b) => a.textContent.localeCompare(b.textContent, undefined, { sensitivity: 'base' }))
      .forEach(el => grid.appendChild(el));
  }

// ── EXTRA STATS BARS ──
window.addEventListener('load', () => {
  document.querySelectorAll('.stats-card').forEach(card => {
    const bars = card.querySelectorAll('.bar-stat');
    const total = Array.from(bars).reduce((sum, bar) => sum + Number(bar.dataset.count), 0);

    bars.forEach(bar => {
      const count = Number(bar.dataset.count);
      const pct = ((count / total) * 100).toFixed(1);
      const label = bar.querySelector('.bar-stat-label');

      bar.innerHTML = `
        <div class="bar-stat-header">
          ${label.outerHTML}
          <span class="bar-stat-value">${count.toLocaleString()} <span class="bar-stat-pct">${pct}%</span></span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width: ${pct}%"></div></div>
      `;
    });
  });
});