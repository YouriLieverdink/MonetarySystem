export type Transaction = {
    id: string;
    sender: string;
    receiver: string;
    amount: number;
    index?: number;
    timestamp?: number;
    signature: string;
};