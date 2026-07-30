/*
 * DEM-based Multi-Criteria Geomorphological Classification — Akre Plain
 * Interactive GEE App (UI Panel style from UAPC)
 * -------------------------------------------------------------------------
 * - Classification logic: original Akre script (10 units, percentile thresholds)
 * - UI shell: UAPC interactive panel style
 * - REMOVED: shapefile export, statistics table/export, area/percent calculations
 * - KEPT: raster export, legend, visualization
 *
 * Paste into code.earthengine.google.com
 */

// =============================================================================
// PART 1: UI PANEL
// =============================================================================

var mainPanel = ui.Panel({
  style: {width: '380px', padding: '12px', position: 'top-right'},
  layout: ui.Panel.Layout.flow('vertical')
});

var title = ui.Label({
  value: 'ATAF-LandForm Classification Framework',
  style: {fontWeight: 'bold', fontSize: '18px', color: '1a5276',
          margin: '0 0 6px 0', textAlign: 'center', width: '100%'}
});
mainPanel.add(title);

var subtitle = ui.Label({
  value: 'Multi-Criteria DEM-Based Terrain Classification',
  style: {fontSize: '11px', color: '5d6d7e', margin: '0 0 12px 0',
          textAlign: 'center', width: '100%'}
});
mainPanel.add(subtitle);

mainPanel.add(ui.Panel([], ui.Panel.Layout.flow('horizontal'),
  {border: '1px solid #cccccc', margin: '4px 0'}));

// AOI input
mainPanel.add(ui.Label({
  value: 'Study Area (Table ID):',
  style: {fontWeight: 'bold', fontSize: '13px', margin: '10px 0 3px 0'}
}));
mainPanel.add(ui.Label({
  value: 'Enter GEE FeatureCollection asset ID',
  style: {fontSize: '10px', color: '7f8c8d', margin: '0 0 5px 0'}
}));

var aoiTextbox = ui.Textbox({
  placeholder: 'projects/username/assets/aoi_name',
  value: 'projects/drsameer-488014/assets/akre',
  style: {width: '95%', margin: '0 0 10px 0'}
});
mainPanel.add(aoiTextbox);

// DEM selector
mainPanel.add(ui.Label({
  value: 'DEM Source:',
  style: {fontWeight: 'bold', fontSize: '13px', margin: '6px 0 3px 0'}
}));

var demSelect = ui.Select({
  items: [
    {label: 'SRTM 30m (USGS) — Default', value: 'SRTM'},
    {label: 'Copernicus GLO-30 (30m) — Recommended', value: 'COPERNICUS'},
    {label: 'ALOS AW3D30 (30m)', value: 'ALOS'},
    {label: 'ALOS AW3D30 (12.5m — High Res)', value: 'ALOS_12_5'}
  ],
  value: 'SRTM',
  style: {width: '95%', margin: '0 0 10px 0'}
});
mainPanel.add(demSelect);

mainPanel.add(ui.Panel([], ui.Panel.Layout.flow('horizontal'),
  {border: '1px solid #cccccc', margin: '4px 0'}));

// Status
var statusLabel = ui.Label({
  value: 'Status: Ready to run',
  style: {
    fontWeight: 'bold', fontSize: '12px', color: '27ae60',
    backgroundColor: 'eafaf1', padding: '8px',
    width: '95%', textAlign: 'center', margin: '10px 0'
  }
});
mainPanel.add(statusLabel);

// Run button
var runButton = ui.Button({
  label: '▶ RUN CLASSIFICATION',
  style: {
    color: 'ffffff', backgroundColor: '2874a6',
    fontWeight: 'bold', fontSize: '14px',
    padding: '10px', width: '95%', margin: '5px 0 12px 0'
  }
});
mainPanel.add(runButton);

mainPanel.add(ui.Panel([], ui.Panel.Layout.flow('horizontal'),
  {border: '1px solid #cccccc', margin: '4px 0'}));

// Export panel
var exportPanel = ui.Panel({style: {shown: false, margin: '12px 0 0 0'}});
exportPanel.add(ui.Label({
  value: 'Export',
  style: {fontWeight: 'bold', fontSize: '13px', color: '1a5276', margin: '0 0 6px 0'}
}));

var exportRasterBtn = ui.Button({
  label: 'Export Classification (GeoTIFF)',
  style: {width: '95%', margin: '3px 0', fontSize: '11px'}
});
exportPanel.add(exportRasterBtn);

mainPanel.add(exportPanel);

// Spacer
mainPanel.add(ui.Panel([], ui.Panel.Layout.flow('horizontal'),
  {border: '1px solid #cccccc', margin: '12px 0 6px 0'}));

// Footer credit
mainPanel.add(ui.Label({
  value: 'This Framework Developed By : Asst.Prof. Dr. Sameer S. Akreyi @2026',
  style: {
    fontSize: '10px', color: '566573', fontStyle: 'italic',
    textAlign: 'center', width: '100%', margin: '4px 0 2px 0'
  }
}));

ui.root.add(mainPanel);

// Hide map UI controls (keep zoom + layer switcher only)
Map.setControlVisibility({
  drawingToolsControl: false,
  fullscreenControl:   false,
  mapTypeControl:      false,
  scaleControl:        false,
  zoomControl:         true,
  layerList:           true
});

// Permanently remove drawing tools (pencil toolbar) — run at startup
var dt = Map.drawingTools();
dt.setShown(false);
dt.setLinked(false);
// Delete all existing drawn layers so toolbar has nothing to attach to
while (dt.layers().length() > 0) {
  dt.layers().remove(dt.layers().get(0));
}

// =============================================================================
// PART 1B: MAP LEGEND (bilingual, bottom-left)
// =============================================================================

var legendDefs = [
  {code: 1,  en: 'Level Plain (LP)',                ar: 'سهل مستوٍ',                   color: '1a9850'},
  {code: 2,  en: 'Nearly Flat Plain (NFP)',          ar: 'سهل شبه مستوٍ',               color: '66bd63'},
  {code: 3,  en: 'Undulating Plain (UP)',            ar: 'سهل متموج',                   color: 'a6d96a'},
  {code: 4,  en: 'Rolling Plain (RP)',               ar: 'سهل متموج بشدة',              color: 'fdae61'},
  {code: 5,  en: 'Upper Convex Slope (UCS)',         ar: 'منحدر علوي محدب',             color: 'd73027'},
  {code: 6,  en: 'Lower Concave Slope (LCS)',        ar: 'منحدر سفلي مقعر',             color: '4575b4'},
  {code: 7,  en: 'Local Ridge (LR)',                 ar: 'نتوء محلي',                   color: 'fee08b'},
  {code: 8,  en: 'Local Depression (LD)',            ar: 'منخفض محلي',                  color: '313695'},
  {code: 9,  en: 'Drainage Swale (DS)',              ar: 'مجرى تصريف',                  color: '08306b'},
  {code: 10, en: 'Footslope Depositional Zone (FDZ)',ar: 'منطقة ترسيب سفح المنحدر',     color: '732a88'}
];

var palette = legendDefs.map(function(d) { return d.color; });

var mapLegendPanel = null;

function buildMapLegend() {
  if (mapLegendPanel) { Map.remove(mapLegendPanel); }

  mapLegendPanel = ui.Panel({
    style: {
      position: 'bottom-left',
      padding: '8px 12px',
      backgroundColor: 'rgba(255,255,255,0.92)'
    }
  });

  mapLegendPanel.add(ui.Label({
    value: 'Akre Geomorphological Units  |  الوحدات الجيومورفولوجية',
    style: {fontWeight: 'bold', fontSize: '12px', margin: '0 0 6px 0'}
  }));

  legendDefs.forEach(function(item) {
    var colorBox = ui.Label({
      style: {
        backgroundColor: '#' + item.color,
        padding: '7px', margin: '2px 6px 2px 0',
        border: '1px solid #999'
      }
    });
    var desc = ui.Label({
      value: item.code + ': ' + item.en + '  /  ' + item.ar,
      style: {fontSize: '10px', margin: '3px 0'}
    });
    mapLegendPanel.add(ui.Panel(
      [colorBox, desc],
      ui.Panel.Layout.flow('horizontal')
    ));
  });

  Map.add(mapLegendPanel);
}

// =============================================================================
// PART 2: GLOBAL STATE + HELPERS
// =============================================================================

var g_classification, g_dem, g_aoi, g_dem_name, g_dem_resolution;

function updateStatus(msg, isError) {
  statusLabel.setValue('Status: ' + msg);
  statusLabel.style().set('color', isError ? 'c0392b' : '27ae60');
  statusLabel.style().set('backgroundColor', isError ? 'fadbd8' : 'eafaf1');
}

function safeNum(dict, key, fallback) {
  var hasKey = dict.contains(key);
  var raw    = ee.Algorithms.If(hasKey, dict.get(key), fallback);
  var isNull = ee.Algorithms.IsEqual(raw, null);
  return ee.Number(ee.Algorithms.If(isNull, fallback, raw));
}

// Curvature (Zevenbergen & Thorne, 1987)
function curvature(image, cellsize) {
  var Zxx = image.convolve(ee.Kernel.fixed(3, 3, [[1,-2,1],[1,-2,1],[1,-2,1]])).divide(cellsize * cellsize);
  var Zyy = image.convolve(ee.Kernel.fixed(3, 3, [[1,1,1],[-2,-2,-2],[1,1,1]])).divide(cellsize * cellsize);
  var Zxy = image.convolve(ee.Kernel.fixed(3, 3, [[1,0,-1],[0,0,0],[-1,0,1]])).divide(4 * cellsize * cellsize);
  var Zx  = image.convolve(ee.Kernel.fixed(3, 3, [[-1,0,1],[-1,0,1],[-1,0,1]])).divide(6 * cellsize);
  var Zy  = image.convolve(ee.Kernel.fixed(3, 3, [[-1,-1,-1],[0,0,0],[1,1,1]])).divide(6 * cellsize);

  var p = Zx.pow(2).add(Zy.pow(2));
  var q = p.add(1);

  var profileCurv = Zxx.multiply(Zx.pow(2))
    .add(Zyy.multiply(Zy.pow(2)))
    .add(Zxy.multiply(Zx).multiply(Zy).multiply(2))
    .divide(p.multiply(q.pow(1.5)).max(1e-9))
    .rename('profile_curvature');

  var planCurv = Zxx.multiply(Zy.pow(2))
    .subtract(Zxy.multiply(Zx).multiply(Zy).multiply(2))
    .add(Zyy.multiply(Zx.pow(2)))
    .divide(p.pow(1.5).max(1e-9))
    .rename('plan_curvature');

  return profileCurv.addBands(planCurv);
}

function tpiAt(dem_img, radiusMeters) {
  var kernel = ee.Kernel.circle(radiusMeters, 'meters');
  return dem_img.subtract(
    dem_img.reduceNeighborhood({reducer: ee.Reducer.mean(), kernel: kernel})
  ).rename('tpi_' + radiusMeters);
}

// =============================================================================
// PART 3: MAIN CLASSIFICATION FUNCTION
// =============================================================================

function clearMapLayers() {
  // Remove layers one by one — avoids Map.clear() which resets drawing tools
  while (Map.layers().length() > 0) {
    Map.remove(Map.layers().get(0));
  }
  // Remove map widgets (legend panels)
  while (Map.widgets().length() > 0) {
    Map.remove(Map.widgets().get(0));
  }
  // Re-suppress drawing tools (in case GEE re-enabled them)
  var dt = Map.drawingTools();
  dt.setShown(false);
  dt.setLinked(false);
  while (dt.layers().length() > 0) {
    dt.layers().remove(dt.layers().get(0));
  }
}

function runClassification() {
  clearMapLayers();
  mapLegendPanel = null;
  updateStatus('Initializing...', false);

  var tableId  = aoiTextbox.getValue().trim();
  var demSource = demSelect.getValue();

  if (!tableId) {
    updateStatus('Error: enter Table ID', true);
    return;
  }

  // --- AOI ---
  var akreFC = ee.FeatureCollection(tableId);
  var aoi    = akreFC.geometry();
  g_aoi = akreFC;
  Map.centerObject(aoi, 12);
  Map.addLayer(akreFC, {color: 'red'}, 'Akre boundary', true, 0.5);

  // --- DEM ---
  updateStatus('Loading DEM...', false);
  var dem, demScale;

  switch (demSource) {
    case 'COPERNICUS':
      dem      = ee.ImageCollection('COPERNICUS/DEM/GLO30').mosaic().select('DEM').clip(aoi);
      demScale = 30;
      g_dem_name = 'Copernicus_GLO30';
      break;
    case 'ALOS':
      dem      = ee.ImageCollection('JAXA/ALOS/AW3D30/V3_2').select('DSM').mosaic().clip(aoi);
      demScale = 30;
      g_dem_name = 'ALOS_AW3D30';
      break;
    case 'ALOS_12_5':
      dem      = ee.ImageCollection('JAXA/ALOS/AW3D30/V3_2').select('DSM').mosaic()
                   .resample('bilinear').reproject({crs: 'EPSG:4326', scale: 12.5}).clip(aoi);
      demScale = 12.5;
      g_dem_name = 'ALOS_12_5m';
      break;
    default: // SRTM
      dem      = ee.Image('USGS/SRTMGL1_003').clip(aoi);
      demScale = 30;
      g_dem_name = 'SRTM_30m';
  }

  g_dem = dem;
  g_dem_resolution = demScale;

  // --- TERRAIN DERIVATIVES ---
  updateStatus('Computing terrain derivatives...', false);

  var slopeDeg = ee.Terrain.slope(dem);
  var slopePct = slopeDeg.expression(
    'tan(s * pi / 180) * 100', {s: slopeDeg, pi: Math.PI}
  ).rename('slope_pct');

  var curv        = curvature(dem, demScale);
  var profileCurv = curv.select('profile_curvature');
  var planCurv    = curv.select('plan_curvature');

  var tpiLocal    = tpiAt(dem, 100);
  var tpiMedium   = tpiAt(dem, 300);
  var tpiBroad    = tpiAt(dem, 1000);
  var tpiCombined = tpiLocal.add(tpiMedium).add(tpiBroad).divide(3).rename('tpi_combined');

  var reliefKernel   = ee.Kernel.circle(300, 'meters');
  var relativeRelief = dem.reduceNeighborhood({reducer: ee.Reducer.max(), kernel: reliefKernel})
    .subtract(dem.reduceNeighborhood({reducer: ee.Reducer.min(), kernel: reliefKernel}))
    .rename('relative_relief');

  var slopeRad  = slopeDeg.multiply(Math.PI / 180);
  var twiApprox = ee.Image(1).divide(slopeRad.tan().max(0.01))
    .add(tpiCombined.multiply(-1).max(0))
    .log()
    .rename('twi_approx');

  // --- THRESHOLDS (single merged reduceRegion call) ---
  updateStatus('Computing thresholds...', false);

  var stack = slopePct.rename('slope')
    .addBands(tpiCombined)
    .addBands(relativeRelief)
    .addBands(twiApprox);

  var statsDict = ee.Dictionary(stack.reduceRegion({
    reducer: ee.Reducer.percentile([25, 50, 75, 90])
      .combine(ee.Reducer.mean(), '', true)
      .combine(ee.Reducer.stdDev(), '', true),
    geometry: aoi,
    scale: demScale,
    maxPixels: 1e10,
    bestEffort: true,
    tileScale: 4
  }));

  var slopeP25 = safeNum(statsDict, 'slope_p25', 0);
  var slopeP50 = safeNum(statsDict, 'slope_p50', 0);
  var slopeP75 = safeNum(statsDict, 'slope_p75', 0);
  var rrP25    = safeNum(statsDict, 'relative_relief_p25', 0);
  var rrP50    = safeNum(statsDict, 'relative_relief_p50', 0);
  var rrP75    = safeNum(statsDict, 'relative_relief_p75', 0);
  var twiP75   = safeNum(statsDict, 'twi_approx_p75', 0);
  var twiP90   = safeNum(statsDict, 'twi_approx_p90', 0);
  var tpiMean  = safeNum(statsDict, 'tpi_combined_mean', 0);
  var tpiStd   = safeNum(statsDict, 'tpi_combined_stdDev', 0.001).max(0.001);

  var tpiZ = tpiCombined.subtract(tpiMean).divide(tpiStd).rename('tpi_z');

  // --- CLASSIFICATION (10 units, original priority order) ---
  updateStatus('Classifying...', false);

  var classified = ee.Image(0).rename('landform');

  classified = classified.where(
    tpiZ.lt(-1).and(planCurv.gt(0)).and(twiApprox.gt(twiP90)), 9);        // Drainage Swale

  classified = classified.where(
    tpiZ.lt(-1).and(twiApprox.gt(twiP75)).and(classified.eq(0)), 8);      // Local Depression

  classified = classified.where(
    tpiZ.gt(1).and(classified.eq(0)), 7);                                  // Local Ridge

  classified = classified.where(
    slopePct.gt(slopeP50).and(profileCurv.gt(0)).and(tpiZ.lt(0)).and(classified.eq(0)), 6); // Lower Concave Slope

  classified = classified.where(
    slopePct.gt(slopeP50).and(profileCurv.lt(0)).and(tpiZ.gt(0)).and(classified.eq(0)), 5); // Upper Convex Slope

  classified = classified.where(
    slopePct.lte(slopeP25).and(profileCurv.gt(0)).and(twiApprox.gt(twiP75)).and(classified.eq(0)), 10); // Footslope

  classified = classified.where(
    slopePct.gt(slopeP75).and(relativeRelief.gt(rrP75)).and(classified.eq(0)), 4);          // Rolling Plain

  classified = classified.where(
    slopePct.gt(slopeP50).and(slopePct.lte(slopeP75))
      .and(relativeRelief.gt(rrP50)).and(relativeRelief.lte(rrP75))
      .and(classified.eq(0)), 3);                                          // Undulating Plain

  classified = classified.where(
    slopePct.gt(slopeP25).and(slopePct.lte(slopeP50))
      .and(relativeRelief.gt(rrP25)).and(relativeRelief.lte(rrP50))
      .and(classified.eq(0)), 2);                                          // Nearly Flat Plain

  classified = classified.where(
    slopePct.lte(slopeP25).and(relativeRelief.lte(rrP25)).and(classified.eq(0)), 1);        // Level Plain

  classified = classified.where(classified.eq(0), 2)  // edge fallback
    .updateMask(dem.mask())
    .clip(aoi)
    .rename('landform');

  g_classification = classified;

  // --- VISUALIZATION ---
  Map.addLayer(dem,
    {min: 0, max: 1000, palette: ['blue','green','yellow','brown','white']},
    'DEM', false);
  Map.addLayer(slopePct,
    {min: 0, max: 30, palette: ['ffffcc','f1b973','de4968','921e6e','440154']},
    'Slope (%)', false);
  Map.addLayer(tpiCombined,
    {min: -20, max: 20, palette: ['d73027','fc8d59','fee090','e0f3f8','91bfdb','4575b4']},
    'TPI Combined', false);
  Map.addLayer(relativeRelief,
    {min: 0, max: 50, palette: ['440154','31688e','35b779','fde725']},
    'Relative Relief', false);
  Map.addLayer(classified,
    {min: 1, max: 10, palette: palette},
    'Akre Geomorphological Units', true);

  buildMapLegend();
  exportPanel.style().set('shown', true);

  updateStatus('Done! Use export button to save.', false);
}

// =============================================================================
// PART 4: EXPORT (raster only)
// =============================================================================

exportRasterBtn.onClick(function() {
  if (!g_classification) {
    updateStatus('Run classification first.', true);
    return;
  }
  Export.image.toDrive({
    image: g_classification,
    description: 'akre_geomorphic_classification_' + g_dem_name,
    folder: 'GEE_Akre_Exports',
    scale: g_dem_resolution,
    region: g_aoi.geometry(),
    crs: 'EPSG:4326',
    maxPixels: 1e10
  });
  updateStatus('Export task created — check Tasks tab.', false);
});

runButton.onClick(runClassification);

print('=== Akre Geomorphological Classification App Loaded ===');
print('1. Enter FeatureCollection Table ID');
print('2. Select DEM source');
print('3. Click RUN CLASSIFICATION');
