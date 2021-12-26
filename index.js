const express = require('express')
const http = require("http")
const F1TelemetryClient = require("f1-2021-udp")
const { Server } = require("socket.io");

const app = express()
const server = http.createServer(app)
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})
// arquivos estaticos
app.use('/static', express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('Front-End conectado');
    socket.on('disconnect', () => {
        console.log('Front-End Disconectado');
      });
});

function sendToFront(speed, gear, rpm) {
    io.emit('dash', { speed: speed, gear: gear, rpm: rpm });
}


// UDP listener e parser do jogo f1 2021
const client = new F1TelemetryClient.F1TelemetryClient();
client.on('carTelemetry', function (data) {

    let speed = data.m_carTelemetryData[0].m_speed
    let gear = data.m_carTelemetryData[0].m_gear
    let rpm = data.m_carTelemetryData[0].m_engineRPM   

    sendToFront(speed, gear, rpm)
})


// inicia o listener do jogo
client.start();

// inicia servidor express
server.listen(3000, () => {
    console.log('listening on *:3000');
});


