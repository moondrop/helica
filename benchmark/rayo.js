const rayo = require('rayo');

const app = rayo({ port: 28785 });

const middleware = ((request, response, step) => {
    request.double = Number(request.params.number) * 2;
    step();
});

app.get('/random/:number', middleware, (request, response) => {
    response.end(`Number: ${request.params.number} | Double: ${request.double}`);
});

app.start();
