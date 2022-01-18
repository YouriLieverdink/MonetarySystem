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
     * @param response The object used to send responses.
     */
    constructor(
        command: Command,
        response: Console
    ) {
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
        const args = request.trim().split(' ');
        const command = args.shift();

        try {
            if (command === '') return;

            // Attempt to call the provided command.
            return (this.commands[command](args))
                .then(p => {
                    this.responses.log(); // print empty row
                    return p;
                })
                .catch(p => p);
        }
        catch (e) {
            const error: Error = e;

            if (error.name === 'TypeError') {
                // The provided command was not found in `this.commands`.
                this.responses.error('Invalid command');
                this.responses.log('Enter \'help\' to display command line options.\n');
                return;
            }

            this.responses.error(error.message + '\n');
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
            this.responses.error('Wrong syntax');
            this.responses.log('Enter \'help\' to display command line options.');
        },
        /**
         * Displays an indented message in red.
         * 
         * @param message The message to display.
         */
        error: (message: string): void =>
            this.responses.log(`\x1b[31m${message}\x1b[0m`),
        /**
         * Displays an indented message.
         * 
         * @param message The message to display.
         */
        log: (message = ''): void =>
            this.response.log(`  ${message}`),
        /**
         * Displays the welcome message.
         */
        welcome: (): void =>
            this.response.log('\n' +
                '████████╗ ██████╗  ██╗ ████████╗ ██╗ ██╗   ██╗ ███╗   ███╗\n' +
                '╚══██╔══╝ ██╔══██╗ ██║ ╚══██╔══╝ ██║ ██║   ██║ ████╗ ████║\n' +
                '   ██║    ██████╔╝ ██║    ██║    ██║ ██║   ██║ ██╔████╔██║\n' +
                '   ██║    ██╔══██╗ ██║    ██║    ██║ ██║   ██║ ██║╚██╔╝██║\n' +
                '   ██║    ██║  ██║ ██║    ██║    ██║ ╚██████╔╝ ██║ ╚═╝ ██║\n' +
                '   ╚═╝    ╚═╝  ╚═╝ ╚═╝    ╚═╝    ╚═╝  ╚═════╝  ╚═╝     ╚═╝\n' +
                '\n Enter \'help\' to display command line options.\n'
            )
    };

    /**
     * The available commands.
     */
    private readonly commands = {
        clear: async (): Promise<void> => {
            this.response.clear();
            this.responses.welcome();
        },
        import: async (args: string[]): Promise<void> => {
            if (args.length !== 1) {
                this.responses.bad();
                return;
            }

            await this.command.addresses.import(args[0]);
            this.responses.log('Address imported to this device.');
        },
        remove: async (args: string[]): Promise<void> => {
            if (args.length !== 1)
                return this.responses.bad();

            const publicKey: string = args[0];

            await this.command.addresses.remove(publicKey);
            this.responses.log('Address removed from this device.');
        },
        generate: async (args: string[]): Promise<void> => {
            if (args.length !== 0) {
                this.responses.bad();
                return;
            }

            const address = await this.command.addresses.create();

            this.responses.log(`Generated new key pair!\n\n    Public key:  ${address.publicKey}\n    Private key: ${address.privateKey}\n\n  Important note: Don't lose the private key. No keys no cheese!`);
        },
        list: async (args: string[]): Promise<void> => {
            const showPrivateKeys = args.includes('--private');

            if (args.length !== 1 && showPrivateKeys)
                return this.responses.bad();

            if (args.length === 1 && !showPrivateKeys)
                return this.responses.bad();

            const addresses = await this.command.addresses.getAll();
            const table = addresses.map((address, index) =>
                `${index + 1}.   Public key:  ${address.publicKey} ${showPrivateKeys ? `\n       Private key: ${address.privateKey}` : ''}`
            );

            if (table.length === 0)
                return this.responses.error('Please import your addresses, or generate one with \'generate\'.');


            this.responses.log('Your key(s):');
            table.forEach((row) =>
                this.responses.log(row)
            );
        },
        transactions: async (args: string[]): Promise<void> => {
            if (args.length > 1)
                return this.responses.bad();

            const transactions: Transaction[] = (args.length === 1)
                ? await this.command.transactions.get(args[0])
                : await this.command.transactions.getAllImported();

            if (transactions.length > 0) {
                this.responses.log(`Found ${transactions.length} transaction${transactions.length === 1 ? '': 's'}`);
                transactions.forEach((tx, index) => {
                    return this.responses.log(`${index + 1}.    Amount: ${tx.amount}    Sender: ${tx.from}	Receiver: ${tx.to}`);
                });
                return;
            }

            this.responses.error('No transactions found');
        },
        tx: (args: string[]) =>
            this.commands.transactions(args),
        balance: async (args: string[]): Promise<void> => {
            if (args.length > 1)
                return this.responses.bad();

            const states: Promise<State[]> = (args.length === 1)
                ? this.command.states.get(args[0])
                : this.command.states.getAllImported();

            return states
                .then(states => {
                    if (states.filter(b => b != null).length === 0)
                        return this.responses.log('No balance data');

                    this.responses.log(`Total balance: ${states.reduce((sum, { balance }) => sum + balance as Number ?? 0, 0)}`);
                    states.forEach(({ publicKey, balance }) =>
                        this.responses.log(`Balance: ${balance ?? 'unknown'}		Address: ${publicKey ?? 'unknown'}`)
                    )
                }).catch(() =>
                    this.responses.error('Error getting balance data')
                );
        },
        transfer: async (args: string[]): Promise<void> => {
            if (args.length !== 3 || isNaN(Number(args[2])) || Number(args[2]) <= 0)
                return this.responses.bad();

            const sender: string = args[0];
            const receiver: string = args[1];
            const amount: number = parseInt(args[2]);

            this.command.transactions.create(sender, receiver, amount);
            this.responses.log('Created transaction!');
        },
        mirror: async (args: string[]): Promise<void> => {
            if (args.length !== 1 || !['on', 'off'].includes(args[0]))
                return this.responses.bad();

            const enabled = args[0] === 'on';
            await this.command.settings.update('mirror', enabled ? 'true' : 'false');

            this.responses.log(`Mirroring ${enabled ? 'enabled' : 'disabled'}`);
        },
        default: (args: string[]): void => {
            if (args.length > 1)
                return this.responses.bad();

            throw new Error('Not implemented');
        },
        exit: (): void =>
            process.exit(0),
        help: (): void =>
            this.responses.log('Commands:' +
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
                '\n    exit 			Exits the application'
            )
    };
}