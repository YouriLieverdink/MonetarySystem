import express from 'express';
import config from './config';
import { useGossip } from './services/gossip';
import { Message } from './types/message';

const app = express();
const gossip = useGossip();

app.use(express.json());

app
	.post('/state', (req, res) => {
		// Register the message.
		gossip.handle(req.body);

		res.status(200).end();
	});

const server = app
	.listen(config.port)
	.on('listening', () => {

		console.log(`Listening on port ${config.port}`);
	})
	.on('error', (err) => {
		// An error occured whilst listening.
		console.error('Unable to listen', err);
	});

export { server, gossip };
