import { Container, Inject, Service } from 'typedi';
import { CommandController } from '../../controllers';
import { State } from '../../types/state';
import { Transaction } from '../../types/transaction';

@Service()
export class CliService {

	/** CommandController service injection. */
	private commandController = Container.get(CommandController);

	/** The response for the output. */
	static response: Console;

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
	 * Handle incoming CLI commands.
	 * 
	 * @param request The received string.
	 * @param response The response object.
	 */
	public handle(request: string, response: Console): boolean {
		const command = request.trim().split(' ');
		CliService.response = response;

		try {
			switch (command.shift()) {
				case 'exit':
				case 'quit':
					this.commands.exit();
					break;
				case 'clear':
					response.clear();
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
					response.log(CliService.errorText('Unknown command'));
					return false;
			}
		} catch (e: any) {
			response.log(CliService.errorText(e.message));
			return false;
		}
		return true;
	}

	/** CLI command interpreters */
	public commands = {
		import: (args: string[]): boolean => {
			if (args.length !== 1)
				return CliService.badRequest();

			const privateKey: string = args[0];
			if (this.commandController.addresses.import(privateKey))
				return CliService.success(`Successfully imported wallet ${privateKey}`);
			return false;
		},
		remove: (args: string[]): boolean => {
			if (args.length !== 1)
				return CliService.badRequest();

			const publicKey: string = args[0];

			if (this.commandController.addresses.remove(publicKey))
				return CliService.success('Successfully removed keys removed from this device');
			return false;
		},
		generate: (args: string[]): boolean => {
			if (args.length !== 0)
				return CliService.badRequest();

			const keyPair = this.commandController.addresses.create();
			return CliService.success(`Generated new key pair! \n  Important Note: Don't lose the private key. No keys no cheese!\n\n  Private key: 	${keyPair.privateKey}\n  Public key: ${keyPair.publicKey}`)
		},
		list: (args: string[]): boolean => {
			const showPrivateKeys = args.includes('--private');

			if ((args.length !== 1 && showPrivateKeys) || (args.length === 1 && !showPrivateKeys))
				return CliService.badRequest();

			return CliService.success(`Your key(s):\n` + this.commandController.addresses.getAll()
				.map((address, index) =>
				`  ${index+1}. Public key: ${address.publicKey}${
					(showPrivateKeys) ? `		Private key: ${address.privateKey}` : ''
				}\n`)
			);
		},
		transactions: (args: string[]): boolean => {
			if (args.length > 1)
				return CliService.badRequest();

			const transactions: Transaction[] = (args.length === 1)
				? this.commandController.transactions.getAll(args[0])
				: this.commandController.addresses.getAll().flatMap(address =>
					this.commandController.transactions.getAll(address.publicKey));

			return CliService.success(`Found ${transactions.length} transactions${(args.length === 1) ? ` for ${args[0]}`: ''}:\n`
				+ transactions.map((tx, index) =>
					`  ${index+1}. Sender: ${tx.from}	Receiver: ${tx.to}	Amount: ${tx.amount} \n`)
					.toString().replace(',', '')
			);
		},
		balance: (args: string[]): boolean => {
			if (args.length > 1)
				return CliService.badRequest();

			const balances: State[] = (args.length === 1)
				? [this.commandController.balances.get(args[0])]
				: this.commandController.addresses.getAll().flatMap(address =>
					this.commandController.balances.get(address.publicKey));

			return CliService.success(`  Total balance: ${balances.reduce((sum, state) => sum + state.amount, 0)} transactions${(args.length === 1) ? ` for ${args[0]}`: ''}:\n`
				+ balances.map(state =>
				`  Address: ${state.publicKey}	Balance: ${state.amount} \n`
				).toString().replace(',', '')
			);
		},
		createTransaction: (args: string[]): boolean => {
			if (args.length !== 3 || isNaN(Number(args.slice(-1)[0])))
				return CliService.badRequest();

			const sender: string = args[0];
			const receiver: string = args[1];
			const amount: number = parseInt(args[2]);

			if (this.commandController.transactions.create(sender, receiver, amount))
				return CliService.success('Created transaction!');
			return false;
		},
		mirror: (args: string[]): boolean => {
			if (args.length !== 1 || !['on', 'off'].includes(args[0]))
				return CliService.badRequest();

			const enabled = args[0] === 'on';
			return this.commandController.mirror.set(enabled);
		},
		default: (args: string[]): boolean => {
			if (args.length > 1)
				return CliService.badRequest();

			throw new Error('Not implemented')
		},
		exit: (): true => {
			CliService.response.log('exiting...');
			process.exit(0);
			return true;
		},
		help: (): true => {
			return CliService.success('Commands:' +
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
				'\n    create-transaction <sender_public_key> <receiver_public_key> <amount> 	Send funds from A to B' +
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
	}

	private static errorText = msg => `  \x1b[31m${msg}\x1b[0m`;

	private static badRequest = (): false => {
		CliService.response?.log(CliService.errorText('wrong syntax') + '\n  Enter \'help\' to display command line options.');
		return false;
	}

	private static success = (msg): true => {
		CliService.response?.log(`  ${msg}`);
		return true;
	}
}