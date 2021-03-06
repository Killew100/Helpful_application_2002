app.controller("clientController", ["$q", "$scope", "$filter", "socketService",
    function ($q, $scope, $filter, socketService) {
        var socket = socketService;
        $scope.list = [];
        $scope.new = "";

        socket.on("list", function (list) {
            $scope.list = list;
        });
        $scope.add = function () {
            $scope.new = $scope.new.toUpperCase();
            var i = $scope.list.length;
            var count = true;
            while (i--) {
                if ($scope.list[i].name === $scope.new) {
                    count = false;
                }
            }
            if ($scope.new !== "" && count) {
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
