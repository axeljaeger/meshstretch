import type { Vector3 } from 'three';

import type { Axis, PlaneId } from '../types';

const OFFSET = 0.9;

export type AxisMeasurement = {
	axis: Axis;
	axisLabel: 'X' | 'Y' | 'Z';
	color: string;
	value: number;
	meshStart: [number, number, number];
	meshEnd: [number, number, number];
	planeStart: [number, number, number];
	planeEnd: [number, number, number];
	stretchStart: [number, number, number];
	stretchEnd: [number, number, number];
	labelPosition: [number, number, number];
	planes: {
		negative: PlaneId;
		positive: PlaneId;
	};
};

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

export function buildAxisMeasurements(
	center: Vector3,
	dimensions: Record<Axis, number>,
	planePositions: Record<PlaneId, [number, number, number]>,
): Record<Axis, AxisMeasurement> {
	const halfX = dimensions.x / 2;
	const halfY = dimensions.y / 2;
	const halfZ = dimensions.z / 2;

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

	return {
		x: {
			axis: 'x',
			axisLabel: 'X',
			color: '#f97316',
			value: dimensions.x,
			meshStart: [xMeshMin, xLineY, xLineZ],
			meshEnd: [xMeshMax, xLineY, xLineZ],
			planeStart: [xNegative, xLineY, xLineZ],
			planeEnd: [xPositive, xLineY, xLineZ],
			stretchStart: [clamp(xNegative, xMeshMin, xMeshMax), xLineY, xLineZ],
			stretchEnd: [clamp(xPositive, xMeshMin, xMeshMax), xLineY, xLineZ],
			labelPosition: [center.x, xLineY, xLineZ],
			planes: { negative: 'nx', positive: 'px' },
		},
		y: {
			axis: 'y',
			axisLabel: 'Y',
			color: '#22c55e',
			value: dimensions.y,
			meshStart: [yLineX, yMeshMin, yLineZ],
			meshEnd: [yLineX, yMeshMax, yLineZ],
			planeStart: [yLineX, yNegative, yLineZ],
			planeEnd: [yLineX, yPositive, yLineZ],
			stretchStart: [yLineX, clamp(yNegative, yMeshMin, yMeshMax), yLineZ],
			stretchEnd: [yLineX, clamp(yPositive, yMeshMin, yMeshMax), yLineZ],
			labelPosition: [yLineX, center.y, yLineZ],
			planes: { negative: 'ny', positive: 'py' },
		},
		z: {
			axis: 'z',
			axisLabel: 'Z',
			color: '#3b82f6',
			value: dimensions.z,
			meshStart: [zLineX, zLineY, zMeshMin],
			meshEnd: [zLineX, zLineY, zMeshMax],
			planeStart: [zLineX, zLineY, zNegative],
			planeEnd: [zLineX, zLineY, zPositive],
			stretchStart: [zLineX, zLineY, clamp(zNegative, zMeshMin, zMeshMax)],
			stretchEnd: [zLineX, zLineY, clamp(zPositive, zMeshMin, zMeshMax)],
			labelPosition: [zLineX, zLineY, center.z],
			planes: { negative: 'nz', positive: 'pz' },
		},
	};
}
