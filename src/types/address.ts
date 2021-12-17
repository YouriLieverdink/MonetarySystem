/**
 * A local address.
 */
export type Address = {
	/**
	 * The public key of the address. 
	 * 
	 * Used to receive funds from others.
	 */
	publicKey: string;
	/**
	 * The private key of the address.
	 * 
	 * Used to sign events and transfer funds.
	 */
	privateKey: string;
	/**
	 * Whether the address should be used as default.
	 * 
	 * Used when creating a transaction.
	 */
	isDefault: boolean | 0 | 1;
};