import { TransformControls } from '@react-three/drei';

import type { Axis } from '../types';
import type { Object3D } from 'three';

type SelectedPlaneGizmoProps = {
	selectedPlaneObject: Object3D | null;
	selectedPlaneAxis: Axis | null;
};

function SelectedPlaneGizmo({ selectedPlaneObject, selectedPlaneAxis }: SelectedPlaneGizmoProps) {
	if (!selectedPlaneObject || !selectedPlaneAxis) {
		return null;
	}

	return (
		<TransformControls
			object={selectedPlaneObject}
			mode="translate"
			showX={selectedPlaneAxis === 'x'}
			showY={selectedPlaneAxis === 'y'}
			showZ={selectedPlaneAxis === 'z'}
		/>
	);
}

export default SelectedPlaneGizmo;