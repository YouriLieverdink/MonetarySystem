import { Cluster } from './cluster';
import { State } from './state';

/**
 * Gossip that is sent over the network.
 */
export type Gossip = {
	cluster: Cluster;
	state: State;
};