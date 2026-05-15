import { Html, Line } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';

import type { Object3D, Ray } from 'three';
import { Vector3 } from 'three';
import { CUBE_SIZE } from '../constants';
import type { Axis, PlaneId } from '../types';

type AxisMeasurements = {
	x: Measurement;
	y: Measurement;
	z: Measurement;
};

type Measurement = {
	id: Axis;
	value: number;
	meshStart: [number, number, number];
	meshEnd: [number, number, number];
	planeStart: [number, number, number];
	planeEnd: [number, number, number];
	stretchStart: [number, number, number];
	stretchEnd: [number, number, number];
	label: [number, number, number];
	axis: 'X' | 'Y' | 'Z';
	color: string;
	planes: {
		negative: PlaneId;
		positive: PlaneId;
	};
};

type CubeMeasurementsProps = {
	cubeObject: Object3D | null;
	planePositions: Record<PlaneId, [number, number, number]>;
	selectedAxis: Axis | null;
	onAxisSelect: (axis: Axis) => void;
	onPlaneHandleMove: (planeId: PlaneId, nextAxisValue: number) => void;
	onPlaneHandleDraggingChange?: (dragging: boolean) => void;
	onPlaneHandleHoverChange?: (hovered: boolean) => void;
	visible?: boolean;
};

const OFFSET = 0.9;
const EPSILON = 0.001;

const center = new Vector3();
const worldScale = new Vector3();

const axisIndices: Record<Axis, 0 | 1 | 2> = {
	x: 0,
	y: 1,
	z: 2,
};

const axisDirections: Record<Axis, Vector3> = {
	x: new Vector3(1, 0, 0),
	y: new Vector3(0, 1, 0),
	z: new Vector3(0, 0, 1),
};

const handleRadius = 0.18;
const dragSegmentHalfLength = 10;
const fixedSegmentColor = '#94a3b8';
const minVisibleSegment = 0.0001;

const segmentStart = new Vector3();
const segmentEnd = new Vector3();
const closestPointOnAxis = new Vector3();

type DragState = {
	planeId: PlaneId;
	axis: Axis;
	anchorPoint: Vector3;
	startPlaneAxisValue: number;
	startRayAxisValue: number;
};

function getRayAxisValue(ray: Ray, axis: Axis, anchorPoint: Vector3) {
	const axisDirection = axisDirections[axis];

	segmentStart.copy(anchorPoint).addScaledVector(axisDirection, -dragSegmentHalfLength);
	segmentEnd.copy(anchorPoint).addScaledVector(axisDirection, dragSegmentHalfLength);

	ray.distanceSqToSegment(segmentStart, segmentEnd, undefined, closestPointOnAxis);

	return closestPointOnAxis.getComponent(axisIndices[axis]);
}

function hasMeasurementDelta(previous: AxisMeasurements, next: AxisMeasurements) {
	const pointDelta = (
		a: [number, number, number],
		b: [number, number, number],
	) => a.some((value, index) => Math.abs(value - b[index]) > EPSILON);

	const values = [
		Math.abs(previous.x.value - next.x.value),
		Math.abs(previous.y.value - next.y.value),
		Math.abs(previous.z.value - next.z.value),
		pointDelta(previous.x.meshStart, next.x.meshStart) ? 1 : 0,
		pointDelta(previous.x.meshEnd, next.x.meshEnd) ? 1 : 0,
		pointDelta(previous.x.planeStart, next.x.planeStart) ? 1 : 0,
		pointDelta(previous.x.planeEnd, next.x.planeEnd) ? 1 : 0,
		pointDelta(previous.y.meshStart, next.y.meshStart) ? 1 : 0,
		pointDelta(previous.y.meshEnd, next.y.meshEnd) ? 1 : 0,
		pointDelta(previous.y.planeStart, next.y.planeStart) ? 1 : 0,
		pointDelta(previous.y.planeEnd, next.y.planeEnd) ? 1 : 0,
		pointDelta(previous.z.meshStart, next.z.meshStart) ? 1 : 0,
		pointDelta(previous.z.meshEnd, next.z.meshEnd) ? 1 : 0,
		pointDelta(previous.z.planeStart, next.z.planeStart) ? 1 : 0,
		pointDelta(previous.z.planeEnd, next.z.planeEnd) ? 1 : 0,
	];

	return values.some((delta) => delta > EPSILON);
}

function formatSize(value: number) {
	if (value < 10) {
		return value.toFixed(2);
	}

	return value.toFixed(1);
}

function CubeMeasurements({
	cubeObject,
	planePositions,
	selectedAxis,
	onAxisSelect,
	onPlaneHandleMove,
	onPlaneHandleDraggingChange,
	onPlaneHandleHoverChange,
	visible = true,
}: CubeMeasurementsProps) {
	const [measurements, setMeasurements] = useState<AxisMeasurements | null>(null);
	const dragStateRef = useRef<DragState | null>(null);

	const handlePointerDown = (
		event: ThreeEvent<PointerEvent>,
		planeId: PlaneId,
		axis: Axis,
		handlePosition: [number, number, number],
	) => {
		event.stopPropagation();
		onAxisSelect(axis);

		const axisIndex = axisIndices[axis];
		const anchorPoint = new Vector3(...handlePosition);
		const startRayAxisValue = getRayAxisValue(event.ray, axis, anchorPoint);

		dragStateRef.current = {
			planeId,
			axis,
			anchorPoint,
			startPlaneAxisValue: planePositions[planeId][axisIndex],
			startRayAxisValue,
		};
		onPlaneHandleDraggingChange?.(true);
		const target = event.target as Element;
		target.setPointerCapture?.(event.pointerId);
	};

	const handlePointerMove = (
		event: ThreeEvent<PointerEvent>,
		planeId: PlaneId,
	) => {
		const dragState = dragStateRef.current;
		if (!dragState || dragState.planeId !== planeId) {
			return;
		}

		event.stopPropagation();
		const currentRayAxisValue = getRayAxisValue(event.ray, dragState.axis, dragState.anchorPoint);
		const deltaFromStart = currentRayAxisValue - dragState.startRayAxisValue;
		const nextAxisValue = dragState.startPlaneAxisValue + deltaFromStart;

		if (Math.abs(nextAxisValue - planePositions[planeId][axisIndices[dragState.axis]]) < 0.0001) {
			return;
		}

		onPlaneHandleMove(planeId, nextAxisValue);
	};

	const handlePointerUp = (
		event: ThreeEvent<PointerEvent>,
	) => {
		dragStateRef.current = null;
		onPlaneHandleDraggingChange?.(false);
		const target = event.target as Element;
		target.releasePointerCapture?.(event.pointerId);
	};

	const handlePointerCancel = () => {
		dragStateRef.current = null;
		onPlaneHandleDraggingChange?.(false);
		onPlaneHandleHoverChange?.(false);
	};

	const handlePointerOver = () => {
		onPlaneHandleHoverChange?.(true);
	};

	const handlePointerOut = () => {
		onPlaneHandleHoverChange?.(false);
	};

	useFrame(() => {
		if (!cubeObject || !visible) {
			return;
		}

		cubeObject.updateWorldMatrix(true, false);
		cubeObject.getWorldPosition(center);
		cubeObject.getWorldScale(worldScale);

		const halfX = (CUBE_SIZE * worldScale.x) / 2;
		const halfY = (CUBE_SIZE * worldScale.y) / 2;
		const halfZ = (CUBE_SIZE * worldScale.z) / 2;

		const xLineY = center.y - halfY - OFFSET;
		const xLineZ = center.z + halfZ + OFFSET * 0.15;
		const yLineX = center.x + halfX + OFFSET;
		const yLineZ = center.z + halfZ + OFFSET * 0.15;
		const zLineX = center.x + halfX + OFFSET;
		const zLineY = center.y - halfY - OFFSET * 0.2;

		const xNegative = planePositions.nx[0];
		const xPositive = planePositions.px[0];
		const yNegative = planePositions.ny[1];
		const yPositive = planePositions.py[1];
		const zNegative = planePositions.nz[2];
		const zPositive = planePositions.pz[2];

		const xMeshMin = center.x - halfX;
		const xMeshMax = center.x + halfX;
		const yMeshMin = center.y - halfY;
		const yMeshMax = center.y + halfY;
		const zMeshMin = center.z - halfZ;
		const zMeshMax = center.z + halfZ;

		const xStretchStart = Math.max(xMeshMin, Math.min(xMeshMax, xNegative));
		const xStretchEnd = Math.max(xMeshMin, Math.min(xMeshMax, xPositive));
		const yStretchStart = Math.max(yMeshMin, Math.min(yMeshMax, yNegative));
		const yStretchEnd = Math.max(yMeshMin, Math.min(yMeshMax, yPositive));
		const zStretchStart = Math.max(zMeshMin, Math.min(zMeshMax, zNegative));
		const zStretchEnd = Math.max(zMeshMin, Math.min(zMeshMax, zPositive));

		const nextMeasurements: AxisMeasurements = {
			x: {
				id: 'x',
				axis: 'X',
				color: '#f97316',
				value: CUBE_SIZE * worldScale.x,
				meshStart: [xMeshMin, xLineY, xLineZ],
				meshEnd: [xMeshMax, xLineY, xLineZ],
				planeStart: [xNegative, xLineY, xLineZ],
				planeEnd: [xPositive, xLineY, xLineZ],
				stretchStart: [xStretchStart, xLineY, xLineZ],
				stretchEnd: [xStretchEnd, xLineY, xLineZ],
				label: [center.x, xLineY, xLineZ],
				planes: { negative: 'nx', positive: 'px' },
			},
			y: {
				id: 'y',
				axis: 'Y',
				color: '#22c55e',
				value: CUBE_SIZE * worldScale.y,
				meshStart: [yLineX, yMeshMin, yLineZ],
				meshEnd: [yLineX, yMeshMax, yLineZ],
				planeStart: [yLineX, yNegative, yLineZ],
				planeEnd: [yLineX, yPositive, yLineZ],
				stretchStart: [yLineX, yStretchStart, yLineZ],
				stretchEnd: [yLineX, yStretchEnd, yLineZ],
				label: [yLineX, center.y, yLineZ],
				planes: { negative: 'ny', positive: 'py' },
			},
			z: {
				id: 'z',
				axis: 'Z',
				color: '#3b82f6',
				value: CUBE_SIZE * worldScale.z,
				meshStart: [zLineX, zLineY, zMeshMin],
				meshEnd: [zLineX, zLineY, zMeshMax],
				planeStart: [zLineX, zLineY, zNegative],
				planeEnd: [zLineX, zLineY, zPositive],
				stretchStart: [zLineX, zLineY, zStretchStart],
				stretchEnd: [zLineX, zLineY, zStretchEnd],
				label: [zLineX, zLineY, center.z],
				planes: { negative: 'nz', positive: 'pz' },
			},
		};

		setMeasurements((current) => {
			if (!current) {
				return nextMeasurements;
			}

			return hasMeasurementDelta(current, nextMeasurements) ? nextMeasurements : current;
		});
	});

	if (!cubeObject || !visible || !measurements) {
		return null;
	}

	return (
		<>
			{Object.values(measurements).map((measurement) => (
				<group key={measurement.axis}>
					{Math.abs(measurement.stretchStart[axisIndices[measurement.id]] - measurement.meshStart[axisIndices[measurement.id]]) > minVisibleSegment && (
						<Line points={[measurement.meshStart, measurement.stretchStart]} color={fixedSegmentColor} />
					)}
					{Math.abs(measurement.stretchEnd[axisIndices[measurement.id]] - measurement.stretchStart[axisIndices[measurement.id]]) > minVisibleSegment && (
						<Line points={[measurement.stretchStart, measurement.stretchEnd]} color={measurement.color} />
					)}
					{Math.abs(measurement.meshEnd[axisIndices[measurement.id]] - measurement.stretchEnd[axisIndices[measurement.id]]) > minVisibleSegment && (
						<Line points={[measurement.stretchEnd, measurement.meshEnd]} color={fixedSegmentColor} />
					)}
					{selectedAxis === measurement.id && (
						<>
							<mesh
								position={measurement.planeStart}
								onPointerDown={(event) =>
									handlePointerDown(
										event,
										measurement.planes.negative,
										measurement.id,
										measurement.planeStart,
									)
								}
								onPointerMove={(event) => handlePointerMove(event, measurement.planes.negative)}
								onPointerUp={handlePointerUp}
								onPointerCancel={handlePointerCancel}
								onPointerOver={handlePointerOver}
								onPointerOut={handlePointerOut}
							>
								<sphereGeometry args={[handleRadius, 16, 16]} />
								<meshStandardMaterial color={measurement.color} emissive={measurement.color} emissiveIntensity={0.5} />
							</mesh>
							<mesh
								position={measurement.planeEnd}
								onPointerDown={(event) =>
									handlePointerDown(
										event,
										measurement.planes.positive,
										measurement.id,
										measurement.planeEnd,
									)
								}
								onPointerMove={(event) => handlePointerMove(event, measurement.planes.positive)}
								onPointerUp={handlePointerUp}
								onPointerCancel={handlePointerCancel}
								onPointerOver={handlePointerOver}
								onPointerOut={handlePointerOut}
							>
								<sphereGeometry args={[handleRadius, 16, 16]} />
								<meshStandardMaterial color={measurement.color} emissive={measurement.color} emissiveIntensity={0.5} />
							</mesh>
						</>
					)}
					<Html
						position={measurement.label}
						center
						sprite
						transform
						distanceFactor={10}
						occlude={false}
					>
						<button
							type="button"
							className={`dimension-label${selectedAxis === measurement.id ? ' selected' : ''}`}
							data-axis={measurement.axis.toLowerCase()}
							onClick={() => onAxisSelect(measurement.id)}
						>
							<span>{measurement.axis}</span>
							<span>{formatSize(measurement.value)}</span>
						</button>
					</Html>
				</group>
			))}
		</>
	);
}

export default CubeMeasurements;
