export type Axis = 'x' | 'y' | 'z';

export type PlaneId = 'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz';

export type PlaneConfig = {
	id: PlaneId;
	position: [number, number, number];
	rotation: [number, number, number];
	translationAxis: Axis;
	color: string;
};