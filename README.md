# Helica

Helica is a blazing fast micro web framework made for rapid development of RESTful APIs

## Installing
```
npm i moondrop/helica
```

## Getting Started Example:

```js
const Helica = require('helica');
const app = new Helica.Server({ sslApp: false, debug: true });

class HelloWorld {
    get(response, request) {
        response.end('Hello World!');
    }
}

app.addResource('/', HelloWorld);
app.run();
```