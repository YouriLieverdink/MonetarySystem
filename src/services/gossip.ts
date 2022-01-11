import axios, { AxiosError } from 'axios';
import { Express } from 'express';
import _ from 'lodash';
import Container from 'typedi';
import { Computer } from '../types';

export type GossipConfig = {
    /**
     * A list of known computers used to boot.
     */
    computers: Computer[]
    /**
    * This computer.
    */
    me: Computer;
    /**
     * The interval between syncs in miliseconds.
     */
    interval: number;
};

export abstract class Gossip<T> {
    /**
     * The active computers in the network.
     */
    private computers: Computer[];

    /**
     * The items this class is responsible for distributing.
     */
    protected items: T[];

    /**
     * The last item that this computer has created.
     */
    protected lastItem: T;

    /**
     * `This` computer.
     */
    private me: Computer;

    /**
     * Class constructor.
     */
    constructor(config: GossipConfig) {
        this.computers = config.computers;
        this.me = config.me;
        this.items = [];

        // Add `this` computer when not already present.
        if (!this.computers.some((c) => _.isEqual(c, config.me))) {
            this.computers.push(config.me);
        }

        // Initialise the listener and sender.
        this.initServer();
        setInterval(this.tick.bind(this), config.interval);
    }

    /**
     * Initialises the express application which listens for incoming http
     * requests from the other computers in the network.
     */
    private initServer(): void {
        //
        const server = Container.get<Express>('express');

        server.post('/blab', async (request, response) => {
            //
            const computers: Computer[] = request.body.computers;

            computers.forEach((computer) => {
                // Add the computer when we don't already know it.    
                if (!this.computers.some((c) => _.isEqual(c, computer))) {
                    this.computers.push(computer);
                }
            });

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

        // We remove `this` computer so we don't gossip with ourselves.
        const computers = this.computers.filter(
            (computer) => !_.isEqual(computer, this.me),
        );

        if (computers.length === 0) return;

        // Choose a random computer to gossip with.
        const index = Math.floor(Math.random() * computers.length);
        const chosen = computers[index];

        await this.doHandshake(chosen);
    }

    /**
     * Performs a handshake with the provided computer. Both the provided
     * computer and `this` tell eachother everything they know.
     * 
     * @param computer The computer to communicate with.
     */
    private async doHandshake(computer: Computer, retry = 3): Promise<void> {
        //
        if (retry <= 0) {
            // We remove the computer because it is no longer active.
            const index = this.computers.indexOf(computer);

            if (index > -1) {
                this.computers.splice(index, 1);
            }

            return;
        } //

        try {
            // Send everything we know.
            await axios.post(
                `http://${computer.ip}:${computer.port}/blab`,
                {
                    computers: this.computers,
                    items: this.items,
                    lastItem: this.lastItem
                },
            );
        } //
        catch (e) {
            // For auto-completion.
            const error: AxiosError = e;

            if (!error.response && error.request) {
                // The request could not be deliverd.
                await this.doHandshake(computer, retry - 1);
            }
        }
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