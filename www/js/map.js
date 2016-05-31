
/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false, acc:false, moment:false */
/*global addClass:false, removeClass:false */


window.map = window.map || {} ;         // don't clobber existing acc object


// The console.log() messages sprinkled in this file are for instruction and debug.
// If you reuse this code you do not need to include them as part of your own app.
// Set to "true" if you want the console.log messages to appear.

map.LOG = true ;
map.consoleLog = function() {           // only emits console.log messages if acc.LOG != false
    "use strict" ;
    if( map.LOG ) {
        var args = Array.prototype.slice.call(arguments, 0) ;
        console.log.apply(console, args) ;
    }
} ;



// TODO: add use of browser DeviceMotionEvent and DeviceOrientationEvent
// see: http://www.html5rocks.com/en/tutorials/device/orientation/


var _map;
var lines = [];
var apiKey = 'AIzaSyDNX1QruTMvRbJfLNlRySFfq5wp-JtAcsY';

map.addLine = function(lat_current, lng_current, lat_next, lng_next) {
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
    flightPath.setMap(_map);
    lines.push(flightPath);
    var newLoc = new google.maps.LatLng(lat_next, lng_next);
    _map.setCenter(newLoc);
 }

map.removeLine = function(id) {
    prevCenter = lines[id].getPath().getAt(0);
    lines[id].setMap(null);
    lines.splice(id, 1);
    _map.setCenter(prevCenter);
 }

map.removeAllLines = function () {
    firstCenter = lines[0].getPath().getAt(0);
    _map.setCenter(firstCenter);
    lines.forEach(function (element) {
        element.setMap(null);
    });
    lines.splice(0, lines.length);
}

map.initialize = function () {
    map.consoleLog("googleMaps initialization");
    var myOptions = {
        center: new google.maps.LatLng(56.317168, 44.025813),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        panControl: true
    };
    _map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    map.consoleLog("googleMaps initialization done");
    //runSnapToRoad(123456);
}
var gmarkers = [];
gmarkers.push(new google.maps.LatLng(53.7877, -2.9832));
gmarkers.push(new google.maps.LatLng(53.9007, -2.9832));

// Snap a user-created polyline to roads and draw the snapped path
map.runSnapToRoad = function(pathValues) {
    jQuery.get('https://roads.googleapis.com/v1/snapToRoads', {
    interpolate: true,
    key: apiKey,
    path: pathValues
  }, function(data) {
    map.processSnapToRoadResponse(data);
  }); 
}

var lastlat = -1.0;
var lastlng = -1.0;
// Store snapped polyline returned by the snap-to-road method.
// Store snapped polyline returned by the snap-to-road method.
map.processSnapToRoadResponse = function(data) {
   roadCoordinates = "";
  for (var i = 0; i < data.snappedPoints.length; i++) {
    var latlng = new google.maps.LatLng(
        data.snappedPoints[i].location.latitude,
        data.snappedPoints[i].location.longitude);
      roadCoordinates = roadCoordinates + data.snappedPoints[i].location.latitude.toString() + ";" + data.snappedPoints[i].location.longitude.toString() + ";";
    //snappedCoordinates = 
      //map.consoleLog(snappedCoordinates);
    //placeIdArray.push(data.snappedPoints[i].placeId);
  }
    str = roadCoordinates.split(";");
        for(var i = 0; i<str.length-5;i+=2)
        {
            curlat = str[i];
            curlng = str[i+1];
            nextlat = str[i+2];
            nextlng = str[i+3]; map.drawSnappedPolyline(parseFloat(curlat),parseFloat(curlng),parseFloat(nextlat),parseFloat(nextlng));
            
        
    }
    map.consoleLog(roadCoordinates);
}
var polylines = [];
// Draws the snapped polyline (after processing snap-to-road response).
map.drawSnappedPolyline = function(curlat,curlng,nextlat,nextlng) {
    startpoint = new google.maps.LatLng(curlat,curlng);
    lastpoint = new google.maps.LatLng(nextlat,nextlng);
    map.consoleLog(startpoint);
    var center = new google.maps.LatLng(curlat,curlng);
    _map.setCenter(center);
    var line = new google.maps.Polyline({
        path: [
            new google.maps.LatLng(curlat,curlng), 
            new google.maps.LatLng(nextlat,nextlng)
        ],
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 10,
        map: _map
    });

 }