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
var fiaFlags = 0



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
    //console.log(revLight);

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

        return hours + ":" + minutes + ":" + seconds + "." + milliseconds
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
    console.log('listening on *:3000');
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
var ifaces = require('os').networkInterfaces();
var adresses = Object.keys(ifaces).reduce(function (result, dev) {
    return result.concat(ifaces[dev].reduce(function (result, details) {
        return result.concat(details.family === 'IPv4' && !details.internal ? [details.address] : [] + ' -- ');
    }, []));
});
console.log(`IP Local: ${adresses}`)

//busca o id do piloto
client.on('participants', function (data) {
    driverID = data.m_header.m_playerCarIndex
})


