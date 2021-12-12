import { ApiService, GossipService } from './services';
import Container from 'typedi';
import env from './config/env';
import express from 'express';

export const server = (): void => {
	//
	const app = express();

	const api = Container.get(ApiService);
	app.get('/api/*', api.handle);

	const gossip = Container.get(GossipService);
	app.get('/gossip/*', gossip.handle);

	app.listen(+env.node.port, env.node.ip);
};