import { GizmoHelper, GizmoViewcube, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { BufferGeometry, Mesh, Object3D } from 'three';

import './App.css';
import ModelDropZone from './ModelDropZone';
import ModelToolbar from './ModelToolbar';
import Toolbar from './Toolbar';
import CubeMeasurements from './scene/components/CubeMeasurements';
import { DIMENSION_LABEL_CLASS_NAME } from './scene/components/DimensionLabel';
import Planes from './scene/components/Planes';
import SceneLights from './scene/components/SceneLights';
import StretchableMesh from './scene/components/StretchableMesh';
import { CUBE_SIZE } from './scene/constants';
import { getClampedAxisFixedInsets } from './scene/stretchSpec';
import type { Axis } from './scene/types';
import { useStretchEditor } from './scene/useStretchEditor';
import { loadStlFromArrayBuffer } from './model/loadStl';

type LoadedModel =
	| {
			id: string;
			kind: 'sample';
			filename: string;
			sourceSize: [number, number, number];
			geometry?: undefined;
	  }
	| {
			id: string;
			kind: 'stl';
			filename: string;
			sourceSize: [number, number, number];
			geometry: BufferGeometry;
	  };

function LoadedModelEditor({ model }: { model: LoadedModel }) {
	const meshRef = useRef<Mesh>(null);
	const [meshObject, setMeshObject] = useState<Object3D | null>(null);
	const [selectedAxis, setSelectedAxis] = useState<Axis | null>(null);
	const [editingAxis, setEditingAxis] = useState<Axis | null>(null);
	const [isPlaneHandleDragging, setIsPlaneHandleDragging] = useState(false);

	const sourceDimensions = useMemo(
		() => ({
			x: model.sourceSize[0],
			y: model.sourceSize[1],
			z: model.sourceSize[2],
		}),
		[model.sourceSize],
	);

	const {
		dimensions,
		fixedInsets,
		handleFixedInsetChange,
		handleFixedInsetReset,
		handleDimensionChange,
		handlePlaneHandleMove,
		planePositions,
		stretchSpec,
	} = useStretchEditor(sourceDimensions);

	const handleMeshRef = useCallback((mesh: Mesh | null) => {
		meshRef.current = mesh;
		if (mesh) {
			setMeshObject((current) => (current === mesh ? current : mesh));
		}
	}, []);

	const handleSelectAxis = useCallback((axis: Axis) => {
		setSelectedAxis(axis);
	}, []);

	const planeSize = useMemo(() => {
		const max = Math.max(dimensions.x, dimensions.y, dimensions.z);
		return Math.max(1, max * 1.6);
	}, [dimensions.x, dimensions.y, dimensions.z]);

	return (
		<>
			<ModelToolbar
				filename={model.filename}
				sourceDimensions={sourceDimensions}
				targetDimensions={dimensions}
				shareDisabled={false}
				onShare={() => {
					void (async () => {
						// Fake STL export (placeholder) to test OS share-sheet behavior.
						const baseName =
							model.filename.replace(/\.stl$/i, '') || 'meshstretch';
						const fileName = `${baseName}-meshstretch.stl`;
						const stlText = `solid ${baseName}\nfacet normal 0 0 1\n outer loop\n  vertex 0 0 0\n  vertex 1 0 0\n  vertex 0 1 0\n endloop\nendfacet\nendsolid ${baseName}\n`;
						const blob = new Blob([stlText], { type: 'model/stl' });
						const file = new File([blob], fileName, { type: 'model/stl' });

						const canShareFiles =
							typeof navigator !== 'undefined' &&
							!!navigator.share &&
							(navigator.canShare
								? navigator.canShare({ files: [file] })
								: true);

						if (canShareFiles) {
							await navigator.share({
								title: 'Meshstretch STL',
								files: [file],
								text: 'Fake STL export (placeholder).',
							});
							return;
						}

						// Fallback: download the file so you can still observe OS/app behavior.
						const url = URL.createObjectURL(blob);
						try {
							const a = document.createElement('a');
							a.href = url;
							a.download = fileName;
							a.click();
							window.alert(
								'File sharing is not supported in this browser. Downloaded a fake STL instead.',
							);
						} finally {
							URL.revokeObjectURL(url);
						}
					})().catch((err) => {
						window.alert(
							err instanceof Error ? err.message : 'Sharing failed.',
						);
					});
				}}
			/>

			<Canvas
				orthographic
				camera={{ zoom: 50, position: [10, 10, 10] }}
				onPointerMissed={(event) => {
					const target = event.target as HTMLElement | null;
					if (target?.closest(`.${DIMENSION_LABEL_CLASS_NAME}`)) {
						return;
					}

					setSelectedAxis(null);
					setEditingAxis(null);
				}}
			>
				<SceneLights />
				<StretchableMesh
					key={model.id}
					dimensions={dimensions}
					fixedInsets={fixedInsets}
					meshRef={handleMeshRef}
					selectedAxis={selectedAxis}
					geometry={model.kind === 'stl' ? model.geometry : null}
					sourceSize={model.sourceSize}
				/>
				<Planes
					planePositions={planePositions}
					planeSize={planeSize}
					selectedAxis={selectedAxis}
				/>
				<CubeMeasurements
					cubeObject={meshObject}
					dimensions={dimensions}
					editingAxis={editingAxis}
					onDimensionChange={handleDimensionChange}
					onEditingAxisChange={setEditingAxis}
					onPlaneHandleDraggingChange={setIsPlaneHandleDragging}
					onPlaneHandleMove={handlePlaneHandleMove}
					onSelectAxis={handleSelectAxis}
					planePositions={planePositions}
					selectedAxis={selectedAxis}
				/>
				<OrbitControls makeDefault enabled={!isPlaneHandleDragging} />
				<GizmoHelper alignment="top-right" margin={[80, 80]}>
					<GizmoViewcube />
				</GizmoHelper>
			</Canvas>

			<Toolbar
				dimensions={dimensions}
				fixedRanges={{
					x: getClampedAxisFixedInsets(stretchSpec.x),
					y: getClampedAxisFixedInsets(stretchSpec.y),
					z: getClampedAxisFixedInsets(stretchSpec.z),
				}}
				onFixedInsetChange={handleFixedInsetChange}
				onFixedInsetReset={handleFixedInsetReset}
				selectedAxis={selectedAxis}
			/>
		</>
	);
}

export default function App() {
	const [model, setModel] = useState<LoadedModel | null>(null);

	const loadSample = useCallback(() => {
		setModel((current) => {
			if (current?.kind === 'stl') {
				current.geometry.dispose();
			}
			return {
				id: `sample-${Date.now()}`,
				kind: 'sample',
				filename: 'Sample (rounded box)',
				sourceSize: [CUBE_SIZE, CUBE_SIZE, CUBE_SIZE],
			};
		});
	}, []);

	const loadStlFile = useCallback(async (file: File) => {
		const buffer = await file.arrayBuffer();
		const loaded = loadStlFromArrayBuffer(buffer);

		setModel((current) => {
			if (current?.kind === 'stl') {
				current.geometry.dispose();
			}
			return {
				id: `${file.name}-${Date.now()}`,
				kind: 'stl',
				filename: file.name,
				sourceSize: [
					loaded.sourceDimensions.x,
					loaded.sourceDimensions.y,
					loaded.sourceDimensions.z,
				],
				geometry: loaded.geometry,
			};
		});
	}, []);

	const loadStlUrl = useCallback(async (url: string) => {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} when fetching STL.`);
		}
		const buffer = await response.arrayBuffer();
		const loaded = loadStlFromArrayBuffer(buffer);
		const nameFromUrl = url.split('/').filter(Boolean).pop() ?? 'model.stl';

		setModel((current) => {
			if (current?.kind === 'stl') {
				current.geometry.dispose();
			}
			return {
				id: `${nameFromUrl}-${Date.now()}`,
				kind: 'stl',
				filename: nameFromUrl,
				sourceSize: [
					loaded.sourceDimensions.x,
					loaded.sourceDimensions.y,
					loaded.sourceDimensions.z,
				],
				geometry: loaded.geometry,
			};
		});
	}, []);

	return (
		<div className="app-shell">
			{model ? (
				<LoadedModelEditor key={model.id} model={model} />
			) : (
				<>
					<ModelToolbar
						filename={null}
						sourceDimensions={null}
						targetDimensions={null}
						shareDisabled
						onShare={() => {}}
					/>
					<Canvas orthographic camera={{ zoom: 50, position: [10, 10, 10] }}>
						<SceneLights />
						<OrbitControls makeDefault />
						<GizmoHelper alignment="top-right" margin={[80, 80]}>
							<GizmoViewcube />
						</GizmoHelper>
					</Canvas>
					<ModelDropZone
						onLoadFile={loadStlFile}
						onLoadSample={loadSample}
						onLoadUrl={loadStlUrl}
					/>
				</>
			)}
		</div>
	);
}
