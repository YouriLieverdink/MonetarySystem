/**
 * An event in the hashgraph.
 */
export type Event = {
    /**
     * The type of the event.
     * 
     * transaction - A tranfer between to addresses.
     * join        - A node joining the network.
     * state       - An event containg a signed state.
     */
    type: 'transaction' | 'join' | 'state';
    /**
     * The content of the event.
     */
    data: Record<string, unknown>;
    /**
     * The hash of the last event of the user.
     */
    selfParent: string;
    /**
     * The hash of the origin event.
     */
    otherParent: string;
    /**
     * The signature of the user who originally send the event.
     */
    signature: string;
    /**
     * When the event was created.
     */
    date: Date;
};
