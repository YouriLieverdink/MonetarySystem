import {Storage} from "./storage";
import {Transaction} from "../types/transaction";
import axios, {AxiosError} from "axios";
import {Collection} from "./collection";
import {Computer} from "../types/computer";
import {Express} from 'express';
import { createHash } from 'crypto';

export type startData = {
    sender: Computer;
    lastID?: string;
    firstID?: string;
    transactions?: Transaction[]
}

export class Startup {

    private readonly endpoint: String;

    private hashes: string[]

    private lastID: string

    private firstID: string

    /**
     * Class constructor.
     *
     * @param storage the interface for storage
     * @param computers
     * @param me
     * @param server
     */
    constructor(
        private storage: Storage,
        protected computers: Collection<Computer>,
        protected me: Computer,
        server: Express,
    ) {
        //
        this.endpoint = 'startup';
        this.hashes = [];

        // Initiate the listener.
        server.post(`/${this.endpoint}`, async (req, res) => {
            //
            const items: startData = req.body.items;

            await this.handleData(items);

            res.sendStatus(200);
        });
    }

    /**
     * Executes all necessary actions when the node starts
     *
     * @param transaction The first consensus transaction after starting node
     */
    public async start(transaction: Transaction): Promise<void> {
        const lastTransaction  = await this.storage.transactions.index(undefined, 1);

        if (lastTransaction === undefined) return;

        this.lastID = lastTransaction[0].id;
        this.firstID = transaction.id;

        await this.request({lastID: this.lastID, firstID: this.firstID, sender: this.me});
    }

    /**
     * Initiates a new handshake with a randomly selected computer from the list
     * of known computers in the network.
     */
    private async request(startData: startData, computer?: Computer): Promise<void> {
        //
        if (!computer) {
            computer = this.computers.random(this.me);
        }
        if (!computer) return;

        try {
            await axios.post(
                `http://${computer.ip}:${computer.port}/${this.endpoint}`,
                {items: startData},
            );
        } //
        catch (e) {
            const error: AxiosError = e;
            console.log(error)
        }
    }

    /**
     * The receiving end of the `doHandshake` method.
     *
     * @param items The received items from the network.
     */
    private async handleData(items: startData): Promise<void> {
        if (items.lastID && items.firstID) {
            await this.sendTransactions(items)
        }

        if (items.transactions) {
            await this.handleTransactions(items)
        }
    }

    private async sendTransactions(items: startData): Promise<void> {
        const lastTransaction = await this.storage.transactions.read(items.lastID)
        const firstTransaction = await this.storage.transactions.read(items.firstID)
        const result = await this.storage.transactions.betweenIndexes(lastTransaction.index, firstTransaction.index)

        await this.request({sender: this.me, transactions: result}, items.sender)
    }

    private async handleTransactions(items: startData): Promise<void> {
        const hashable = JSON.stringify(items.transactions);
        const hash = createHash('sha256').update(hashable).digest('hex');
        this.hashes.push(hash)

        if (this.hashes.length >= 2) {
            if (this.hashes[0] === this.hashes[1]) {
                for (let i = 0; i < items.transactions.length; i++) {
                    await this.storage.transactions.create(items.transactions[i])
                }
                return
            } else {
                this.hashes = []
            }
        }
        await this.request({lastID: this.lastID, firstID: this.firstID, sender: this.me});
    }
}