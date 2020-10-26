import { opine } from 'https://deno.land/x/opine@0.25.0/mod.ts'; // eslint-disable-line import/extensions

const app = opine();

app.use('/random/:number', (request, response, next) => {
    request.double = Number(request.params.number) * 2;
    next();
});

app.get('/random/:number', (request, response) => {
    response.end(`Number: ${request.params.number} | Double: ${request.double}`);
});

app.listen(28785);
