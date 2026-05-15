import { HALF_CUBE_SIZE, PLANE_OFFSET } from './constants';
import type { PlaneConfig } from './types';

export const PLANE_CONFIGS: PlaneConfig[] = [
	{
		id: 'px',
		position: [HALF_CUBE_SIZE + PLANE_OFFSET, 0, 0],
		rotation: [0, Math.PI / 2, 0],
		translationAxis: 'x',
		color: '#ef4444',
	},
	{
		id: 'nx',
		position: [-HALF_CUBE_SIZE - PLANE_OFFSET, 0, 0],
		rotation: [0, Math.PI / 2, 0],
		translationAxis: 'x',
		color: '#f97316',
	},
	{
		id: 'py',
		position: [0, HALF_CUBE_SIZE + PLANE_OFFSET, 0],
		rotation: [Math.PI / 2, 0, 0],
		translationAxis: 'y',
		color: '#eab308',
	},
	{
		id: 'ny',
		position: [0, -HALF_CUBE_SIZE - PLANE_OFFSET, 0],
		rotation: [Math.PI / 2, 0, 0],
		translationAxis: 'y',
		color: '#22c55e',
	},
	{
		id: 'pz',
		position: [0, 0, HALF_CUBE_SIZE + PLANE_OFFSET],
		rotation: [0, 0, 0],
		translationAxis: 'z',
		color: '#06b6d4',
	},
	{
		id: 'nz',
		position: [0, 0, -HALF_CUBE_SIZE - PLANE_OFFSET],
		rotation: [0, 0, 0],
		translationAxis: 'z',
		color: '#3b82f6',
	},
];