/* Laser math engine.
   Exact kerf geometry plus labeled settings guidance for hobby lasers.
   Settings are illustrative starting points from published community tables.
   Fire boundary: never run a laser unattended; vinyl/PVC is never cut - chlorine gas. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.Lasermath = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  // Labeled guidance: hobby-diode reference class 10W, speed in mm/min at 3mm single pass.
  const MATERIALS = {
    birch:   { label: 'birch plywood',   refSpeed: 300,  maxMm: 6, neverCut: false, note: 'glue layers char - expect dark edges' },
    mdf:     { label: 'MDF',             refSpeed: 250,  maxMm: 6, neverCut: false, note: 'cuts clean, makes smoke - ventilate' },
    acrylic: { label: 'cast acrylic',    refSpeed: 280,  maxMm: 8, neverCut: false, note: 'cast cuts and engraves; extruded melts - check which you have' },
    hardwood:{ label: 'hardwood',        refSpeed: 180,  maxMm: 4, neverCut: false, note: 'dense grain drinks power' },
    leather: { label: 'veg-tan leather', refSpeed: 500,  maxMm: 2, neverCut: false, note: 'veg-tan only - chrome-tan fumes are toxic' },
    card:    { label: 'cardboard',       refSpeed: 1200, maxMm: 3, neverCut: false, note: 'fast and flammable - air assist on, eyes on' },
    pvc:     { label: 'vinyl / PVC',     refSpeed: 0,    maxMm: 0, neverCut: true,  note: 'never laser vinyl or PVC - it releases chlorine gas (published safety fact)' }
  };
  const REF_WATTS = 10;

  function mat(key) {
    const m = MATERIALS[key];
    if (!m) throw new Error('unknown material');
    return m;
  }
  function pos(v, name) {
    if (typeof v !== 'number' || !isFinite(v)) throw new Error(name + ' must be a number');
    if (v <= 0) throw new Error(name + ' must be positive');
  }

  function settings(matKey, thicknessMm, watts) {
    const m = mat(matKey);
    pos(thicknessMm, 'thickness');
    pos(watts, 'laser watts');
    if (m.neverCut) return { neverCut: true, verdict: m.note, speed: 0, passes: 0, perPass: 0 };
    const perPass = 3 * watts / REF_WATTS;               // labeled model
    const passes = Math.ceil(thicknessMm / perPass);
    const speed = Math.round(m.refSpeed * (watts / REF_WATTS) * (3 / thicknessMm));
    let verdict;
    if (thicknessMm > m.maxMm) verdict = 'beyond practical for this class - extra passes char more than they cut (labeled)';
    else if (watts < 5) verdict = 'thin and slow at this power class (labeled guidance)';
    else verdict = 'workable starting point - test on scrap first (labeled guidance)';
    return { neverCut: false, speed: speed, passes: passes, perPass: Math.round(perPass * 100) / 100, verdict: verdict, note: m.note };
  }

  // Exact geometry: the beam removes kerf/2 from each exposed edge.
  function kerfFit(kerfMm, kind) {
    pos(kerfMm, 'kerf');
    const half = kerfMm / 2;
    if (kind === 'box') return {
      edgeOffset: half,
      note: 'grow fingers by ' + kerfMm + ' mm, shrink pockets by ' + kerfMm + ' mm (' + half + ' mm per side) - kerf eats both sides of every edge'
    };
    if (kind === 'inlay') return {
      edgeOffset: half,
      note: 'grow the inlay piece by ' + kerfMm + ' mm, shrink the pocket by ' + kerfMm + ' mm - the gap closes by exactly the kerf'
    };
    if (kind === 'press') return {
      edgeOffset: half,
      note: 'shrink holes by ' + kerfMm + ' mm (' + half + ' mm per side); test-fit once before the full sheet'
    };
    throw new Error('unknown fit kind');
  }

  function diagnose(symptom, watts, speedMmMin, passes) {
    pos(watts, 'laser watts');
    pos(speedMmMin, 'speed');
    pos(passes, 'passes');
    if (symptom === 'incomplete') {
      if (speedMmMin > 400) return { cause: 'speed outruns the watts', fix: 'halve the speed or add a pass (labeled)' };
      return { cause: 'the beam is not arriving', fix: 'check focus and air assist before touching speed (labeled)' };
    }
    if (symptom === 'charred') {
      if (passes > 3) return { cause: 'too many passes', fix: 'each pass re-heats the same kerf - raise power or slow one pass instead (labeled)' };
      return { cause: 'dwelling too long', fix: 'raise speed and add air assist (labeled)' };
    }
    if (symptom === 'flames') return { cause: 'active flame at the cut', fix: 'stop now - flames mean material, speed or air assist is wrong; never leave the machine (labeled)' };
    if (symptom === 'wavy') return { cause: 'mechanical, not settings', fix: 'check belts and rails - software cannot fix a loose gantry (labeled)' };
    throw new Error('unknown symptom');
  }

  return { settings: settings, kerfFit: kerfFit, diagnose: diagnose, materials: MATERIALS, refWatts: REF_WATTS };
});
