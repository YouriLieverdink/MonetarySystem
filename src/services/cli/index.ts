import { CommandController } from '../../controllers';

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
				return this.core[key](command);
			}

			response.log(this.errorText('Unknown command'));
		}
		catch (e) {
			response.log(this.errorText(e.message));
		}

		return false;
	}

	/**
	 * The core commands.
	 */
	private readonly core = {
		import: (args: string[]): boolean => {
			if (args.length !== 1)
				return this.badRequest();

			const privateKey: string = args[0];
			if (this.commandController.addresses.import(privateKey))
				return this.success(`Successfully imported wallet ${privateKey}`);
			return false;
		},
		remove: (args: string[]): boolean => {
			if (args.length !== 1)
				return this.badRequest();

			const publicKey: string = args[0];

			if (this.commandController.addresses.remove(publicKey))
				return this.success('Successfully removed keys removed from this device');
			return false;
		},
		generate: (args: string[]): boolean => {
			return false;
			// if (args.length !== 0)
			// 	return this.badRequest();

			// const keyPair = this.commandController.addresses.create();
			// return this.success(`Generated new key pair! \n  Important Note: Don't lose the private key. No keys no cheese!\n\n  Private key: 	${keyPair.privateKey}\n  Public key: ${keyPair.publicKey}`);
		},
		list: async (args: string[]): Promise<boolean> => {
			const showPrivateKeys = args.includes('--private');

			if ((args.length !== 1 && showPrivateKeys) || (args.length === 1 && !showPrivateKeys))
				return this.badRequest();

			return this.success('Your key(s):\n' + (await this.commandController.addresses.getAll())
				.map((address, index) =>
					`  ${index + 1}. Public key: ${address.publicKey}${(showPrivateKeys) ? `		Private key: ${address.privateKey}` : ''
					}\n`)
			);
		},
		transactions: async (args: string[]): Promise<boolean> => {
			return false;
			// if (args.length > 1)
			// 	return this.badRequest();

			// const transactions: Transaction[] = await ((args.length === 1)
			// 	? (this.commandController.transactions.getAll(args[0]))
			// 	: (await (this.commandController.addresses.getAll())).flatMap(async (address) => (await this.commandController.transactions.getAll(address.publicKey))));

			// return this.success(`Found ${transactions.length} transactions${(args.length === 1) ? ` for ${args[0]}` : ''}:\n`
			// 	+ transactions.map((tx, index) =>
			// 		`  ${index + 1}. Sender: ${tx.from}	Receiver: ${tx.to}	Amount: ${tx.amount} \n`)
			// 		.toString().replace(',', '')
			// );
		},
		balance: (args: string[]): boolean => {
			return false;
			// if (args.length > 1)
			// 	return this.badRequest();

			// const balances: State[] = (args.length === 1)
			// 	? [this.commandController.balances.get(args[0])]
			// 	: this.commandController.addresses.getAll().flatMap(address =>
			// 		this.commandController.balances.get(address.publicKey));

			// return this.success(`  Total balance: ${balances.reduce((sum, state) => sum + state.amount, 0)} transactions${(args.length === 1) ? ` for ${args[0]}` : ''}:\n`
			// 	+ balances.map(state =>
			// 		`  Address: ${state.publicKey}	Balance: ${state.amount} \n`
			// 	).toString().replace(',', '')
			// );
		},
		transfer: (args: string[]): boolean => {
			if (args.length !== 3 || isNaN(Number(args.slice(-1)[0])))
				return this.badRequest();

			const sender: string = args[0];
			const receiver: string = args[1];
			const amount: number = parseInt(args[2]);

			if (this.commandController.transactions.create(sender, receiver, amount))
				return this.success('Created transaction!');
			return false;
		},
		mirror: (args: string[]): boolean => {
			return false;
			// if (args.length !== 1 || !['on', 'off'].includes(args[0]))
			// 	return this.badRequest();

			// const enabled = args[0] === 'on';
			// return this.commandController.mirror.set(enabled);
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
		},
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