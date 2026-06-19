import type { Axis } from './scene/types';

type ModelToolbarProps = {
	filename: string | null;
	sourceDimensions: Record<Axis, number> | null;
	targetDimensions: Record<Axis, number> | null;
	shareDisabled?: boolean;
	onShare: () => void;
};

function formatDims(dims: Record<Axis, number> | null) {
	if (!dims) {
		return '—';
	}
	return `${dims.x.toFixed(2)} × ${dims.y.toFixed(2)} × ${dims.z.toFixed(2)}`;
}

export default function ModelToolbar({
	filename,
	sourceDimensions,
	targetDimensions,
	shareDisabled,
	onShare,
}: ModelToolbarProps) {
	return (
		<div className="model-toolbar">
			<div className="model-toolbar__group">
				<div className="model-toolbar__title">
					{filename ?? 'No model loaded'}
				</div>
			</div>
			<div className="model-toolbar__meta">
				Original {formatDims(sourceDimensions)}
			</div>
			<div className="model-toolbar__meta">
				New {formatDims(targetDimensions)}
			</div>
			<button
				className="model-toolbar__button"
				disabled={shareDisabled}
				onClick={onShare}
				type="button"
			>
				share
			</button>
		</div>
	);
}
