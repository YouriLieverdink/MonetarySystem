export type Event<T> = {
    id: string;
    createdAt: number;
    selfParent?: string;
    otherParent?: string;
    data?: T;
};