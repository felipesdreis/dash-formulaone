import F1TelemetryClient from "f1-2021-udp";
import http from "http"

const client = new F1TelemetryClient.F1TelemetryClient();


// client.on('motion', function (data) {
//     //console.log('data');
//     console.log(data.m_speed);
// })

client.on('carTelemetry', function (data) {
    //console.log('carTelemetry');
    // console.log(data.m_carTelemetryData[0].m_speed);
    let speed = data.m_carTelemetryData[0].m_speed
    let rpm = data.m_carTelemetryData[0].m_engineRPM
    let gear = data.m_carTelemetryData[0].m_gear

    http.get(`http://localhost:1880/formula?speed=${speed}&rpm=${rpm}&gear=${gear}`, (resp) => {
        let data = '';
        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(JSON.parse(data).explanation);
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
})


client.start();