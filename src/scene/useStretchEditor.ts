import { useCallback, useMemo, useState } from 'react';

import type { Axis, PlaneId } from './types';
import {
	createInitialStretchSpec,
	createInitialStretchSpecFromDimensions,
	getAxisByPlaneId,
	getClampedAxisFixedInsets,
	getDimensionsFromStretchSpec,
	getFixedInsetsFromStretchSpec,
	getPlanePositionsFromStretchSpec,
	resetAxisStretchSpecFixedInsets,
	updateAxisStretchSpecFixedInsets,
	updateAxisStretchSpecPlane,
	updateAxisStretchSpecTargetSize,
	type MeshStretchSpec,
} from './stretchSpec';

export function useStretchEditor(sourceDimensions?: Record<Axis, number>) {
	const [stretchSpec, setStretchSpec] = useState<MeshStretchSpec>(() =>
		sourceDimensions ? createInitialStretchSpecFromDimensions(sourceDimensions) : createInitialStretchSpec(),
	);

	const dimensions = useMemo(() => getDimensionsFromStretchSpec(stretchSpec), [stretchSpec]);
	const fixedInsets = useMemo(() => getFixedInsetsFromStretchSpec(stretchSpec), [stretchSpec]);
	const planePositions = useMemo(
		() => getPlanePositionsFromStretchSpec(stretchSpec),
		[stretchSpec],
	);

	const handleDimensionChange = useCallback((axis: Axis, value: number) => {
		setStretchSpec((current) => ({
			...current,
			[axis]: updateAxisStretchSpecTargetSize(current[axis], value),
		}));
	}, []);

	const handlePlaneHandleMove = useCallback((id: PlaneId, axisValue: number) => {
		const axis = getAxisByPlaneId(id);

		setStretchSpec((current) => ({
			...current,
			[axis]: updateAxisStretchSpecPlane(current[axis], id, axisValue),
		}));
	}, []);

	const handleFixedInsetChange = useCallback(
		(axis: Axis, edge: 'start' | 'end', value: number) => {
			setStretchSpec((current) => {
				const currentInsets = getClampedAxisFixedInsets(current[axis]);
				return {
					...current,
					[axis]: updateAxisStretchSpecFixedInsets(
						current[axis],
						edge === 'start' ? value : currentInsets.min,
						edge === 'end' ? value : currentInsets.max,
					),
				};
			});
		},
		[],
	);

	const handleFixedInsetReset = useCallback((axis: Axis) => {
		setStretchSpec((current) => ({
			...current,
			[axis]: resetAxisStretchSpecFixedInsets(current[axis]),
		}));
	}, []);

	return {
		dimensions,
		fixedInsets,
		handleFixedInsetChange,
		handleFixedInsetReset,
		handleDimensionChange,
		handlePlaneHandleMove,
		planePositions,
		stretchSpec,
	};
}
