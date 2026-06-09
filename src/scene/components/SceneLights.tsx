export default function SceneLights() {
	return (
		<>
			<ambientLight intensity={0.7} />
			<directionalLight castShadow intensity={1.1} position={[8, 10, 6]} />
			<directionalLight intensity={0.45} position={[-6, 4, -8]} />
		</>
	);
}
