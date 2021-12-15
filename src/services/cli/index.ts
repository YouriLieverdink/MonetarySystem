import { Container, Service } from 'typedi';
import { CommandController } from '../../controllers';
import { State } from '../../types/state';
import { Transaction } from '../../types/transaction';

@Service()
export class CliService {

	/** CommandController service injection. */
	private commandController = Container.get(CommandController);

	/** The response for the output. */
	private response: Console;

	/**
	 * Display the welcome message.
	 *  
	 * @param response The response object.
	 */
	public start(response: Console): void {
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
	 * Handle incoming requests.
	 * 
	 * @param request The received string.
	 * @param response The response object.
	 */
	public handle(request: string, response: Console): void {
		const command = request.trim().split(' ');
		this.response = response;

		try {
			switch (command.shift()) {
				case 'exit':
				case 'quit':
					this.commands.exit();
					break;
				case 'clear':
					this.response.clear();
					break;
				case 'help':
					this.commands.help();
					break;
				case 'import':
					this.commands.import(command);
					break;
				case 'remove':
					this.commands.remove(command);
					break;
				case 'generate':
					this.commands.generate(command);
					break;
				case 'list':
					this.commands.list(command);
					break;
				case 'transactions':
					this.commands.transactions(command);
					break;
				case 'balance':
					this.commands.balance(command);
					break;
				case 'create-transaction':
					this.commands.createTransaction(command);
					break;
				case 'mirror':
					this.commands.mirror(command);
					break;
				case 'default':
					this.commands.default(command)
					break;

				default:
					response.log(this.errorText(`'${request}' is not a command`));
			}
		} catch (e: any) {
			response.log(this.errorText(e.message))
		}
	}

	/** CLI command interpreters */
	private commands = {
		import: (args: string[]): void => {
			if (args.length !== 1)
				return this.response.log(this.badRequest);

			const privateKey: string = args[0];
			if (this.commandController.addresses.import(privateKey))
				this.response.log(`  Successfully imported wallet ${privateKey}`);
		},
		remove: (args: string[]): void => {
			if (args.length !== 1)
				return this.response.log(this.badRequest);

			const publicKey: string = args[0];

			if (this.commandController.addresses.remove(publicKey))
				this.response.log('Successfully removed keys removed from this device');
		},
		generate: (args: string[]): void => {
			if (args.length !== 0)
				return this.response.log(this.badRequest);

			const keyPair = this.commandController.addresses.create();
			this.response.log(`  Generated new key pair! \n  Important Note: Don't lose the private key. No keys no cheese!\n\n  Private key: 	${keyPair.privateKey}\n  Public key: ${keyPair.publicKey}`)
		},
		list: (args: string[]): void => {
			const showPrivateKeys = args.includes('--private');

			if ((args.length !== 1 && showPrivateKeys) || (args.length == 1 && !showPrivateKeys))
				return this.response.log(this.badRequest);

			const addresses = this.commandController.addresses.getAll();
			this.response.log(`  Your key(s):\n` + addresses.map((address, index) =>
				`  ${index+1}. Public key: ${address.publicKey}${(showPrivateKeys) ? `		Private key: ${address.privateKey}` : ''}\n`)
			);
		},
		transactions: (args: string[]): void => {
			if (args.length > 1)
				return this.response.log(this.badRequest);

			const transactions: Transaction[] = (args.length === 1)
				? this.commandController.transactions.getAll(args[0])
				: this.commandController.addresses.getAll().flatMap(address =>
					this.commandController.transactions.getAll(address.publicKey));

			this.response.log(`  Found ${transactions.length} transactions${(args.length === 1) ? ` for ${args[0]}`: ''}:\n`
				+ transactions.map((tx, index) =>
					`  ${index+1}. Sender: ${tx.from}	Receiver: ${tx.to}	Amount: ${tx.amount} \n`)
					.toString().replace(',', '')
			);
		},
		balance: (args: string[]): void => {
			if (args.length > 1)
				return this.response.log(this.badRequest);

			const balances: State[] = (args.length === 1)
				? [this.commandController.balances.get(args[0])]
				: this.commandController.addresses.getAll().flatMap(address =>
					this.commandController.balances.get(address.publicKey));

			this.response.log(`  Total balance: ${balances.reduce((sum, state) => sum + state.amount, 0)} transactions${(args.length === 1) ? ` for ${args[0]}`: ''}:\n`
				+ balances.map(state =>
				`  Address: ${state.publicKey}	Balance: ${state.amount} \n`
				).toString().replace(',', '')
			);
		},
		createTransaction: (args: string[]): void => {
			if (args.length !== 3)
				return this.response.log(this.badRequest);

			const sender: string = args[0];
			const receiver: string = args[1];
			const amount: number = parseInt(args[2]);

			this.commandController.transactions.create(sender, receiver, amount);
		},
		mirror: (args: string[]): void => {
			if (args.length !== 1 || !['on', 'off'].includes(args[0]))
				return this.response.log(this.badRequest);

			const enabled = args[0] === 'on';
			this.commandController.mirror.set(enabled);
		},
		default: (args: string[]): void => {
			if (args.length > 1)
				return this.response.log(this.badRequest);

			throw new Error('Not implemented')
		},
		exit: (): void => {
			this.response.log('exiting...');
			process.exit(0);
		},
		help: (): void => {
			this.response.log('Commands:' +
				'\n' +
				'\nWallet setup:' +
				'\n    import <private_key>	Import private key + public keys' +
				'\n    remove <public_key>		Removes public + private key locally' +
				'\n' +
				'\nWallet operations:' +
				'\n    list 			Lists all public keys' +
				'\n    balance			Shows cumulative balance of imported public keys' +
				'\n    balance <public_key>	Shows balance of specific public key' +
				'\n    transactions		Lists all transactions for imported public keys' +
				'\n    transactions <public_key>	Lists all transactions for a specific public keys' +
				'\n    create-transaction <sender_public_key> <receiver_public_key> <amount> 	Send funds from A to B' +
				// '\n    create-transaction <receiver_public_key> <amount> 				Send funds from default address to B' +
				'\n' +
				'\nNode Configuration:' +
				'\n    mirror on|off		Enables or disables the mirroring option' +
				// '\n    default <public_key>	Set default address for spending' +
				'\n' +
				'\n    help			Displays all commands' +
				'\n    exit|quit 			Exits the application' +
				'\n');
		}
	}

	/**
	 * Makes text foreground red
	 *
	 * @param msg The error string.
	 * @return string in red.
	 */
	private errorText = msg => `\x1b[31m${msg}\x1b[0m`;

	private badRequest: string = this.errorText('wrong syntax') + '\n  Enter \'help\' to display command line options.';

}