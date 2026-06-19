import { Fragment } from 'react';
import { DoubleSide } from 'three';

import { planeConfigs } from '../planeConfigs';
import type { Axis, PlaneId } from '../types';

type PlanesProps = {
	planePositions: Record<PlaneId, [number, number, number]>;
	selectedAxis: Axis | null;
	planeSize: number;
};

export default function Planes({
	planePositions,
	selectedAxis,
	planeSize,
}: PlanesProps) {
	return (
		<group>
			{planeConfigs
				.filter((config) => config.axis === selectedAxis)
				.map((config) => (
					<Fragment key={config.id}>
						<mesh
							position={planePositions[config.id]}
							rotation={config.rotation}
						>
							<planeGeometry args={[planeSize, planeSize]} />
							<meshBasicMaterial
								color={config.color}
								opacity={0.12}
								transparent
								depthWrite={false}
								side={DoubleSide}
							/>
						</mesh>
					</Fragment>
				))}
		</group>
	);
}
