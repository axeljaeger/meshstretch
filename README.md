# Meshstretch

Meshstretch is a tool for **resizing 3D meshes without uniformly scaling every part of the model**.

The core idea is similar to **CSS `border-image`** or **9-patch scaling**, but applied to 3D geometry: some ranges along each coordinate axis stay fixed, while the space between them is stretched or compressed.

## Scope

The application is meant for adapting existing 3D models when no parametric source model is available.

Typical examples:

- A box with rounded edges where the corner radius should stay unchanged while the center body becomes wider, taller, or deeper.
- A plate with four holes where the holes should keep their diameter and placement relative to the outer edges, while only the material between them stretches.
- Any pre-modeled printable part where local geometric features must remain intact, but the overall dimensions need adjustment.

In short, the product goal is:

> **Resize a mesh while preserving designated fixed regions along the X, Y, and Z axes.**

## Core concept

For each axis, the mesh is conceptually split into three parts:

1. **Fixed start range**
2. **Stretch range**
3. **Fixed end range**

When the target size changes:

- the fixed start and end ranges keep their original extent
- the stretch range absorbs the size difference
- geometry after a stretched region may be translated, but should not itself be deformed if it belongs to a fixed range

This is the basis for the deformation logic.

## Common terms

These are the terms we should use consistently when working on the app.

| Term | Meaning | Current implementation term |
| --- | --- | --- |
| **source mesh** | The original, unmodified mesh before resizing | currently represented by the built-in prototype box |
| **target size** | The desired final width/height/depth after deformation | `targetSize` |
| **axis** | One of `x`, `y`, `z` | `Axis` |
| **fixed start range** | The preserved region near the negative side of an axis | `fixedInsetMin` |
| **fixed end range** | The preserved region near the positive side of an axis | `fixedInsetMax` |
| **stretch range** | The middle region between the two fixed ranges that is allowed to deform | derived from source size minus fixed insets |
| **plane handle** | The draggable boundary that defines where a fixed range ends and the stretch range begins | `planePositions`, `Planes`, plane ids like `nx`, `px` |
| **deformation shader** | The shader logic that maps source vertex positions to stretched positions | custom vertex shader in `Box.tsx` |
| **fixed-range highlight** | Visual feedback showing which parts are preserved instead of stretched | custom fragment shader in `Box.tsx` |

## Intended user workflow

The intended UX is:

1. The user loads an existing 3D model.
2. The user selects an axis.
3. The user defines two fixed ranges on that axis: one near the start, one near the end.
4. The application stretches only the region between those ranges.
5. The user repeats this for X, Y, and Z as needed.
6. The resized result remains printable and preserves important local features.

## Current prototype status

The current implementation already proves the main interaction model and the core deformation approach:

- A **prototype rounded box** is rendered in a 3D editor scene.
- The user can select **X, Y, or Z** and define two fixed ranges for that axis using draggable planes.
- The user can also edit the resulting dimensions numerically.
- A custom **vertex shader** deforms the mesh based on source size, target size, and fixed insets.

What is **not implemented yet**:

- Uploading arbitrary user models
- Mapping this workflow onto imported mesh data instead of the built-in demo geometry
- A real toolbar or project-level editing workflow

## Known implementation notes

- The current demo mesh is a **rounded box**, which is a good stand-in for the "preserve corner radius" use case.
- The implementation currently models the fixed ranges as **insets from the negative and positive side of each axis**, rather than as free-form arbitrary regions.
- The **vertex deformation path is already working** in the prototype.
- The prototype currently includes **fragment-shader-based fixed-range highlighting** for the selected axis.

## Current architecture

- `src/App.tsx` composes the editor shell and scene.
- `src/scene/useStretchEditor.ts` owns the stretch specification and derives dimensions, fixed insets, and plane positions.
- `src/scene/components/StretchableMesh.tsx` and `src/scene/shaders/stretchShader.ts` contain the deformation shader and render the prototype mesh.
- `src/scene/components/CubeMeasurements.tsx` provides the measurement UI, dimension editing, and plane-handle interaction.
- `src/scene/components/Planes.tsx` renders the guide planes that define the fixed-range boundaries.

## Non-goals for the current prototype

These are not yet part of the implemented scope:

- General-purpose CAD editing
- Parametric model authoring
- Arbitrary feature detection on imported meshes
- Automatic identification of which regions should stay fixed

The current prototype is specifically about **manual definition of preserved ranges plus shader-driven deformation**.

## Development

- `npm run dev` - start the Vite app
- `npm run build` - production build
- `npm run lint` - lint the codebase
- `npm run storybook` - run Storybook
