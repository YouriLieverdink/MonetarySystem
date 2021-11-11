const server = require('express')();

server.get('/', (request, response) => {

	return response.send(`Hi, ${request.headers.host}`);
});

server.listen(3001);