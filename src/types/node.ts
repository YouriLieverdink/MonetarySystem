/**
 * A node within the network.
 */
export type Node = {
    /**
     * The host location of the node.
     * 
     * This is formatted as: [IP:PORT]
     */
    host: string;
    /**
     * The name associated with the node.
     */
    name: string;
}