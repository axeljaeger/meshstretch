import type { ThreeEvent } from '@react-three/fiber';
import type { Mesh } from 'three';

import { PLANE_SIZE } from '../constants';
import type { PlaneConfig, PlaneId } from '../types';

type PlanesProps = {
	planes: PlaneConfig[];
	selectedPlaneId: PlaneId | null;
	onPlaneRef: (id: PlaneId, mesh: Mesh | null) => void;
	onPlanePointerDown: (event: ThreeEvent<PointerEvent>, id: PlaneId) => void;
};

function Planes({ planes, selectedPlaneId, onPlaneRef, onPlanePointerDown }: PlanesProps) {
	return (
		<>
			{planes.map((plane) => (
				<mesh
					key={plane.id}
					ref={(mesh) => onPlaneRef(plane.id, mesh)}
					position={plane.position}
					rotation={plane.rotation}
					onPointerDown={(event) => onPlanePointerDown(event, plane.id)}
				>
					<planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
					<meshStandardMaterial
						color={plane.color}
						transparent
						opacity={selectedPlaneId === plane.id ? 0.45 : 0.2}
						side={2}
					/>
				</mesh>
			))}
		</>
	);
}

export default Planes;