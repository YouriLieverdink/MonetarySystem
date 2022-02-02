export type Transaction = {
	id: string;
	sender: string;
	received: string;
	amount: number;
	index?: number;
	timestamp?: number;
};