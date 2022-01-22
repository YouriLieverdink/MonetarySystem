import axios, { AxiosError } from 'axios';
import { Express } from "express";
import { Computer } from "../types/computer";
import { Collection } from "./collection";

/**
 * A discovery service for locating, and connecting with, other nodes in the
 * peer-to-peer network.
 */
export class Signal {
    /**
     * The know computers.
     */
    private computers: Collection<Computer>;

    /**
     * This computer.
     */
    private me: Computer;

    /**
     * Class constructor.
     */
    constructor(
        server: Express,
        computers: Collection<Computer>,
        me: Computer,
    ) {
        //
        this.computers = computers;
        this.me = me;

        // Initialise the listener and sender.
        this.initServer(server);
        setInterval(this.doSignal.bind(this), 500);
    }

    /**
     * Initialises the express application which listens for incoming http
     * requests from the other computers in the network.
     */
    private initServer(server: Express): void {
        //
        server.post('/signal', (req, res) => {
            const computers: Computer[] = req.body.computers;

            // Add every computer.
            computers.forEach((computer) => {
                this.computers.add(computer);
            });

            res.sendStatus(200);
        });
    }

    /**
     * Initiate a new gossip sync with another computer in the network at a 
     * constant `interval`.
     */
    private async doSignal(): Promise<void> {
        //
        const computer = this.computers.random();
        if (!computer) return;

        try {
            await axios.post(
                `http://${computer.ip}:${computer.port}/signal`,
                // Send everyone we know and ourselves.
                { computers: [...this.computers.items, this.me] },
            );
        } //
        catch (e) {
            const error: AxiosError = e;

            if (!error.response && error.request) {
                // The computer is unreachable.
                this.computers.remove(computer);
            }
        }
    }
}