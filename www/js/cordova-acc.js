/*
 * Copyright (c) 2013-2015, Paul Fischer, Intel Corporation. All rights reserved.
 * Please see included README.md file for license terms and conditions.
 */


/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false, acc:false, moment:false */
/*global addClass:false, removeClass:false */


window.acc = window.acc || {} ;         // don't clobber existing acc object

// The console.log() messages sprinkled in this file are for instruction and debug.
// If you reuse this code you do not need to include them as part of your own app.
// Set to "true" if you want the console.log messages to appear.
var timer = 0;

acc.LOG = true ;
acc.consoleLog = function() {           // only emits console.log messages if acc.LOG != false
    "use strict" ;
    if( acc.LOG ) {
        var args = Array.prototype.slice.call(arguments, 0) ;
        console.log.apply(console, args) ;
    }
} ;



// TODO: add use of browser DeviceMotionEvent and DeviceOrientationEvent
// see: http://www.html5rocks.com/en/tutorials/device/orientation/

acc.watchIdAccel = null ;               // holds the accelerometer "watch ID" handle

function accelFunction() {
"use strict" ;
    var fName = "acc.btnAccel():" ;
    acc.consoleLog(fName, "entry") ;

    function onSuccess(acceleration) {
        
        var accelMatrix    = math.matrix([ acceleration.x, 
                                           acceleration.y, 
                                           acceleration.z ]);            

        var newAccelMatrix =  math.round(math.multiply(app.rotateMatrix, accelMatrix), 2);   
        
        document.getElementById('acceleration').value = newAccelMatrix.toString(2);
        
        write("accelerometer.output", getDateToStr() + "," +
                                            math.subset(newAccelMatrix, math.index(0)) + "," +
                                            math.subset(newAccelMatrix, math.index(1)) + "," +
                                            math.subset(newAccelMatrix, math.index(2)));
        
        //sendPostRequest(math.subset(newAccelMatrix, math.index(0)), math.subset(newAccelMatrix, math.index(1),math.subset(newAccelMatrix, math.index(2))));
    }

    function onFail() {
        acc.consoleLog(fName, "Failed to get acceleration data.") ;
    }


    if( acc.watchIdAccel === null ) {
        try {                               // watch and update accelerometer values every 25 msecs
            acc.watchIdAccel = navigator.accelerometer.watchAcceleration(onSuccess, onFail, {frequency:25}) ;
            addClass("cl_btnOn", document.getElementById("id_btnAccel")) ;
            acc.consoleLog(fName, "btnAccel enabled.") ;
        }
        catch(e) {
            acc.consoleLog(fName, "try failed - device API not present?", e) ;
        }
    }
    else {
        navigator.accelerometer.clearWatch(acc.watchIdAccel) ;
        acc.watchIdAccel = null ;
        removeClass("cl_btnOn", document.getElementById("id_btnAccel")) ;
        acc.consoleLog(fName, "btnAccel disabled.") ;
    }

    acc.consoleLog(fName, "exit") ;
} 

acc.initAccel = function() {
    "use strict" ;
    var fName = "acc.initAccel():" ;
    acc.consoleLog(fName, "entry") ;

    try {
        navigator.accelerometer.clearWatch(acc.watchIdAccel) ;
        acc.consoleLog(fName, "try succeeded.") ;
    }
    catch(e) {
        acc.consoleLog(fName, "try failed:", e) ;
    }
    acc.consoleLog(fName, "exit") ;
    accelFunction();
} ;


function getDataFromServer() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "http://localhost:5000/todo/api/v1.0/tasks", true);
    xhr.setRequestHeader
    xhr.send();
    xhr.onreadystatechange = processRequest;
    function processRequest(e) {
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            var response = JSON.parse(xhr.responseText);
            app.consoleLog(xhr.responseText.toString()) ;
        }
    }  
}
// the following "watches" updates to accelerometer values continuously
// until the accel button is pushed a second time, which stops the "watch"

acc.btnAccel = function() {
    "use strict" ;
    var fName = "acc.btnAccel():" ;
    acc.consoleLog(fName, "entry") ;

    function onSuccess(acceleration) {
        
        var accelMatrix    = math.matrix([ acceleration.x, 
                                           acceleration.y, 
                                           acceleration.z ]);            

        var newAccelMatrix =  math.round(math.multiply(app.rotateMatrix, accelMatrix), 2);   
        
        document.getElementById('acceleration').value = newAccelMatrix.toString(2);
        
        //write("accelerometer.output", getDateToStr() + "," +
       //                                    math.subset(newAccelMatrix, math.index(0)) + "," +
       //                                     math.subset(newAccelMatrix, math.index(1)) + "," +
          //                                  math.subset(newAccelMatrix, math.index(2)));
        
        //sendPostRequest(math.subset(newAccelMatrix, math.index(0)), math.subset(newAccelMatrix, math.index(1),math.subset(newAccelMatrix, math.index(2))));
    }

    function onFail() {
        acc.consoleLog(fName, "Failed to get acceleration data.") ;
    }


    if( acc.watchIdAccel === null ) {
        try {                               // watch and update accelerometer values every 25 msecs
            acc.watchIdAccel = navigator.accelerometer.watchAcceleration(onSuccess, onFail, {frequency:25}) ;
            addClass("cl_btnOn", document.getElementById("id_btnAccel")) ;
            acc.consoleLog(fName, "btnAccel enabled.") ;
        }
        catch(e) {
            acc.consoleLog(fName, "try failed - device API not present?", e) ;
        }
    }
    else {
        navigator.accelerometer.clearWatch(acc.watchIdAccel) ;
        acc.watchIdAccel = null ;
        removeClass("cl_btnOn", document.getElementById("id_btnAccel")) ;
        acc.consoleLog(fName, "btnAccel disabled.") ;
    }

    acc.consoleLog(fName, "exit") ;
} ;




acc.watchIdCompass = null ;                 // holds the compass "watch ID" handle

function compassFunction() {
    "use strict" ;
    var fName = "acc.btnCompass():" ;
    acc.consoleLog(fName, "entry") ;
    function onSuccess(heading) {
        var value = heading.magneticHeading.toFixed(6);
        document.getElementById('compass-dir').value = value ;
        write("compass.output", getDateToStr() + "," + value);
    }

    function onFail(compassError) {
        acc.consoleLog(fName, "Compass error: " + compassError.code) ;
    }

    if( acc.watchIdCompass === null ) {
        try {                               // watch and update compass value every 25 msecs
            acc.watchIdCompass = navigator.compass.watchHeading(onSuccess, onFail, {frequency:25}) ;
            addClass("cl_btnOn", document.getElementById("id_btnCompass")) ;
            acc.consoleLog(fName, "btnCompass enabled.") ;
        }
        catch(e) {
            acc.consoleLog(fName, "try failed - device API not present?", e) ;
        }
    }
    else {
        navigator.compass.clearWatch(acc.watchIdCompass) ;
        acc.watchIdCompass = null ;
        removeClass("cl_btnOn", document.getElementById("id_btnCompass")) ;
        acc.consoleLog(fName, "btnCompass disabled.") ;
    }

    acc.consoleLog(fName, "exit") ;
}

acc.initCompass = function() {
    "use strict" ;
    var fName = "acc.initCompass():" ;
    acc.consoleLog(fName, "entry") ;

    try {
        navigator.compass.clearWatch(acc.watchIdCompass) ;
        acc.consoleLog(fName, "try succeeded.") ;
    }
    catch(e) {
        acc.consoleLog(fName, "try failed:", e) ;
    }
    acc.consoleLog(fName, "exit") ;
    compassFunction();
} ;


// the following "watches" updates to the compass continuously
// until the compass button is pushed a second time, which stops the "watch"

acc.btnCompass = function() {
    //timer = setInterval(sendPostRequest(), 2000);
    "use strict" ;
    var fName = "acc.btnCompass():" ;
    acc.consoleLog(fName, "entry") ;
    function onSuccess(heading) {
        var value = heading.magneticHeading.toFixed(6);
        document.getElementById('compass-dir').value = value ;
        write("compass.output", getDateToStr() + "," + value);
    }

    function onFail(compassError) {
        acc.consoleLog(fName, "Compass error: " + compassError.code) ;
    }

    if( acc.watchIdCompass === null ) {
        try {                               // watch and update compass value every 25 msecs
            acc.watchIdCompass = navigator.compass.watchHeading(onSuccess, onFail, {frequency:25}) ;
            addClass("cl_btnOn", document.getElementById("id_btnCompass")) ;
            acc.consoleLog(fName, "btnCompass enabled.") ;
        }
        catch(e) {
            acc.consoleLog(fName, "try failed - device API not present?", e) ;
        }
    }
    else {
        navigator.compass.clearWatch(acc.watchIdCompass) ;
        acc.watchIdCompass = null ;
        removeClass("cl_btnOn", document.getElementById("id_btnCompass")) ;
        acc.consoleLog(fName, "btnCompass disabled.") ;
    }

    acc.consoleLog(fName, "exit") ;
} ;

var speed = "0";
var x_coordinate = "";
var y_coordinate = "";
function sendPostRequest() {
    var user_list = new XMLHttpRequest();
    var url_user  = "http://server-dkdbproject.rhcloud.com/todo/api/v1.0/tasks";
    var sendText = bufferForServer+bufferForGPS + "last_speed;"+ speed+'"}';//"],\n" + bufferForGPS + "],\n" + 'last_speed [\n' + speed + ']\n}';
    //var params = 0;
    //var sendText = '{"title":"Read a book"}';//'{"' + accx + '","' + accy + '","' + accz + '"}';
    // The "true" flag means it is an asynchronous request
    user_list.open("POST", url_user);
    app.consoleLog(sendText) ;
     //Call a function when the state changes.
    user_list.onreadystatechange = function () 
    {
        if (user_list.readyState == 4 && math.abs(user_list.status - 200) < 10 ) {            
            //JSON.parse(http.responseText)[0].dev_id;   
            //app.consoleLog("suc", user_list.status);
            //app.consoleLog("sucState", user_list.readyState);
            var response = JSON.parse(user_list.responseText);
            app.consoleLog(user_list.responseText.toString()) ;
            var temp = user_list.responseText.toString().split(";");
            var str = temp[1].split(",");
            x_coordinate = str[0];
            y_coordinate = str[1];
            str = speed = temp[3].split('"');
            speed = str[0];
            bufferForGPS = 'last_coordinates;'+ x_coordinate + "," + y_coordinate + ";";
        }
        else 
        {
            app.consoleLog("Error " + user_list.status + " State " + user_list.readyState);
            //user_list.readyState
            //app.consoleLog(user_list.responseText.toString()) ;
        }
    }   
    // Send the proper header information
    user_list.setRequestHeader("Content-Type", "application/json");
    user_list.setRequestHeader("Content-length", sendText.length); 
    user_list.send(sendText);
    //app.consoleLog(bufferForServer) ;
    bufferForServer = '{"title":"time,accx,accy,accz,compass;';
}