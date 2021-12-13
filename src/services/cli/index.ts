import readline from 'readline';
import { Service } from 'typedi';

@Service()
export class CliService {
	shell = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	/**
	 * Handle incoming requests.
	 * 
	 * @param request The received string.
	 */
	public handle(request: string): void {
		const command = request.split(' ')[0]

		switch (command) {
			case 'exit':
			case 'quit':
				this.exit()
				break
			case 'clear':
				console.clear();
				break
			case 'help':
				this.help()
				break
			case 'import':
			case 'remove':
			case 'list':
			case 'transactions':
			case 'balance':
			case 'create-transaction':
			case 'mirror':
				this.error(`not yet implemented: '${command}'`)
				break
			default:
				this.error(`'${request}' is not a command`)
		}
		this.listen()
	}

	public start(){
		console.clear();
		console.log("\n" +
			"████████╗ ██████╗  ██╗ ████████╗ ██╗ ██╗   ██╗ ███╗   ███╗\n" +
			"╚══██╔══╝ ██╔══██╗ ██║ ╚══██╔══╝ ██║ ██║   ██║ ████╗ ████║\n" +
			"   ██║    ██████╔╝ ██║    ██║    ██║ ██║   ██║ ██╔████╔██║\n" +
			"   ██║    ██╔══██╗ ██║    ██║    ██║ ██║   ██║ ██║╚██╔╝██║\n" +
			"   ██║    ██║  ██║ ██║    ██║    ██║ ╚██████╔╝ ██║ ╚═╝ ██║\n" +
			"   ╚═╝    ╚═╝  ╚═╝ ╚═╝    ╚═╝    ╚═╝  ╚═════╝  ╚═╝     ╚═╝\n" +
			"\n Enter 'help' to display command line options.\n")

		this.listen()
	}

	/**
	 * Listen for CLI input.
	 */
	public listen(): void {
		this.shell.question("tritium> ", input => this.handle(input))
		this.shell.on("close", this.exit)
	}

	private error(msg) {
		console.error('\x1b[31m', msg, '\x1b[0m')
	}

	private exit() {
		console.log("\nexiting...")
		process.exit(0)
	}

	private help() {
		console.log("Commands:" +
			"\n    help			Displays all possible commands" +
			"\n" +
			"\n    import <private_key>	Import private key + public keys" +
			"\n    remove <public_key>		Removes public + private key locally" +
			"\n" +
			"\n    list 			Lists all public keys" +
			"\n    balance			Shows cumulative balance of imported public keys" +
			"\n    balance <public_key>	Shows balance of specific public key" +
			"\n    transactions		Lists all transactions for imported public keys" +
			"\n    transactions <public_key>	Lists all transactions for a specific public keys" +
			"\n" +
			"\n    mirror enable|disable	Enables or disables the mirroring option" +
			"\n" +
			"\n    create-transaction <sender_public_key> <receiver_public_key> <amount> 	Send funds from A to B" +
			"")
	}
}