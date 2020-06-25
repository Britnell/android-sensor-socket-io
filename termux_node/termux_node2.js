/*
*	  This runs the node script to read android IMU sensor stream and sends it 
*   over socket.io when a client connects.
*/


//      *	*    *    *    *    Termux sensor stream    *    *    *    *    *    *    

// * Sensor Data Stream spawn process
var cmd=require('node-cmd');
const {spawn} = require('child_process');
var proc;
var dataStreamOn = false;

// My sony phone

// var MAG = 'AF8133J Magnetometer';
// var ACC = 'LSM6DS3 Accelerometer';
// var GYR = 'LSM6DS3 Gyroscope';

var MAG = 'AK09918 Magnetometer';
var ACC = 'LSM6DSO Accelerometer';
var GYR = 'LSM6DSO Gyroscope';


//       *     *    *    *    Sensor fusion     *    *    *    *    *    *    *    *

const AHRS = require('ahrs');
const madgwick = new AHRS({
  sampleInterval: 50,	// in Hz
  algorithm: 'Madgwick',
  beta: 0.4,	// madgwick - filter noise
  kp: 0.5, 		// mahony filter noise 
  ki: 0, // Default: 0.0
  doInitialisation: false,
});
var lastFrame = Date.now();
const K = 9.81;

var speech = {
	'ison': false
};

var speech_Streaming = false;

function get_speech_stream(){

	cmd.get('termux-speech-to-text',function(err,data,stderr){		

		if(err){
			console.log(' ERRORS : ', err,' STDERR: ' ,stderr, ' data : ', data );
		}
		else if(data.length>1 ){
			data = data.toString();
			console.log(' SPEECH : ', data );
			io.emit('speech', data );
		}
		else{
			console.log(' else : ', data, data.length );
		}
		if(speech_Streaming){
			// console.log(' repeat ');
			// get_speech_stream();
		}

		// speech_stream();
		// Eo cmd
	});

	// EO funct
}	



function end_speech_stream(){
	// if(speech.ison){
	// 	speech.ison = false;
	// 	console.log(' closing speech stream ');
	// 	cmd.get('')
	// }
}

//      *	*    *    *    *    Termux sensor stream    *    *    *    *    *    *    

// running standalone socket.io server
const io = require('socket.io')();
var clients = [];

io.on('connection', client => { 
	console.log("connected to ", client.id );
	clients.push(client.id);

	io.emit('msg', 'hey there new socket');

	// console.log(`starting data streams ...\t `);
	// start_sensor_stream();

	// setTimeout(end_sensor_stream,secs*1000);	//  
	client.on('speech',(data)=>{
		console.log(' speech : ', data );
		if(data=='get'){
			console.log(' getting speech');
			speech_Streaming = true;
			get_speech_stream();
		}
	});

	client.on('disconnect',()=>{
		console.log(" client disconnected. Stopping data stream");
		speech_Streaming = false;
		// end_sensor_stream();
		clients.pop();
	});


	// Eo disconnect
});

io.listen(3000);
console.log(" socket.io listening on port 3000 ");

// var secs = 20;


// ##


// setTimeout(function(){
// 	console.log(" #\n#  KILL\n #");
// 	// proc.kill();
// 	// process.kill(proc.pid);

// 	// turn on again?
	
// 	setTimeout(function(){
// 		console.log("RESTART");
// 		proc=cmd.get(cmdstr);
// 	},5000);
// },5000);