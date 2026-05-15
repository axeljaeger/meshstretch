import { GizmoHelper, GizmoViewcube, OrbitControls } from '@react-three/drei';
import { Canvas, type ThreeElements } from '@react-three/fiber';
import { useRef, useState } from 'react';

import type { Mesh } from 'three';
import './App.css';
import Toolbar from './Toolbar';

function Box(props: ThreeElements['mesh']) {
	// This reference gives us direct access to the THREE.Mesh object
	const ref = useRef<Mesh>(null);
	// Hold state for hovered and clicked events
	const [hovered, hover] = useState(false);
	const [clicked, click] = useState(false);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: False positive since this is no DOM element
		<mesh
			{...props}
			ref={ref}
			scale={clicked ? 1.5 : 1}
			onClick={(_event) => click(!clicked)}
			onPointerOver={(_event) => hover(true)}
			onPointerOut={(_event) => hover(false)}
		>
			<boxGeometry args={[5, 5, 5]} />
			<meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
		</mesh>
	);
}

function App() {
	return (
		<>
			<Canvas orthographic camera={{ zoom: 50, position: [10, 10, 10] }}>
				<ambientLight intensity={Math.PI / 2} />
				<spotLight
					position={[10, 10, 10]}
					angle={0.15}
					penumbra={1}
					decay={0}
					intensity={Math.PI}
				/>
				<pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
				<Box position={[0, 0, 0]} />
				<OrbitControls />

				<GizmoHelper
					alignment="top-right" // widget alignment within scene
					margin={[80, 80]}
				>
					<GizmoViewcube />
				</GizmoHelper>
			</Canvas>
			<Toolbar />
		</>
	);
}

export default App;
