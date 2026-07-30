# ATAF — Adaptive Terrain Attribute Framework
### An Adaptive Terrain Attribute Framework (ATAF) for Land Unit Classification and Agricultural Plain Delineation using GEO-Coding: A Case Study of Akre District, Northern Iraq

**إطار السمات التضاريسية التكيفي (ATAF) لتصنيف الوحدات الأرضية وترسيم السهول الزراعية باستخدام الترميز الجغرافي: دراسة حالة قضاء عقرة، شمال العراق**

---

## Abstract | الملخص

**EN —** This repository presents ATAF, a reproducible, DEM-based multi-criteria geomorphometric classification framework implemented as an interactive Google Earth Engine (GEE) application. The framework derives a set of primary and secondary terrain attributes from a Digital Elevation Model (DEM), applies data-driven (percentile- and z-score-based) statistical thresholds — rather than fixed, site-specific values — and classifies the terrain surface into ten geomorphological/land-unit classes ranging from level plains to local ridges, depressions, and drainage swales. The framework is demonstrated over the Akre Plain, Duhok Governorate, northern Iraq, and is designed to be transferable to any study area by supplying a different Area of Interest (AOI) asset.

**AR —** يقدّم هذا المستودع إطار "ATAF"، وهو إطار عمل جيومورفومتري متعدد المعايير قابل لإعادة الإنتاج، مبني على نموذج الارتفاع الرقمي (DEM)، ومُنفَّذ على هيئة تطبيق تفاعلي ضمن منصة Google Earth Engine (GEE). يستخرج الإطار مجموعة من السمات التضاريسية الأولية والثانوية من نموذج الارتفاع الرقمي، ويطبّق عتبات إحصائية مشتقة من البيانات نفسها (اعتمادًا على المئينات وقيم Z-score) بدلًا من قيم ثابتة مُسبقة التحديد، ليصنّف سطح التضاريس إلى عشر وحدات جيومورفولوجية/أرضية تتراوح بين السهول المستوية والنتوءات والمنخفضات المحلية ومجاري التصريف. طُبّق الإطار على سهل عقرة في محافظة دهوك، شمال العراق، وهو مصمم بحيث يمكن نقله وتطبيقه على أي منطقة دراسة أخرى بمجرد تزويده بمنطقة اهتمام (AOI) مختلفة.

**Keywords:** Digital Elevation Model (DEM), Geomorphometry, Terrain Classification, Google Earth Engine, Topographic Position Index (TPI), Curvature, Topographic Wetness Index (TWI), Agricultural Plain Delineation, Akre, Iraq.

**الكلمات المفتاحية:** نموذج الارتفاع الرقمي، الجيومورفومترية، تصنيف التضاريس، Google Earth Engine، مؤشر الموضع الطوبوغرافي، التقعر/التحدب، مؤشر الرطوبة الطوبوغرافي، ترسيم السهول الزراعية، عقرة، العراق.

---

## 1. Introduction | المقدمة

Traditional geomorphological mapping relies heavily on manual photo-interpretation and field survey, which are time-consuming and difficult to reproduce or scale. ATAF addresses this by encoding expert geomorphological knowledge as an automated, rule-based, multi-criteria decision system that runs entirely within the Google Earth Engine cloud-computing environment — requiring no local data download or GIS software installation.

يعتمد رسم الخرائط الجيومورفولوجية التقليدي بشكل كبير على التفسير المرئي اليدوي للصور والمسح الميداني، وهما أسلوبان يستهلكان وقتًا طويلًا ويصعب تكرارهما أو تعميمهما على نطاق واسع. يعالج إطار "ATAF" هذه المشكلة عبر ترميز المعرفة الجيومورفولوجية الخبيرة في نظام قرار آلي متعدد المعايير يعمل بالكامل ضمن بيئة الحوسبة السحابية لمنصة Google Earth Engine، دون الحاجة إلى تنزيل بيانات محلية أو تثبيت برمجيات نظم معلومات جغرافية (GIS).

## 2. Study Area | منطقة الدراسة

The framework is applied to the **Akre Plain**, located within Akre (Aqrah) District, Duhok Governorate, Kurdistan Region, northern Iraq — a piedmont plain transitioning between the Zagros foothills and the alluvial lowlands, characterized by a heterogeneous terrain that combines flat depositional surfaces, gently rolling land, and steeper slope segments.

طُبّق الإطار على **سهل عقرة**، الواقع ضمن قضاء عقرة التابع لمحافظة دهوك في إقليم كوردستان، شمال العراق — وهو سهل سفحي (Piedmont Plain) يمثّل منطقة انتقالية بين سفوح جبال زاكروس والأراضي المنخفضة الغرينية، ويتميّز بتضاريس غير متجانسة تجمع بين أسطح ترسيبية مستوية، وأراضٍ متموجة بلطف، وقطاعات منحدرة أكثر حدة.

## 3. Data | البيانات

| Layer / الطبقة | Source / المصدر | Resolution / الدقة | Notes / ملاحظات |
|---|---|---|---|
| Study Area (AOI) | User-supplied GEE `FeatureCollection` asset | Vector | يُدخل المستخدم معرّف الأصل (Asset ID) الخاص بحدود منطقة الدراسة |
| SRTM DEM | `USGS/SRTMGL1_003` | 30 m | الخيار الافتراضي |
| Copernicus GLO-30 | `COPERNICUS/DEM/GLO30` | 30 m | **موصى به** لدقّته العمودية العالية |
| ALOS AW3D30 | `JAXA/ALOS/AW3D30/V3_2` (band `DSM`) | 30 m | نموذج سطحي رقمي (DSM) |
| ALOS AW3D30 (High-Res) | نفس المصدر أعلاه، مُعاد إسقاطه (`bilinear resample`) | 12.5 m | لدراسات التضاريس عالية التفصيل |

All raster processing (mosaicking, clipping, resampling, and reprojection to `EPSG:4326`) is performed server-side on the GEE platform.

تُنفَّذ جميع عمليات معالجة البيانات النقطية (Raster) — مثل الدمج (Mosaicking)، والقص وفق حدود منطقة الدراسة، وإعادة أخذ العينات، وإعادة الإسقاط إلى `EPSG:4326` — بالكامل على خوادم منصة GEE.

## 4. Methodology | منهجية العمل

The ATAF workflow consists of six sequential stages, illustrated below and implemented end-to-end in the accompanying GEE script (`Code/ATAF_App.js`).

يتألف مسار عمل "ATAF" من ست مراحل متسلسلة، موضّحة في المخطط أدناه، ومُنفَّذة بالكامل ضمن سكربت GEE المرفق (`Code/ATAF_App.js`).

```
Stage 1 → Data Preparation           (AOI, DEM selection, clipping, no-data handling)
Stage 2 → Terrain Derivatives        (Elevation, Slope, TPI, Curvature, TWI, TRI, Roughness)
Stage 3 → Exploratory Statistics     (Mean/SD, Percentiles, Quantiles, Z-score)
Stage 4 → ATAF Classification        (Threshold-based multi-criteria decision rules → 10 classes)
Stage 5 → Model Validation           (Classification accuracy assessment)
Stage 6 → Final Outputs              (Classified map, GeoTIFF, legend, statistics)
```

### 4.1 Stage 1 — Data Preparation | إعداد البيانات
The user-defined AOI is loaded as a `FeatureCollection`, the selected DEM is clipped to its geometry, and no-data / anomalous elevation values are masked out before further processing.

يُحمَّل حد منطقة الدراسة (المُدخل من المستخدم) كطبقة `FeatureCollection`، ويُقصّ نموذج الارتفاع الرقمي المُختار وفق هذا الحد، وتُستبعد القيم المفقودة أو الشاذة قبل المتابعة بالمعالجة.

### 4.2 Stage 2 — Terrain Derivatives | استخلاص المشتقات التضاريسية
The following primary and secondary attributes are derived directly from the DEM:

تُستخرج السمات التضاريسية الأولية والثانوية التالية مباشرة من نموذج الارتفاع الرقمي:

| Attribute / السمة | Method / الطريقة |
|---|---|
| **Slope (%)** | `ee.Terrain.slope()`، مع تحويلها من الدرجات إلى النسبة المئوية عبر `tan(slope°) × 100` |
| **Profile & Plan Curvature** | معادلات Zevenbergen & Thorne (1987) المطبّقة عبر نوى تحويل (convolution kernels) من الدرجة الثانية على DEM |
| **Topographic Position Index (TPI)** | الفرق بين ارتفاع الخلية ومتوسط ارتفاع الخلايا المجاورة ضمن نصف أقطار متعددة (100م، 300م، 1000م)، ثم دمجها في مؤشر TPI مركّب (Weiss, 2001) |
| **Relative Relief** | الفرق بين أعلى وأدنى ارتفاع ضمن جوار دائري نصف قطره 300م |
| **Topographic Wetness Index (TWI)** | تقريب مبني على الانحدار (slope-based approximation)، إذ لا تتوفر خوارزمية تجميع تدفق أصلية (flow accumulation) ضمن GEE |

### 4.3 Stage 3 — Exploratory Statistical Analysis | التحليل الإحصائي الاستكشافي
Rather than using fixed, empirically-guessed thresholds, ATAF derives all classification thresholds **directly from the statistical distribution of each terrain attribute within the AOI itself**, using a single merged `reduceRegion()` call (percentiles 25/50/75/90, mean, and standard deviation) for computational efficiency. This makes the framework self-calibrating and transferable to other regions without manual re-tuning.

بدلًا من استخدام عتبات ثابتة يتم تخمينها تجريبيًا، يشتق إطار "ATAF" جميع عتبات التصنيف **مباشرة من التوزيع الإحصائي لكل سمة تضاريسية ضمن منطقة الدراسة ذاتها**، وذلك عبر استدعاء واحد مُدمَج لدالة `reduceRegion()` (يحسب المئينات 25/50/75/90 والمتوسط والانحراف المعياري) تحقيقًا للكفاءة الحاسوبية. يجعل هذا الأسلوب الإطار ذاتيّ المعايرة وقابلًا للنقل إلى مناطق أخرى دون الحاجة لإعادة ضبط يدوي.

### 4.4 Stage 4 — ATAF Classification Scheme | مخطط التصنيف

Ten land-unit / geomorphological classes are assigned using a prioritized, mutually-exclusive set of multi-criteria logical rules combining slope, curvature, TPI z-score, relative relief, and TWI:

تُحدَّد عشر وحدات أرضية/جيومورفولوجية باستخدام مجموعة من القواعد المنطقية متعددة المعايير، مرتّبة حسب الأولوية ومتنافية فيما بينها، تجمع بين الانحدار والتقعر/التحدب وقيمة Z لمؤشر TPI والارتفاع النسبي ومؤشر TWI:

| # | Class (EN) | الصنف (AR) | Governing criteria (simplified) |
|---|---|---|---|
| 1 | Level Plain (LP) | سهل مستوٍ | Slope ≤ P25, Relative Relief ≤ P25 |
| 2 | Nearly Flat Plain (NFP) | سهل شبه مستوٍ | P25 < Slope ≤ P50, P25 < Relief ≤ P50 |
| 3 | Undulating Plain (UP) | سهل متموج | P50 < Slope ≤ P75, P50 < Relief ≤ P75 |
| 4 | Rolling Plain (RP) | سهل متموج بشدة | Slope > P75, Relief > P75 |
| 5 | Upper Convex Slope (UCS) | منحدر علوي محدب | Slope > P50, Profile Curvature < 0, TPI-z > 0 |
| 6 | Lower Concave Slope (LCS) | منحدر سفلي مقعر | Slope > P50, Profile Curvature > 0, TPI-z < 0 |
| 7 | Local Ridge (LR) | نتوء محلي | TPI-z > 1 |
| 8 | Local Depression (LD) | منخفض محلي | TPI-z < −1, TWI > P75 |
| 9 | Drainage Swale (DS) | مجرى تصريف | TPI-z < −1, Plan Curvature > 0, TWI > P90 |
| 10 | Footslope Depositional Zone (FDZ) | منطقة ترسيب سفح المنحدر | Slope ≤ P25, Profile Curvature > 0, TWI > P75 |

*P25/P50/P75/P90 = the 25th/50th/75th/90th percentile of that attribute computed over the AOI (Stage 3). Rules are applied in descending priority order, so higher-priority classes (e.g., Drainage Swale) are locked in before lower-priority ones are evaluated on the remaining unclassified pixels.*

### 4.5 Stage 5 — Model Validation | التحقق من صحة النموذج
The classified surface should be validated against independent reference data (e.g., field-verified control points, high-resolution imagery interpretation, or existing geomorphological maps) using a confusion matrix and accuracy metrics (Overall Accuracy, Kappa coefficient, per-class Producer's/User's Accuracy).

يُوصى بالتحقق من صحة السطح المُصنَّف بمقارنته مع بيانات مرجعية مستقلة (نقاط ضبط ميدانية، أو تفسير صور عالية الدقة، أو خرائط جيومورفولوجية سابقة)، وذلك باستخدام مصفوفة الارتباك (Confusion Matrix) ومقاييس الدقة (الدقة الإجمالية، معامل كابا، ودقة المنتج والمستخدم لكل صنف).

### 4.6 Stage 6 — Final Outputs | المخرجات النهائية
- Interactive classified map with bilingual (EN/AR) legend, rendered directly on the GEE map canvas.
- Exportable classification raster (GeoTIFF, `EPSG:4326`, native DEM resolution) via `Export.image.toDrive()`.

- خريطة تصنيف تفاعلية مع مفتاح خريطة (Legend) ثنائي اللغة (عربي/إنجليزي)، تُعرض مباشرة على واجهة الخريطة في GEE.
- طبقة تصنيف نقطية (GeoTIFF) قابلة للتصدير بنظام الإسناد `EPSG:4326` وبدقة DEM الأصلية، عبر أمر `Export.image.toDrive()`.

## 5. Implementation & Usage | التنفيذ وطريقة الاستخدام

1. Open [Google Earth Engine Code Editor](https://code.earthengine.google.com/).
2. Paste the full script from `Code/ATAF_App.js` into a new script tab.
3. In the UI panel (top-right of the map), enter the Table ID of your own AOI `FeatureCollection` asset (default value points to the Akre Plain asset used in this study).
4. Select a DEM source from the dropdown (Copernicus GLO-30 is recommended for best vertical accuracy).
5. Click **▶ RUN CLASSIFICATION**.
6. Once the map renders, use **Export Classification (GeoTIFF)** to send the result to Google Drive.

1. افتح [محرر أكواد Google Earth Engine](https://code.earthengine.google.com/).
2. الصق السكربت الكامل من الملف `Code/ATAF_App.js` في تبويب سكربت جديد.
3. من لوحة التحكم (أعلى يمين الخريطة)، أدخل معرّف الأصل (Table ID) الخاص بمجموعة `FeatureCollection` لمنطقة دراستك (القيمة الافتراضية تشير إلى أصل سهل عقرة المستخدم في هذه الدراسة).
4. اختر مصدر نموذج الارتفاع الرقمي من القائمة المنسدلة (يُوصى باستخدام Copernicus GLO-30 لدقته العمودية العالية).
5. اضغط زر **▶ RUN CLASSIFICATION**.
6. بعد عرض الخريطة، استخدم زر **Export Classification (GeoTIFF)** لتصدير النتيجة إلى Google Drive.

##6.## Live Application | التطبيق المباشر

App Direct Link : https://drsameer-488014.projects.earthengine.app/view/ataf-v01

[![Open in Google Earth Engine](https://img.shields.io/badge/Open%20in-Google%20Earth%20Engine-4CAF50?logo=google&logoColor=white)](https://code.earthengine.google.com/31c06649debd0f95867c9d280b69d3fa)

> Click the badge above to launch the interactive ATAF app directly in GEE Code Editor.

## 7. Repository Structure | هيكلية المستودع

```
├── Code/
│   └── ATAF_App.js        # Full GEE interactive application (UI + processing + export)
├── README.md               # This documentation file
└── LICENSE
```

## 8. Requirements | المتطلبات

- A registered Google Earth Engine account (https://earthengine.google.com/).
- A GEE `FeatureCollection` asset representing the boundary of the study area.
- No local software installation is required — the entire pipeline runs in-browser via the GEE Code Editor.

- حساب مسجَّل على منصة Google Earth Engine.
- أصل من نوع `FeatureCollection` على GEE يمثّل حدود منطقة الدراسة.
- لا حاجة لتثبيت أي برمجية محلية — يعمل خط الأنابيب بالكامل داخل المتصفح عبر محرر أكواد GEE.

## 9. Limitations | القيود المنهجية

- TWI is a slope-based approximation rather than a true flow-accumulation-based index, since native hydrological flow-routing is not available within the GEE API.
- Classification thresholds are AOI-relative (percentile-based); results from different AOIs are not directly comparable in absolute terms without re-running on a shared extent.

- مؤشر TWI هو تقريب مبني على الانحدار وليس مؤشرًا حقيقيًا مبنيًا على تجميع التدفق الهيدرولوجي، نظرًا لعدم توفر خوارزميات توجيه التدفق الأصلية ضمن واجهة برمجة GEE.
- عتبات التصنيف نسبية لمنطقة الدراسة (مبنية على المئينات)؛ لذا لا تكون النتائج من مناطق دراسة مختلفة قابلة للمقارنة المباشرة بالقيم المطلقة دون إعادة التشغيل على نطاق مشترك.

## 10. How to Cite | طريقة الاستشهاد

> Akreyi, S. S. (2026). *An Adaptive Terrain Attribute Framework (ATAF) for Land Unit Classification and Agricultural Plain Delineation using GEO-Coding: A Case Study of Akre District, Northern Iraq* [Software]. Google Earth Engine implementation.

## 11. Author | إعداد

**This Framework Developed By: Asst. Prof. Dr. Sameer S. Akreyi © 2026**

**إعداد: أ.م.د. سمير س. عقراوي © 2026**

.

## References | المراجع

- Weiss, A. (2001). *Topographic Position and Landforms Analysis*. Poster presentation, ESRI User Conference, San Diego, CA.
- Zevenbergen, L. W., & Thorne, C. R. (1987). Quantitative analysis of land surface topography. *Earth Surface Processes and Landforms*, 12(1), 47–56.
- Beven, K. J., & Kirkby, M. J. (1979). A physically based, variable contributing area model of basin hydrology. *Hydrological Sciences Bulletin*, 24(1), 43–69.
- Gorelick, N., Hancher, M., Dixon, M., Ilyushchenko, S., Thau, D., & Moore, R. (2017). Google Earth Engine: Planetary-scale geospatial analysis for everyone. *Remote Sensing of Environment*, 202, 18–27.
