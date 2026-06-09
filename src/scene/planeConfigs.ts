import type { Axis, PlaneId } from './types';

type RotationTuple = [number, number, number];

export type PlaneConfig = {
	id: PlaneId;
	axis: Axis;
	color: string;
	rotation: RotationTuple;
};

export const planeConfigs: PlaneConfig[] = [
	{ id: 'nx', axis: 'x', color: '#ef4444', rotation: [0, Math.PI / 2, 0] },
	{ id: 'px', axis: 'x', color: '#ef4444', rotation: [0, Math.PI / 2, 0] },
	{ id: 'ny', axis: 'y', color: '#22c55e', rotation: [Math.PI / 2, 0, 0] },
	{ id: 'py', axis: 'y', color: '#22c55e', rotation: [Math.PI / 2, 0, 0] },
	{ id: 'nz', axis: 'z', color: '#3b82f6', rotation: [0, 0, 0] },
	{ id: 'pz', axis: 'z', color: '#3b82f6', rotation: [0, 0, 0] },
];
