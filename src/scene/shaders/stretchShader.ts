import { Vector3 } from 'three';

export type StretchShaderUniformValues = {
	sourceSize: [number, number, number];
	targetSize: [number, number, number];
	fixedInsetMin: [number, number, number];
	fixedInsetMax: [number, number, number];
	selectedAxis: -1 | 0 | 1 | 2;
};

export type StretchShader = {
	uniforms: {
		uSourceSize: { value: Vector3 };
		uTargetSize: { value: Vector3 };
		uFixedInsetMin: { value: Vector3 };
		uFixedInsetMax: { value: Vector3 };
		uSelectedAxis: { value: number };
	};
	vertexShader: string;
	fragmentShader: string;
};

export function stretchAxisCoordinate(
	coordinate: number,
	sourceSize: number,
	targetSize: number,
	fixedStart: number,
	fixedEnd: number,
) {
	const sourceHalf = sourceSize * 0.5;
	const sourceStart = -sourceHalf + fixedStart;
	const sourceEnd = sourceHalf - fixedEnd;
	const stretchSourceSize = Math.max(sourceEnd - sourceStart, 0.0001);

	const targetHalf = targetSize * 0.5;
	const targetStart = -targetHalf + fixedStart;
	const targetEnd = targetHalf - fixedEnd;

	if (coordinate <= sourceStart) {
		return coordinate + (targetStart - sourceStart);
	}

	if (coordinate >= sourceEnd) {
		return coordinate + (targetEnd - sourceEnd);
	}

	const factor = (coordinate - sourceStart) / stretchSourceSize;
	return targetStart + (targetEnd - targetStart) * factor;
}

export function isFixedOnTargetAxis(
	coordinate: number,
	targetSize: number,
	fixedStart: number,
	fixedEnd: number,
) {
	const targetHalf = targetSize * 0.5;
	const targetStart = -targetHalf + fixedStart;
	const targetEnd = targetHalf - fixedEnd;

	return coordinate <= targetStart || coordinate >= targetEnd;
}

const stretchAxisFunction = `
float stretchAxis(float coordinate, float sourceSize, float targetSize, float fixedStart, float fixedEnd) {
  float sourceHalf = sourceSize * 0.5;
  float sourceStart = -sourceHalf + fixedStart;
  float sourceEnd = sourceHalf - fixedEnd;
  float stretchSourceSize = max(sourceEnd - sourceStart, 0.0001);
  float targetHalf = targetSize * 0.5;
  float targetStart = -targetHalf + fixedStart;
  float targetEnd = targetHalf - fixedEnd;

  if (coordinate <= sourceStart) {
    return coordinate + (targetStart - sourceStart);
  }

  if (coordinate >= sourceEnd) {
    return coordinate + (targetEnd - sourceEnd);
  }

  float factor = (coordinate - sourceStart) / stretchSourceSize;
  return mix(targetStart, targetEnd, factor);
}

bool isFixedOnTargetAxis(float coordinate, float targetSize, float fixedStart, float fixedEnd) {
  float targetHalf = targetSize * 0.5;
  float targetStart = -targetHalf + fixedStart;
  float targetEnd = targetHalf - fixedEnd;
  return coordinate <= targetStart || coordinate >= targetEnd;
}
`;

function replaceBeginVertex(shader: StretchShader) {
	shader.vertexShader = shader.vertexShader.replace(
		'#include <common>',
		`#include <common>
varying vec3 vStretchedPosition;
uniform vec3 uSourceSize;
uniform vec3 uTargetSize;
uniform vec3 uFixedInsetMin;
uniform vec3 uFixedInsetMax;
${stretchAxisFunction}
vec3 stretchPosition(vec3 originalPosition) {
  return vec3(
    stretchAxis(originalPosition.x, uSourceSize.x, uTargetSize.x, uFixedInsetMin.x, uFixedInsetMax.x),
    stretchAxis(originalPosition.y, uSourceSize.y, uTargetSize.y, uFixedInsetMin.y, uFixedInsetMax.y),
    stretchAxis(originalPosition.z, uSourceSize.z, uTargetSize.z, uFixedInsetMin.z, uFixedInsetMax.z)
  );
}
`,
	);

	shader.vertexShader = shader.vertexShader.replace(
		'#include <begin_vertex>',
		`vec3 transformed = stretchPosition(position);
vStretchedPosition = transformed;`,
	);
}

function replaceFragmentColor(shader: StretchShader) {
	shader.fragmentShader = shader.fragmentShader.replace(
		'#include <common>',
		`#include <common>
varying vec3 vStretchedPosition;
uniform vec3 uTargetSize;
uniform vec3 uFixedInsetMin;
uniform vec3 uFixedInsetMax;
uniform float uSelectedAxis;
${stretchAxisFunction}
bool isSelectedAxisFixedRange() {
  if (uSelectedAxis < 0.5) {
    return isFixedOnTargetAxis(vStretchedPosition.x, uTargetSize.x, uFixedInsetMin.x, uFixedInsetMax.x);
  }
  if (uSelectedAxis < 1.5) {
    return isFixedOnTargetAxis(vStretchedPosition.y, uTargetSize.y, uFixedInsetMin.y, uFixedInsetMax.y);
  }
  return isFixedOnTargetAxis(vStretchedPosition.z, uTargetSize.z, uFixedInsetMin.z, uFixedInsetMax.z);
}
`,
	);

	shader.fragmentShader = shader.fragmentShader.replace(
		'vec4 diffuseColor = vec4( diffuse, opacity );',
		`vec3 surfaceColor = diffuse;
if (uSelectedAxis >= 0.0 && isSelectedAxisFixedRange()) {
  surfaceColor = mix(surfaceColor, vec3(0.20, 0.70, 1.0), 0.35);
}
vec4 diffuseColor = vec4(surfaceColor, opacity);`,
	);
}

function toVector3(values: [number, number, number]) {
	return new Vector3(...values);
}

export function configureStretchShader(
	shader: StretchShader,
	uniformValues: StretchShaderUniformValues,
) {
	shader.uniforms.uSourceSize = { value: toVector3(uniformValues.sourceSize) };
	shader.uniforms.uTargetSize = { value: toVector3(uniformValues.targetSize) };
	shader.uniforms.uFixedInsetMin = {
		value: toVector3(uniformValues.fixedInsetMin),
	};
	shader.uniforms.uFixedInsetMax = {
		value: toVector3(uniformValues.fixedInsetMax),
	};
	shader.uniforms.uSelectedAxis = { value: uniformValues.selectedAxis };

	replaceBeginVertex(shader);
	replaceFragmentColor(shader);
}

export function updateStretchShaderUniforms(
	shader: StretchShader,
	uniformValues: StretchShaderUniformValues,
) {
	shader.uniforms.uSourceSize.value.set(...uniformValues.sourceSize);
	shader.uniforms.uTargetSize.value.set(...uniformValues.targetSize);
	shader.uniforms.uFixedInsetMin.value.set(...uniformValues.fixedInsetMin);
	shader.uniforms.uFixedInsetMax.value.set(...uniformValues.fixedInsetMax);
	shader.uniforms.uSelectedAxis.value = uniformValues.selectedAxis;
}
