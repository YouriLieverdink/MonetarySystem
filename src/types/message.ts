import { Peer } from "./peer";

/**
 * A message send over the network.
 */
export type Message = {
	from: Peer;
	data: unknown;
};