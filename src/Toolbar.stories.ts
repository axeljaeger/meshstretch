import type { Meta, StoryObj } from '@storybook/react-vite';

import { fn } from 'storybook/test';

import Toolbar from './Toolbar';

export const ActionsData = {
	onArchiveTask: fn(),
	onPinTask: fn(),
};

const meta = {
	component: Toolbar,
	title: 'Toolbar',
	args: {
		...ActionsData,
	},
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
