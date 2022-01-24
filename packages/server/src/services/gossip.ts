import axios, { AxiosError } from 'axios';
import { Express } from 'express';
import _ from 'lodash';
import { SignalDispatcher, SimpleEventDispatcher } from 'strongly-typed-events';
import { Collection } from './_';
import { Computer } from '../types/_';

export class Gossip<T> {
    /**
     * The items to distribute using gossip.
     */
    private _items: T[];

    /**
     * The last item this computer created.
     */
    private _lastItem: T;

    /**
     * The event for dispatching a tick.
     */
    private _onTick: SignalDispatcher;

    /**
     * The event for dispatching new items.
     */
    private _onItems: SimpleEventDispatcher<{ items: T[], lastItem: T }>;

    /**
     * The event for dispatching errors.
     */
    private _onError: SimpleEventDispatcher<{ kind: string, computer: Computer }>;

    /**
     * Class constructor.
     * 
     * @param server The active express server.
     * @param endpoint The endpoint this class should use.
     * @param interval The interval at which this gossip should operate.
     * @param computers The known computers in the network.
     */
    constructor(
        private server: Express,
        private endpoint: string,
        private interval: number,
        private computers: Collection<Computer>,
    ) {
        this._items = [];

        // Initialise the events.
        this._onTick = new SignalDispatcher();
        this._onItems = new SimpleEventDispatcher();
        this._onError = new SimpleEventDispatcher();

        this.initListener();
        this.initSender();
    }

    /**
     * Gets the onTick event.
     */
    public get onTick() {
        return this._onTick.asEvent();
    }

    /**
     * Gets the onItems event.
     */
    public get onItems() {
        return this._onItems.asEvent();
    }

    /**
     * Gets the onError event.
     */
    public get onError() {
        return this._onError.asEvent();
    }

    /**
     * Public methods for manipulating the items.
     */
    public readonly items = {
        getItems: (): T[] => {
            return [...this._items];
        },
        getLastItem: (): T => {
            return { ...this._lastItem };
        },
        add: (...items: T[]): void => {
            this._items.push(...items);
        },
        addLast: (item: T): void => {
            this._lastItem = item;
        },
        remove: (...items: T[]): void => {
            items.forEach((item) => {
                _.remove(this._items, (i) => _.isEqual(item, i));
            });
        },
    };

    /**
     * Initialises the express application which listens for incoming http
     * requests from the other computers in the network.
     */
    private initListener(): void {
        //
        this.server.post(`/${this.endpoint}`, async (req, res) => {
            //
            const items: T[] = req.body.items;
            const lastItem: T = req.body.lastItem;

            await this.handleHandshake(items, lastItem);

            res.sendStatus(200);
        });
    }

    /**
     * Starts the gossip service to be run every `interval`.
     */
    private initSender(): void {
        //
        setInterval(this.tick.bind(this), this.interval);
    }

    /**
    * Initiate a new handshake with another computer in the network at a 
    * constant `interval`.
    */
    private async tick(): Promise<void> {
        //
        this._onTick.dispatch();

        const computer = this.computers.random();
        if (!computer) return;

        this.doHandshake(computer);
    }

    /**
     * Performs a handshake with the provided computer. This computer will
     * tell the randomly selected everything it knows.
     * 
     * @param computer The computer to perform the handshake with.
     */
    private async doHandshake(computer: Computer): Promise<void> {
        //
        try {
            await axios.post(
                `http://${computer.ip}:${computer.port}/${this.endpoint}`,
                { items: this._items, lastItem: this._lastItem },
            );
        } //
        catch (e) {
            const error: AxiosError = e;

            if (error.response) {
                // The other computer returned a response outside 2xx.
                this._onError.dispatch({
                    kind: 'error-response',
                    computer: computer,
                });
            } //
            else if (error.request) {
                // The other computer did not respond.
                this._onError.dispatch({
                    kind: 'error-request',
                    computer: computer,
                });
            }
        }
    }

    /**
     * The receiving end of the `doHandshake` method. Stores the items that
     * `this` is missing.
     * 
     * @param items The received items from the network.
     * @param lastItem The last item the other computer has created.
     */
    private async handleHandshake(items: T[], lastItem: T): Promise<void> {
        //
        const newItems: T[] = _.differenceWith(items, this._items, _.isEqual);
        if (newItems.length === 0) return;

        this._onItems.dispatch({ items: newItems, lastItem });
    }
}
