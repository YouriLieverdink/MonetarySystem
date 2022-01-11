import { Command } from '../controllers';
import { State, Transaction } from '../types';

export class Cli {
    /**
     * The command controller.
     */
    private command: Command;

    /**
     * The object used to send responses.
     */
    private response: Console;

    /**
     * Class constructor.
     * 
     * @param command The command controller.
     * @param resposne The object used to send responses.
     */
    constructor(
        command: Command,
        response: Console
    ) {
        //
        this.command = command;
        this.response = response;

        this.response.clear();
        this.responses.welcome();
    }

    /**
     * Handle incoming cli commands.
     * 
     * @param request The received cli command.
     */
    public async handle(request: string): Promise<void> {
        //
        const args = request.trim().split(' ');
        const command = args.shift();

        try {
            // Attempt to call the provided command.
            return await this.commands[command](args);
        }
        catch (e) {
            const error: Error = e;

            if (error.name === 'TypeError') {
                // The provided command was not found in `this.commands`.
                this.responses.error('Not implemented');
                return;
            }

            this.responses.error(error.message);
        }
    }

    /**
     * Default responses.
     */
    private readonly responses = {
        /**
         * Displays a "bad syntax" message.
         */
        bad: (): void => {
            //
            this.responses.error('Wrong syntax');
            this.response.log(
                '  Enter \'help\' to display command line options.\n'
            );
        },
        /**
         * Displays an indented message in red.
         * 
         * @param message The message to display.
         */
        error: (message: string): void => {
            //
            this.response.log(`  \x1b[31m${message}\x1b[0m\n`);
        },
        /**
         * Displays an indented message.
         * 
         * @param message The message to display.
         */
        success: (message: string): void => {
            //
            this.response.log(`  ${message}\n`);
        },
        /**
         * Displays the welcome message.
         */
        welcome: (): void => {
            //
            this.response.log('\n' +
                '████████╗ ██████╗  ██╗ ████████╗ ██╗ ██╗   ██╗ ███╗   ███╗\n' +
                '╚══██╔══╝ ██╔══██╗ ██║ ╚══██╔══╝ ██║ ██║   ██║ ████╗ ████║\n' +
                '   ██║    ██████╔╝ ██║    ██║    ██║ ██║   ██║ ██╔████╔██║\n' +
                '   ██║    ██╔══██╗ ██║    ██║    ██║ ██║   ██║ ██║╚██╔╝██║\n' +
                '   ██║    ██║  ██║ ██║    ██║    ██║ ╚██████╔╝ ██║ ╚═╝ ██║\n' +
                '   ╚═╝    ╚═╝  ╚═╝ ╚═╝    ╚═╝    ╚═╝  ╚═════╝  ╚═╝     ╚═╝\n' +
                '\n Enter \'help\' to display command line options.\n'
            );
        }
    };

    /**
     * The available commands.
     */
    private readonly commands = {
        import: async (args: string[]): Promise<void> => {
            //
            if (args.length !== 1) {
                this.responses.bad();
                return;
            }

            await this.command.addresses.import(args[0]);
            this.responses.success('Address imported.');
        },
        remove: async (args: string[]): Promise<void> => {
            //
            if (args.length !== 1) {
                this.responses.bad();
                return;
            }

            const publicKey: string = args[0];

            await this.command.addresses.remove(publicKey);
            this.responses.success('Address removed from this device.');
        },
        generate: async (args: string[]): Promise<void> => {
            //
            if (args.length !== 0) {
                this.responses.bad();
                return;
            }

            const address = await this.command.addresses.create();

            this.responses.success(`
                Generated new key pair!
                  Private key: ${address.privateKey}
                  Public key:  ${address.publicKey}

                Important note: Don't lose the private key. No keys no cheese!
            `);
        },
        list: async (args: string[]): Promise<void> => {
            //
            const showPrivateKeys = args.includes('--private');

            if (args.length !== 1 && showPrivateKeys) {
                this.responses.bad();
                return;
            }

            if (args.length === 1 && !showPrivateKeys) {
                this.responses.bad();
                return;
            }

            const table = await this.command.addresses.getAll();
            table.map((address, index) => {
                return `
                    ${index + 1}. Public key:  ${address.publicKey} ${showPrivateKeys ? `\nPrivate key: ${address.privateKey}` : ''}
                `;
            });

            if (table.length === 0) {
                this.responses.error('Please import your addresses, or generate one with \'generate\'');
                return;
            }

            this.responses.success(`
                Your key(s):
                    ${table}
            `);
        },
        transactions: async (args: string[]): Promise<void> => {
            //
            if (args.length > 1) {
                this.responses.bad();
                return;
            }

            const transactions: Transaction[] = (args.length === 1)
                ? await this.command.transactions.get(args[0])
                : await this.command.transactions.getAllImported();

            if (transactions.length > 0) {
                this.responses.success(`Found ${transactions.length} transactions${(args.length === 1) ? ` for ${args[0]}` : ''}:\n`
                    + transactions.map((tx, index) =>
                        `  ${index + 1}. Sender: ${tx.from}	Receiver: ${tx.to}	Amount: ${tx.amount} \n`)
                        .toString().replace(',', '')
                );
                return;
            }

            this.responses.error('No transactions found');
        },
        balance: async (args: string[]): Promise<void> => {
            //
            if (args.length > 1) {
                this.responses.bad();
                return;
            }

            const balances: State[] = (args.length === 1)
                ? [await this.command.states.get(args[0])]
                : await this.command.states.getAllImported();

            this.responses.success(`  Total balance: ${balances.reduce((sum, state) => sum + state.balance, 0)} transactions${(args.length === 1) ? ` for ${args[0]}` : ''}:\n`
                + balances.map(state =>
                    `  Address: ${state.publicKey}	Balance: ${state.balance} \n`
                ).toString().replace(',', '')
            );
        },
        transfer: async (args: string[]): Promise<void> => {
            if (args.length !== 3 || isNaN(Number(args[2])) || Number(args[2]) <= 0) {
                this.responses.bad();
                return;
            }

            const sender: string = args[0];
            const receiver: string = args[1];
            const amount: number = parseInt(args[2]);

            this.command.transactions.create(sender, receiver, amount);
            this.responses.success('Created transaction!');
        },
        mirror: async (args: string[]): Promise<void> => {
            if (args.length !== 1 || !['on', 'off'].includes(args[0]))
                this.responses.bad();

            const enabled = args[0] === 'on';
            await this.command.settings.update('mirror', enabled ? 'true' : 'false');

            this.responses.success(`Mirroring ${enabled ? 'enabled' : 'disabled'}`);
        },
        default: (args: string[]): boolean => {
            if (args.length > 1) {
                this.responses.bad();
                return;
            }

            throw new Error('Not implemented');
        },
        exit: (): void => {
            this.response.log('exiting...');
            process.exit(0);
        },
        help: (): void => {
            this.responses.success('Commands:' +
                '\n' +
                '\n  Wallet setup:' +
                '\n    generate			Generate new key pair' +
                '\n    import <private_key>	Import key pair' +
                '\n    remove <public_key>		Removes key pair locally' +
                '\n' +
                '\n  Wallet operations:' +
                '\n    list 			Lists all public keys' +
                '\n    balance			Shows cumulative balance of imported public keys' +
                '\n    balance <public_key>	Shows balance of specific public key' +
                '\n    transactions		Lists all transactions for imported public keys' +
                '\n    transactions <public_key>	Lists all transactions for a specific public keys' +
                '\n    transfer <sender_public_key> <receiver_public_key> <amount> 	Transfer funds from A to B' +
                '\n' +
                '\n  Node Configuration:' +
                '\n    mirror on|off		Enables or disables the mirroring option' +
                // '\n    default <public_key>	Set default address for spending' +
                '\n' +
                '\n    help			Displays all commands' +
                '\n    exit 			Exits the application' +
                '\n');
        }
    };
}