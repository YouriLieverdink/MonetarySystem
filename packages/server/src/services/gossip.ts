import axios from 'axios';
import { Express } from 'express';
import _ from 'lodash';
import { Computer } from '../types/computer';
import { Collection } from './collection';

export abstract class Gossip<T> {
    /**
     * The known computers in the network.
     */
    private computers: Collection<Computer>;

    /**
     * The items this class is responsible for distributing.
     */
    protected items: T[];

    /**
     * The last item that this computer has created.
     */
    protected lastItem: T;

    /**
     * Class constructor.
     */
    constructor(
        server: Express,
        computers: Collection<Computer>,
    ) {
        //
        this.computers = computers;
        this.items = [];

        // Initialise the listener and sender.
        this.initServer(server);
        setInterval(this.tick.bind(this), 500);
    }

    /**
     * Initialises the express application which listens for incoming http
     * requests from the other computers in the network.
     */
    private initServer(server: Express): void {
        //
        server.post('/gossip', async (request, response) => {
            const items: T[] = request.body.items;
            const lastItem: T = request.body.lastItem;

            // Process the items.
            await this.handleHandshake(items, lastItem);

            response.sendStatus(200);
        });
    }

    /**
     * Initiate a new gossip sync with another computer in the network at a 
     * constant `interval`.
     */
    private async tick(): Promise<void> {
        //
        this.onTick();

        const computer = this.computers.random();

        await this.doHandshake(computer);
    }

    /**
     * Performs a handshake with the provided computer. Both the provided
     * computer and `this` tell eachother everything they know.
     * 
     * @param computer The computer to communicate with.
     */
    private async doHandshake(computer: Computer): Promise<void> {
        //
        try {
            // Send everything we know.
            await axios.post(
                `http://${computer.ip}:${computer.port}/gossip`,
                { items: this.items, lastItem: this.lastItem },
            );
        } //
        catch (_) { }
    }

    /**
     * The receiving end of the `doHandshake` method. Stores the items that
     * `this` is missing and sends back the items that the other computer is
     * missing.
     * 
     * @param items The received items from the network.
     * @param lastItem The last item the other computer has created.
     */
    private async handleHandshake(items: T[], lastItem: T): Promise<void> {
        //
        const myNewItems: T[] = [];

        items.forEach((item) => {
            // Check if we know this event.
            if (!this.items.some((i) => _.isEqual(item, i))) {
                myNewItems.push(item);
            }
        });

        this.onItems(myNewItems, lastItem);
    }

    /**
     * Called every constant `interval`.
     */
    protected abstract onTick(): void;

    /**
     * Called whenever this computer received a batch of items.
     * 
     * @param items The newly received items.
     * @param lastItem The last item the other computer created.
     */
    protected abstract onItems(items: T[], lastItem: T): void;
}