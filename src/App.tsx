import { GizmoHelper, GizmoViewcube, OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { useCallback, useState } from 'react';

import type { Mesh, Object3D } from 'three';
import './App.css';
import Box from './scene/components/Box';
import Planes from './scene/components/Planes';
import SceneLights from './scene/components/SceneLights';
import SelectedCubeResizeGizmo from './scene/components/SelectedCubeResizeGizmo';
import SelectedPlaneGizmo from './scene/components/SelectedPlaneGizmo';
import usePlaneSelection from './scene/hooks/usePlaneSelection';
import { PLANE_CONFIGS } from './scene/planeConfigs';
import type { PlaneId } from './scene/types';
import Toolbar from './Toolbar';

function App() {
	const {
		selectedPlaneId,
		selectedPlaneObject,
		handlePlaneRef,
		handlePlaneSelect,
		clearSelection,
	} = usePlaneSelection();
	const [isCubeSelected, setIsCubeSelected] = useState(false);
	const [selectedCubeObject, setSelectedCubeObject] = useState<Object3D | null>(null);

	const selectedPlaneAxis =
		PLANE_CONFIGS.find((plane) => plane.id === selectedPlaneId)?.translationAxis ?? null;

	const handleBoxRef = useCallback((mesh: Mesh | null) => {
		if (!mesh) {
			return;
		}
		setSelectedCubeObject((current) => (current === mesh ? current : mesh));
	}, []);

	const handleCubeSelect = useCallback(
		(event: ThreeEvent<PointerEvent>) => {
			event.stopPropagation();
			setIsCubeSelected(true);
			clearSelection();
		},
		[clearSelection],
	);

	const handlePlanePointerDown = useCallback(
		(event: ThreeEvent<PointerEvent>, id: PlaneId) => {
			setIsCubeSelected(false);
			handlePlaneSelect(event, id);
		},
		[handlePlaneSelect],
	);

	const handleCanvasPointerMissed = useCallback(() => {
		setIsCubeSelected(false);
		clearSelection();
	}, [clearSelection]);

	return (
		<>
			<Canvas
				orthographic
				camera={{ zoom: 50, position: [10, 10, 10] }}
				onPointerMissed={handleCanvasPointerMissed}
			>
				<SceneLights />
				<Box
					position={[0, 0, 0]}
					selected={isCubeSelected}
					onBoxRef={handleBoxRef}
					onSelect={handleCubeSelect}
				/>

				<Planes
					planes={PLANE_CONFIGS}
					selectedPlaneId={selectedPlaneId}
					onPlaneRef={handlePlaneRef}
					onPlanePointerDown={handlePlanePointerDown}
				/>
				<SelectedPlaneGizmo
					selectedPlaneObject={selectedPlaneObject}
					selectedPlaneAxis={selectedPlaneAxis}
				/>
				<SelectedCubeResizeGizmo selectedCubeObject={selectedCubeObject} visible={isCubeSelected} />

				<OrbitControls makeDefault />

				<GizmoHelper
					alignment="top-right" // widget alignment within scene
					margin={[80, 80]}
				>
					<GizmoViewcube />
				</GizmoHelper>
			</Canvas>
			<Toolbar />
		</>
	);
}

export default App;
