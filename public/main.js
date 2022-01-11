const zeroPad = (num, places) => String(num).padStart(places, '0')
var socket = io();
var speed = document.getElementById('speed')
var gear = document.getElementById('gear')
var lap = document.getElementById('lap')
var laptime = document.getElementById('laptime')
var position = document.getElementById('position')
//var rpm = document.getElementById('rpm')

socket.on('dash', function (cardata) {
    //velocidade
    speed.textContent = `KM/H: ${zeroPad(cardata.speed, 3)}`
    //RPM
    lightLeds(cardata.rpm)
    //Marcha
    let cargear = cardata.gear
    switch (cargear) {
        case 0:
            gear.textContent = 'N'
            break
        case -1:
            gear.textContent = 'R'
            break
        default:
            gear.textContent = cargear
            break;
    }

    if (cardata.drs == 1) {
        document.getElementById('drs').style.backgroundColor = "#2AFA06"
        document.getElementById('drs').textContent = 'DRS ON'
    } else {
        document.getElementById('drs').style.backgroundColor = "black"
        document.getElementById('drs').textContent = 'DRS OFF'
    }


});

socket.on('lapdata', function (lapdata) {

    position.textContent = `P${lapdata.p}`
    lap.textContent = `V${lapdata.l}`
    laptime.textContent = lapdata.laptime

});

const dictionaryLeds = {
    led1: '#FF2121',
    led2: '#FF2121',
    led3: '#FF2121',
    led4: '#FF2121',
    led5: '#013FFA',
    led6: '#013FFA',
    led7: '#013FFA',
    led8: '#013FFA',
    led9: '#013FFA',
    led10: '#2AFA06',
    led11: '#2AFA06',
    led12: '#2AFA06',
    led13: '#FFEE00'
}

/**
 * Função para acender as luzes REV LIGHTS
 *
 * @param {*} rpm 0 -> 14 RPM
 */
function lightLeds(rpm) {

    if (rpm > 90) {
        document.body.style.backgroundColor = "#6801DB";
    } else {
        document.body.style.backgroundColor = "black";
    }

    let numLeds = 13
    let intRpm = parseInt(rpm *0.13)
    //liga o que for menor
    for (let index = intRpm; index > 0; index--) {
        let light = `led${index}`
        console.log("FSDR ~ lightLeds ~ light ON", light)
        document.getElementById(light).style.backgroundColor = dictionaryLeds[light]
        document.getElementById(light).style.boxShadow = `0px 0px 20px ${dictionaryLeds[light]}`
    }
    //desliga o que for maior
    for (let index = intRpm + 1; index <= numLeds; index++) {
        let light = `led${index}`
        console.log("FSDR ~ lightLeds ~ light OFF", light)
        document.getElementById(light).style.backgroundColor = "gray"
        document.getElementById(light).style.boxShadow = `0px 0px 0px black`
    }

}


