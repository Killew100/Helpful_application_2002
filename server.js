var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var clk = require('chalk');
var bodyParser = require('body-parser');
var cors = require('cors');
var readline = require('readline');
var getVideoId = require('get-video-id');
var fetchVideoInfo = require('youtube-info');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(cors());
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
app.options('*', cors());
var current = null;
var playlist = [];

app.get('/player', function (req, res) {
    res.sendFile(__dirname + '/player.html');
});

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
class Timer {
    constructor(name) {
        this.running = false;
        this.name = name;
        this.display = "00:00:00";
        this.reset();
        this.print(this.times);
    }

    reset() {
        this.times = [ 0, 0, 0 ];
        this.stop();
    }

    start() {
        console.log("started");
        if (!this.time) this.time = Date.now();
        if (!this.running) {
            this.running = true;
            setImmediate(this.step.bind(this));
        }
    }
    stop() {
        console.log(this.times);
        this.running = false;
        this.time = null;
    }

    step(timestamp) {
        if (!this.running) return;
        this.calculate(timestamp);
        this.time = timestamp;
        this.print(this.times);
        (this.step.bind(this));
    }

    calculate(timestamp) {
        var diff = timestamp - this.time;
        // Hundredths of a second are 100 ms
        this.times[2] += diff / 1000;
        // Seconds are 100 hundredths of a second
        if (this.times[2] >= 60) {
            this.times[1] += 1;
            this.times[2] -= 60;
        }
        // Minutes are 60 seconds
        if (this.times[1] >= 60) {
            this.times[0] += 1;
            this.times[1] -= 60;
        }
    }
    print() {
        this.display = Timer.format(this.times);
    }

    static format(times) {
        return `${pad0(times[0], 2)}:${pad0(times[1], 2)}:${pad0(Math.floor(times[2]), 2)}`;
    }
}

function pad0(value, count) {
    var result = value.toString();
    for (; result.length < count; --count)
        result = '0' + result;
    return result;
}

io.on('connection', function (socket) {
    socket.on('add', function (url) {
        var car = new Timer(url);
        if (car !== undefined) {
            console.log(clk.blue('Lisan auto: ') + clk.blue.bold(car.name));
            playlist.push(car);
            }
        updateInfo(io);
    });
    socket.on('remove', function (index) {
        console.log(clk.red('Eemaldan auto: ') + clk.red.bold(playlist[index]));
        playlist.splice(index, 1);
        updateInfo(io);
    });
    socket.on('starting', function (item) {
        console.log(item);
        playlist[item].start();
    });
    socket.on('stopping', function (item) {
        console.log(item);
        playlist[item].stop();
    });
});
function updateInfo(target) {
    var prettyPlaylist = playlist.concat();
    var counter = 0;
    if (playlist.length > 0) {
        prettyPlaylist.forEach(function (item, index, array) {
                counter++;
                if (counter === playlist.length) {
                    target.emit('list', prettyPlaylist);
                }
            });
    } else {
        target.emit('list', []);
    }

}

app.use('/client', express.static(path.join(__dirname + '/client')));

http.listen(1337, function () {
    console.log(clk.green.bold('listening on *:' + 1337));
});
