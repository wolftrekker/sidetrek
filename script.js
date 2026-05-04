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

    // Update the floating total badge
    const totalEl = document.getElementById('map-total-value');
    if (totalEl) totalEl.textContent = locData.worldTotal.toLocaleString();
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

// ── CONTINENT TOTALS (computed from subdivisions) ──
window.addEventListener('load', () => {
  fetch('loc_data.json')
    .then(res => res.json())
    .then(data => {
      const subs = data.subdivisions;

      // ISO → continent. Defaults; some countries are split below by subdivision.
      // Edge case notes:
      //  - ES split: Canaries/Ceuta/Melilla → AF, rest → EU
      //  - PT split: Madeira → AF, Azores + mainland → EU
      //  - US split: Hawaii → OC, rest → NA
      //  - TR split: Marmara is partial (see TR_MARMARA_EUROPEAN), rest → AS
      //  - RU split: subdivisions east of the Urals → AS, rest → EU
      //  - GL → NA (despite Danish), CY → AS, CC/CX → AS, GU/MP → OC, GS → AN
      const continentByISO = {
        // EUROPE
        AD: 'EU', AL: 'EU', AT: 'EU', AX: 'EU', BA: 'EU', BE: 'EU', BG: 'EU',
        BY: 'EU', CH: 'EU', CZ: 'EU', DE: 'EU', DK: 'EU', EE: 'EU',
        FI: 'EU', FO: 'EU', FR: 'EU', GB: 'EU', GG: 'EU', GI: 'EU', GR: 'EU',
        HR: 'EU', HU: 'EU', IE: 'EU', IM: 'EU', IS: 'EU', IT: 'EU', JE: 'EU',
        LI: 'EU', LT: 'EU', LU: 'EU', LV: 'EU', MC: 'EU', MD: 'EU', ME: 'EU',
        MK: 'EU', MT: 'EU', NL: 'EU', NO: 'EU', PL: 'EU', RO: 'EU',
        RS: 'EU', SE: 'EU', SI: 'EU', SJ: 'EU', SK: 'EU', SM: 'EU', UA: 'EU',
        VA: 'EU', XK: 'EU',

        // ASIA (CY and Cocos/Christmas included per your rules)
        AE: 'AS', AF: 'AS', AM: 'AS', AZ: 'AS', BD: 'AS', BH: 'AS', BN: 'AS',
        BT: 'AS', CC: 'AS', CN: 'AS', CX: 'AS', CY: 'AS', GE: 'AS', HK: 'AS',
        ID: 'AS', IL: 'AS', IN: 'AS', IO: 'AS', IQ: 'AS', IR: 'AS', JO: 'AS',
        JP: 'AS', KG: 'AS', KH: 'AS', KP: 'AS', KR: 'AS', KW: 'AS', KZ: 'AS',
        LA: 'AS', LB: 'AS', LK: 'AS', MM: 'AS', MN: 'AS', MO: 'AS', MV: 'AS',
        MY: 'AS', NP: 'AS', OM: 'AS', PH: 'AS', PK: 'AS', PS: 'AS', QA: 'AS',
        SA: 'AS', SG: 'AS', SY: 'AS', TH: 'AS', TJ: 'AS', TL: 'AS', TM: 'AS',
        TW: 'AS', UZ: 'AS', VN: 'AS', YE: 'AS',

        // AFRICA (Réunion + Mayotte are own ISOs, geographically African)
        AO: 'AF', BF: 'AF', BI: 'AF', BJ: 'AF', BW: 'AF', CD: 'AF', CF: 'AF',
        CG: 'AF', CI: 'AF', CM: 'AF', CV: 'AF', DJ: 'AF', DZ: 'AF', EG: 'AF',
        EH: 'AF', ER: 'AF', ET: 'AF', GA: 'AF', GH: 'AF', GM: 'AF', GN: 'AF',
        GQ: 'AF', GW: 'AF', KE: 'AF', KM: 'AF', LR: 'AF', LS: 'AF', LY: 'AF',
        MA: 'AF', MG: 'AF', ML: 'AF', MR: 'AF', MU: 'AF', MW: 'AF', MZ: 'AF',
        NA: 'AF', NE: 'AF', NG: 'AF', RE: 'AF', RW: 'AF', SC: 'AF', SD: 'AF',
        SH: 'AF', SL: 'AF', SN: 'AF', SO: 'AF', SS: 'AF', ST: 'AF', SZ: 'AF',
        TD: 'AF', TG: 'AF', TN: 'AF', TZ: 'AF', UG: 'AF', YT: 'AF', ZA: 'AF',
        ZM: 'AF', ZW: 'AF',

        // NORTH AMERICA (Caribbean + Central America from Panama up + Greenland)
        AG: 'NA', AI: 'NA', AW: 'NA', BB: 'NA', BL: 'NA', BM: 'NA', BS: 'NA',
        BZ: 'NA', CA: 'NA', CP: 'NA', CR: 'NA', CU: 'NA', CW: 'NA', DM: 'NA',
        DO: 'NA', GD: 'NA', GL: 'NA', GP: 'NA', GT: 'NA', HN: 'NA', HT: 'NA',
        JM: 'NA', KN: 'NA', KY: 'NA', LC: 'NA', MF: 'NA', MQ: 'NA', MS: 'NA',
        MX: 'NA', NI: 'NA', PA: 'NA', PM: 'NA', PR: 'NA', SV: 'NA', SX: 'NA',
        TC: 'NA', TT: 'NA', VC: 'NA', VG: 'NA', VI: 'NA',

        // SOUTH AMERICA
        AR: 'SA', BO: 'SA', BR: 'SA', CL: 'SA', CO: 'SA', EC: 'SA', FK: 'SA',
        GF: 'SA', GY: 'SA', PE: 'SA', PY: 'SA', SR: 'SA', UY: 'SA', VE: 'SA',

        // OCEANIA (Guam, Northern Marianas included per your rules)
        AS: 'OC', AU: 'OC', CK: 'OC', FJ: 'OC', FM: 'OC', GU: 'OC', KI: 'OC',
        MH: 'OC', MP: 'OC', NC: 'OC', NF: 'OC', NR: 'OC', NU: 'OC', NZ: 'OC',
        PF: 'OC', PG: 'OC', PN: 'OC', PW: 'OC', SB: 'OC', TK: 'OC', TO: 'OC',
        TV: 'OC', UM: 'OC', VU: 'OC', WF: 'OC', WS: 'OC',

        // ANTARCTICA (incl. South Georgia per your rules)
        AQ: 'AN', BV: 'AN', GS: 'AN', HM: 'AN', TF: 'AN'
      };

      // Russian subdivisions east of (and including) the Urals → Asia
      const RU_ASIAN_SUBS = new Set([
        'Chelyabinsk Oblast', 'Sverdlovsk Oblast', 'Khanty-Mansi Autonomous Okrug',
        'Yamalo-Nenets Autonomous Okrug', 'Kurgan Oblast', 'Tyumen Oblast',
        'Altai Krai', 'Altai Republic', 'Amur Oblast', 'Buryatia', 'Chukotka',
        'Irkutsk Oblast', 'Jewish Autonomous Oblast', 'Kamchatka Krai',
        'Kemerovo Oblast', 'Khabarovsk Krai', 'Khakassia', 'Krasnoyarsk Krai',
        'Magadan Oblast', 'Novosibirsk Oblast', 'Omsk Oblast', 'Primorsky Krai',
        'Sakha Republic', 'Sakhalin Oblast', 'Tomsk Oblast', 'Tuva',
        'Zabaykalsky Krai'
      ]);

      // Subdivisions inside otherwise-European countries that are geographically African
      const ES_AFRICAN_SUBS = new Set(['Canary Islands', 'Ceuta', 'Melilla']);
      const PT_AFRICAN_SUBS = new Set(['Madeira']);  // Azores stays European

      // Hawaii is Oceanian despite being a US state
      const US_OCEANIA_SUBS = new Set(['Hawaii']);

      // Turkey's Marmara region split — UPDATE THIS if European Turkey loc count changes
      const TR_MARMARA_EUROPEAN = 170;

      const continents = { AS: 0, EU: 0, AF: 0, NA: 0, SA: 0, OC: 0, AN: 0 };

      for (const iso in subs) {
        const countrySubs = subs[iso];

        if (iso === 'ES') {
          for (const sub in countrySubs) {
            if (ES_AFRICAN_SUBS.has(sub)) continents.AF += countrySubs[sub];
            else continents.EU += countrySubs[sub];
          }
        } else if (iso === 'PT') {
          for (const sub in countrySubs) {
            if (PT_AFRICAN_SUBS.has(sub)) continents.AF += countrySubs[sub];
            else continents.EU += countrySubs[sub];
          }
        } else if (iso === 'US') {
          for (const sub in countrySubs) {
            if (US_OCEANIA_SUBS.has(sub)) continents.OC += countrySubs[sub];
            else continents.NA += countrySubs[sub];
          }
        } else if (iso === 'RU') {
          for (const sub in countrySubs) {
            if (RU_ASIAN_SUBS.has(sub)) continents.AS += countrySubs[sub];
            else continents.EU += countrySubs[sub];
          }
        } else if (iso === 'TR') {
          for (const sub in countrySubs) {
            if (sub === 'Marmara') {
              continents.EU += TR_MARMARA_EUROPEAN;
              continents.AS += countrySubs[sub] - TR_MARMARA_EUROPEAN;
            } else {
              continents.AS += countrySubs[sub];
            }
          }
        } else if (iso === 'XX') {
          // Placeholder ISO — skip silently
          continue;
        } else {
          const continent = continentByISO[iso];
          if (continent) {
            const total = Object.values(countrySubs).reduce((a, b) => a + b, 0);
            continents[continent] += total;
          } else {
            const orphan = Object.values(countrySubs).reduce((a, b) => a + b, 0);
            if (orphan > 0) console.warn(`No continent assigned for ISO ${iso} (${orphan} locs)`);
          }
        }
      }

      const labelToCode = {
        'Asia': 'AS', 'Europe': 'EU', 'North America': 'NA',
        'South America': 'SA', 'Africa': 'AF', 'Oceania': 'OC', 'Antarctica': 'AN'
      };

      document.querySelectorAll('#continent-stats .bar-stat').forEach(bar => {
        const label = bar.querySelector('.bar-stat-label').textContent.trim();
        const code = labelToCode[label];
        if (code !== undefined) bar.dataset.count = continents[code];
      });

      renderBarStats(document.getElementById('continent-stats'));
    });
});

// ── EXTRA STATS BARS ──
function renderBarStats(card) {
  if (!card) return;
  const bars = card.querySelectorAll('.bar-stat');
  const total = Array.from(bars).reduce((sum, bar) => sum + Number(bar.dataset.count), 0);

  bars.forEach(bar => {
    const count = Number(bar.dataset.count);
    const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    const labelEl = bar.querySelector('.bar-stat-label');
    const labelHtml = labelEl ? labelEl.outerHTML : '';

    bar.innerHTML = `
      <div class="bar-stat-header">
        ${labelHtml}
        <span class="bar-stat-value">${count.toLocaleString()} <span class="bar-stat-pct">${pct}%</span></span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width: ${pct}%"></div></div>
    `;
  });
}

window.addEventListener('load', () => {
  document.querySelectorAll('.stats-card').forEach(renderBarStats);
});