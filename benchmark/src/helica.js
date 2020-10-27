const Helica = require('helica');
const app = new Helica.Server({ sslApp: false, debug: false });

app.addMiddleware(async (response, request) => {
    request.double = Number(request.parameters.number) * 2;
});

class RandomNumber {
    get(response, request) {
        response.end(`Number: ${request.parameters.number} | Double: ${request.double}`);
    }
}

app.addResource('/random/:number', RandomNumber);
app.run();
