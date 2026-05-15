import { TransformControls } from '@react-three/drei';

import type { Object3D } from 'three';

type SelectedCubeResizeGizmoProps = {
	selectedCubeObject: Object3D | null;
	visible: boolean;
};

function SelectedCubeResizeGizmo({ selectedCubeObject, visible }: SelectedCubeResizeGizmoProps) {
	if (!visible || !selectedCubeObject) {
		return null;
	}

	return (
		<TransformControls
			object={selectedCubeObject}
			mode="scale"
			showX
			showY
			showZ
		/>
	);
}

export default SelectedCubeResizeGizmo;
