import type { Axis } from './scene/types';

const axisLabels: Record<Axis, string> = {
	x: 'Width (X)',
	y: 'Height (Y)',
	z: 'Depth (Z)',
};

type ToolbarProps = {
	dimensions: Record<Axis, number>;
	fixedRanges: Record<Axis, { min: number; max: number }>;
	onFixedInsetChange: (axis: Axis, edge: 'start' | 'end', value: number) => void;
	onFixedInsetReset: (axis: Axis) => void;
	selectedAxis: Axis | null;
};

export default function Toolbar({
	dimensions,
	fixedRanges,
	onFixedInsetChange,
	onFixedInsetReset,
	selectedAxis,
}: ToolbarProps) {
	if (!selectedAxis) {
		return (
			<div className="toolbar toolbar--idle">
				<div className="toolbar__hint">Select an axis label to edit fixed ranges.</div>
			</div>
		);
	}

	const range = fixedRanges[selectedAxis];

	return (
		<div className="toolbar toolbar--active">
			<div className="toolbar__group">
				<div className="toolbar__title">{axisLabels[selectedAxis]}</div>
				<div className="toolbar__meta">Size {dimensions[selectedAxis].toFixed(2)}</div>
			</div>
			<label className="toolbar__field">
				<span>start</span>
				<input
					className="toolbar__input"
					min="0"
					onChange={(event) => onFixedInsetChange(selectedAxis, 'start', Number(event.target.value))}
					step="0.1"
					type="number"
					value={range.min.toFixed(2)}
				/>
			</label>
			<label className="toolbar__field">
				<span>end</span>
				<input
					className="toolbar__input"
					min="0"
					onChange={(event) => onFixedInsetChange(selectedAxis, 'end', Number(event.target.value))}
					step="0.1"
					type="number"
					value={range.max.toFixed(2)}
				/>
			</label>
			<button
				className="toolbar__button"
				onClick={() => onFixedInsetReset(selectedAxis)}
				type="button"
			>
				reset
			</button>
		</div>
	);
}
