import { Request, Response, response } from 'express';
import { Command } from '../controllers/_';

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
    ) {}

    /**
     * Handle incoming requests.
     *
     * @param request The received request.
     * @param response The object used to send a response.
     */
    public async handle(request: Request, response: Response){
        const splitURL = request.url.trim().split('/');
        const command = splitURL.pop();

        try {
            const jo = await this.core.generate(request);
            response.send(JSON.stringify(jo));
        }
        catch (e) {
            response.status(400).send(e.message);
        }
    }

    private readonly core = {
        import: async (args: Request): Promise<Response> => {
            if (Object.keys(args.body).length !== 0 && args.method === 'POST') {

                let privateKey;

                for (const [key, value] of args.body) {
                    if (key === 'privateKey') {
                        privateKey = value;
                    }
                }

                return await this.commandController.addresses.import(privateKey)
                    .then(res => response.send(res))
                    .catch(() => response.send("Something went wrong"));
            }
            return response.status(400)
        },
        remove: async (args: Request): Promise<Response> => {
            if (Object.keys(args.body).length !== 0 && args.method === 'POST') {
                let publicKey;

                for (const [key, value] of args.body) {
                    if (key === 'publicKey') {
                        publicKey = value;
                    }
                }

                return await this.commandController.addresses.remove(publicKey)
                    .then(() => response.status(200))
                    .catch(() => response.status(400));
            }
            return response.status(400);
        },
        transactions: async (args: Request): Promise<Response> => {

            const method = args.method;

            let publicKeySender: string;
            let publicKeyReceiver: string;
            let amount: number;



            if (method === 'GET'){


                return (publicKeySender.length !== 0)
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

                this.commandController.transactions.create(publicKeySender, publicKeyReceiver, amount);

                return response.status(200).send();
            }
        },
        address: async (args: Request): Promise<Response> => {
                if (args.method === 'GET') {
                    return await this.commandController.addresses.getAll()
                        .then(addresses => response.send(addresses))
                        .catch( () => response.status(400));
                }
                return response.status(400);
        },
        generate: async (args: Request): Promise<Response> => {
            if(args.method === 'POST') {
                return await this.commandController.addresses.create()
                    .then(createdAddresses => response.send(createdAddresses))
                    .catch(() => response.status(400).send('ho'));
            }
            return response.status(400)
        },
        balance: async (args: Request): Promise<Response> => {
            if (args.method === 'GET'){
                let publicKey;
                for (const [key, value] of args.body) {
                    if (key == 'publicKey') {
                        publicKey = value;
                    }
                }

                if(publicKey in args.body) {
                    return await this.commandController.states.get(publicKey)
                        .then(result => response.send([result]))
                        .catch(() => response.status(400));
                }else {
                    return await this.commandController.states.getAllImported()
                        .then(result => response.send(result))
                        .catch(() => response.status(400));
                }

            }
            return response.status(400)
        },
        mirror: async (args: Request): Promise<Response> => {
            if (args.method === 'POST' && Object.keys(args.body).length !== 0){

                let mirrorMode: boolean;

                for (const [key, value] of args.body) {
                    if (key == 'enabled') {
                        mirrorMode = value;
                    }
                }
                if(mirrorMode === null){
                    return response.status(400)
                }
                return await this.commandController.settings.update('mirror', mirrorMode ? 'true' : 'false')
                    .then(mode => response.send(mode))
                    .catch(() => response.status(400));
            }
            return response.status(400)
        },
    };
}