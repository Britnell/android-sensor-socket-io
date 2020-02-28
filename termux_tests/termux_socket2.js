/*
*	    
*/


//      *	*    *    *    *    Termux sensor stream    *    *    *    *    *    *    

// * Sensor Data Stream spawn process

const {spawn} = require('child_process');
var cmd=require('node-cmd');

var repeating;
var proc;

function start_sensor_stream(){
	console.log("NEW STREAM");
	var frame=0;
	var frames = 100;
	repeating = true;
	proc = spawn( 'termux-sensor',['-s','accel,gyro,magn','-d','20'] );

	proc.stdout.on('data',function(data){
		// console.log(data.toString() );
		if(socket)
			socket.emit('data',data.toString());
		});
	proc.stderr.on('data',function(data){
		console.log(" ERROR : ", data );
		});
	proc.on('error',function(err){
		console.log(" err : ", err );
		});

	// Eo funct
}

function end_sensor_stream(){
	console.log(" closing sensor stream ");
	cmd.get('termux-sensor -c ',function(data){		});
	if(proc) proc.kill();//setTimeout(function(){	},100);
}



// 		*    *    *    *	*	Socket io-client *    *    *    *    *    *    *    


var cmd=require('node-cmd');
var serverAddr = 'http://192.168.178.22:3000';
var socket = require('socket.io-client')(serverAddr);
var dataStreamOn;

console.log(" trying to connect to socket... ");	//, serverAddr);

socket.on('connect', function(){
	console.log("socket connected!");
	socket.emit('msg','hey server, its Termux');
	// console.log("starting stream on connection");
	// start_sensor_stream();
});

socket.on('disconnect', function(){
	console.log(" ! socket dis-connected ! ");
	console.log("\n stopping proc");
	if(dataStreamOn){
		dataStreamOn = false;
		end_sensor_stream();
	}
});

socket.on('start',function(){
	console.log(" (Re-) START sensor data");
	if(!dataStreamOn){
		dataStreamOn = true;
		start_sensor_stream();
	}
});

socket.on('stop',function(){
	console.log(" STOP sensor data ");
	if(dataStreamOn){
		dataStreamOn = false;
		end_sensor_stream();
	}
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