/**
 * A Node in the network
 */
export type Node = {
    // The IP + port address of a node in the network [IP:PORT]
    host: string;
    // The name that is attached to the node
    name: string;
}