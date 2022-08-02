const express = require('express')
const pconf = require('./package.json');
const http = require("http")
const F1TelemetryClient = require("f1-2021-udp")
const { Server } = require("socket.io");

const app = express()
const server = http.createServer(app)
const io = new Server(server);

// variaveis global
// id do piloto
var driverID = 0
var fiaFlags = 0



app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})
// arquivos estaticos
app.use('/static', express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log(`Dash conectado ==> ${socket.handshake.headers['user-agent'].match(/\([^)]*\)/g)}`);
    socket.on('disconnect', () => {
        console.log('Dash Disconectado');
    });
});

function sendToFront(speed, gear, rpm, drs) {
    io.emit('dash', { speed: speed, gear: gear, rpm: rpm, drs: drs });
}


function sendToFront_lapData(position, lap, laptime) {
    io.emit('lapdata', { p: position, l: lap, laptime: laptime, fia_flag: fiaFlags });
}



// UDP listener e parser do jogo f1 2021
const client = new F1TelemetryClient.F1TelemetryClient();
client.on('carTelemetry', function (data) {

    let speed = data.m_carTelemetryData[driverID].m_speed
    let gear = data.m_carTelemetryData[driverID].m_gear
    let rpm = data.m_carTelemetryData[driverID].m_engineRPM
    let drs = data.m_carTelemetryData[driverID].m_drs
    let revLight = data.m_carTelemetryData[driverID].m_revLightsPercent

    sendToFront(speed, gear, revLight, drs)
})

client.on('lapData', function (data) {

    function millisToMinutesAndSeconds(duration) {
        var milliseconds = Math.floor((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return  minutes + ":" + seconds + "." + milliseconds
    }

    let position = data.m_lapData[driverID].m_carPosition
    let lap = data.m_lapData[driverID].m_currentLapNum
    let lapTime = millisToMinutesAndSeconds(data.m_lapData[driverID].m_lastLapTimeInMS)

    sendToFront_lapData(position, lap, lapTime)
})

client.on('carStatus', function (data) {
    fiaFlags = data.m_carStatusData[driverID].m_vehicleFiaFlags
})
// inicia o listener do jogo
client.start();

// inicia servidor express
server.listen(3000, () => {
    console.log(`Version: ${pconf.version}`);
    console.log('Ativo na porta *:3000');    
});

// unit test start
// function getRandomIntInclusive(min, max) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// setInterval(() => {

//     let rpm = getRandomIntInclusive(0, 14)
//     let drs = getRandomIntInclusive(0, 1)
//     let speed = getRandomIntInclusive(0, 330);
//     let gear = getRandomIntInclusive(0, 8)

//     let position = getRandomIntInclusive(1, 22)
//     let lap = getRandomIntInclusive(0, 36)
//     let lapTime = getRandomIntInclusive(100,300)

//     sendToFront(speed, gear, rpm, drs)
//     sendToFront_lapData(position, lap, lapTime)
//     fiaFlags = getRandomIntInclusive(0,4)

// }, 5000);
// unit test end

// Print Local IP
const {networkInterfaces} = require('os')
const nets = networkInterfaces()
let IPv4_nets = []

Object.entries(nets).forEach( ([key,netGroup]) => {
    netGroup.forEach(net =>{
        if (net.family == "IPv4"){
            IPv4_nets.push({nome:key,IP:net.address})
        }
    })
});

console.table(IPv4_nets)
console.log('Abra no navegador do celular ou tablet o ip acima na porta :3000 👆');

//busca o id do piloto
client.on('participants', function (data) {
    driverID = data.m_header.m_playerCarIndex
})


