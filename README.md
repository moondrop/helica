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
    <a href="https://www.npmjs.com/package/helica">
        <img src="https://img.shields.io/npm/v/helica?color=ed184e&style=for-the-badge" alt="npm Release">
    </a>
</div>

## About
Helica is an incredibly fast and highly performant web framework made for rapid development of RESTful APIs and minimalistic server-side rendered web applications.

Helica follows a fully object-oriented approach to creating a beautifully simple yet incredibly powerful architecture that allows developers to rapidly build highly demanding APIs, server-side rendered web applications and various other applications that require assets to be served to the web.

Routes are handled by ***resource handlers***, which are JavaScript classes including methods corresponding to the HTTP methods they should handle for the registered route. This allows for incredibly fast and easy development of clean, easy to follow, maintainable and reusable code.

## Intentions
While many other web frameworks for Node.js are *already* very fast in themselves, they're inherently bottlenecked by using the native Node.js HTTP server. Helica is built on top of a [custom HTTP server](https://github.com/uNetworking/uWebSockets.js/) written entirely in C++ in conjunction with highly optimized v8 bindings. 

This translates to **up to 300% the speed** of the native Node.js HTTP server excluding the use of any framework and **up to 500% the speed** of popular solutions like Express.

A full benchmarking suite including exact results and used code can be found [here](/benchmark).

## Installing
Installing Helica is as easy as typing

```
❯ npm install helica
```

> <br /> **Warning!** <br /><br />Running Helica via Yarn is **not supported** as Yarn lacks the capability of forwarding SIGINT events to the underlying process, thus breaking graceful shutdowns! Use at your own risk!<br />&nbsp;

## Documentation
A full documentation can be found at [helica.moondrop.io](https://helica.moondrop.io)

## Getting Started
Getting started with Helica is as simple as initiating a new project, installing Helica as depcited above and adding an `index.js` file with following contents:

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

## License
This repository makes use of the [MIT License](https://opensource.org/licenses/MIT) and all of its correlating traits.
