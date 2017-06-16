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
function Timer(name) {
    this.running = false;
    this.name = name;
    this.display = "00:00:00";
    this.times = [ 0, 0, 0 ];
    this.stop();
    this.print(this.times);
}
Timer.prototype.reset = function () {
        this.times = [ 0, 0, 0 ];
        this.print(this.times);
        this.stop();
    };

Timer.prototype.start = function(car) {
        if (!car.running) {
            car.running = true;
            setTimeout(function(){
                    car.step(car)},
                1000);
        }
    };
Timer.prototype.stop = function() {
        this.running = false;
        updateInfo(io);
    };

Timer.prototype.step = function(car) {
        if (!car.running) return;
        car.times[2] += 1;
        // Seconds are 100 hundredths of a second
        if (car.times[2] >= 60) {
            car.times[1] += 1;
            car.times[2] -= 60;
        }
        // Minutes are 60 seconds
        if (car.times[1] >= 60) {
            car.times[0] += 1;
            car.times[1] -= 60;
        }
        car.print(car.times);
        updateInfo(io);
        setTimeout(function(){
            car.step(car) },
            1000);
    };

Timer.prototype.print = function() {
        this.display = this.format(this.times);
    };

Timer.prototype.format = function(times) {
        return `${pad0(times[0], 2)}:${pad0(times[1], 2)}:${pad0(Math.floor(times[2]), 2)}`;
    };

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
        var x = playlist[item];
        x.start(x);
    });
    socket.on('stopping', function (item) {
        playlist[item].stop();
    });
    socket.on('reseting', function (item) {
        playlist[item].reset();
    });
});
function updateInfo(target) {
    target.emit('list', playlist);
}

app.use('/client', express.static(path.join(__dirname + '/client')));

http.listen(1337, function () {
    console.log(clk.green.bold('listening on *:' + 1337));
});
