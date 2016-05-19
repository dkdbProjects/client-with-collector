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
} ;


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
        
        write("accelerometer.output", getDateToStr() + "," +
                                            math.subset(newAccelMatrix, math.index(0)) + "," +
                                            math.subset(newAccelMatrix, math.index(1)) + "," +
                                            math.subset(newAccelMatrix, math.index(2)));
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
} ;


// the following "watches" updates to the compass continuously
// until the compass button is pushed a second time, which stops the "watch"

acc.btnCompass = function() {
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
