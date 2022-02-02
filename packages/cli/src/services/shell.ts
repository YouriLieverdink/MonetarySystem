import axios, { AxiosError, AxiosInstance } from 'axios';
import { performance } from 'perf_hooks';
import readline from 'readline';
import { Address, State, Transaction } from '../types/_';

/**
 * Responsible for providing an interactive shell for the user to interact
 * with the node that they have running.
 */
export class Shell {
    /**
     * The instance for making http requests.
     */
    private http: AxiosInstance;

    /**
     * Creates an instance of the
     * 
     * @param port The port on which the node is.
     */
    public static async instance(port: number): Promise<Shell> {
        try {
            const http = axios.create({
                baseURL: `http://0.0.0.0:${port}/api`,
            });

            // Ping the node to see if it is available.
            await http.get('/ping');

            return new Shell(http);
        } //
        catch (e) {
            //
            const error: AxiosError = e;

            if (error.response) {
                // The node returned an error.
                Shell.response.error(error.message);
            }
            else if (error.request) {
                // The node could not be reached.
                Shell.response.error('Connection refused.');
                process.exit(1);
            }
        }
    }

    /**
     * Class constructor.
     * 
     * @param port The port on which the node is located.
     */
    constructor(
        http: AxiosInstance,
    ) {
        //
        this.http = http;

        Shell.response.clear();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const ask = () => rl.question(
            '\n\x1b[0mtritium> ',
            async (request) => {
                await this.handle(request);
                ask();
            },
        );

        ask();
    }

    /**
     * Handle all incoming shell commands.
     * 
     * @param request The incoming line.
     */
    public async handle(request: string): Promise<void> {
        const args = request.trim().split(' ');
        const command = args.shift();

        try {
            // Attempt to call the provided command.
            await (this.commands[command](args));
        }
        catch (e) {
            //
            console.log(e);
            if (e.name === 'TypeError') {
                // The command was not found.
                Shell.response.error('Invalid command');
                Shell.response.log('Enter \'help\' to display command line options.');
            } //

            const error: AxiosError = e;

            if (error.response) {
                // The node returned an error.
                Shell.response.error(error.response.data);
            } //
            else if (error.request) {
                // The node could not be reached.
                Shell.response.error('Connection refused.');
                process.exit(1);
            }
        }
    };

    /**
     * Default responses.
     */
    private static readonly response = {
        /**
         * Logs a message.
         * 
         * @param message The message to display.
         */
        log: (message: string): void => {
            console.log(`  ${message}`);
        },
        /**
         * Displays a "bad syntax" message.
         */
        bad: (): void => {
            Shell.response.error('Wrong syntax');
            Shell.response.log('Enter \'help\' to display command line options.');
        },
        /**
         * Displays an indented message in red.
         * 
         * @param message The message to display.
         */
        error: (message: string): void => {
            Shell.response.log(`\x1b[31m${message}\x1b[0m`);
        },
        /**
         * Clear the screen and display the logo.
         */
        clear: (): void => {
            console.clear();
            Shell.response.log('\n' +
                '████████╗ ██████╗  ██╗ ████████╗ ██╗ ██╗   ██╗ ███╗   ███╗\n' +
                '╚══██╔══╝ ██╔══██╗ ██║ ╚══██╔══╝ ██║ ██║   ██║ ████╗ ████║\n' +
                '   ██║    ██████╔╝ ██║    ██║    ██║ ██║   ██║ ██╔████╔██║\n' +
                '   ██║    ██╔══██╗ ██║    ██║    ██║ ██║   ██║ ██║╚██╔╝██║\n' +
                '   ██║    ██║  ██║ ██║    ██║    ██║ ╚██████╔╝ ██║ ╚═╝ ██║\n' +
                '   ╚═╝    ╚═╝  ╚═╝ ╚═╝    ╚═╝    ╚═╝  ╚═════╝  ╚═╝     ╚═╝\n' +
                '\n Enter \'help\' to display command line options.'
            );
        }
    };

    /**
     * The available commands.
     */
    private readonly commands = {
        balance: async (args: string[]): Promise<void> => {
            if (args.length !== 1) {
                return Shell.response.bad();
            }

            const publicKey = args[0];
            const params = { publicKey };

            const response = await this.http.get('/balance', { params });
            const balances: number[] = [response.data];

            balances.forEach((balance, index) => {
                const i = '00000'.substring(0, 5 - `${index + 1}`.length) + `${index + 1}`;

                Shell.response.log(`${i}. ⓣ ${balance} on address: ${publicKey}`);
            });

            // We caculate the sum so we can show a total line at the bottom.
            const sum = balances.reduce((prev, curr) => prev + curr, 0);

            Shell.response.log(`\n  Total: ⓣ ${sum}`);
        },
        clear: async (): Promise<void> => {
            Shell.response.clear();
        },
        default: async (args: string[]): Promise<void> => {
            if (args.length === 0 || args.length > 1) {
                return Shell.response.bad();
            }

            const publicKey = args[0];

            await this.http.post('default', { publicKey });

            Shell.response.log('Default successfully updated');
        },
        exit: async (): Promise<void> => {
            process.exit(0);
        },
        help: async (args: string[]): Promise<void> => {
            Shell.response.log(
                'Setup:' +
                '\n    generate                   Generate a new address.' +
                '\n    import <a>                 Import an existing address with private key <a>.' +
                '\n    remove <b>                 Remove an address with public key <a>.' +
                '\n' +
                '\n  Operations:' +
                '\n    list                       Lists all stored addresses.' +
                '\n    balance                    Shows cumulative balance of your addresses.' +
                '\n    balance <a>                Shows balance of the address with public key <a>.' +
                '\n    transactions               Lists all transactions which you were involed in.' +
                '\n    transactions <a>           Lists all transactions of the address with public key <a>.' +
                '\n    transfer <a> <b> <amount>  Transfers the amount from public key \'a\' to \'b\'.' +
                '\n' +
                '\n  Configuration:' +
                '\n    mirror on|off              Enables or disables mirroring of transactions.' +
                '\n    default <a>                Updates the default address with public key <a>' +
                '\n' +
                '\n  System:' +
                '\n    help                       Displays this help.' +
                '\n    exit                       Close the shell.',
            )
        },
        import: async (args: string[]): Promise<void> => {
            if (args.length !== 1) {
                return Shell.response.bad();
            }

            const privateKey = args[0];
            await this.http.post('address/import', { privateKey });

            Shell.response.log('Address imported successfully.');
        },
        list: async (args: string[]): Promise<void> => {
            const showPrivate = args.includes('--private');

            if (args.length === 1 && !showPrivate) {
                return Shell.response.bad();
            }

            const response = await this.http.get('address');
            const addresses: Address[] = response.data;

            if (addresses.length === 0) {
                return Shell.response.error('No addresses found.');
            }

            addresses.forEach((address, index) => {
                const i = '00000'.substring(0, 5 - `${index + 1}`.length) + `${index + 1}`;

                Shell.response.log(`${i}. Public key:  ${address.publicKey}${showPrivate ? '\n         Private key: ' + address.privateKey : ''}`);
            });
        },
        mirror: async (args: string[]): Promise<void> => {
            if (args.length !== 1 || !['on', 'off'].includes(args[0])) {
                return Shell.response.bad();
            }

            const enabled = args[0] === 'on';

            await this.http.post('mirror', { enabled });

            Shell.response.log(`Mirror updated successfully.`);
        },
        remove: async (args: string[]): Promise<void> => {
            if (args.length !== 1) {
                return Shell.response.bad();
            }

            const publicKey = args[0];
            await this.http.post('address/remove', { publicKey });

            Shell.response.log('Address removed successfully.');
        },
        generate: async (args: string[]): Promise<void> => {
            if (args.length > 0) {
                return Shell.response.bad();
            }

            const response = await this.http.post('generate');
            const address: Address = response.data;

            Shell.response.log(`Generated a new address!\n    Public key:  ${address.publicKey}\n    Private key: ${address.privateKey}\n\n  Imporant note: Don't lose the private key. No keys no cheese!`);
        },
        ping: async (args: string[]): Promise<void> => {
            if (args.length > 0) {
                return Shell.response.bad();
            }

            const t1 = performance.now();
            await this.http.get('ping');
            const t2 = performance.now();

            Shell.response.log(`Pong (${Math.round(t2 - t1)}ms)`);
        },
        transactions: async (args: string[]): Promise<void> => {
            if (args.length > 3) {
                return Shell.response.bad();
            }

            const [publicKey, limit, offset] = args;
            const params = { publicKey, limit, offset };

            const response = await this.http.get('/transactions', { params });
            const transactions: Transaction[] = response.data;

            if (transactions.length === 0) {
                return Shell.response.error('No transactions found.');
            }

            transactions.forEach((transaction, index) => {
                const i = '00000'.substring(0, 5 - `${index + 1}`.length) + `${index + 1}`;

                Shell.response.log(`${i}. Amount: ${transaction.amount}, From: ${transaction.from}, To: ${transaction.to}`);
            });
        },
        transfer: async (args: string[]): Promise<void> => {
            if (args.length !== 3 || isNaN(Number(args[2])) || Number(args[2]) <= 0) {
                return Shell.response.bad();
            }

            await this.http.post('transactions',
                { to: args[1], amount: parseFloat(args[2]) },
                { params: { address: args[0] } },
            );

            Shell.response.log('Transaction created successfully.');
        },
    };
}