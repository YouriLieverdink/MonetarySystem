import { Request, Response } from 'express';
import { Command } from '../controllers/_';
import { Address } from '../types/address';
import { State, Transaction } from "../types/_";

/**
 * Responsible for parsing incoming Http requests and directing them to the
 * correct method in the Command controller.
 */
export class Api {

    /**
     * Class constructor.
     *
     * @param commandController The controller which handles the user input.
     */
    constructor(
        private commandController: Command,
    ) { }

    /**
     * Handle incoming requests.
     *
     * @param request The received request.
     * @param response The object used to send a response.
     */
    public async handle(request: Request, response: Response) {
        let splittedURL;
        let command;
        if (request.url.includes('?')) {
            splittedURL = request.url.trim().split('?');
            splittedURL = splittedURL[0].trim().split('/');
            command = splittedURL.pop();
        } else {
            splittedURL = request.url.trim().split('/');
            command = splittedURL.pop();
        }

        try {
            if (Object.keys(this.core).includes(command)) {
                const res = await this.core[command](request);
                response.send(JSON.stringify(res));
            } //
            else {
                response.sendStatus(400);
            }
        }
        catch (e) {
            response.status(400).send(e.message);
        }
    }

    private readonly core = {
        ping: async (args: Request): Promise<string> => {
            return 'pong';
        },
        import: async (args: Request): Promise<Address> => {
            if (args.method === 'POST') {
                const value = Object.values(args.body).toString();

                return this.commandController.addresses.import(value);
            }
            throw Error("ERROR import");
        },
        remove: async (args: Request): Promise<void> => {
            if (args.method === 'POST') {
                if (args.body.constructor === Object && Object.keys(args.body).length === 0) {

                    throw Error("Empty body");
                }
                let publicKey: string;
                const info = args.body;
                for (let i in info) {
                    if (i === 'publicKey') {
                        publicKey = info[i];
                    } else {
                        throw Error("wrong key")
                    }
                }
                if (typeof publicKey !== "string") {
                    throw Error("wrong value");
                }

                return this.commandController.addresses.remove(publicKey);
            }
            throw Error("ERROR addresses");
        },
        transactions: async (args: Request): Promise<Transaction | Transaction[] | Error> => {
            if (!args.query.publicKey) {
                throw Error("no correct params");
            }

            const method = args.method;
            const address = `${args.query.publicKey}`;

            if (method === 'GET') {
                //
                const limit = +`${args.query.limit}` || undefined;
                const offset = +`${args.query.offset}` || undefined;

                return this.commandController.transactions.getAll(address, limit, offset);
            }
            if (method === 'POST') {
                let keys = Object.keys(args.body);
                if (keys.length === null || keys.length === 0) {
                    throw Error("no body");
                }
                let receiver: string;
                let amount: number;

                const info = args.body;
                for (let i in info) {
                    switch (i) {
                        case 'amount':
                            amount = info[i];
                            break;
                        case 'receiver':
                            receiver = info[i];
                            break;
                        default:
                            break;
                    }
                }
                if (receiver === undefined || amount === undefined) {
                    throw Error("key undefined");
                }
                if (typeof amount !== 'number' || typeof receiver !== 'string') {
                    throw Error("wrong types");
                }
                if (address === 'api') {
                    throw Error("wrong endpoint used");
                }
                return await this.commandController.transactions.create(address, receiver, amount);
            }
            throw Error();
        },
        address: async (args: Request): Promise<Address[]> => {
            if (args.method === 'GET') {
                return await this.commandController.addresses.getAll();
            }
            throw Error("ERROR addresses");
        },
        generate: async (args: Request): Promise<Address | string> => {
            if (args.method === 'POST') {
                return await this.commandController.addresses.create()
                    .then(createdAddresses => createdAddresses)
                    .catch(() => "could not create address");
            }
            throw Error("Wrong method")
        },
        balance: async (args: Request): Promise<number> => {
            if (args.method === 'GET') {
                const publicKey = `${args.query.publicKey}`;

                return this.commandController.balance.get(publicKey);
            }
            throw Error("wrong method");
        },
        mirror: async (args: Request): Promise<void> => {
            if (args.method === 'POST') {
                let keys = Object.keys(args.body);
                if (keys.length === null || keys.length === 0) {
                    throw Error("no body");
                }
                let mirrormode: boolean;

                const info = args.body;
                for (let i in info) {
                    if (i === 'enabled') {
                        mirrormode = info[i];
                    } else {
                        throw Error("wrong key")
                    }
                }
                if (typeof mirrormode !== "boolean") {
                    throw Error("wrong value");
                }
                return this.commandController.settings.update('mirror', mirrormode ? 'true' : 'false');
            }
            throw Error("wrong method")
        },
        default: async (args: Request): Promise<void> => {
            switch (args.method) {
                case 'POST':
                    //
                    const publicKey = args.body.publicKey;
                    if (!publicKey) throw Error('No public key provided');

                    // Verify whether it actually exists.
                    const addresses = await this.commandController.addresses.getAll();
                    if (!addresses.find((address) => address.publicKey === publicKey)) {
                        throw Error('Public key does not exist');
                    }

                    this.commandController.settings.update('default', publicKey);
                    break;

                default:
                    throw Error('Method not supported');
            }
        },
    };
}