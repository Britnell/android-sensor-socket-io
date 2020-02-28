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

function start_sensor_stream(){
	if(!dataStreamOn){
		dataStreamOn = true;
		console.log("NEW STREAM");

		proc = spawn( 'termux-sensor',['-s','accel,gyro,magn','-d','20'] );

		proc.stdout.on('data',function(data){
			if(clients.length>0){
				data = data.toString();
				// console.log("data",data);

				let json;
				try {
					if(data.length>3){
						json = JSON.parse(data);
					}
				}
				catch(e){
					// console.log("\t reading data to json error " );	
				}
				if(json){
					console.log("json",json);
					// 
					// io.emit('data',json);	// is only printed in brwoser
					let g,a,m;
					if(json[GYR])		g = json[GYR].values;
					if(json[ACC])		a = json[ACC].values;
					if(json[MAG])		m = json[MAG].values;
					// console.log('sensors : ', g,a,m);

					io.emit('sensor',[a,g,m]);	// IMU data
					if(g && a && m){
						let t = Date.now();
						madgwick.update( g[0],g[1],g[2], a[0]/K,a[1]/K,a[2]/K, m[0],m[1],m[2], (t-lastFrame)/1000 );
						io.emit('euler',madgwick.getEulerAngles());
						lastFrame = t;
					}
				}
			}
			else{
				// console.log(data.toString() );
			}
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

//      *	*    *    *    *    Termux sensor stream    *    *    *    *    *    *    

// running standalone socket.io server
const io = require('socket.io')();
var clients = [];

io.on('connection', client => { 
	console.log("connected to ", client.id );
	clients.push(client.id);
	io.emit('msg', 'hey there new socket');

	console.log(`starting sensor stream ...\t `);
	start_sensor_stream();
	// setTimeout(end_sensor_stream,secs*1000);	//  

	client.on('disconnect',()=>{
		console.log(" client disconnected. Stopping data stream");
		end_sensor_stream();
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