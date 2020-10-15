<div align="center">
    <img src="https://i.imgur.com/N1XJO2l.jpeg" alt="Helica" width="600" />
</div>

<div align="center">A blazing fast micro web framework made for rapid development of RESTful APIs</div>

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