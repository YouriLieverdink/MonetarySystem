import express from 'express';
import config from './config';

const server = express();

server
	.get('/', (request, response) => {
		// Send back a respone with the host.
		response.send(`Hi, ${request.headers.host}`);
	});

server
	.listen(config.express.port)
	.on('error', (err) => {
		// An error occured whilst listening.
		console.error('Unable to listen', err);
	});