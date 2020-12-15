const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const fs = require('fs');
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  });
const path = require('path');
const database = require('./common/database.js');
const { Config, setDomain } = require('./common/config.js');

const indexPath = path.join(__dirname, 'index.html');

// Home routing
let router = new Router();
router.get('/', ctx => {
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream(indexPath);
});
app.use(router.routes());

io.of('/test')
.on('connection', (socket) => {
  console.log('connected');
    socket.on('chat', (msg) => {
        console.log('message: '+JSON.stringify(msg));

        socket.broadcast.to(msg.domain).emit('chat', msg);

        setDomain(msg.domain);

        const qry = `INSERT INTO chats 
        (seq, chat_list_id, user_id, account_id, sender_type, message_type, message_contents) 
        SELECT c.seq + 1, cl.id, cl.user_id, cl.account_id, ?, ?, ?
        FROM chat_lists cl
          LEFT OUTER JOIN chats c ON c.id = cl.last_chat_id
        WHERE cl.id = ?;

        UPDATE chat_lists SET last_chat_id = LAST_INSERT_ID() WHERE id = ?;
        `;

        const condition = [msg.sender_type, msg.message_type, msg.message_contents, msg.chat_list_id, msg.chat_list_id];

        database.excutNonQuery(qry, condition).then((res) => {
          socket.emit('chat', msg);
        });
        // io.sockets.in('domain').emit('chat message', msg);
    });
    socket.on('setChannel', (channel) => {
        socket.join(channel);
        console.log('set channel '+channel);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});