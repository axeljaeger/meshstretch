import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import type { Object3D } from 'three';
import { Vector3 } from 'three';

import type { Axis, PlaneId } from '../types';
import DimensionLabel from './DimensionLabel';
import { buildAxisMeasurements } from './measurementGeometry';
import PlaneHandle from './PlaneHandle';

const center = new Vector3();
const axisIndices: Record<Axis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 };

type CubeMeasurementsProps = {
	cubeObject: Object3D | null;
	dimensions: Record<Axis, number>;
	editingAxis: Axis | null;
	onDimensionChange: (axis: Axis, value: number) => void;
	onEditingAxisChange: (axis: Axis | null) => void;
	onPlaneHandleDraggingChange?: (dragging: boolean) => void;
	onPlaneHandleMove: (id: PlaneId, axisValue: number) => void;
	onSelectAxis: (axis: Axis) => void;
	planePositions: Record<PlaneId, [number, number, number]>;
	selectedAxis: Axis | null;
};

export default function CubeMeasurements({
	cubeObject,
	dimensions,
	editingAxis,
	onDimensionChange,
	onEditingAxisChange,
	onPlaneHandleDraggingChange,
	onPlaneHandleMove,
	onSelectAxis,
	planePositions,
	selectedAxis,
}: CubeMeasurementsProps) {
	const measurementCenter = useMemo(() => {
		if (!cubeObject) {
			return center.set(0, 0, 0).clone();
		}

		cubeObject.updateWorldMatrix(true, false);
		return cubeObject.getWorldPosition(center.clone());
	}, [cubeObject]);

	const measurements = useMemo(
		() => buildAxisMeasurements(measurementCenter, dimensions, planePositions),
		[dimensions, measurementCenter, planePositions],
	);
	const measurementList = useMemo(
		() => [measurements.x, measurements.y, measurements.z],
		[measurements],
	);
	const fixedSegmentColor = '#94a3b8';
	const minVisibleSegment = 0.0001;
	const selectedMeasurement = selectedAxis ? measurements[selectedAxis] : null;

	return (
		<group>
			{measurementList.map((measurement) => (
				<group key={measurement.axis}>
					{Math.abs(
						measurement.stretchStart[axisIndices[measurement.axis]] -
							measurement.meshStart[axisIndices[measurement.axis]],
					) > minVisibleSegment ? (
						<Line
							color={fixedSegmentColor}
							points={[measurement.meshStart, measurement.stretchStart]}
						/>
					) : null}
					{Math.abs(
						measurement.stretchEnd[axisIndices[measurement.axis]] -
							measurement.stretchStart[axisIndices[measurement.axis]],
					) > minVisibleSegment ? (
						<Line
							color={measurement.color}
							points={[measurement.stretchStart, measurement.stretchEnd]}
						/>
					) : null}
					{Math.abs(
						measurement.meshEnd[axisIndices[measurement.axis]] -
							measurement.stretchEnd[axisIndices[measurement.axis]],
					) > minVisibleSegment ? (
						<Line
							color={fixedSegmentColor}
							points={[measurement.stretchEnd, measurement.meshEnd]}
						/>
					) : null}
					<DimensionLabel
						axis={measurement.axis}
						axisLabel={measurement.axisLabel}
						color={measurement.color}
						editing={editingAxis === measurement.axis}
						onCommit={onDimensionChange}
						onSelect={onSelectAxis}
						onStartEditing={onEditingAxisChange}
						onStopEditing={() => onEditingAxisChange(null)}
						position={measurement.labelPosition}
						selected={selectedAxis === measurement.axis}
						value={measurement.value}
					/>
				</group>
			))}

			{selectedMeasurement ? (
				<>
					<PlaneHandle
						axis={selectedMeasurement.axis}
						color={selectedMeasurement.color}
						id={selectedMeasurement.planes.negative}
						onDraggingChange={onPlaneHandleDraggingChange}
						onMove={onPlaneHandleMove}
						onSelect={() => onSelectAxis(selectedMeasurement.axis)}
						position={selectedMeasurement.planeStart}
						selected
					/>
					<PlaneHandle
						axis={selectedMeasurement.axis}
						color={selectedMeasurement.color}
						id={selectedMeasurement.planes.positive}
						onDraggingChange={onPlaneHandleDraggingChange}
						onMove={onPlaneHandleMove}
						onSelect={() => onSelectAxis(selectedMeasurement.axis)}
						position={selectedMeasurement.planeEnd}
						selected
					/>
				</>
			) : null}
		</group>
	);
}
