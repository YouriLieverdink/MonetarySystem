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
		this.response = response;

		const command = request.split(' ')[0];

		switch (command) {
			case 'exit':
			case 'quit':
				this.exit();
				break;
			case 'clear':
				this.response.clear();
				break;
			case 'help':
				this.help();
				break;
			case 'import':
			case 'remove':
			case 'list':
			case 'transactions':
			case 'balance':
			case 'create-transaction':
			case 'mirror':
			case 'default':
				this.error(`not yet implemented: '${command}'`);
				break;
			default:
				this.error(`'${request}' is not a command`);
		}
	}

	private error(message: string): void {
		this.response.error('\x1b[31m', message, '\x1b[0m');
	}

	private exit(): void {
		this.response.log('\nexiting...');
		process.exit(0);
	}

	private help() {
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
			'\n    mirror enable|disable	Enables or disables the mirroring option' +
			'\n    default <public_key>	Set default address for spending' +
			'\n' +
			'\n    help			Displays all commands' +
			'\n    exit|quit 			Exits the application' +
			'\n');
	}
}