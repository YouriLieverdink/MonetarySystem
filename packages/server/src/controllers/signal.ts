import { Collection, Gossip } from '../services/_';
import { Computer } from '../types/_';
import { Express } from 'express';

export class Signal extends Gossip<Computer> {
    /**
     * Class construtor.
     * 
     * @param computers The known computers in the network.
     * @param endpoint The endpoint this class should use.
     * @param interval The interval at which this computer should gossip.
     * @param me This computer.
     * @param server The active express server.
     */
    constructor(
        protected computers: Collection<Computer>,
        interval: number,
        me: Computer,
        server: Express,
    ) {
        //
        super(computers, 'signal', interval, me, server);

        // Set the initial items to bootstrap.
        this.items.add(...this.computers.all());
    }

    /**
     * This array contains all the keys the class does not wish to be send over
     * the network or to be used in equality comparisons.
     */
    public except(): string[] {
        //
        return [];
    }

    /**
     * This method is called everytime the gossip service initiates a new
     * handshake with a randomly selected computer.
     */
    public onTick(): void {
        //
    }

    /**
     * This method is called whenever the gossip service has received items that
     * it did not already know.
     * 
     * @param items The newly received items.
     * @param last The last item the other computer has created.
     */
    public onItems(items: Computer[], last: Computer): void {
        //
        this.items.add(...items);
        this.computers.add(...items);
    }

    /**
     * This method is called whenever the axios post request to another computer
     * throws an error.
     * 
     * @param kind The kind of error that was thrown.
     * @param computer The computer to which the gossip service was communicating.
     * @param error The actual error object.
     */
    public onError(kind: string, computer: Computer, error?: Error): void {
        //
        if (kind === 'error-request') {
            // The computer is unreachable.
            this.items.remove(computer);
            this.computers.remove(computer);
        }
    }
}