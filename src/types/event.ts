export type Event<T> = {
    id: string;
    timestamp: Date;
    consensus: boolean;
    publicKey: string;
    signature: string;
    selfParent?: string;
    otherParent?: string;
    data?: T;
};