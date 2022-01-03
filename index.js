const express = require('express')
const http = require("http")
const F1TelemetryClient = require("f1-2021-udp")
const { Server } = require("socket.io");

const app = express()
const server = http.createServer(app)
const io = new Server(server);

// variavel global
// id do piloto
var driverID = 0



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

    let speed = data.m_carTelemetryData[driverID].m_speed
    let gear = data.m_carTelemetryData[driverID].m_gear
    let rpm = data.m_carTelemetryData[driverID].m_engineRPM

    sendToFront(speed, gear, rpm)
})

// inicia o listener do jogo
client.start();

// inicia servidor express
server.listen(3000, () => {
    console.log('listening on *:3000');
});

// unit test
// function getRandomIntInclusive(min, max) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1)) + min;
//   }

// setInterval(() => {
//     let rpm = getRandomIntInclusive(1000,13000)
//     console.log(rpm);
//     sendToFront(230,5,rpm)
// }, 20);


// Print Local IP
var ifaces = require('os').networkInterfaces();
var adresses = Object.keys(ifaces).reduce(function (result, dev) {
  return result.concat(ifaces[dev].reduce(function (result, details) {
    return result.concat(details.family === 'IPv4' && !details.internal ? [details.address] : []);
  }, []));
});
console.log(`IP Local: ${adresses}`)

//busca o id do piloto
client.on('participants',function(data) {
    driverID = data.m_header.m_playerCarIndex
})


