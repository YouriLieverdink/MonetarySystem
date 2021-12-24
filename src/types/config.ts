/**
 * Configuration options for the internal controller.
 */
export type Config = {
	/**
	 * The interval in miliseconds at which the node should operate.
	 */
	interval: number;
	/**
	 * The port number the node should listen on.
	 */
	port: number;
	/**
	 * The host of the seed node.
	 * 
	 * Format: [IP:PORT]
	 */
	seed: string;
	/**
	 * The output handler.
	 */
	response: Console;
};