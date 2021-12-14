import { Interface, createInterface } from 'readline';
import { CliService } from './services';
import { Container } from 'typedi';

export const cli = () => {
	// Retrieve the cli service.
	const cli = Container.get(CliService);
	
	// Create the interface.
	const rl = createInterface({
		'input': process.stdin,
		'output': process.stdout,
	});

	const ask = (cli: CliService, rl: Interface) => {
		rl.question('tritium> ', (command) => {
			// Handle the command.
			cli.handle(command, console);

			ask(cli, rl);
		});
	};

	cli.start(console);
	ask(cli, rl);
};