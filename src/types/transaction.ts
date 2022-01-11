import { Node } from './computer';

/**
 * A transfer within the network.
 */
export type Transaction = {
	/**
	 * Information on the creating node.
	 */
	node: Node;
	/**
	 * The public key of the sending address.
	 */
	from: string;
	/**
	 * The public key of the receiving address.
	 */
	to: string;
	/**
	 * The transferred amount.
	 */
	amount: number;
};