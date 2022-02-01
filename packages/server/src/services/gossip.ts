import axios, { AxiosError } from 'axios';
import { Express } from 'express';
import _ from 'lodash';
import { Computer } from '../types/_';
import { Collection } from './_';

export abstract class Gossip<T> {
    /**
     * The items to distribute whilst gossiping.
     */
    protected items: Collection<T>;

    /**
     * The last item this computer has created.
     */
    protected last: T;

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
        private endpoint: string,
        interval: number,
        protected me: Computer,
        server: Express,
    ) {
        //
        this.items = new Collection();

        // Initiate the listener.
        server.post(`/${this.endpoint}`, async (req, res) => {
            //
            const items: T[] = req.body.items;
            const last: T = req.body.last;

            await this.handleHandshake(items, last);

            res.sendStatus(200);
        });

        // Initiate the sender.
        setInterval(this.doHandshake.bind(this), interval);
    }

    /**
     * Initiates a new handshake with a randomly selected computer from the list
     * of known computers in the network.
     */
    private async doHandshake(): Promise<void> {
        //
        this.onTick();

        const computer = this.computers.random(this.me);
        if (!computer) return;

        try {
            await axios.post(
                `http://${computer.ip}:${computer.port}/${this.endpoint}`,
                { items: this.items.all(), last: this.last },
            );
        } //
        catch (e) {
            const error: AxiosError = e;

            if (error.response) {
                // The other computer returned a response outside 2xx.
                this.onError('error-response', computer, e);
            } //
            else if (error.request) {
                // The other computer did not respond.
                this.onError('error-request', computer, e);
            } //
            else {
                // An unknown error has occured.
                this.onError('error-unknown', computer, e);
            }
        }
    }

    /**
     * The receiving end of the `doHandshake` method. Stores the items that
     * `this` is missing.
     * 
     * @param items The received items from the network.
     * @param last The last item the other computer has created.
    */
    private async handleHandshake(items: T[], last: T): Promise<void> {
        // We remove the keys from `this.except` so we don't use them for comparisons.
        items = items.map((item) => _.omit(item as Object, this.except())) as T[];

        // We only care about the new items.
        items = _.differenceWith(items, this.items.all(), _.isEqual);
        if (items.length === 0) return;

        this.onItems(items, last);
    }

    /**
     * This array contains all the keys the class does not wish to be send over
     * the network or to be used in equality comparisons.
     */
    public abstract except(): string[];

    /**
     * This method is called everytime the gossip service initiates a new
     * handshake with a randomly selected computer.
     */
    public abstract onTick(): void;

    /**
     * This method is called whenever the gossip service has received items that
     * it did not already know.
     * 
     * @param items The newly received items.
     * @param last The last item the other computer has created.
     */
    public abstract onItems(items: T[], last: T): void;

    /**
     * This method is called whenever the axios post request to another computer
     * throws an error.
     * 
     * @param kind The kind of error that was thrown.
     * @param computer The computer to which the gossip service was communicating.
     * @param error The actual error object.
     */
    public abstract onError(kind: string, computer: Computer, error?: Error): void;
}