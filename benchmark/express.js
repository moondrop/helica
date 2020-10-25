const express = require('express');

const app = express();

const middleware = ((request, response, next) => {
    request.double = Number(request.params.number) * 2;
    next();
});

app.get('/random/:number', middleware, (request, response) => {
    response.end(`Number: ${request.params.number} | Double: ${request.double}`);
});

app.listen(28785);
