import { Service } from 'typedi';

@Service()
export class CliService {
	/**
	 * The response for the output.
	 */
	private response: Console;

	/**
	 * Display the start.
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
				this.error(`'${request}' is not a command`);
		}
	}

	private commands = {
		import: (args: string[]): void => {
			if (args.length === 1) {
				const privateKey: string = args[0];
				// todo remove private_key
				// todo check if already imported && is valid key
				this.response.log(`  importing private key: ${privateKey}`)

			} else this.bad_request();
		},
		remove: (args: string[]): void => {
			if (args.length === 1) {
				const publicKey: string = args[0];
				// todo check if imported && is valid key
				// todo remove public_key
				this.response.log(`  removing public key: ${publicKey}`)

			} else this.bad_request();
		},
		generate: (args: string[]): void => {
			if (args.length === 0) {
				// todo response.log('You already have a pair of keys');
				this.response.log(`  generated key pair:\n    private_key:	qwerty\n    public_key: x`); //generate key pair

			} else this.bad_request();
		},
		list: (args: string[]): void => {
			if (args.length === 0) {
				// todo show all public keys
				this.response.log(`  public_key: x (default)\n  public_key: y`);

			} else if (args.includes('--private')) {
				// todo show all key pairs
				this.response.log(`  private_key: qwerty	public_key: x (default)\n  private_key: wertyu	public_key: y`);

			} else this.bad_request();
		},
		transactions: (args: string[]): void => {
			if (args.length === 0) {
				// todo check if there is any wallet
				// todo show all transactions of imported wallets
				this.response.log(`  transaction count: 2\n  IN	2T 	from y	to x\n  IN	3T 	from z	to q`);

			} else if (args.length === 1) {
				const publicKey: string = args[0];
				// todo show all transactions of public_key
				this.response.log(`  transaction count for ${publicKey}: 2\n  IN	2T 	from ${publicKey}	to x\n  IN	3T 	from y	to ${publicKey}`)

			} else this.bad_request();
		},
		balance: (args: string[]): void => {
			if (args.length === 0) {
				// todo check if there is any wallet
				// todo show all balances of imported wallets
				this.response.log(`  total balance: 10T\n  balance: 5T	| address: x (default)\n  balance: 5T	| address: y`);

			} else if (args.length === 1) {
				const publicKey: string = args[0];
				// todo show balance of public_key
				this.response.log(`  address ${publicKey} balance: 10T`);

			} else this.bad_request();
		},
		createTransaction: (args: string[]): void => {
			// todo check if there is any wallet

			if (args.length === 3) {
				const sender: string = args[0];
				const receiver: string = args[1];
				const amount: number = parseInt(args[2]);
				// todo check if both keys are valid key & is valid amount
				this.response.log(`  sending ${amount} tritium from ${sender} to ${receiver}`);

			} else if (args.length === 2) {
				const receiver: string = args[0];
				const amount: number = parseInt(args[1]);
				// todo check if is valid key & is valid amount
				this.response.log(`  sending ${amount} tritium to ${receiver}`)

			} else this.bad_request();
		},
		mirror: (args: string[]): void => {
			if (args.length === 1 && ['on', 'off'].includes(args[0])) {
				const toggle = args[0] === 'on';
				// todo set mirroring enabled/disabled
				this.response.log(`  turning mirroring ${args[0]}`);

			} else this.bad_request();
		},
		default: (args: string[]): void => {
			if (args.length === 0) {
				// todo check if there already are public_keys
				// todo show default public_key
				this.response.log(`  default address: x`);

			} else if (args.length === 1) {
				const publicKey: string = args[0];
				// todo set public_key as default
				this.response.log(`  setting default address to ${publicKey}`);

			} else this.bad_request();
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
				'\n    create-transaction <receiver_public_key> <amount> 				Send funds from default address to B' +
				'\n' +
				'\nNode Configuration:' +
				'\n    mirror on|off		Enables or disables the mirroring option' +
				'\n    default <public_key>	Set default address for spending' +
				'\n' +
				'\n    help			Displays all commands' +
				'\n    exit|quit 			Exits the application' +
				'\n');
		}
	}

	private bad_request(): void {
		this.response.error('  wrong syntax');
		this.response.log('  Enter \'help\' to display command line options.');
	}

	private error(message: string): void {
		this.response.error('\x1b[31m', message, '\x1b[0m');
	}
}