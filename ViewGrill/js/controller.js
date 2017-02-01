var app = angular.module('myApp', []);
app.controller("myCtrl", function ($scope, $http) {

    $scope.selecData = [];
    $scope.selecValue = "";

    $scope.tableData = [];
    $scope.tableHead = [];

    $scope.dataLabel = "";
    
    $scope.fl = false;
    
    $scope.styleLoader = {
        "text-align": "center"
    };
    $scope.styleTrans = {
        "width": "1px",
        "height": "1px"
    };

    $scope.refreshCombo = function(){
        $scope.uno = "select cardname from ocrd where cardtype = 'c'";
    };
    $scope.refreshLabel = function(value){
        $scope.dos = "select cardcode from ocrd where cardname = '" + value + "'";
    };
    $scope.refreshGrilla = function(value){
        $scope.cinco = "exec [itsm_facturas_por_cliente] '"+value+"'";
    };
    
    $scope.refactor = function(str){
        var result = str.indexOf("'");
        if (result>0){
            var temp = str.substring(0, result+1)+"'";
            var last = str.substring(result+1, str.length);
            var res = $scope.refactor(last);
            return temp+res;
        }else{
            return str;
        }
    };
    
    $scope.refreshCombo();

    //$httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=UTF-8';
    /*
    var req = {
        method: 'POST',
        url: 'http://192.168.0.31:8080/combo/get',
        headers: {
            'Content-Type': 'application/json'
        },
        data: { query: "select cardname from ocrd where cardtype = 'c'" }
    }

    $http(req).then(function(data){
        //var x2js = new X2JS();
        //data2 = x2js.xml_str2json(data);
        //$scope.selecData = data2.COMBO.ELEMENT;
    }, function(data){
        //alert("Error " + data);
    });
    */

    var transformReq = function(data){
        data2 = JSON.stringify(data);
        return data2;
    }

    var transformRes = function(data){
        return data;
    }

    $http.post('http://192.168.0.31:8080/combo/get',
            {
                query: $scope.uno
            },{
                headers: { 'Content-Type': 'application/json; charset=UTF-8'},
                transformRequest: transformReq,
                transformResponse: transformRes
            })
    .success(function (data) {
                var x2js = new X2JS();
                data2 = x2js.xml_str2json(data);
                console.log(data);
                $scope.selecData = data2.COMBO.ELEMENT;
            })
            .error(function (data) {
                alert("Error " + data);
            });


    $scope.send2 = function () {
        
        var strValue = $scope.refactor($scope.selecValue);
        
        $scope.refreshLabel(strValue);

        $http.post("http://192.168.0.31:8080/label/get/",
                {
                    query: $scope.dos
                },{
                    headers: { 'Content-Type': 'application/json; charset=UTF-8'},
                    transformRequest: transformReq,
                    transformResponse: transformRes
                })
                .success(function (data) {
                    var x2js = new X2JS();
                    data2 = x2js.xml_str2json(data);
                    if (typeof data2.LABEL.ELEMENT === "string")
                        $scope.dataLabel = data2.LABEL.ELEMENT;
                    else
                        $scope.dataLabel = data2.LABEL.ELEMENT[0];
                    $scope.send3();
                })
                .error(function (data) {
                    alert("Error " + data);
                });
    };

    $scope.send3 = function () {
        $scope.refreshGrilla($scope.dataLabel);
        $http.post("http://192.168.0.31:8080/grilla/get/",
                {
                    query: $scope.cinco
                },{
                    headers: { 'Content-Type': 'application/json; charset=UTF-8'},
                    transformRequest: transformReq,
                    transformResponse: transformRes
                })
                .success(function (data) {
                    var x2js = new X2JS();
                    var data2 = x2js.xml_str2json(data);
                    
                    $scope.tableData = data2.GRILL.ROW;
                    $scope.tableHead = data2.GRILL.NAME;
                    
                    try{
                        if (data2.GRILL.ROW.length === undefined)
                            $scope.tableData = new Array(data2.GRILL.ROW);
                    }catch(err) {
                        console.log(err);
                    }
                    
                    try {
                        var temp = $scope.tableData;
                        for (var i = 0; i < temp.length; i++) {
                            for (var j = 0; j < $scope.tableHead.length; j++) {
                                if (temp[i][$scope.tableHead[j]].length !== undefined)
                                    temp[i][$scope.tableHead[j]] = temp[i][$scope.tableHead[j]][0];
                            }
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    
                    $scope.imgLoaderDown();
                    console.timeEnd("TimerName");
                })
                .error(function (data) {
                    alert("Error " + data);
                });
    };

    $scope.sendInformation = function () {
        console.time("TimerName");
        var fl = $scope.selecValue === "";
        if (fl)
            return;
        $scope.tableData = [];
        $scope.tableHead = [];
        $scope.imgLoaderUp();
        $scope.send2();
    };

    $scope.imgLoaderUp = function(){
        $scope.fl = true;
    };
    $scope.imgLoaderDown = function(){
        $scope.fl = false;
    };
});