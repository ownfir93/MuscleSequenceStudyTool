# BI231 Final Exam — Study Aid

A single-page (no build, no backend) study tool for BI231 Anatomy &amp; Physiology I, deployed on GitHub Pages.

**Live page:** https://ownfir93.github.io/MuscleSequenceStudyTool/

## What's covered

Grounded in the BI231 (Fall 2025) sources:
- **Final exam study guide** — every numbered topic
- **Lab 6: Axial Muscles** — head, neck, back, anterior torso (~22 muscles)
- **Lab 7: Muscles of the Limbs** — shoulder, arm, forearm, hip, thigh, leg (~50 muscles)
- **Lab 8: Nervous Tissue &amp; Spinal Cord** — neuron anatomy, plexuses, reflexes

## Sections

- 🧠 **Nervous Tissue** — divisions, glia (Schwann / oligodendrocytes / astrocytes / ependymal / microglia / satellite), neuron anatomy and transmembrane proteins, AP phases, graded potentials, refractory periods, botulism, myelin
- 💪 **Muscle Tissue** — sarcomere, CT layers, NMJ, sliding filament, contraction types, motor units, metabolism, fatigue. Includes the original 9-step Sequence of Muscle Contraction with the cross-bridge visualization
- 🔗 **Spinal Cord &amp; Reflexes** — cord cross-section, dorsal vs ventral roots, 31 nerve pairs, plexuses (cervical / brachial / lumbar / sacral), 3-order sensory tracts, reflex types (stretch / DTR / withdrawal / crossed extensor / pupillary)
- 🗿 **Axial Muscles** — Lab 6 list with Origin / Insertion / Action; filterable by region
- 🦵 **Limb Muscles** — Lab 7 list with O/I/A, tagged with SITS / Hamstring / Quad groupings
- 🎯 **Visualizer**
  - 🧍 **3D Muscle Viewer** — rotate, zoom, click muscles to label. Uses BodyParts3D meshes (~80 muscles + skeleton landmarks). Quiz modes: "Find the X" and "ID this muscle"
  - 🗺️ **2D Body Map** — clickable anterior/posterior silhouette; works on phone
  - ⚡ **Action Potential** — animated graph with phase tags + ion-channel explanations
  - 🔄 **Reflex Arc** — patellar reflex step-through (receptor → sensory → cord → motor → effector)
- 🎮 **Quiz Hub** — random questions sampled across every section, with streak scoring

## Study modes per content section

- 📖 Learn — long-form notes with colour-coded key terms
- 🃏 Flashcards — hint-based recall with "Known" tracking
- 🎯 Quiz — multi-choice from the question pool
- ✍️ Fill Blanks — multi-choice cloze on the key terms
- 🔢 Order It — sequence drag-to-place
- 🎮 Visualize — animated SVG with quiz-to-advance (muscle contraction sequence)
- 📋 List + 🎯 O / I / A Match (muscle sections)

Progress saves in `localStorage`.

## 3D model attribution

3D meshes © **BodyParts3D**, The Database Center for Life Science (DBCLS) — licensed under [CC-BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en). Models are stored under `models/` as `.obj` files keyed by FMA ontology IDs; see `models/manifest.json` for the human-readable map.

Source: `https://dbarchive.biosciencedbc.jp/en/bodyparts3d/`

## Files

```
index.html        page shell
css/style.css     all styling
js/data.js        all study content (single source of truth)
js/engine.js      section nav, study modes, persistence
js/viz.js         3D viewer, 2D map, AP graph, reflex arc
models/           BodyParts3D OBJ files + manifest.json
```

No build step, no dependencies installed locally — Three.js is loaded from a CDN via an import map. Open `index.html` in any modern browser.
