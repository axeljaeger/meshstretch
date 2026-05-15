import type { ThreeEvent } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';

import { DEFAULT_SELECTED_PLANE_ID } from '../constants';
import type { PlaneId } from '../types';
import type { Mesh, Object3D } from 'three';

function usePlaneSelection() {
	const [selectedPlaneId, setSelectedPlaneId] = useState<PlaneId | null>(DEFAULT_SELECTED_PLANE_ID);
	const [selectedPlaneObject, setSelectedPlaneObject] = useState<Object3D | null>(null);
	const planeObjectsRef = useRef<Partial<Record<PlaneId, Object3D>>>({});

	const handlePlaneRef = useCallback(
		(id: PlaneId, mesh: Mesh | null) => {
			if (!mesh) {
				return;
			}

			planeObjectsRef.current[id] = mesh;
			if (selectedPlaneId === id) {
				setSelectedPlaneObject((current) => (current === mesh ? current : mesh));
			}
		},
		[selectedPlaneId],
	);

	const handlePlaneSelect = useCallback((event: ThreeEvent<PointerEvent>, id: PlaneId) => {
		event.stopPropagation();
		setSelectedPlaneId(id);
		setSelectedPlaneObject(planeObjectsRef.current[id] ?? null);
	}, []);

	const clearSelection = useCallback(() => {
		setSelectedPlaneId(null);
		setSelectedPlaneObject(null);
	}, []);

	return {
		selectedPlaneId,
		selectedPlaneObject,
		handlePlaneRef,
		handlePlaneSelect,
		clearSelection,
	};
}

export default usePlaneSelection;