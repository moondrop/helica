const polka = require('polka');

const app = polka();

app.use((request, response, next) => {
    request.double = Number(request.params.number) * 2;
    next();
});

app.get('/random/:number', (request, response) => {
    response.end(`Number: ${request.params.number} | Double: ${request.double}`);
});

app.listen(28785);
