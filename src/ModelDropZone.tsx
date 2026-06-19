import { useRef, useState } from 'react';

type ModelDropZoneProps = {
	onLoadSample: () => void;
	onLoadFile: (file: File) => Promise<void>;
	onLoadUrl: (url: string) => Promise<void>;
};

export default function ModelDropZone({
	onLoadSample,
	onLoadFile,
	onLoadUrl,
}: ModelDropZoneProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [url, setUrl] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<'file' | 'url' | null>(null);

	const pickFile = () => fileInputRef.current?.click();

	const handleFile = async (file: File) => {
		setError(null);
		setLoading('file');
		try {
			await onLoadFile(file);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load STL file.');
		} finally {
			setLoading(null);
		}
	};

	const handleUrl = async () => {
		const trimmed = url.trim();
		if (!trimmed) {
			setError('Please enter a URL.');
			return;
		}

		setError(null);
		setLoading('url');
		try {
			await onLoadUrl(trimmed);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to fetch STL from URL.',
			);
		} finally {
			setLoading(null);
		}
	};

	return (
		<section
			aria-label="STL file drop zone"
			className="model-dropzone"
			onDragOver={(event) => {
				event.preventDefault();
				event.dataTransfer.dropEffect = 'copy';
			}}
			onDrop={(event) => {
				event.preventDefault();
				const file = event.dataTransfer.files?.[0];
				if (file) {
					void handleFile(file);
				}
			}}
		>
			<div className="model-dropzone__panel">
				<div className="model-dropzone__title">Drop an STL file here</div>
				<div className="model-dropzone__subtitle">
					Or load one from a URL / your computer. (STL only, for now.)
				</div>

				<div className="model-dropzone__actions">
					<button
						className="model-dropzone__button"
						onClick={pickFile}
						type="button"
					>
						Browse
					</button>
					<button
						className="model-dropzone__button"
						onClick={onLoadSample}
						type="button"
					>
						Load sample
					</button>
				</div>

				<div className="model-dropzone__url">
					<input
						className="model-dropzone__input"
						inputMode="url"
						onChange={(event) => setUrl(event.target.value)}
						placeholder="https://example.com/model.stl"
						type="url"
						value={url}
					/>
					<button
						className="model-dropzone__button"
						disabled={loading === 'url'}
						onClick={() => void handleUrl()}
						type="button"
					>
						{loading === 'url' ? 'Fetching…' : 'Fetch'}
					</button>
				</div>

				{loading === 'file' ? (
					<div className="model-dropzone__status">Loading file…</div>
				) : null}
				{error ? <div className="model-dropzone__error">{error}</div> : null}

				<input
					accept=".stl"
					hidden
					ref={fileInputRef}
					onChange={(event) => {
						const file = event.target.files?.[0];
						if (!file) {
							return;
						}
						void handleFile(file);
					}}
					type="file"
				/>
			</div>
		</section>
	);
}
