import { Box3, BufferGeometry, Vector3 } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

import type { Axis } from '../scene/types';

const bbox = new Box3();
const size = new Vector3();

export type LoadedStlModel = {
	geometry: BufferGeometry;
	sourceDimensions: Record<Axis, number>;
};

function toDimensions(vec: Vector3): Record<Axis, number> {
	return { x: vec.x, y: vec.y, z: vec.z };
}

export function loadStlFromArrayBuffer(arrayBuffer: ArrayBuffer): LoadedStlModel {
	const loader = new STLLoader();
	const geometry = loader.parse(arrayBuffer);

	geometry.computeBoundingBox();
	if (geometry.boundingBox) {
		bbox.copy(geometry.boundingBox);
		bbox.getSize(size);
	} else {
		size.set(0, 0, 0);
	}

	// Center the model so the stretch shader's "origin-centered" assumptions hold.
	geometry.center();

	// Ensure shading looks decent for typical STL inputs.
	geometry.computeVertexNormals();

	return {
		geometry,
		sourceDimensions: toDimensions(size),
	};
}
