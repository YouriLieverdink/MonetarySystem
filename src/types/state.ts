/**
 * The state of an address.
 */
export type State = {
	/**
	 * The public key of the associated address.
	 */
	publicKey: string;
	/**
	 * The balance of the address.
	 */
	amount: number;
	/**
	 * The date and time the address recieved a reward or joined.
	 */
	date: Date;
};