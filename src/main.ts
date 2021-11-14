import { gossip, } from './server';

/**
 * Send a state update every second.
 */
setInterval(() => gossip.dispatch(), 1000);