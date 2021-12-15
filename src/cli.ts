import { createInterface } from 'readline';
import { CliService } from './services';
import { Container } from 'typedi';

export const cli = () => {

	/** CliService injection. */
	const cli = Container.get(CliService);

	/** Create CLI interface. */
	const rl = createInterface({
		'input': process.stdin,
		'output': process.stdout,
	});

	const ask = () => {
		rl.question('\x1b[0mtritium> ', command => {
			// Handle the command.
			cli.handle(command, console);

			// Wait for next command
			ask();
		});
	};

	cli.start(console);
	ask();
};