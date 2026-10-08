# Laser math

Settings, kerf fit, and why it failed - for hobby lasers. Kerf is geometry, not sanding.

**Live:** https://ilanis-agent.github.io/lasermath/

## What it computes

- **Your cut:** starting speed and pass count for 7 materials (birch ply, MDF, cast acrylic, hardwood, veg-tan leather, cardboard - and vinyl/PVC, which is never cut: chlorine gas) by thickness and wattage, with a feasibility verdict.
- **Kerf fit:** exact kerf compensation for box/finger joints, inlays and press-fit holes (kerf/2 per edge, grow fingers and inlay pieces, shrink pockets and holes).
- **Why it failed:** deterministic diagnosis for the four classic failures (incomplete, charred, flames, wavy) from power, speed and passes.

## Anchors and labels

Exact: kerf geometry (kerf/2 per edge), all arithmetic.

Labeled guidance (labeled in-app, and bounded by a fire-and-fume warning): the 10W reference-class speed table from published community settings, the linear power/thickness speed model, the 3mm-per-pass model, feasibility verdicts, diagnosis mappings. Safety facts: vinyl/PVC releases chlorine gas when lased (never cut); flames mean stop; never run unattended.

## Tests

`node test.js` - 181 independently generated python-oracle cases plus anchors, properties and error cases. `oracle.py` regenerates `expected.json`.
