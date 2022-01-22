export type Event<T> = {
    id: string;
    timestamp: Date;
    publicKey: string;
    signature: string;
    selfParent?: string;
    otherParent?: string;
    data?: T;
};