import { Express } from 'express';
import { Collection, Gossip } from '../services/_';
import { Computer } from '../types/_';

export class Signal {
    /**
     * The gossip instance.
     */
    private _instance: Gossip<Computer>;

    /**
     * Class constructor.
     * 
     * @param server The active express server.
     * @param computers The known computers in the network.
     * @param interval The interval at which to operate.
     * @param me This computer.
     */
    constructor(
        private server: Express,
        private computers: Collection<Computer>,
        private interval: number,
        private me: Computer,
    ) {
        //
        this._instance = new Gossip(
            this.server, 'signal', this.interval, this.computers, this.me,
        );

        // We add the provided computers to bootstrap.
        this._instance.items.add(...this.computers.items);

        this._instance.onTick.subscribe(this.onTick.bind(this));
        this._instance.onItems.subscribe(this.onItems.bind(this));
        this._instance.onError.subscribe(this.onError.bind(this));
    }

    /**
     * Handles the `onTick` event.
     */
    private async onTick(): Promise<void> {
        //
    }

    /**
     * Handles the `onItems` event.
     * 
     * @param args The event arguments.
     */
    private async onItems(args: { items: Computer[], lastItem: Computer }): Promise<void> {
        //
        this._instance.items.add(...args.items);
        this.computers.add(...args.items);
    }

    /**
     * Handles the `onError` event.
     * 
     * @param args The event arguments.
     */
    private async onError(args: { kind: string, computer: Computer }): Promise<void> {
        //
        if (args.kind === 'error-request') {
            // The computer is unreachable.
            this._instance.items.remove(args.computer);
            this.computers.remove(args.computer);
        }
    }
}