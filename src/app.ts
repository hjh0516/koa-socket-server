import Koa from 'koa';
import Router from 'koa-router';

const app = new Koa();
const router = new Router();

app.listen(4000, () => {
  console.log('listening to port 4000');
});
