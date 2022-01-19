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
                response.send(await this.core[command](request));
            }
            console.log(this.errorText('Unknown request'));
        }
        catch (e) {
            console.log(this.errorText(e.message));
        }

    }

    private readonly core = {
        import: async (args: Request): Promise<void> => {
            if (Object.keys(args.body).length !== 0 && args.method === 'POST') {

                let privateKey;
                let response;

                for (const [key, value] of args.body) {
                    if (key === 'privateKey') {
                        privateKey = value;
                    }
                }

                await this.commandController.addresses.import(privateKey)
                    .then(() => response = true)
                    .catch(() => response = false);

                if (response)
                    this.success(`Successfully imported wallet ${privateKey}`);
            }
            this.badRequest();
        },
        remove: async (args: Request): Promise<void> => {
            if (Object.keys(args.body).length !== 0 && args.method === 'POST') {
                let publicKey;

                for (const [key, value] of args.body) {
                    if (key === 'publicKey') {
                        publicKey = value;
                    }
                }

                let response;

                await this.commandController.addresses.remove(publicKey)
                    .then(() => response = true)
                    .catch(() => response = false);

                if (response)
                    this.success(`Succesfully removed keys from device`);
            }
            this.badRequest();
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
                        this.errorText("No valid key found");
                }
            }

            if (method === 'GET'){
                const transactions: Transaction[] = (publicKeySender.length !== 0)
                    ? await this.commandController.transactions.get(publicKeySender)
                    : await this.commandController.transactions.getAllImported();

                if (transactions.length > 0){
                    this.success(`Found ${transactions.length} `);
                }
                else this.errorText("couldn't find transactions");
            }
            if (method === 'POST'){
                if (Object.keys(args.body).length === 0){
                    this.badRequest();
                }
                this.commandController.transactions.create(publicKeySender, publicKeyReceiver, amount);
                this.success('Successfully created transaction');
            }
        },
        address: async (args: Request): Promise<void> => {
            if (args.method === 'GET') {
                const table = (await this.commandController.addresses.getAll())
                    .map((address, index) => `  ${index + 1}. Public key: ${address.publicKey}${`		Private key: ${address.privateKey}`}\n`);

                if (table.length > 0)
                    this.success('Your key(s):\n' + table);

                console.log(this.errorText('Please import your keys first, or generate a pair'));
            }
            this.badRequest();
        },
        generate: async (args: Request): Promise<void> => {
            if(Object.keys(args.body).length !== 0 && args.method === 'POST') {
                const keyPair = await this.commandController.addresses.create();
                this.success(`Generated new key pair! \n  Important Note: Don't lose the private key!\n\n  
								Private key: 	${keyPair.privateKey}\n  Public key: ${keyPair.publicKey}`);
            }
            this.badRequest();
        },
        balance: async (args: Request): Promise<void> => {
            if (args.method === 'GET'){
                let publicKey;
                for (const [key, value] of args.body) {
                    if (key == 'publicKey') {
                        publicKey = value;
                    }
                }
                const balances: State[] = (args.body === 1)
                    ? [await this.commandController.states.get(publicKey)]
                    : await this.commandController.states.getAllImported();

                this.success(`  Total balance: ${balances.reduce((sum, state) => sum + state.balance, 0)} `);
            }
        },
        mirror: async (args: Request): Promise<void> => {
            if (args.method === 'POST' && Object.keys(args.body).length !== 0){

                let mirrorMode: boolean;

                for (const [key, value] of args.body) {
                    if (key == 'enabled') {
                        mirrorMode = value;
                    }
                }
                await this.commandController.settings.update('mirror', mirrorMode ? 'true' : 'false');
            }
        },
    };

    private errorText = (msg) => `  \x1b[31m${msg}\x1b[0m`;

    private badRequest = (): void => {
        console.log(`Bad request`)
    };

    private success = (msg): void => {
        console.log(`  ${msg}`);
    };
}