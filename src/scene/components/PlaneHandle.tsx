import type { ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';
import type { Ray } from 'three';
import { Vector3 } from 'three';

import type { Axis, PlaneId } from '../types';

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

const dragSegmentHalfLength = 10;
const segmentStart = new Vector3();
const segmentEnd = new Vector3();
const closestPointOnAxis = new Vector3();

type DragState = {
	anchorPoint: Vector3;
	pointerId: number;
	startPlaneAxisValue: number;
	startRayAxisValue: number;
};

type PlaneHandleProps = {
	axis: Axis;
	color: string;
	id: PlaneId;
	onDraggingChange?: (dragging: boolean) => void;
	position: [number, number, number];
	selected: boolean;
	onMove: (id: PlaneId, axisValue: number) => void;
	onSelect: () => void;
};

function getRayAxisValue(ray: Ray, axis: Axis, anchorPoint: Vector3) {
	const axisDirection = axisDirections[axis];

	segmentStart.copy(anchorPoint).addScaledVector(axisDirection, -dragSegmentHalfLength);
	segmentEnd.copy(anchorPoint).addScaledVector(axisDirection, dragSegmentHalfLength);
	ray.distanceSqToSegment(segmentStart, segmentEnd, undefined, closestPointOnAxis);

	return closestPointOnAxis.getComponent(axisIndices[axis]);
}

export default function PlaneHandle({
	axis,
	color,
	id,
	onDraggingChange,
	position,
	selected,
	onMove,
	onSelect,
}: PlaneHandleProps) {
	const dragStateRef = useRef<DragState | null>(null);

	const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
		event.stopPropagation();
		onSelect();

		const anchorPoint = new Vector3(...position);
		dragStateRef.current = {
			anchorPoint,
			pointerId: event.pointerId,
			startPlaneAxisValue: position[axisIndices[axis]],
			startRayAxisValue: getRayAxisValue(event.ray, axis, anchorPoint),
		};

		onDraggingChange?.(true);
		const target = event.target as Element;
		target.setPointerCapture?.(event.pointerId);
	};

	const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
		const dragState = dragStateRef.current;
		if (!dragState || dragState.pointerId !== event.pointerId) {
			return;
		}

		event.stopPropagation();
		const currentRayAxisValue = getRayAxisValue(event.ray, axis, dragState.anchorPoint);
		const deltaFromStart = currentRayAxisValue - dragState.startRayAxisValue;
		const nextAxisValue = dragState.startPlaneAxisValue + deltaFromStart;

		onMove(id, nextAxisValue);
	};

	const endDrag = (event: ThreeEvent<PointerEvent>) => {
		if (dragStateRef.current?.pointerId !== event.pointerId) {
			return;
		}

		dragStateRef.current = null;
		onDraggingChange?.(false);
		const target = event.target as Element;
		target.releasePointerCapture?.(event.pointerId);
	};

	return (
		<mesh
			visible={selected}
			position={position}
			onClick={(event) => {
				event.stopPropagation();
				onSelect();
			}}
			onPointerCancel={endDrag}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={endDrag}
		>
			<sphereGeometry args={[0.18, 16, 16]} />
			<meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
		</mesh>
	);
}
