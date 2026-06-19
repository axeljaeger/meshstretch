import { Html } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';

import type { Axis } from '../types';

export const DIMENSION_LABEL_CLASS_NAME = 'dimension-label';

type DimensionLabelProps = {
	axis: Axis;
	editing: boolean;
	axisLabel: 'X' | 'Y' | 'Z';
	color: string;
	position: [number, number, number];
	selected: boolean;
	value: number;
	onCommit: (axis: Axis, value: number) => void;
	onSelect: (axis: Axis) => void;
	onStartEditing: (axis: Axis) => void;
	onStopEditing: () => void;
};

export default function DimensionLabel({
	axis,
	editing,
	axisLabel,
	color,
	position,
	selected,
	value,
	onCommit,
	onSelect,
	onStartEditing,
	onStopEditing,
}: DimensionLabelProps) {
	const formatValue = (nextValue: number) =>
		nextValue < 10 ? nextValue.toFixed(2) : nextValue.toFixed(1);
	const [draftValue, setDraftValue] = useState(() => formatValue(value));
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (editing) {
			inputRef.current?.focus();
			inputRef.current?.select();
		}
	}, [editing]);

	const commit = () => {
		const parsed = Number.parseFloat(draftValue);
		if (!Number.isNaN(parsed)) {
			onCommit(axis, parsed);
		}
		onStopEditing();
	};

	return (
		<Html
			center
			distanceFactor={10}
			occlude={false}
			position={position}
			sprite
			transform
		>
			<div
				className={`${DIMENSION_LABEL_CLASS_NAME}${selected ? ' selected' : ''}`}
				data-axis={axis}
			>
				{editing ? (
					<>
						<span style={{ backgroundColor: color }}>{axisLabel}</span>
						<input
							className={`${DIMENSION_LABEL_CLASS_NAME}__input`}
							onBlur={commit}
							onChange={(event) => setDraftValue(event.target.value)}
							onClick={(event) => event.stopPropagation()}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									commit();
								}

								if (event.key === 'Escape') {
									onStopEditing();
								}
							}}
							ref={inputRef}
							type="number"
							value={draftValue}
						/>
					</>
				) : (
					<button
						className={`${DIMENSION_LABEL_CLASS_NAME}__button`}
						onClick={(event) => {
							event.stopPropagation();
							onSelect(axis);
						}}
						onDoubleClick={(event) => {
							event.stopPropagation();
							setDraftValue(formatValue(value));
							onStartEditing(axis);
						}}
						type="button"
					>
						<span style={{ backgroundColor: color }}>{axisLabel}</span>
						<span>{value < 10 ? value.toFixed(2) : value.toFixed(1)}</span>
					</button>
				)}
			</div>
		</Html>
	);
}
