
/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false, acc:false, moment:false */
/*global addClass:false, removeClass:false */

window.gmap = window.gmap || {} ;         // don't clobber existing acc object

// The console.log() messages sprinkled in this file are for instruction and debug.
// If you reuse this code you do not need to include them as part of your own app.
// Set to "true" if you want the console.log messages to appear.

gmap.LOG = true ;
gmap.consoleLog = function() {           // only emits console.log messages if gmap.LOG != false
    "use strict" ;
    if( gmap.LOG ) {
        var args = Array.prototype.slice.call(arguments, 0) ;
        console.log.apply(console, args) ;
    }
} ;

var map;
var lines = [];
var gmarkers = [];
gmarkers.push(new google.maps.LatLng(53.7877, -2.9832));
gmarkers.push(new google.maps.LatLng(53.9007, -2.9832));
var lastlat = -1.0;
var lastlng = -1.0;
var apiKey = 'AIzaSyC1-2TVu6eteqMkV6k8OoGDUI8tARjBq9U';

gmap.addLine = function(lat_current, lng_current, lat_next, lng_next) {
    acc.consoleLog(lat_current);
    var flightPlanCoordinates = [
        {lat: lat_current, lng: lng_current},
        {lat: lat_next,    lng: lng_next}
    ];
    var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    flightPath.setMap (map);
    lines.push(flightPath);
    var newLoc = new google.maps.LatLng(lat_next, lng_next);
    map.setCenter (newLoc);
 }

gmap.removeLine = function(id) {
    prevCenter = lines[id].getPath().getAt(0);
    lines[id].setMap(null);
    lines.splice(id, 1);
    map.setCenter (prevCenter);
 }

gmap.removeAllLines = function () {
    if (lines.lenght == 0)
        return;
    firstCenter = lines[0].getPath().getAt(0);
    map.setCenter (firstCenter);
    lines.forEach(function (element) {
        element.setMap(null);
    });
    lines.splice(0, lines.length);
}

gmap.btnClear = function() {
    gmap.removeAllLines();
}

gmap.initialize = function () {
    "use strict" ;
    gmap.consoleLog( "googleMaps initialization" );
    var myOptions = {
        center: new google.maps.LatLng(56.317168, 44.025813),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: true
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    gmap.consoleLog( "googleMaps initialization done" );
}

// Snap a user-created polyline to roads and draw the snapped path
gmap.runSnapToRoad = function(pathValues) {
    gmap.consoleLog ("runSnapToRoad");
    // Sending a receiving data in JSON format using GET method
    var xhr = new XMLHttpRequest();
    var url = "https://roads.googleapis.com/v1/snapToRoads?key=" + apiKey  +
                                                        "&path=" + pathValues +
                                                        "&interpolate=yes";
    gmap.consoleLog ("url is :" + url);
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () { 
        gmap.consoleLog ("runSnapToRoad onreadystatechange");
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            gmap.consoleLog (response);   
            gmap.processSnapToRoadResponse (response);
        }
        else
        {
            gmap.consoleLog ("runSnapToRoad " + xhr.readyState + " " + xhr.status);   
        }
    }
    xhr.send();
}

// Store snapped polyline returned by the snap-to-road method.
gmap.processSnapToRoadResponse = function(data) {
    gmap.consoleLog ("processSnapToRoadResponse");
    roadCoordinates = "";
    
    for (var i = 0; i < data.snappedPoints.length; i++) {
        var lat = data.snappedPoints[i].location.latitude;
        var lon = data.snappedPoints[i].location.longitude;
        var latlng = new google.maps.LatLng(lat, lon)
        roadCoordinates = roadCoordinates + lat.toString() + ";" + lon.toString() + ";";
        gmap.consoleLog ("snappedCoordinates: " + lat.toString() + ";" + lon.toString());
    }
    gmap.consoleLog ("processSnapToRoadResponse: " + roadCoordinates);
    str = roadCoordinates.split(";");
    gmap.consoleLog ("processSnapToRoadResponse: len(str) = " + str.length);
    for ( var i = 0; i < str.length-4; i += 2 )
    {
        curlat  = str[i];
        curlng  = str[i+1];
        nextlat = str[i+2];
        nextlng = str[i+3]; 
        
        gmap.drawSnappedPolyline( parseFloat(curlat),  parseFloat(curlng),
                                  parseFloat(nextlat), parseFloat(nextlng), "#FF0000" );
    }
    gmap.consoleLog ("processSnapToRoadResponse: done!");
}

// Draws the snapped polyline (after processing snap-to-road response).
gmap.drawSnappedPolyline = function(curlat,curlng,nextlat,nextlng, line_color) {
    var startpoint = new google.maps.LatLng(curlat,curlng);
    var lastpoint  = new google.maps.LatLng(nextlat,nextlng);
    map.setCenter (startpoint);
    var line = new google.maps.Polyline({
        path: [ startpoint, lastpoint ],
        strokeColor: line_color.toString(),
        strokeOpacity: 1.0,
        strokeWeight: 10,
        map: map
    });
    lines.push(line);
 }