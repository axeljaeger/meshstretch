import type { ThreeElements, ThreeEvent } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';

import type { Mesh } from 'three';
import { CUBE_SIZE } from '../constants';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
type BoxProps = ThreeElements['mesh'] & {
	selected?: boolean;
	onSelect?: (event: ThreeEvent<PointerEvent>) => void;
	onBoxRef?: (mesh: Mesh | null) => void;
};

function Box({ selected = false, onSelect, onBoxRef, ...props }: BoxProps) {
	const ref = useRef<Mesh>(null);
	const [hovered, hover] = useState(false);

	useEffect(() => {
		if (ref.current) {
			// Create rounded box geometry with radius for rounded corners
			const roundedGeometry = new RoundedBoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, 4, 0.3);
			ref.current.geometry = roundedGeometry;
		}
	}, []);

	const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
		// Only select if the exact mesh was hit (not other objects behind it)
		if (event.object === ref.current && onSelect) {
			onSelect(event);
		}
	};

	return (
		<mesh
			{...props}
			ref={(mesh) => {
				ref.current = mesh;
				onBoxRef?.(mesh);
			}}
			onPointerOver={() => hover(true)}
			onPointerOut={() => hover(false)}
			onPointerDown={handlePointerDown}
		>
			<meshStandardMaterial color={selected ? '#fb7185' : hovered ? 'hotpink' : 'orange'} />
		</mesh>
	);
}

export default Box;