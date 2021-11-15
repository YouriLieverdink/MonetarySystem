import { State } from './state';

export type Cluster = {
	[address: string]: State;
};