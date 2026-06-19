import { describe, expect, it } from 'vitest';

import { CUBE_SIZE, PLANE_OFFSET } from './constants';
import {
	createAxisStretchSpec,
	createInitialStretchSpec,
	getAxisPlaneValues,
	getClampedAxisFixedInsets,
	getPlanePositionsFromStretchSpec,
	MIN_PLANE_GAP,
	resetAxisStretchSpecFixedInsets,
	updateAxisStretchSpecFixedInsets,
	updateAxisStretchSpecPlane,
	updateAxisStretchSpecTargetSize,
} from './stretchSpec';

describe('stretchSpec', () => {
	it('derives the default plane positions from the stretch spec', () => {
		const positions = getPlanePositionsFromStretchSpec(createInitialStretchSpec());

		expect(positions.nx[0]).toBeCloseTo(-(CUBE_SIZE / 2 + PLANE_OFFSET));
		expect(positions.px[0]).toBeCloseTo(CUBE_SIZE / 2 + PLANE_OFFSET);
		expect(positions.ny[1]).toBeCloseTo(-(CUBE_SIZE / 2 + PLANE_OFFSET));
		expect(positions.py[1]).toBeCloseTo(CUBE_SIZE / 2 + PLANE_OFFSET);
	});

	it('preserves out-of-bounds handles when resizing the target size', () => {
		const resized = updateAxisStretchSpecTargetSize(createAxisStretchSpec(), 7);
		const planes = getAxisPlaneValues(resized);

		expect(planes.negative).toBeCloseTo(-(7 / 2 + PLANE_OFFSET));
		expect(planes.positive).toBeCloseTo(7 / 2 + PLANE_OFFSET);
	});

	it('keeps the plane gap above the minimum when dragging', () => {
		const moved = updateAxisStretchSpecPlane(createAxisStretchSpec(), 'nx', CUBE_SIZE / 2 + PLANE_OFFSET);
		const planes = getAxisPlaneValues(moved);

		expect(planes.positive - planes.negative).toBeGreaterThanOrEqual(MIN_PLANE_GAP);
		expect(planes.negative).toBeCloseTo(planes.positive - MIN_PLANE_GAP);
	});

	it('clamps shader insets without losing start-range priority', () => {
		expect(
			getClampedAxisFixedInsets({
				sourceSize: CUBE_SIZE,
				targetSize: 5,
				fixedStart: 4,
				fixedEnd: 3,
			}),
		).toEqual({ min: 4, max: 1 });
	});

	it('updates fixed insets numerically while preserving the minimum stretch gap', () => {
		expect(
			updateAxisStretchSpecFixedInsets(createAxisStretchSpec(), 4.9, 4.9),
		).toMatchObject({
			fixedStart: CUBE_SIZE - MIN_PLANE_GAP,
			fixedEnd: 0,
		});
	});

	it('limits fixed insets by the source mesh after enlarging the target size', () => {
		const resized = updateAxisStretchSpecTargetSize(createAxisStretchSpec(), 10);

		expect(updateAxisStretchSpecFixedInsets(resized, 8, 2)).toMatchObject({
			fixedStart: CUBE_SIZE - MIN_PLANE_GAP,
			fixedEnd: 0,
		});
	});

	it('keeps dragged planes from collapsing the source stretch region after resize', () => {
		const resized = updateAxisStretchSpecTargetSize(createAxisStretchSpec(), 10);
		const moved = updateAxisStretchSpecPlane(resized, 'nx', 3.5);

		expect(getClampedAxisFixedInsets(moved)).toEqual({
			min: CUBE_SIZE - MIN_PLANE_GAP,
			max: 0,
		});
	});

	it('clamps the dragged plane without pushing the opposite plane', () => {
		const resized = updateAxisStretchSpecTargetSize(createAxisStretchSpec(), 10);
		const withStartInset = updateAxisStretchSpecFixedInsets(resized, 2, 0);
		const moved = updateAxisStretchSpecPlane(withStartInset, 'px', -1);

		expect(moved.fixedStart).toBeCloseTo(2);
		expect(moved.fixedEnd).toBeCloseTo(CUBE_SIZE - MIN_PLANE_GAP - 2);
	});

	it('resets fixed insets to the default out-of-bounds handle positions', () => {
		expect(
			resetAxisStretchSpecFixedInsets({
				sourceSize: CUBE_SIZE,
				targetSize: 5,
				fixedStart: 1.5,
				fixedEnd: 1.25,
			}),
		).toMatchObject({
			targetSize: 5,
			fixedStart: -PLANE_OFFSET,
			fixedEnd: -PLANE_OFFSET,
		});
	});
});
