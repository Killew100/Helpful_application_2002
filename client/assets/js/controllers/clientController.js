app.controller("clientController", ["$q", "$scope", "$filter", "socketService",
    function ($q, $scope, $filter, socketService) {
        var socket = socketService;
        $scope.list = [];
        $scope.new = "";

        socket.on("list", function (list) {
            $scope.list = list;
        });
        $scope.add = function () {
            if ($scope.new !== "") {
                socket.emit("add", $scope.new);
            }
            $scope.new = "";
        };
        $scope.remove = function (index) {
            socket.emit("remove", index);
        };
        $scope.stop = function (item) {
            socket.emit("stopping", item);
        };
        $scope.start = function (item) {
            socket.emit("starting", item);
        };
        $scope.reset = function (item) {
            socket.emit("reseting", item);
        };
    }]);
