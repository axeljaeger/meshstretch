import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import Toolbar from './Toolbar';

const baseArgs = {
	dimensions: { x: 5.4, y: 3.2, z: 7.8 },
	fixedRanges: {
		x: { min: 0.8, max: 1.1 },
		y: { min: 0.4, max: 0.6 },
		z: { min: 1.2, max: 1.4 },
	},
	onFixedInsetChange: fn(),
	onFixedInsetReset: fn(),
	selectedAxis: 'x' as const,
};

const meta = {
	component: Toolbar,
	title: 'Toolbar',
	args: {
		...baseArgs,
	},
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};

export const NoSelection: Story = {
	args: {
		selectedAxis: null,
	},
};
