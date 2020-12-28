const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const fs = require('fs');
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});
const path = require('path');
const database = require('./common/database.js');
const { Config, setDomain } = require('./common/config.js');

const indexPath = path.join(__dirname, 'index.html');

// Home routing
let router = new Router();
router.get('/', (ctx) => {
  ctx.response.type = 'html';
  ctx.response.body = fs.createReadStream(indexPath);
});

router.get('/chat/:domain/:user_id', async (ctx) => {
  setDomain(ctx.params.domain);
  const qry = `SELECT id FROM users WHERE user_id = ?;`;
  const condition = [ctx.params.user_id];

  let result = await database.excutReader(qry, condition).then((res) => {
    console.log(res);
    if (!res) {
      return false;
    } else {
      console.log('exists');
      const user_id = res[0].id;

      const qry = `
        SELECT id FROM chat_lists
        WHERE user_id = ? AND status <> 3 
        ORDER BY id desc LIMIT 1;
        `;
      const condition = [res[0].id];
      return database.excutReader(qry, condition).then((res) => {
        console.log(res);
        if (!res) {
          console.log('create new list');

          const qry = `INSERT INTO chat_lists 
    (chat_status, last_chat_id, user_id, account_id, first_account_id) 
    VALUES (0, 0, ?, 0, 0);
    `;

          const condition = [user_id];

          return database.excutNonQuery(qry, condition, true).then((res) => {
            
            return res.insertId;
          });
        } else {
          console.log('exists');
          return res[0].id;
        }
      });
    }
  });
  if (result == false) {
    ctx.throw(404);
  } else {
    console.log('redirect');
    console.log(result);
    ctx.redirect('https://naver.com/' + result);
  }
});
app.use(router.routes());

io.of('/test').on('connection', (socket) => {
  console.log('connected');
  socket.on('chat', (msg) => {
    console.log('message: ' + JSON.stringify(msg));

    if (msg.sender_type == "2") {
      socket.broadcast.to(msg.domain+'/'+msg.chat_list_id).emit('chat', msg);
    }
    socket.broadcast.to(msg.domain).emit('chat', msg);

    setDomain(msg.domain);

    const qry = `INSERT INTO chats 
        (seq, chat_list_id, user_id, account_id, sender_type, message_type, message_contents) 
        SELECT IFNULL(c.seq, 0) + 1, cl.id, cl.user_id, cl.account_id, ?, ?, ?
        FROM chat_lists cl
          LEFT OUTER JOIN chats c ON c.id = cl.last_chat_id
        WHERE cl.id = ?;

        UPDATE chat_lists SET last_chat_id = LAST_INSERT_ID() WHERE id = ?;
        `;

    const condition = [
      msg.sender_type,
      msg.message_type,
      msg.message_contents,
      msg.chat_list_id,
      msg.chat_list_id,
    ];

    database.excutNonQuery(qry, condition, true).then((res) => {
      socket.emit('chat', msg);
    });
    // io.sockets.in('domain').emit('chat message', msg);
  });

  socket.on('setRead', (msg) => {
    setDomain(msg.domain);
    console.log('set read ' + msg);
    const qry = `UPDATE chat SET read = 1 WHERE chat_list_id = ? and sender_type = ?`;

    const conditions = [msg.chat_list_id, msg.sender_type];

    database.excutNonQuery(qry, condition, true).then((res) => {
      console.log('read updated');
    });
  });
  socket.on('setChannel', (channel) => {
    socket.join(channel);
    console.log('set channel ' + channel);
  });
  socket.on('leaveChannel', (channel) => {
    socket.leave(channel);
    console.log('leave channel ' + channel);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
server.listen(3000, () => {
  console.log('listening on *:3000');
});
