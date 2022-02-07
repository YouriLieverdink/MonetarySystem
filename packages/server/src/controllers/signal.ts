import { Express } from 'express';
import _ from 'lodash';
import { Collection, Crypto, Gossip } from '../services/_';
import { Computer } from '../types/_';

export class Signal extends Gossip<Computer> {
    /**
     * Class construtor.
     * 
     * @param computers The known computers in the network.
     * @param endpoint The endpoint this class should use.
     * @param interval The interval at which this computer should gossip.
     * @param me This computer.
     * @param server The active express server.
     * @param crypto Used for cryptographic operations.
     */
    constructor(
        protected computers: Collection<Computer>,
        interval: number,
        me: Computer,
        server: Express,
        protected crypto: Crypto,
    ) {
        //
        super(computers, 'signal', interval, me, server, crypto);

        // Set the initial items to bootstrap.
        this.computers.all()
            .map(this.helpers.increment)
            .forEach((computer) => this.items.add(computer));
    }

    protected get unique(): string | null {
        //
        return 'ip';
    };

    public onTick(): void {
        //
    }

    public onItems(items: Computer[], publicKey: string): void {
        //
        this.items.add(...items);
        this.computers.add(...items);
    }

    public onError(kind: string, computer: Computer, error?: Error): void {
        //
        if (kind === 'error-request') {
            // The computer is unreachable.
            this.items.remove(computer);
            this.computers.remove(computer);
        }
    }
}