/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false, moment:false, client:false */
/*global copyObject:false, addClass:false, removeClass:false */


window.client = window.client || {} ;     // don't clobber existing client object


// The console.log() messages sprinkled in this file are for instruction and debug.
// If you reuse this code you do not need to include them as part of your app.
// Set to "true" if you want the console.log messages to appear.

client.LOG = true ;
client.consoleLog = function() {       // only emits console.log messages if client.LOG != false
    "use strict" ;
    if( client.LOG ) {
        var args = Array.prototype.slice.call(arguments, 0) ;
        console.log.apply(console, args) ;
    }
} ;

client.initialize = function() {
    "use strict" ;
    var fName = "client.initialize():" ;
    client.consoleLog(fName, "entry") ;

    try {
        client.consoleLog(fName, "try succeeded.") ;
    }
    catch(e) {
        client.consoleLog(fName, "try failed:", e) ;
    }
    client.consoleLog(fName, "exit") ;
};

client.url = 'http://server-dkdbproject.rhcloud.com';

// data for sending
client.speed_data   = ""; // from acc_
client.turns_data   = ""; // from compass
client.defects_data = ""; // from acc_z
client.time_data    = "";
client.lat          = "0";
client.lon          = "0";
client.speed        = "0";
client.zoom         = 0;
client.values       = 0;

// get user position by acceleormeter and compass data
// note: we calculate only diviation from last position
// @app.route("/get_position", methods=['GET'])
// Send:   all w/o defects_data and zoom
// Return: new lat & lon + speed
client.getPosition = function() {
    client.consoleLog("getPostion started");
    var sendJSON = {};
    if (client.speed_data == ""){
        client.consoleLog("speed data is empty! exit...");
        return;
    }
        
    sendJSON["acc_data"] = client.speed_data;
    sendJSON["com_data"] = client.turns_data;
    sendJSON["tim_data"] = client.time_data;
    sendJSON["lat"]      = client.lat;
    sendJSON["lon"]      = client.lon;
    sendJSON["speed"]    = client.speed;
    sendJSON["values"]   = "" + client.values;
    var send_data = JSON.stringify(sendJSON)
    client.consoleLog(send_data);
    
    var query = client.url + "/get_position";
    var xhr = new XMLHttpRequest();
      
    xhr.open('POST', query , true);
    xhr.onreadystatechange = function () {
        client.consoleLog ("getPosition response: status = " + xhr.status + " state = " + xhr.readyState);   
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            var response = JSON.parse(xhr.responseText);
            var pathValues = "" + response["lat"].toString() + "," + response["lon"].toString() + "|" + client.lat.toString() + "," + client.lon.toString();
            client.consoleLog  ("data: ", pathValues);
            
            gmap.drawSnappedPolyline( parseFloat(response["lat"]),  parseFloat(response["lon"]),
                                      parseFloat(client.lat),       parseFloat(client.lon), "#0000AA");
            
            client.lat          = "" + response["lat"].toString();
            client.lon          = "" + response["lon"].toString();
            client.speed        = "" + response["speed"].toString();
            
            writeToFile("gps.server.output", getDateToStr() + "," + client.lat + "," + client.lon + "," + client.speed );
            
            document.getElementById("geo-latitude").value  = client.lat ;
            document.getElementById("geo-longitude").value = client.lon ;
            document.getElementById("geo-speed").value     = client.speed ;
            
            gmap.runSnapToRoad (pathValues);
            setTimeout(client.getPosition, 2000);
        }
    };
    xhr.setRequestHeader("Content-Type", "application/json");  
    xhr.send(send_data);
    
    client.speed_data   = "";
    client.turns_data   = "";
    client.defects_data = "";
    client.time_data    = "";
    client.values = 0;
};
client.btnPos = function() {
    client.getPosition();
}
// get map of defects near user
// app.route("/get_defect_map/<float:lat>/<float:lon>/<int:zoom>", methods=['GET'])
// Send:   lat, lon, zoom
// Return: list of polylines
client.getRoadMap = function() {
    var xhr = new XMLHttpRequest();
    var query = client.url + "/get_defect_map/" + client.lat + "/" + client.lon+ "/" + client.zoom;
    xhr.open('GET', query, true);
    xhr.onreadystatechange = processRequest;
    function processRequest(e) {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            var response = JSON.parse(xhr.responseText);
            app.consoleLog(xhr.responseText.toString());
        }
    }
    xhr.send();
};
client.btnDefect = function() {
    client.consoleLog("btnDefect is not implemented");
};

// @app.route("/send_collected_data", methods=['PUT'])
// Send: all w/o speed
client.postRoadMapData = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url + "", true);
    xhr.onreadystatechange = processRequest;
    function processRequest(e) {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            var response = JSON.parse(xhr.responseText);
            app.consoleLog(xhr.responseText.toString()) ;
        }
    }
    xhr.send();
};