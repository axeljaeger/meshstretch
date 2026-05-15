import { GizmoHelper, GizmoViewcube, OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { useCallback, useRef, useState } from 'react';

import type { Mesh, Object3D } from 'three';
import './App.css';
import Box from './scene/components/Box';
import CubeMeasurements from './scene/components/CubeMeasurements';
import Planes from './scene/components/Planes';
import SceneLights from './scene/components/SceneLights';
import { HALF_CUBE_SIZE, PLANE_OFFSET } from './scene/constants';
import { PLANE_CONFIGS } from './scene/planeConfigs';
import type { Axis, PlaneId } from './scene/types';
import Toolbar from './Toolbar';

const AXIS_INDICES: Record<Axis, 0 | 1 | 2> = {
	x: 0,
	y: 1,
	z: 2,
};

const AXIS_PLANE_IDS: Record<Axis, [PlaneId, PlaneId]> = {
	x: ['nx', 'px'],
	y: ['ny', 'py'],
	z: ['nz', 'pz'],
};

const PLANE_BOUNDS = HALF_CUBE_SIZE + PLANE_OFFSET;
const MIN_PLANE_GAP = 0.25;

function getAxisByPlaneId(id: PlaneId): Axis {
	if (id === 'px' || id === 'nx') {
		return 'x';
	}

	if (id === 'py' || id === 'ny') {
		return 'y';
	}

	return 'z';
}

function createInitialPlanePositions() {
	return Object.fromEntries(PLANE_CONFIGS.map((plane) => [plane.id, [...plane.position]])) as Record<
		PlaneId,
		[number, number, number]
	>;
}

function App() {
	const [isCubeSelected, setIsCubeSelected] = useState(false);
	const [selectedCubeObject, setSelectedCubeObject] = useState<Object3D | null>(null);
	const [selectedAxis, setSelectedAxis] = useState<Axis | null>(null);
	const [isPlaneHandleDragging, setIsPlaneHandleDragging] = useState(false);
	const [isPlaneHandleHovered, setIsPlaneHandleHovered] = useState(false);
	const [planePositions, setPlanePositions] = useState<Record<PlaneId, [number, number, number]>>(
		createInitialPlanePositions,
	);
	const ignoreNextPointerMissedRef = useRef(false);

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
			setSelectedAxis(null);
		},
		[],
	);

	const handleAxisSelect = useCallback((axis: Axis) => {
		setIsCubeSelected(false);
		setSelectedAxis(axis);
		setIsPlaneHandleHovered(false);
		ignoreNextPointerMissedRef.current = true;
	}, []);

	const handlePlaneHandleDraggingChange = useCallback((dragging: boolean) => {
		setIsPlaneHandleDragging(dragging);
	}, []);

	const handlePlaneHandleHoverChange = useCallback((hovered: boolean) => {
		setIsPlaneHandleHovered(hovered);
	}, []);

	const handlePlaneHandleMove = useCallback((planeId: PlaneId, nextAxisValue: number) => {
		setPlanePositions((current) => {
			const axis = getAxisByPlaneId(planeId);
			const axisIndex = AXIS_INDICES[axis];
			const [negativePlaneId, positivePlaneId] = AXIS_PLANE_IDS[axis];

			const negativeValue = current[negativePlaneId][axisIndex];
			const positiveValue = current[positivePlaneId][axisIndex];
			let nextValue = nextAxisValue;

			if (planeId === negativePlaneId) {
				nextValue = Math.max(-PLANE_BOUNDS, Math.min(nextValue, positiveValue - MIN_PLANE_GAP));
			} else {
				nextValue = Math.min(PLANE_BOUNDS, Math.max(nextValue, negativeValue + MIN_PLANE_GAP));
			}

			if (Math.abs(nextValue - current[planeId][axisIndex]) < 0.0001) {
				return current;
			}

			const updatedPosition: [number, number, number] = [...current[planeId]] as [
				number,
				number,
				number,
			];
			updatedPosition[axisIndex] = nextValue;

			return {
				...current,
				[planeId]: updatedPosition,
			};
		});
	}, []);

	const handleCanvasPointerMissed = useCallback((event: MouseEvent) => {
		if (ignoreNextPointerMissedRef.current) {
			ignoreNextPointerMissedRef.current = false;
			return;
		}

		const target = event.target;
		if (target instanceof Element && target.closest('.dimension-label')) {
			return;
		}

		setIsCubeSelected(false);
		setSelectedAxis(null);
		setIsPlaneHandleHovered(false);
	}, []);

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
				<CubeMeasurements
					cubeObject={selectedCubeObject}
					planePositions={planePositions}
					selectedAxis={selectedAxis}
					onAxisSelect={handleAxisSelect}
					onPlaneHandleMove={handlePlaneHandleMove}
					onPlaneHandleDraggingChange={handlePlaneHandleDraggingChange}
					onPlaneHandleHoverChange={handlePlaneHandleHoverChange}
				/>

				<Planes
					planes={PLANE_CONFIGS}
					planePositions={planePositions}
					selectedAxis={selectedAxis}
					visible={selectedAxis !== null && (isPlaneHandleHovered || isPlaneHandleDragging)}
				/>

				<OrbitControls makeDefault enabled={!isPlaneHandleDragging} />

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
