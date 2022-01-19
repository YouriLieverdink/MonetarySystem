import {Request, Response} from 'express';
import {Command} from '../controllers';
import {State, Transaction} from "../types";
import {response} from "express/ts4.0";

export class Api {
    /**
     * The instance which should receive all commands.
     */
    private commandController: Command;

    /**
     * Class constructor.
     */
    constructor(
        command: Command,
    ) {
        this.commandController = command;
    }

    /**
     * Handle incoming requests.
     * 
     * @param request The received request.
     * @param response The object used to send a response.
     */
    public async handle(request: Request, response: Response): Promise<void> {
        const splitURL = request.url.trim().split('/');
        const command = splitURL.pop();

        try {
            // Check whether the command exists
            if (Object.keys(this.core).includes(command)) {
                return await this.core[command](request);
            }
            response.status(400);
        }
        catch (e) {
            response.status(400);
        }

    }

    private readonly core = {
        import: async (args: Request): Promise<void> => {
            if (Object.keys(args.body).length !== 0 && args.method === 'POST') {

                let privateKey;

                for (const [key, value] of args.body) {
                    if (key === 'privateKey') {
                        privateKey = value;
                    }
                }

                await this.commandController.addresses.import(privateKey)
                    .then(res => response.send(res))
                    .catch(() => response.send("Something went wrong"));
            }
            response.status(400)
        },
        remove: async (args: Request): Promise<void> => {
            if (Object.keys(args.body).length !== 0 && args.method === 'POST') {
                let publicKey;

                for (const [key, value] of args.body) {
                    if (key === 'publicKey') {
                        publicKey = value;
                    }
                }

                await this.commandController.addresses.remove(publicKey)
                    .then(() => response.status(200))
                    .catch(() => response.status(400));
            }
            response.status(400);
        },
        transactions: async (args: Request): Promise<void> => {

            const method = args.method;

            let publicKeySender: string;
            let publicKeyReceiver: string;
            let amount: number;

            for (const [key, value] of args.body) {
                switch (key) {
                    case 'publicKey':
                        publicKeyReceiver = value;
                        break;
                    case 'publicKeySender':
                        publicKeySender = value;
                        break;
                    case 'amount':
                        amount = value;
                        break;
                    default:
                        console.log("Wrong key");
                }
            }

            if (method === 'GET'){
                (publicKeySender.length !== 0)
                    ? await this.commandController.transactions.get(publicKeySender)
                        .then(transactions => response.send(transactions))
                        .catch(() => response.status(400))
                    : await this.commandController.transactions.getAllImported()
                        .then( transactions => response.send(transactions))
                        .catch( () => response.status(400));
            }
            if (method === 'POST'){
                if (Object.keys(args.body).length === 0){
                    response.status(400);
                }

                const success = await this.commandController.transactions.create(publicKeySender, publicKeyReceiver, amount);

                if (success){
                    response.status(200);
                }
                else response.status(400);
            }
        },
        address: async (args: Request): Promise<void> => {
            if (args.method === 'GET') {
                await this.commandController.addresses.getAll()
                    .then(addresses => response.send(addresses))
                    .catch( () => response.status(400));
            }
            response.status(400);
        },
        generate: async (args: Request): Promise<void> => {
            if(Object.keys(args.body).length !== 0 && args.method === 'POST') {
                await this.commandController.addresses.create()
                    .then(createdAddresses => response.send(createdAddresses))
                    .catch(() => response.status(400));
            }
            response.status(400)
        },
        balance: async (args: Request): Promise<void> => {
            if (args.method === 'GET'){
                let publicKey;
                for (const [key, value] of args.body) {
                    if (key == 'publicKey') {
                        publicKey = value;
                    }
                }

                if(publicKey in args.body) {
                    await this.commandController.states.get(publicKey)
                        .then(result => response.send([result]))
                        .catch(() => response.status(400));
                }else {
                    await this.commandController.states.getAllImported()
                        .then(result => response.send(result))
                        .catch(() => response.status(400));
                }

            }
            response.status(400)
        },
        mirror: async (args: Request): Promise<void> => {
            if (args.method === 'POST' && Object.keys(args.body).length !== 0){

                let mirrorMode: boolean;

                for (const [key, value] of args.body) {
                    if (key == 'enabled') {
                        mirrorMode = value;
                    }
                }
                if(mirrorMode === null){
                    response.status(400)
                }
                await this.commandController.settings.update('mirror', mirrorMode ? 'true' : 'false')
                    .then(mode => response.send(mode))
                    .catch(() => response.status(400));
            }
            response.status(400)
        },
    };
}