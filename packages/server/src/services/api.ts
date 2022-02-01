import { Request, Response } from 'express';
import { Command } from '../controllers/_';
import { Address, Transaction, State } from '../types/_';

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
        import: async (args: Request): Promise<string> => {
            if (args.method === 'POST') {
                if (args.query) {
                    throw Error("Can't use params");
                }
                const value = Object.values(args.body).toString();

                return await this.commandController.addresses.import(value);
            }
            throw Error("ERROR import");
        },
        remove: async (args: Request): Promise<string> => {
            if (args.method === 'POST') {

                if (args.body.constructor === Object && Object.keys(args.body).length === 0) {
                    throw Error("Empty body");
                }
                const value = Object.values(args.body).toString();

                const success = await this.commandController.addresses.remove(value);

                if (success) {
                    return "success";
                }
                throw Error("Couldnt remove key")
            }
            throw Error("ERROR addresses");
        },
        transactions: async (args: Request): Promise<Transaction | Transaction[] | Error> => {
            const method = args.method;
            const address = args.query.address;
            const sender = address.toString();

            if (method === 'GET') {
                return (address.length !== 0)
                    ? await this.commandController.transactions.get(sender)
                    : await this.commandController.transactions.getAllImported();
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
                return await this.commandController.transactions.create(sender, receiver, amount);
            }
            throw Error();
        },
        address: async (args: Request): Promise<Address[]> => {
            if (args.method === 'GET') {
                if (args.query) {
                    throw Error("Can't use params");
                }
                return await this.commandController.addresses.getAll();
            }
            throw Error("ERROR addresses");
        },
        generate: async (args: Request): Promise<Address | string> => {
            if (args.method === 'POST') {
                if (args.query) {
                    throw Error("Can't use params");
                }
                return await this.commandController.addresses.create()
                    .then(createdAddresses => createdAddresses)
                    .catch(() => "could not create address");
            }
            throw Error("Wrong method")
        },
        balance: async (args: Request): Promise<State[]> => {
            if (args.method === 'GET') {
                if (!args.query.address) {
                    throw Error("no params");
                }

                const address = args.query.address;
                const sender = address.toString();

                return (sender !== 'api' || sender.length !== 0)
                    ? await this.commandController.states.get(sender)
                    : await this.commandController.states.getAllImported();
            }
            throw Error("wrong method");
        },
        mirror: async (args: Request): Promise<boolean> => {
            if (args.method === 'POST') {
                if (args.query) {
                    throw Error("Can't use params");
                }
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
                return await this.commandController.settings.update('mirror', mirrormode ? 'true' : 'false');
            }
            throw Error("wrong method")
        },
    };
}