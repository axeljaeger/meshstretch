import { RoundedBox } from '@react-three/drei';
import { type Ref, useEffect, useMemo, useRef } from 'react';
import type { BufferGeometry, Mesh, MeshStandardMaterial } from 'three';

import { CUBE_SIZE } from '../constants';
import {
	configureStretchShader,
	type StretchShader,
	type StretchShaderUniformValues,
	updateStretchShaderUniforms,
} from '../shaders/stretchShader';
import { AXIS_INDICES } from '../stretchSpec';
import type { Axis } from '../types';

type StretchableMeshProps = {
	dimensions: Record<Axis, number>;
	fixedInsets: {
		min: [number, number, number];
		max: [number, number, number];
	};
	meshRef?: Ref<Mesh | null>;
	selectedAxis: Axis | null;
	geometry?: BufferGeometry | null;
	sourceSize?: [number, number, number];
};

export default function StretchableMesh({
	dimensions,
	fixedInsets,
	meshRef,
	selectedAxis,
	geometry,
	sourceSize,
}: StretchableMeshProps) {
	const localMeshRef = useRef<Mesh>(null);
	const materialRef = useRef<MeshStandardMaterial>(null);
	const shaderRef = useRef<StretchShader | null>(null);
	const resolvedMeshRef = meshRef ?? localMeshRef;

	const uniformValues = useMemo<StretchShaderUniformValues>(
		() => ({
			sourceSize: sourceSize ?? [CUBE_SIZE, CUBE_SIZE, CUBE_SIZE],
			targetSize: [dimensions.x, dimensions.y, dimensions.z],
			fixedInsetMin: fixedInsets.min,
			fixedInsetMax: fixedInsets.max,
			selectedAxis: selectedAxis ? AXIS_INDICES[selectedAxis] : -1,
		}),
		[
			dimensions.x,
			dimensions.y,
			dimensions.z,
			fixedInsets.max,
			fixedInsets.min,
			selectedAxis,
			sourceSize,
		],
	);

	useEffect(() => {
		if (!shaderRef.current) {
			return;
		}

		updateStretchShaderUniforms(shaderRef.current, uniformValues);
	}, [uniformValues]);

	const material = (
		<meshStandardMaterial
			ref={materialRef}
			color="#d8dee9"
			metalness={0.08}
			roughness={0.55}
			onBeforeCompile={(shader) => {
				const typedShader = shader as unknown as StretchShader;
				configureStretchShader(typedShader, uniformValues);
				shaderRef.current = typedShader;
			}}
		/>
	);

	if (geometry) {
		return (
			<mesh geometry={geometry} ref={resolvedMeshRef}>
				{material}
			</mesh>
		);
	}

	return (
		<RoundedBox
			args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]}
			radius={0.5}
			smoothness={8}
			ref={resolvedMeshRef}
		>
			{material}
		</RoundedBox>
	);
}
