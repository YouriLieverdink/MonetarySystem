import express from 'express';
import readline from 'readline';
import Container from 'typedi';
import { ApiService, CliService, ConsensusService, GossipService } from '../../services';
import { Config } from '../../types/config';

export class InternalController {
	/**
	 * Class constructor.
	 * 
	 * This class is used to kickstart the entire application.
	 * 
	 * @param config The configuration.
	 */
	constructor(config: Config) {
		//
		this.initApi(config.port);
		this.initCli();

		setInterval(this.tick.bind(this), config.interval);
	}

	/**
	 * Initialite the api handling.
	 * 
	 * @param port The port the server should listen on.
	 */
	private initApi(port: number): void {
		//
		const app = express();

		const api = Container.get(ApiService);
		app.get('/api/*', api.handle);

		const gossip = Container.get(GossipService);
		app.get('/gossip/*', gossip.handle);

		app.listen(port, '0.0.0.0');
	}

	/**
	 * Initialise the cli handling.
	 */
	private initCli(): void {
		//
		const cli = Container.get(CliService);
		const rl = readline.createInterface({
			'input': process.stdin,
			'output': process.stdout,
		});

		const ask = () => rl.question(
			'\x1b[0mtritium> ',
			(command) => {
				cli.handle(command);
				ask();
			}
		);

		cli.start(console);
		ask();
	}

	/**
	 * Tick tock.
	 */
	private tick(): void {
		//
		const gossip = Container.get(GossipService);
		gossip.doGossip();

		const consensus = Container.get(ConsensusService);
		consensus.doConsensus();
	}
}