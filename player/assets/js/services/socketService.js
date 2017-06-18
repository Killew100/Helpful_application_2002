app.factory("socketService", ["socketFactory", function(socketFactory) {

    var myIoSocket = io.connect("192.168.1.133:1337");

    return socketFactory({
        ioSocket: myIoSocket
    });
}]);