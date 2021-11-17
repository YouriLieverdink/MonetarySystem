/**
 * A message within the state.
 */
 export type Message = {
	// When the message was created.
	date: Date;
	// The content of the message.
	content: string;
	// The address of the user who created the message.
	address: string;
};