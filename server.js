var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var clk = require('chalk');
var bodyParser = require('body-parser');
var cors = require('cors');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(cors());
app.options('*', cors());
var playlist = [];
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('mydb.sqlite');
var read = true;
Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};
function Timer(name, one, two, three) {
    this.running = false;
    this.name = name;
    this.display = "00:00:00";
    this.times = [ one, two, three];
    this.stop();
    this.print(this.times);
    updateInfo(io);

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
        if (car.times[2] >= 60) {
            car.times[1] += 1;
            car.times[2] -= 60;
        }
        if (car.times[1] >= 60) {
            car.times[0] += 1;
            car.times[1] -= 60;
        }
        car.print(car.times);
        updateInfo(io);
        db.run("UPDATE car SET hour = ?, minute = ?, second = ? WHERE name = ?", [car.times[0], car.times[1], car.times[2], car.name]);
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
    updateInfo(socket);
    socket.on('add', function (url) {
        var car = new Timer(url, 0, 0, 0);
        if (car !== undefined) {
            console.log(clk.blue('Lisan auto: ') + clk.blue.bold(car.name));
            playlist.push(car);
            db.run("INSERT into car(name, hour, minute, second) VALUES (?, ?, ?, ?)", [url, 0, 0, 0])
            }
        updateInfo(io);
    });
    socket.on('remove', function (index) {
        console.log(clk.red('Eemaldan auto: ') + clk.red.bold(playlist[index].namee));
        db.run("DELETE FROM car WHERE name = ?", [playlist[index].name]);
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

app.use('/player', express.static(path.join(__dirname + '/player')));
app.use('/client', express.static(path.join(__dirname + '/client')));
db.run("CREATE TABLE IF NOT EXISTS car (id INTEGER PRIMARY KEY AUTOINCREMENT" +
    ", name STRING, hour INTEGER, minute INTEGER, second INTEGER)");
db.all('SELECT * FROM car ORDER BY id ASC', function (err, rows) {
    if(rows !== undefined){
        rows.forEach(function (row) {
            var car = new Timer(row.name, row.hour, row.minute, row.second);
            playlist.push(car);
        });
    }
    http.listen(1337, function () {
        console.log(clk.green('Listening on port 1337'));
    });
});