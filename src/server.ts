import env from './config/env';
import express from 'express';

export const server = (): void => {
	//
	const app = express();

	app.listen(+env.node.port, env.node.ip);
};