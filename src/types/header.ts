import { Event } from './event';

export type Header = {
    witness?: boolean;
    round?: number;
    consensus: boolean;
    body: Event<unknown>;
};