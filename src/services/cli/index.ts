import { CommandController } from '../../controllers';
import { State, Transaction } from '../../types';

export class CliService {
	/**
	 * The instance which should receive all commands.
	 */
	private commandController: CommandController;

	/**
	 * The object for handling output.
	 */
	private response: Console;

	/**
	 * Class constructor.
	 */
	constructor(
		commandController: CommandController,
		response: Console,
	) {
		this.commandController = commandController;
		this.response = response;

		// Display a welcome message.
		response.clear();
		response.log('\n' +
			'████████╗ ██████╗  ██╗ ████████╗ ██╗ ██╗   ██╗ ███╗   ███╗\n' +
			'╚══██╔══╝ ██╔══██╗ ██║ ╚══██╔══╝ ██║ ██║   ██║ ████╗ ████║\n' +
			'   ██║    ██████╔╝ ██║    ██║    ██║ ██║   ██║ ██╔████╔██║\n' +
			'   ██║    ██╔══██╗ ██║    ██║    ██║ ██║   ██║ ██║╚██╔╝██║\n' +
			'   ██║    ██║  ██║ ██║    ██║    ██║ ╚██████╔╝ ██║ ╚═╝ ██║\n' +
			'   ╚═╝    ╚═╝  ╚═╝ ╚═╝    ╚═╝    ╚═╝  ╚═════╝  ╚═╝     ╚═╝\n' +
			'\n Enter \'help\' to display command line options.\n');
	}

	/**
	 * Handle incoming CLI commands.
	 * 
	 * @param request The received string.
	 * @param response The response object.
	 */
	public async handle(request: string, response: Console = console): Promise<boolean> {
		const command = request.trim().split(' ');
		this.response = response;

		const key = command.shift();

		try {
			// Check whether the command exists
			if (Object.keys(this.core).includes(key)) {
				return await this.core[key](command);
			}

			response.log(this.errorText('Unknown command'));
		}
		catch (e) {
			response.log(this.errorText(e.message));
		}

		return false;
	}

	/** CLI command interpreters */
	private readonly core = {
		import: async (args: string[]): Promise<boolean> => {
			if (args.length !== 1)
				return this.badRequest();

			const privateKey: string = args[0];
			if (await this.commandController.addresses.import(privateKey))
				return this.success(`Successfully imported wallet ${privateKey}`);
			return false; //new Promise(reject => false);
		},
		remove: async (args: string[]): Promise<boolean> => {
			if (args.length !== 1)
				return this.badRequest();

			const publicKey: string = args[0];

			if (await this.commandController.addresses.remove(publicKey))
				return this.success('Successfully removed key from device');

			this.response.log(this.errorText('Couldn\'t remove key'))
			return false;
		},
		generate: async (args: string[]): Promise<boolean> => {
			if (args.length !== 0)
				return this.badRequest();

			const keyPair = await this.commandController.addresses.create();
			return this.success(`Generated new key pair! \n  Important Note: Don't lose the private key. No keys no cheese!\n\n  Private key: 	${keyPair.privateKey}\n  Public key: ${keyPair.publicKey}`);
		},
		list: async (args: string[]): Promise<boolean> => {
			const showPrivateKeys = args.includes('--private');

			if ((args.length !== 1 && showPrivateKeys) || (args.length === 1 && !showPrivateKeys))
				return this.badRequest();

			const table = (await this.commandController.addresses.getAll())
				.map((address, index) => `  ${index + 1}. Public key: ${address.publicKey}${(showPrivateKeys) ? `		Private key: ${address.privateKey}` : ''}\n`);

			if (table.length > 0)
				return this.success('Your key(s):\n' + table);

			this.response.log(this.errorText('Please import your keys first, or generate a pair using \'generate\''));
			return true;
		},
		transactions: async (args: string[]): Promise<boolean> => {
			if (args.length > 1)
				return this.badRequest();

			const transactions: Transaction[] = (args.length === 1)
				? await this.commandController.transactions.getAll(args[0])
				: await this.commandController.transactions.getAllImported();

			if (transactions.length > 0)
				return this.success(`Found ${transactions.length} transactions${(args.length === 1) ? ` for ${args[0]}` : ''}:\n`
					+ transactions.map((tx, index) =>
						`  ${index + 1}. Sender: ${tx.from}	Receiver: ${tx.to}	Amount: ${tx.amount} \n`)
						.toString().replace(',', '')
				);
			this.response.log(this.errorText('No transactions found'));
			return true;
		},
		balance: async (args: string[]): Promise<boolean> => {
			if (args.length > 1)
				return this.badRequest();

			const balances: State[] = (args.length === 1)
				? [await this.commandController.balances.get(args[0])]
				: await this.commandController.balances.getAllImported();

			// return this.success(`  Total balance: ${balances.reduce((sum, state) => sum + state.amount, 0)} transactions${(args.length === 1) ? ` for ${args[0]}` : ''}:\n`
			// 	+ balances.map(state =>
			// 		`  Address: ${state.publicKey}	Balance: ${state.amount} \n`
			// 	).toString().replace(',', '')
			// );
		},
		transfer: async (args: string[]): Promise<boolean> => {
			if (args.length !== 3 || isNaN(Number(args[2])) || Number(args[2]) <= 0)
				return this.badRequest();

			const sender: string = args[0];
			const receiver: string = args[1];
			const amount: number = parseInt(args[2]);

			if (await this.commandController.transactions.create(sender, receiver, amount))
				return this.success('Created transaction!');
			return false;
		},
		mirror: async (args: string[]): Promise<boolean> => {
			if (args.length !== 1 || !['on', 'off'].includes(args[0]))
				return this.badRequest();

			const enabled = args[0] === 'on';
			return await this.commandController.mirror.set(enabled);
		},
		default: (args: string[]): boolean => {
			if (args.length > 1)
				return this.badRequest();

			throw new Error('Not implemented');
		},
		exit: (): true => {
			this.response.log('exiting...');
			process.exit(0);
			return true;
		},
		help: (): true => {
			return this.success('Commands:' +
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
				// '\n    create-transaction <receiver_public_key> <amount> 				Send funds from default address to B' +
				'\n' +
				'\n  Node Configuration:' +
				'\n    mirror on|off		Enables or disables the mirroring option' +
				// '\n    default <public_key>	Set default address for spending' +
				'\n' +
				'\n    help			Displays all commands' +
				'\n    exit|quit 			Exits the application' +
				'\n');
		}
	};

	private errorText = (msg) => `  \x1b[31m${msg}\x1b[0m`;

	private badRequest = (): false => {
		this.response?.log(this.errorText('wrong syntax') + '\n  Enter \'help\' to display command line options.');
		return false;
	};

	private success = (msg): true => {
		this.response?.log(`  ${msg}`);
		return true;
	};
}