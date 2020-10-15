<div align="center">
    <img src="https://i.imgur.com/N1XJO2l.jpeg" alt="Helica" width="600" />
</div>

<div align="center">A blazing fast micro web framework made for rapid development of RESTful APIs</div>

<br />

<div align="center">
    <a href="https://github.com/xojs/xo">
        <img src="https://img.shields.io/badge/code%20style-xo-5ed9c7?style=for-the-badge" alt="Code Style: XO">
    </a>
    <a href="#">
        <img src="https://img.shields.io/badge/license-MIT-ed184e?style=for-the-badge" alt="MIT License">
    </a>
    <a href="#">
        <img src="https://img.shields.io/badge/npm-no%20release-ed184e?style=for-the-badge" alt="MIT License">
    </a>
</div>

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