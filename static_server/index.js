
//    *    *    *    Server    *    *    *
const app = require('express')(); 
const express = require('express'); 
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = 3000;
server.listen(port, () =>  {
  	console.log(`Server is runnign port ${port} `);		});
app.get('/', (req,res) => {
  	res.sendFile(__dirname +'/static/index.html');		});
app.use(express.static('static'));


//    *    *    *    Sensor fusion     *    *    *
const AHRS = require('ahrs');
const madgwick = new AHRS({
  sampleInterval: 50,	// in Hz
  algorithm: 'Madgwick',
  beta: 0.4,	// madgwick - filter noise
  kp: 0.5, 		// mahony filter noise 
  ki: 0, // Default: 0.0
  doInitialisation: false,
});

//    *    *    *    Socket . io     *    *    *

io.on('connection', client => { 
	console.log(" New connection! ", client.id );
	
	console.log(" sending start signal ");
	io.emit('start');

	// setTimeout(function(){
	// 	console.log("sending stop !");
	// 	io.emit('stop');
	// 	setTimeout(function(){
	// 		console.log(" sending start! ");
	// 		io.emit('start');
	// 	},10000);
	// },10000);

	client.on('msg',data=>{
		console.log(" msg : ", data);
	});

	var g,a,m;
	var lastFrame =0;
	var K = 9.81;

	client.on('data',data=>{
		var MAG = 'AF8133J Magnetometer';
        var ACC = 'LSM6DS3 Accelerometer';
        var GYR = 'LSM6DS3 Gyroscope';
        var json;
		try {
			if(data.length>3){
				json = JSON.parse(data);
			}
		}
		catch(e){
			console.log("\t data-err:\t" );	
		}
		if(json){
			// console.log(json);
			// if(json.hasOwnProperty(GYR))
			if(json[GYR])			g = json[GYR].values;
			if(json[ACC])			a = json[ACC].values;
			if(json[MAG])			m = json[MAG].values;
			
			if(g && a ){
				let t = Date.now();
				if(m){
					madgwick.update( g[0],g[1],g[2], a[0]/K,a[1]/K,a[2]/K, m[0],m[1],m[2], (t-lastFrame)/1000 );
					io.emit('sensor', [a,g,m] );
				}
				else{
					madgwick.update( g[0],g[1],g[2], a[0]/K,a[1]/K,a[2]/K, (t-lastFrame)/1000 );
					io.emit('sensor', [a,g,m] );
				}
				io.emit('euler',madgwick.getEulerAngles());
				a=false;	g=false;	m=false;		lastFrame = t;
			}
		}
		
	});

	client.on('disconnect',()=>{
		console.log(" client disconnected. ");
	});

	
	
	// Eo io
});

// var begin = Date.now();
// function beep(){
// 	console.log( Math.floor((Date.now()-begin)/1000) );
// 	setTimeout(beep,1000);
// }
// beep();

// var socketPort = 6060;
// io.listen(socketPort);
// console.log(" Node server listening on : IP:"+socketPort);
