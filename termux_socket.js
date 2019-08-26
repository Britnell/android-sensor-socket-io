/*
*	    v1 - repeats segments of X frames, but heavy delay on restarting cmd and some outsyncing and freezing
*/

//      *	*    *    *    *    Termux sensor stream    *    *    *    *    *    *    

// * Sensor Data Stream spawn process
const {spawn} = require('child_process');
var repeating;

function start_sensor_stream(){
	console.log("NEW STREAM");
	var frame=0;
	var frames = 100;
	repeating = true;
	var proc = spawn( 'termux-sensor',['-s','accel','-n',frames.toString(),'-d','5'] );
	proc.stdout.on('data',function(data){
		// let t=Date.now();
		// console.log(frame, data.toString() );
		frame++;
		if(socket)
			socket.emit('data',frame.toString()+data.toString());
		if(frame==frames){
			console.log(` FRAME ${frames} `);
			if(repeating){
				// start_sensor_stream();
				setTimeout(start_sensor_stream,10);
			}
		}
	});
	// Eo funct
}


// 		*    *    *    *	*	Socket io-client *    *    *    *    *    *    *    

var cmd=require('node-cmd');
var serverAddr = 'http://192.168.178.22:3000';
var socket = require('socket.io-client')(serverAddr);

console.log(" connecting to socket... ");	//, serverAddr);

socket.on('connect', function(){
	console.log("socket connected!");
	socket.emit('msg','hey server, its Termux');
	console.log("starting stream on connection");
	start_sensor_stream();
});

socket.on('disconnect', function(){
	console.log(" ! socket dis-connected !");
});

socket.on('stop',function(){
	console.log(" STOP CMD ");
	repeating = false;
});


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