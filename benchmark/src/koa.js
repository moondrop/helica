const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

router.param('number', (id, ctx, next) => {
    ctx.double = Number(ctx.params.number) * 2;
    return next();
}).get('/random/:number', (ctx) => {
    ctx.body = `Number: ${ctx.params.number} | Double: ${ctx.double}`;
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(28785);
