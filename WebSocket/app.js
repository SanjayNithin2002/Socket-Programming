// WebSocket block

const {WebSocketServer} = require('ws');
const wss = new WebSocketServer({port: 3001});
console.log("Server listening at 3001");

wss.on('connection', (ws) => {
    ws.on('error', console.error);

    ws.on('message', (data) => {
        ws.send(JSON.stringify({
            text: `You said: ${JSON.parse(data).text}`,
            timestamp: Date.now()
        }));
    });
});
