export type Event<T> = {
    id: string;
    createdAt: number;
    publicKey: string;
    signature: string;
    selfParent?: string;
    otherParent?: string;
    data?: T;
};