const M = require('./engine.js');
const cases = require('./expected.json').cases;
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) pass++; else { fail++; console.log('FAIL:', label); } }
function eqObj(a, b, label) {
  const ka = Object.keys(a), kb = Object.keys(b);
  ok(ka.length === kb.length, label + ' key count');
  for (const k of ka) {
    const va = a[k], vb = b[k];
    if (typeof va === 'number' && typeof vb === 'number') ok(va === vb, label + '.' + k + ' ' + va + ' vs ' + vb);
    else ok(va === vb, label + '.' + k + ' ' + JSON.stringify(va) + ' vs ' + JSON.stringify(vb));
  }
}
for (const c of cases) eqObj(M[c.kind](...c.args), c.out, c.kind + '(' + c.args.join(',') + ')');
// anchors
const s1 = M.settings('birch', 3, 10);
ok(s1.speed === 300 && s1.passes === 1 && s1.verdict.startsWith('workable'), 'anchor birch 3mm 10W');
const s2 = M.settings('pvc', 3, 40);
ok(s2.neverCut === true && s2.verdict.indexOf('chlorine') > -1, 'anchor PVC never');
const k1 = M.kerfFit(0.2, 'box');
ok(k1.edgeOffset === 0.1, 'anchor kerf half');
// properties
ok(M.settings('birch', 6, 10).passes > M.settings('birch', 3, 10).passes, 'thicker more passes');
ok(M.settings('birch', 3, 20).speed > M.settings('birch', 3, 10).speed, 'more watts more speed');
ok(M.settings('birch', 12, 10).verdict.startsWith('beyond practical'), 'thick verdict');
ok(M.settings('hardwood', 3, 10).speed < M.settings('card', 3, 10).speed, 'hardwood slower than card');
// errors
function throws(fn, msg) { try { fn(); return false; } catch (e) { return e.message === msg; } }
ok(throws(() => M.settings('unobtanium', 3, 10), 'unknown material'), 'bad material');
ok(throws(() => M.settings('birch', 0, 10), 'thickness must be positive'), 'zero thickness');
ok(throws(() => M.settings('birch', NaN, 10), 'thickness must be a number'), 'NaN thickness');
ok(throws(() => M.settings('birch', 3, 0), 'laser watts must be positive'), 'zero watts');
ok(throws(() => M.kerfFit(0.1, 'dovetail'), 'unknown fit kind'), 'bad kind');
ok(throws(() => M.kerfFit(0, 'box'), 'kerf must be positive'), 'zero kerf');
ok(throws(() => M.diagnose('smoke', 10, 300, 1), 'unknown symptom'), 'bad symptom');
ok(throws(() => M.diagnose('incomplete', 10, 0, 1), 'speed must be positive'), 'zero speed');
console.log(pass + '/' + (pass + fail) + ' checks pass');
process.exit(fail ? 1 : 0);
