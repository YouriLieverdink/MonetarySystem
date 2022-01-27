import axios, { AxiosError, AxiosInstance } from 'axios';
import readline from 'readline';
import { Address } from '../types/_';

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
    public static async instance(port: number): Promise<void> {
        try {
            const http = axios.create({
                baseURL: `http://0.0.0.0:${port}/api`,
            });

            // Ping the node to see if it is available.
            await http.get('/ping');

            new Shell(http);
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
    private async handle(request: string): Promise<void> {
        const args = request.trim().split(' ');
        const command = args.shift();

        try {
            // Attempt to call the provided command.
            await (this.commands[command](args));
        }
        catch (e) {
            //
            if (e.name === 'TypeError') {

                console.log(e);
                // The command was not found.
                Shell.response.error('Invalid command');
                Shell.response.log('Enter \'help\' to display command line options.');
            } //
            else if (e.name === 'AxiosError') {
                const error: AxiosError = e;

                if (error.response) {
                    // The node returned an error.
                    Shell.response.error(error.message);
                } //
                else if (error.request) {
                    // The node could not be reached.
                    Shell.response.error('Connection refused.');
                    process.exit(1);
                }
            } //
            else {
                // An unknown error occured.
                Shell.response.error(e.message);
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
        clear: async (): Promise<void> => {
            Shell.response.clear();
        },
        exit: async (): Promise<void> => {
            process.exit(0);
        },
        import: async (args: string[]): Promise<void> => {
            if (args.length !== 1) {
                return Shell.response.bad();
            }

            const privateKey = args[0];
            await this.http.post('address/import', { privateKey });

            Shell.response.log('Address imported successfully.');
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
        list: async (args: string[]): Promise<void> => {
            const showPrivate = args.includes('--private');

            if (args.length === 1 && !showPrivate) {
                return Shell.response.bad();
            }

            const response = await this.http.get('address');
            const addresses: Address[] = response.data;

            if (addresses.length === 0) {
                return Shell.response.error('Please import your addresses, or generate one with \'generate\'.');
            }

            addresses.forEach((address, index) => {
                const i = (index + 1) < 10 ? ` ${index + 1}` : `${index + 1}`;

                Shell.response.log(`  ${i}. Public key:  ${address.publicKey}${showPrivate ? '\n        Private key: ' + address.privateKey : ''}`);
            });
        },
    };
}