export type Event<T> = {
    id: string;
    createdAt: Date;
    publicKey: string;
    signature: string;
    selfParent?: string;
    otherParent?: string;
    data?: T;
};