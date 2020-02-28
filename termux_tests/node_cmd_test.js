/*
*
*/
var cmd=require('node-cmd');

console.log("==> An-Node\n\n");

function get(command){
	cmd.get(command,function(err, data, stderr){
        console.log(' $ '+command+' :\n',data);
    });
}

function set(command){
	console.log(' $ set : '+command+'\n');
	cmd.run(command);
}

// get('ls');

// get('termux-battery-status');
// set('termux-brightness 128');
// set('termux-volume ');	 // stream : alarm, music, notification, ring, system, call. 
// set('termux-vibrate');

// MEDIA PLAYER
// get('termux-media-player'); // info, play, play FILE, pause, stop

// Notifictaiton
set('termux-notification --title TERMUX --content "Hello Notification world" ');

// TTS
set('termux-tts-speak   ');

// get('termux-camera-info');	// Very long output...
// set('termux-camera-photo -c 1 test.jpg ');

// get('termux-location');

// MIC
// get('termux-microphone-record')

// get('termux-clipboard-set CLIPPERZ');
// get('termux-clipboard-get');

// get('termux-contact-list');

// get('termux-infrared-frequencies');
// set('termux-torch on');
// set('termux-torch off');

//		 Sensors

// get('termux-sensor -l');	// list

// get('termux-sensor -s accel -n 3 ');
// get('termux-sensor -s gyro -n 3 ');


// set('termux-infrared-transmit');


// # Error

// # !! get('termux-call-log'); - Call log is no longer permitted by google

// * EoF