/*
*	    
*/

var cmd=require('node-cmd');

//      *	*    *    *    *    Termux sensor stream    *    *    *    *    *    *    

// * Sensor Data Stream spawn process

const {spawn} = require('child_process');
var proc;
var dataStreamOn = false;

function start_sensor_stream(){
	if(!dataStreamOn){
		dataStreamOn = true;
		console.log("NEW STREAM");

		proc = spawn( 'termux-sensor',['-s','accel,gyro,magn','-d','20'] );

		proc.stdout.on('data',function(data){
			console.log(data.toString() );
			});
		proc.stderr.on('data',function(data){
			console.log(" ERROR : ", data );
			});
		proc.on('error',function(err){
			console.log(" err : ", err );
			});
	}
	// Eo funct
}

function end_sensor_stream(){
	if(dataStreamOn){
		dataStreamOn = false;
		console.log(" closing sensor stream ");
		cmd.get('termux-sensor -c ',function(data){		});
		if(proc) proc.kill();//setTimeout(function(){	},100);
	}
}




var secs = 20;
console.log(`starting sensor stream ...\t stopping after ${secs} seconds.`);

start_sensor_stream();

setTimeout(end_sensor_stream,secs*1000);	//  

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