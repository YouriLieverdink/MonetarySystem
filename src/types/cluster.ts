/**
 * The cluster of all (known) nodes.
 */
export type Cluster = {
	// The address of the node and whether it is active.
	[address: string]: '✅' | '❌';
};