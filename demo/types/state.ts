import { Message } from './message';

/**
 * The state of the application.
 */
export type State = {
	// The list of messages.
	messages: Message[]
};