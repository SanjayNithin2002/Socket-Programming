const ws = new WebSocket('ws://localhost:3001');
const ul = document.getElementById('messages');
const btn = document.getElementById('submit-btn');
const statusElement = document.getElementById('status');

btn.addEventListener('click', () => {
    const inputText = document.getElementById('text-message').value;
    ws.send(JSON.stringify({
        text: inputText,
        timestamp: Date.now()
    }));
    statusElement.innerHTML = `JUST SENT A MESSAGE at ${new Date().toLocaleTimeString()}`;
})
ws.addEventListener('open', () => {
    statusElement.innerText = "READY";
});

ws.addEventListener('close', () => {
    statusElement.innerText = "CLOSED";
});

ws.addEventListener('message', (event) => {
    statusElement.innerHTML = `JUST RECEIVED A MESSAGE at ${new Date().toLocaleTimeString()}`;
    const li = document.createElement('li');
    const json = JSON.parse(event.data);
    li.innerText = `Data: ${json.text} ; Timestamp: ${json.timestamp}`;
    ul.appendChild(li);
});

ws.addEventListener('error', (error) => {
    const li = document.createElement('li');
    li.innerText = "WebSocket Connection failed.";
    ul.appendChild(li);
});