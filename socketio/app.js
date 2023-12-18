const express = require('express');
const app = express();
const port = 3000
app.use(express.static('./public'));

app.listen(port, () => {
    console.log(`Express server listening at port:${port}`);
});


// socket.io

const { Server } = require('socket.io');
const { createServer } = require('http');
const portWebSocket = 3001
const appWebSocket = express();
const server = createServer(appWebSocket);
server.listen(portWebSocket, () => {
    console.log(`WebSocket server listening at port:${portWebSocket}`);
})

const io = new Server(server, {
    transports: ['websocket'], // done to avoid the initial long polling done by socket.io
    cors: { // handling cors errors
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('New user logged in');
    socket.on('talk-to-server', async (message, callback) => {
        console.log(`Got a message for server: ${message} at ${new Date().toLocaleTimeString()}`);
        // socket.broadcast.emit('talk-to-client', `You said: ${message}`); to broadcast to all other client from a client.
        await io.timeout(1000).emitWithAck('talk-to-client', `You said: ${message}`) // to broadcast to all clients from the server.
        callback('Done ma.');
    });

    socket.on('toggleRoom', (room) => {
        if (room !== 'Room1' && room !== 'Room2') {
            socket.emit("Room doesn't exist.");
            return;
        }
        if(socket.rooms.has(room)){
            socket.leave(room);
        }else{
            socket.join(room);
        }
    })

    setInterval(() => {
        io.to('Room1').emit('talk-to-client', { message: `Server pining Room-1 at ${new Date().toLocaleTimeString()}`, roomId: 'room-1' });
        io.to('Room2').emit('talk-to-client', { message: `Server pining Room-2 at ${new Date().toLocaleTimeString()}`, roomId: 'room-2' });
    }, 1000)

});

