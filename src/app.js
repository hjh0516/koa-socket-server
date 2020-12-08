var Koa = require('koa');
var app = new Koa();
const Router = require('koa-router');
const fs = require('fs');
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });
const path = require('path');
const cors = require('@koa/cors');

const indexPath = path.join(__dirname, 'index.html');

app.use(cors({ origin: "*" }));
// Home routing
let router = new Router();
router.get('/', ctx => {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream(indexPath);
});
app.use(router.routes());
// socket connection
io.of('/test')
.on('connection', (socket) => {
  console.log('connected');
    socket.on('chat message', (msg) => {
        console.log('message: '+msg);
        // io.of('/test').emit('chat message', msg);
        socket.broadcast.to('domain').emit('chat message', msg);
        //io.sockets.in('domain').emit('chat message', msg);
    });
    socket.on('chat', (msg) => {
        console.log('message2: '+msg);
        // io.of('/test').emit('chat message', msg);
        socket.broadcast.to('domain2').emit('chat message', msg);
        //io.sockets.in('domain').emit('chat message', msg);
    });
    socket.on('setChannel', (channel) => {
      socket.join(channel);
        console.log('set channel '+channel);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
// Monitor port
server.listen(3000, () => {
    console.log('listening on *:3000');
});