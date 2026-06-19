import { CUBE_SIZE, PLANE_OFFSET } from './constants';
import type { Axis, PlaneId } from './types';

export type AxisStretchSpec = {
	sourceSize: number;
	targetSize: number;
	fixedStart: number;
	fixedEnd: number;
};

export type MeshStretchSpec = Record<Axis, AxisStretchSpec>;

export type AxisPlaneValues = {
	negative: number;
	positive: number;
};

export const AXIS_INDICES: Record<Axis, 0 | 1 | 2> = {
	x: 0,
	y: 1,
	z: 2,
};

export const AXIS_PLANE_IDS: Record<Axis, [PlaneId, PlaneId]> = {
	x: ['nx', 'px'],
	y: ['ny', 'py'],
	z: ['nz', 'pz'],
};

export const MIN_PLANE_GAP = 0.25;
export const MIN_DIMENSION = 0.1;

export function getAxisByPlaneId(id: PlaneId): Axis {
	if (id === 'px' || id === 'nx') {
		return 'x';
	}

	if (id === 'py' || id === 'ny') {
		return 'y';
	}

	return 'z';
}

export function createAxisStretchSpec(sourceSize = CUBE_SIZE): AxisStretchSpec {
	const clampedSourceSize = Math.max(MIN_DIMENSION, sourceSize);
	return {
		sourceSize: clampedSourceSize,
		targetSize: clampedSourceSize,
		fixedStart: -PLANE_OFFSET,
		fixedEnd: -PLANE_OFFSET,
	};
}

export function createInitialStretchSpec(
	sourceSize = CUBE_SIZE,
): MeshStretchSpec {
	return {
		x: createAxisStretchSpec(sourceSize),
		y: createAxisStretchSpec(sourceSize),
		z: createAxisStretchSpec(sourceSize),
	};
}

export function createInitialStretchSpecFromDimensions(
	dimensions: Record<Axis, number>,
): MeshStretchSpec {
	return {
		x: createAxisStretchSpec(dimensions.x),
		y: createAxisStretchSpec(dimensions.y),
		z: createAxisStretchSpec(dimensions.z),
	};
}

export function getAxisPlaneValues(spec: AxisStretchSpec): AxisPlaneValues {
	const half = spec.targetSize / 2;

	return {
		negative: -half + spec.fixedStart,
		positive: half - spec.fixedEnd,
	};
}

export function createAxisStretchSpecFromPlanes(
	sourceSize: number,
	targetSize: number,
	planes: AxisPlaneValues,
): AxisStretchSpec {
	const half = targetSize / 2;

	return {
		sourceSize,
		targetSize,
		fixedStart: planes.negative + half,
		fixedEnd: half - planes.positive,
	};
}

function getPlaneBounds(targetSize: number) {
	return targetSize / 2 + PLANE_OFFSET;
}

function getMaxFixedInsetSpan(spec: AxisStretchSpec) {
	return Math.max(
		0,
		Math.min(spec.sourceSize, spec.targetSize) - MIN_PLANE_GAP,
	);
}

function getMaxFixedInsetForStart(spec: AxisStretchSpec) {
	return Math.max(0, getMaxFixedInsetSpan(spec) - Math.max(0, spec.fixedEnd));
}

function getMaxFixedInsetForEnd(spec: AxisStretchSpec) {
	return Math.max(0, getMaxFixedInsetSpan(spec) - Math.max(0, spec.fixedStart));
}

function clampFixedInsetsToStretchableSpan(
	spec: AxisStretchSpec,
): AxisStretchSpec {
	const maxFixedSpan = getMaxFixedInsetSpan(spec);
	const fixedStart = Math.min(spec.fixedStart, maxFixedSpan);
	const consumedStart = Math.max(0, fixedStart);
	const fixedEnd = Math.min(spec.fixedEnd, maxFixedSpan - consumedStart);

	return {
		...spec,
		fixedStart,
		fixedEnd,
	};
}

function clampAxisPlaneValuesForResize(
	planes: AxisPlaneValues,
	targetSize: number,
): AxisPlaneValues {
	let { negative, positive } = planes;
	const planeBounds = getPlaneBounds(targetSize);

	if (positive - negative < MIN_PLANE_GAP) {
		const midpoint = (negative + positive) / 2;
		negative = midpoint - MIN_PLANE_GAP / 2;
		positive = midpoint + MIN_PLANE_GAP / 2;
	}

	negative = Math.max(-planeBounds, negative);
	positive = Math.min(planeBounds, positive);

	if (positive - negative < MIN_PLANE_GAP) {
		negative = Math.max(-planeBounds, positive - MIN_PLANE_GAP);
		positive = Math.min(planeBounds, negative + MIN_PLANE_GAP);
	}

	return { negative, positive };
}

export function updateAxisStretchSpecTargetSize(
	spec: AxisStretchSpec,
	requestedTargetSize: number,
): AxisStretchSpec {
	const targetSize = Math.max(MIN_DIMENSION, requestedTargetSize);
	const currentPlanes = getAxisPlaneValues(spec);
	const nextPlanes = clampAxisPlaneValuesForResize(
		{
			negative:
				-targetSize / 2 + (currentPlanes.negative + spec.targetSize / 2),
			positive: targetSize / 2 - (spec.targetSize / 2 - currentPlanes.positive),
		},
		targetSize,
	);

	return clampFixedInsetsToStretchableSpan(
		createAxisStretchSpecFromPlanes(spec.sourceSize, targetSize, nextPlanes),
	);
}

export function updateAxisStretchSpecPlane(
	spec: AxisStretchSpec,
	planeId: PlaneId,
	nextAxisValue: number,
): AxisStretchSpec {
	const { negative, positive } = getAxisPlaneValues(spec);
	const planeBounds = getPlaneBounds(spec.targetSize);
	const half = spec.targetSize / 2;

	if (planeId.startsWith('n')) {
		const requestedNegative = Math.max(
			-planeBounds,
			Math.min(nextAxisValue, positive - MIN_PLANE_GAP),
		);

		return {
			...spec,
			fixedStart: Math.min(
				requestedNegative + half,
				getMaxFixedInsetForStart(spec),
			),
		};
	}

	const requestedPositive = Math.min(
		planeBounds,
		Math.max(nextAxisValue, negative + MIN_PLANE_GAP),
	);

	return {
		...spec,
		fixedEnd: Math.min(half - requestedPositive, getMaxFixedInsetForEnd(spec)),
	};
}

export function updateAxisStretchSpecFixedInsets(
	spec: AxisStretchSpec,
	fixedStart: number,
	fixedEnd: number,
): AxisStretchSpec {
	const maxFixedSpan = getMaxFixedInsetSpan(spec);
	const maxStart = maxFixedSpan;
	const nextFixedStart = Math.max(0, Math.min(maxStart, fixedStart));
	const maxEnd = Math.max(0, maxFixedSpan - nextFixedStart);
	const nextFixedEnd = Math.max(0, Math.min(maxEnd, fixedEnd));

	return {
		...spec,
		fixedStart: nextFixedStart,
		fixedEnd: nextFixedEnd,
	};
}

export function resetAxisStretchSpecFixedInsets(
	spec: AxisStretchSpec,
): AxisStretchSpec {
	return {
		...spec,
		fixedStart: -PLANE_OFFSET,
		fixedEnd: -PLANE_OFFSET,
	};
}

export function getClampedAxisFixedInsets(spec: AxisStretchSpec) {
	const maxFixedSpan = getMaxFixedInsetSpan(spec);
	const min = Math.max(0, Math.min(maxFixedSpan, spec.fixedStart));
	const max = Math.max(0, Math.min(maxFixedSpan - min, spec.fixedEnd));

	return { min, max };
}

export function getFixedInsetsFromStretchSpec(spec: MeshStretchSpec) {
	const x = getClampedAxisFixedInsets(spec.x);
	const y = getClampedAxisFixedInsets(spec.y);
	const z = getClampedAxisFixedInsets(spec.z);

	return {
		min: [x.min, y.min, z.min] as [number, number, number],
		max: [x.max, y.max, z.max] as [number, number, number],
	};
}

export function getDimensionsFromStretchSpec(
	spec: MeshStretchSpec,
): Record<Axis, number> {
	return {
		x: spec.x.targetSize,
		y: spec.y.targetSize,
		z: spec.z.targetSize,
	};
}

export function getPlanePositionsFromStretchSpec(
	spec: MeshStretchSpec,
): Record<PlaneId, [number, number, number]> {
	const x = getAxisPlaneValues(spec.x);
	const y = getAxisPlaneValues(spec.y);
	const z = getAxisPlaneValues(spec.z);

	return {
		nx: [x.negative, 0, 0],
		px: [x.positive, 0, 0],
		ny: [0, y.negative, 0],
		py: [0, y.positive, 0],
		nz: [0, 0, z.negative],
		pz: [0, 0, z.positive],
	};
}
