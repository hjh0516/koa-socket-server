# koa-socket-server
socketio server
## Install

    npm install

## Run the app

    npm start

## Connect To Socket Server

### Connect

`ws://localhost:3000/<service>`

    var socket = io('ws://localhost:3000/test');

### Join Channel

`'setChannel', '<channel>'`

    socket.emit('setChannel', 'test');

## Send Message

### Request
`{
    "domain": <channel>,
    "chat_list_id": <room number>,
    "sender_type": <1: user, 2:counselor, 3:system>,
    "message_type": <1:text, 2:image>,
    "message_contents": <message>
}`

    var msg = {
        "domain": "test",
        "chat_list_id": "1",
        "sender_type": "1",
        "message_type": "1",
        "message_contents": test
    }

    socket.emit('chat',msg);
### Response
`socket.on('chat', function(msg){
    consol.log(msg.message_contents));
});`

`{
    "domain": <channel>,
    "chat_list_id": <room number>,
    "sender_type": <1: user, 2:counselor, 3:system>,
    "message_type": <1:text, 2:image>,
    "message_contents": <message>
}`

    msg = {
        "domain": "test",
        "chat_list_id": "1",
        "sender_type": "1",
        "message_type": "1",
        "message_contents": test
    }