const socket = io('ws://localhost:3001', {
    transports: ['websocket'], // informing client that don't use long polling and stick to WebSocket
});

socket.on('talk-to-client', (message) => {
    const li = document.createElement('li');
    li.innerText = `${message.message} at ${new Date().toLocaleTimeString()}`
    document.getElementById(message.roomId).appendChild(li);
    document.getElementById('status').innerText = "Just Received a message";
});

document.getElementById('submit-btn').addEventListener('click', async (event) => {
    const inputValue = document.getElementById('text-message').value; 
    await socket.timeout(1000).emitWithAck('talk-to-server', inputValue);
    document.getElementById('status').innerText = "Just Sent a message"
})

document.getElementById('toggle-room-1').addEventListener('click', (event) => {
    socket.emit('toggleRoom', 'Room1');
})

document.getElementById('toggle-room-2').addEventListener('click', (event) => {
    socket.emit('toggleRoom', 'Room2');
})

