import { PLANE_SIZE } from '../constants';
import type { Axis, PlaneConfig, PlaneId } from '../types';

type PlanesProps = {
	planes: PlaneConfig[];
	planePositions: Record<PlaneId, [number, number, number]>;
	selectedAxis: Axis | null;
	visible: boolean;
};

function Planes({ planes, planePositions, selectedAxis, visible }: PlanesProps) {
	return (
		<>
			{planes.map((plane) => (
				<mesh
					key={plane.id}
					position={planePositions[plane.id]}
					rotation={plane.rotation}
					raycast={() => {}}
				>
					<planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
					<meshStandardMaterial
						color={plane.color}
						transparent
						opacity={visible && selectedAxis === plane.translationAxis ? 0.45 : 0}
						depthWrite={false}
						side={2}
					/>
				</mesh>
			))}
		</>
	);
}

export default Planes;