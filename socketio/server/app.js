// socket.io
const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const {nanoid} = require('nanoid');
const portWebSocket = 3001
const appWebSocket = express();
const server = createServer(appWebSocket);

server.listen(portWebSocket, () => {
    console.log(`WebSocket server listening at port:${portWebSocket}`);
})

var messages = {}
const io = new Server(server, {
    transports: ['websocket'], // done to avoid the initial long polling done by socket.io
    cors: { // handling cors errors
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`New user logged in with id ${socket.id}`);

    socket.on('sendMessage', (data) => {
        const dataWithId = {
            ...data,
            messageId: nanoid()
        }
        messages[data.roomId] = messages[data.roomId] || [];
        messages[data.roomId].push(dataWithId);
        console.log(`User: ${data.username} at Room: ${data.roomId} has sent the message '${data.message}'`);
        io.to(data.roomId).emit('roomMessage', dataWithId);
    });

    socket.on('send-typing-indicator', ({roomId, username}) =>{
        io.to(roomId).emit('server-sending-indicator', {roomId, username});
    })

    socket.on('joinRoomExclusively', (room) => {
        console.log(`Socket: ${socket.id} requested to join Room: ${room}`);
        if (room >= 1 && room <= 50) {
            socket.rooms.forEach((currentRoom) => {
                    socket.leave(currentRoom);
            })
            socket.join(room);
            const currentRoomMessages = messages[room] || []
            for(const message of currentRoomMessages){
                socket.emit('roomMessage', message);
            }
            console.log(`Socket: ${socket.id} joined Room: ${room}`);
            socket.emit('success-joining-room', `You joined the room ${room} successfuly`)
        }
        else{
            socket.emit('error-joining-room', 'Room doesn\'t exist')
        }
    })


});
