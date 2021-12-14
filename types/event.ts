/**
 * An event in the hashgraph
 */
export type Event = {
    // When the message was created.
    Type: 'TRANSACTION'|'JOIN'|'STATE';
    // The content of the message.
    Data: Object;
    // The hash of the user who received the message.
    SelfParent: string;
    // The hash of the user who received the message.
    OtherParent: string;
    // The signature of the user who originally send the message.
    Signature: string;
    // When the message was created.
    Date: Date;
};
