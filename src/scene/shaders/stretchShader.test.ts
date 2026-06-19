import { describe, expect, it } from 'vitest';

import { isFixedOnTargetAxis, stretchAxisCoordinate } from './stretchShader';

describe('stretchAxisCoordinate', () => {
	it('translates the fixed start region to the resized target boundary', () => {
		expect(stretchAxisCoordinate(-2.5, 5, 10, 4.75, 0)).toBeCloseTo(-5);
		expect(stretchAxisCoordinate(2.25, 5, 10, 4.75, 0)).toBeCloseTo(-0.25);
		expect(stretchAxisCoordinate(2.5, 5, 10, 4.75, 0)).toBeCloseTo(5);
	});

	it('keeps symmetric resizing centered when no fixed regions are present', () => {
		expect(stretchAxisCoordinate(-2.5, 5, 10, 0, 0)).toBeCloseTo(-5);
		expect(stretchAxisCoordinate(0, 5, 10, 0, 0)).toBeCloseTo(0);
		expect(stretchAxisCoordinate(2.5, 5, 10, 0, 0)).toBeCloseTo(5);
	});

	it('marks fixed target regions exactly at the deformed plane boundaries', () => {
		expect(isFixedOnTargetAxis(-5, 10, 1.5, 2.0)).toBe(true);
		expect(isFixedOnTargetAxis(-3.5, 10, 1.5, 2.0)).toBe(true);
		expect(isFixedOnTargetAxis(-3.49, 10, 1.5, 2.0)).toBe(false);
		expect(isFixedOnTargetAxis(2.99, 10, 1.5, 2.0)).toBe(false);
		expect(isFixedOnTargetAxis(3, 10, 1.5, 2.0)).toBe(true);
		expect(isFixedOnTargetAxis(5, 10, 1.5, 2.0)).toBe(true);
	});
});
